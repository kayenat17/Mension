"use client";

import React, { useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";

export default function DigitalFastJournal({ onClose }: { onClose: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("opacity-100", "translate-y-0");
          entry.target.classList.remove("opacity-0", "translate-y-10");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    if (containerRef.current) {
      const sections = containerRef.current.querySelectorAll("section");
      sections.forEach((section) => {
        section.classList.add("transition-all", "duration-1000", "ease-out", "opacity-0", "translate-y-10");
        observer.observe(section);
      });
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="absolute inset-0 z-50 bg-[#fcf9f8] text-[#1c1b1b] font-sans overflow-y-auto animate-slide-up flex-1 w-full h-full" ref={containerRef}>
      {/* TopAppBar Component */}
      <header ref={headerRef} className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-[#fcf9f8]/80 transition-all duration-300">
        <div className="flex justify-between items-center w-full py-6 px-4 md:px-16 transition-all duration-300">
          <button 
            onClick={onClose} 
            className="text-[#1A1A1A] px-4 py-2 rounded-full shadow-sm border border-purple-100 bg-white font-bold text-sm flex items-center gap-2 hover:bg-gray-50 transition-all z-10"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Reset Room
          </button>
          <div className="font-sans text-3xl md:text-4xl uppercase tracking-widest text-[#1c1b1b] text-center font-extrabold absolute left-0 right-0 pointer-events-none">
            LUMINA
          </div>
        </div>
      </header>

      <main className="pt-[160px]">
        {/* Hero Cover Section */}
        <section className="relative h-[90vh] w-full px-4 md:px-16 mb-20 overflow-hidden transition-all duration-1000 ease-out">
          <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl flex flex-col items-center justify-end pb-20 px-6 group">
            {/* Main Hero Image */}
            <div className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" 
                 style={{ backgroundImage: "url('https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=1600&auto=format&fit=crop')" }}>
              <div className="absolute inset-0 bg-gradient-to-t from-[#1c1b1b]/60 via-transparent to-transparent"></div>
            </div>
            
            {/* Hero Content Overlay */}
            <div className="relative z-10 text-center max-w-4xl">
              <span className="inline-block px-6 py-1 bg-[#fcdf46] text-[#726200] font-bold text-sm rounded-full mb-6 animate-fade-in">
                DAILY RITUALS
              </span>
              <h1 className="font-serif italic text-6xl md:text-8xl text-[#fcf9f8] mb-6 leading-tight">
                The Digital Fast
              </h1>
              <p className="font-sans font-bold text-2xl text-[#fcf9f8]/90 max-w-2xl mx-auto font-light tracking-wide">
                Reclaiming your attention in the age of constant connection. A guide to offline presence.
              </p>
            </div>
          </div>
        </section>

        {/* Reading Layout Container */}
        <article className="max-w-3xl mx-auto px-4 md:px-0 rounded-3xl py-20" style={{ background: "radial-gradient(circle at top right, rgba(132, 85, 239, 0.08), transparent), radial-gradient(circle at bottom left, rgba(252, 223, 70, 0.1), transparent)" }}>
          
          {/* Section 1: Introduction */}
          <section className="mb-20 transition-all duration-1000 ease-out">
            <h2 className="font-serif text-3xl md:text-4xl text-[#6b38d4] mb-12 border-b border-[#cbc3d7]/30 pb-3">
              The Cost of Connection
            </h2>
            <div className="space-y-6 font-sans text-lg text-[#494454] leading-relaxed">
              <p className="first-letter:float-left first-letter:text-7xl first-letter:leading-[4rem] first-letter:pt-1 first-letter:pr-3 first-letter:font-serif first-letter:text-[#6b38d4]">
                In an era where the average person touches their smartphone over two thousand times a day, the concept of silence has become a radical act of rebellion. We are living through a grand experiment in cognitive fragmentation, where the notification bell has replaced the natural rhythm of our thoughts.
              </p>
              <p>
                The toll is not merely academic; it is felt in the persistent low-level anxiety of the 'unread' badge, the thinning of our attention spans, and the erosion of deep, contemplative thought. To be constantly connected is to be constantly elsewhere, never truly present in the room where our lives are actually happening.
              </p>
            </div>
          </section>

          {/* Section 2: The Ritual */}
          <section className="mb-20 p-12 bg-[#f6f3f2] rounded-xl border-l-4 border-[#6b38d4] transition-all duration-1000 ease-out">
            <h2 className="font-serif text-3xl md:text-4xl text-[#b10e6b] mb-6">
              The Ritual
            </h2>
            <p className="font-sans text-lg text-[#1c1b1b] mb-6 italic">
              How to fast from the digital world without losing your place in it.
            </p>
            <div className="space-y-2 font-sans text-base text-[#494454]">
              <p className="mb-4">
                The Digital Fast is not about becoming a Luddite; it is about intentionality. It is the practice of carving out sacred spaces—both in time and geography—where the digital world is strictly forbidden. It begins with a sunset ritual: the phone is placed in a designated 'sleeping' drawer, and the mind is allowed to settle.
              </p>
              <p>
                This ritual demands a return to the tactile. A paper book, a charcoal pencil, the feel of dough between fingers. By engaging the senses that the screen ignores, we re-anchor ourselves in the physical reality of the present moment.
              </p>
            </div>
          </section>

          {/* Section 3: Pull Quote */}
          <section className="my-20 flex flex-col items-center text-center transition-all duration-1000 ease-out">
            <div className="w-16 h-1 bg-[#fcdf46] mb-12"></div>
            <blockquote className="font-serif italic text-2xl md:text-3xl lg:text-4xl text-[#1c1b1b] px-6 leading-snug">
              "In the absence of notification, we find the notification of our own soul."
            </blockquote>
            <div className="w-16 h-1 bg-[#fcdf46] mt-12"></div>
          </section>

          {/* Section 4: Practical Steps */}
          <section className="mb-20 bg-[#fcf9f8] p-12 md:p-20 rounded-2xl border border-[#cbc3d7]/20 shadow-sm transition-all duration-1000 ease-out">
            <h2 className="font-sans text-3xl md:text-4xl text-[#1c1b1b] mb-12 flex items-center gap-3">
              <span className="material-symbols-outlined text-[#6b38d4]" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
              Steps for Offline Presence
            </h2>
            <ul className="space-y-12">
              <li className="flex gap-6 group">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#e9ddff] flex items-center justify-center text-[#6b38d4] font-bold transition-all group-hover:bg-[#6b38d4] group-hover:text-white">
                  01
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase text-[#6b38d4] mb-1">Analog Mornings</h3>
                  <p className="text-base text-[#494454] leading-relaxed">
                    Commit to the first sixty minutes of your day without a screen. Use this time for movement, meditation, or a quiet breakfast. Allow your own thoughts to populate your mind before the world's noise intervenes.
                  </p>
                </div>
              </li>
              <li className="flex gap-6 group">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#ffd9e4] flex items-center justify-center text-[#b10e6b] font-bold transition-all group-hover:bg-[#b10e6b] group-hover:text-white">
                  02
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase text-[#b10e6b] mb-1">The Phone Foyer</h3>
                  <p className="text-base text-[#494454] leading-relaxed">
                    Designate a spot near your entrance as the 'phone dock.' When you return home, your device stays there. Treat your home as a sanctuary where external pings are not permitted to cross the threshold.
                  </p>
                </div>
              </li>
              <li className="flex gap-6 group">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#ffe24c] flex items-center justify-center text-[#6d5e00] font-bold transition-all group-hover:bg-[#6d5e00] group-hover:text-white">
                  03
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase text-[#6d5e00] mb-1">Monotasking Mandate</h3>
                  <p className="text-base text-[#494454] leading-relaxed">
                    Practice the art of doing only one thing. If you are eating, just eat. If you are walking, just walk. Rediscover the richness of a single experience unmediated by a lens or a scroll.
                  </p>
                </div>
              </li>
            </ul>
          </section>

          {/* Decorative Footer Element */}
          <div className="flex justify-center mt-20 opacity-20">
            <span className="material-symbols-outlined text-6xl">blur_on</span>
          </div>
        </article>
      </main>
    </div>
  );
}
