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

// Helper to generate a completely deterministic alias based on user ID
const generateDeterministicAlias = (userId: string) => {
  const adjectives = [
    "soft", "pale", "sweet", "quiet", "warm", "gentle", "calm", "wild", "lucid", "luna",
    "serene", "bright", "misty", "ethereal", "golden", "silver", "velvet", "crystal", "hazy", "twilight",
    "amber", "coral", "jade", "pearl", "ruby", "sapphire", "opal", "mossy", "dewy", "solar",
    "lunar", "stellar", "cosmic", "astral", "radiant", "glowing", "shimmering", "sparkling", "gleaming", "dazzling"
  ];
  const nouns = [
    "aurora", "moonflower", "star", "bloom", "willow", "dove", "fern", "breeze", "dawn", "dusk",
    "meadow", "river", "ocean", "sky", "cloud", "sun", "moon", "comet", "nebula", "galaxy",
    "forest", "grove", "valley", "mountain", "lake", "stream", "waterfall", "spring", "oasis", "desert",
    "canyon", "glacier", "tundra", "savanna", "prairie", "jungle", "rainforest", "island", "peninsula", "melody"
  ];
  
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  const adj = adjectives[hash % adjectives.length];
  const noun = nouns[(hash >> 2) % nouns.length];
  const num = (hash % 900) + 100; // 100-999

  return `${adj}${noun}${num}`;
};

// Helper to generate soft anonymous names randomly (fallback)
const generateAlias = () => {
  const adjectives = [
    "soft", "pale", "sweet", "quiet", "warm", "gentle", "calm", "wild", "lucid", "luna",
    "serene", "bright", "misty", "ethereal", "golden", "silver", "velvet", "crystal", "hazy", "twilight",
    "amber", "coral", "jade", "pearl", "ruby", "sapphire", "opal", "mossy", "dewy", "solar",
    "lunar", "stellar", "cosmic", "astral", "radiant", "glowing", "shimmering", "sparkling", "gleaming", "dazzling"
  ];
  const nouns = [
    "aurora", "moonflower", "star", "bloom", "willow", "dove", "fern", "breeze", "dawn", "dusk",
    "meadow", "river", "ocean", "sky", "cloud", "sun", "moon", "comet", "nebula", "galaxy",
    "forest", "grove", "valley", "mountain", "lake", "stream", "waterfall", "spring", "oasis", "desert",
    "canyon", "glacier", "tundra", "savanna", "prairie", "jungle", "rainforest", "island", "peninsula", "melody"
  ];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 1000); // 0-999 for greater uniqueness

  return `${adj}${noun}${num}`;
};

// Mock data for fallback when Supabase is not configured
const mockPosts = [
  {
    id: "1",
    user_id: "user_1",
    alias: "palefern63",
    content: "I am feeling exhausted today, need a long vacation",
    phase: "GENERAL PHASE",
    created_at: new Date().toISOString(),
    red_flag_count: 0,
    trust_gut_count: 1,
    give_time_count: 0
  },
  {
    id: "2",
    user_id: "user_2",
    alias: "palefern13",
    content: "Hi i just started using this",
    phase: "GENERAL PHASE",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    red_flag_count: 0,
    trust_gut_count: 0,
    give_time_count: 0
  }
];

export default function Community({ session, onLoginClick }: CommunityProps) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [alias, setAlias] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reactedPosts, setReactedPosts] = useState<Record<string, string>>({}); // postId -> reactionType

  // New filters
  const [searchQuery, setSearchQuery] = useState("");
  const [postFilter, setPostFilter] = useState<"all" | "mine">("all");

  // Mood Tracker State
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  useEffect(() => {
    // Setup Alias
    if (session && session.user && session.user.id) {
      // Deterministic permanent username based on their account ID
      setAlias(generateDeterministicAlias(session.user.id));
    } else {
      // Fallback for logged out state
      let savedAlias = localStorage.getItem("clara-community-alias");
      if (!savedAlias) {
        savedAlias = generateAlias();
        localStorage.setItem("clara-community-alias", savedAlias);
      }
      setAlias(savedAlias);
    }

    // Load Reacted Posts from local storage to prevent multi-voting
    const savedReactions = localStorage.getItem("clara-community-reactions");
    if (savedReactions) {
      try {
        setReactedPosts(JSON.parse(savedReactions));
      } catch (e) { }
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
  }, [session]);

  const fetchPosts = async () => {
    if (!isSupabaseConfigured()) {
      setPosts(mockPosts);
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
        setPosts([]);
      } else {
        setPosts(data as CommunityPost[] || []);
      }
    } catch (err) {
      console.warn("Fetch error:", err);
      setPosts([]);
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
      } catch (e) { }
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

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.alias.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = postFilter === "mine" ? (session && post.user_id === session.user.id) : true;
    return matchesSearch && matchesFilter;
  });

  // Calculate community stats
  const totalPosts = posts.length;
  const totalReactions = posts.reduce((acc, post) =>
    acc + (post.red_flag_count || 0) + (post.trust_gut_count || 0) + (post.give_time_count || 0), 0
  );

  return (
    <main className="max-w-7xl mx-auto px-container-margin py-12 relative min-h-screen font-body-md bg-background text-on-background overflow-x-hidden">

      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="organic-blob bg-secondary-fixed w-[400px] h-[400px] rounded-full top-[-10%] right-[-5%]"></div>
        <div className="organic-blob bg-primary-fixed w-[300px] h-[300px] rounded-full bottom-[10%] left-[-5%]"></div>
        <div className="organic-blob bg-tertiary-fixed w-[250px] h-[250px] rounded-full top-[40%] right-[10%]"></div>
      </div>

      {/* Hero Section */}
      <div className="mb-12 space-y-4">
        <h1 className="font-headline-xl text-headline-xl md:text-[48px] text-primary drop-shadow-sm font-extrabold leading-tight tracking-tight">Community Board</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">Share what you're experiencing anonymously. You are not alone.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">

        {/* Posts Column */}
        <div className="lg:col-span-8 space-y-gutter flex flex-col gap-6">

          {/* Controls (Search & Filter) */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-2">
            <div className="flex bg-surface-container-low p-1 rounded-full border-2 border-primary/20 w-full md:w-auto">
              <button
                onClick={() => setPostFilter("all")}
                className={`px-6 py-2 rounded-full font-button text-button transition-all w-full md:w-auto ${postFilter === "all" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-primary"}`}
              >
                All Posts
              </button>
              <button
                onClick={() => setPostFilter("mine")}
                disabled={!session}
                className={`px-6 py-2 rounded-full font-button text-button transition-all w-full md:w-auto ${postFilter === "mine" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-primary"} ${!session && "opacity-50 cursor-not-allowed"}`}
                title={!session ? "Log in to view your posts" : ""}
              >
                My Posts
              </button>
            </div>
            <div className="relative w-full md:w-72">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-70">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts..."
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border-2 border-primary/20 rounded-full focus:border-primary focus:ring-0 transition-all font-body-md text-on-surface outline-none"
              />
            </div>
          </div>

          {/* Post Composer */}
          {session ? (
            <div className="bg-surface-container-lowest border-2 border-primary rounded-xl p-8 bubbly-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary-fixed rounded-full flex items-center justify-center text-primary font-bold">
                  {alias.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-label-md text-label-md text-primary">Posting as <span className="font-bold">{alias}</span></p>
                </div>
              </div>
              <form onSubmit={handlePost} className="space-y-4">
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="I'm feeling really confused because my partner just told me..."
                  rows={3}
                  className="w-full rounded-xl border-2 border-primary/20 p-5 font-body-md text-on-surface focus:outline-none focus:border-primary bg-surface-container-lowest resize-none"
                  disabled={isSubmitting}
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!newPostContent.trim() || isSubmitting}
                    className="flex items-center gap-2 px-8 py-3 bg-primary text-on-primary font-button rounded-xl border-2 border-on-primary-fixed-variant shadow-[4px_4px_0px_0px_rgba(180,0,101,1)] active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100"
                  >
                    <span className="material-symbols-outlined text-lg">send</span>
                    <span>Publish</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-surface-container-lowest border-2 border-primary rounded-xl p-8 bubbly-card flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-2xl">lock</span>
                </div>
                <div>
                  <h4 className="font-headline-md text-xl text-primary">Join the circle</h4>
                  <p className="font-body-md text-on-surface-variant mt-1">Sign in to post anonymously and react to others.</p>
                </div>
              </div>
              <button
                onClick={onLoginClick}
                className="px-6 py-3 bg-secondary-fixed text-on-secondary-fixed font-button text-button rounded-xl border-2 border-on-secondary-fixed-variant shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:translate-y-1 hover:shadow-none transition-all active:scale-95 whitespace-nowrap"
              >
                Create Free Account
              </button>
            </div>
          )}

          {/* Feed */}
          <div className="space-y-6 pb-20">
            {isLoading ? (
              <div className="text-center py-10 text-on-surface-variant font-body-md animate-pulse">
                Loading community posts...
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-primary/30 rounded-xl space-y-4">
                <span className="material-symbols-outlined text-4xl text-primary opacity-50">forum</span>
                <p className="font-headline-md text-xl text-primary">It's quiet here right now.</p>
                <p className="font-body-md text-on-surface-variant">Be the first to share your situation or try adjusting your search.</p>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <article key={post.id} className="bg-surface-container-lowest border-2 border-primary rounded-xl p-5 md:p-8 bubbly-card">

                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary-fixed rounded-full flex items-center justify-center text-primary font-bold">
                      {post.alias.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-label-md text-label-md text-primary">{post.alias}</p>
                      <p className="text-xs text-on-surface-variant opacity-70 uppercase tracking-wider">{post.phase}</p>
                    </div>
                  </div>

                  <p className="font-headline-md text-base md:text-[20px] leading-relaxed text-on-surface mb-5 md:mb-8 whitespace-pre-wrap">
                    "{post.content}"
                  </p>

                  {/* Action Buttons styled like CycleCircle mockup */}
                  <div className="flex flex-wrap gap-2 md:gap-4 pt-4 border-t border-outline-variant">
                    <button
                      onClick={() => handleReaction(post.id, "red_flag_count")}
                      disabled={!!reactedPosts[post.id] || !session}
                      className={`flex items-center gap-1 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 border-2 rounded-full transition-transform active:scale-95 ${reactedPosts[post.id] === "red_flag_count"
                          ? "bg-secondary-container border-primary scale-105"
                          : "bg-surface-container-lowest border-primary/20 hover:border-primary hover:bg-secondary-container/30"
                        } ${!session || reactedPosts[post.id] ? "opacity-90 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <span className={`material-symbols-outlined text-secondary text-sm md:text-lg ${reactedPosts[post.id] === 'red_flag_count' ? 'filled-icon' : ''}`}>flag</span>
                      <span className="font-label-md text-xs md:text-sm text-secondary">Red Flag</span>
                      <span className="bg-primary text-on-primary text-[10px] px-1.5 py-0.5 rounded-full ml-1 font-bold">{post.red_flag_count}</span>
                    </button>

                    <button
                      onClick={() => handleReaction(post.id, "trust_gut_count")}
                      disabled={!!reactedPosts[post.id] || !session}
                      className={`flex items-center gap-1 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 border-2 rounded-full transition-transform active:scale-95 ${reactedPosts[post.id] === "trust_gut_count"
                          ? "bg-tertiary-fixed border-primary scale-105"
                          : "bg-surface-container-lowest border-primary/20 hover:border-primary hover:bg-tertiary-fixed/30"
                        } ${!session || reactedPosts[post.id] ? "opacity-90 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <span className={`material-symbols-outlined text-tertiary text-sm md:text-lg ${reactedPosts[post.id] === 'trust_gut_count' ? 'filled-icon' : ''}`}>favorite</span>
                      <span className="font-label-md text-xs md:text-sm text-tertiary">Trust your gut</span>
                      <span className="bg-primary text-on-primary text-[10px] px-1.5 py-0.5 rounded-full ml-1 font-bold">{post.trust_gut_count}</span>
                    </button>

                    <button
                      onClick={() => handleReaction(post.id, "give_time_count")}
                      disabled={!!reactedPosts[post.id] || !session}
                      className={`flex items-center gap-1 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 border-2 rounded-full transition-transform active:scale-95 ${reactedPosts[post.id] === "give_time_count"
                          ? "bg-primary-fixed border-primary scale-105"
                          : "bg-surface-container-lowest border-primary/20 hover:border-primary hover:bg-primary-fixed/30"
                        } ${!session || reactedPosts[post.id] ? "opacity-90 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <span className={`material-symbols-outlined text-primary text-sm md:text-lg ${reactedPosts[post.id] === 'give_time_count' ? 'filled-icon' : ''}`}>schedule</span>
                      <span className="font-label-md text-xs md:text-sm text-primary">Give it time</span>
                      <span className="bg-primary text-on-primary text-[10px] px-1.5 py-0.5 rounded-full ml-1 font-bold">{post.give_time_count}</span>
                    </button>
                  </div>

                </article>
              ))
            )}
          </div>
        </div>

        {/* Sidebar Column */}
        <aside className="lg:col-span-4 space-y-6">

          <div className="bg-surface-container-lowest border-2 border-primary rounded-xl p-6 bubbly-card">
            <h3 className="font-headline-md text-[24px] text-primary mb-2 font-bold">How are you today?</h3>
            <p className="font-body-md text-on-surface-variant mb-6 text-sm">Log your mood or cycle phase to see personalized insights.</p>
            <div className="grid grid-cols-4 gap-2 mb-6">
              <button
                onClick={() => setSelectedMood('great')}
                className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-colors active:scale-95 group ${selectedMood === 'great' ? 'bg-primary text-on-primary shadow-sm' : 'hover:bg-primary-fixed'}`}
              >
                <span className={`material-symbols-outlined text-3xl ${selectedMood === 'great' ? 'text-on-primary filled-icon' : 'text-primary group-hover:filled-icon'}`}>sentiment_very_satisfied</span>
                <span className="text-[11px] font-label-md mt-1">Great</span>
              </button>
              <button
                onClick={() => setSelectedMood('good')}
                className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-colors active:scale-95 group ${selectedMood === 'good' ? 'bg-primary text-on-primary shadow-sm' : 'hover:bg-primary-fixed'}`}
              >
                <span className={`material-symbols-outlined text-3xl ${selectedMood === 'good' ? 'text-on-primary filled-icon' : 'text-primary group-hover:filled-icon'}`}>sentiment_satisfied</span>
                <span className="text-[11px] font-label-md mt-1">Good</span>
              </button>
              <button
                onClick={() => setSelectedMood('okay')}
                className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-colors active:scale-95 group ${selectedMood === 'okay' ? 'bg-primary text-on-primary shadow-sm' : 'hover:bg-primary-fixed'}`}
              >
                <span className={`material-symbols-outlined text-3xl ${selectedMood === 'okay' ? 'text-on-primary filled-icon' : 'text-primary group-hover:filled-icon'}`}>sentiment_neutral</span>
                <span className="text-[11px] font-label-md mt-1">Okay</span>
              </button>
              <button
                onClick={() => setSelectedMood('tired')}
                className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-colors active:scale-95 group ${selectedMood === 'tired' ? 'bg-primary text-on-primary shadow-sm' : 'hover:bg-primary-fixed'}`}
              >
                <span className={`material-symbols-outlined text-3xl ${selectedMood === 'tired' ? 'text-on-primary filled-icon' : 'text-primary group-hover:filled-icon'}`}>sentiment_dissatisfied</span>
                <span className="text-[11px] font-label-md mt-1">Tired</span>
              </button>
            </div>
            <button
              onClick={() => {
                if (selectedMood) {
                  alert(`Mood logged: ${selectedMood}! Check back for insights soon.`);
                  setSelectedMood(null);
                }
              }}
              disabled={!selectedMood}
              className="w-full bg-primary text-on-primary font-button py-3 rounded-xl border-2 border-on-primary-fixed-variant shadow-[4px_4px_0px_0px_rgba(180,0,101,1)] active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
            >
              Log Check-in
            </button>
          </div>

          {!session && (
            <div className="bg-primary text-on-primary rounded-xl p-8 border-2 border-on-primary-fixed-variant shadow-[6px_6px_0px_0px_rgba(255,220,190,1)] flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-5xl mb-4 filled-icon text-secondary-fixed">auto_awesome</span>
              <h2 className="font-headline-md text-[24px] mb-2 font-bold text-white">Join the Sisterhood</h2>
              <p className="font-body-md text-sm mb-8 opacity-90 text-white/90">Unlock personalized insights, private group chats, and exclusive wellness tools designed for your cycle.</p>
              <button
                onClick={onLoginClick}
                className="w-full bg-secondary-fixed text-on-secondary-fixed font-button text-button py-4 rounded-xl border-2 border-on-secondary-fixed-variant shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:translate-y-1 hover:shadow-none transition-all active:scale-95"
              >
                Create Free Account
              </button>
            </div>
          )}

          <div className="bg-tertiary-fixed border-2 border-primary rounded-xl p-6 bubbly-card">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary filled-icon text-xl">favorite</span>
              <h3 className="font-headline-md text-[20px] text-primary font-bold tracking-tight">Community Milestones</h3>
            </div>
            <div className="space-y-4">
              <div className="bg-surface-container-lowest p-4 rounded-xl border-2 border-primary/20 flex items-center gap-4">
                <div className="bg-primary-fixed p-2 rounded-full w-10 h-10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                </div>
                <div>
                  <p className="text-primary font-bold text-lg leading-none mb-1">{totalPosts}</p>
                  <p className="text-xs font-label-md text-on-surface-variant leading-none">Total Posts</p>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-xl border-2 border-primary/20 flex items-center gap-4">
                <div className="bg-secondary-fixed p-2 rounded-full w-10 h-10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary text-xl">volunteer_activism</span>
                </div>
                <div>
                  <p className="text-primary font-bold text-lg leading-none mb-1">{totalReactions}</p>
                  <p className="text-xs font-label-md text-on-surface-variant leading-none">Total Reactions</p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <img
                className="w-full rounded-lg border-2 border-primary"
                alt="Community Illustration"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKmhelps9UUNMwbuahZIKQBIlkjyURLQdmhI5PXQFGcEX9BZOpigw0hAVtEpDvO-P9DePlxBxs3ODwx8kaN5KA17RVQJE0ohhXrZDJ_sTQ7vTmUQ0lyemb47TOkeX9FFVbJqv2bFDe0D7cvrD7Q0W6sI2517sfONMdjVdnWuPC0O973s7_4aCtamKjMJqI6dI330Fkj6DBzmUtYHsQA_oGjMV3saRgbQ8KblZ26k0IAjYbwcLQ-zA0bjp9XrbXPF4tCRkDhQ_J3khh"
              />
            </div>
          </div>
        </aside>

      </div>
    </main>
  );
}
