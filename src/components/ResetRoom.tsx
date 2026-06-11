"use client";

import React, { useState } from "react";
import { Flame, Battery, Zap, BatteryCharging, CheckCircle, FlameKindling, Trash2 } from "lucide-react";

export default function ResetRoom() {
  // --- ENERGY AUDIT STATE ---
  const [selectedDrains, setSelectedDrains] = useState<string[]>([]);
  const [selectedFuels, setSelectedFuels] = useState<string[]>([]);
  const [batteryResult, setBatteryResult] = useState<{ percentage: number; prescription: string } | null>(null);

  const drains = ["Work/Boss", "Overthinking", "Messy Room", "Group Chats", "Money Stress", "Socializing", "Bad Sleep"];
  const fuels = ["Alone Time", "Good Snacks", "Deep Sleep", "Sunlight", "Pets", "Doing Nothing", "Hot Shower"];

  const toggleItem = (item: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
    setBatteryResult(null); // Reset result when changing inputs
  };

  const calculateBattery = () => {
    // Base battery 50%. Fuels add 10%, drains subtract 15% (drains are heavier).
    let battery = 50 + (selectedFuels.length * 10) - (selectedDrains.length * 15);
    battery = Math.max(0, Math.min(100, battery)); // Clamp between 0 and 100

    let prescription = "";
    if (battery <= 20) {
      prescription = "Critical low battery. Cancel everything non-essential. Put your phone on DND, eat something comforting, and rot in bed. You have zero obligation to be productive right now.";
    } else if (battery <= 50) {
      prescription = "You're running on fumes. Do the bare minimum today and protect your peace tonight. A hot shower and early bedtime are mandatory.";
    } else if (battery <= 80) {
      prescription = "You're doing okay, but guard your energy! Don't overcommit just because you feel fine right now. Keep cruising.";
    } else {
      prescription = "Fully charged! You're thriving. Use this energy for something that brings you genuine joy, not just chores.";
    }

    setBatteryResult({ percentage: battery, prescription });
  };

  // --- BURN BOOK STATE ---
  const [burnText, setBurnText] = useState("");
  const [isBurning, setIsBurning] = useState(false);
  const [burnComplete, setBurnComplete] = useState(false);

  const handleIncinerate = () => {
    if (!burnText.trim()) return;
    
    setIsBurning(true);
    setBurnComplete(false);

    // Simulate burning time
    setTimeout(() => {
      setIsBurning(false);
      setBurnText("");
      setBurnComplete(true);
      
      // Reset the complete message after a few seconds
      setTimeout(() => {
        setBurnComplete(false);
      }, 5000);
    }, 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 max-w-5xl mx-auto w-full space-y-12 animate-slide-up pb-24">
      {/* Header Info */}
      <section className="text-center space-y-3">
        <h2 className="font-dm-sans font-bold text-3xl md:text-4xl text-charcoal flex items-center justify-center gap-3">
          <Flame className="w-8 h-8 text-amber-500" />
          The Reset Room
        </h2>
        <p className="text-sm text-warm-gray max-w-xl mx-auto font-medium">
          Sometimes you don't need to logically reframe your thoughts. Sometimes you just need to check your battery, vent, and let it burn.
        </p>
      </section>

      {/* SECTION 1: THE ENERGY AUDIT */}
      <section className="glass-panel rounded-3xl p-6 md:p-8 border border-lavender bg-white/70 shadow-sm relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-butter/30 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-500 border border-amber-100">
            <Battery className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-dm-sans font-bold text-xl text-charcoal">The Energy Audit</h3>
            <p className="text-xs text-warm-gray font-medium">Quickly calculate your social battery and get Ova's evening prescription.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Drains */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-wider text-red-500 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> What's draining you today?
            </h4>
            <div className="flex flex-wrap gap-2">
              {drains.map(item => (
                <button
                  key={item}
                  onClick={() => toggleItem(item, selectedDrains, setSelectedDrains)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    selectedDrains.includes(item) 
                      ? "bg-red-100 border-red-200 text-red-700 shadow-sm scale-105" 
                      : "bg-white border-lavender text-warm-gray hover:border-red-200 hover:text-red-500"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Fuels */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-wider text-emerald-500 flex items-center gap-1.5">
              <BatteryCharging className="w-3.5 h-3.5" /> What's fueling you today?
            </h4>
            <div className="flex flex-wrap gap-2">
              {fuels.map(item => (
                <button
                  key={item}
                  onClick={() => toggleItem(item, selectedFuels, setSelectedFuels)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    selectedFuels.includes(item) 
                      ? "bg-emerald-100 border-emerald-200 text-emerald-700 shadow-sm scale-105" 
                      : "bg-white border-lavender text-warm-gray hover:border-emerald-200 hover:text-emerald-500"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center border-t border-lavender/40 pt-6">
          <button 
            onClick={calculateBattery}
            className="bg-charcoal text-white font-bold py-3 px-8 rounded-2xl hover:bg-charcoal/90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            Check Battery & Get Prescription
          </button>

          {batteryResult && (
            <div className="mt-6 w-full animate-slide-up bg-lavender-light/30 border border-lavender rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
              {/* Battery Graphic */}
              <div className="relative w-24 h-48 border-4 border-charcoal/20 rounded-xl overflow-hidden flex flex-col-reverse bg-white shadow-inner shrink-0">
                <div 
                  className={`w-full transition-all duration-1000 ease-out ${
                    batteryResult.percentage <= 20 ? "bg-red-400" : batteryResult.percentage <= 50 ? "bg-amber-400" : "bg-emerald-400"
                  }`}
                  style={{ height: `${batteryResult.percentage}%` }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center font-dm-sans font-black text-2xl text-charcoal/80 mix-blend-overlay drop-shadow-md">
                  {batteryResult.percentage}%
                </div>
              </div>

              {/* Prescription Text */}
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-block text-[10px] uppercase font-bold tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100 mb-1">
                  Ova's Prescription
                </div>
                <p className="text-charcoal font-medium leading-relaxed text-sm md:text-base">
                  {batteryResult.prescription}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 2: THE RAGE ROOM / BURN BOOK */}
      <section className="glass-panel rounded-3xl p-6 md:p-8 border border-red-100 bg-white/70 shadow-sm relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-red-50 text-red-500 border border-red-100">
            <FlameKindling className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-dm-sans font-bold text-xl text-charcoal">The Burn Book</h3>
            <p className="text-xs text-warm-gray font-medium">Type out whatever is frustrating you, and incinerate it.</p>
          </div>
        </div>

        <div className="space-y-4 relative">
          
          {isBurning ? (
            <div className="h-40 w-full bg-charcoal/5 rounded-2xl border-2 border-dashed border-red-300 flex items-center justify-center relative overflow-hidden">
              {/* Fake fire effect using CSS */}
              <div className="absolute bottom-0 w-full flex justify-center space-x-2 animate-pulse">
                <div className="w-4 h-16 bg-red-500 rounded-full blur-sm animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-6 h-24 bg-orange-400 rounded-full blur-sm animate-bounce" style={{ animationDelay: "100ms" }}></div>
                <div className="w-8 h-32 bg-amber-400 rounded-full blur-sm animate-bounce" style={{ animationDelay: "50ms" }}></div>
                <div className="w-6 h-20 bg-orange-500 rounded-full blur-sm animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-4 h-12 bg-red-400 rounded-full blur-sm animate-bounce" style={{ animationDelay: "75ms" }}></div>
              </div>
              <span className="relative z-10 font-bold text-amber-700 tracking-widest uppercase text-xl">INCINERATING...</span>
            </div>
          ) : burnComplete ? (
            <div className="h-40 w-full bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col items-center justify-center text-center space-y-2 animate-fade-in p-6">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
              <p className="text-sm font-bold text-emerald-800">Done. It's ashes.</p>
              <p className="text-xs text-emerald-600/80 font-medium">They don't deserve your energy anyway. Take a deep breath.</p>
            </div>
          ) : (
            <>
              <textarea
                value={burnText}
                onChange={(e) => setBurnText(e.target.value)}
                placeholder="Type your intrusive thoughts, the angry text you shouldn't send, or whatever is weighing you down here..."
                className="w-full h-40 rounded-2xl border border-red-200 bg-red-50/30 p-4 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent resize-none placeholder-red-900/20"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleIncinerate}
                  disabled={!burnText.trim()}
                  className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Incinerate Thought
                </button>
              </div>
            </>
          )}

        </div>
      </section>
    </div>
  );
}
