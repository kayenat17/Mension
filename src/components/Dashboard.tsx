"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Sparkles } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/utils/supabaseClient";
import { calculateCycleState } from "@/utils/cycleHelpers";
import { getItem, setItem, KEYS } from "@/utils/storageHelper";
import { useMension } from "@/context/MensionContext";
import type { SavedAnalysis, CycleData, CycleLog } from "./dashboard/types";
import CycleTracker from "./dashboard/CycleTracker";
import MessageAnalyzer from "./dashboard/MessageAnalyzer";
import PatternMemory from "./dashboard/PatternMemory";
import ReflectionHistory from "./dashboard/ReflectionHistory";
import AnalysisReviewModal from "./dashboard/AnalysisReviewModal";
import SafeExitGuide from "./dashboard/SafeExitGuide";

interface DashboardProps {
  setActiveTab: (tab: string) => void;
}

export default function Dashboard({ setActiveTab }: DashboardProps) {
  const { session, isAuthenticated, openAuth } = useMension();
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const analysesRef = useRef<SavedAnalysis[]>([]);
  const [viewingAnalysis, setViewingAnalysis] = useState<SavedAnalysis | null>(null);
  const [showExitGuide, setShowExitGuide] = useState(false);

  // Cycle tracker state (managed here for cross-component sharing)
  const [cycleData, setCycleData] = useState<CycleData | null>(null);
  const [cycleLogs, setCycleLogs] = useState<CycleLog[]>([]);
  const [cycleIrregularity, setCycleIrregularity] = useState<string | null>(null);

  // Compute cycle phase for passing to MessageAnalyzer
  const cyclePhaseInfo = useMemo(() => {
    if (!cycleData) return null;
    const cs = calculateCycleState(cycleData.lmp, cycleData.cycleLength, cycleData.periodDuration);
    const phaseNames: Record<string, string> = {
      menstrual: "Menstrual Phase", follicular: "Follicular Phase",
      ovulation: "Ovulation Phase", luteal: "Luteal Phase"
    };
    return { phase: cs.phase, day: cs.currentDay, name: phaseNames[cs.phase] || cs.phase };
  }, [cycleData]);

  // Load saved analyses from Supabase or localStorage
  const loadAnalyses = async () => {
    if (session && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from("analyses").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        if (data) {
          setSavedAnalyses(data.map((d: any) => ({
            id: d.id, message: d.message, phase: d.phase,
            result: d.result, timestamp: d.created_at, sender_label: d.sender_label,
          })));
        }
      } catch (err) {
        console.error("Supabase fetch error, falling back to local:", err);
        loadLocalAnalyses();
      }
    } else {
      loadLocalAnalyses();
    }
  };

  const loadLocalAnalyses = () => {
    const saved = getItem(KEYS.SAVED_ANALYSES);
    if (saved) setSavedAnalyses(JSON.parse(saved));
    else setSavedAnalyses([]);
  };

  // Load cycle logs from Supabase
  const loadCycleLogs = async () => {
    if (!session || !isSupabaseConfigured()) return;
    try {
      const { data, error } = await supabase.from('cycle_logs').select('*').order('start_date', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        setCycleLogs(data);
        let avgLength = 28;
        let irregularCheck: string | null = null;
        if (data.length >= 2) {
          let totalDays = 0, daysList: number[] = [];
          for (let i = 0; i < data.length - 1; i++) {
            const d1 = new Date(data[i].start_date), d2 = new Date(data[i + 1].start_date);
            const diff = Math.round((d1.getTime() - d2.getTime()) / (1000 * 3600 * 24));
            totalDays += diff; daysList.push(diff);
          }
          avgLength = Math.round(totalDays / (data.length - 1));
          const maxC = Math.max(...daysList), minC = Math.min(...daysList);
          if (avgLength > 38 || maxC >= 40) irregularCheck = "long_cycles";
          else if (avgLength < 21 || minC <= 20) irregularCheck = "short_cycles";
          else if (maxC - minC > 10) irregularCheck = "highly_variable";
        }
        setCycleIrregularity(irregularCheck);
        avgLength = Math.max(21, Math.min(35, avgLength));
        setCycleData({ lmp: data[0].start_date, cycleLength: avgLength, periodDuration: 5 });
      } else {
        // Try localStorage fallback
        const saved = getItem(KEYS.CYCLE_TRACKER);
        if (saved) {
          try { setCycleData(JSON.parse(saved)); } catch {}
        }
        setCycleLogs([]); setCycleIrregularity(null);
      }
    } catch (err) {
      console.warn("Could not load cycle logs:", err);
      // Fallback to localStorage
      const saved = getItem(KEYS.CYCLE_TRACKER);
      if (saved) { try { setCycleData(JSON.parse(saved)); } catch {} }
    }
  };

  useEffect(() => {
    if (session) loadCycleLogs();
    else {
      const saved = getItem(KEYS.CYCLE_TRACKER);
      if (saved) { try { setCycleData(JSON.parse(saved)); } catch {} }
      setCycleLogs([]);
    }
    loadAnalyses();
  }, [session]);

  useEffect(() => { analysesRef.current = savedAnalyses; }, [savedAnalyses]);

  // Handlers for saving/deleting analyses (shared)
  const saveLocally = (newSave: SavedAnalysis) => {
    const updated = [newSave, ...analysesRef.current];
    analysesRef.current = updated;
    setSavedAnalyses(updated);
    setItem(KEYS.SAVED_ANALYSES, JSON.stringify(updated));
  };

  const handleSaveAnalysis = (analysis: { message: string; phase: string; result: string; sender_label: string }) => {
    const newSave: SavedAnalysis = {
      id: Math.random().toString(36).substring(2, 9),
      message: analysis.message,
      phase: analysis.phase,
      result: analysis.result,
      timestamp: new Date().toISOString(),
      sender_label: analysis.sender_label,
    };

    if (session && isSupabaseConfigured()) {
      supabase.from("analyses").insert({
        user_id: session.user.id, message: analysis.message,
        phase: analysis.phase, sender_label: analysis.sender_label, result: analysis.result,
      }).then(({ error }) => {
        if (error) { console.error("Supabase insert error, saving locally:", error); saveLocally(newSave); }
        else loadAnalyses();
      });
    } else {
      saveLocally(newSave);
    }
  };

  const deleteLocally = (id: string | number) => {
    const updated = analysesRef.current.filter(a => a.id !== id);
    analysesRef.current = updated;
    setSavedAnalyses(updated);
    setItem(KEYS.SAVED_ANALYSES, JSON.stringify(updated));
  };

  const handleDeleteAnalysis = (id: string | number) => {
    if (session && isSupabaseConfigured() && typeof id === "number") {
      supabase.from("analyses").delete().eq("id", id).then(({ error }) => {
        if (error) { console.error("Error deleting from Supabase, removing locally:", error); deleteLocally(id); }
        else loadAnalyses();
      });
    } else {
      deleteLocally(id);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 max-w-5xl mx-auto w-full space-y-8 animate-slide-up">

      {/* Hero Section */}
      <section className="bg-lavender/35 border border-lavender/60 rounded-3xl p-6 md:p-8 text-center space-y-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-butter via-lavender to-butter-dark"></div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-900 uppercase tracking-wider border border-indigo-100">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
          <span>Mension Journal</span>
        </div>
        <h1 className="font-dm-sans font-black text-3xl md:text-5xl text-gray-900 tracking-tight leading-none mb-4">
          Understand what&apos;s really happening — in your messages and your body.
        </h1>
        <p className="text-sm text-gray-500 max-w-xl mx-auto leading-relaxed font-medium">
          Paste a message that left you confused, anxious, or gaslit. Mension automatically aligns with your body&apos;s current menstruation cycle phase to identify patterns of behavior with warm empathetic clarity.
        </p>
      </section>

      {/* Auth Banner */}
      {!session && (
        <section className="glass-panel-yellow rounded-3xl p-5 border-butter flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-white flex items-center justify-center border border-butter-dark shadow-sm"><span>🔒</span></div>
            <div>
              <h4 className="text-xs font-bold text-charcoal">Sync & Remember Patterns</h4>
              <p className="text-[11px] text-warm-gray font-medium">Sign in to save your logs securely and unlock cross-message pattern memory.</p>
            </div>
          </div>
          <button onClick={openAuth}
            className="px-4 py-2 bg-white hover:bg-lavender-light border border-lavender-dark/45 text-charcoal text-xs font-bold rounded-2xl transition-all-300 shrink-0 hover:scale-102">
            Create Free Account
          </button>
        </section>
      )}

      {/* Irregularity card */}
      {cycleIrregularity && (
        <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-3xl space-y-2 animate-fade-in shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Health Insight</span>
          </div>
          <p className="text-xs text-charcoal leading-relaxed font-medium">
            {cycleIrregularity === "long_cycles" && "I noticed your cycles are consistently longer than usual. This can happen due to stress, PCOS, or thyroid changes."}
            {cycleIrregularity === "short_cycles" && "I noticed your cycles are coming very quickly (under 21 days). This can sometimes cause fatigue or low iron."}
            {cycleIrregularity === "highly_variable" && "I noticed your cycle lengths are quite unpredictable. Stress or lifestyle shifts can do this."}
          </p>
          <button onClick={() => setActiveTab("chat")}
            className="w-full mt-2 bg-white hover:bg-amber-100 text-amber-700 text-xs font-bold py-2 rounded-xl border border-amber-200 transition-all shadow-sm cursor-pointer">
            Discuss my cycle health with Ova
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Column */}
        <div className="lg:col-span-7 space-y-6">
          <CycleTracker
            session={session}
            cycleData={cycleData}
            cycleLogs={cycleLogs}
            onCycleDataChange={setCycleData}
            onCycleLogsChange={setCycleLogs}
            onStartChat={() => setActiveTab("chat")}
            onLoginClick={openAuth}
          />

          {cyclePhaseInfo && (
            <MessageAnalyzer
              cyclePhase={cyclePhaseInfo.phase}
              cycleDay={cyclePhaseInfo.day}
              cyclePhaseName={cyclePhaseInfo.name}
              session={session}
              onSave={handleSaveAnalysis}
              onToxicDetected={() => setShowExitGuide(true)}
            />
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 space-y-6">
          <PatternMemory savedAnalyses={savedAnalyses} session={session} />
          <ReflectionHistory analyses={savedAnalyses} onDelete={handleDeleteAnalysis} onView={setViewingAnalysis} />
        </div>
      </div>

      {/* Modals */}
      <AnalysisReviewModal analysis={viewingAnalysis} onClose={() => setViewingAnalysis(null)} />
      <SafeExitGuide isOpen={showExitGuide} onClose={() => setShowExitGuide(false)} />
    </div>
  );
}
