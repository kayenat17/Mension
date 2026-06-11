"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import Community from "@/components/Community";
import OvaChat from "@/components/OvaChat";
import ResetRoom from "@/components/ResetRoom";
import BreathingPacer from "@/components/BreathingPacer";
import AuthModal from "@/components/AuthModal";
import { supabase, isSupabaseConfigured } from "@/utils/supabaseClient";

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [session, setSession] = useState<any>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes (magic link click redirects, login, signout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
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
      case "garden": // keeping 'garden' tab id for compatibility for now, but renders ResetRoom
        return <ResetRoom />;
      case "breathing":
        return <BreathingPacer />;
      default:
        return <Dashboard setActiveTab={setActiveTab} session={session} onLoginClick={() => setIsAuthOpen(true)} />;
    }
  };

  return (
    <>
      {/* Main Container */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        session={session} 
        onLoginClick={() => setIsAuthOpen(true)} 
      />
      
      <main className="flex-1 flex flex-col relative z-10 min-w-0 bg-[var(--background)]">
        {renderActiveComponent()}
      </main>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
