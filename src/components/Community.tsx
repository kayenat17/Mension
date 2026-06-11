"use client";

import React, { useState, useEffect } from "react";
import { Users, AlertCircle, HeartHandshake, Moon, ShieldAlert, Sparkles, Send } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/utils/supabaseClient";

interface CommunityProps {
  session?: any;
  onLoginClick: () => void;
}

interface CommunityPost {
  id: string;
  user_id: string;
  alias: string;
  content: string;
  phase: string;
  red_flag_count: number;
  trust_gut_count: number;
  give_time_count: number;
  created_at: string;
}

// Helper to generate soft anonymous names
const generateAlias = () => {
  const adjectives = ["soft", "pale", "sweet", "quiet", "warm", "gentle", "calm", "wild", "lucid", "luna"];
  const nouns = ["aurora", "moonflower", "star", "bloom", "willow", "dove", "fern", "breeze", "dawn", "dusk"];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 100);
  return `${adj}${noun}${num}`;
};

export default function Community({ session, onLoginClick }: CommunityProps) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [alias, setAlias] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reactedPosts, setReactedPosts] = useState<Record<string, string>>({}); // postId -> reactionType

  useEffect(() => {
    // Setup Alias
    let savedAlias = localStorage.getItem("clara-community-alias");
    if (!savedAlias) {
      savedAlias = generateAlias();
      localStorage.setItem("clara-community-alias", savedAlias);
    }
    setAlias(savedAlias);

    // Load Reacted Posts from local storage to prevent multi-voting
    const savedReactions = localStorage.getItem("clara-community-reactions");
    if (savedReactions) {
      try {
        setReactedPosts(JSON.parse(savedReactions));
      } catch (e) {}
    }

    fetchPosts();

    // Set up realtime subscription
    if (isSupabaseConfigured()) {
      const channel = supabase
        .channel('public:community_posts')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'community_posts' }, (payload) => {
          fetchPosts(); // Refetch on any change for simplicity
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  const fetchPosts = async () => {
    if (!isSupabaseConfigured()) {
      setIsLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("community_posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
        
      if (error) {
        // Table might not exist yet, suppress error to UI
        console.warn("Could not fetch posts. Table might not exist yet.", error);
      } else {
        setPosts(data || []);
      }
    } catch (err) {
      console.warn("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getPhaseFromLocalStorage = () => {
    // Try to calculate from cycle tracker
    const savedCycle = localStorage.getItem("clara-cycle-tracker");
    if (savedCycle) {
      try {
        const parsed = JSON.parse(savedCycle);
        // Simple fallback if complex calculator isn't imported
        // Real implementation would use calculateCycleState
      } catch (e) {}
    }
    // Fallback to explicit phase selection
    return localStorage.getItem("clara-cycle-phase") || "general";
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || !session || !isSupabaseConfigured()) return;

    setIsSubmitting(true);
    try {
      const phase = getPhaseFromLocalStorage();
      const { error } = await supabase.from("community_posts").insert({
        user_id: session.user.id,
        alias: alias,
        content: newPostContent.trim(),
        phase: phase,
        red_flag_count: 0,
        trust_gut_count: 0,
        give_time_count: 0
      });

      if (error) throw error;
      setNewPostContent("");
      fetchPosts();
    } catch (err) {
      console.error("Error posting:", err);
      alert("Failed to post. The database table might not be set up yet.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReaction = async (postId: string, reactionType: "red_flag_count" | "trust_gut_count" | "give_time_count") => {
    if (reactedPosts[postId] || !isSupabaseConfigured()) return; // Already reacted or no DB

    // Optimistic UI update
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, [reactionType]: p[reactionType] + 1 };
      }
      return p;
    }));

    // Update local storage
    const newReactions = { ...reactedPosts, [postId]: reactionType };
    setReactedPosts(newReactions);
    localStorage.setItem("clara-community-reactions", JSON.stringify(newReactions));

    // Update Supabase via RPC (function) or direct update
    // Since we don't have an RPC function set up yet, we'll do a read-modify-write
    // Note: In production, use a secure RPC call to prevent race conditions.
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;
      
      const { error } = await supabase
        .from("community_posts")
        .update({ [reactionType]: post[reactionType] + 1 })
        .eq("id", postId);
        
      if (error) throw error;
    } catch (err) {
      console.error("Error updating reaction:", err);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 max-w-3xl mx-auto w-full space-y-8 animate-slide-up">
      
      {/* Header */}
      <section className="bg-lavender/40 border border-lavender/60 rounded-3xl p-6 md:p-8 text-center space-y-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-butter via-purple-300 to-butter-dark"></div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/60 text-[10px] font-bold text-purple-700 uppercase tracking-wider border border-lavender shadow-sm">
          <Users className="w-3.5 h-3.5" />
          <span>Sisterhood Space</span>
        </div>
        
        <h2 className="font-dm-sans font-bold text-3xl md:text-4xl text-charcoal tracking-tight">
          Safe. Anonymous. Supportive.
        </h2>
        <p className="text-sm text-warm-gray max-w-xl mx-auto leading-relaxed font-medium">
          Share what you're experiencing. No real names, no toxic comment sections. 
          Only three supportive reactions are allowed here. You are not alone.
        </p>
      </section>

      {/* Post Composer */}
      {session ? (
        <div className="glass-panel rounded-3xl p-5 border-lavender bg-white/80 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-warm-gray uppercase tracking-wider">
              Posting anonymously as: <strong className="text-purple-600">{alias}</strong>
            </span>
          </div>
          
          <form onSubmit={handlePost} className="space-y-3">
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="I'm feeling really confused because my partner just told me..."
              rows={3}
              className="w-full rounded-2xl border border-lavender p-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent bg-white/50 text-charcoal placeholder-warm-gray/50 resize-none"
              disabled={isSubmitting}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!newPostContent.trim() || isSubmitting}
                className="bg-butter hover:bg-butter-dark disabled:opacity-50 text-charcoal border border-butter-dark/50 font-bold py-2.5 px-6 rounded-2xl transition-all-300 text-xs flex items-center gap-2 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Share Anonymously</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="glass-panel-yellow rounded-3xl p-5 border-butter flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-white flex items-center justify-center border border-butter-dark shadow-sm">
              <span>🔒</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-charcoal">Join the Sisterhood</h4>
              <p className="text-[11px] text-warm-gray font-medium">Sign in to post anonymously and react to others.</p>
            </div>
          </div>
          <button
            onClick={onLoginClick}
            className="px-4 py-2 bg-white hover:bg-lavender-light border border-lavender-dark/45 text-charcoal text-xs font-bold rounded-2xl transition-all hover:scale-102"
          >
            Create Free Account
          </button>
        </div>
      )}

      {/* Feed */}
      <div className="space-y-5">
        {isLoading ? (
          <div className="text-center py-10 text-warm-gray text-sm font-medium animate-pulse">
            Loading community posts...
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-lavender bg-white/30 rounded-3xl space-y-2">
            <Sparkles className="w-6 h-6 text-purple-300 mx-auto" />
            <p className="text-sm text-warm-gray font-medium">It's quiet here right now.</p>
            <p className="text-xs text-warm-gray/70">Be the first to share your situation.</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="glass-panel rounded-3xl p-6 border border-lavender/60 bg-white shadow-sm hover:shadow-md transition-shadow space-y-4">
              
              <div className="flex justify-between items-center pb-3 border-b border-lavender/30">
                <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                  {post.alias}
                </span>
                <span className="text-[9px] uppercase font-bold tracking-wider text-warm-gray">
                  {post.phase} Phase
                </span>
              </div>
              
              <p className="text-sm text-charcoal/90 leading-relaxed whitespace-pre-wrap font-medium">
                {post.content}
              </p>

              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => handleReaction(post.id, "red_flag_count")}
                  disabled={!!reactedPosts[post.id] || !session}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                    reactedPosts[post.id] === "red_flag_count"
                      ? "bg-red-50 text-red-600 border-red-200"
                      : "bg-white text-warm-gray border-lavender hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                  } ${!session || reactedPosts[post.id] ? "opacity-70 cursor-not-allowed" : "cursor-pointer hover:scale-105"}`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Red Flag 🚩</span>
                  <span className="ml-1 bg-white/50 px-1.5 rounded-md">{post.red_flag_count}</span>
                </button>

                <button
                  onClick={() => handleReaction(post.id, "trust_gut_count")}
                  disabled={!!reactedPosts[post.id] || !session}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                    reactedPosts[post.id] === "trust_gut_count"
                      ? "bg-purple-50 text-purple-700 border-purple-200"
                      : "bg-white text-warm-gray border-lavender hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200"
                  } ${!session || reactedPosts[post.id] ? "opacity-70 cursor-not-allowed" : "cursor-pointer hover:scale-105"}`}
                >
                  <HeartHandshake className="w-3.5 h-3.5" />
                  <span>Trust your gut 💜</span>
                  <span className="ml-1 bg-white/50 px-1.5 rounded-md">{post.trust_gut_count}</span>
                </button>

                <button
                  onClick={() => handleReaction(post.id, "give_time_count")}
                  disabled={!!reactedPosts[post.id] || !session}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                    reactedPosts[post.id] === "give_time_count"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-white text-warm-gray border-lavender hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200"
                  } ${!session || reactedPosts[post.id] ? "opacity-70 cursor-not-allowed" : "cursor-pointer hover:scale-105"}`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Give it time 🌙</span>
                  <span className="ml-1 bg-white/50 px-1.5 rounded-md">{post.give_time_count}</span>
                </button>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}
