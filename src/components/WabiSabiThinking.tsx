"use client";

import React, { useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";

export default function WabiSabiThinking({ onClose }: { onClose: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("opacity-100", "translate-y-0");
          entry.target.classList.remove("opacity-0", "translate-y-10");
        }
      });
    }, observerOptions);

    if (containerRef.current) {
      const elements = containerRef.current.querySelectorAll(".fade-in-el");
      elements.forEach((el) => {
        el.classList.add("transition-all", "duration-1000", "opacity-0", "translate-y-10");
        observer.observe(el);
      });
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="absolute inset-0 z-50 bg-[#fcf9f8] text-[#1c1b1b] font-sans overflow-y-auto animate-slide-up flex-1 w-full h-full" ref={containerRef}>
      {/* TopAppBar */}
      <nav className="fixed top-0 w-full z-[60] bg-[#fcf9f8]/80 backdrop-blur-xl shadow-sm transition-all duration-300 ease-in-out px-4 md:px-16 h-20 flex justify-between items-center max-w-screen-2xl mx-auto left-0 right-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose} 
            className="text-[#1A1A1A] px-4 py-2 rounded-full shadow-sm border border-purple-100 bg-white font-bold text-sm flex items-center gap-2 hover:bg-gray-50 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Reset Room
          </button>
          <div className="font-sans font-extrabold text-3xl tracking-tighter text-[#1c1b1b]">Mension</div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative w-full h-[100vh] flex items-end overflow-hidden pt-[80px]">
        <img 
          className="absolute inset-0 w-full h-full object-cover object-center" 
          src="https://images.unsplash.com/photo-1490682143684-14369e18dce8?q=80&w=1600&auto=format&fit=crop"
          alt="Wabi Sabi Nature"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#fcf9f8] via-transparent to-transparent opacity-60"></div>
        <div className="relative z-10 w-full px-4 md:px-16 pb-20 flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="max-w-4xl">
            <span className="inline-block px-3 py-1 bg-[#ffd9e4] text-[#8c0053] font-bold text-sm tracking-[0.2em] mb-6 uppercase">Perspective</span>
            <h1 className="font-serif text-6xl md:text-8xl lg:text-[8vw] leading-none text-[#1c1b1b] tracking-tighter mb-3">Wabi-Sabi Thinking</h1>
            <p className="font-sans font-bold text-2xl max-w-xl text-[#494454] italic">Embracing imperfection as a path to genuine inner peace and creative freedom.</p>
          </div>
          <div className="hidden md:block pb-2">
            <span className="material-symbols-outlined text-[48px] animate-bounce text-[#6b38d4]">arrow_downward</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 bg-[#fcf9f8]">
        {/* Content Intro */}
        <article className="max-w-[720px] mx-auto px-4 pt-20 pb-12">
          <div className="fade-in-el">
            <p className="font-sans text-lg first-letter:text-6xl first-letter:font-serif first-letter:float-left first-letter:mr-2 first-letter:mt-1 text-[#494454] leading-relaxed mb-12">
              In a world obsessed with the pursuit of flawless execution and digital perfection, there exists a profound, quiet wisdom in the ancient Japanese philosophy of Wabi-Sabi. It is the aesthetic of things modest and humble; the beauty of things unconventional. Wabi-Sabi Thinking invites us to look closer at the weathered wood, the cracked pottery, and the fleeting seasons of our own lives—not as flaws to be fixed, but as narratives of resilience to be honored.
            </p>
            <h2 className="font-serif text-3xl md:text-4xl mb-6 text-[#1c1b1b]">The Creative Alchemy of Gold</h2>
            <p className="font-sans text-base text-[#494454] mb-12 leading-loose">
              At the heart of this philosophy lies the practice of Kintsugi—the art of repairing broken ceramics with lacquer mixed with powdered gold. Instead of hiding the fracture, the artist illuminates it. This physical metaphor extends into our creative psyche. When we stop fearing the "broken" parts of our process—the failed drafts, the messy sketches, the uncertain transitions—we allow our creative freedom to emerge. The gold is not in the original form, but in the transformation.
            </p>
          </div>

          {/* Pull Quote */}
          <div className="my-20 border-l-4 border-[#b10e6b] pl-12 py-6 fade-in-el bg-[#f6f3f2] rounded-r-xl shadow-sm">
            <blockquote className="font-serif italic text-2xl md:text-3xl text-[#8c0053] leading-tight mb-2">
              "In the cracks of the broken, we find the gold of our own resilience."
            </blockquote>
            <cite className="font-bold text-sm text-[#7b7486] uppercase tracking-widest">— Editorial Perspective</cite>
          </div>

          <div className="fade-in-el">
            <h2 className="font-serif text-3xl md:text-4xl mb-6 text-[#1c1b1b]">Finding Peace in the Imperfect</h2>
            <p className="font-sans text-base text-[#494454] mb-6 leading-loose">
              Application of Wabi-Sabi Thinking begins with acceptance. It is a radical departure from the comparison-driven culture of social media. To find peace in the imperfect is to acknowledge three simple realities: nothing lasts, nothing is finished, and nothing is perfect.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
              <div className="p-6 bg-[#ffe24c]/20 rounded-xl border border-[#e2c62d]/30">
                <span className="material-symbols-outlined text-[#6d5e00] mb-3">history</span>
                <h3 className="font-bold text-sm text-[#211b00] mb-1">Anicca</h3>
                <p className="text-xs text-[#524600]">Impermanence. Every state is transient; value the "now" before it shifts.</p>
              </div>
              <div className="p-6 bg-[#ffd9e4]/20 rounded-xl border border-[#ffb0cd]/30">
                <span className="material-symbols-outlined text-[#b10e6b] mb-3">architecture</span>
                <h3 className="font-bold text-sm text-[#3e0022] mb-1">Mushin</h3>
                <p className="text-xs text-[#8c0053]">Freedom from attachment. Let the creative work breathe its own life.</p>
              </div>
              <div className="p-6 bg-[#e9ddff]/20 rounded-xl border border-[#d0bcff]/30">
                <span className="material-symbols-outlined text-[#6b38d4] mb-3">nature_people</span>
                <h3 className="font-bold text-sm text-[#23005c] mb-1">Yugen</h3>
                <p className="text-xs text-[#5516be]">Profound grace. Seeing the deep beauty in the subtle and overlooked.</p>
              </div>
            </div>
          </div>

          {/* Bento Visual Break */}
          <div className="grid grid-cols-1 md:grid-cols-6 grid-rows-2 gap-3 h-auto md:h-[600px] my-20 fade-in-el">
            <div className="md:col-span-4 row-span-2 overflow-hidden rounded-xl shadow-lg group h-64 md:h-auto">
              <img 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=1000&auto=format&fit=crop"
                alt="Macro ceramic with gold crack"
              />
            </div>
            <div className="md:col-span-2 row-span-1 overflow-hidden rounded-xl shadow-lg group h-48 md:h-auto">
              <img 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1000&auto=format&fit=crop"
                alt="Nature"
              />
            </div>
            <div className="md:col-span-2 row-span-1 bg-[#fcdf46] flex items-center justify-center p-6 rounded-xl shadow-lg h-48 md:h-auto">
              <p className="font-serif italic text-2xl text-[#726200] text-center">Simplicity is the ultimate sophistication.</p>
            </div>
          </div>

          <div className="fade-in-el">
            <h2 className="font-serif text-3xl md:text-4xl mb-6 text-[#1c1b1b]">Integrating the Practice</h2>
            <p className="font-sans text-base text-[#494454] mb-12 leading-loose">
              To integrate Wabi-Sabi into your daily existence, start by stripping away the non-essential. It isn't just about minimalism—it's about intentionality. When you design, write, or lead, allow the "happy accidents" to remain. A stutter in a video, a rough edge on a brand mark, or an unscripted moment in a speech often provides the human connection that sterile perfection lacks.
            </p>
            
            <div className="bg-[#e5e2e1] p-12 rounded-xl mb-20">
              <h4 className="font-bold text-sm text-[#6b38d4] mb-6 uppercase tracking-tighter">A Guide to Perspective</h4>
              <ul className="space-y-6">
                <li className="flex gap-6">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#6b38d4] text-white flex items-center justify-center font-bold">1</span>
                  <div>
                    <p className="font-bold text-[#1c1b1b]">Observe Decay</p>
                    <p className="text-xs text-[#494454]">Notice how autumn leaves or old buildings gain character over time. Apply this appreciation to your own history.</p>
                  </div>
                </li>
                <li className="flex gap-6">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#6b38d4] text-white flex items-center justify-center font-bold">2</span>
                  <div>
                    <p className="font-bold text-[#1c1b1b]">Resist the Undo</p>
                    <p className="text-xs text-[#494454]">In digital work, try to work without 'Cmd+Z' for an hour. Let the deviations guide the final result.</p>
                  </div>
                </li>
                <li className="flex gap-6">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#6b38d4] text-white flex items-center justify-center font-bold">3</span>
                  <div>
                    <p className="font-bold text-[#1c1b1b]">Honest Materials</p>
                    <p className="text-xs text-[#494454]">Choose textures and tools that have weight and history. The friction of reality breeds better ideas.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}
