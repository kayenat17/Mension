"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Flower, Activity, ShieldCheck, FileText, Trash2, ArrowRight, UserCheck, AlertCircle, RefreshCw, Eye, Settings, Calendar, Check, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/utils/supabaseClient";
import { calculateCycleState } from "@/utils/cycleHelpers";
import CravePantrySection from "./CravePantrySection";
import InteractivePortrait from "./InteractivePortrait";

interface SavedAnalysis {
  id: string | number;
  message: string;
  phase: string;
  result: string;
  timestamp: string;
  sender_label?: string;
}

interface CycleData {
  lmp: string;
  cycleLength: number;
  periodDuration: number;
}

interface CycleLog {
  id: string;
  start_date: string;
  notes?: string;
}

interface DashboardProps {
  setActiveTab: (tab: string) => void;
  session?: any;
  onLoginClick: () => void;
}

export default function Dashboard({ setActiveTab, session, onLoginClick }: DashboardProps) {
  const [messageText, setMessageText] = useState("");
  const [senderLabel, setSenderLabel] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);

  // Period Tracker States
  // Period Tracker States
  const [cycleData, setCycleData] = useState<CycleData | null>(null);
  const [cycleLogs, setCycleLogs] = useState<CycleLog[]>([]);
  const [isCycleDelayed, setIsCycleDelayed] = useState(false);
  const [cycleIrregularity, setCycleIrregularity] = useState<string | null>(null);
  const [isEditingCycle, setIsEditingCycle] = useState(false);
  const [lmpInput, setLmpInput] = useState("");
  const [lengthInput, setLengthInput] = useState("28");
  const [durationInput, setDurationInput] = useState("5");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [showCycleCalendar, setShowCycleCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());

  // Pattern summary states
  const [patternSummaries, setPatternSummaries] = useState<Record<string, string>>({});
  const [loadingPatterns, setLoadingPatterns] = useState<Record<string, boolean>>({});

  // Modal state for viewing a past analysis
  const [viewingAnalysis, setViewingAnalysis] = useState<SavedAnalysis | null>(null);

  // Safe Exit feature states
  const [isCurrentMessageToxic, setIsCurrentMessageToxic] = useState(false);
  const [showExitGuide, setShowExitGuide] = useState(false);

  const phaseDetails = {
    menstrual: {
      title: "Menstrual Phase",
      tagline: "Bleeding ☁️",
      description: "Progesterone & estrogen are low. Energy is resting, intuition is high. Feeling physically vulnerable makes self-doubt creep in easily.",
      moonIcon: (
        <svg className="w-5 h-5 text-purple-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
        </svg>
      )
    },
    follicular: {
      title: "Follicular Phase",
      tagline: "Post-Period 🌱",
      description: "Estrogen is rising. Energy, optimism, and mental focus are increasing. You are resilient, but might override boundaries to 'make things work'.",
      moonIcon: (
        <svg className="w-5 h-5 text-purple-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3a9 9 0 0 1 0 18V3z" fill="currentColor" className="text-butter-dark" />
        </svg>
      )
    },
    ovulation: {
      title: "Ovulation Phase",
      tagline: "Fertile Window ☀️",
      description: "Estrogen peaks. You feel highly social, communicative, and confident, though you might become overly agreeable or prone to over-explaining.",
      moonIcon: (
        <svg className="w-5 h-5 text-butter-dark shrink-0 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="9" fill="currentColor" />
          <circle cx="12" cy="12" r="9" className="text-butter animate-ping absolute opacity-25" />
        </svg>
      )
    },
    luteal: {
      title: "Luteal Phase",
      tagline: "Pre-Period ⛈️",
      description: "Progesterone climbs then drops. Anxiety, irritability, and sensitivity peak. Toxic messages can feel biologically destabilizing.",
      moonIcon: (
        <svg className="w-5 h-5 text-purple-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3a9 9 0 0 0 0 18V3z" fill="currentColor" className="text-butter-dark" />
        </svg>
      )
    }
  };

  const loadCycleLogs = async () => {
    if (!session || !isSupabaseConfigured()) return;
    
    try {
      const { data, error } = await supabase
        .from('cycle_logs')
        .select('*')
        .order('start_date', { ascending: false });
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        setCycleLogs(data);
        
        // Calculate average cycle length
        let avgLength = 28;
        let irregularCheck: string | null = null;
        if (data.length >= 2) {
          let totalDays = 0;
          let daysList: number[] = [];
          for (let i = 0; i < data.length - 1; i++) {
            const d1 = new Date(data[i].start_date);
            const d2 = new Date(data[i+1].start_date);
            const diff = Math.round((d1.getTime() - d2.getTime()) / (1000 * 3600 * 24));
            totalDays += diff;
            daysList.push(diff);
          }
          avgLength = Math.round(totalDays / (data.length - 1));
          
          const maxCycle = Math.max(...daysList);
          const minCycle = Math.min(...daysList);
          if (avgLength > 38 || maxCycle >= 40) {
            irregularCheck = "long_cycles";
          } else if (avgLength < 21 || minCycle <= 20) {
            irregularCheck = "short_cycles";
          } else if (maxCycle - minCycle > 10) {
            irregularCheck = "highly_variable";
          }
        }
        setCycleIrregularity(irregularCheck);
        
        // Ensure minimum 21, maximum 35 logic for UI dial stability
        avgLength = Math.max(21, Math.min(35, avgLength));
        
        const latestLmp = data[0].start_date;
        setCycleData({ lmp: latestLmp, cycleLength: avgLength, periodDuration: 5 });
        setCalendarMonth(new Date(latestLmp));
        setLmpInput(latestLmp);
        // We do NOT set isEditingCycle(false) here, letting the user manually close the setup when they are done.
      } else {
        setCycleData(null);
        setCycleLogs([]);
        setCycleIrregularity(null);
        setLmpInput("");
      }
    } catch (err) {
      console.warn("Could not load cycle logs:", err);
    }
  };

  useEffect(() => {
    if (session) {
      loadCycleLogs();
    } else {
      setCycleData(null);
      setCycleLogs([]);
    }

    // Load logged symptoms
    const savedSymptoms = localStorage.getItem("clara-logged-symptoms");
    if (savedSymptoms) {
      try {
        setSelectedSymptoms(JSON.parse(savedSymptoms));
      } catch (e) {
        console.error(e);
      }
    }

    loadAnalyses();
  }, [session]);

  // Persist symptoms when changed
  useEffect(() => {
    localStorage.setItem("clara-logged-symptoms", JSON.stringify(selectedSymptoms));
  }, [selectedSymptoms]);

  const phaseVisuals = {
    menstrual: {
      color: "lavender",
      bgGradient: "from-lavender/40 via-lavender-light/10 to-transparent",
      dialGlow: "rgba(188, 170, 240, 0.25)",
      accentText: "text-purple-600",
      accentBg: "bg-lavender text-purple-700 border-lavender-dark/50",
      progressStroke: "stroke-purple-300",
      insights: [
        { title: "Estrogen", value: 15, color: "bg-lavender-dark" },
        { title: "Progesterone", value: 10, color: "bg-lavender" },
        { title: "Energy", value: 30, color: "bg-lavender-dark" },
        { title: "Sensitivity", value: 85, color: "bg-purple-400" }
      ],
      pregnancyChance: "Very Low",
      symptoms: ["Cramps", "Fatigue", "Backache", "Heavy Flow", "Nesting", "Cozy Vibes"],
      mensionTip: "Your energy is turning inward. Cancel non-essential plans and let yourself rest. In relationships, you might feel extra sensitive to cold responses today—it's your body asking for safety."
    },
    follicular: {
      color: "butter",
      bgGradient: "from-butter/30 via-butter-light/10 to-transparent",
      dialGlow: "rgba(252, 226, 119, 0.2)",
      accentText: "text-amber-700",
      accentBg: "bg-butter-light text-amber-800 border-butter-dark/50",
      progressStroke: "stroke-butter-dark",
      insights: [
        { title: "Estrogen", value: 65, color: "bg-butter-dark" },
        { title: "Progesterone", value: 15, color: "bg-butter" },
        { title: "Energy", value: 75, color: "bg-butter-dark" },
        { title: "Sensitivity", value: 40, color: "bg-lavender-dark" }
      ],
      pregnancyChance: "Medium",
      symptoms: ["High Energy", "Clear Skin", "Focused", "Happy", "Productive", "Light discharge"],
      mensionTip: "Estrogen is rising, fueling optimism and resilience. You're clear-headed and ready to tackle tough conversations. Just watch out for compromising on boundaries to 'make things work'."
    },
    ovulation: {
      color: "butter-lavender",
      bgGradient: "from-butter/45 via-lavender-light/20 to-transparent",
      dialGlow: "rgba(252, 226, 119, 0.3)",
      accentText: "text-amber-850",
      accentBg: "bg-butter border-butter-dark text-amber-900",
      progressStroke: "stroke-butter-dark",
      insights: [
        { title: "Estrogen", value: 95, color: "bg-butter-dark" },
        { title: "Progesterone", value: 45, color: "bg-butter" },
        { title: "Energy", value: 95, color: "bg-butter-dark" },
        { title: "Sensitivity", value: 50, color: "bg-lavender" }
      ],
      pregnancyChance: "High (Fertile)",
      symptoms: ["Social Energy", "Bloating", "High Libido", "Bright Eyes", "Optimistic", "Mild Cramps"],
      mensionTip: "Estrogen and testosterone peak today, making you magnetic and highly communicative. You are prone to over-explaining or agreeability. Pause before committing to others' requests."
    },
    luteal: {
      color: "lavender-butter",
      bgGradient: "from-lavender/50 via-butter-light/15 to-transparent",
      dialGlow: "rgba(188, 170, 240, 0.3)",
      accentText: "text-purple-600",
      accentBg: "bg-lavender text-purple-700 border-lavender-dark/60",
      progressStroke: "stroke-purple-400",
      insights: [
        { title: "Estrogen", value: 45, color: "bg-lavender" },
        { title: "Progesterone", value: 80, color: "bg-purple-400" },
        { title: "Energy", value: 50, color: "bg-butter-dark" },
        { title: "Sensitivity", value: 95, color: "bg-purple-500" }
      ],
      pregnancyChance: "Low",
      symptoms: ["Cravings", "Anxiety", "Mood Swings", "Tender Breasts", "Bloating", "Restlessness"],
      mensionTip: "Progesterone drops sharply, triggering emotional sensitivity and threat detection. Confusing or cold messages can trigger intense self-doubt. Be gentle; your anxiety is chemical, not personal."
    }
  };

  // Custom Calendar generation and helper functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    // Previous month's trailing days
    const prevMonthDays = [];
    const prevMonthTotalDays = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      prevMonthDays.push({
        day: prevMonthTotalDays - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthTotalDays - i)
      });
    }
    
    // Current month's days
    const currentMonthDays = [];
    for (let i = 1; i <= totalDays; i++) {
      currentMonthDays.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i)
      });
    }
    
    // Next month's leading days to fill up 6 rows (42 cells)
    const nextMonthDays = [];
    const remainingCells = 42 - (prevMonthDays.length + currentMonthDays.length);
    for (let i = 1; i <= remainingCells; i++) {
      nextMonthDays.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i)
      });
    }
    
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  const handlePrevMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));
  };

  const daysGrid = getDaysInMonth(calendarMonth);

  const handleDayClick = (dayDate: Date) => {
    const yyyy = dayDate.getFullYear();
    const mm = String(dayDate.getMonth() + 1).padStart(2, '0');
    const dd = String(dayDate.getDate()).padStart(2, '0');
    setLmpInput(`${yyyy}-${mm}-${dd}`);
  };

  const isSelectedLmp = (dayDate: Date) => {
    if (!lmpInput) return false;
    const lmp = new Date(lmpInput);
    return (
      dayDate.getFullYear() === lmp.getFullYear() &&
      dayDate.getMonth() === lmp.getMonth() &&
      dayDate.getDate() === lmp.getDate()
    );
  };

  const isBleedingDay = (dayDate: Date) => {
    if (!lmpInput) return false;
    const lmp = new Date(lmpInput);
    const lmpMidnight = new Date(lmp.getFullYear(), lmp.getMonth(), lmp.getDate());
    const targetMidnight = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate());
    const diffMs = targetMidnight.getTime() - lmpMidnight.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays < (cycleData?.periodDuration || 5);
  };

  const isPredictedOvulation = (dayDate: Date) => {
    if (!lmpInput) return false;
    const lmp = new Date(lmpInput);
    const lmpMidnight = new Date(lmp.getFullYear(), lmp.getMonth(), lmp.getDate());
    const targetMidnight = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate());
    const diffMs = targetMidnight.getTime() - lmpMidnight.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    const length = cycleData?.cycleLength || 28;
    const cycleDay = (diffDays % length) + 1;
    const ovulationDay = length - 14;
    return cycleDay === ovulationDay || cycleDay === ovulationDay + 1;
  };

  const handleSaveCycleSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lmpInput) {
      setError("Please select the first day of your last period.");
      return;
    }

    const newData: CycleData = {
      lmp: lmpInput,
      cycleLength: Number(lengthInput),
      periodDuration: Number(durationInput)
    };

    setCycleData(newData);
    localStorage.setItem("clara-cycle-tracker", JSON.stringify(newData));
    setIsEditingCycle(false);
    setError("");
  };

  const loadAnalyses = async () => {
    if (session && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("analyses")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (data) {
          setSavedAnalyses(
            data.map((d: any) => ({
              id: d.id,
              message: d.message,
              phase: d.phase,
              result: d.result,
              timestamp: d.created_at,
              sender_label: d.sender_label,
            }))
          );
        }
      } catch (err) {
        console.error("Error fetching Supabase data, falling back to local:", err);
        loadLocalAnalyses();
      }
    } else {
      loadLocalAnalyses();
    }
  };

  const loadLocalAnalyses = () => {
    const saved = localStorage.getItem("clara-saved-analyses");
    if (saved) {
      setSavedAnalyses(JSON.parse(saved));
    } else {
      setSavedAnalyses([]);
    }
  };

  // Calculate current cycle state if parameters exist
  const cycleState = cycleData 
    ? calculateCycleState(cycleData.lmp, cycleData.cycleLength, cycleData.periodDuration)
    : null;

  const currentPhase = cycleState ? cycleState.phase : "general";
  const activePhaseDetails = cycleState ? phaseDetails[cycleState.phase] : null;

  const currentPhaseNormalized: "menstrual" | "follicular" | "ovulation" | "luteal" = 
    (cycleState && (cycleState.phase === "menstrual" || cycleState.phase === "follicular" || cycleState.phase === "ovulation" || cycleState.phase === "luteal"))
      ? cycleState.phase
      : "follicular";

  const phaseVisual = phaseVisuals[currentPhaseNormalized];

  // SVG circular dial sizing & progress math
  const radius = 80;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = cycleState && cycleData
    ? circumference - ((cycleState.currentDay) / cycleData.cycleLength) * circumference
    : circumference;

  // Anomaly check
  useEffect(() => {
    if (cycleState && cycleData) {
      if (cycleState.currentDay > cycleData.cycleLength + 3) {
        setIsCycleDelayed(true);
      } else {
        setIsCycleDelayed(false);
      }
    }
  }, [cycleState, cycleData]);

  // Expose current phase globally for other tabs like Mind Notes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("clara-current-phase", currentPhaseNormalized);
    }
  }, [currentPhaseNormalized]);

  const handleLogPeriod = async (dateStr: string) => {
    if (!session) {
      onLoginClick();
      return;
    }
    
    try {
      const { error } = await supabase.from('cycle_logs').insert({
        user_id: session.user.id,
        start_date: dateStr
      });
      if (error) throw error;
      
      await loadCycleLogs();
    } catch (err) {
      console.error("Failed to log period:", err);
      alert("Failed to log period. Ensure your database table is set up.");
    }
  };

  const handleDeleteLog = async (logId: string) => {
    try {
      const { error } = await supabase.from('cycle_logs').delete().eq('id', logId);
      if (error) throw error;
      await loadCycleLogs();
    } catch (err) {
      console.error("Failed to delete log:", err);
    }
  };

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) {
      setError("Please paste the message you received first.");
      return;
    }
    if (!senderLabel.trim()) {
      setError("Please provide a sender label (e.g. boyfriend, boss, roommate).");
      return;
    }

    setError("");
    setIsAnalyzing(true);
    setAnalysisResult(null);

    // Call Next.js API route passing calculated current phase
    fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: messageText.trim(),
        cycle_phase: currentPhase
      })
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Server analysis failed");
        }
        return res.json();
      })
      .then((data) => {
        setAnalysisResult(data.response);
        setIsCurrentMessageToxic(!!data.isToxic);
        setIsAnalyzing(false);
      })
      .catch((err: any) => {
        console.error("API Error:", err);
        setError("Something went wrong — try again in a moment 💜");
        setIsAnalyzing(false);
      });
  };

  const handleSaveAnalysis = async () => {
    if (!analysisResult) return;
    
    const sender = senderLabel.trim().toLowerCase();
    const newSave: SavedAnalysis = {
      id: Math.random().toString(36).substring(2, 9),
      message: messageText,
      phase: currentPhase,
      result: analysisResult,
      timestamp: new Date().toISOString(),
      sender_label: sender
    };

    if (session && isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from("analyses").insert({
          user_id: session.user.id,
          message: messageText,
          phase: currentPhase,
          sender_label: sender,
          result: analysisResult,
        });

        if (error) throw error;
        loadAnalyses(); // Reload from database
      } catch (err) {
        console.error("Supabase insert error, saving locally:", err);
        saveLocally(newSave);
      }
    } else {
      saveLocally(newSave);
    }

    // Reset Form
    setMessageText("");
    setSenderLabel("");
    setAnalysisResult(null);
  };

  const saveLocally = (newSave: SavedAnalysis) => {
    const updated = [newSave, ...savedAnalyses];
    setSavedAnalyses(updated);
    localStorage.setItem("clara-saved-analyses", JSON.stringify(updated));
  };

  const handleDeleteAnalysis = async (id: string | number) => {
    if (session && isSupabaseConfigured() && typeof id === "number") {
      try {
        const { error } = await supabase.from("analyses").delete().eq("id", id);
        if (error) throw error;
        loadAnalyses();
      } catch (err) {
        console.error("Error deleting from Supabase, removing locally:", err);
        deleteLocally(id);
      }
    } else {
      deleteLocally(id);
    }
  };

  const deleteLocally = (id: string | number) => {
    const updated = savedAnalyses.filter((a) => a.id !== id);
    setSavedAnalyses(updated);
    localStorage.setItem("clara-saved-analyses", JSON.stringify(updated));
  };

  // Group analyses by sender label to compute counts and compile pattern history
  const senderGroups = savedAnalyses.reduce((groups: Record<string, SavedAnalysis[]>, item) => {
    const sender = (item.sender_label || "unknown").trim().toLowerCase();
    if (!groups[sender]) {
      groups[sender] = [];
    }
    groups[sender].push(item);
    return groups;
  }, {});

  // Identify senders with 5+ messages
  const patternSenders = Object.keys(senderGroups).filter(
    (sender) => senderGroups[sender].length >= 5
  );

  const handleRevealPatterns = (sender: string) => {
    const group = senderGroups[sender];
    const messages = group.map((item) => item.message);
    const results = group.map((item) => item.result);

    setLoadingPatterns((prev) => ({ ...prev, [sender]: true }));

    fetch("/api/patterns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender_label: sender,
        messages: messages,
        results: results
      })
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Server pattern synthesis failed");
        }
        return res.json();
      })
      .then((data) => {
        setPatternSummaries((prev) => ({ ...prev, [sender]: data.response }));
        setLoadingPatterns((prev) => ({ ...prev, [sender]: false }));
      })
      .catch((err: any) => {
        console.error("API Patterns Error:", err);
        setPatternSummaries((prev) => ({
          ...prev,
          [sender]: "Something went wrong — try again in a moment 💜"
        }));
        setLoadingPatterns((prev) => ({ ...prev, [sender]: false }));
      });
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 max-w-5xl mx-auto w-full space-y-8 animate-slide-up">
      
      {/* Polished Hero Section */}
      <section className="bg-lavender/35 border border-lavender/60 rounded-3xl p-6 md:p-8 text-center space-y-4 shadow-sm relative overflow-hidden">
        {/* Top journal binder detailing */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-butter via-lavender to-butter-dark"></div>
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-500"></div>
        
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-900 uppercase tracking-wider border border-indigo-100">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
          <span>Mension Journal</span>
        </div>
        
        <h1 className="font-dm-sans font-black text-3xl md:text-5xl text-gray-900 tracking-tight leading-none mb-4">
          Understand what's really happening — in your messages and your body.
        </h1>
        
        <p className="text-sm text-gray-500 max-w-xl mx-auto leading-relaxed font-medium">
          Paste a message that left you confused, anxious, or gaslit. Mension automatically aligns with your body's current menstruation cycle phase to identify patterns of behavior with warm empathetic clarity.
        </p>
      </section>

      {/* Auth Banner if unauthenticated */}
      {!session && (
        <section className="glass-panel-yellow rounded-3xl p-5 border-butter flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-white flex items-center justify-center border border-butter-dark shadow-sm">
              <span>🔒</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-charcoal">Sync & Remember Patterns</h4>
              <p className="text-[11px] text-warm-gray font-medium">Sign in to save your logs securely and unlock cross-message pattern memory.</p>
            </div>
          </div>
          <button
            onClick={onLoginClick}
            className="px-4 py-2 bg-white hover:bg-lavender-light border border-lavender-dark/45 text-charcoal text-xs font-bold rounded-2xl transition-all-300 shrink-0 hover:scale-102"
          >
            Create Free Account
          </button>
        </section>
      )}

      {/* Main Grid - Stacks on Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Period Status/Setup Form & Analyzer Input */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* A. Cycle Setup Card or Today's Cycle Status Card */}
          {(!cycleData || isEditingCycle) ? (
            <div className="glass-panel rounded-3xl p-6 border-lavender bg-white/60 space-y-5 animate-fade-in">
              <div className="flex items-center justify-between border-b border-lavender/30 pb-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  <h3 className="font-dm-sans font-bold text-base text-charcoal">Align with your Menstrual Cycle</h3>
                </div>
                {cycleData && (
                  <button 
                    onClick={() => setIsEditingCycle(false)} 
                    className="text-xs font-semibold text-warm-gray hover:text-charcoal px-3 py-1 rounded-xl hover:bg-lavender-light transition-all"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {!session ? (
                <div className="bg-lavender-light/40 border border-lavender/50 p-6 rounded-2xl text-center space-y-4">
                  <p className="text-sm text-charcoal font-medium">
                    Please sign in to securely save your health history and enable anomaly detection.
                  </p>
                  <button
                    onClick={onLoginClick}
                    className="bg-butter hover:bg-butter-dark text-charcoal font-bold py-2.5 px-6 rounded-2xl transition-all shadow-sm"
                  >
                    Sign in to Tracker
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-bold text-charcoal uppercase tracking-wider">
                      Select Date on Calendar:
                    </label>
                    <div className="border border-lavender rounded-3xl p-4 bg-white/90 shadow-sm space-y-3 relative z-10">
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={handlePrevMonth}
                          className="p-1.5 rounded-xl hover:bg-lavender-light text-charcoal transition-all cursor-pointer border border-lavender/30 bg-white/50"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="font-dm-sans font-bold text-xs text-charcoal uppercase tracking-wider">
                          {calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </span>
                        <button
                          type="button"
                          onClick={handleNextMonth}
                          className="p-1.5 rounded-xl hover:bg-lavender-light text-charcoal transition-all cursor-pointer border border-lavender/30 bg-white/50"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-7 gap-1 text-center">
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((wd) => (
                          <span key={wd} className="text-[9px] font-bold text-warm-gray uppercase tracking-wide">
                            {wd}
                          </span>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-1">
                        {daysGrid.map((cell, idx) => {
                          const isSelected = isSelectedLmp(cell.date);
                          const isBleeding = isBleedingDay(cell.date);
                          const isOvulating = isPredictedOvulation(cell.date);
                          
                          const today = new Date();
                          today.setHours(0,0,0,0);
                          const isFuture = cell.date > today;
                          
                          return (
                            <button
                              type="button"
                              key={idx}
                              onClick={() => handleDayClick(cell.date)}
                              disabled={!cell.isCurrentMonth || isFuture}
                              className={`h-8 w-8 mx-auto flex flex-col items-center justify-center text-xs rounded-full transition-all duration-200 cursor-pointer relative ${
                                (!cell.isCurrentMonth || isFuture)
                                  ? "text-warm-gray/20 pointer-events-none"
                                  : isSelected
                                  ? "bg-butter text-charcoal font-bold border-2 border-lavender-dark shadow-sm scale-110"
                                  : isBleeding
                                  ? "bg-lavender text-purple-700 font-semibold border border-lavender-dark/30 shadow-inner"
                                  : isOvulating
                                  ? "border border-dashed border-butter-dark bg-butter-light/50 text-charcoal font-bold"
                                  : "hover:bg-lavender-light/50 text-charcoal"
                              }`}
                            >
                              <span>{cell.day}</span>
                              {cell.isCurrentMonth && isBleeding && !isSelected && (
                                <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                              )}
                              {cell.isCurrentMonth && isOvulating && (
                                <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-butter-dark animate-pulse"></span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    
                    {lmpInput && (
                      <button
                        onClick={() => handleLogPeriod(lmpInput)}
                        className="w-full mt-4 bg-butter hover:bg-butter-dark text-charcoal border border-butter-dark/50 font-bold py-3.5 rounded-2xl transition-all-300 shadow-sm cursor-pointer"
                      >
                        Log Date: {new Date(lmpInput).toLocaleDateString()}
                      </button>
                    )}
                  </div>

                  <div className="pt-4 border-t border-lavender/40 space-y-3">
                    <button
                      onClick={() => handleLogPeriod(new Date().toISOString().split("T")[0])}
                      className="w-full bg-lavender hover:bg-lavender-dark text-purple-900 border border-lavender-dark/50 font-bold py-3.5 rounded-2xl transition-all-300 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span className="text-lg">🩸</span>
                      <span>My Period Started Today</span>
                    </button>
                  </div>

                  {cycleLogs.length > 0 && (
                    <div className="pt-6">
                      <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider mb-3">Your Log History</h4>
                      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                        {cycleLogs.map((log) => (
                          <div key={log.id} className="flex justify-between items-center bg-white/60 border border-lavender/40 p-3 rounded-xl group">
                            <div>
                              <span className="text-sm font-semibold text-charcoal">{new Date(log.start_date).toLocaleDateString(undefined, { timeZone: 'UTC' })}</span>
                              <span className="text-[10px] uppercase font-bold text-warm-gray tracking-wider ml-2">Period Start</span>
                            </div>
                            <button
                              onClick={() => handleDeleteLog(log.id)}
                              className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors cursor-pointer"
                              title="Delete log"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      {cycleData && (
                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={() => setIsEditingCycle(false)}
                            className="text-xs font-bold text-purple-700 hover:text-purple-900 cursor-pointer"
                          >
                            Return to Dashboard →
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Visual Cycle Status Card - Flo/Mension style */
            <div className="glass-panel rounded-3xl p-6 border-lavender bg-white/70 space-y-6 animate-fade-in relative overflow-hidden shadow-xl shadow-lavender/10">
              {/* Background gradient decorative glow reflecting the phase */}
              <div className={`absolute -right-24 -top-24 w-60 h-60 bg-gradient-to-br ${phaseVisual.bgGradient} rounded-full blur-3xl opacity-80 pointer-events-none`}></div>
              <div className={`absolute -left-24 -bottom-24 w-60 h-60 bg-gradient-to-tr ${phaseVisual.bgGradient} rounded-full blur-3xl opacity-80 pointer-events-none`}></div>
              
              {/* Header inside the tracker card */}
              <div className="flex items-center justify-between border-b border-lavender/30 pb-3 relative z-10">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-butter-dark animate-pulse"></span>
                  <h3 className="font-dm-sans font-bold text-sm text-charcoal">Cycle Tracker & Insights</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingCycle(true)}
                  className="p-1.5 rounded-xl text-warm-gray hover:text-charcoal hover:bg-lavender-light transition-all flex items-center gap-1 text-xs font-semibold cursor-pointer border border-lavender/20 bg-white/40"
                  title="Update period settings"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              </div>

              {/* Flo-style Bubble Centerpiece */}
              <div className="flex flex-col items-center justify-center py-2 relative z-10">
                <div className="relative flex items-center justify-center">
                  {/* Glowing halo behind the dial */}
                  <div 
                    className="absolute rounded-full animate-breath transition-all duration-700"
                    style={{
                      width: `${radius * 2 - 12}px`,
                      height: `${radius * 2 - 12}px`,
                      background: `radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0.7) 40%, transparent 100%)`,
                      boxShadow: `0 0 30px 10px ${phaseVisual.dialGlow}`,
                      zIndex: 1
                    }}
                  ></div>

                  {/* SVG Radial Gauge */}
                  <svg
                    height={radius * 2}
                    width={radius * 2}
                    className="relative z-10 -rotate-90 select-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.03)]"
                  >
                    {/* Background Circle */}
                    <circle
                      stroke="rgba(0, 0, 0, 0.05)"
                      fill="transparent"
                      strokeWidth={stroke}
                      r={normalizedRadius}
                      cx={radius}
                      cy={radius}
                    />
                    {/* Foreground Active Arc */}
                    <circle
                      className={`transition-all duration-1000 ease-out ${phaseVisual.progressStroke}`}
                      fill="transparent"
                      strokeWidth={stroke}
                      strokeDasharray={circumference + " " + circumference}
                      style={{ strokeDashoffset }}
                      strokeLinecap="round"
                      r={normalizedRadius}
                      cx={radius}
                      cy={radius}
                    />
                  </svg>

                  {/* Bubble Content overlay inside the radial circle */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center p-4">
                    <div className="w-7 h-7 rounded-full bg-white/95 border border-lavender/45 flex items-center justify-center shadow-sm text-xs animate-float">
                      {activePhaseDetails?.moonIcon}
                    </div>
                    
                    <span className="text-3xl font-dm-sans font-extrabold text-charcoal tracking-tight mt-1 leading-none">
                      Day {cycleState?.currentDay}
                    </span>
                    
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${phaseVisual.accentText} mt-1`}>
                      {activePhaseDetails?.title.replace(" Phase", "")}
                    </span>
                    
                    <span className="text-[9px] font-medium text-warm-gray mt-0.5">
                      {cycleState?.daysUntilNextPeriod} days to next
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Health Stats & Hormone Forecast Grid */}
              <div className="space-y-3 relative z-10 bg-white/60 p-4 rounded-3xl border border-lavender/35">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-charcoal uppercase tracking-wider flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-butter-dark" />
                    Hormone & State Forecast
                  </span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${phaseVisual.accentBg} border`}>
                    Pregnancy Chance: {phaseVisual.pregnancyChance}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-1">
                  {phaseVisual.insights.map((gauge) => (
                    <div key={gauge.title} className="space-y-1">
                      <div className="flex justify-between text-[9px] font-bold text-warm-gray">
                        <span>{gauge.title}</span>
                        <span className="text-charcoal">{gauge.value}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-lavender-light rounded-full overflow-hidden border border-lavender/20">
                        <div
                          style={{ width: `${gauge.value}%` }}
                          className={`h-full ${gauge.color} rounded-full transition-all duration-1000`}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Anomaly Check-in Card */}
              {isCycleDelayed && (
                <div className="bg-red-50/80 border border-red-200 p-4 rounded-3xl relative z-10 space-y-2 animate-fade-in shadow-sm">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider">Mension Check-in</span>
                  </div>
                  <p className="text-xs text-charcoal leading-relaxed font-medium">
                    Hey, I noticed your cycle is a bit delayed this month (Day {cycleState?.currentDay}). Have you been under a lot of stress lately, or is this unusual for you? 
                  </p>
                  <button 
                    onClick={() => setActiveTab("chat")}
                    className="w-full mt-2 bg-white hover:bg-red-100 text-red-600 text-xs font-bold py-2 rounded-xl border border-red-200 transition-all shadow-sm cursor-pointer"
                  >
                    Chat with Ova about this
                  </button>
                </div>
              )}

              {/* Historical Irregularity Card */}
              {cycleIrregularity && (
                <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-3xl relative z-10 space-y-2 animate-fade-in shadow-sm">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-500" />
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Health Insight</span>
                  </div>
                  <p className="text-xs text-charcoal leading-relaxed font-medium">
                    {cycleIrregularity === "long_cycles" && "I noticed your cycles are consistently longer than usual or have large gaps. This can happen due to stress, PCOS, or thyroid changes."}
                    {cycleIrregularity === "short_cycles" && "I noticed your cycles are coming very quickly (under 21 days). This can sometimes cause fatigue or low iron. How have your energy levels been?"}
                    {cycleIrregularity === "highly_variable" && "I noticed your cycle lengths are quite unpredictable and jump around. Stress or lifestyle shifts can do this."}
                  </p>
                  <button 
                    onClick={() => setActiveTab("chat")}
                    className="w-full mt-2 bg-white hover:bg-amber-100 text-amber-700 text-xs font-bold py-2 rounded-xl border border-amber-200 transition-all shadow-sm cursor-pointer"
                  >
                    Discuss my cycle health with Ova
                  </button>
                </div>
              )}

              {/* Dynamic Sympathetic Ova Insights Panel */}
              <div className="bg-white/80 border border-lavender/50 p-4 rounded-3xl relative z-10 space-y-1.5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <div className="flex items-start space-x-2">
                  <Heart className="w-4 h-4 text-butter-dark shrink-0 mt-0.5 fill-butter-dark/10" />
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-charcoal uppercase tracking-wider block">Ova Insights</span>
                    <p className="text-[11px] text-charcoal/80 leading-relaxed font-medium">
                      {phaseVisual.mensionTip}
                    </p>
                  </div>
                </div>
              </div>

              {/* Interactive Symptom Logger */}
              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-charcoal uppercase tracking-wider flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-butter-dark" />
                    How do you feel today?
                  </span>
                  <span className="text-[9px] text-warm-gray font-semibold">Saved locally</span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {phaseVisual.symptoms.map((symptom) => {
                    const isSelected = selectedSymptoms.includes(symptom);
                    return (
                      <button
                        type="button"
                        key={symptom}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
                          } else {
                            setSelectedSymptoms([...selectedSymptoms, symptom]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 flex items-center gap-1 cursor-pointer ${
                          isSelected
                            ? `${phaseVisual.accentBg} shadow-sm scale-102`
                            : "bg-white/50 border-lavender/50 text-warm-gray hover:bg-lavender-light hover:text-charcoal"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 shrink-0" />}
                        <span>{symptom}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Expandable Predicted Calendar View (Flo style) */}
              <div className="border-t border-lavender/35 pt-4 relative z-10">
                <button
                  type="button"
                  onClick={() => setShowCycleCalendar(!showCycleCalendar)}
                  className="w-full flex items-center justify-between py-1 text-[10px] font-bold text-charcoal uppercase tracking-wider hover:text-purple-700 transition-all cursor-pointer"
                >
                  <span>📅 Predicted Cycle Calendar</span>
                  <span>{showCycleCalendar ? "Hide" : "Show"}</span>
                </button>

                {showCycleCalendar && (
                  <div className="mt-3 space-y-3 animate-fade-in">
                    <div className="border border-lavender rounded-3xl p-4 bg-white/90 shadow-sm space-y-3">
                      {/* Month header navigation */}
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={handlePrevMonth}
                          className="p-1 rounded-xl hover:bg-lavender-light text-charcoal transition-all text-xs font-bold cursor-pointer"
                        >
                          ←
                        </button>
                        <span className="font-dm-sans font-bold text-xs text-charcoal uppercase tracking-wider">
                          {calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </span>
                        <button
                          type="button"
                          onClick={handleNextMonth}
                          className="p-1 rounded-xl hover:bg-lavender-light text-charcoal transition-all text-xs font-bold cursor-pointer"
                        >
                          →
                        </button>
                      </div>

                      {/* Weekdays header */}
                      <div className="grid grid-cols-7 gap-1 text-center">
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((wd) => (
                          <span key={wd} className="text-[9px] font-bold text-warm-gray uppercase tracking-wide">
                            {wd}
                          </span>
                        ))}
                      </div>

                      {/* Days grid */}
                      <div className="grid grid-cols-7 gap-1">
                        {daysGrid.map((cell, idx) => {
                          const isSelected = isSelectedLmp(cell.date);
                          const isBleeding = isBleedingDay(cell.date);
                          const isOvulating = isPredictedOvulation(cell.date);
                          
                          return (
                            <div
                              key={idx}
                              className={`h-8 w-8 mx-auto flex flex-col items-center justify-center text-xs rounded-full relative ${
                                !cell.isCurrentMonth
                                  ? "text-warm-gray/25"
                                  : isSelected
                                  ? "bg-butter text-charcoal font-bold border-2 border-lavender-dark shadow-sm scale-110"
                                  : isBleeding
                                  ? "bg-lavender text-purple-700 font-semibold border border-lavender-dark/30 shadow-inner"
                                  : isOvulating
                                  ? "border border-dashed border-butter-dark bg-butter-light/50 text-charcoal font-bold"
                                  : "text-charcoal"
                              }`}
                            >
                              <span>{cell.day}</span>
                              {cell.isCurrentMonth && isBleeding && !isSelected && (
                                <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                              )}
                              {cell.isCurrentMonth && isOvulating && (
                                <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-butter-dark animate-pulse"></span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 justify-center text-[8px] font-bold text-warm-gray uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-butter border border-lavender-dark/50"></span>
                        <span>Start Date</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-lavender border border-lavender-dark/30"></span>
                        <span>Bleed Days</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full border border-dashed border-butter-dark bg-butter-light/50"></span>
                        <span>Ovulation Window</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

{/* B. Core Analyzer Input Card */}
          {cycleData && !isEditingCycle && (
            <div className="glass-panel rounded-3xl p-6 border-lavender bg-white/60 space-y-6">
              <form onSubmit={handleAnalyze} className="space-y-5">
                {/* 1. Paste message */}
                <div className="space-y-2">
                  <label htmlFor="message-pasted" className="block text-[10px] font-bold text-charcoal uppercase tracking-wider">
                    1) Paste the message that made you feel weird:
                  </label>
                  <textarea
                    id="message-pasted"
                    rows={4}
                    value={messageText}
                    onChange={(e) => {
                      setMessageText(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Examples: 'If you actually cared about us, you wouldn't go out tonight' or 'You're misremembering, I never said that. You're being paranoid again.'..."
                    className="w-full rounded-3xl border border-lavender p-4 text-sm focus:outline-none focus:ring-2 focus:ring-lavender-dark focus:border-transparent bg-white/70 text-charcoal placeholder-warm-gray/40 font-normal leading-relaxed"
                    disabled={isAnalyzing}
                  />
                </div>

                {/* 2. Who sent it */}
                <div className="space-y-2">
                  <label htmlFor="sender-label" className="block text-[10px] font-bold text-charcoal uppercase tracking-wider">
                    2) Who sent this message? (e.g. boyfriend, boss, ex — no real names):
                  </label>
                  <input
                    id="sender-label"
                    type="text"
                    value={senderLabel}
                    onChange={(e) => {
                      setSenderLabel(e.target.value.toLowerCase().replace(/[^a-z0-9\s-]/g, ""));
                      if (error) setError("");
                    }}
                    placeholder="e.g. boyfriend, boss, ex, sister"
                    className="w-full rounded-3xl border border-lavender p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-lavender-dark focus:border-transparent bg-white/70 text-charcoal placeholder-warm-gray/45 font-semibold"
                    disabled={isAnalyzing}
                  />
                </div>

                {error && (
                  <p className="text-xs text-red-500 font-bold flex items-center gap-1.5 mt-2">
                    <AlertCircle className="w-4 h-4 text-red-500 animate-pulse" />
                    {error}
                  </p>
                )}

                {/* Analyze Trigger */}
                {!isAnalyzing && !analysisResult && (
                  <div className="space-y-3">
                    <button
                      type="submit"
                      className="w-full bg-butter hover:bg-butter-dark text-charcoal border border-butter-dark/50 font-bold py-3.5 rounded-3xl transition-all-300 shadow-md flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 cursor-pointer"
                    >
                      <Activity className="w-4.5 h-4.5 text-charcoal" />
                      <span>Analyze Message & Sensitivity</span>
                    </button>
                    <p className="text-[10px] text-center text-warm-gray font-semibold">
                      Ova will analyze this message factoring in your current <strong>{activePhaseDetails?.title}</strong>.
                    </p>
                  </div>
                )}
              </form>

              {/* Loading State */}
              {isAnalyzing && (
                <div className="py-12 flex flex-col items-center justify-center space-y-4 animate-pulse-slow">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <Flower className="w-12 h-12 text-emerald-400 animate-bounce" />
                    <div className="absolute inset-0 border-4 border-t-lavender-dark border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-charcoal font-dm-sans">Ova is reading between the lines...</p>
                    <p className="text-xs text-warm-gray mt-1 font-medium">Factoring in your cycle day {cycleState?.currentDay} ({currentPhase} phase)...</p>
                  </div>
                </div>
              )}

              {/* Analysis Result Card */}
              {analysisResult && (
                <div className="animate-fade-in border border-lavender/80 bg-white rounded-3xl p-6 space-y-5 shadow-md shadow-lavender/10 relative overflow-hidden">
                  <div className="absolute -right-8 -top-8 w-24 h-24 bg-butter/25 rounded-full blur-xl"></div>
                  <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-lavender/25 rounded-full blur-xl"></div>

                  <div className="flex items-center justify-between border-b border-lavender/40 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base">📝</span>
                      <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-100 uppercase tracking-wide">
                        Ova's Analysis
                      </span>
                    </div>
                    <span className="text-[10px] text-warm-gray font-bold uppercase tracking-wider bg-lavender-light border border-lavender/50 px-2.5 py-0.5 rounded-full">
                      From: {senderLabel} • Day {cycleState?.currentDay}
                    </span>
                  </div>

                  <div className="text-sm text-charcoal/90 leading-relaxed space-y-4 font-normal whitespace-pre-wrap">
                    {analysisResult.split("\n\n").map((paragraph, index) => {
                      if (paragraph.startsWith("###")) {
                        return <h4 key={index} className="font-dm-sans font-bold text-base text-charcoal pt-2">{paragraph.replace("### ", "")}</h4>;
                      }
                      if (paragraph.startsWith("####")) {
                        return <h5 key={index} className="font-dm-sans font-bold text-sm text-charcoal/90 uppercase tracking-wide pt-1">{paragraph.replace("#### ", "")}</h5>;
                      }
                      return <p key={index} className="text-charcoal/85">{paragraph}</p>;
                    })}
                  </div>

                  <div className="flex flex-col gap-3 pt-2">
                    <div className="flex gap-3">
                      <button
                        onClick={handleSaveAnalysis}
                        className="flex-1 bg-butter hover:bg-butter-dark text-charcoal border border-butter-dark/50 font-bold py-2.5 rounded-2xl transition-all-300 text-xs flex items-center justify-center gap-2 hover:scale-102 shadow-sm cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-charcoal" />
                        <span>Save to Reflection Log</span>
                      </button>
                      <button
                        onClick={() => {
                          setMessageText("");
                          setSenderLabel("");
                          setAnalysisResult(null);
                          setIsCurrentMessageToxic(false);
                        }}
                        className="px-4 py-2.5 border border-lavender/80 bg-white hover:bg-lavender-light/35 rounded-2xl text-xs font-bold text-warm-gray hover:text-charcoal transition-all-300 cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                    {isCurrentMessageToxic && (
                      <button
                        onClick={() => setShowExitGuide(true)}
                        className="w-full mt-2 py-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold rounded-2xl transition-all shadow-sm text-sm"
                      >
                        Need help getting out? 💜
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Pattern Cards & Saved reflections */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 1. Pattern Memory Card Section */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-500 animate-float" />
              <h3 className="font-dm-sans font-bold text-base text-charcoal">Pattern Memory</h3>
            </div>

            {patternSenders.length === 0 ? (
              <div className="glass-panel rounded-3xl p-5 text-center border-lavender bg-white/40 text-[11px] text-warm-gray leading-normal font-medium animate-fade-in">
                🌻 Ova's tip: Analyze 5+ messages from the same sender label (like "boyfriend" or "boss") to unlock pattern recognition over time.
              </div>
            ) : (
              <div className="space-y-4">
                {patternSenders.map((sender) => {
                  const count = senderGroups[sender].length;
                  const patternText = patternSummaries[sender];
                  const isLoading = !!loadingPatterns[sender];

                  return (
                    <div
                      key={sender}
                      className="glass-panel-yellow rounded-3xl p-5 border-butter space-y-3 animate-bloom"
                    >
                      <h4 className="font-dm-sans font-bold text-xs text-charcoal/90 flex items-center gap-1.5 uppercase tracking-wide">
                        <span>🛡️</span>
                        <span>Pattern Card: {sender}</span>
                      </h4>
                      <p className="text-xs text-charcoal/80 leading-normal">
                        You've shared {count} messages from <strong>{sender}</strong>. Here's what we've noticed over time:
                      </p>

                      {patternText ? (
                        <div className="text-xs text-charcoal/95 leading-relaxed bg-white/80 p-3.5 rounded-2xl border border-butter-dark/50 whitespace-pre-wrap font-medium">
                          {patternText.split("\n\n").map((p, idx) => {
                            // If it's the starter sentence, either strip it or just render it
                            const cleanText = p.replace(/^You've shared.*?Here's what we've noticed over time:\s*/i, "");
                            if (!cleanText) return null;
                            return <p key={idx} className="mb-2 last:mb-0">{cleanText}</p>;
                          })}
                        </div>
                      ) : isLoading ? (
                        <div className="py-4 flex flex-col items-center justify-center space-y-2">
                          <RefreshCw className="w-5 h-5 text-amber-500 animate-spin" />
                          <span className="text-[10px] text-warm-gray font-semibold">Synthesizing behavioral trends...</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRevealPatterns(sender)}
                          className="w-full flex items-center justify-center space-x-2 py-2.5 bg-white hover:bg-butter-light border border-butter-dark/60 rounded-2xl text-[10px] font-bold text-charcoal transition-all-300 hover:scale-101 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Reveal Behavioral Analysis</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* 2. Reflection History list */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-purple-400" />
              <h3 className="font-dm-sans font-bold text-base text-charcoal">Reflection History</h3>
            </div>

            {savedAnalyses.length === 0 ? (
              <div className="glass-panel rounded-3xl p-6 text-center border-dashed border-lavender/50 bg-white/30 text-xs text-warm-gray">
                No logs saved yet. After running an analysis, click "Save to Reflection Log".
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                {savedAnalyses.map((item) => (
                  <div
                    key={item.id}
                    className="glass-panel rounded-3xl p-4 border-lavender/40 bg-white/90 shadow-sm relative group hover:border-lavender transition-all-300"
                  >
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] uppercase font-bold tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                          {item.phase} Phase
                        </span>
                        {item.sender_label && (
                          <span className="text-[9px] uppercase font-bold tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-butter-dark/50">
                            {item.sender_label}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteAnalysis(item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-xl hover:bg-red-50 text-red-400 hover:text-red-600 transition-all duration-200 self-start"
                        title="Delete reflection"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] text-warm-gray font-semibold block">Message:</span>
                        <p className="text-xs text-charcoal/80 italic">"{item.message.substring(0, 100)}{item.message.length > 100 ? "..." : ""}"</p>
                      </div>
                      <button
                        onClick={() => {
                          setViewingAnalysis(item);
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-2xl bg-lavender-light/35 border border-lavender/30 text-[10px] font-bold text-charcoal hover:bg-lavender transition-all-300"
                      >
                        <span>Review Full Analysis</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <div className="w-full max-w-5xl mx-auto mt-12"><CravePantrySection currentPhase={currentPhaseNormalized} /></div>
      <div className="w-full max-w-5xl mx-auto mt-12"><InteractivePortrait /></div>

      {/* Full Analysis Modal Overlay */}
      {viewingAnalysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-lavender/50 relative">
            <button
              onClick={() => setViewingAnalysis(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-red-50 text-warm-gray hover:text-red-500 transition-colors cursor-pointer"
            >
              ✕
            </button>
            
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xl">📝</span>
              <h3 className="font-dm-sans font-bold text-xl text-charcoal">Analysis Review</h3>
            </div>

            <div className="space-y-6">
              <div className="bg-lavender-light/30 border border-lavender/40 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-warm-gray font-bold uppercase tracking-wider">Context</span>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                    {viewingAnalysis.phase} Phase
                  </span>
                  {viewingAnalysis.sender_label && (
                    <span className="text-[9px] uppercase font-bold tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-butter-dark/50">
                      From: {viewingAnalysis.sender_label}
                    </span>
                  )}
                </div>
                <p className="text-sm text-charcoal/80 italic border-l-2 border-lavender-dark pl-3 py-1">"{viewingAnalysis.message}"</p>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider">Ova's Insight</h4>
                <div className="text-sm text-charcoal/90 leading-relaxed space-y-3 whitespace-pre-wrap">
                  {viewingAnalysis.result.split("\n\n").map((paragraph, index) => {
                    if (paragraph.startsWith("###")) {
                      return <h5 key={index} className="font-dm-sans font-bold text-base text-charcoal pt-2">{paragraph.replace("### ", "")}</h5>;
                    }
                    if (paragraph.startsWith("####")) {
                      return <h6 key={index} className="font-dm-sans font-bold text-sm text-charcoal/90 uppercase tracking-wide pt-1">{paragraph.replace("#### ", "")}</h6>;
                    }
                    return <p key={index} className="text-charcoal/95 font-medium">{paragraph}</p>;
                  })}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-lavender/30 flex justify-end">
              <button
                onClick={() => setViewingAnalysis(null)}
                className="px-6 py-2.5 bg-butter hover:bg-butter-dark text-charcoal font-bold rounded-2xl transition-all shadow-sm cursor-pointer"
              >
                Close Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Safe Exit Guide Modal */}
      {showExitGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-red-100 relative">
            <button
              onClick={() => setShowExitGuide(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-red-50 text-warm-gray hover:text-red-500 transition-colors cursor-pointer"
            >
              ✕
            </button>
            
            <div className="flex items-center gap-2 mb-6">
              <ShieldCheck className="w-6 h-6 text-purple-600" />
              <h3 className="font-dm-sans font-bold text-2xl text-charcoal">Safe Exit Guide</h3>
            </div>
            
            <p className="text-sm text-charcoal/80 mb-8 leading-relaxed">
              If you're feeling unsafe or realizing it's time to leave, you don't have to do it alone. Here are practical, step-by-step actions you can take to protect yourself. Take what you need, at your own pace.
            </p>

            <div className="space-y-6">
              <div className="bg-purple-50/50 border border-purple-100 p-5 rounded-2xl">
                <h4 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                  <span className="bg-purple-200 text-purple-800 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                  Document Evidence Safely
                </h4>
                <p className="text-sm text-charcoal/80 leading-relaxed">
                  Take screenshots of manipulative or threatening messages. Email them to a secure, hidden account or send them to a trusted friend. Delete the evidence from your phone if you suspect your device is being monitored.
                </p>
              </div>

              <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl">
                <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <span className="bg-blue-200 text-blue-800 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                  Tell a Trusted Person
                </h4>
                <p className="text-sm text-charcoal/80 leading-relaxed">
                  Abuse thrives in isolation. Pick one trusted person—a friend, sister, colleague, or professional—and tell them the truth about what is happening. Establishing a code word for emergencies can be life-saving.
                </p>
              </div>

              <div className="bg-green-50/50 border border-green-100 p-5 rounded-2xl">
                <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                  <span className="bg-green-200 text-green-800 w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                  Financial Independence
                </h4>
                <p className="text-sm text-charcoal/80 leading-relaxed">
                  Start setting aside emergency cash or open a secret bank account if you can safely do so. Gather essential documents (passports, Aadhar card, banking details, property papers) and keep them in a safe location outside your home.
                </p>
              </div>

              <div className="bg-amber-50/50 border border-amber-100 p-5 rounded-2xl">
                <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                  <span className="bg-amber-200 text-amber-800 w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
                  Safety Planning
                </h4>
                <p className="text-sm text-charcoal/80 leading-relaxed">
                  Identify the safest rooms in your house (avoid kitchens or rooms with weapons). Plan an escape route. Turn off location sharing on your phone and social media apps. If you fear immediate violence, do not confront them; leave when they are not home.
                </p>
              </div>

              <div className="bg-red-50/50 border border-red-100 p-5 rounded-2xl">
                <h4 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                  <span className="bg-red-200 text-red-800 w-6 h-6 rounded-full flex items-center justify-center text-xs">5</span>
                  Professional Help (India)
                </h4>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-xl border border-red-100 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="font-bold text-charcoal block text-sm">National Commission for Women</span>
                      <span className="text-xs text-warm-gray">24/7 Helpline for women in distress</span>
                    </div>
                    <a href="tel:7827170170" className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-200">7827170170</a>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-red-100 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="font-bold text-charcoal block text-sm">iCall Helpline</span>
                      <span className="text-xs text-warm-gray">Psychosocial counseling (Mon-Sat)</span>
                    </div>
                    <a href="tel:9152987821" className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-200">9152987821</a>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-red-100 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="font-bold text-charcoal block text-sm">Vandrevala Foundation</span>
                      <span className="text-xs text-warm-gray">24/7 Mental health crisis support</span>
                    </div>
                    <a href="tel:9999666555" className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-200">9999 666 555</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-lavender/30 flex justify-end">
              <button
                onClick={() => setShowExitGuide(false)}
                className="px-6 py-2.5 bg-lavender-light hover:bg-lavender text-charcoal font-bold rounded-2xl transition-all shadow-sm cursor-pointer"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
