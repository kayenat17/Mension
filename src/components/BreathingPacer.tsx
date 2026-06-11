"use client";

import React, { useState, useEffect, useRef } from "react";
import { Wind, Play, Pause, RotateCcw, ShieldCheck, CheckCircle2 } from "lucide-react";

type BreathingStyle = "box" | "relax" | "equal";

interface PhaseConfig {
  name: string;
  duration: number; // in seconds
  instruction: string;
  color: string; // Tailwind bg color
  scale: string; // CSS transform scale
}

export default function BreathingPacer() {
  const [breathingStyle, setBreathingStyle] = useState<BreathingStyle>("box");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(4);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Grounding Game State
  const [groundingInputs, setGroundingInputs] = useState({
    see1: "", see2: "", see3: "", see4: "", see5: "",
    feel1: "", feel2: "", feel3: "", feel4: "",
    hear1: "", hear2: "", hear3: "",
    smell1: "", smell2: "",
    taste1: "",
  });
  const [groundingSteps, setGroundingSteps] = useState({
    see: false,
    feel: false,
    hear: false,
    smell: false,
    taste: false,
  });

  // Breathing Configurations
  const configs: Record<BreathingStyle, PhaseConfig[]> = {
    box: [
      { name: "Inhale", duration: 4, instruction: "Breathe in slowly through your nose...", color: "bg-lavender", scale: "scale-115" },
      { name: "Hold", duration: 4, instruction: "Pause and let your body settle...", color: "bg-butter", scale: "scale-115" },
      { name: "Exhale", duration: 4, instruction: "Exhale fully through your mouth...", color: "bg-lavender-dark", scale: "scale-90" },
      { name: "Hold", duration: 4, instruction: "Pause before the next breath...", color: "bg-white", scale: "scale-90" },
    ],
    relax: [
      { name: "Inhale", duration: 4, instruction: "Breathe in gentleness...", color: "bg-lavender", scale: "scale-115" },
      { name: "Hold", duration: 7, instruction: "Hold and let the calm absorb...", color: "bg-butter", scale: "scale-115" },
      { name: "Exhale", duration: 8, instruction: "Exhale all tension and worries...", color: "bg-lavender-dark", scale: "scale-85" },
    ],
    equal: [
      { name: "Inhale", duration: 5, instruction: "Breathe in deeply...", color: "bg-lavender", scale: "scale-115" },
      { name: "Exhale", duration: 5, instruction: "Breathe out slowly...", color: "bg-butter", scale: "scale-90" },
    ],
  };

  const currentPhases = configs[breathingStyle];
  const activePhase = currentPhases[currentPhaseIndex];

  // Sync timer when playing
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            // Move to next phase
            const nextIndex = (currentPhaseIndex + 1) % currentPhases.length;
            setCurrentPhaseIndex(nextIndex);
            return currentPhases[nextIndex].duration;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentPhaseIndex, breathingStyle, currentPhases]);

  // Handle changing style
  const handleStyleChange = (style: BreathingStyle) => {
    setIsPlaying(false);
    setBreathingStyle(style);
    setCurrentPhaseIndex(0);
    setSecondsRemaining(configs[style][0].duration);
  };

  const resetPacer = () => {
    setIsPlaying(false);
    setCurrentPhaseIndex(0);
    setSecondsRemaining(currentPhases[0].duration);
  };

  const checkGroundingStep = (step: "see" | "feel" | "hear" | "smell" | "taste") => {
    setGroundingSteps(prev => ({
      ...prev,
      [step]: !prev[step]
    }));
  };

  const resetGrounding = () => {
    setGroundingInputs({
      see1: "", see2: "", see3: "", see4: "", see5: "",
      feel1: "", feel2: "", feel3: "", feel4: "",
      hear1: "", hear2: "", hear3: "",
      smell1: "", smell2: "",
      taste1: "",
    });
    setGroundingSteps({
      see: false,
      feel: false,
      hear: false,
      smell: false,
      taste: false,
    });
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 max-w-5xl mx-auto w-full space-y-8 animate-slide-up">
      {/* Header */}
      <section className="text-center md:text-left space-y-2">
        <h2 className="font-dm-sans font-bold text-2xl md:text-3xl text-charcoal flex items-center justify-center md:justify-start gap-2">
          <Wind className="w-7 h-7 text-lavender-dark animate-float" />
          Calm Space
        </h2>
        <p className="text-sm text-warm-gray max-w-2xl">
          Slow down your pulse and regulate your nervous system. Choose a breathing pattern or follow the sensory checklists to ground yourself in the present moment.
        </p>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Breathing Pacer Panel */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-panel rounded-2xl p-6 border-lavender bg-white/60 flex flex-col items-center space-y-6 relative overflow-hidden">
            {/* Style Selector */}
            <div className="w-full flex bg-lavender-light/50 p-1.5 rounded-xl border border-lavender/40">
              {(["box", "relax", "equal"] as BreathingStyle[]).map((style) => (
                <button
                  key={style}
                  onClick={() => handleStyleChange(style)}
                  className={`flex-1 text-center py-2 rounded-lg text-xs font-semibold transition-all-300 capitalize ${
                    breathingStyle === style
                      ? "bg-butter text-charcoal shadow-sm border border-butter-dark/30"
                      : "text-warm-gray hover:text-charcoal"
                  }`}
                >
                  {style === "box" ? "Box (4-4-4-4)" : style === "relax" ? "Relax (4-7-8)" : "Equal (5-5)"}
                </button>
              ))}
            </div>

            {/* Breathing Bubble */}
            <div className="relative w-64 h-64 flex items-center justify-center my-6">
              {/* Outer Glow Ring */}
              <div
                className={`absolute w-52 h-52 rounded-full border border-lavender-dark/20 transition-all duration-[4000ms] ease-in-out ${
                  isPlaying && activePhase.name === "Inhale" ? "scale-125 border-butter bg-butter/5" : ""
                } ${
                  isPlaying && activePhase.name === "Exhale" ? "scale-90 border-lavender bg-lavender-light/10" : ""
                }`}
              ></div>

              {/* Core Breathing Bubble */}
              <div
                style={{
                  transition: `transform ${activePhase.duration}s cubic-bezier(0.4, 0, 0.2, 1), background-color 1s ease`,
                }}
                className={`w-40 h-40 rounded-full flex flex-col items-center justify-center shadow-lg shadow-lavender/30 border border-white/60 bg-gradient-to-tr from-lavender to-butter-light ${
                  isPlaying ? activePhase.scale : "scale-100"
                }`}
              >
                <span className="font-dm-sans font-bold text-xl text-charcoal/90">
                  {activePhase.name}
                </span>
                <span className="text-2xl font-extrabold text-charcoal mt-1">
                  {secondsRemaining}s
                </span>
              </div>
            </div>

            {/* Phase Instructions */}
            <div className="text-center min-h-[50px] px-4">
              <p className="text-sm font-semibold text-charcoal transition-all duration-300">
                {activePhase.instruction}
              </p>
              <p className="text-xs text-warm-gray mt-1">
                {breathingStyle === "box" 
                  ? "Helps clear mental fog & balance stress" 
                  : breathingStyle === "relax" 
                    ? "Activates deep parasympathetic relaxation" 
                    : "Excellent for quick emotional grounding"}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 w-full">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex-1 py-3 rounded-2xl font-semibold text-sm transition-all-300 shadow-sm border flex items-center justify-center gap-2 hover:scale-102 ${
                  isPlaying
                    ? "bg-white hover:bg-lavender-light text-charcoal border-lavender"
                    : "bg-butter hover:bg-butter-dark text-charcoal border-butter-dark"
                }`}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? "Pause" : "Start Breathing"}</span>
              </button>

              <button
                onClick={resetPacer}
                className="px-4 py-3 border border-lavender bg-white hover:bg-lavender-light/30 rounded-2xl text-warm-gray hover:text-charcoal transition-all-300 flex items-center justify-center"
                title="Reset timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Sensory Grounding Panel (5-4-3-2-1) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-panel rounded-2xl p-6 border-lavender bg-white/60 space-y-5">
            <div className="flex items-center justify-between border-b border-lavender pb-3">
              <div>
                <h3 className="font-dm-sans font-bold text-base text-charcoal">5-4-3-2-1 Sensory Grounding</h3>
                <p className="text-[11px] text-warm-gray mt-0.5">Anchors your thoughts back to your immediate physical environment.</p>
              </div>
              <button
                onClick={resetGrounding}
                className="text-[10px] text-warm-gray hover:text-charcoal font-semibold border border-lavender px-2.5 py-1 rounded-xl bg-white hover:bg-lavender-light/30 transition-all"
              >
                Clear Senses
              </button>
            </div>

            <div className="space-y-4">
              {/* Step 5: See */}
              <div className={`p-3 rounded-xl border transition-all-300 ${groundingSteps.see ? "bg-butter/25 border-butter-dark/50" : "bg-white/40 border-lavender/40"}`}>
                <button 
                  onClick={() => checkGroundingStep("see")} 
                  className="flex items-center justify-between w-full text-left font-semibold text-xs text-charcoal"
                >
                  <span className="flex items-center gap-2">👀 <span className="font-bold">5 things you can see:</span></span>
                  <CheckCircle2 className={`w-4.5 h-4.5 transition-colors ${groundingSteps.see ? "text-amber-500 fill-butter" : "text-gray-300"}`} />
                </button>
                {(!groundingSteps.see || true) && (
                  <div className="grid grid-cols-5 gap-1.5 mt-2.5">
                    {[1,2,3,4,5].map((n) => (
                      <input
                        key={n}
                        type="text"
                        placeholder={`#${n}`}
                        value={(groundingInputs as any)[`see${n}`]}
                        onChange={(e) => setGroundingInputs({...groundingInputs, [`see${n}`]: e.target.value})}
                        className="text-xs p-1.5 bg-white/70 border border-lavender/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-lavender-dark text-center placeholder-gray-300"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Step 4: Feel */}
              <div className={`p-3 rounded-xl border transition-all-300 ${groundingSteps.feel ? "bg-butter/25 border-butter-dark/50" : "bg-white/40 border-lavender/40"}`}>
                <button 
                  onClick={() => checkGroundingStep("feel")} 
                  className="flex items-center justify-between w-full text-left font-semibold text-xs text-charcoal"
                >
                  <span className="flex items-center gap-2">🪻 <span className="font-bold">4 physical sensations you feel:</span></span>
                  <CheckCircle2 className={`w-4.5 h-4.5 transition-colors ${groundingSteps.feel ? "text-amber-500 fill-butter" : "text-gray-300"}`} />
                </button>
                {(!groundingSteps.feel || true) && (
                  <div className="grid grid-cols-4 gap-1.5 mt-2.5">
                    {[1,2,3,4].map((n) => (
                      <input
                        key={n}
                        type="text"
                        placeholder={`#${n}`}
                        value={(groundingInputs as any)[`feel${n}`]}
                        onChange={(e) => setGroundingInputs({...groundingInputs, [`feel${n}`]: e.target.value})}
                        className="text-xs p-1.5 bg-white/70 border border-lavender/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-lavender-dark text-center placeholder-gray-300"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Step 3: Hear */}
              <div className={`p-3 rounded-xl border transition-all-300 ${groundingSteps.hear ? "bg-butter/25 border-butter-dark/50" : "bg-white/40 border-lavender/40"}`}>
                <button 
                  onClick={() => checkGroundingStep("hear")} 
                  className="flex items-center justify-between w-full text-left font-semibold text-xs text-charcoal"
                >
                  <span className="flex items-center gap-2">👂 <span className="font-bold">3 ambient sounds you hear:</span></span>
                  <CheckCircle2 className={`w-4.5 h-4.5 transition-colors ${groundingSteps.hear ? "text-amber-500 fill-butter" : "text-gray-300"}`} />
                </button>
                {(!groundingSteps.hear || true) && (
                  <div className="grid grid-cols-3 gap-1.5 mt-2.5">
                    {[1,2,3].map((n) => (
                      <input
                        key={n}
                        type="text"
                        placeholder={`#${n}`}
                        value={(groundingInputs as any)[`hear${n}`]}
                        onChange={(e) => setGroundingInputs({...groundingInputs, [`hear${n}`]: e.target.value})}
                        className="text-xs p-1.5 bg-white/70 border border-lavender/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-lavender-dark text-center placeholder-gray-300"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Step 2: Smell */}
              <div className={`p-3 rounded-xl border transition-all-300 ${groundingSteps.smell ? "bg-butter/25 border-butter-dark/50" : "bg-white/40 border-lavender/40"}`}>
                <button 
                  onClick={() => checkGroundingStep("smell")} 
                  className="flex items-center justify-between w-full text-left font-semibold text-xs text-charcoal"
                >
                  <span className="flex items-center gap-2">👃 <span className="font-bold">2 scents you can smell:</span></span>
                  <CheckCircle2 className={`w-4.5 h-4.5 transition-colors ${groundingSteps.smell ? "text-amber-500 fill-butter" : "text-gray-300"}`} />
                </button>
                {(!groundingSteps.smell || true) && (
                  <div className="grid grid-cols-2 gap-1.5 mt-2.5">
                    {[1,2].map((n) => (
                      <input
                        key={n}
                        type="text"
                        placeholder={`#${n}`}
                        value={(groundingInputs as any)[`smell${n}`]}
                        onChange={(e) => setGroundingInputs({...groundingInputs, [`smell${n}`]: e.target.value})}
                        className="text-xs p-1.5 bg-white/70 border border-lavender/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-lavender-dark text-center placeholder-gray-300"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Step 1: Taste */}
              <div className={`p-3 rounded-xl border transition-all-300 ${groundingSteps.taste ? "bg-butter/25 border-butter-dark/50" : "bg-white/40 border-lavender/40"}`}>
                <button 
                  onClick={() => checkGroundingStep("taste")} 
                  className="flex items-center justify-between w-full text-left font-semibold text-xs text-charcoal"
                >
                  <span className="flex items-center gap-2">👅 <span className="font-bold">1 thing you can taste (or a self-compassion thought):</span></span>
                  <CheckCircle2 className={`w-4.5 h-4.5 transition-colors ${groundingSteps.taste ? "text-amber-500 fill-butter" : "text-gray-300"}`} />
                </button>
                {(!groundingSteps.taste || true) && (
                  <div className="mt-2.5">
                    <input
                      type="text"
                      placeholder="e.g. Taste of peppermint tea, or: 'I am doing the best I can right now'"
                      value={groundingInputs.taste1}
                      onChange={(e) => setGroundingInputs({...groundingInputs, taste1: e.target.value})}
                      className="w-full text-xs p-2 bg-white/70 border border-lavender/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-lavender-dark placeholder-gray-300"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Completion Shield */}
            {Object.values(groundingSteps).every(Boolean) && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl flex items-center space-x-2.5 text-xs font-semibold animate-bounce">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Excellent job. You have anchored yourself in the present. You are here, you are safe.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
