"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Flower, Activity, ShieldCheck, FileText, Trash2, ArrowRight, UserCheck, AlertCircle, RefreshCw, Eye, Settings, Calendar, Check, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/utils/supabaseClient";
import { calculateCycleState } from "@/utils/cycleHelpers";
import CravePantrySection from "./CravePantrySection";
import InteractivePortrait from "./InteractivePortrait";
import ReflectionHistory from "./dashboard/ReflectionHistory";
import PatternMemory from "./dashboard/PatternMemory";
import FeedbackBanner from "./FeedbackBanner";

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
  const [cycleData, setCycleData] = useState<CycleData | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("clara-cycle-tracker");
      if (stored) {
        try { return JSON.parse(stored); } catch (e) { }
      }
    }
    const d = new Date();
    d.setDate(d.getDate() - 14);
    return { lmp: d.toISOString().split("T")[0], cycleLength: 28, periodDuration: 5 };
  });
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
  const [pendingLogDate, setPendingLogDate] = useState<Date | null>(null);

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
    let dataToUse: CycleLog[] = [];

    try {
      if (session && isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('cycle_logs')
          .select('*')
          .order('start_date', { ascending: false });

        if (error) throw error;
        if (data) dataToUse = data;
      }

      if (dataToUse.length === 0) {
        // Fallback to local logs array if Supabase failed or empty
        const storedLogs = localStorage.getItem("clara-cycle-logs");
        if (storedLogs) {
          try {
            dataToUse = JSON.parse(storedLogs);
          } catch (e) { }
        }
      }

      if (dataToUse.length > 0) {
        setCycleLogs(dataToUse);

        // Calculate average cycle length
        let avgLength = 28;
        let irregularCheck: string | null = null;
        if (dataToUse.length >= 2) {
          let totalDays = 0;
          let daysList: number[] = [];
          for (let i = 0; i < dataToUse.length - 1; i++) {
            const [y1, m1, d1] = dataToUse[i].start_date.split('-');
            const [y2, m2, d2] = dataToUse[i + 1].start_date.split('-');
            const date1 = new Date(parseInt(y1), parseInt(m1) - 1, parseInt(d1));
            const date2 = new Date(parseInt(y2), parseInt(m2) - 1, parseInt(d2));
            const diff = Math.round((date1.getTime() - date2.getTime()) / (1000 * 3600 * 24));
            totalDays += diff;
            daysList.push(diff);
          }
          avgLength = Math.round(totalDays / (dataToUse.length - 1));

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

        const latestLmp = dataToUse[0].start_date;
        setCycleData({ lmp: latestLmp, cycleLength: avgLength, periodDuration: 5 });
        setCalendarMonth(new Date(latestLmp));
        setLmpInput(latestLmp);
        // We do NOT set isEditingCycle(false) here, letting the user manually close the setup when they are done.

      } else {
        // Fallback for offline / missing Supabase: load array of past logs
        const storedLogs = localStorage.getItem("clara-cycle-logs");
        if (storedLogs) {
          try {
            const parsedLogs = JSON.parse(storedLogs);
            if (parsedLogs && parsedLogs.length > 0) {
              setCycleLogs(parsedLogs);
              const latestLmp = parsedLogs[0].start_date;
              setCalendarMonth(new Date(latestLmp));
              setLmpInput(latestLmp);
              return;
            }
          } catch (e) { }
        }

        // If there's no data in Supabase, but we have local single cycle data, push it to Supabase
        const stored = localStorage.getItem("clara-cycle-tracker");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.lmp) {
              if (session) {
                await supabase.from('cycle_logs').insert({
                  user_id: session.user.id,
                  start_date: parsed.lmp
                });
                // Reload to update state from DB
                const { data: newData, error: newError } = await supabase
                  .from('cycle_logs')
                  .select('*')
                  .order('start_date', { ascending: false });

                if (!newError && newData && newData.length > 0) {
                  setCycleLogs(newData);
                  setCycleData({ lmp: parsed.lmp, cycleLength: parsed.cycleLength || 28, periodDuration: parsed.periodDuration || 5 });
                  setCalendarMonth(new Date(parsed.lmp));
                  setLmpInput(parsed.lmp);
                  return;
                }
              } else {
                setCycleLogs([{ id: 'local-1', start_date: parsed.lmp }]);
              }
            }
          } catch (e) { }
        }

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

  const handleViewAnalysis = (analysis: SavedAnalysis) => {
    setMessageText(analysis.message);
    setSenderLabel(analysis.sender_label || "");
    setAnalysisResult(analysis.result);
    document.getElementById('analyzer-section')?.scrollIntoView({ behavior: 'smooth' });
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

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const handleDateClick = (d: number) => {
    if (!cycleData) return;
    const newLmpDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), d);
    setPendingLogDate(newLmpDate);
  };

  const handleSaveDate = () => {
    if (!pendingLogDate || !cycleData) return;
    const yyyy = pendingLogDate.getFullYear();
    const mm = String(pendingLogDate.getMonth() + 1).padStart(2, '0');
    const dd = String(pendingLogDate.getDate()).padStart(2, '0');
    const newLmp = `${yyyy}-${mm}-${dd}`;

    // Add to local cycle logs immediately to prevent calendar resetting when offline
    const newLog = { id: Date.now().toString(), start_date: newLmp };
    const currentLogs = [...cycleLogs];
    if (!currentLogs.some(log => log.start_date === newLmp)) {
      currentLogs.push(newLog);
      currentLogs.sort((a, b) => {
        const [ay, am, ad] = a.start_date.split('-');
        const [by, bm, bd] = b.start_date.split('-');
        return new Date(parseInt(by), parseInt(bm) - 1, parseInt(bd)).getTime() - new Date(parseInt(ay), parseInt(am) - 1, parseInt(ad)).getTime();
      });
      setCycleLogs(currentLogs);
      if (typeof window !== 'undefined') {
        localStorage.setItem("clara-cycle-logs", JSON.stringify(currentLogs));
      }
    }

    const newData = {
      lmp: newLmp,
      cycleLength: cycleData.cycleLength || 28,
      periodDuration: cycleData.periodDuration || 5
    };
    setCycleData(newData);
    setLmpInput(newLmp);
    if (typeof window !== 'undefined') {
      localStorage.setItem("clara-cycle-tracker", JSON.stringify(newData));
    }

    if (session) {
      handleLogPeriod(newLmp);
    }

    setPendingLogDate(null);
    setIsEditingCycle(false);
  };

  const handleSetupCycle = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const defaultData = {
      lmp: `${yyyy}-${mm}-${dd}`,
      cycleLength: 28,
      periodDuration: 5
    };
    setCycleData(defaultData);
    setLmpInput(defaultData.lmp);
    if (typeof window !== 'undefined') {
      localStorage.setItem("clara-cycle-tracker", JSON.stringify(defaultData));
    }

    if (session) {
      handleLogPeriod(defaultData.lmp);
    }
  };


  const renderPhaser = () => {
    if (!cycleState || !cycleData) return null;

    // Premium glassmorphism dial math
    const radius = 115, stroke = 12;
    const normalizedRadius = radius - stroke * 1.5;
    const circumference = normalizedRadius * 2 * Math.PI;
    const progressRatio = Math.min(1, cycleState.currentDay / cycleData.cycleLength);
    const strokeDashoffset = circumference - (progressRatio * circumference);

    return (
      <div className="flex flex-col items-center justify-center py-8 relative z-10 animate-fade-in">
        <div className="relative flex items-center justify-center group">
          {/* Soft ambient background glow */}
          <div className="absolute inset-0 rounded-full animate-breath opacity-60 blur-2xl transition-all duration-1000"
            style={{ background: phaseVisual.dialGlow }}
          />

          {/* Frosted Glass Dial Container */}
          <div className="relative bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-full flex items-center justify-center transition-transform duration-500 hover:scale-[1.02]"
            style={{ width: `${radius * 2}px`, height: `${radius * 2}px` }}>

            <svg height={radius * 2} width={radius * 2} className="absolute inset-0 z-10 -rotate-90 select-none">
              {/* Thick background track */}
              <circle
                stroke="rgba(0, 0, 0, 0.03)"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              {/* Bright smooth progress bar */}
              <circle
                className={`transition-all duration-1000 ease-out drop-shadow-sm ${phaseVisual.progressStroke}`}
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={`${circumference} ${circumference}`}
                style={{ strokeDashoffset }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
            </svg>

            {/* Centered Typography & Badges */}
            <div className="relative z-20 flex flex-col items-center justify-center text-center px-4 w-full h-full">
              <div className="mb-2 transition-transform duration-700 hover:scale-110">
                {activePhaseDetails?.moonIcon}
              </div>
              <span className="text-[3.25rem] font-dm-sans font-extrabold text-charcoal tracking-tighter leading-none mb-1">
                {cycleState.daysUntilNextPeriod < 0 ? "Late" : `Day ${cycleState.currentDay}`}
              </span>
              <span className={`text-xs font-bold uppercase tracking-[0.2em] ${phaseVisual.accentText} mt-2 flex items-center gap-2`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                {activePhaseDetails?.title.replace(" Phase", "")}
              </span>
              <span className="text-[10px] font-bold text-warm-gray mt-3 uppercase tracking-widest bg-black/5 px-3 py-1.5 rounded-full">
                {cycleState.daysUntilNextPeriod >= 0
                  ? `${cycleState.daysUntilNextPeriod} days to next`
                  : `${Math.abs(cycleState.daysUntilNextPeriod)} days late`}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCalendar = () => {
    if (!cycleData) return null;
    const today = new Date();
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // Mon = 0

    const calendarCells = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      calendarCells.push(
        <div key={`prev-${i}`} className="h-10 md:h-14 flex items-center justify-center text-xs font-medium text-on-surface/20">
          {prevMonthLastDay - i}
        </div>
      );
    }

    const lmpDate = new Date(cycleData.lmp);
    const lmpMidnight = new Date(lmpDate.getFullYear(), lmpDate.getMonth(), lmpDate.getDate()).getTime();

    for (let d = 1; d <= daysInMonth; d++) {
      const currentCellDate = new Date(year, month, d).getTime();

      let effectiveLmpMidnight = lmpMidnight;
      let effectiveCycleLength = cycleData.cycleLength;
      let isFuturePrediction = true;

      if (cycleLogs && cycleLogs.length > 0) {
        const parseLocalDate = (dateStr: string) => {
          const [y, m, d] = dateStr.split('-');
          return new Date(parseInt(y), parseInt(m) - 1, parseInt(d)).getTime();
        };

        const applicableLogIndex = cycleLogs.findIndex(log => parseLocalDate(log.start_date) <= currentCellDate);
        if (applicableLogIndex !== -1) {
          const applicableLog = cycleLogs[applicableLogIndex];
          effectiveLmpMidnight = parseLocalDate(applicableLog.start_date);

          if (applicableLogIndex > 0) {
            const nextLog = cycleLogs[applicableLogIndex - 1];
            const nextMidnight = parseLocalDate(nextLog.start_date);
            effectiveCycleLength = Math.max(21, Math.round((nextMidnight - effectiveLmpMidnight) / (1000 * 60 * 60 * 24)));
            isFuturePrediction = false;
          }
        } else {
          const earliestLog = cycleLogs[cycleLogs.length - 1];
          effectiveLmpMidnight = parseLocalDate(earliestLog.start_date);
        }
      }

      const diffMs = currentCellDate - effectiveLmpMidnight;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      let phaseClass = "text-on-surface/40 hover:bg-surface-container";

      let dayOfCycle = 1;
      if (diffDays >= 0) {
        if (!isFuturePrediction) {
          dayOfCycle = diffDays + 1;
        } else {
          dayOfCycle = (diffDays % effectiveCycleLength) + 1;
        }
      } else {
        const remainder = Math.abs(diffDays) % effectiveCycleLength;
        dayOfCycle = remainder === 0 ? 1 : effectiveCycleLength - remainder + 1;
      }

      const ovulationDay = effectiveCycleLength - 14;
      let phase = "follicular";
      if (dayOfCycle <= cycleData.periodDuration) phase = "menstrual";
      else if (dayOfCycle < ovulationDay) phase = "follicular";
      else if (dayOfCycle === ovulationDay || dayOfCycle === ovulationDay + 1) phase = "ovulation";
      else phase = "luteal";

      if (phase === "menstrual") phaseClass = "bg-red-100 rounded-2xl text-red-600 hover:bg-red-200";
      if (phase === "follicular") phaseClass = "bg-blue-100 rounded-2xl text-blue-600 hover:bg-blue-200";
      if (phase === "ovulation") phaseClass = "bg-emerald-100 rounded-2xl text-emerald-700 hover:bg-emerald-200";
      if (phase === "luteal") phaseClass = "bg-amber-100 rounded-2xl text-amber-700 hover:bg-amber-200";

      const isToday = today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;
      if (isToday) {
        phaseClass += " border-2 border-charcoal shadow-lg scale-110 z-10 relative";
      }

      const isPending = pendingLogDate?.getDate() === d && pendingLogDate?.getMonth() === month && pendingLogDate?.getFullYear() === year;
      if (isPending) {
        phaseClass += " ring-4 ring-primary/40 ring-offset-2 scale-110 z-20 relative font-bold";
      }

      calendarCells.push(
        <button
          key={`day-${d}`}
          onClick={() => handleDateClick(d)}
          className={`w-full h-10 md:h-14 flex items-center justify-center text-xs font-medium cursor-pointer transition-all hover:scale-105 ${phaseClass}`}
          title={`Set period start date to ${today.toLocaleString('default', { month: 'short' })} ${d}`}
        >
          {d}
        </button>
      );
    }

    return (
      <div className="grid grid-cols-7 gap-2 md:gap-4 mb-10">
        <div className="text-center text-[10px] font-bold text-on-surface/20 uppercase">M</div>
        <div className="text-center text-[10px] font-bold text-on-surface/20 uppercase">T</div>
        <div className="text-center text-[10px] font-bold text-on-surface/20 uppercase">W</div>
        <div className="text-center text-[10px] font-bold text-on-surface/20 uppercase">T</div>
        <div className="text-center text-[10px] font-bold text-on-surface/20 uppercase">F</div>
        <div className="text-center text-[10px] font-bold text-on-surface/20 uppercase">S</div>
        <div className="text-center text-[10px] font-bold text-on-surface/20 uppercase">S</div>
        {calendarCells}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto w-full h-full text-on-surface selection:bg-butter/30 selection:text-primary bg-surface-container-low font-sans">
      <main>
        {/* 1. HERO SECTION */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <section className="w-full bg-butter rounded-[40px] p-6 md:p-12 lg:p-24 text-center relative overflow-hidden mb-16 shadow-2xl">
            <div className="inline-flex items-center px-6 py-2 rounded-full border border-on-surface/10 bg-white/20 backdrop-blur-sm mb-12">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface">Mension Journal •</span>
            </div>
            <h1 className="font-serif text-4xl md:text-6xl lg:text-8xl leading-[1.1] mb-12 tracking-tight max-w-5xl mx-auto">
              Understand what's <span className="italic relative">really<span className="absolute -bottom-2 left-0 w-full h-3 bg-on-surface/10 rounded-full"></span></span> happening.
            </h1>
            <div className="flex flex-wrap justify-center items-center gap-3 text-lg md:text-xl font-medium text-on-surface/80 max-w-3xl mx-auto">
              <span>Paste a message that left you</span>
              <span className="px-3 py-1 rounded-lg bg-secondary-container text-on-surface text-sm font-bold">confused</span>
              <span>,</span>
              <span className="px-3 py-1 rounded-lg bg-hotpink-light text-white text-sm font-bold">anxious</span>
              <span>, or</span>
              <span className="px-3 py-1 rounded-lg bg-lavender text-on-surface text-sm font-bold">guilt</span>
              <span>. We'll align it with your body's cycle to find</span>
              <span className="px-3 py-1 rounded-lg bg-white border border-on-surface/10 text-on-surface text-sm font-bold shadow-sm">clarity</span>
              <span>.</span>
            </div>
          </section>
        </div>

        {/* 2. CORE ANALYZER */}
        <section id="analyzer-pro" className="py-8 md:py-16 lg:py-24">
          <div className="max-w-5xl mx-auto px-6 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-butter via-lavender to-hotpink rounded-[42px] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
            <div className="relative bg-white rounded-[40px] shadow-2xl overflow-hidden border border-lavender/10">
              <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
                <div className="lg:col-span-6 p-5 md:p-8 lg:p-12 space-y-10 border-r border-lavender/10">
                  <form onSubmit={handleAnalyze} className="space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-butter flex items-center justify-center text-xs font-bold text-primary shadow-sm">1</div>
                        <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-on-surface/60">Paste the Message</h3>
                      </div>
                      <div className="relative">
                        <textarea
                          id="message-input"
                          value={messageText}
                          onChange={(e) => { setMessageText(e.target.value); if (error) setError(""); }}
                          className="w-full h-48 p-6 rounded-3xl bg-surface-container-low border border-lavender/10 focus:border-lavender focus:ring-4 focus:ring-lavender/10 transition-all text-sm font-medium placeholder:text-on-surface/20 custom-scrollbar resize-none"
                          placeholder="'I think you're being a bit sensitive about this, don't you?'">
                        </textarea>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-lavender flex items-center justify-center text-xs font-bold text-secondary shadow-sm">2</div>
                        <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-on-surface/60">Identify Sender</h3>
                      </div>
                      <input
                        id="sender-input"
                        type="text"
                        value={senderLabel}
                        onChange={(e) => { setSenderLabel(e.target.value.toLowerCase().replace(/[^a-z0-9\s-]/g, "")); if (error) setError(""); }}
                        className="w-full px-8 py-4 rounded-full bg-surface-container-low border border-lavender/10 focus:border-lavender focus:ring-4 focus:ring-lavender/10 transition-all text-sm font-bold placeholder:font-normal placeholder:text-on-surface/30"
                        placeholder="e.g. Manager, Partner, Mother-in-law"
                      />
                    </div>
                    {error && (
                      <p className="text-xs text-red-500 font-bold flex items-center gap-1.5 mt-2">
                        {error}
                      </p>
                    )}
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isAnalyzing}
                        className="group/btn w-full py-6 rounded-full bg-charcoal text-white font-bold text-sm uppercase tracking-widest hover:bg-charcoal/90 transition-all shadow-xl flex items-center justify-center gap-3">
                        {isAnalyzing ? (
                          <><span className="material-symbols-outlined animate-spin">refresh</span> Processing...</>
                        ) : (
                          <><span className="material-symbols-outlined text-[20px]">auto_awesome</span> Analyze & Reveal Clarity</>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
                <div id="result-container" className="lg:col-span-6 relative bg-surface-bright flex flex-col">
                  {!analysisResult && !isAnalyzing ? (
                    <div id="result-empty" className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 space-y-8 text-center">
                      <div className="w-20 h-20 rounded-full bg-lavender/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-lavender text-4xl">psychology</span>
                      </div>
                      <h3 className="font-serif text-3xl font-bold">How the Analyzer Works</h3>
                      
                      <div className="bg-white/60 p-6 md:p-8 rounded-3xl border border-black/5 shadow-sm max-w-md text-left space-y-5">
                        <div className="flex gap-4 items-start">
                          <div className="w-8 h-8 shrink-0 rounded-full bg-butter flex items-center justify-center font-bold text-charcoal">1</div>
                          <p className="text-sm text-charcoal/80 pt-1"><strong>Paste the Message:</strong> Drop in any text, email, or DM that left you feeling confused, anxious, or hurt.</p>
                        </div>
                        <div className="flex gap-4 items-start">
                          <div className="w-8 h-8 shrink-0 rounded-full bg-lavender flex items-center justify-center font-bold text-charcoal">2</div>
                          <p className="text-sm text-charcoal/80 pt-1"><strong>Identify the Sender:</strong> Tell us who it's from (e.g., Boss, Boyfriend) to help Ova understand the dynamic.</p>
                        </div>
                        <div className="flex gap-4 items-start">
                          <div className="w-8 h-8 shrink-0 rounded-full bg-emerald-200 flex items-center justify-center font-bold text-charcoal">3</div>
                          <p className="text-sm text-charcoal/80 pt-1"><strong>Reveal Clarity:</strong> Ova will analyze the hidden subtext, validate your feelings, and give you objective clarity based on your current cycle phase.</p>
                        </div>
                      </div>
                      
                      <p className="text-xs text-on-surface/40 font-medium uppercase tracking-widest mt-4">Complete the steps on the left to begin</p>
                    </div>
                  ) : isAnalyzing ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-6 animate-pulse-slow">
                      <div className="w-20 h-20 rounded-full bg-lavender/20 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 border-4 border-t-lavender-dark border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                      </div>
                      <p className="text-sm font-semibold text-charcoal">Ova is reading between the lines...</p>
                    </div>
                  ) : (
                    <div id="result-active" className="flex-1 flex flex-col p-5 md:p-8 lg:p-12 animate-fade-in">
                      <div className="flex justify-between items-center mb-10">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-butter p-0.5 border-2 border-white shadow-sm overflow-hidden">
                            <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAY3gp7Eryh8Lm6GR2x0xk1I2M0fWzCkVIw9SSS1IavhclnIfOSN01xcLjRwYxD3vvg38WCUb-O3aCBfuM4FszJRXDVzkt1XYk4h3mZjobn7s3gmJvbonFqoegxzVqvXNrzy0rqInLGGg1RulpV8ue95Rah_0etCS8SWgfeF510gOHBlV7ntqb80s-1BTZZvMi1wszWCZ-miFo3ywvUTHrnRejY5oNCdEr5aFPmj49d1sbefxu6Sb6mf3c2-DvxqIzmIE69qbSpyZI" alt="Ova" />
                          </div>
                          <h4 className="text-xs font-bold uppercase tracking-widest">Ova's Analysis</h4>
                        </div>
                        <button
                          onClick={() => { setMessageText(""); setSenderLabel(""); setAnalysisResult(null); setIsCurrentMessageToxic(false); }}
                          className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center transition-colors text-on-surface/20">
                          <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                      </div>
                      <div id="analysis-content" className="flex-1 space-y-8 overflow-y-auto custom-scrollbar">
                        <div className="space-y-6 text-on-surface/80 leading-relaxed font-sans text-sm whitespace-pre-wrap">
                          {analysisResult?.split("\n\n").map((paragraph: string, index: number) => {
                            if (paragraph.startsWith("###")) {
                              return <h3 key={index} className="font-serif text-2xl font-bold text-on-surface">{paragraph.replace("### ", "")}</h3>;
                            }
                            if (paragraph.startsWith("####")) {
                              return <h4 key={index} className="text-[10px] uppercase tracking-[0.2em] font-bold text-hotpink">{paragraph.replace("#### ", "")}</h4>;
                            }
                            return <p key={index}>{paragraph}</p>;
                          })}
                        </div>
                        <button
                          onClick={handleSaveAnalysis}
                          className="w-full bg-butter hover:bg-butter-dark text-charcoal font-bold py-3.5 rounded-full transition-all shadow-md text-sm mt-8">
                          Save to Reflection Log
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SAVED ANALYSES & PATTERNS GRID */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
              <ReflectionHistory
                analyses={savedAnalyses}
                onDelete={handleDeleteAnalysis}
                onView={handleViewAnalysis}
              />
              <PatternMemory
                savedAnalyses={savedAnalyses}
                session={session}
              />
            </div>
            
            <div className="relative z-[100] mt-16 pointer-events-auto">
              <FeedbackBanner />
            </div>

          </div>
        </section>

        {/* 3. THE SCIENCE OF SUBTEXT */}
        <section id="science" className="py-8 md:py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20 space-y-4">
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-lavender/30 text-secondary text-[10px] font-bold uppercase tracking-[0.2em]">The Neuro-Endocrinology</div>
              <h2 className="font-serif text-4xl md:text-6xl tracking-tight">The Science of Subtext</h2>
              <p className="text-on-surface/60 max-w-2xl mx-auto text-lg leading-relaxed">How your hormonal architecture alters your perception of interpersonal friction.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-8 rounded-[32px] border border-lavender/20 shadow-sm hover:shadow-xl transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-hotpink/10 flex items-center justify-center text-hotpink mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">neurology</span>
                </div>
                <h4 className="font-bold text-sm uppercase tracking-widest mb-3">Neurochemical Sensitivity</h4>
                <p className="text-xs text-on-surface/60 leading-relaxed">Fluctuating progesterone alters the amygdala's threat-detection threshold, making passive aggression feel 3x more intense.</p>
              </div>
              <div className="bg-white p-8 rounded-[32px] border border-lavender/20 shadow-sm hover:shadow-xl transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-butter/20 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">psychiatry</span>
                </div>
                <h4 className="font-bold text-sm uppercase tracking-widest mb-3">Pattern Recognition</h4>
                <p className="text-xs text-on-surface/60 leading-relaxed">Our LLM matches linguistic patterns with your current hormonal phase to decode true intent from "surface" language.</p>
              </div>
              <div className="bg-white p-8 rounded-[32px] border border-lavender/20 shadow-sm hover:shadow-xl transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-secondary-container flex items-center justify-center text-secondary mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">directions_run</span>
                </div>
                <h4 className="font-bold text-sm uppercase tracking-widest mb-3">Safe Exit Paths</h4>
                <p className="text-xs text-on-surface/60 leading-relaxed">We provide biologically-aligned scripts that de-escalate conflict without sacrificing your personal boundaries.</p>
              </div>
              <div className="bg-white p-8 rounded-[32px] border border-lavender/20 shadow-sm hover:shadow-xl transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-success-green/20 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">eco</span>
                </div>
                <h4 className="font-bold text-sm uppercase tracking-widest mb-3">Biological Nourishment</h4>
                <p className="text-xs text-on-surface/60 leading-relaxed">Specific micronutrient pairings that stabilize glucose levels to reduce cortisol spikes during difficult conversations.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. BIO-REALTIME & CYCLE */}
        <section id="cycle-suite" className="py-8 md:py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row gap-12">
              <div className="flex-1 bg-surface-container-low rounded-[40px] p-5 md:p-8 lg:p-12 border border-lavender/20 shadow-lg">
                <div className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-4">
                    <div>
                      <h2 className="font-serif text-3xl font-bold">Your Cycle</h2>
                      <div className="flex items-center gap-3 mt-1">
                        <button onClick={handlePrevMonth} className="p-1 hover:bg-black/5 rounded-full text-on-surface/50 hover:text-on-surface"><ChevronLeft className="w-4 h-4" /></button>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface/40 min-w-[100px] text-center">
                          {calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </p>
                        <button onClick={handleNextMonth} className="p-1 hover:bg-black/5 rounded-full text-on-surface/50 hover:text-on-surface"><ChevronRight className="w-4 h-4" /></button>
                      </div>
                    </div>
                    {cycleState && (
                      <button
                        onClick={() => setIsEditingCycle(!isEditingCycle)}
                        className="px-4 py-2 flex items-center gap-2 rounded-full hover:bg-white/80 transition-colors bg-white border border-lavender/30 shadow-sm cursor-pointer"
                        title={isEditingCycle ? "Cancel Edit" : "Edit Logs"}
                      >
                        <span className="material-symbols-outlined text-[16px] text-on-surface">{isEditingCycle ? "close" : "edit"}</span>
                        <span className="text-xs font-bold uppercase tracking-wider text-charcoal">{isEditingCycle ? "Close" : "Edit Logs"}</span>
                      </button>
                    )}
                  </div>
                  {cycleState ? (
                    <div className="px-4 py-2 rounded-full bg-[#FF3366] text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-[#FF3366]/20">
                      {cycleState.daysUntilNextPeriod >= 0
                        ? `${cycleState.daysUntilNextPeriod} Days until bleed`
                        : `${Math.abs(cycleState.daysUntilNextPeriod)} Days late`}
                    </div>
                  ) : (
                    <button onClick={handleSetupCycle} className="px-6 py-2 bg-butter text-charcoal rounded-full font-bold uppercase tracking-widest text-[10px] cursor-pointer hover:scale-105 transition-transform">
                      Setup Cycle
                    </button>
                  )}
                </div>

                {cycleState && (
                  <>
                    {!isEditingCycle ? renderPhaser() : (
                      <>
                        {renderCalendar()}
                        <div className="grid grid-cols-4 gap-2 mb-6">
                          <div className="p-3 rounded-2xl bg-red-50 text-center"><div className="w-2 h-2 rounded-full bg-red-400 mx-auto mb-1"></div><p className="text-[8px] font-bold uppercase tracking-wider text-red-600">Menstrual</p></div>
                          <div className="p-3 rounded-2xl bg-blue-50 text-center"><div className="w-2 h-2 rounded-full bg-blue-400 mx-auto mb-1"></div><p className="text-[8px] font-bold uppercase tracking-wider text-blue-600">Follicular</p></div>
                          <div className="p-3 rounded-2xl bg-emerald-50 text-center"><div className="w-2 h-2 rounded-full bg-emerald-400 mx-auto mb-1"></div><p className="text-[8px] font-bold uppercase tracking-wider text-emerald-700">Ovulation</p></div>
                          <div className="p-3 rounded-2xl bg-amber-50 text-center"><div className="w-2 h-2 rounded-full bg-amber-400 mx-auto mb-1"></div><p className="text-[8px] font-bold uppercase tracking-wider text-amber-700">Luteal</p></div>
                        </div>

                        {pendingLogDate && (
                          <div className="mt-6 pt-4 border-t border-lavender/30 animate-fade-in">
                            <button
                              onClick={handleSaveDate}
                              className="w-full py-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-bold hover:bg-primary/20 transition-colors shadow-sm flex justify-center items-center gap-2"
                            >
                              <span>Save Log:</span>
                              <span className="text-charcoal">{pendingLogDate.toLocaleDateString()}</span>
                            </button>
                          </div>
                        )}
                      </>
                    )}

                    {cycleIrregularity && (
                      <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex gap-4 items-start">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-bold text-red-900 mb-1">Cycle Irregularity Detected</h4>
                          <p className="text-xs text-red-700 leading-relaxed mb-3">
                            {cycleIrregularity === 'long_cycles' && "We've noticed your cycles are consistently longer than 38 days. While this can be normal for some, it's a good idea to track these patterns closely."}
                            {cycleIrregularity === 'short_cycles' && "Your cycles appear to be shorter than 21 days. This frequent cycling can affect your energy and nutrient stores."}
                            {cycleIrregularity === 'highly_variable' && "There's significant variation in your cycle lengths (more than 10 days difference between cycles). This unpredictability can make tracking difficult."}
                          </p>
                          <div className="flex gap-3">
                            <button className="text-xs font-bold text-red-600 hover:text-red-800 bg-red-100 px-3 py-1.5 rounded-full transition-colors">Chat with Ova</button>
                            <button className="text-xs font-bold text-red-600 hover:text-red-800 bg-red-100 px-3 py-1.5 rounded-full transition-colors">Consult Gynae Guide</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="lg:w-1/3 space-y-8">
                <div className="bg-white rounded-[40px] p-8 shadow-xl border border-lavender/20">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-serif text-2xl font-bold">Bio-Realtime</h3>
                  </div>
                  {cycleState && phaseVisual && (
                    <>
                      <div className="space-y-6">
                        {phaseVisual.insights?.map((insight: any, idx: number) => (
                          <div key={idx} className="space-y-2">
                            <div className="flex justify-between items-end">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface/80">{insight.title}</span>
                              <span className="text-xs font-serif italic text-on-surface/80 font-bold">{insight.value}%</span>
                            </div>
                            <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
                              <div className={`h-full ${insight.color} transition-all duration-1000`} style={{ width: `${insight.value}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-8 border-t border-lavender/10 mt-8 space-y-6">
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-on-surface/60">
                          <span>Pregnancy Chance</span>
                          <span className={phaseVisual.pregnancyChance.includes("High") ? "text-emerald-500" : "text-on-surface/80"}>
                            {phaseVisual.pregnancyChance}
                          </span>
                        </div>
                        <div className={`p-6 rounded-[32px] border ${phaseVisual.accentBg} bg-opacity-10 space-y-4`}>
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-inherit">Current Phase: {currentPhaseNormalized}</h4>
                          <p className="text-xs leading-relaxed font-medium">
                            {phaseVisual.mensionTip}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Symptom Tracker Card */}
                {cycleState && phaseVisual && (
                  <div className="bg-white rounded-[40px] p-8 shadow-xl border border-lavender/20">
                    <div className="flex flex-col mb-6">
                      <h3 className="font-serif text-2xl font-bold uppercase tracking-tight">How do you feel today?</h3>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface/40 mt-1 flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-500" /> Saved locally
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {phaseVisual.symptoms?.map((symptom: string, idx: number) => {
                        const isSelected = selectedSymptoms.includes(symptom);
                        return (
                          <button
                            key={idx}
                            onClick={() => toggleSymptom(symptom)}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${isSelected
                              ? 'bg-charcoal text-white shadow-md scale-105'
                              : 'bg-surface-container hover:bg-lavender/40 text-on-surface/70'
                              }`}
                          >
                            {symptom}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 5. RHYTHM OF RESILIENCE */}
        <section className="py-8 md:py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-white rounded-[60px] p-6 md:p-6 md:p-10 lg:p-16 shadow-2xl border border-lavender/20">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
                <div>
                  <h2 className="font-serif text-4xl font-bold">Rhythm of Resilience</h2>
                  <p className="text-lg text-on-surface/40">Correlating biological capacity with communication subtext</p>
                </div>
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-hotpink"></div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Emotional Capacity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-lavender"></div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Subtext Friction</span>
                  </div>
                </div>
              </div>
              <div className="relative h-[300px] w-full">
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 300">
                  <path d="M 0 50 C 150 20, 300 150, 500 100 S 850 280, 1000 280" fill="none" stroke="#FF3366" strokeLinecap="round" strokeWidth="6"></path>
                  <path d="M 0 250 C 100 240, 400 50, 500 80 S 700 30, 1000 20" fill="none" stroke="#DED7FC" strokeDasharray="8 8" strokeLinecap="round" strokeWidth="4"></path>
                  <circle className="chart-pulse" cx="150" cy="30" fill="#FF3366" r="8"></circle>
                  <circle className="chart-pulse" cx="500" cy="100" fill="#FF3366" r="8"></circle>
                  <circle className="chart-pulse" cx="850" cy="275" fill="#FF3366" r="8"></circle>
                </svg>
                <div className="flex justify-between mt-8">
                  <div className="text-[10px] font-bold text-on-surface/20 uppercase">Day 1</div>
                  <div className="text-[10px] font-bold text-on-surface/20 uppercase">Day 14 (Peak)</div>
                  <div className="text-[10px] font-bold text-hotpink uppercase">Day 28 (Critical)</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. REAL CLARITY FOR REAL PEOPLE */}
        <section className="py-8 md:py-16 lg:py-24">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16 space-y-4">
              <h2 className="font-serif text-4xl font-bold">Real Clarity for Real People</h2>
              <div className="w-20 h-1 bg-hotpink/20 mx-auto rounded-full"></div>
            </div>
            <div className="space-y-8">
              <div className="bg-surface-container-low p-6 md:p-10 rounded-[48px] border border-lavender/20 flex flex-col md:flex-row gap-6 md:p-10 items-center">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl flex-shrink-0">
                  <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAokSb8daD9GWcAC_boR8sA4SqcBsNio6Mt308OfBKfu7ARUKWgAO2K603IQ5VcEPpaTNb1nMsquF-L-AjaHyMN5hpaAxhOOaXhRYwVASO2I4S58wgi8As-R5C0QeiwuflVpFUTUDPifEElYKNrKtpNtpPb6YhU1WQFumHv83XxOZT_WSKA353i3g5sozfI4ZodMLMdB4GwxFCdLKryEc2nL5bs6Non6Bpb2c-jy816QAysYQ_s-LOHAyI-qdVtLnlBs9XrG3zYnwQ" />
                </div>
                <div className="space-y-4">
                  <p className="text-2xl font-serif italic text-on-surface/80 leading-relaxed">"I used to think I was just 'bad at boundaries' during certain weeks. Mension showed me it was actually my body's heightened sensitivity. Now I wait to reply until Ova helps me see the subtext clearly."</p>
                  <div>
                    <h5 className="font-bold text-sm uppercase tracking-widest"></h5>
                    <p className="text-[10px] text-on-surface/40 font-bold">Product Manager •</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 md:p-10 rounded-[48px] border border-lavender/20 flex flex-col md:flex-row-reverse gap-6 md:p-10 items-center">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl flex-shrink-0">
                  <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAY3gp7Eryh8Lm6GR2x0xk1I2M0fWzCkVIw9SSS1IavhclnIfOSN01xcLjRwYxD3vvg38WCUb-O3aCBfuM4FszJRXDVzkt1XYk4h3mZjobn7s3gmJvbonFqoegxzVqvXNrzy0rqInLGGg1RulpV8ue95Rah_0etCS8SWgfeF510gOHBlV7ntqb80s-1BTZZvMi1wszWCZ-miFo3ywvUTHrnRejY5oNCdEr5aFPmj49d1sbefxu6Sb6mf3c2-DvxqIzmIE69qbSpyZI" />
                </div>
                <div className="space-y-4 md:text-right">
                  <p className="text-2xl font-serif italic text-on-surface/80 leading-relaxed">"Decoding the hidden aggression in professional feedback changed my career. Instead of reacting defensively, I lead with biological data and linguistic clarity."</p>
                  <div>
                    <h5 className="font-bold text-sm uppercase tracking-widest"></h5>
                    <p className="text-[10px] text-on-surface/40 font-bold">Creative Director •</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. HOW IT WORKS */}
        <section className="py-8 md:py-16 lg:py-24">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="font-serif text-5xl font-bold">How It Works</h2>
            </div>
            <div className="space-y-16">
              <div className="relative pl-16 step-line">
                <div className="absolute left-0 top-0 w-12 h-12 rounded-full bg-butter flex items-center justify-center font-bold text-primary shadow-lg z-10">1</div>
                <h3 className="font-serif text-2xl font-bold mb-2">Log the Friction</h3>
                <p className="text-on-surface/60">Paste text from any conversation that felt "off" or caused anxiety.</p>
              </div>
              <div className="relative pl-16 step-line">
                <div className="absolute left-0 top-0 w-12 h-12 rounded-full bg-lavender flex items-center justify-center font-bold text-secondary shadow-lg z-10">2</div>
                <h3 className="font-serif text-2xl font-bold mb-2">Analyze with Ova</h3>
                <p className="text-on-surface/60">Our empathy-first AI scans for linguistic markers, power dynamics, and emotional manipulation.</p>
              </div>
              <div className="relative pl-16 step-line">
                <div className="absolute left-0 top-0 w-12 h-12 rounded-full bg-hotpink text-white flex items-center justify-center font-bold shadow-lg z-10">3</div>
                <h3 className="font-serif text-2xl font-bold mb-2">Align with Biology</h3>
                <p className="text-on-surface/60">We overlay the analysis with your real-time hormonal data to filter out biological sensitivity.</p>
              </div>
              <div className="relative pl-16 step-line-last">
                <div className="absolute left-0 top-0 w-12 h-12 rounded-full bg-charcoal text-white flex items-center justify-center font-bold shadow-lg z-10">4</div>
                <h3 className="font-serif text-2xl font-bold mb-2">Thrive &amp; Respond</h3>
                <p className="text-on-surface/60">Receive a custom action plan: a response script, a self-regulation tool, or a nourishment tip.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 8. NOURISHMENT GUIDE (CRAVE PANTRY) */}
        <section className="py-8 md:py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="font-serif text-4xl font-bold">The Crave Pantry</h2>
              <p className="text-on-surface/40 mt-2 mb-6 uppercase text-[10px] tracking-widest font-bold">Premium Biological Nourishment</p>
              <button
                onClick={() => setActiveTab("crave-pantry")}
                className="inline-flex items-center gap-2 px-8 py-3 bg-charcoal text-white rounded-full text-sm font-bold shadow-lg hover:bg-black hover:scale-105 transition-all duration-300"
              >
                Enter the Pantry <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 cursor-pointer" onClick={() => setActiveTab("crave-pantry")}>
              <div className="group relative overflow-hidden rounded-[40px] aspect-[4/5] bg-surface-container shadow-xl">
                <img alt="Avocado" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHZ85hvcIqGQQt72RqOKKtm6NTYb07PQCihr3kJTUKWS0HKny_R9QcCvCTxPgWy3IMQdW1IBG0ZY5RaW_4ibK7JcZuEeEEs4iqUcfkcizxjK3ejW9FWOgWw9U6EXlHK7YW3PnnvmokBcrOClaPopUdov669Bf9s8G6ilaH2GkwJfEO2ZZEw3lVSToI2n-NFXP6-BvyeDcpPiTrufzmSZwk6EsUzdJ3CJ8GGFMTIC6EK2bRkuvaGmmfSsVhOxc5UJ1A1qkgZuG6c2Y" />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent flex flex-col justify-end p-8">
                  <span className="text-butter text-[10px] font-bold uppercase tracking-widest mb-2">Luteal Stabilization</span>
                  <h4 className="text-white font-serif text-2xl">Healthy Fats</h4>
                  <p className="text-white/70 text-xs mt-2">Magnesium-rich sources to curb cortisol and stabilize mood shifts.</p>
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-[40px] aspect-[4/5] bg-surface-container shadow-xl">
                <img alt="Berries" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdBLaqjd_nKhDOvd55pXr5vNTj_lLOJwageuLYBtwAJ9psGsWt59j-g9Wxz32tCYUylU2sQE_BiXqvfMDMi6XJZq38q8kze15VmuzHXaU4A998MIGhya93J8_Ra-QK4-xxNZwu4ZGCArV_E8dgGottW85Xk4EEf4FMzx03fw9NyUCTknVXeqOODTEEQCB5sha4H-kXMPUbGXI7BH3MlJHg-6glOmh9IDanW3WkV8h9UHvP8JllH6yUQCaSlkUQE_IeVqlYFFovLH8" />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent flex flex-col justify-end p-8">
                  <span className="text-lavender text-[10px] font-bold uppercase tracking-widest mb-2">Follicular Energy</span>
                  <h4 className="text-white font-serif text-2xl">Antioxidant Mix</h4>
                  <p className="text-white/70 text-xs mt-2">Fueling social confidence with low-glycemic fruit pairings.</p>
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-[40px] aspect-[4/5] bg-surface-container shadow-xl">
                <img alt="Tea" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDeh2PG56WMKmyi3OyUUeYdxshAmQlB1loljTkulSt2fXfx6FwF28l4D7WvrRuybV1L8XUt_c4zz9Yhb_ql97lmhEQJ_6zuAxjam_TGvSpsDOKaltDAN3klQTpTC1DaF5UyhH-oJHpm6xFVT0LlbDdVIw1EzB6cI_fWk-sLoqahWeVzM9EqRqFhOn-Rk5IAhdX8Wa1OSOGm0wtTOJi4Z1wfE0RrUWoUYQEgEpMHzj5e_hu6m70gPtOGwavIS9bbzyoHA1cc-RA8Ih0" />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent flex flex-col justify-end p-8">
                  <span className="text-hotpink-light text-[10px] font-bold uppercase tracking-widest mb-2">Ovulation Calm</span>
                  <h4 className="text-white font-serif text-2xl">Herbal Rituals</h4>
                  <p className="text-white/70 text-xs mt-2">Adaptogenic blends to manage peak energy and maintain focus.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 9. THE VISION */}
        <section className="py-8 md:py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-12 py-16 bg-butter rounded-[60px] grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/30 text-primary text-[10px] font-bold uppercase tracking-[0.2em]">The Vision</div>
              <h2 className="font-serif text-5xl md:text-7xl leading-[1.1] tracking-tight">Your brain is literally <span className="italic">rewiring</span> every week.</h2>
              <p className="text-xl text-on-surface/70 leading-relaxed max-w-xl">
                Mension isn't just a tracker. It's a bio-empathy layer for the modern world. We are building the future where biology and communication live in harmony.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button className="px-10 py-5 bg-charcoal text-white rounded-full font-bold uppercase tracking-widest text-sm hover:bg-charcoal/90 transition-all shadow-xl w-full sm:w-auto">
                  Join the Waitlist
                </button>
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSdGvCgHJrFmfKmYk1wcrFRhMiKV_P4cWTeV-zZ_3L6rgG9d-w/viewform"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open("https://docs.google.com/forms/d/e/1FAIpQLSdGvCgHJrFmfKmYk1wcrFRhMiKV_P4cWTeV-zZ_3L6rgG9d-w/viewform", "_blank");
                  }}
                  className="px-10 py-5 bg-white text-charcoal border-2 border-charcoal rounded-full font-bold uppercase tracking-widest text-sm hover:bg-charcoal/5 transition-all shadow-lg w-full sm:w-auto text-center flex items-center justify-center gap-2"
                >
                  <Heart className="w-4 h-4 text-hotpink" />
                  Leave a Review
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-10 bg-white/40 blur-3xl rounded-full"></div>
              <div className="relative z-10 rounded-[60px] overflow-hidden shadow-2xl border-4 border-white bg-white p-4">
                <InteractivePortrait />
                <div className="absolute bottom-12 left-12 right-12 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-lavender/30 shadow-lg animate-float">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="material-symbols-outlined text-hotpink text-xl">security_update_good</span>
                    <span className="font-bold text-[10px] uppercase tracking-widest text-on-surface">
                      Safety Tip • {cycleState ? `Day ${cycleState.currentDay}` : 'Day 24'}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-on-surface/80">"Wait 2 hours before replying. Your cortisol is spiking—protect your peace."</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 10. DEEP FOOTER */}
        <footer className="bg-[#A8005A] text-white pt-32 pb-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
              <div className="col-span-1 md:col-span-2 space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-hotpink font-bold text-3xl">bubble_chart</span>
                  </div>
                  <span className="font-serif text-4xl font-bold tracking-tight">Mension</span>
                </div>
                <p className="text-white/90 text-xl max-w-sm leading-relaxed font-serif italic">
                  "Helping you find clarity in the noise, one biological cycle at a time."
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20">
                    <span className="material-symbols-outlined text-white text-lg">verified_user</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Privacy Protected</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20">
                    <span className="material-symbols-outlined text-white text-lg">lock</span>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/60">Product</h4>
                <ul className="space-y-4 text-sm font-medium">
                  <li><a className="hover:text-butter transition-colors" href="#">Analyzer Pro</a></li>
                  <li><a className="hover:text-butter transition-colors" href="#">Cycle Suite</a></li>
                  <li><a className="hover:text-butter transition-colors" href="#">Methodology</a></li>
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/60">Company</h4>
                <ul className="space-y-4 text-sm font-medium">
                  <li><a className="hover:text-butter transition-colors" href="#">Science</a></li>
                  <li><a className="hover:text-butter transition-colors" href="#">Privacy Policy</a></li>
                  <li><a className="hover:text-butter transition-colors" href="#">Contact</a></li>
                </ul>
              </div>
            </div>
            <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/50">© 2026 Mension • Built for biological clarity</p>
              <div className="flex gap-6 text-white/50">
                <span className="material-symbols-outlined cursor-pointer hover:text-white transition-colors">brand_awareness</span>
                <span className="material-symbols-outlined cursor-pointer hover:text-white transition-colors">social_leaderboard</span>
                <span className="material-symbols-outlined cursor-pointer hover:text-white transition-colors">language</span>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
