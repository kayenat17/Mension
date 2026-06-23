"use client";

import React, { useState } from "react";
import { Sparkles, Eye, RefreshCw } from "lucide-react";
import type { SavedAnalysis } from "./types";

interface PatternMemoryProps {
  savedAnalyses: SavedAnalysis[];
  session?: any;
}

export default function PatternMemory({ savedAnalyses, session }: PatternMemoryProps) {
  const [patternSummaries, setPatternSummaries] = useState<Record<string, string>>({});
  const [loadingPatterns, setLoadingPatterns] = useState<Record<string, boolean>>({});

  // Group by sender label
  const senderGroups = savedAnalyses.reduce((groups: Record<string, SavedAnalysis[]>, item) => {
    const sender = (item.sender_label || "unknown").trim().toLowerCase();
    if (!groups[sender]) groups[sender] = [];
    groups[sender].push(item);
    return groups;
  }, {});

  const patternSenders = Object.keys(senderGroups).filter(sender => senderGroups[sender].length >= 5);

  const handleRevealPatterns = (sender: string) => {
    const group = senderGroups[sender];
    const msgs = group.map(i => i.message);
    const results = group.map(i => i.result);

    setLoadingPatterns(prev => ({ ...prev, [sender]: true }));

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }

    fetch("/api/patterns", {
      method: "POST",
      headers,
      body: JSON.stringify({ sender_label: sender, messages: msgs, results })
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Server pattern synthesis failed");
        }
        return res.json();
      })
      .then((data) => {
        setPatternSummaries(prev => ({ ...prev, [sender]: data.response }));
        setLoadingPatterns(prev => ({ ...prev, [sender]: false }));
      })
      .catch((err: any) => {
        console.error("API Patterns Error:", err);
        setPatternSummaries(prev => ({ ...prev, [sender]: "Something went wrong — try again in a moment 💜" }));
        setLoadingPatterns(prev => ({ ...prev, [sender]: false }));
      });
  };

  if (patternSenders.length === 0) {
    return (
      <section className="space-y-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-amber-500 animate-float" />
          <h3 className="font-dm-sans font-bold text-base text-charcoal">Pattern Memory</h3>
        </div>
        <div className="glass-panel rounded-3xl p-5 text-center border-lavender bg-white/40 text-[11px] text-warm-gray leading-normal font-medium animate-fade-in">
          🌻 Ova's tip: Analyze 5+ messages from the same sender label (like "boyfriend" or "boss") to unlock pattern recognition over time.
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center space-x-2">
        <Sparkles className="w-5 h-5 text-amber-500 animate-float" />
        <h3 className="font-dm-sans font-bold text-base text-charcoal">Pattern Memory</h3>
      </div>

      <div className="space-y-4">
        {patternSenders.map(sender => {
          const count = senderGroups[sender].length;
          const patternText = patternSummaries[sender];
          const isLoading = !!loadingPatterns[sender];

          return (
            <div key={sender} className="glass-panel-yellow rounded-3xl p-5 border-butter space-y-3 animate-bloom">
              <h4 className="font-dm-sans font-bold text-xs text-charcoal/90 flex items-center gap-1.5 uppercase tracking-wide">
                <span>🛡️</span><span>Pattern Card: {sender}</span>
              </h4>
              <p className="text-xs text-charcoal/80 leading-normal">
                You've shared {count} messages from <strong>{sender}</strong>. Here's what we've noticed over time:
              </p>

              {patternText ? (
                <div className="text-xs text-charcoal/95 leading-relaxed bg-white/80 p-3.5 rounded-2xl border border-butter-dark/50 whitespace-pre-wrap font-medium">
                  {patternText.split("\n\n").map((p, idx) => {
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
                <button onClick={() => handleRevealPatterns(sender)}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 bg-white hover:bg-butter-light border border-butter-dark/60 rounded-2xl text-[10px] font-bold text-charcoal transition-all-300 hover:scale-101 cursor-pointer">
                  <Eye className="w-3.5 h-3.5" /><span>Reveal Behavioral Analysis</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
