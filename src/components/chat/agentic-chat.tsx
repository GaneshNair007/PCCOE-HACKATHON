"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Wrench,
  Terminal,
  Bot,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  toolUsed?: string | null;
  toolOutput?: any;
  timestamp: string;
}

export function AgenticChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const quickPrompts = [
    'check stripe.com',
    'why is this a C?',
    'simulate 90% image compression',
    'compare vercel.com with stripe.com',
    'explain for executives',
  ];

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Provide immediate visual cue if query matches a known tool trigger
    if (query.match(/check|audit|test|scan/i)) {
      setActiveTool('run_audit(url)...');
    } else if (query.match(/compare/i)) {
      setActiveTool('compare(url_a, url_b)...');
    } else if (query.match(/simulate|compress|defer/i)) {
      setActiveTool('simulate(levers)...');
    } else if (query.match(/explain|pm priya|executive/i)) {
      setActiveTool('explain_for_exec()...');
    } else {
      setActiveTool('get_last_audit()...');
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Agent failed to respond.");
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: data.reply,
        toolUsed: data.tool_used,
        toolOutput: data.tool_output,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "assistant",
          text: `⚠️ Agent execution error: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
      setActiveTool(null);
    }
  };

  return (
    <>
      {/* Floating Action Trigger Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open Agentic Sustainability Chat"
          className="relative group p-4 rounded-full bg-forest-900 border border-lime text-lime shadow-lime hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center"
        >
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-lime"></span>
          </span>
          <Bot className="w-6 h-6 text-lime group-hover:rotate-12 transition-transform duration-300" />
        </button>
      </motion.div>

      {/* Slide-out Glassmorphic Agent Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[460px] h-[640px] max-h-[82vh] rounded-2xl glass-panel-elevated border border-lime/30 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-surface-border bg-surface-elevated/70 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-lime/10 border border-lime/40 flex items-center justify-center text-lime">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display tracking-wider text-cream text-lg uppercase">
                      CARBONERRA AI
                    </span>
                    <Badge variant="lime" className="text-[9px] px-1.5 py-0">
                      AGENTIC SWDM v4
                    </Badge>
                  </div>
                  <p className="text-[11px] font-mono text-sage/70">
                    Live Telemetry & Optimization Agent
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-sage/60 hover:text-cream p-1.5 rounded-lg hover:bg-surface-border/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body / Message Stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {/* Empty State */}
              {messages.length === 0 && (
                <div className="h-full flex flex-col justify-center items-center text-center p-4 space-y-6">
                  <div className="w-14 h-14 rounded-2xl bg-forest-900/60 border border-lime/30 flex items-center justify-center text-lime lime-glow">
                    <Bot className="w-7 h-7" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-display text-xl text-cream tracking-wide uppercase">
                      GROUNDED SUSTAINABILITY ASSISTANT
                    </h4>
                    <p className="text-xs text-sage/80 leading-relaxed font-sans max-w-xs">
                      Ask me to check a site, explain a score, or simulate a fix — I&apos;ll actually run it, not guess.
                    </p>
                  </div>

                  {/* Starter Chips */}
                  <div className="w-full space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-lime/80 block text-left">
                      SUGGESTED ACTIONS
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {quickPrompts.map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(prompt)}
                          className="w-full text-left text-xs font-mono p-2.5 rounded-xl bg-surface border border-surface-border hover:border-lime/40 hover:text-lime transition-all duration-200 text-cream/90 flex items-center justify-between group"
                        >
                          <span>&ldquo;{prompt}&rdquo;</span>
                          <Send className="w-3 h-3 text-sage/40 group-hover:text-lime group-hover:translate-x-0.5 transition-all" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Message List */}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[88%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-forest-900 border border-lime/40 text-cream rounded-br-none"
                        : "bg-surface border border-surface-border text-sage rounded-bl-none font-sans"
                    }`}
                  >
                    {/* Tool Badge Indicator */}
                    {msg.toolUsed && (
                      <div className="mb-2.5 pb-2 border-b border-surface-border/60 flex items-center gap-1.5 text-[10px] font-mono text-lime">
                        <Wrench className="w-3.5 h-3.5" />
                        <span>EXECUTED TOOL:</span>
                        <code className="bg-[#080d0b] px-1.5 py-0.5 rounded border border-lime/30 text-lime font-bold">
                          {msg.toolUsed}
                        </code>
                      </div>
                    )}

                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  </div>
                  <span className="text-[10px] font-mono text-sage/50 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              ))}

              {/* Active Tool Calling State */}
              {loading && (
                <div className="flex items-start gap-2">
                  <div className="p-3 rounded-2xl rounded-bl-none bg-surface border border-lime/30 text-lime text-xs font-mono space-y-2 max-w-[85%]">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 animate-spin text-lime" />
                      <span className="font-bold">AGENT EXECUTING TOOL...</span>
                    </div>
                    {activeTool && (
                      <div className="text-[11px] text-sage/80 bg-[#080d0b] p-2 rounded border border-lime/20 flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5 text-lime shrink-0" />
                        <span className="font-mono text-lime truncate">{activeTool}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Bar (if active chat) */}
            {messages.length > 0 && (
              <div className="px-4 py-2 border-t border-surface-border bg-surface/50 overflow-x-auto flex gap-1.5 scrollbar-none">
                {quickPrompts.slice(0, 3).map((prompt, i) => (
                  <button
                    key={i}
                    disabled={loading}
                    onClick={() => handleSend(prompt)}
                    className="shrink-0 text-[10px] font-mono px-2.5 py-1 rounded-full bg-surface-elevated border border-surface-border text-sage/70 hover:text-lime hover:border-lime/40 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3.5 border-t border-surface-border bg-surface-elevated/90">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  disabled={loading}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder='Try: "check stripe.com" or "why is this a C?"'
                  className="flex-1 bg-surface border border-surface-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-cream placeholder:text-sage/40 focus:outline-none focus:border-lime transition-colors"
                />
                <Button
                  type="submit"
                  variant="lime"
                  size="sm"
                  disabled={loading || !input.trim()}
                  className="px-3 py-2.5 rounded-xl shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
