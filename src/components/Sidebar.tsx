"use client";

import React, { useState, useRef, useEffect } from "react";
import { Home, HeartHandshake, Wind, User, LogOut, Users, Flame, ShoppingBag, MessageSquare } from "lucide-react";
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

  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };
    if (isAccountMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAccountMenuOpen]);

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
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-charcoal hover:bg-black/10 transition-colors"
                title="Account"
              >
                <User className="w-5 h-5" />
              </button>
              
              {isAccountMenuOpen && (
                <div className="absolute top-10 right-0 w-48 bg-white rounded-xl shadow-lg border border-black/5 py-2 z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-black/5 mb-1">
                    <p className="text-xs font-medium text-warm-gray truncate">{session.user?.email}</p>
                  </div>
                  
                  <a 
                    href="https://docs.google.com/forms/d/e/1FAIpQLSdGvCgHJrFmfKmYk1wcrFRhMiKV_P4cWTeV-zZ_3L6rgG9d-w/viewform" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-4 py-2.5 text-sm text-charcoal hover:bg-black/5 transition-colors"
                    onClick={() => setIsAccountMenuOpen(false)}
                  >
                    <MessageSquare className="w-4 h-4 text-primary" />
                    <span>Send Feedback</span>
                  </a>
                  
                  <button
                    onClick={() => {
                      setIsAccountMenuOpen(false);
                      handleSignOut();
                    }}
                    className="flex items-center space-x-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
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
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className="flex items-center space-x-3 bg-black/5 hover:bg-black/10 px-4 py-2 rounded-full transition-colors"
                title="Account Options"
              >
                <User className="w-4 h-4 text-charcoal" />
                <span className="text-xs font-bold text-charcoal truncate max-w-[150px]" title={userEmail}>
                  {userEmail}
                </span>
              </button>
              
              {isAccountMenuOpen && (
                <div className="absolute top-12 right-0 w-48 bg-white rounded-xl shadow-lg border border-black/5 py-2 z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <a 
                    href="https://docs.google.com/forms/d/e/1FAIpQLSdGvCgHJrFmfKmYk1wcrFRhMiKV_P4cWTeV-zZ_3L6rgG9d-w/viewform" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-4 py-2.5 text-sm text-charcoal hover:bg-black/5 transition-colors"
                    onClick={() => setIsAccountMenuOpen(false)}
                  >
                    <MessageSquare className="w-4 h-4 text-primary" />
                    <span>Send Feedback</span>
                  </a>
                  
                  <button
                    onClick={() => {
                      setIsAccountMenuOpen(false);
                      handleSignOut();
                    }}
                    className="flex items-center space-x-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
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
