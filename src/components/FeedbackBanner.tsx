import React from "react";

export default function FeedbackBanner() {
  return (
    <div className="mt-8 mb-6 p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#FFF6A4]/40 via-white to-[#F9D5DB]/40 border border-[#FFF6A4]/20 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 rounded-full bg-butter flex items-center justify-center text-2xl shrink-0 shadow-inner">
          💌
        </div>
        <div>
          <h3 className="font-serif text-2xl font-bold text-charcoal mb-1">Help Mension Grow</h3>
          <p className="text-on-surface/70 font-sans text-sm max-w-md">Your experience shapes our journey. Share your thoughts, suggest new features, or just tell us how Ova is doing!</p>
        </div>
      </div>
      <a 
        href="https://docs.google.com/forms/d/e/1FAIpQLSdGvCgHJrFmfKmYk1wcrFRhMiKV_P4cWTeV-zZ_3L6rgG9d-w/viewform" 
        target="_blank" 
        rel="noopener noreferrer"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          window.open("https://docs.google.com/forms/d/e/1FAIpQLSdGvCgHJrFmfKmYk1wcrFRhMiKV_P4cWTeV-zZ_3L6rgG9d-w/viewform", "_blank");
        }}
        className="px-6 py-3 rounded-full bg-primary hover:bg-primary-dark text-white font-bold transition-all shadow-md hover:shadow-lg active:scale-95 shrink-0 cursor-pointer block text-center"
      >
        Share Feedback
      </a>
    </div>
  );
}
