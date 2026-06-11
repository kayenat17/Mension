import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// We export a helper to verify config status
export const isSupabaseConfigured = () => {
  return (
    supabaseUrl !== "" &&
    supabaseAnonKey !== "" &&
    supabaseUrl !== "YOUR_SUPABASE_URL_HERE" &&
    supabaseAnonKey !== "YOUR_SUPABASE_ANON_KEY_HERE"
  );
};

// Initialize client
// If config is missing, we initialize with placeholders so the build does not fail,
// and we check isSupabaseConfigured() in UI components before triggering requests.
export const supabase = createClient(
  isSupabaseConfigured() ? supabaseUrl : "https://placeholder-project.supabase.co",
  isSupabaseConfigured() ? supabaseAnonKey : "placeholder-anon-key"
);
