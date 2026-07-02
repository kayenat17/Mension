"use client";

import React, { useState } from "react";
import { BookOpen, ArrowRight, ArrowLeft, Play, CheckCircle2 } from "lucide-react";
import MensionMonthly from "./MensionMonthly";
import ArchitectureOfSilence from "./ArchitectureOfSilence";
import WabiSabiThinking from "./WabiSabiThinking";
import DigitalFastJournal from "./DigitalFastJournal";

export default function ResetRoom({ setActiveTab }: { setActiveTab?: (tab: string) => void }) {
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [activeArticle, setActiveArticle] = useState<string | null>(null);

  if (activeArticle === 'architecture-of-silence') {
    return <ArchitectureOfSilence onClose={() => setActiveArticle(null)} />;
  }
  if (activeArticle === 'wabi-sabi-thinking') {
    return <WabiSabiThinking onClose={() => setActiveArticle(null)} />;
  }
  if (activeArticle === 'digital-fast-journal') {
    return <DigitalFastJournal onClose={() => setActiveArticle(null)} />;
  }

  if (isJournalOpen) {
    return (
      <div className="absolute inset-0 bg-white z-50 overflow-y-auto animate-slide-up flex-1 w-full h-full">
        <button
          onClick={() => setIsJournalOpen(false)}
          className="fixed top-6 left-6 z-[60] bg-white/80 backdrop-blur-md text-[#1A1A1A] px-4 py-2 rounded-full shadow-sm border border-purple-100 font-dm-sans font-bold text-sm flex items-center gap-2 hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Reset Room
        </button>
        <MensionMonthly />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto w-full animate-slide-up bg-[#F9F8F6]">
      {/* Container for main content (excluding full-bleed sections) */}
      <div className="px-4 md:px-8 py-12 md:py-20 max-w-7xl mx-auto space-y-24">

        {/* HERO SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-xs font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-600"></span>
              Volume 12: The Serene Issue
            </div>

            <h1 className="text-5xl md:text-7xl font-dm-sans font-bold text-charcoal tracking-tight leading-tight">
              The <br /> Reset Room
            </h1>

            <p className="text-lg text-warm-gray max-w-md font-light leading-relaxed">
              A space to vent, decompress, and realign your center. Sometimes the most productive thing you can do is let it all out.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={() => setIsJournalOpen(true)}
                className="px-8 py-4 bg-[#b31966] hover:bg-[#8c1350] text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Start Your Reset
              </button>
              <button
                onClick={() => document.getElementById('featured-stories')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-butter hover:bg-butter-dark text-charcoal font-bold rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                Explore Stories
              </button>
            </div>
          </div>

          {/* NOTEBOOK HERO IMAGE */}
          <div className="flex justify-center lg:justify-end relative">
            <div onClick={() => setIsJournalOpen(true)} className="relative group cursor-pointer w-full max-w-[320px] md:max-w-sm perspective-[1200px]">
              {/* Stack of pages (thickness) */}
              <div className="absolute top-3 left-6 right-[-12px] bottom-[-10px] bg-[#f0eae0] rounded-r-2xl border border-[#dcd6cc] shadow-lg transition-transform group-hover:translate-x-2 group-hover:translate-y-2 duration-500 ease-out z-0">
                <div className="absolute top-0 right-0 bottom-0 w-4 bg-[repeating-linear-gradient(transparent,transparent_3px,#e2dbd1_3px,#e2dbd1_4px)] opacity-60 rounded-r-2xl"></div>
              </div>

              {/* Notebook Cover */}
              <div className="relative z-10 w-full aspect-[3/4] bg-gradient-to-b from-[#e3eaec] via-[#a6b6c2] to-[#7559a3] rounded-l-md rounded-r-3xl shadow-2xl overflow-hidden transition-all duration-500 ease-out group-hover:-rotate-y-[4deg] origin-left border border-white/40 group-hover:shadow-3xl">
                {/* Glassmorphism ripple effect on cover - ethereal waves */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-50"></div>

                {/* Spine */}
                <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-black/20 via-transparent to-black/10 border-r border-white/20"></div>
                <div className="absolute top-0 bottom-0 left-6 w-px bg-black/10"></div>

                {/* Cover Content */}
                <div className="absolute inset-0 flex flex-col justify-between items-center p-8 z-30 pt-16">
                  <div className="text-center w-full">
                    <h3 className="font-headline-lg font-bold text-5xl text-white tracking-tight mb-0 text-center drop-shadow-md">
                      MENSION
                    </h3>
                    <p className="text-lg text-white font-medium tracking-[0.4em] uppercase drop-shadow-sm mt-1">
                      Monthly
                    </p>
                  </div>

                  <div className="text-center w-full">
                    <p className="text-white font-serif italic text-2xl drop-shadow-md">The Serene Issue</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); setIsJournalOpen(true); }}
                      className="mt-6 w-12 h-12 bg-butter rounded-full flex items-center justify-center mx-auto shadow-lg hover:scale-110 transition-transform border border-white/20"
                    >
                      <ArrowRight className="w-5 h-5 text-charcoal" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURED STORIES SECTION */}
        <section id="featured-stories" className="space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <h2 className="text-3xl font-dm-sans font-bold text-charcoal tracking-tight">Featured Stories</h2>
              <p className="text-warm-gray font-light">
                Curated perspectives on maintaining clarity in a noisy world. Exploring the intersection of design, mindfulness, and the human experience.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Story 1 */}
            <div className="group cursor-pointer" onClick={() => setActiveArticle('architecture-of-silence')}>
              <div className="w-full aspect-[4/5] rounded-3xl overflow-hidden mb-5 relative">
                <img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop" alt="Minimalist Interior" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <p className="text-xs font-bold text-lavender-dark uppercase tracking-wider mb-2">Wellness</p>
              <h3 className="text-xl font-bold text-charcoal mb-2 group-hover:text-lavender-dark transition-colors">The Architecture of Silence</h3>
              <p className="text-sm text-warm-gray font-light leading-relaxed">How physical spaces influence our mental state and the power of minimalist environments.</p>
            </div>
            {/* Story 2 */}
            <div className="group cursor-pointer" onClick={() => setActiveArticle('wabi-sabi-thinking')}>
              <div className="w-full aspect-[4/5] rounded-3xl overflow-hidden mb-5 relative">
                <img src="https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?q=80&w=800&auto=format&fit=crop" alt="Plant" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <p className="text-xs font-bold text-lavender-dark uppercase tracking-wider mb-2">Perspective</p>
              <h3 className="text-xl font-bold text-charcoal mb-2 group-hover:text-lavender-dark transition-colors">Wabi-Sabi Thinking</h3>
              <p className="text-sm text-warm-gray font-light leading-relaxed">Embracing imperfection as a path to genuine inner peace and creative freedom.</p>
            </div>
            {/* Story 3 */}
            <div className="group cursor-pointer" onClick={() => setActiveArticle('digital-fast-journal')}>
              <div className="w-full aspect-[4/5] rounded-3xl overflow-hidden mb-5 relative">
                <img src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800&auto=format&fit=crop" alt="Forest path" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <p className="text-xs font-bold text-lavender-dark uppercase tracking-wider mb-2">Daily Rituals</p>
              <h3 className="text-xl font-bold text-charcoal mb-2 group-hover:text-lavender-dark transition-colors">The Digital Fast</h3>
              <p className="text-sm text-warm-gray font-light leading-relaxed">Reclaiming your attention in the age of constant connection. A guide to offline presence.</p>
            </div>
          </div>
        </section>
      </div>

      {/* COMMUNITY VOICES (FULL BLEED) */}
      <section className="w-full bg-[#E6E0F8] py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl font-dm-sans font-bold text-charcoal text-center mb-12">Community Voices</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { text: "Finally a place where I don't have to be 'productive' about my mental health. Just letting it burn for a minute was exactly what I needed.", user: "@anon", color: "bg-pink-600" },
              { text: "The aesthetics alone are calming. It feels like stepping into a clean, quiet room after a long day in a crowded city.", user: "@anon", color: "bg-yellow-400" },
              { text: "I used the Reset Room during a panic moment. The prompt was simple and didn't judge. Life saver.", user: "@anon", color: "bg-purple-500" },
              { text: "The editorial quality is top-notch. I came for the tools but stay for the articles. Truly premium experience.", user: "@anon", color: "bg-pink-200" }
            ].map((quote, idx) => (
              <div key={idx} className="bg-white rounded-[24px] p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <p className="text-charcoal/80 italic text-sm leading-relaxed mb-8">"{quote.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${quote.color}`}></div>
                  <span className="text-xs font-bold text-charcoal">{quote.user}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DAILY CALM SECTION */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-32">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="w-full aspect-square rounded-[40px] overflow-hidden relative shadow-2xl group">
            <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000&auto=format&fit=crop" alt="Meditating" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
            {/* Gradient Overlay for bottom text */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent pointer-events-none"></div>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-pink-600 font-bold text-xs uppercase tracking-widest">The Daily Calm</p>
              <h2 className="text-5xl md:text-6xl font-dm-sans font-bold text-charcoal tracking-tight leading-tight">
                Find your <br /> quiet center.
              </h2>
              <p className="text-lg text-warm-gray font-light max-w-md leading-relaxed pt-2">
                Every day, we curate a single breath of fresh air. A guided meditation, a soundscape, or a simple breathing exercise designed to fit into your busy life.
              </p>
            </div>

            <div className="space-y-6 pt-4">
              <div className="flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-lavender-dark shrink-0" />
                <div>
                  <h4 className="font-bold text-charcoal text-sm mb-1">5-Minute Sessions</h4>
                  <p className="text-xs text-warm-gray font-light">Optimized for busy schedules without compromising depth.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-lavender-dark shrink-0" />
                <div>
                  <h4 className="font-bold text-charcoal text-sm mb-1">Spatial Audio Soundscapes</h4>
                  <p className="text-xs text-warm-gray font-light">Immerse yourself in nature recordings from around the globe.</p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => setActiveTab && setActiveTab('breathing')}
                className="px-8 py-4 bg-lavender-dark hover:bg-[#523d7a] text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-3"
              >
                Try Calm Space
                <div className="w-5 h-5 flex items-center justify-center border border-white/30 rounded-full">
                  <Play className="w-2.5 h-2.5 fill-white" />
                </div>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* FOOTER (FULL BLEED) */}
      <footer className="w-full bg-[#A8005A] py-24 text-center px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-4xl font-dm-sans font-bold text-white tracking-tight">Stay Centered</h2>
          <p className="text-white/80 font-light text-sm md:text-base px-8 pb-6">
            Get curated stories, research-backed wellness tips, and "The Reset Room" highlights delivered weekly.
          </p>
          <div className="inline-block px-8 py-4 bg-white/10 text-white rounded-full border border-white/20 backdrop-blur-sm shadow-inner cursor-default">
            <p className="text-sm font-semibold tracking-wide uppercase flex items-center gap-2">
              Newsletter Coming Soon <span className="text-xl">✨</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}