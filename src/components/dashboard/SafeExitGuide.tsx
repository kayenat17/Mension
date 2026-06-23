"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";

interface SafeExitGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SafeExitGuide({ isOpen, onClose }: SafeExitGuideProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-red-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-red-50 text-warm-gray hover:text-red-500 transition-colors cursor-pointer"
        >
          ✕
        </button>

        <div className="flex items-center gap-2 mb-6">
          <ShieldCheck className="w-6 h-6 text-purple-600" />
          <h3 className="font-dm-sans font-bold text-2xl text-charcoal">Safe Exit Guide</h3>
        </div>

        <p className="text-sm text-charcoal/80 mb-8 leading-relaxed">
          If you're feeling unsafe or realizing it's time to leave, you don't have to do it alone. Here are practical, step-by-step actions you can take to protect yourself. Take what you need, at your own pace.
        </p>

        <div className="space-y-6">
          {/* Step 1 */}
          <div className="bg-purple-50/50 border border-purple-100 p-5 rounded-2xl">
            <h4 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
              <span className="bg-purple-200 text-purple-800 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
              Document Evidence Safely
            </h4>
            <p className="text-sm text-charcoal/80 leading-relaxed">
              Take screenshots of manipulative or threatening messages. Email them to a secure, hidden account or send them to a trusted friend. Delete the evidence from your phone if you suspect your device is being monitored.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl">
            <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
              <span className="bg-blue-200 text-blue-800 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
              Tell a Trusted Person
            </h4>
            <p className="text-sm text-charcoal/80 leading-relaxed">
              Abuse thrives in isolation. Pick one trusted person—a friend, sister, colleague, or professional—and tell them the truth about what is happening. Establishing a code word for emergencies can be life-saving.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-green-50/50 border border-green-100 p-5 rounded-2xl">
            <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2">
              <span className="bg-green-200 text-green-800 w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
              Financial Independence
            </h4>
            <p className="text-sm text-charcoal/80 leading-relaxed">
              Start setting aside emergency cash or open a secret bank account if you can safely do so. Gather essential documents (passports, Aadhar card, banking details, property papers) and keep them in a safe location outside your home.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-amber-50/50 border border-amber-100 p-5 rounded-2xl">
            <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
              <span className="bg-amber-200 text-amber-800 w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
              Safety Planning
            </h4>
            <p className="text-sm text-charcoal/80 leading-relaxed">
              Identify the safest rooms in your house (avoid kitchens or rooms with weapons). Plan an escape route. Turn off location sharing on your phone and social media apps. If you fear immediate violence, do not confront them; leave when they are not home.
            </p>
          </div>

          {/* Step 5 */}
          <div className="bg-red-50/50 border border-red-100 p-5 rounded-2xl">
            <h4 className="font-bold text-red-900 mb-3 flex items-center gap-2">
              <span className="bg-red-200 text-red-800 w-6 h-6 rounded-full flex items-center justify-center text-xs">5</span>
              Professional Help (India)
            </h4>
            <div className="space-y-3">
              <div className="bg-white p-3 rounded-xl border border-red-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="font-bold text-charcoal block text-sm">National Commission for Women</span>
                  <span className="text-xs text-warm-gray">24/7 Helpline for women in distress</span>
                </div>
                <a href="tel:7827170170" className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-200">7827170170</a>
              </div>
              <div className="bg-white p-3 rounded-xl border border-red-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="font-bold text-charcoal block text-sm">iCall Helpline</span>
                  <span className="text-xs text-warm-gray">Psychosocial counseling (Mon-Sat)</span>
                </div>
                <a href="tel:9152987821" className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-200">9152987821</a>
              </div>
              <div className="bg-white p-3 rounded-xl border border-red-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="font-bold text-charcoal block text-sm">Vandrevala Foundation</span>
                  <span className="text-xs text-warm-gray">24/7 Mental health crisis support</span>
                </div>
                <a href="tel:9999666555" className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-200">9999 666 555</a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-lavender/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-lavender-light hover:bg-lavender text-charcoal font-bold rounded-2xl transition-all shadow-sm cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
