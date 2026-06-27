"use client";

import React, { useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";

export default function ArchitectureOfSilence({ onClose }: { onClose: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-10");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    if (containerRef.current) {
      const elements = containerRef.current.querySelectorAll("article section, article div, .bento-item");
      elements.forEach((el) => {
        el.classList.add("transition-all", "duration-700", "opacity-0", "translate-y-10");
        observer.observe(el);
      });
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="absolute inset-0 z-50 bg-[#fcf9f8] overflow-y-auto animate-slide-up flex-1 w-full h-full" ref={containerRef}>
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-[60] bg-[#fcf9f8]/80 backdrop-blur-xl shadow-sm transition-all duration-300 ease-in-out">
        <div className="flex justify-between items-center w-full px-4 md:px-16 py-4 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-4">
            <button 
              onClick={onClose} 
              className="text-[#1A1A1A] px-4 py-2 rounded-full shadow-sm border border-purple-100 bg-white font-bold text-sm flex items-center gap-2 hover:bg-gray-50 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Reset Room
            </button>
            <div className="font-sans font-bold text-2xl tracking-tighter text-[#1c1b1b]">Mension</div>
          </div>
        </div>
      </nav>

      <main className="pt-[80px]">
        {/* Hero Section: Magazine Cover Style */}
        <section className="min-h-[85vh] grid grid-cols-1 lg:grid-cols-12 items-center px-4 md:px-16 py-20 gap-6 overflow-hidden">
          {/* Image Side */}
          <div className="lg:col-span-7 h-[85vh] relative rounded-xl overflow-hidden shadow-xl hover:-translate-y-2 transition-transform duration-500">
            <img 
              className="w-full h-full object-cover" 
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop" 
              alt="Architecture"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-white">
              <span className="font-bold text-sm uppercase tracking-widest bg-[#b10e6b] px-3 py-1 rounded-full">Essence of Space</span>
            </div>
          </div>
          
          {/* Content Side */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-6 lg:pl-6 pt-12 lg:pt-0">
            <div className="space-y-3">
              <span className="text-[#b10e6b] font-bold text-sm uppercase tracking-widest block">Wellness &amp; Design</span>
              <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[1.1] text-[#1c1b1b]">
                The <span className="italic text-[#6b38d4]">Architecture</span> of Silence
              </h1>
            </div>
            <p className="font-sans text-lg text-[#494454] max-w-lg">
              How physical spaces influence our mental state and the profound power of minimalist environments in an overstimulated world.
            </p>
          </div>
        </section>

        {/* Article Body Section */}
        <article className="max-w-screen-xl mx-auto px-4 md:px-16 py-20 space-y-20">
          {/* Introduction */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 transition-all duration-700 opacity-0 translate-y-10">
            <div className="md:col-span-2 hidden md:block">
              <div className="sticky top-32 space-y-6">
                <div className="h-[2px] w-full bg-[#ffe24c]"></div>
                <p className="text-xs font-bold text-sm uppercase tracking-widest text-[#cbc3d7]">Introduction</p>
              </div>
            </div>
            <div className="md:col-span-7 md:col-start-4 space-y-6">
              <p className="font-sans text-lg text-2xl leading-relaxed first-letter:text-7xl first-letter:font-serif first-letter:text-[#6b38d4] first-letter:float-left first-letter:mr-3 first-letter:mt-2">
                Silence is not the absence of sound, but the presence of focus. In contemporary architecture, we are witnessing a shift from the purely functional to the atmospheric. The spaces we inhabit are silent witnesses to our psychological state, acting as mirrors to our inner complexity or as vessels for our peace.
              </p>
              <p className="font-sans text-base text-lg text-[#494454] leading-relaxed">
                When we remove the visual noise—the clutter, the jagged geometries, the aggressive saturations—we allow the mind to breathe. Minimalism, in this context, is not a stylistic choice but a neurological necessity.
              </p>
            </div>
          </div>

          {/* Pull Quote Section */}
          <div className="relative w-full py-20 overflow-hidden transition-all duration-700 opacity-0 translate-y-10">
            <div className="absolute inset-0 bg-[#fcdf46]/10 -skew-y-2 translate-y-4"></div>
            <div className="relative max-w-4xl mx-auto text-center px-6">
              <blockquote className="font-serif text-4xl md:text-6xl text-[#1c1b1b] leading-tight">
                "In the silence of a well-designed space, we find the volume of our own thoughts."
              </blockquote>
              <cite className="block mt-6 font-bold text-sm uppercase tracking-widest text-[#7b7486] not-italic">— Architectural Meditation</cite>
            </div>
          </div>

          {/* Bento Content Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-700 opacity-0 translate-y-10">
            {/* The Minimalist Mindset */}
            <div className="bg-[#f6f3f2] p-6 rounded-xl space-y-3 hover:-translate-y-2 transition-transform duration-500 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#8455ef] flex items-center justify-center text-[#fffbff]">
                  <span className="material-symbols-outlined">psychology</span>
                </div>
                <h3 className="font-sans font-bold text-2xl text-[#6b38d4]">The Minimalist Mindset</h3>
                <p className="text-[#494454]">Architecture serves as an externalized cognitive structure. By simplifying the environment, we reduce the cognitive load required to process spatial information, facilitating deeper meditation.</p>
              </div>
            </div>
            
            {/* Secondary Image */}
            <div className="rounded-xl overflow-hidden relative group h-80 lg:h-auto">
              <img 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop"
                alt="Minimalist interior"
              />
              <div className="absolute inset-0 bg-[#6b38d4]/20 mix-blend-overlay"></div>
            </div>
            
            {/* Light as a Catalyst */}
            <div className="bg-[#eae7e7] p-6 rounded-xl space-y-3 hover:-translate-y-2 transition-transform duration-500 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#fcdf46] flex items-center justify-center text-[#726200]">
                  <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>light_mode</span>
                </div>
                <h3 className="font-sans font-bold text-2xl text-[#726200]">Light as a Catalyst</h3>
                <p className="text-[#494454]">Natural light is the silent architect. It sculpts volume and defines time. In the architecture of silence, light is not just a utility; it is the primary emotional driver that connects us to the diurnal rhythm.</p>
              </div>
            </div>
            
            {/* Intentional Geometry */}
            <div className="lg:col-span-2 bg-[#ffd9e4] p-6 rounded-xl grid md:grid-cols-2 gap-6 items-center">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#d23284] flex items-center justify-center text-[#fffbff]">
                  <span className="material-symbols-outlined">category</span>
                </div>
                <h3 className="font-sans font-bold text-2xl text-[#b10e6b]">Intentional Geometry</h3>
                <p className="text-[#494454]">Curves that mimic the natural world, coupled with straight lines that provide structural security, create a balanced psychological landscape. Geometry dictates the flow of energy and our path through the void.</p>
              </div>
              <div className="h-64 rounded-lg overflow-hidden shadow-inner">
                <img 
                  className="w-full h-full object-cover" 
                  src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1000&auto=format&fit=crop"
                  alt="Abstract architectural detail"
                />
              </div>
            </div>
          </div>
        </article>

      </main>
    </div>
  );
}
