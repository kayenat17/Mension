"use client";

import React from "react";
import { Home, HeartHandshake, Flower, Wind, BookOpen, Sparkles, User, LogOut, Users, Flame } from "lucide-react";
import MensionLogo from "@/components/MensionLogo";
import { useMension } from "@/context/MensionContext";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { user, isAuthenticated, openAuth, signOut } = useMension();
  const navItems = [
    { id: "dashboard", label: "Analyzer", icon: Home },
    { id: "community", label: "Community", icon: Users },
    { id: "chat", label: "Ova", icon: HeartHandshake },
    { id: "garden", label: "The Reset Room", icon: Flame },
    { id: "breathing", label: "Calm Space", icon: Wind },
  ];

  const handleSignOut = async () => {
    if (confirm("Are you sure you want to sign out?")) {
      await signOut();
    }
  };

  const userEmail = user?.email || "";
  const isLoggedIn = isAuthenticated;

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 border-b border-lavender bg-white/80 backdrop-blur-md sticky top-0 z-40 w-full">
        <div className="flex items-center space-x-2">
          <MensionLogo className="text-2xl text-charcoal" />
        </div>
        
        <nav className="flex space-x-1 items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`p-2.5 rounded-2xl transition-all-300 ${
                  isActive
                    ? "bg-charcoal text-white shadow-sm scale-105"
                    : "text-warm-gray hover:text-charcoal hover:bg-lavender-light"
                }`}
                title={item.label}
                id={`nav-mobile-${item.id}`}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}

          {/* Mobile Auth Button */}
          {isLoggedIn ? (
            <button
              onClick={handleSignOut}
              className="p-2.5 rounded-xl text-warm-gray hover:text-red-500 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={openAuth}
              className="p-2.5 rounded-xl text-warm-gray hover:text-charcoal transition-colors"
              title="Sign In"
            >
              <User className="w-5 h-5" />
            </button>
          )}
        </nav>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 min-h-screen border-r border-lavender bg-white p-6 sticky top-0 h-screen justify-between shrink-0 z-20">
        <div className="flex flex-col space-y-8">
          {/* Logo Section */}
          <div className="flex items-center space-x-3 px-2 mt-4">
            <MensionLogo className="text-[2.5rem] text-charcoal" />
          </div>
          <div className="px-3 -mt-4">
            <span className="text-[10px] text-warm-gray font-semibold uppercase tracking-widest">Health Intelligence</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  id={`nav-desktop-${item.id}`}
                className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all-300 font-medium text-sm group ${
                  isActive
                    ? "bg-butter text-butter-dark shadow-sm font-bold"
                    : "text-warm-gray hover:text-charcoal hover:bg-lavender-light/60"
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-butter-dark" : "text-warm-gray/80"}`} />
                <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Profile/Auth Section at the Bottom */}
        <div className="border-t border-lavender/50 pt-4 flex flex-col space-y-3">
          {isLoggedIn ? (
            <div className="flex items-center justify-between bg-lavender-light/40 border border-lavender/40 px-3 py-2.5 rounded-2xl">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-warm-gray uppercase tracking-wider block">Sync Active</span>
                <span className="text-xs font-semibold text-charcoal truncate block" title={userEmail}>
                  {userEmail}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-xl text-warm-gray hover:text-red-500 hover:bg-red-50 transition-all duration-200 shrink-0"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={openAuth}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-2xl bg-lavender-light hover:bg-lavender border border-lavender text-charcoal font-semibold text-xs transition-all-300 hover:scale-102"
            >
              <User className="w-4 h-4" />
              <span>Sign In to Sync</span>
            </button>
          )}

          <p className="text-[11px] text-warm-gray leading-relaxed px-2">
            With Mension, you're never alone. Private & synced.
          </p>

           <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSdGvCgHJrFmfKmYk1wcrFRhMiKV_P4cWTeV-zZ_3L6rgG9d-w/viewform"
            target="_blank"
            className="text-[11px] text-purple-400 hover:text-purple-600 px-2 transition-colors"
          >
            Share feedback 💜
          </a> 
        </div>
      </aside>
    </>
  );
}
