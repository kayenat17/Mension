import re
import os

with open("article.html", "r") as f:
    html = f.read()

# Extract main content (everything between <main>...</main>)
# Also, we might want the intersection observer logic, but we can do that in React

main_match = re.search(r'<main.*?>(.*?)</main>', html, re.DOTALL | re.IGNORECASE)
if not main_match:
    main_match = re.search(r'<body.*?>(.*?)</body>', html, re.DOTALL | re.IGNORECASE)
main_html = main_match.group(1) if main_match else html

# Replace class= with className=
jsx = main_html.replace('class="', 'className="')

# Close self-closing tags: img, input, br, hr
jsx = re.sub(r'<(img|input|br|hr)([^>]*?)(?<!/)>', r'<\1\2 />', jsx)
jsx = re.sub(r'style="(.*?)"', '', jsx) # strip inline styles for simplicity since they might contain errors

# Replace colors according to the config
color_map = {
    "bg-background": "bg-[#fcf9f8]",
    "text-on-background": "text-[#1c1b1b]",
    "bg-surface": "bg-[#fcf9f8]",
    "text-tertiary": "text-[#b10e6b]",
    "text-primary": "text-[#6b38d4]",
    "text-on-surface-variant": "text-[#494454]",
    "bg-outline-variant": "bg-[#cbc3d7]",
    "text-outline": "text-[#7b7486]",
    "bg-primary": "bg-[#6b38d4]",
    "text-on-primary": "text-[#ffffff]",
    "bg-secondary-fixed": "bg-[#ffe24c]",
    "bg-secondary-container": "bg-[#fcdf46]",
    "text-on-secondary-container": "text-[#726200]",
    "bg-surface-container-low": "bg-[#f6f3f2]",
    "bg-primary-container": "bg-[#8455ef]",
    "text-on-primary-container": "text-[#fffbff]",
    "bg-surface-container-high": "bg-[#eae7e7]",
    "text-secondary": "text-[#6d5e00]",
    "bg-tertiary-fixed": "bg-[#ffd9e4]",
    "bg-tertiary-container": "bg-[#d23284]",
    "text-on-tertiary-container": "text-[#fffbff]",
    "bg-surface-container": "bg-[#f0eded]",
    "bg-on-background": "bg-[#1c1b1b]",
    "text-background": "text-[#fcf9f8]",
    "text-on-surface": "text-[#1c1b1b]"
}

# we need to be careful with things like text-primary-container vs text-primary
# Sort keys by length descending to match longest first
for k in sorted(color_map.keys(), key=len, reverse=True):
    # Regex to match the class name with word boundaries
    jsx = re.sub(r'\b' + re.escape(k) + r'\b', color_map[k], jsx)

# Replace other custom config classes
spacing_map = {
    "px-margin-desktop": "px-16",
    "px-margin-mobile": "px-4",
    "py-xl": "py-20",
    "gap-gutter": "gap-6",
    "bottom-md": "bottom-6",
    "left-md": "left-6",
    "gap-md": "gap-6",
    "pt-base": "pt-2",
    "pt-md": "pt-6",
    "px-xl": "px-20",
    "space-y-xl": "space-y-20",
    "space-y-md": "space-y-6",
    "space-y-sm": "space-y-3",
    "mb-md": "mb-6",
    "mt-md": "mt-6",
    "p-md": "p-6",
    "p-lg": "p-12",
    "p-xl": "p-20",
    "pb-xl": "pb-20",
    "mt-xl": "mt-20",
    "px-md": "px-6",
    "py-4": "py-4", # standard
    "px-3": "px-3", # standard
    "gap-base": "gap-2",
    "px-lg": "px-12",
}

for k in sorted(spacing_map.keys(), key=len, reverse=True):
    jsx = re.sub(r'\b' + re.escape(k) + r'\b', spacing_map[k], jsx)

font_map = {
    "font-serif-display": "font-serif",
    "font-label-bold": "font-bold text-sm uppercase tracking-widest",
    "text-label-bold": "",
    "font-body-lg": "font-sans text-lg",
    "text-body-lg": "",
    "font-headline-md": "font-sans font-bold text-2xl",
    "text-headline-md": "",
    "font-body-md": "font-sans text-base",
    "text-body-md": ""
}

for k in sorted(font_map.keys(), key=len, reverse=True):
    jsx = re.sub(r'\b' + re.escape(k) + r'\b', font_map[k], jsx)

# Format the final component
component = f"""
"use client";
import React, {open('{')} useEffect, useRef {close('}')} from "react";
import {open('{')} ArrowLeft {close('}')} from "lucide-react";

export default function ArchitectureOfSilence({open('{')} onClose {close('}')}: {open('{')} onClose: () => void {close('}')}) {open('{')}
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {open('{')}
    const observer = new IntersectionObserver((entries) => {open('{')}
      entries.forEach((entry) => {open('{')}
        if (entry.isIntersecting) {open('{')}
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-10');
        {close('}')}
      {close('}')});
    {close('}')}, {open('{')} threshold: 0.1, rootMargin: '0px 0px -50px 0px' {close('}')});

    if (containerRef.current) {open('{')}
      const elements = containerRef.current.querySelectorAll('article section, article div, .bento-item');
      elements.forEach((el) => {open('{')}
        el.classList.add('transition-all', 'duration-700', 'opacity-0', 'translate-y-10');
        observer.observe(el);
      {close('}')});
    {close('}')}

    return () => observer.disconnect();
  {close('}')}, []);

  return (
    <div className="absolute inset-0 z-50 bg-[#fcf9f8] overflow-y-auto animate-slide-up flex-1 w-full h-full" ref={open('{')}containerRef{close('}')}>
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-[60] bg-[#fcf9f8]/80 backdrop-blur-xl shadow-sm transition-all duration-300 ease-in-out">
        <div className="flex justify-between items-center w-full px-16 py-4 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-4">
            <button 
              onClick={open('{')}onClose{close('}')} 
              className="text-[#1A1A1A] px-4 py-2 rounded-full shadow-sm border border-purple-100 bg-white font-bold text-sm flex items-center gap-2 hover:bg-gray-50 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Reset Room
            </button>
            <div className="font-sans font-bold text-2xl font-extrabold tracking-tighter text-[#1c1b1b]">Mension</div>
          </div>
        </div>
      </nav>

      <main className="pt-[80px]">
        {jsx}
      </main>
    </div>
  );
{close('}')}
""".replace(open('{'), '{').replace(close('}'), '}')

with open("ArchitectureOfSilence.tsx", "w") as f:
    f.write(component)
