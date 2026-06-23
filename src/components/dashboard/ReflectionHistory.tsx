"use client";

import React from "react";
import { FileText, Trash2, ArrowRight } from "lucide-react";
import type { SavedAnalysis } from "./types";

interface ReflectionHistoryProps {
  analyses: SavedAnalysis[];
  onDelete: (id: string | number) => void;
  onView: (analysis: SavedAnalysis) => void;
}

export default function ReflectionHistory({ analyses, onDelete, onView }: ReflectionHistoryProps) {
  if (analyses.length === 0) {
    return (
      <section className="space-y-4">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-purple-400" />
          <h3 className="font-dm-sans font-bold text-base text-charcoal">Reflection History</h3>
        </div>
        <div className="glass-panel rounded-3xl p-6 text-center border-dashed border-lavender/50 bg-white/30 text-xs text-warm-gray">
          No logs saved yet. After running an analysis, click "Save to Reflection Log".
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center space-x-2">
        <FileText className="w-5 h-5 text-purple-400" />
        <h3 className="font-dm-sans font-bold text-base text-charcoal">Reflection History</h3>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
        {analyses.map(item => (
          <div key={item.id} className="glass-panel rounded-3xl p-4 border-lavender/40 bg-white/90 shadow-sm relative group hover:border-lavender transition-all-300">
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
              <button onClick={() => onDelete(item.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-xl hover:bg-red-50 text-red-400 hover:text-red-600 transition-all duration-200 self-start cursor-pointer"
                title="Delete reflection">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-3">
              <p className="text-xs text-charcoal/80 italic">"{item.message.substring(0, 100)}{item.message.length > 100 ? "..." : ""}"</p>
              <button onClick={() => onView(item)}
                className="w-full flex items-center justify-between p-2 rounded-2xl bg-lavender-light/35 border border-lavender/30 text-[10px] font-bold text-charcoal hover:bg-lavender transition-all-300 cursor-pointer">
                <span>Review Full Analysis</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
