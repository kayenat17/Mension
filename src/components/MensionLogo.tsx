import React from "react";

export default function MensionLogo({ className = "text-charcoal" }: { className?: string }) {
  return (
    <div className={`flex items-end font-dm-sans font-black tracking-tight leading-none ${className}`}>
      <span>Mens</span>
      
      {/* The 'i' made of a Star and a Crescent Moon */}
      <div className="relative inline-flex flex-col items-center justify-end mx-[0.05em]" style={{ height: '1.1em', width: '0.45em' }}>
        
        {/* The Star (dot of the i) - Indigo Accent */}
        <svg 
          className="absolute -top-[0.05em] text-indigo-500 animate-pulse-slow drop-shadow-sm z-10" 
          style={{ width: '0.35em', height: '0.35em' }}
          viewBox="0 0 24 24" 
          fill="currentColor"
        >
          <path d="M12 0C12 6.627 17.373 12 24 12C17.373 12 12 17.373 12 24C12 17.373 6.627 12 0 12C6.627 12 12 6.627 12 0Z"/>
        </svg>
        
        {/* The Crescent Moon (body of the i) - Yellow Accent */}
        {/* Custom path: Tall, vertical crescent. scaleX(-1) flips it to face right. */}
        <svg 
          className="text-amber-400 fill-amber-400 drop-shadow-sm relative z-0" 
          style={{ width: '0.45em', height: '0.9em', transform: 'scaleX(-1) rotate(-5deg) translateY(0.05em)' }}
          viewBox="0 0 100 200"
          preserveAspectRatio="none"
        >
          {/* M: start top left. Outer right curve, then inner right curve. */}
          <path d="M 15 5 C 105 60, 105 140, 15 195 C 65 140, 65 60, 15 5 Z" />
        </svg>
      </div>
      
      <span>on</span>
    </div>
  );
}
