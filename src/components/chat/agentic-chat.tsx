"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Sparkles,
  Wrench,
  Terminal,
  Bot,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ShieldAlert,
  Cpu,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ChatActionLink {
  label: string;
  href: string;
}

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  toolUsed?: string | null;
  toolOutput?: any;
  engine?: string;
  actionLinks?: ChatActionLink[];
  timestamp: string;
}

export function AgenticChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname() || "";
  let searchParams: URLSearchParams | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    searchParams = useSearchParams();
  } catch {
    // Fallback if rendered outside suspense
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Context-aware dynamic suggestions
  const isSavingsLab = pathname.includes("savings-lab");
  const isShield = pathname.includes("shield");
  const isEvidence = pathname.includes("evidence");

  const quickPrompts = isSavingsLab
    ? [
        "prepare experiment",
        "test candidate",
        "test broken candidate",
        "evaluate release shield budget",
      ]
    : isShield
    ? [
        "evaluate budget for candidate",
        "evaluate budget for baseline",
        "check release shield breaches",
      ]
    : isEvidence
    ? [
        "generate receipt",
        "explain methodology assumptions",
        "verify candidate task preservation",
      ]
    : [
        "check stripe.com",
        "compare vercel.com with stripe.com",
        "prepare experiment for campus-events",
        "simulate 80% image compression",
        "evaluate release shield budget",
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
    setActiveTool("Executing sustainability tool...");

    // Build explicit context from the active route and search params
    const context: Record<string, string> = {
      projectId: "campus-events",
      journeyId: "event-registration",
    };
    if (searchParams) {
      const expParam = searchParams.get("experimentId");
      if (expParam) context.experimentId = expParam;
      const urlParam = searchParams.get("url");
      if (urlParam) context.targetUrl = urlParam;
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query, context }),
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
        engine: data.engine,
        actionLinks: data.actionLinks || [],
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
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[490px] h-[660px] max-h-[84vh] rounded-2xl glass-panel-elevated border border-lime/30 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-surface-border bg-surface-elevated/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-lime/10 border border-lime/40 flex items-center justify-center text-lime">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display tracking-wider text-cream text-lg uppercase">
                      CARBONERRA AI
                    </span>
                    <Badge variant="lime" className="text-[9px] px-1.5 py-0 font-mono">
                      SWDM v4
                    </Badge>
                  </div>
                  <p className="text-[10px] font-mono text-sage/70">
                    Real Tool Execution • Audit → Fix → Verify → Protect
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
                <div className="h-full flex flex-col justify-center items-center text-center p-4 space-y-5">
                  <div className="w-14 h-14 rounded-2xl bg-forest-900/80 border border-lime/40 flex items-center justify-center text-lime lime-glow">
                    <Bot className="w-7 h-7" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-display text-lg text-cream tracking-wide uppercase">
                      ZERO HARDCODED ESTIMATES
                    </h4>
                    <p className="text-xs text-sage/80 leading-relaxed font-sans max-w-xs">
                      Every response is computed from real audits, headless browser journey passes, SWDM v4 formulas, or CI budget evaluations.
                    </p>
                  </div>

                  {/* Starter Chips */}
                  <div className="w-full space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-lime/80 block text-left">
                      REAL TOOL ACTIONS
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
                    className={`max-w-[92%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-forest-900 border border-lime/40 text-cream rounded-br-none"
                        : "bg-surface border border-surface-border text-sage rounded-bl-none font-sans"
                    }`}
                  >
                    {/* Tool Badge Indicator */}
                    {msg.toolUsed && (
                      <div className="mb-2 pb-2 border-b border-surface-border/60 flex items-center gap-1.5 text-[10px] font-mono text-lime overflow-hidden">
                        <Wrench className="w-3.5 h-3.5 shrink-0" />
                        <span className="shrink-0">TOOL EXECUTED:</span>
                        <code className="bg-[#080d0b] px-1.5 py-0.5 rounded border border-lime/30 text-lime font-bold truncate max-w-[240px]">
                          {msg.toolUsed}
                        </code>
                      </div>
                    )}

                    {/* Markdown / Text Content */}
                    <div className="whitespace-pre-wrap font-sans">{msg.text}</div>

                    {/* Rich Tool Output Card (when structured data available) */}
                    {msg.toolOutput && (
                      <div className="mt-3 pt-2.5 border-t border-surface-border/60 space-y-2">
                        {/* 1. Experiment Patch proposal */}
                        {msg.toolOutput.patchProposal && (
                          <div className="p-2.5 rounded-lg bg-[#080d0b] border border-surface-border text-[11px] font-mono space-y-1">
                            <div className="flex items-center justify-between text-lime">
                              <span>PATCH PROPOSAL</span>
                              <Badge variant="lime" className="text-[9px]">
                                -{msg.toolOutput.patchProposal.estimatedSavingPct}% Projected
                              </Badge>
                            </div>
                            <p className="text-sage/80 truncate">
                              Target: {msg.toolOutput.patchProposal.targetFile}
                            </p>
                          </div>
                        )}

                        {/* 2. Candidate Verification outcome */}
                        {msg.toolOutput.outcome && (
                          <div className="p-2.5 rounded-lg bg-[#080d0b] border border-surface-border text-[11px] font-mono space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-sage/80">VERIFICATION</span>
                              {msg.toolOutput.outcome === "VERIFIED_IMPROVEMENT" ? (
                                <Badge variant="lime" className="flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> VERIFIED
                                </Badge>
                              ) : (
                                <Badge variant="danger" className="flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" /> BLOCKED
                                </Badge>
                              )}
                            </div>
                            {msg.toolOutput.percentSaved !== undefined && (
                              <div className="text-cream text-[11px]">
                                Measured Saving:{" "}
                                <strong className="text-lime">
                                  {msg.toolOutput.percentSaved}%
                                </strong>{" "}
                                (
                                {Math.round(msg.toolOutput.bytesSaved / 1024)} KB)
                              </div>
                            )}
                          </div>
                        )}

                        {/* 3. Release Shield Budget */}
                        {msg.toolOutput.exitCode !== undefined && (
                          <div className="p-2.5 rounded-lg bg-[#080d0b] border border-surface-border text-[11px] font-mono space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sage/80">RELEASE SHIELD</span>
                              <Badge
                                variant={msg.toolOutput.passed ? "lime" : "danger"}
                                className="text-[9px]"
                              >
                                {msg.toolOutput.passed ? "PASSED (Exit 0)" : "BLOCKED (Exit 1)"}
                              </Badge>
                            </div>
                            <div className="text-cream text-[10px]">
                              Transfer: {Math.round(msg.toolOutput.actualBytes / 1024)} KB /{" "}
                              {Math.round(msg.toolOutput.thresholdBytes / 1024)} KB Ceiling
                            </div>
                          </div>
                        )}

                        {/* Interactive Action Links */}
                        {msg.actionLinks && msg.actionLinks.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {msg.actionLinks.map((link, idx) => (
                              <Link
                                key={idx}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className="inline-flex items-center gap-1 text-[10px] font-mono px-2.5 py-1 rounded-lg bg-lime/10 border border-lime/40 text-lime hover:bg-lime/20 transition-colors"
                              >
                                <span>{link.label}</span>
                                <ArrowUpRight className="w-3 h-3" />
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Message Metadata Bar */}
                  <div className="flex items-center gap-2 mt-1 px-1">
                    <span className="text-[10px] font-mono text-sage/50">
                      {msg.timestamp}
                    </span>
                    {msg.engine && (
                      <span className="text-[9px] font-mono text-lime/60 bg-surface px-1.5 py-0.2 rounded border border-surface-border">
                        {msg.engine}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {/* Active Tool Calling State */}
              {loading && (
                <div className="flex items-start gap-2">
                  <div className="p-3.5 rounded-2xl rounded-bl-none bg-surface border border-lime/30 text-lime text-xs font-mono space-y-2 max-w-[85%]">
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
                  placeholder='Ask: "check stripe.com", "test candidate", or "evaluate budget"'
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
