"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import Community from "@/components/Community";
import OvaChat from "@/components/OvaChat";
import ResetRoom from "@/components/ResetRoom";
import BreathingPacer from "@/components/BreathingPacer";
import CravePantryTab from "@/components/CravePantryTab";
import AuthModal from "@/components/AuthModal";
import { supabase, isSupabaseConfigured } from "@/utils/supabaseClient";

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [session, setSession] = useState<any>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [showLanding, setShowLanding] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      // If user is already logged in, skip the landing page
      if (session) {
        setShowLanding(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setShowLanding(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard setActiveTab={setActiveTab} session={session} onLoginClick={() => setIsAuthOpen(true)} />;
      case "community":
        return <Community session={session} onLoginClick={() => setIsAuthOpen(true)} />;
      case "chat":
        return <OvaChat />;
      case "garden":
        return <ResetRoom setActiveTab={setActiveTab} />;
      case "breathing":
        return <BreathingPacer />;
      case "crave-pantry":
        return <CravePantryTab />;
      default:
        return <Dashboard setActiveTab={setActiveTab} session={session} onLoginClick={() => setIsAuthOpen(true)} />;
    }
  };

  if (showLanding) {
    return (
      <div className="min-h-screen bg-[#EEF2F6] relative overflow-hidden flex flex-col items-center justify-center font-sans p-6 md:p-12">
        <div className="w-full max-w-4xl bg-white rounded-[40px] p-12 md:p-20 text-center relative overflow-hidden shadow-[0_20px_60px_rgba(107,79,160,0.06)] border border-white/50">
          <div className="relative z-10 flex flex-col items-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-serif text-[#121211] tracking-tight leading-tight">
              Does this text mean what I think it means?
            </h1>
            <p className="text-lg md:text-xl font-sans font-medium text-[#121211]/60 max-w-lg mx-auto">
              Paste a message that left you confused. We'll align it with your cycle to find clarity.
            </p>
            <button
              onClick={() => setShowLanding(false)}
              className="mt-6 px-10 py-5 rounded-full bg-[#D2EBBF] hover:bg-[#c2e3ab] text-[#121211] font-bold text-lg transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              Analyze a Message
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main Container */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        session={session} 
        onLoginClick={() => setIsAuthOpen(true)} 
      />
      
      <main className="flex-1 flex flex-col relative z-10 min-w-0 min-h-0 overflow-hidden bg-white pb-24 md:pb-0">
        {renderActiveComponent()}
      </main>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} /> 
    </>
  );
}
