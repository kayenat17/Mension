"use client";

import React from "react";
import { Home, HeartHandshake, Wind, User, LogOut, Users, Flame, ShoppingBag } from "lucide-react";
import { supabase } from "@/utils/supabaseClient";
import MensionLogo from "@/components/MensionLogo";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  session?: any;
  onLoginClick?: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, session, onLoginClick }: SidebarProps) {
  const navItems = [
    { id: "dashboard", label: "Analyzer", icon: Home },
    { id: "community", label: "Community", icon: Users },
    { id: "chat", label: "Ova", icon: HeartHandshake },
    { id: "garden", label: "The Reset Room", icon: Flame },
    { id: "crave-pantry", label: "Crave Pantry", icon: ShoppingBag },
    { id: "breathing", label: "Calm Space", icon: Wind },
  ];

  const handleSignOut = async () => {
    if (confirm("Are you sure you want to sign out?")) {
      await supabase.auth.signOut();
    }
  };

  const userEmail = session?.user?.email || "";
  const isLoggedIn = !!session;

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-white sticky top-0 z-40 w-full border-b border-black/5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="w-8"></div> {/* Spacer for centering */}
        <div onClick={() => setActiveTab('dashboard')} className="cursor-pointer hover:opacity-80 transition-opacity">
          <MensionLogo className="text-2xl text-charcoal" />
        </div>
        
        {/* Right: Profile/Auth Section */}
        <div className="flex items-center shrink-0 w-8 justify-end">
          {isLoggedIn ? (
            <button
              onClick={handleSignOut}
              className="text-warm-gray hover:text-red-500 transition-all duration-200"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={onLoginClick}
              className="text-charcoal hover:text-lavender-dark transition-all duration-200"
              title="Sign In"
            >
              <User className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Mobile Bottom Navigation (Pinterest style) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-black/5 flex items-center justify-around px-6 py-4 z-50 shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`p-3 rounded-full transition-all-300 ${
                isActive
                  ? "bg-[#121211] text-[#FFF6A4] scale-110 shadow-md"
                  : "text-warm-gray hover:text-charcoal hover:bg-black/5"
              }`}
              title={item.label}
              id={`nav-mobile-${item.id}`}
            >
              <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
            </button>
          );
        })}
      </nav>

      {/* Desktop Top Navigation */}
      <header className="hidden md:flex items-center justify-between w-full bg-white/90 backdrop-blur-xl px-8 py-4 z-40 sticky top-0 border-b border-black/5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        
        {/* Left: Logo (Clickable) */}
        <div 
          className="flex items-center cursor-pointer hover:opacity-80 transition-opacity shrink-0" 
          onClick={() => setActiveTab('dashboard')}
          title="Go to Dashboard"
        >
          <MensionLogo className="text-2xl lg:text-3xl text-charcoal" />
        </div>

        {/* Center: Navigation Pills */}
        <nav className="flex items-center justify-center space-x-2 flex-1 mx-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                id={`nav-desktop-${item.id}`}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-full transition-all duration-300 font-medium text-sm group ${
                  isActive
                    ? "bg-[#121211] text-white shadow-md"
                    : "text-warm-gray hover:text-charcoal hover:bg-black/5"
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-[#FFF6A4]" : "text-warm-gray/80"}`} />
                <span className={isActive ? "font-bold" : ""}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Profile/Auth Section */}
        <div className="flex items-center shrink-0">
          {isLoggedIn ? (
            <div className="flex items-center space-x-4 bg-black/5 px-4 py-2 rounded-full">
              <span className="text-xs font-bold text-charcoal truncate max-w-[150px]" title={userEmail}>
                {userEmail}
              </span>
              <button
                onClick={handleSignOut}
                className="text-warm-gray hover:text-red-500 transition-all duration-200"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-full bg-[#BCE7F0] hover:bg-[#A9DDE8] text-charcoal font-bold text-sm transition-all duration-300 hover:-translate-y-0.5 shadow-sm"
            >
              <User className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </header>
    </>
  );
}
