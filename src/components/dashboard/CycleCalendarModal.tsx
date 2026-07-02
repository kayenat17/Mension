"use client";

import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface CycleCalendarModalProps {
  onClose: () => void;
  onSwitchToGraph: () => void;
}

export default function CycleCalendarModal({ onClose, onSwitchToGraph }: CycleCalendarModalProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1)); // May 2026 based on screenshot

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#fbf9f1]/90 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#f2efe4] w-full max-w-3xl rounded-[32px] p-8 md:p-12 shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-[#e4e1d3] relative">
        <button
          onClick={onClose}
          className="absolute top-6 left-6 p-2 rounded-full bg-charcoal hover:bg-black text-white transition-all z-10 shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-between items-start mb-12">
          <div>
            <h2 className="font-serif text-4xl text-[#121211] font-medium tracking-tight mb-2">Cycle Calendar</h2>
            <p className="font-sans text-[11px] font-bold text-[#121211]/50 uppercase tracking-widest">
              Luteal Phase: 13 Days Left
            </p>
          </div>
          <button
            onClick={onSwitchToGraph}
            className="px-5 py-2.5 rounded-full bg-[#d6d4ea] hover:bg-[#c9c6e3] text-[#121211] font-sans text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
          >
            Back to Graph
          </button>
        </div>

        <div className="bg-[#f9f8f2] rounded-3xl p-8 border border-[#e4e1d3]/60 shadow-sm mb-6">
          <div className="flex justify-between items-center mb-8">
            <button onClick={handlePrevMonth} className="p-2 text-[#121211]/40 hover:text-[#121211] transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="font-sans text-sm font-bold text-[#121211] uppercase tracking-[0.2em]">
              {currentDate.toLocaleString("default", { month: "long" })} {currentDate.getFullYear()}
            </h3>
            <button onClick={handleNextMonth} className="p-2 text-[#121211]/40 hover:text-[#121211] transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-y-6 text-center">
            {["SU", "MO", "TU", "WE", "TH", "FR", "SA"].map((day) => (
              <div key={day} className="font-sans text-[10px] font-bold text-[#121211]/40 uppercase tracking-widest mb-4">
                {day}
              </div>
            ))}

            {blanks.map((_, i) => (
              <div key={`blank-${i}`} className="h-10"></div>
            ))}

            {days.map((day) => {
              // Highlight based on screenshot: 24, 25, 26, 27, 28 are purple
              const isHighlighted = day >= 24 && day <= 28;
              const isToday = day === 24;

              return (
                <div key={day} className="flex justify-center items-center h-10 relative">
                  <div
                    className={`w-9 h-9 flex items-center justify-center rounded-full font-sans text-sm font-semibold transition-all
                      ${isHighlighted ? "bg-[#d6d4ea] text-[#121211]" : "text-[#121211]/70"}
                      ${isToday ? "ring-2 ring-[#e7d268] ring-offset-2 ring-offset-[#f9f8f2]" : ""}
                    `}
                  >
                    {day}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#f9a8d4]"></div>
            <span className="font-sans text-[10px] font-bold text-[#121211]/50 uppercase tracking-widest">Period Days</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#d6d4ea]"></div>
            <span className="font-sans text-[10px] font-bold text-[#121211]/50 uppercase tracking-widest">Sleep Days</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#fde047]"></div>
            <span className="font-sans text-[10px] font-bold text-[#121211]/50 uppercase tracking-widest">Ovulation Window</span>
          </div>
        </div>
      </div>
    </div>
  );
}
