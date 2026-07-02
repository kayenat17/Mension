"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function InteractivePortrait() {
  const [isHovered, setIsHovered] = useState(false);

  const stickers = [
    { label: "Confused", top: "5%", left: "35%", rotate: "-8deg" },
    { label: "Isolation", top: "10%", left: "65%", rotate: "5deg" },
    { label: "Emotional Fatigue", top: "18%", left: "20%", rotate: "-3deg" },
    { label: "Overthinking", top: "22%", left: "80%", rotate: "6deg" },
    { label: "Low Motivation", top: "28%", left: "30%", rotate: "-4deg" },
    { label: "Burnout", top: "35%", left: "15%", rotate: "-6deg" },
    { label: "Anxiety", top: "38%", left: "75%", rotate: "8deg" },
  ];

  return (
    <div
      className="relative w-full h-[350px] md:h-[500px] cursor-crosshair overflow-hidden group rounded-[48px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsHovered(!isHovered)}
    >
      {/* Base Portrait Photo (Sticker Effect with mix-blend-multiply) */}
      <div className="absolute inset-0 overflow-hidden mix-blend-multiply">
        <div className="w-full h-full relative bg-transparent">
          <img
            src="/portrait.png"
            alt="User Portrait"
            className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
          />
        </div>
      </div>



      {/* Floating Stickers (Hover State) */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {stickers.map((sticker, idx) => (
          <div
            key={idx}
            className={`absolute px-3 py-1 ${idx % 2 === 0 ? 'bg-[#FFF6A4]' : 'bg-[#DED7FC]'} text-[#121211] font-serif font-bold text-sm tracking-tight rounded-sm shadow-sm transition-all duration-500 ease-out`}
            style={{
              top: sticker.top,
              left: sticker.left,
              transform: `translate(-50%, -50%) rotate(${sticker.rotate}) scale(${isHovered ? 1 : 0.8})`,
              opacity: isHovered ? 1 : 0,
              transitionDelay: `${idx * 40}ms`,
            }}
          >
            {sticker.label}
          </div>
        ))}
      </div>
    </div>
  );
}
