"use client";

import React, { useState } from "react";
import { Activity, ShieldCheck, Flower, AlertCircle } from "lucide-react";

interface MessageAnalyzerProps {
  cyclePhase: string;
  cycleDay: number | null;
  cyclePhaseName: string | null;
  session?: any;
  onSave: (analysis: { message: string; phase: string; result: string; sender_label: string }) => void;
  onToxicDetected: () => void;
}

export default function MessageAnalyzer({ cyclePhase, cycleDay, cyclePhaseName, session, onSave, onToxicDetected }: MessageAnalyzerProps) {
  const [messageText, setMessageText] = useState("");
  const [senderLabel, setSenderLabel] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isCurrentMessageToxic, setIsCurrentMessageToxic] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) { setError("Please paste the message you received first."); return; }
    if (!senderLabel.trim()) { setError("Please provide a sender label (e.g. boyfriend, boss, roommate)."); return; }

    setError("");
    setIsAnalyzing(true);
    setAnalysisResult(null);

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }

    fetch("/api/analyze", {
      method: "POST",
      headers,
      body: JSON.stringify({ text: messageText.trim(), cycle_phase: cyclePhase })
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

  const handleSave = () => {
    if (!analysisResult) return;
    onSave({
      message: messageText,
      phase: cyclePhase,
      result: analysisResult,
      sender_label: senderLabel.trim().toLowerCase(),
    });
    setMessageText("");
    setSenderLabel("");
    setAnalysisResult(null);
    setIsCurrentMessageToxic(false);
  };

  const handleClear = () => {
    setMessageText("");
    setSenderLabel("");
    setAnalysisResult(null);
    setIsCurrentMessageToxic(false);
  };

  const renderText = (text: string) => {
    return text.split("\n\n").map((paragraph, index) => {
      if (paragraph.startsWith("###")) {
        return <h4 key={index} className="font-dm-sans font-bold text-base text-charcoal pt-2">{paragraph.replace("### ", "")}</h4>;
      }
      if (paragraph.startsWith("####")) {
        return <h5 key={index} className="font-dm-sans font-bold text-sm text-charcoal/90 uppercase tracking-wide pt-1">{paragraph.replace("#### ", "")}</h5>;
      }
      return <p key={index} className="text-charcoal/85">{paragraph}</p>;
    });
  };

  return (
    <div className="glass-panel rounded-3xl p-6 border-lavender bg-white/60 space-y-6">
      <form onSubmit={handleAnalyze} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="message-pasted" className="block text-[10px] font-bold text-charcoal uppercase tracking-wider">
            1) Paste the message that made you feel weird:
          </label>
          <textarea id="message-pasted" rows={4} value={messageText}
            onChange={(e) => { setMessageText(e.target.value); if (error) setError(""); }}
            placeholder="Examples: 'If you actually cared about us, you wouldn't go out tonight'..."
            className="w-full rounded-3xl border border-lavender p-4 text-sm focus:outline-none focus:ring-2 focus:ring-lavender-dark focus:border-transparent bg-white/70 text-charcoal placeholder-warm-gray/40 font-normal leading-relaxed"
            disabled={isAnalyzing} />
        </div>

        <div className="space-y-2">
          <label htmlFor="sender-label" className="block text-[10px] font-bold text-charcoal uppercase tracking-wider">
            2) Who sent this message? (e.g. boyfriend, boss, ex — no real names):
          </label>
          <input id="sender-label" type="text" value={senderLabel}
            onChange={(e) => { setSenderLabel(e.target.value.toLowerCase().replace(/[^a-z0-9\s-]/g, "")); if (error) setError(""); }}
            placeholder="e.g. boyfriend, boss, ex, sister"
            className="w-full rounded-3xl border border-lavender p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-lavender-dark focus:border-transparent bg-white/70 text-charcoal placeholder-warm-gray/45 font-semibold"
            disabled={isAnalyzing} />
        </div>

        {error && (
          <p className="text-xs text-red-500 font-bold flex items-center gap-1.5 mt-2">
            <AlertCircle className="w-4 h-4 text-red-500 animate-pulse" />{error}
          </p>
        )}

        {!isAnalyzing && !analysisResult && (
          <div className="space-y-3">
            <button type="submit"
              className="w-full bg-butter hover:bg-butter-dark text-charcoal border border-butter-dark/50 font-bold py-3.5 rounded-3xl transition-all-300 shadow-md flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 cursor-pointer">
              <Activity className="w-4.5 h-4.5 text-charcoal" /><span>Analyze Message & Sensitivity</span>
            </button>
            <p className="text-[10px] text-center text-warm-gray font-semibold">
              Ova will analyze this message factoring in your current <strong>{cyclePhaseName || cyclePhase}</strong>.
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
            <p className="text-xs text-warm-gray mt-1 font-medium">Factoring in your cycle day {cycleDay} ({cyclePhase} phase)...</p>
          </div>
        </div>
      )}

      {/* Analysis Result */}
      {analysisResult && (
        <div className="animate-fade-in border border-lavender/80 bg-white rounded-3xl p-6 space-y-5 shadow-md shadow-lavender/10 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-butter/25 rounded-full blur-xl"></div>
          <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-lavender/25 rounded-full blur-xl"></div>

          <div className="flex items-center justify-between border-b border-lavender/40 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-base">📝</span>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-100 uppercase tracking-wide">Ova's Analysis</span>
            </div>
            <span className="text-[10px] text-warm-gray font-bold uppercase tracking-wider bg-lavender-light border border-lavender/50 px-2.5 py-0.5 rounded-full">
              From: {senderLabel} • Day {cycleDay}
            </span>
          </div>

          <div className="text-sm text-charcoal/90 leading-relaxed space-y-4 font-normal whitespace-pre-wrap">
            {renderText(analysisResult)}
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <div className="flex gap-3">
              <button onClick={handleSave}
                className="flex-1 bg-butter hover:bg-butter-dark text-charcoal border border-butter-dark/50 font-bold py-2.5 rounded-2xl transition-all-300 text-xs flex items-center justify-center gap-2 hover:scale-102 shadow-sm cursor-pointer">
                <ShieldCheck className="w-4 h-4 text-charcoal" /><span>Save to Reflection Log</span>
              </button>
              <button onClick={handleClear}
                className="px-4 py-2.5 border border-lavender/80 bg-white hover:bg-lavender-light/35 rounded-2xl text-xs font-bold text-warm-gray hover:text-charcoal transition-all-300 cursor-pointer">
                Clear
              </button>
            </div>
            {isCurrentMessageToxic && (
              <button onClick={onToxicDetected}
                className="w-full mt-2 py-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold rounded-2xl transition-all shadow-sm text-sm">
                Need help getting out? 💜
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}