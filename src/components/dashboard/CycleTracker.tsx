"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Calendar, Settings, Activity, Check, Heart, AlertCircle, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { supabase } from "@/utils/supabaseClient";
import { calculateCycleState } from "@/utils/cycleHelpers";
import { getItem, setItem, KEYS } from "@/utils/storageHelper";
import type { CycleData, CycleLog } from "./types";

interface CycleTrackerProps {
  session?: any;
  cycleData: CycleData | null;
  cycleLogs: CycleLog[];
  onCycleDataChange: (data: CycleData) => void;
  onCycleLogsChange: (logs: CycleLog[]) => void;
  onStartChat: () => void;
  onLoginClick: () => void;
}

const phaseDetails: Record<string, { title: string; tagline: string; description: string; moonIcon: React.ReactNode }> = {
  menstrual: {
    title: "Menstrual Phase", tagline: "Bleeding ☁️",
    description: "Progesterone & estrogen are low. Energy is resting, intuition is high.",
    moonIcon: <svg className="w-5 h-5 text-purple-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /></svg>
  },
  follicular: {
    title: "Follicular Phase", tagline: "Post-Period 🌱",
    description: "Estrogen is rising. Energy, optimism, and mental focus are increasing.",
    moonIcon: <svg className="w-5 h-5 text-purple-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 3a9 9 0 0 1 0 18V3z" fill="currentColor" className="text-butter-dark" /></svg>
  },
  ovulation: {
    title: "Ovulation Phase", tagline: "Fertile Window ☀️",
    description: "Estrogen peaks. You feel highly social, confident, and communicative.",
    moonIcon: <svg className="w-5 h-5 text-butter-dark shrink-0 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9" fill="currentColor" /><circle cx="12" cy="12" r="9" className="text-butter animate-ping absolute opacity-25" /></svg>
  },
  luteal: {
    title: "Luteal Phase", tagline: "Pre-Period ⛈️",
    description: "Progesterone climbs then drops. Anxiety, irritability, and sensitivity peak.",
    moonIcon: <svg className="w-5 h-5 text-purple-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 3a9 9 0 0 0 0 18V3z" fill="currentColor" className="text-butter-dark" /></svg>
  }
};

const phaseVisuals: Record<string, any> = {
  menstrual: {
    color: "lavender", bgGradient: "from-lavender/40 via-lavender-light/10 to-transparent",
    dialGlow: "rgba(188, 170, 240, 0.25)", accentText: "text-purple-600",
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
    mensionTip: "Your energy is turning inward. Cancel non-essential plans and let yourself rest."
  },
  follicular: {
    color: "butter", bgGradient: "from-butter/30 via-butter-light/10 to-transparent",
    dialGlow: "rgba(252, 226, 119, 0.2)", accentText: "text-amber-700",
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
    mensionTip: "Estrogen is rising, fueling optimism and resilience."
  },
  ovulation: {
    color: "butter-lavender", bgGradient: "from-butter/45 via-lavender-light/20 to-transparent",
    dialGlow: "rgba(252, 226, 119, 0.3)", accentText: "text-amber-850",
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
    mensionTip: "Estrogen and testosterone peak today, making you magnetic and highly communicative."
  },
  luteal: {
    color: "lavender-butter", bgGradient: "from-lavender/50 via-butter-light/15 to-transparent",
    dialGlow: "rgba(188, 170, 240, 0.3)", accentText: "text-purple-600",
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
    mensionTip: "Progesterone drops sharply, triggering emotional sensitivity and threat detection."
  }
};

export default function CycleTracker({ session, cycleData, cycleLogs, onCycleDataChange, onCycleLogsChange, onStartChat, onLoginClick }: CycleTrackerProps) {
  const [isEditingCycle, setIsEditingCycle] = useState(false);
  const [lmpInput, setLmpInput] = useState(cycleData?.lmp || "");
  const [lengthInput, setLengthInput] = useState(String(cycleData?.cycleLength || 28));
  const [durationInput, setDurationInput] = useState(String(cycleData?.periodDuration || 5));
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [showCycleCalendar, setShowCycleCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => cycleData?.lmp ? new Date(cycleData.lmp) : new Date());
  const [isCycleDelayed, setIsCycleDelayed] = useState(false);

  // Load symptoms
  useEffect(() => {
    const saved = getItem(KEYS.LOGGED_SYMPTOMS);
    if (saved) {
      try { setSelectedSymptoms(JSON.parse(saved)); } catch {}
    }
  }, []);

  // Persist symptoms
  useEffect(() => {
    setItem(KEYS.LOGGED_SYMPTOMS, JSON.stringify(selectedSymptoms));
  }, [selectedSymptoms]);

  // Compute cycle state
  const cycleState = cycleData ? calculateCycleState(cycleData.lmp, cycleData.cycleLength, cycleData.periodDuration) : null;
  const currentPhase = cycleState ? cycleState.phase : "general";

  // Ensure phase matches one of our keys
  const phaseKey = (cycleState && ["menstrual", "follicular", "ovulation", "luteal"].includes(cycleState.phase))
    ? cycleState.phase as "menstrual" | "follicular" | "ovulation" | "luteal"
    : "follicular";
  const phaseVisual = phaseVisuals[phaseKey];
  const activePhaseDetails = phaseDetails[phaseKey];

  // SVG dial math
  const radius = 80, stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = cycleState && cycleData
    ? circumference - (cycleState.currentDay / cycleData.cycleLength) * circumference
    : circumference;

  // Anomaly detection
  useEffect(() => {
    if (cycleState && cycleData) {
      setIsCycleDelayed(cycleState.currentDay > cycleData.cycleLength + 3);
    }
  }, [cycleState, cycleData]);

  // Expose phase
  useEffect(() => {
    setItem(KEYS.CURRENT_PHASE, phaseKey);
  }, [phaseKey]);

  const getDaysInMonth = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();
    const prev = [];
    for (let i = firstDayIndex - 1; i >= 0; i--) prev.push({ day: prevMonthTotalDays - i, isCurrentMonth: false, date: new Date(year, month - 1, prevMonthTotalDays - i) });
    const current = [];
    for (let i = 1; i <= totalDays; i++) current.push({ day: i, isCurrentMonth: true, date: new Date(year, month, i) });
    const next = [];
    for (let i = 1; i <= 42 - prev.length - current.length; i++) next.push({ day: i, isCurrentMonth: false, date: new Date(year, month + 1, i) });
    return [...prev, ...current, ...next];
  }, []);

  const handleDayClick = (dayDate: Date) => {
    const yyyy = dayDate.getFullYear();
    const mm = String(dayDate.getMonth() + 1).padStart(2, '0');
    const dd = String(dayDate.getDate()).padStart(2, '0');
    setLmpInput(`${yyyy}-${mm}-${dd}`);
  };

  const isSelectedLmp = (dayDate: Date) => {
    if (!lmpInput) return false;
    const d = new Date(lmpInput);
    return dayDate.getFullYear() === d.getFullYear() && dayDate.getMonth() === d.getMonth() && dayDate.getDate() === d.getDate();
  };

  const isBleedingDay = (dayDate: Date) => {
    if (!lmpInput) return false;
    const lmp = new Date(lmpInput);
    const lmpM = new Date(lmp.getFullYear(), lmp.getMonth(), lmp.getDate());
    const targetM = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate());
    const diff = Math.floor((targetM.getTime() - lmpM.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff < (cycleData?.periodDuration || 5);
  };

  const isPredictedOvulation = (dayDate: Date) => {
    if (!lmpInput) return false;
    const lmp = new Date(lmpInput);
    const lmpM = new Date(lmp.getFullYear(), lmp.getMonth(), lmp.getDate());
    const targetM = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate());
    const diff = Math.floor((targetM.getTime() - lmpM.getTime()) / (1000 * 60 * 60 * 24));
    const length = cycleData?.cycleLength || 28;
    const cycleDay = (diff % length) + 1;
    const ovulationDay = length - 14;
    return cycleDay === ovulationDay || cycleDay === ovulationDay + 1;
  };

  const handleSaveCycle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lmpInput) return;
    onCycleDataChange({ lmp: lmpInput, cycleLength: Number(lengthInput), periodDuration: Number(durationInput) });
    setItem(KEYS.CYCLE_TRACKER, JSON.stringify({ lmp: lmpInput, cycleLength: Number(lengthInput), periodDuration: Number(durationInput) }));
    setIsEditingCycle(false);
  };

  const handleLogPeriod = async (dateStr: string) => {
    if (!session) { onLoginClick(); return; }
    try {
      const { error } = await supabase.from('cycle_logs').insert({ user_id: session.user.id, start_date: dateStr });
      if (error) throw error;
      // Signal parent to reload
      window.location.reload();
    } catch (err) {
      console.error("Failed to log period:", err);
      alert("Failed to log period. Ensure your database table is set up.");
    }
  };

  const handleDeleteLog = async (logId: string) => {
    try {
      const { error } = await supabase.from('cycle_logs').delete().eq('id', logId);
      if (error) throw error;
      window.location.reload();
    } catch (err) {
      console.error("Failed to delete log:", err);
    }
  };

  const daysGrid = getDaysInMonth(calendarMonth);

  const renderCalendar = (interactive: boolean) => (
    <div className="border border-lavender rounded-3xl p-4 bg-white/90 shadow-sm space-y-3 relative z-10">
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
          className="p-1.5 rounded-xl hover:bg-lavender-light text-charcoal transition-all cursor-pointer border border-lavender/30 bg-white/50">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-dm-sans font-bold text-xs text-charcoal uppercase tracking-wider">
          {calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
        <button type="button" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
          className="p-1.5 rounded-xl hover:bg-lavender-light text-charcoal transition-all cursor-pointer border border-lavender/30 bg-white/50">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(wd => (
          <span key={wd} className="text-[9px] font-bold text-warm-gray uppercase tracking-wide">{wd}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {daysGrid.map((cell, idx) => {
          const isSelected = isSelectedLmp(cell.date);
          const isBleeding = isBleedingDay(cell.date);
          const isOvulating = isPredictedOvulation(cell.date);
          const today = new Date(); today.setHours(0, 0, 0, 0);
          const isFuture = cell.date > today;
          if (interactive) {
            return (
              <button type="button" key={idx} onClick={() => handleDayClick(cell.date)}
                disabled={!cell.isCurrentMonth || isFuture}
                className={`h-8 w-8 mx-auto flex flex-col items-center justify-center text-xs rounded-full transition-all duration-200 cursor-pointer relative ${
                  !cell.isCurrentMonth || isFuture ? "text-warm-gray/20 pointer-events-none"
                  : isSelected ? "bg-butter text-charcoal font-bold border-2 border-lavender-dark shadow-sm scale-110"
                  : isBleeding ? "bg-lavender text-purple-700 font-semibold border border-lavender-dark/30 shadow-inner"
                  : isOvulating ? "border border-dashed border-butter-dark bg-butter-light/50 text-charcoal font-bold"
                  : "hover:bg-lavender-light/50 text-charcoal"
                }`}>
                <span>{cell.day}</span>
                {cell.isCurrentMonth && isBleeding && !isSelected && <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-purple-500"></span>}
                {cell.isCurrentMonth && isOvulating && <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-butter-dark animate-pulse"></span>}
              </button>
            );
          }
          return (
            <div key={idx} className={`h-8 w-8 mx-auto flex flex-col items-center justify-center text-xs rounded-full relative ${
              !cell.isCurrentMonth ? "text-warm-gray/25"
              : isSelected ? "bg-butter text-charcoal font-bold border-2 border-lavender-dark shadow-sm scale-110"
              : isBleeding ? "bg-lavender text-purple-700 font-semibold border border-lavender-dark/30 shadow-inner"
              : isOvulating ? "border border-dashed border-butter-dark bg-butter-light/50 text-charcoal font-bold"
              : "text-charcoal"
            }`}>
              <span>{cell.day}</span>
              {cell.isCurrentMonth && isBleeding && !isSelected && <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-purple-500"></span>}
              {cell.isCurrentMonth && isOvulating && <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-butter-dark animate-pulse"></span>}
            </div>
          );
        })}
      </div>
    </div>
  );

  // Setup view
  if (!cycleData || isEditingCycle) {
    return (
      <div className="glass-panel rounded-3xl p-6 border-lavender bg-white/60 space-y-5 animate-fade-in">
        <div className="flex items-center justify-between border-b border-lavender/30 pb-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            <h3 className="font-dm-sans font-bold text-base text-charcoal">Align with your Menstrual Cycle</h3>
          </div>
          {cycleData && (
            <button onClick={() => setIsEditingCycle(false)} className="text-xs font-semibold text-warm-gray hover:text-charcoal px-3 py-1 rounded-xl hover:bg-lavender-light transition-all">Cancel</button>
          )}
        </div>
        {!session ? (
          <div className="bg-lavender-light/40 border border-lavender/50 p-6 rounded-2xl text-center space-y-4">
            <p className="text-sm text-charcoal font-medium">Please sign in to securely save your health history and enable anomaly detection.</p>
            <button onClick={onLoginClick} className="bg-butter hover:bg-butter-dark text-charcoal font-bold py-2.5 px-6 rounded-2xl transition-all shadow-sm">Sign in to Tracker</button>
          </div>
        ) : (
          <form onSubmit={handleSaveCycle} className="space-y-6">
            <div className="space-y-3">
              <label className="block text-[10px] font-bold text-charcoal uppercase tracking-wider">Select Date on Calendar:</label>
              {renderCalendar(true)}
              {lmpInput && (
                <button type="button" onClick={() => handleLogPeriod(lmpInput)}
                  className="w-full mt-4 bg-butter hover:bg-butter-dark text-charcoal border border-butter-dark/50 font-bold py-3.5 rounded-2xl transition-all-300 shadow-sm cursor-pointer">
                  Log Date: {new Date(lmpInput).toLocaleDateString()}
                </button>
              )}
            </div>
            <div className="pt-4 border-t border-lavender/40">
              <button type="button" onClick={() => handleLogPeriod(new Date().toISOString().split("T")[0])}
                className="w-full bg-lavender hover:bg-lavender-dark text-purple-900 border border-lavender-dark/50 font-bold py-3.5 rounded-2xl transition-all-300 shadow-sm flex items-center justify-center gap-2 cursor-pointer">
                <span className="text-lg">🩸</span><span>My Period Started Today</span>
              </button>
            </div>
            {cycleLogs.length > 0 && (
              <div className="pt-6">
                <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider mb-3">Your Log History</h4>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                  {cycleLogs.map(log => (
                    <div key={log.id} className="flex justify-between items-center bg-white/60 border border-lavender/40 p-3 rounded-xl group">
                      <span className="text-sm font-semibold text-charcoal">{new Date(log.start_date).toLocaleDateString(undefined, { timeZone: 'UTC' })}</span>
                      <button type="button" onClick={() => handleDeleteLog(log.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    );
  }

  // Visual status view
  return (
    <div className="glass-panel rounded-3xl p-6 border-lavender bg-white/70 space-y-6 animate-fade-in relative overflow-hidden shadow-xl shadow-lavender/10">
      <div className={`absolute -right-24 -top-24 w-60 h-60 bg-gradient-to-br ${phaseVisual.bgGradient} rounded-full blur-3xl opacity-80 pointer-events-none`}></div>
      <div className={`absolute -left-24 -bottom-24 w-60 h-60 bg-gradient-to-tr ${phaseVisual.bgGradient} rounded-full blur-3xl opacity-80 pointer-events-none`}></div>

      <div className="flex items-center justify-between border-b border-lavender/30 pb-3 relative z-10">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-butter-dark animate-pulse"></span>
          <h3 className="font-dm-sans font-bold text-sm text-charcoal">Cycle Tracker & Insights</h3>
        </div>
        <button type="button" onClick={() => setIsEditingCycle(true)}
          className="p-1.5 rounded-xl text-warm-gray hover:text-charcoal hover:bg-lavender-light transition-all flex items-center gap-1 text-xs font-semibold cursor-pointer border border-lavender/20 bg-white/40">
          <Settings className="w-3.5 h-3.5" /><span>Edit</span>
        </button>
      </div>

      {/* SVG Radial Gauge */}
      <div className="flex flex-col items-center justify-center py-2 relative z-10">
        <div className="relative flex items-center justify-center">
          <div className="absolute rounded-full animate-breath transition-all duration-700"
            style={{ width: `${radius * 2 - 12}px`, height: `${radius * 2 - 12}px`,
              background: `radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0.7) 40%, transparent 100%)`,
              boxShadow: `0 0 30px 10px ${phaseVisual.dialGlow}` }} />
          <svg height={radius * 2} width={radius * 2} className="relative z-10 -rotate-90 select-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
            <circle stroke="rgba(0, 0, 0, 0.05)" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} />
            <circle className={`transition-all duration-1000 ease-out ${phaseVisual.progressStroke}`} fill="transparent" strokeWidth={stroke}
              strokeDasharray={`${circumference} ${circumference}`} style={{ strokeDashoffset }} strokeLinecap="round"
              r={normalizedRadius} cx={radius} cy={radius} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center p-4">
            <div className="w-7 h-7 rounded-full bg-white/95 border border-lavender/45 flex items-center justify-center shadow-sm text-xs animate-float">
              {activePhaseDetails?.moonIcon}
            </div>
            <span className="text-3xl font-dm-sans font-extrabold text-charcoal tracking-tight mt-1 leading-none">Day {cycleState?.currentDay}</span>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${phaseVisual.accentText} mt-1`}>{activePhaseDetails?.title.replace(" Phase", "")}</span>
            <span className="text-[9px] font-medium text-warm-gray mt-0.5">{cycleState?.daysUntilNextPeriod} days to next</span>
          </div>
        </div>
      </div>

      {/* Hormone Forecast */}
      <div className="space-y-3 relative z-10 bg-white/60 p-4 rounded-3xl border border-lavender/35">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-charcoal uppercase tracking-wider flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-butter-dark" />Hormone & State Forecast
          </span>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${phaseVisual.accentBg} border`}>Pregnancy Chance: {phaseVisual.pregnancyChance}</span>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-1">
          {phaseVisual.insights.map((gauge: any) => (
            <div key={gauge.title} className="space-y-1">
              <div className="flex justify-between text-[9px] font-bold text-warm-gray">
                <span>{gauge.title}</span><span className="text-charcoal">{gauge.value}%</span>
              </div>
              <div className="w-full h-1.5 bg-lavender-light rounded-full overflow-hidden border border-lavender/20">
                <div style={{ width: `${gauge.value}%` }} className={`h-full ${gauge.color} rounded-full transition-all duration-1000`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Anomaly Check-in */}
      {isCycleDelayed && (
        <div className="bg-red-50/80 border border-red-200 p-4 rounded-3xl relative z-10 space-y-2 animate-fade-in shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider">Mension Check-in</span>
          </div>
          <p className="text-xs text-charcoal leading-relaxed font-medium">
            Hey, I noticed your cycle is a bit delayed this month (Day {cycleState?.currentDay}). Have you been under a lot of stress lately?
          </p>
          <button onClick={onStartChat} className="w-full mt-2 bg-white hover:bg-red-100 text-red-600 text-xs font-bold py-2 rounded-xl border border-red-200 transition-all shadow-sm cursor-pointer">
            Chat with Ova about this
          </button>
        </div>
      )}

      {/* Ova Insights */}
      <div className="bg-white/80 border border-lavender/50 p-4 rounded-3xl relative z-10 space-y-1.5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="flex items-start space-x-2">
          <Heart className="w-4 h-4 text-butter-dark shrink-0 mt-0.5 fill-butter-dark/10" />
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-charcoal uppercase tracking-wider block">Ova Insights</span>
            <p className="text-[11px] text-charcoal/80 leading-relaxed font-medium">{phaseVisual.mensionTip}</p>
          </div>
        </div>
      </div>

      {/* Symptom Logger */}
      <div className="space-y-3 relative z-10">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-charcoal uppercase tracking-wider flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-butter-dark" />How do you feel today?
          </span>
          <span className="text-[9px] text-warm-gray font-semibold">Saved locally</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {phaseVisual.symptoms.map((symptom: string) => {
            const isSelected = selectedSymptoms.includes(symptom);
            return (
              <button type="button" key={symptom}
                onClick={() => setSelectedSymptoms(prev => isSelected ? prev.filter(s => s !== symptom) : [...prev, symptom])}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 flex items-center gap-1 cursor-pointer ${
                  isSelected ? `${phaseVisual.accentBg} shadow-sm scale-102` : "bg-white/50 border-lavender/50 text-warm-gray hover:bg-lavender-light hover:text-charcoal"
                }`}>
                {isSelected && <Check className="w-3 h-3 shrink-0" />}
                <span>{symptom}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Predicted Calendar */}
      <div className="border-t border-lavender/35 pt-4 relative z-10">
        <button type="button" onClick={() => setShowCycleCalendar(!showCycleCalendar)}
          className="w-full flex items-center justify-between py-1 text-[10px] font-bold text-charcoal uppercase tracking-wider hover:text-purple-700 transition-all cursor-pointer">
          <span>📅 Predicted Cycle Calendar</span><span>{showCycleCalendar ? "Hide" : "Show"}</span>
        </button>
        {showCycleCalendar && (
          <div className="mt-3 space-y-3 animate-fade-in">
            {renderCalendar(false)}
            <div className="flex flex-wrap gap-3 justify-center text-[8px] font-bold text-warm-gray uppercase tracking-wider">
              <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-butter border border-lavender-dark/50"></span><span>Start Date</span></div>
              <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-lavender border border-lavender-dark/30"></span><span>Bleed Days</span></div>
              <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full border border-dashed border-butter-dark bg-butter-light/50"></span><span>Ovulation Window</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}