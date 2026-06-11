"use client";

import React, { useState } from "react";
import { X, Mail, Sparkles, AlertCircle, CheckCircle } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/utils/supabaseClient";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email.trim()) {
      setErrorMsg("Please enter your email address.");
      return;
    }

    if (!isSupabaseConfigured()) {
      setErrorMsg(
        "Supabase is not configured yet. Please update NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file."
      );
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        },
      });

      if (error) {
        throw error;
      }

      setSuccessMsg("Check your inbox! We've sent you a magic sign-in link.");
      setEmail("");
    } catch (err: any) {
      console.error("Auth error:", err);
      setErrorMsg(err.message || "Failed to send magic link. Please check your email and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/30 backdrop-blur-sm animate-fade-in">
      {/* Modal Card */}
      <div className="relative w-full max-w-md glass-panel rounded-3xl p-6 md:p-8 bg-white/95 border-lavender shadow-2xl animate-scale-in">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-warm-gray hover:text-charcoal hover:bg-lavender-light/50 transition-colors"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-2 mt-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-lavender to-butter flex items-center justify-center shadow-md">
            <Sparkles className="w-6 h-6 text-charcoal/80" />
          </div>
          <h3 className="font-dm-sans font-bold text-xl text-charcoal">Save Your Pattern Memory</h3>
          <p className="text-xs text-warm-gray max-w-[280px]">
            Sign in with email only to securely sync your message logs and unlock Ova's behavioral pattern recognition.
          </p>
        </div>

        {/* Content */}
        {successMsg ? (
          <div className="space-y-4 py-4 text-center animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-sm font-semibold text-charcoal leading-relaxed">{successMsg}</p>
            <p className="text-xs text-warm-gray">You can close this window now. Click the link in your email to automatically sign in.</p>
            <button
              onClick={onClose}
              className="w-full mt-2 py-2.5 bg-lavender-light hover:bg-lavender text-charcoal text-xs font-semibold rounded-2xl border border-lavender/50 transition-all-300"
            >
              Okay, Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSendMagicLink} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="auth-email" className="block text-[10px] font-bold text-charcoal uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 w-4 h-4 text-warm-gray/60" />
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMsg) setErrorMsg("");
                  }}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-lavender text-sm focus:outline-none focus:ring-2 focus:ring-lavender-dark focus:border-transparent bg-white/70 text-charcoal placeholder-warm-gray/40"
                  disabled={isLoading}
                />
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs text-red-500 font-semibold flex items-center gap-1.5 leading-normal">
                <AlertCircle className="w-4.5 h-4.5 text-red-500 shrink-0" />
                <span>{errorMsg}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-2xl font-semibold text-sm transition-all-300 shadow-md flex items-center justify-center gap-2 hover:scale-[1.01] ${
                isLoading 
                  ? "bg-gray-100 text-gray-300 cursor-not-allowed border-transparent"
                  : "bg-butter hover:bg-butter-dark text-charcoal border border-butter-dark"
              }`}
            >
              <span>{isLoading ? "Sending Magic Link..." : "Send Magic Link"}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
