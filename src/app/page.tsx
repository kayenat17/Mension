"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import Community from "@/components/Community";
import OvaChat from "@/components/OvaChat";
import ResetRoom from "@/components/ResetRoom";
import BreathingPacer from "@/components/BreathingPacer";
import AuthModal from "@/components/AuthModal";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import { MensionProvider, useMension } from "@/context/MensionContext";

function AppContent() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const { isAuthOpen, closeAuth } = useMension();

  const renderActiveComponent = () => {
    const component = (() => {
      switch (activeTab) {
        case "dashboard":
          return <Dashboard setActiveTab={setActiveTab} />;
        case "community":
          return <Community />;
        case "chat":
          return <OvaChat />;
        case "garden":
          return <ResetRoom />;
        case "breathing":
          return <BreathingPacer />;
        default:
          return <Dashboard setActiveTab={setActiveTab} />;
      }
    })();

    return (
      <ErrorBoundary name={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}>
        {component}
      </ErrorBoundary>
    );
  };

  return (
    <>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 flex flex-col relative z-10 min-w-0 bg-[var(--background)]">
        {renderActiveComponent()}
      </main>
      <AuthModal isOpen={isAuthOpen} onClose={closeAuth} />
    </>
  );
}

export default function Home() {
  return (
    <MensionProvider>
      <AppContent />
    </MensionProvider>
  );
}
