"use client";

import React, { useState, useEffect, useRef } from "react";
import { HeartHandshake, AlertCircle, SendHorizonal, Activity, HelpCircle } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "ova";
  text: string;
  timestamp: Date;
}

export default function OvaChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [cyclePhase, setCyclePhase] = useState<string>("general");
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const starters = [
    { text: "I'm feeling so overwhelmed by my to-do list.", category: "overwhelmed" },
    { text: "I'm struggling with self-doubt today.", category: "doubt" },
    { text: "I had an argument and feel guilty.", category: "conflict" },
    { text: "I just want to celebrate a small win!", category: "win" },
  ];

  // Initial setup and health check
  useEffect(() => {
    // Load cycle phase preference
    const savedPhase = localStorage.getItem("ova-cycle-phase");
    if (savedPhase) {
      setCyclePhase(savedPhase);
    }

    // Health check local Next.js backend
    fetch("/api/health?t=" + Date.now(), { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Health check status error");
        return res.json();
      })
      .then((data) => {
        if (!data.gemini_api_configured) {
          setIsOfflineMode(true);
        } else {
          setIsOfflineMode(false);
        }
      })
      .catch(() => {
        // Backend is unreachable, run in offline mode
        setIsOfflineMode(true);
      });

    // Load Chat History
    const savedChat = localStorage.getItem("ova-chat-history");
    if (savedChat) {
      const parsed = JSON.parse(savedChat);
      const formatted = parsed.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      }));
      setMessages(formatted);
    } else {
      setMessages([
        {
          id: "welcome",
          sender: "ova",
          text: "Hey sweet friend! 🌸 Pull up a chair and make yourself comfortable. How are you really doing today? I'm here to listen, vent, or help you figure things out—no judgment, ever.",
          timestamp: new Date(),
        },
      ]);
    }
  }, []);

  // Save chat history
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("ova-chat-history", JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Math.random().toString(36).substring(2, 9),
      sender: "user",
      text: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    // Call Next.js API Route to generate content
    fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: text.trim(),
        history: messages.map((m) => ({
          role: m.sender === "user" ? "user" : "model",
          text: m.text,
        })),
        cycle_phase: cyclePhase,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("API Route error");
        return res.json();
      })
      .then((data) => {
        setIsOfflineMode(false);
        const ovaMsg: Message = {
          id: Math.random().toString(36).substring(2, 9),
          sender: "ova",
          text: data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, ovaMsg]);
        setIsTyping(false);
      })
      .catch((err) => {
        // Fallback to local rule engine if offline or failed
        console.warn("API call failed, running in local fallback mode:", err);
        setIsOfflineMode(true);

        setTimeout(() => {
          const responseText = getMensionFallbackResponse(text);
          const ovaMsg: Message = {
            id: Math.random().toString(36).substring(2, 9),
            sender: "ova",
            text: responseText,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, ovaMsg]);
          setIsTyping(false);
        }, 1200);
      });
  };

  // Rule-based engine fallback
  const getMensionFallbackResponse = (input: string): string => {
    const text = input.toLowerCase();
    const contains = (words: string[]) => words.some(w => text.includes(w));

    const cycleNote = cyclePhase !== "general" 
      ? `\n\n(I also wanted to gently remind you: since you're in your ${cyclePhase} phase, your physical and emotional baseline is shifting. Be extra gentle with yourself today.)`
      : "";

    if (contains(["to-do", "todo", "overwhelm", "busy", "stress", "exhaust", "tired", "too much"])) {
      return "Oh, love, take a big, slow breath. 🍃 When everything piles up, our nervous system gets stuck in fight-or-flight, making even small tasks feel like mountains. \n\nLet's do a tiny reset together: What is *one* single thing on that list we can do, or better yet, what is something we can cross off and say 'not today'? You don't have to carry the whole world on your shoulders." + cycleNote;
    }
    
    if (contains(["doubt", "fail", "not good enough", "imposter", "stupid", "mistake", "screwed", "ugly", "bad"])) {
      return "Hey, look at me. 🌻 That voice in your head telling you you're not enough? That's not your truth—that's just your anxiety trying to protect you from rejection by criticizing you first. \n\nIn psychology, we call this self-critical bias. If your best friend made the same mistake, would you call them a failure? Of course not. You'd hug them and tell them they are doing their best. Can you try giving that same grace to yourself right now?" + cycleNote;
    }

    if (contains(["conflict", "fight", "argument", "angry", "guilt", "sorry", "mad"])) {
      return "Conflict is so incredibly draining, and that post-argument guilt is real. 😔 It's okay to feel upset, and it's also okay that you both had different needs in that moment.\n\nPsychology teaches us that rupture is normal, but *repair* is what matters. When you're ready, you can speak from your own feelings (using 'I' statements, like 'I felt hurt when...'). But for right now, let your nervous system settle. You are not a bad person for having boundaries or disagreements." + cycleNote;
    }

    if (contains(["win", "happy", "accomplished", "did it", "celebrate", "proud", "good news"])) {
      return "Oh my gosh, yay! 🎉 I am absolutely thrilled for you! Let's pause and soak this in. We so often rush to the next challenge without celebrating our wins. \n\nTaking a moment to feel proud actually rewires your brain's dopamine pathways (we call it 'savoring' in positive psychology!). Tell me more—how does it feel to see your effort pay off? You earned this moment!";
    }

    if (contains(["anxious", "anxiety", "panic", "scared", "ova", "worry", "worried"])) {
      return "I hear you, and it's okay that you're feeling anxious. Anxiety is just your body's alarm system misfiring. You are safe right now, in this space, with me. \n\nLet's try a quick grounding exercise: find 3 things in your room that are yellow or lavender, and touch them. Focus on their texture. Take a slow inhale... and a long exhale. I'm right here with you. Do you want to talk about what triggered it, or should we just keep breathing?" + cycleNote;
    }

    if (contains(["sad", "cry", "depressed", "lonely", "hurt", "broken"])) {
      return "I'm sending you the biggest virtual hug. 🤍 It is completely okay to cry and feel heavy. Emotions are like waves—they peak, they feel like they might crush us, but they always, always recede if we let them wash through us. \n\nYou don't have to 'fix' this sadness right this second. Just wrap yourself in a warm blanket, have a sip of water, and know that you are not alone. I am here, and I'm listening." + cycleNote;
    }

    if (contains(["hello", "hi", "hey", "ova"])) {
      return "Hi there! It's always so good to hear from you. 🌸 What's on your mind today? Are we venting, looking for a psychology reframe, or just having a chat?";
    }

    const defaults = [
      "I'm listening, sweet friend. That sounds like a lot to process. Tell me more about how that made you feel?",
      "That is a completely valid way to feel. You're not being dramatic at all. If you could tell the person involved exactly what you need, what would it be?",
      "Thank you for sharing that with me. It takes real courage to open up. Let's look at this together—how can we show you a little more kindness today?",
      "I'm so glad you're telling me this. It sounds like you're handling a really complex situation with a lot of maturity, even if it feels messy. What is the most supportive thing I can do for you right now?"
    ];
    
    return defaults[Math.floor(Math.random() * defaults.length)] + (cyclePhase !== "general" ? ` (Keep in mind your energy is influenced by your ${cyclePhase} cycle right now!)` : "");
  };

  const clearChat = () => {
    if (confirm("Are you sure you want to clear our chat history? It will start fresh.")) {
      setMessages([
        {
          id: "welcome",
          sender: "ova",
          text: "Hey sweet friend! 🌸 We're starting fresh. How can I support you today?",
          timestamp: new Date(),
        },
      ]);
      localStorage.removeItem("ova-chat-history");
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-65px)] md:h-screen bg-white/50 max-w-7xl mx-auto w-full p-4 md:p-6 animate-slide-up">
      {/* Chat Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-black/5 pb-4 gap-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-lavender flex items-center justify-center shadow-sm">
              <span className="text-xl">🌙</span>
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"></span>
          </div>
          <div>
            <h3 className="font-dm-sans font-medium text-base text-charcoal">Ova</h3>
            <p className="text-xs text-warm-gray font-light">Active & listening</p>
          </div>
        </div>

        {/* Cycle Phase Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-2">
            <label htmlFor="cycle-select" className="text-[10px] font-bold text-warm-gray uppercase tracking-wider hidden sm:inline">
              Cycle Phase:
            </label>
            <select
              id="cycle-select"
              value={cyclePhase}
              onChange={(e) => {
                setCyclePhase(e.target.value);
                localStorage.setItem("ova-cycle-phase", e.target.value);
              }}
              className="text-xs bg-lavender-light border border-lavender rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-lavender-dark text-charcoal font-semibold"
            >
              <option value="general">Quiet / General</option>
              <option value="menstrual">Menstrual Phase (Rest ☁️)</option>
              <option value="follicular">Follicular Phase (Rise 🌱)</option>
              <option value="ovulatory">Ovulatory Phase (Peak ☀️)</option>
              <option value="luteal">Luteal Phase (Shift ⛈️)</option>
            </select>
          </div>

          <button
            onClick={clearChat}
            className="text-xs text-warm-gray hover:text-red-500 font-medium transition-colors px-2 py-1 rounded-xl hover:bg-red-50"
            title="Clear Chat History"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Offline Mode Banner */}
      {isOfflineMode && (
        <div className="bg-amber-50/70 border border-amber-200/50 rounded-xl px-4 py-2.5 flex items-center gap-2 mt-3 text-[11px] text-amber-800 shrink-0 font-medium">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Offline mode active. Add a valid `GROQ_API_KEY` to the `.env` file to unlock AI Ova responses.</span>
        </div>
      )}

      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto py-6 space-y-4 px-2">
        {messages.map((msg) => {
          const isMension = msg.sender === "ova";
          return (
            <div
              key={msg.id}
              className={`flex ${isMension ? "justify-start" : "justify-end"} animate-fade-in w-full group mb-2`}
            >
              <div className={`flex max-w-[85%] sm:max-w-[70%] items-end gap-2 ${!isMension && "flex-row-reverse"}`}>
                {isMension && (
                  <div className="w-6 h-6 rounded-full bg-lavender flex items-center justify-center shrink-0 mb-1">
                    <span className="text-[10px]">🌙</span>
                  </div>
                )}
                <div
                  className={`rounded-[20px] px-4 py-3 text-[15px] leading-relaxed relative shadow-[0_2px_12px_rgba(107,79,160,0.06)] ${
                    isMension
                      ? "bg-mesh-lavender text-charcoal rounded-bl-sm border border-lavender/30"
                      : "bg-mesh-butter text-charcoal rounded-br-sm border border-butter/30"
                  }`}
                >
                  <p className="whitespace-pre-wrap font-light">{msg.text}</p>
                  <span className={`block text-[10px] opacity-0 group-hover:opacity-100 transition-opacity absolute ${isMension ? "-bottom-5 left-2" : "-bottom-5 right-2"} text-warm-gray/70 font-medium whitespace-nowrap`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Mension Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white text-charcoal shadow-sm border border-lavender/40 rounded-2xl rounded-tl-sm px-5 py-3">
              <div className="flex space-x-1 items-center h-4">
                <div className="w-2 h-2 bg-lavender-dark rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 bg-lavender-dark rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 bg-lavender-dark rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Conversation Starters */}
      {messages.length <= 2 && !isTyping && (
        <div className="mb-4 shrink-0">
          <p className="text-[10px] text-warm-gray font-semibold uppercase tracking-wider mb-2 px-1">
            Suggested Conversations
          </p>
          <div className="flex flex-wrap gap-2">
            {starters.map((starter, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(starter.text)}
                className="text-xs bg-lavender-light hover:bg-lavender text-charcoal border border-lavender/50 px-3.5 py-2 rounded-xl transition-all-300 text-left font-medium hover:scale-102"
              >
                {starter.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputText);
        }}
        className="flex items-center gap-3 bg-white p-2 rounded-full shadow-[0_2px_16px_rgba(107,79,160,0.08)] shrink-0 border border-black/5 mt-4"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="iMessage"
          disabled={isTyping}
          className="flex-1 outline-none text-[15px] px-4 py-2 bg-transparent text-charcoal placeholder-warm-gray/60 font-light"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isTyping}
          className={`w-8 h-8 rounded-full transition-all-300 flex items-center justify-center shrink-0 mr-1 ${
            inputText.trim() && !isTyping
              ? "bg-lavender text-lavender-dark hover:scale-105"
              : "bg-gray-50 text-gray-300 cursor-not-allowed"
          }`}
        >
          <SendHorizonal className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
