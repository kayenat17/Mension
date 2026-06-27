"use client";

import React from "react";
import type { SavedAnalysis } from "./types";

interface AnalysisReviewModalProps {
  analysis: SavedAnalysis | null;
  onClose: () => void;
}

export default function AnalysisReviewModal({ analysis, onClose }: AnalysisReviewModalProps) {
  if (!analysis) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-lavender/50 relative">
        <button
          onClick={onClose}
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
                {analysis.phase} Phase
              </span>
              {analysis.sender_label && (
                <span className="text-[9px] uppercase font-bold tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-butter-dark/50">
                  From: {analysis.sender_label}
                </span>
              )}
            </div>
            <p className="text-sm text-charcoal/80 italic border-l-2 border-lavender-dark pl-3 py-1">&ldquo;{analysis.message}&rdquo;</p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider">Ova&apos;s Insight</h4>
            <div className="text-sm text-charcoal/90 leading-relaxed space-y-3 whitespace-pre-wrap">
              {analysis.result.split("\n\n").map((paragraph: string, index: number) => {
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
            onClick={onClose}
            className="px-6 py-2.5 bg-butter hover:bg-butter-dark text-charcoal font-bold rounded-2xl transition-all shadow-sm cursor-pointer"
          >
            Close Review
          </button>
        </div>
      </div>
    </div>
  );
}