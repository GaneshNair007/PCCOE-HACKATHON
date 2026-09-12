"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
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

function FormattedMessageText({ text }: { text: string }) {
  const lines = text.split("\n");
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  const elements: React.ReactNode[] = [];

  lines.forEach((line, idx) => {
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        inCodeBlock = false;
        const code = codeBlockContent.join("\n");
        codeBlockContent = [];
        elements.push(
          <pre key={`code-${idx}`} tabIndex={0} aria-label="Code example" className="my-3 max-w-full p-3 rounded-xl bg-obsidian border border-surface-border font-mono text-xs text-lime overflow-x-auto [overflow-wrap:normal]">
            <code>{code}</code>
          </pre>
        );
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      return;
    }

    if (line.trim() === "") {
      elements.push(<div key={`empty-${idx}`} className="h-1.5" />);
      return;
    }

    const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    const isBullet = line.trim().startsWith("- ") || line.trim().startsWith("• ");

    elements.push(
      <div key={`line-${idx}`} className={isBullet ? "min-w-0 pl-2 flex items-start gap-1.5" : "min-w-0"}>
        {isBullet && <span className="text-lime text-xs mt-0.5" aria-hidden="true">•</span>}
        <span className="flex-1 min-w-0">
          {parts.map((part, pIdx) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return (
                <strong key={pIdx} className="font-bold text-cream">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            if (part.startsWith("`") && part.endsWith("`")) {
              return (
                <code key={pIdx} className="px-1.5 py-0.5 rounded bg-obsidian border border-surface-border text-lime font-mono text-xs [overflow-wrap:anywhere]">
                  {part.slice(1, -1)}
                </code>
              );
            }
            return <span key={pIdx}>{part}</span>;
          })}
        </span>
      </div>
    );
  });

  return <div className="min-w-0 space-y-1 font-sans leading-relaxed [overflow-wrap:anywhere]">{elements}</div>;
}

export function AgenticChat() {
  const reduceMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-init",
      sender: "assistant",
      text: "👋 **Hello! I'm Carbonerra AI.**\n\nI'm your intelligent companion for general programming, frontend architecture, and real-time digital carbon audits.\n\nFeel free to say hi, ask a web performance question, or audit a live website!",
      timestamp: "Now",
    },
  ]);
  const messageScrollRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelViewport, setPanelViewport] = useState<{ height: number; bottom: number } | null>(null);

  const pathname = usePathname() || "";
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isOpen) return;
    const container = messageScrollRef.current;
    container?.scrollTo({ top: container.scrollHeight, behavior: reduceMotion ? "auto" : "smooth" });
  }, [isOpen, messages, loading, reduceMotion]);

  useEffect(() => {
    if (!isOpen) return;
    const launcher = launcherRef.current;
    const frame = requestAnimationFrame(() => {
      const target = inputRef.current?.disabled ? panelRef.current : inputRef.current;
      target?.focus({ preventScroll: true });
    });
    return () => {
      cancelAnimationFrame(frame);
      launcher?.focus({ preventScroll: true });
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !window.visualViewport) return;
    const viewport = window.visualViewport;
    const updateViewport = () => {
      const occludedHeight = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      const keyboardOpen = occludedHeight > 120;
      setPanelViewport({
        height: Math.min(660, Math.max(160, viewport.height - (keyboardOpen ? 32 : 120))),
        bottom: keyboardOpen ? occludedHeight + 16 : 96,
      });
    };
    updateViewport();
    viewport.addEventListener("resize", updateViewport);
    viewport.addEventListener("scroll", updateViewport);
    return () => {
      viewport.removeEventListener("resize", updateViewport);
      viewport.removeEventListener("scroll", updateViewport);
    };
  }, [isOpen]);

  // Context-aware dynamic suggestions
  const isSavingsLab = pathname.includes("savings-lab");
  const isShield = pathname.includes("shield");
  const isEvidence = pathname.includes("evidence");

  const quickPrompts = isSavingsLab
    ? [
        "How do I optimize oversized images?",
        "prepare experiment",
        "test candidate",
        "evaluate release shield budget",
      ]
    : isShield
    ? [
        "How does a CI budget gate work?",
        "evaluate budget for candidate",
        "check release shield breaches",
      ]
    : isEvidence
    ? [
        "generate receipt",
        "explain methodology assumptions",
        "verify candidate task preservation",
      ]
    : [
        "Hello! What can you do?",
        "check stripe.com",
        "compare vercel.com with stripe.com",
        "How do I optimize web images?",
        "what if 80% image compression",
      ];

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        sender: "assistant",
        text: "👋 Chat cleared! How can I help you next?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

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
        className="ct-chat-launcher fixed bottom-5 right-4 sm:right-6 z-50 print:hidden"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.22 }}
      >
        <button
          ref={launcherRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close Carbonerra AI chat" : "Open Carbonerra AI chat"}
          aria-expanded={isOpen}
          aria-controls="carbonerra-chat-panel"
          aria-haspopup="dialog"
          className="p-4 rounded-full bg-surface border border-surface-border text-lime shadow-lg hover:bg-surface-elevated hover:border-sage/50 transition-colors duration-200 flex items-center justify-center"
        >
          <Bot className="w-6 h-6" aria-hidden="true" />
        </button>
      </motion.div>

      {/* Slide-out Glassmorphic Agent Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            id="carbonerra-chat-panel"
            role="dialog"
            aria-modal="false"
            aria-labelledby="carbonerra-chat-title"
            aria-describedby="carbonerra-chat-description"
            tabIndex={-1}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.stopPropagation();
                setIsOpen(false);
              }
            }}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{
              width: "min(490px, calc(100vw - 32px))",
              height: panelViewport?.height ?? "min(660px, calc(100dvh - 120px))",
              bottom: panelViewport?.bottom ?? 96,
            }}
            className="ct-chat-panel fixed right-4 sm:right-6 z-50 min-h-0 rounded-3xl bg-surface border border-surface-border shadow-2xl flex flex-col overflow-hidden print:hidden"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-surface-border bg-surface-elevated flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 shrink-0 rounded-full bg-lime/10 border border-surface-border flex items-center justify-center text-lime">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 id="carbonerra-chat-title" className="font-display font-light tracking-tight text-cream text-lg">
                      Carbonerra AI
                    </h2>
                    <Badge variant="lime" className="text-[9px] px-1.5 py-0 font-mono">
                      v2.0
                    </Badge>
                  </div>
                  <p id="carbonerra-chat-description" className="text-xs text-sage leading-relaxed">
                    Web performance & carbon guidance
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={handleClearChat}
                  title="Clear conversation"
                  aria-label="Clear conversation"
                  className="text-sage hover:text-cream w-10 h-10 sm:w-auto sm:px-3 rounded-full hover:bg-surface-border/50 transition-colors text-xs flex items-center justify-center gap-1 font-mono"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[10px]">Clear</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chat"
                  className="text-sage hover:text-cream w-10 h-10 rounded-full hover:bg-surface-border/50 transition-colors flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Body / Message Stream */}
            <div ref={messageScrollRef} className="flex-1 min-h-0 p-4 overflow-y-auto overscroll-contain space-y-4">
              {/* Empty State */}
              {messages.length === 0 && (
                <div className="h-full flex flex-col justify-center items-center text-center p-4 space-y-5">
                  <div className="w-14 h-14 rounded-2xl bg-surface-elevated border border-surface-border flex items-center justify-center text-lime">
                    <Bot className="w-7 h-7" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-display font-light text-xl text-cream tracking-tight">
                      Your Carbonerra companion
                    </h3>
                    <p className="text-xs text-sage/80 leading-relaxed font-sans max-w-xs">
                      Chat about general programming, ask for web optimization tips, or run live digital carbon telemetry against any website.
                    </p>
                  </div>

                  {/* Starter Chips */}
                  <div className="w-full space-y-2">
                    <span className="text-xs font-mono text-sage block text-left">
                      Try a conversation starter
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {quickPrompts.map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(prompt)}
                          type="button"
                          className="w-full text-left text-sm p-3 rounded-xl bg-surface border border-surface-border hover:border-lime/40 hover:text-lime transition-colors duration-200 text-cream flex items-center justify-between gap-2"
                        >
                          <span>&ldquo;{prompt}&rdquo;</span>
                          <Send className="w-3.5 h-3.5 shrink-0 text-sage" aria-hidden="true" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Message List */}
              <div role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions" aria-atomic="false" className="space-y-4 min-w-0">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`min-w-0 flex flex-col ${
                    msg.sender === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`min-w-0 max-w-[94%] p-3.5 rounded-2xl text-sm leading-relaxed [overflow-wrap:anywhere] ${
                      msg.sender === "user"
                        ? "bg-forest-900 border border-surface-border text-cream rounded-br-md"
                        : "bg-surface-elevated border border-surface-border text-sage rounded-bl-md font-sans"
                    }`}
                  >
                    <span className="sr-only">{msg.sender === "user" ? "You" : "Carbonerra AI"}: </span>
                    {/* Tool Badge Indicator */}
                    {msg.toolUsed && (
                      <div className="mb-2 pb-2 border-b border-surface-border/60 flex flex-wrap items-center gap-1.5 text-xs font-mono text-lime">
                        <Wrench className="w-3.5 h-3.5 shrink-0" />
                        <span className="shrink-0">Tool executed:</span>
                        <code className="bg-obsidian px-1.5 py-0.5 rounded border border-surface-border text-lime break-all">
                          {msg.toolUsed}
                        </code>
                      </div>
                    )}

                    {/* Formatted Markdown / Text Content */}
                    <FormattedMessageText text={msg.text} />

                    {/* Rich Tool Output Card (when structured data available) */}
                    {msg.toolOutput && (
                      <div className="mt-3 pt-2.5 border-t border-surface-border/60 space-y-2">
                        {/* 1. Experiment Patch proposal */}
                        {msg.toolOutput.patchProposal && (
                          <div className="p-3 rounded-xl bg-obsidian border border-surface-border text-xs font-mono space-y-1">
                            <div className="flex flex-wrap items-center justify-between gap-2 text-lime">
                              <span>Patch proposal</span>
                              <Badge variant="lime" className="text-[9px]">
                                -{msg.toolOutput.patchProposal.estimatedSavingPct}% Projected
                              </Badge>
                            </div>
                            <p className="text-sage break-words [overflow-wrap:anywhere]">
                              Target: {msg.toolOutput.patchProposal.targetFile}
                            </p>
                          </div>
                        )}

                        {/* 2. Candidate Verification outcome */}
                        {msg.toolOutput.outcome && (
                          <div className="p-3 rounded-xl bg-obsidian border border-surface-border text-xs font-mono space-y-1.5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-sage">Verification</span>
                              {msg.toolOutput.outcome === "VERIFIED_IMPROVEMENT" ? (
                                <Badge variant="lime" className="flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Verified
                                </Badge>
                              ) : (
                                <Badge variant="danger" className="flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" /> Blocked
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
                          <div className="p-3 rounded-xl bg-obsidian border border-surface-border text-xs font-mono space-y-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-sage">Release Shield</span>
                              <Badge
                                variant={msg.toolOutput.passed ? "lime" : "danger"}
                                className="text-[9px]"
                              >
                                {msg.toolOutput.passed ? "Passed (exit 0)" : "Blocked (exit 1)"}
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
                                className="inline-flex items-center gap-1.5 min-h-10 text-xs px-3 py-2 rounded-full bg-lime/10 border border-lime/30 text-lime hover:bg-lime/20 transition-colors"
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
                    <span className="text-[11px] font-mono text-sage/70">
                      {msg.timestamp}
                    </span>
                    {msg.engine && (
                      <span className="text-[10px] font-mono text-sage bg-surface px-1.5 py-0.5 rounded border border-surface-border break-all">
                        {msg.engine}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              </div>

              {/* Active Tool Calling State */}
              {loading && (
                <div role="status" aria-live="polite" className="flex items-start gap-2">
                  <div className="p-3.5 rounded-2xl rounded-bl-none bg-surface border border-lime/30 text-lime text-xs font-mono space-y-2 max-w-[85%]">
                    <div className="flex items-center gap-2">
                      <Zap className={`w-4 h-4 text-lime ${reduceMotion ? "" : "animate-spin"}`} aria-hidden="true" />
                      <span className="font-medium">Working on your request…</span>
                    </div>
                    {activeTool && (
                      <div className="text-xs text-sage bg-obsidian p-2 rounded-lg border border-surface-border flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5 text-lime shrink-0" />
                        <span className="font-mono text-lime break-words">{activeTool}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Quick Action Bar (if active chat) */}
            {messages.length > 0 && (
              <div role="group" aria-label="Suggested questions" className="px-4 py-2 border-t border-surface-border bg-surface overflow-x-auto flex gap-2 shrink-0">
                {quickPrompts.slice(0, 3).map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    disabled={loading}
                    onClick={() => handleSend(prompt)}
                    className="shrink-0 text-xs px-3 py-2 rounded-full bg-surface-elevated border border-surface-border text-sage hover:text-lime hover:border-lime/40 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3.5 border-t border-surface-border bg-surface-elevated shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2 min-w-0"
              >
                <label htmlFor="carbonerra-chat-message" className="sr-only">Message Carbonerra AI</label>
                <input
                  ref={inputRef}
                  id="carbonerra-chat-message"
                  type="text"
                  value={input}
                  disabled={loading}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder='Ask anything: "hi", "how to optimize images?", or "check stripe.com"...'
                  className="flex-1 min-w-0 min-h-11 bg-surface border border-surface-border rounded-2xl px-3.5 py-2.5 text-base text-cream placeholder:text-sage/60 focus:outline-none focus:border-lime transition-colors"
                />
                <Button
                  type="submit"
                  variant="lime"
                  size="sm"
                  disabled={loading || !input.trim()}
                  aria-label="Send message"
                  className="px-3 py-2.5 min-w-11 rounded-full shrink-0"
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
