"use client";

import React, { useState } from "react";
import { ArrowRight, Sparkles, BookOpen, Heart, Activity } from "lucide-react";

const issue = {
  number: "01",
  month: "July 2026",
  theme: "The Luteal Issue",
  tagline: "for every woman who felt too much and was right to.",
};

const phaseColors: Record<string, { bg: string; text: string }> = {
  Luteal: { bg: "bg-purple-100", text: "text-purple-800" },
  Menstrual: { bg: "bg-red-100", text: "text-red-800" },
  Follicular: { bg: "bg-emerald-100", text: "text-emerald-800" },
};

export default function MensionMonthly() {
  const [activeSection, setActiveSection] = useState(0);

  const scrollToSection = (index: number) => {
    setActiveSection(index);
    document.getElementById(`section-${index}`)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] font-serif selection:bg-purple-200 selection:text-purple-900">
      {/* Masthead */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-purple-100/50 shadow-sm transition-all duration-300">
        <div className="flex items-baseline gap-2">
          <span className="text-xl md:text-2xl font-dm-sans font-medium text-[#6B4FA0] tracking-tight">
            mens<span className="text-[#FFF3B0] mx-0.5 drop-shadow-sm">🌙</span>on
          </span>
          <span className="hidden sm:inline-block text-[10px] md:text-xs font-dm-sans font-medium text-[#9B82C4] tracking-[0.2em] uppercase ml-2 border-l border-purple-200 pl-3">
            Monthly
          </span>
        </div>

        <div className="font-dm-sans text-[10px] md:text-xs text-[#9B82C4] tracking-[0.15em] uppercase font-medium bg-purple-50 px-3 py-1.5 rounded-full">
          Issue {issue.number} — {issue.month}
        </div>
      </header>

      {/* Cover */}
      <section className="relative min-h-[90vh] flex flex-col justify-center px-6 py-20 max-w-4xl mx-auto overflow-hidden">
        {/* Subtle background decors */}
        <div className="absolute top-20 right-0 w-64 h-64 bg-purple-200/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-20 left-0 w-80 h-80 bg-[#FFF3B0]/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 animate-fade-in-up">
          <p className="font-dm-sans text-xs md:text-sm tracking-[0.3em] uppercase text-[#9B82C4] mb-8 font-semibold flex items-center gap-3">
            <span className="w-8 h-px bg-[#9B82C4]/40"></span>
            {issue.month} · Issue {issue.number}
          </p>

          <h1 className="text-6xl md:text-8xl lg:text-[110px] font-normal leading-[0.9] tracking-tight text-[#1A1A1A] mb-8">
            The<br />
            <span className="text-[#6B4FA0] italic font-light pr-4 relative inline-block">
              Luteal
              <Sparkles className="absolute -top-4 -right-8 w-8 h-8 text-[#FFF3B0] animate-pulse" strokeWidth={1.5} />
            </span><br />
            Issue.
          </h1>

          <div className="w-16 h-1 bg-gradient-to-r from-[#FFF3B0] to-[#FFE4B5] my-10 rounded-full" />

          <p className="font-dm-sans text-xl md:text-2xl font-light text-[#555555] leading-relaxed max-w-lg italic">
            "{issue.tagline}"
          </p>
        </div>

        {/* Navigation / Index */}
        <div className="mt-24 pt-12 border-t border-purple-100/50 flex flex-wrap gap-4 md:gap-8 relative z-10 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          {["Her Phase", "Your Body", "Red Flag Data", "Confessions", "Ritual"].map((item, i) => (
            <button
              key={i}
              onClick={() => scrollToSection(i + 1)}
              className="group flex items-center gap-2 font-dm-sans text-xs md:text-sm tracking-[0.15em] uppercase text-[#6B4FA0] hover:text-[#4a3473] transition-colors font-medium"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-purple-200 group-hover:bg-[#6B4FA0] transition-colors"></span>
              {item}
            </button>
          ))}
        </div>
      </section>

      {/* Her Phase */}
      <section id="section-1" className="px-6 py-24 md:py-32 max-w-3xl mx-auto border-t border-purple-100/30">
        <p className="font-dm-sans text-[11px] tracking-[0.25em] uppercase text-[#9B82C4] mb-6 font-semibold flex items-center gap-2">
          <BookOpen className="w-4 h-4" /> Her Phase
        </p>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal leading-[1.15] tracking-tight mb-12 text-[#1A1A1A]">
          Serena Williams<br />
          <span className="text-[#6B4FA0] italic">on her hardest weeks.</span>
        </h2>

        <blockquote className="relative p-8 my-12 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-purple-50">
          <div className="absolute top-0 left-0 w-2 h-full bg-[#FFF3B0] rounded-l-2xl"></div>
          <p className="text-2xl md:text-3xl font-medium text-[#222] leading-snug italic relative z-10">
            "I stopped fighting my body.<br />I started listening to it."
          </p>
        </blockquote>

        <p className="font-dm-sans text-lg font-light text-[#444] leading-[1.8]">
          She didn't train through her cycle. She trained <em className="text-[#1A1A1A] font-medium">with</em> it. During her luteal weeks, Serena deliberately slowed down — and that's when she built the mental resilience that won her 23 slams. Sometimes doing less is the real discipline.
        </p>
      </section>

      {/* Your Body */}
      <section id="section-2" className="px-6 py-24 md:py-32 bg-white border-t border-purple-100/30">
        <div className="max-w-3xl mx-auto">
          <p className="font-dm-sans text-[11px] tracking-[0.25em] uppercase text-[#9B82C4] mb-6 font-semibold flex items-center gap-2">
            <Activity className="w-4 h-4" /> Your Body This Week
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal leading-[1.15] tracking-tight mb-12">
            Why everything feels<br />
            <span className="text-[#6B4FA0] italic">heavier right now.</span>
          </h2>

          <div className="group relative bg-gradient-to-br from-[#E6E0F8] to-[#F3F0FA] rounded-3xl p-8 md:p-12 mb-12 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-center">
              <div className="text-7xl md:text-8xl font-light text-[#6B4FA0] leading-none font-dm-sans tracking-tighter">
                73<span className="text-5xl md:text-6xl">%</span>
              </div>
              <div className="w-full md:w-px h-px md:h-24 bg-purple-300/50"></div>
              <div className="font-dm-sans text-sm md:text-base text-[#5a4286] font-medium leading-relaxed max-w-xs">
                of women report heightened emotional reactivity in their luteal phase
              </div>
            </div>
          </div>

          <p className="font-dm-sans text-lg font-light text-[#444] leading-[1.8]">
            Progesterone peaks then crashes in the luteal phase. Your nervous system becomes more reactive — meaning a message that would feel fine in follicular phase can feel catastrophic now. This isn't weakness. This is biology. <strong className="font-semibold text-[#1A1A1A] bg-purple-100/50 px-1 rounded">Your sensitivity is a signal, not a flaw.</strong>
          </p>
        </div>
      </section>

      {/* Red Flag Data */}
      <section id="section-3" className="px-6 py-24 md:py-32 max-w-3xl mx-auto border-t border-purple-100/30">
        <p className="font-dm-sans text-[11px] tracking-[0.25em] uppercase text-[#9B82C4] mb-6 font-semibold">
          Mension Data — July 2026
        </p>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal leading-[1.15] tracking-tight mb-12">
          Red Flag<br />
          <span className="text-[#6B4FA0] italic">of the Month.</span>
        </h2>

        <div className="bg-[#FFF8D6] rounded-3xl p-8 md:p-12 mb-12 border border-[#FFF3B0] shadow-sm relative overflow-hidden">
          <div className="absolute -bottom-8 -right-8 text-9xl opacity-10">🚩</div>
          <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-center">
            <div className="text-7xl md:text-8xl font-light text-[#1A1A1A] leading-none font-dm-sans tracking-tighter">
              61<span className="text-5xl md:text-6xl">%</span>
            </div>
            <div className="w-full md:w-px h-px md:h-24 bg-[#E5D68C]/50"></div>
            <div className="font-dm-sans text-sm md:text-base text-[#555] font-medium leading-relaxed max-w-sm">
              of toxic messages flagged this month contained minimizing language
            </div>
          </div>
        </div>

        <p className="font-dm-sans text-lg font-light text-[#444] leading-[1.8] mb-12">
          This month, 847 women analyzed messages through Mension. The most detected pattern: <strong className="font-semibold text-[#1A1A1A]">minimizing</strong> — "you're overreacting", "I never said that", "you're too sensitive."
        </p>

        <div className="space-y-6 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h4 className="font-dm-sans font-semibold text-xs uppercase tracking-widest text-gray-400 mb-6">Top minimizing phrases</h4>
          {[
            { phrase: "\"You're overreacting\"", val: 78 },
            { phrase: "\"I never said that\"", val: 65 },
            { phrase: "\"You're too sensitive\"", val: 71 }
          ].map((item, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
              <span className="font-dm-sans text-sm font-medium text-[#444] min-w-[160px]">{item.phrase}</span>
              <div className="h-2.5 bg-gray-100 rounded-full flex-1 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#9B82C4] to-[#6B4FA0] rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${item.val}%` }} 
                />
              </div>
              <span className="font-dm-sans text-xs font-bold text-[#6B4FA0] hidden sm:block">{item.val}%</span>
            </div>
          ))}
        </div>
      </section>

      {/* Community Confessions */}
      <section id="section-4" className="px-6 py-24 md:py-32 bg-[#F8F6FC] border-t border-purple-100/30">
        <div className="max-w-3xl mx-auto">
          <p className="font-dm-sans text-[11px] tracking-[0.25em] uppercase text-[#9B82C4] mb-6 font-semibold flex items-center gap-2">
            <Heart className="w-4 h-4" /> From Your Sisters
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal leading-[1.15] tracking-tight mb-16">
            Community<br />
            <span className="text-[#6B4FA0] italic">Confessions.</span>
          </h2>

          <div className="flex flex-col gap-8">
            {[
              { phase: "Luteal", text: "I almost sent a 14 paragraph voice note at 2am. Mension told me I was in luteal and to sleep on it. I did. I didn't send it. We're still together. 😭" },
              { phase: "Menstrual", text: "Day 1 cramps so bad I couldn't move. I opened Ova just to have someone to talk to. She stayed with me for an hour." },
              { phase: "Follicular", text: "Finally understood why I felt invincible last week and destroyed this week. It's just the cycle. I'm not broken." },
            ].map((c, i) => {
              const colors = phaseColors[c.phase] || { bg: "bg-purple-100", text: "text-purple-800" };
              return (
                <div key={i} className="group relative bg-white p-8 rounded-3xl border border-purple-50 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                  <span className={`inline-block font-dm-sans text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full mb-4 ${colors.bg} ${colors.text}`}>
                    {c.phase} Phase
                  </span>
                  <p className="font-serif text-xl md:text-2xl text-[#333] leading-relaxed italic text-balance">
                    "{c.text}"
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Luteal Ritual */}
      <section id="section-5" className="px-6 py-24 md:py-32 max-w-4xl mx-auto border-t border-purple-100/30">
        <div className="max-w-3xl mx-auto mb-16 text-center md:text-left">
          <p className="font-dm-sans text-[11px] tracking-[0.25em] uppercase text-[#9B82C4] mb-6 font-semibold">
            Luteal Phase Ritual
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal leading-[1.15] tracking-tight">
            What your body<br />
            <span className="text-[#6B4FA0] italic">is asking for.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { emoji: "🌙", title: "Slow down on purpose", body: "Your energy is contracting. Work with it, not against it.", bg: "bg-[#FDFCFF]" },
            { emoji: "💜", title: "Magnesium before bed", body: "Reduces progesterone crash symptoms. Dark chocolate counts.", bg: "bg-white" },
            { emoji: "🔥", title: "Heat over ice", body: "Warmth reduces cortisol. Cold showers can wait for follicular.", bg: "bg-white" },
            { emoji: "📵", title: "Read messages twice", body: "Your nervous system is amplified. What feels devastating may not be.", bg: "bg-[#FDFCFF]" },
          ].map((r, i) => (
            <div key={i} className={`${r.bg} border border-purple-100/60 rounded-3xl p-8 hover:shadow-lg hover:border-purple-200 transition-all group cursor-default`}>
              <div className="text-4xl mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform origin-bottom-left w-max">
                {r.emoji}
              </div>
              <h3 className="font-dm-sans text-lg font-bold text-[#1A1A1A] mb-3">{r.title}</h3>
              <p className="font-dm-sans text-sm font-light text-[#666] leading-relaxed">{r.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 border-t border-purple-100/30 mt-12">
        <div className="font-dm-sans text-[10px] md:text-xs text-[#9B82C4] tracking-[0.2em] uppercase font-medium">
          Mension Monthly · Issue 01
        </div>
        <div className="font-serif text-sm md:text-base text-[#9B82C4] italic flex items-center gap-2">
          It's not in your head. <Heart className="w-4 h-4 text-purple-400 fill-purple-400" />
        </div>
      </footer>
    </div>
  );
}
