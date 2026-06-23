"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase, isSupabaseConfigured } from "@/utils/supabaseClient";
import { migrateLegacyKeys } from "@/utils/storageHelper";

interface User {
  id: string;
  email?: string;
}

interface MensionContextValue {
  session: any;
  user: User | null;
  isAuthenticated: boolean;
  isSupabaseReady: boolean;
  isAuthOpen: boolean;
  openAuth: () => void;
  closeAuth: () => void;
  signOut: () => Promise<void>;
}

const MensionContext = createContext<MensionContextValue | null>(null);

export function MensionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    migrateLegacyKeys();

    if (!isSupabaseConfigured()) return;

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => subscription.unsubscribe();
  }, []);

  const user: User | null = session?.user
    ? { id: session.user.id, email: session.user.email }
    : null;

  const signOut = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setSession(null);
  };

  return (
    <MensionContext.Provider
      value={{
        session,
        user,
        isAuthenticated: !!session,
        isSupabaseReady: isSupabaseConfigured(),
        isAuthOpen,
        openAuth: () => setIsAuthOpen(true),
        closeAuth: () => setIsAuthOpen(false),
        signOut,
      }}
    >
      {children}
    </MensionContext.Provider>
  );
}

export function useMension(): MensionContextValue {
  const ctx = useContext(MensionContext);
  if (!ctx) {
    throw new Error("useMension must be used within a MensionProvider");
  }
  return ctx;
}
