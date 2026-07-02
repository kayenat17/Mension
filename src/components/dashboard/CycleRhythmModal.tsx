"use client";

import React, { useState } from "react";
import { X, Settings } from "lucide-react";

interface CycleRhythmModalProps {
  onClose: () => void;
  onSwitchToCalendar: () => void;
}

export default function CycleRhythmModal({ onClose, onSwitchToCalendar }: CycleRhythmModalProps) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // SVG dimensions
  const width = 800;
  const height = 400;
  const padding = 60;

  // Points mapping roughly to the screenshot's curve
  const points = [
    { x: 100, y: 300, phase: "PERIOD", color: "#ef4444" },
    { x: 250, y: 150, phase: "FOLLICULAR", color: "#f97316" },
    { x: 400, y: 80, phase: "OVULATION", color: "#eab308" },
    { x: 550, y: 220, phase: "LUTEAL", color: "#a855f7", isToday: true, label: "Day 24 • 16 Jun" },
    { x: 700, y: 280, phase: "PRE-MENSTRUAL", color: "#8b5cf6" },
  ];

  // SVG Path generator (Catmull-Rom or basic bezier interpolation for smooth curves)
  // For simplicity, we use a basic cubic bezier approximation
  const generatePath = () => {
    let path = `M ${points[0].x} ${points[0].y} `;
    path += `C 150 250, 200 150, ${points[1].x} ${points[1].y} `;
    path += `C 300 150, 350 80, ${points[2].x} ${points[2].y} `;
    path += `C 450 80, 500 220, ${points[3].x} ${points[3].y} `;
    path += `C 600 220, 650 280, ${points[4].x} ${points[4].y} `;
    // The curve hooks up at the end in the screenshot
    path += `C 730 280, 750 250, 780 230 `;
    return path;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#fbf9f1]/90 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#f2efe4] w-full max-w-4xl rounded-[32px] p-8 md:p-12 shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-[#e4e1d3] relative">
        <button
          onClick={onClose}
          className="absolute top-6 left-6 p-2 rounded-full bg-charcoal hover:bg-black text-white transition-all z-10 shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="font-serif text-4xl text-[#121211] font-medium tracking-tight mb-2">Your Cycle Rhythm</h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2.5 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-500 transition-all shadow-sm">
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={onSwitchToCalendar}
              className="px-6 py-3 rounded-full bg-[#3b82f6] hover:bg-blue-600 text-white font-sans text-sm font-semibold transition-all shadow-sm"
            >
              Edit & Log Calendar
            </button>
          </div>
        </div>

        <div className="relative w-full overflow-x-auto mt-12 mb-4">
          <div className="min-w-[800px] h-[400px] relative">
            <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
              <defs>
                <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="25%" stopColor="#f97316" />
                  <stop offset="50%" stopColor="#eab308" />
                  <stop offset="75%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>

              {/* Y-Axis Label */}
              <text x={-200} y={40} transform="rotate(-90)" fill="#121211" opacity="0.4" fontSize="10" fontWeight="bold" letterSpacing="0.1em" className="font-sans uppercase">
                Mood Levels
              </text>

              {/* Main Curve */}
              <path
                d={generatePath()}
                fill="none"
                stroke="url(#line-gradient)"
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* Data Points */}
              {points.map((p, i) => (
                <g 
                  key={i} 
                  onMouseEnter={() => setHoveredPoint(i)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  className="cursor-pointer"
                >
                  {/* Glow/Hitbox */}
                  <circle cx={p.x} cy={p.y} r={16} fill="transparent" />
                  
                  {/* Point */}
                  <circle 
                    cx={p.x} 
                    cy={p.y} 
                    r={6} 
                    fill="white" 
                    stroke={p.color} 
                    strokeWidth="3" 
                    className="transition-all duration-300"
                    style={{ transform: hoveredPoint === i || p.isToday ? 'scale(1.3)' : 'scale(1)', transformOrigin: `${p.x}px ${p.y}px` }}
                  />

                  {/* Tooltip for today or hovered */}
                  {(hoveredPoint === i || (p.isToday && hoveredPoint === null)) && p.label && (
                    <g className="animate-fade-in">
                      <rect 
                        x={p.x - 60} 
                        y={p.y - 45} 
                        width="120" 
                        height="28" 
                        rx="14" 
                        fill="#121211" 
                      />
                      <text 
                        x={p.x} 
                        y={p.y - 27} 
                        fill="white" 
                        fontSize="11" 
                        fontWeight="600" 
                        textAnchor="middle" 
                        className="font-sans"
                      >
                        {p.label}
                      </text>
                      {/* Triangle pointer */}
                      <path d={`M ${p.x - 6} ${p.y - 17} L ${p.x + 6} ${p.y - 17} L ${p.x} ${p.y - 10} Z`} fill="#121211" />
                    </g>
                  )}
                </g>
              ))}

              {/* X-Axis Labels */}
              {points.map((p, i) => (
                <text 
                  key={`label-${i}`} 
                  x={p.x} 
                  y={height - 20} 
                  fill="#121211" 
                  opacity="0.4" 
                  fontSize="9" 
                  fontWeight="bold" 
                  letterSpacing="0.1em" 
                  textAnchor="middle" 
                  className="font-sans uppercase"
                >
                  {p.phase}
                </text>
              ))}

              <text x={width / 2} y={height + 10} fill="#121211" opacity="0.2" fontSize="9" fontWeight="bold" letterSpacing="0.1em" textAnchor="middle" className="font-sans uppercase">
                Current Cycle
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
