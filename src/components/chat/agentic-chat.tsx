"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  X,
  Send,
  Sparkles,
  BotMessageSquare,
  Wrench,
  Terminal,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  Loader2,
  Leaf,
  Award,
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

function CodeBlock({ code, isUser }: { code: string; isUser: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-2.5 max-w-full">
      <pre
        tabIndex={0}
        aria-label="Code example"
        className={`p-3.5 pr-14 rounded-xl font-mono text-xs overflow-x-auto [overflow-wrap:normal] ${
          isUser
            ? "bg-black/90 border border-black/30 text-[#cbff00]"
            : "bg-black/80 border border-white/15 text-[#cbff00]"
        }`}
      >
        <code>{code}</code>
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy code"
        className="absolute top-2.5 right-2.5 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-sans font-medium text-white/80 hover:text-white transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}

function FormattedMessageText({ text, isUser = false }: { text: string; isUser?: boolean }) {
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
          <CodeBlock key={`code-${idx}`} code={code} isUser={isUser} />
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

    const isBullet = line.trim().startsWith("- ") || line.trim().startsWith("• ");
    const bulletText = isBullet ? line.trim().replace(/^[-•]\s*/, "") : line;
    const parts = bulletText.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

    elements.push(
      <div key={`line-${idx}`} className={isBullet ? "min-w-0 pl-1 flex items-start gap-2" : "min-w-0"}>
        {isBullet && (
          <span className={`text-xs mt-0.5 shrink-0 select-none ${isUser ? "text-black" : "text-[#cbff00]"}`} aria-hidden="true">
            –
          </span>
        )}
        <span className="flex-1 min-w-0">
          {parts.map((part, pIdx) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return (
                <strong key={pIdx} className={`font-semibold ${isUser ? "text-black" : "text-white"}`}>
                  {part.slice(2, -2)}
                </strong>
              );
            }
            if (part.startsWith("`") && part.endsWith("`")) {
              return (
                <code
                  key={pIdx}
                  className={`px-1.5 py-0.5 rounded font-mono text-xs [overflow-wrap:anywhere] ${
                    isUser
                      ? "bg-black/15 text-black border border-black/20"
                      : "bg-white/[0.08] text-[#cbff00] border border-white/12"
                  }`}
                >
                  {part.slice(1, -1)}
                </code>
              );
            }
            return <span key={pIdx} className={isUser ? "text-black" : "text-white/90"}>{part}</span>;
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
      text: "**Hello! I'm CarbonTerra AI.**\n\nI'm your assistant for web performance optimization, full-stack architecture, and real-time digital carbon audits.\n\nFeel free to say hi, ask a web performance question, or audit a live website!",
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
        "audit stripe.com",
        "compare vercel.com with stripe.com",
        "How do I optimize web images?",
        "what if 80% image compression",
      ];

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        sender: "assistant",
        text: "Chat cleared. How can I help you next?",
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
    setActiveTool("Analyzing request...");

    // Build explicit context from the active route and search params
    const context: Record<string, string> = {
      pathname,
      projectId: "campus-events",
      journeyId: "event-registration",
    };
    if (searchParams) {
      const expParam = searchParams.get("experimentId");
      if (expParam) context.experimentId = expParam;
      const urlParam = searchParams.get("url");
      if (urlParam) context.targetUrl = urlParam;
    }

    // Pass last 8 conversation turns for continuous multi-turn memory
    const history = messages
      .filter((m) => m.id !== "welcome-init")
      .slice(-8)
      .map((m) => ({
        role: m.sender,
        content: m.text,
      }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query, history, context }),
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
          text: `[ERROR] Agent execution error: ${err.message}`,
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
      {/* Floating Action Trigger Button with Executive AI Glyph */}
      <motion.div
        className="fixed bottom-6 right-6 z-50 print:hidden flex items-center justify-center group"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.22 }}
      >
        {/* Subtle Apple-style desktop hover tooltip */}
        {!isOpen && (
          <div className="absolute right-full mr-3 hidden sm:flex items-center px-3 py-1.5 rounded-xl bg-black/90 border border-white/15 text-white text-xs font-medium backdrop-blur-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
            <span>Ask CarbonTerra AI</span>
          </div>
        )}

        <button
          ref={launcherRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close CarbonTerra AI chat" : "Open CarbonTerra AI chat"}
          aria-expanded={isOpen}
          aria-controls="carbonerra-chat-panel"
          aria-haspopup="dialog"
          className="ct-chat-launcher-btn relative w-14 h-14 rounded-2xl flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#cbff00]/50 shadow-2xl backdrop-blur-2xl transition-all"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white group-hover:text-[#cbff00] transition-transform duration-200" aria-hidden="true" />
          ) : (
            <div className="relative flex items-center justify-center">
              <BotMessageSquare className="w-6 h-6 text-[#cbff00] transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
            </div>
          )}
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
            className="ct-chat-panel fixed right-4 sm:right-6 z-50 min-h-0 rounded-3xl shadow-2xl flex flex-col overflow-hidden print:hidden"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-white/10 bg-black/60 backdrop-blur-2xl flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 shrink-0 rounded-xl bg-[#cbff00]/10 border border-[#cbff00]/30 flex items-center justify-center text-[#cbff00] shadow-[0_0_15px_rgba(203,255,0,0.15)]">
                  <BotMessageSquare className="w-5 h-5 text-[#cbff00]" />
                </div>
                <div>
                  <h2 id="carbonerra-chat-title" className="font-semibold text-white text-base tracking-tight">
                    CarbonTerra AI
                  </h2>
                  <p id="carbonerra-chat-description" className="text-xs text-white/50 leading-relaxed font-sans">
                    Autonomous web performance & carbon intelligence
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleClearChat}
                  title="Clear conversation"
                  aria-label="Clear conversation"
                  className="text-white/60 hover:text-white w-9 h-9 sm:w-auto sm:px-2.5 rounded-xl hover:bg-white/10 transition-colors text-xs flex items-center justify-center gap-1.5 font-sans font-medium"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">Clear</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chat"
                  className="text-white/60 hover:text-white w-9 h-9 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center"
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
                  <div className="w-14 h-14 rounded-2xl bg-[#cbff00]/10 border border-[#cbff00]/30 flex items-center justify-center text-[#cbff00] shadow-[0_0_25px_rgba(203,255,0,0.2)]">
                    <BotMessageSquare className="w-7 h-7 text-[#cbff00]" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-semibold text-lg text-white tracking-tight">
                      How can I help you today?
                    </h3>
                    <p className="text-xs text-white/60 leading-relaxed font-sans max-w-xs">
                      Ask web development questions, audit website performance, or simulate digital carbon optimization strategies.
                    </p>
                  </div>

                  {/* Starter Chips */}
                  <div className="w-full space-y-2">
                    <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-white/40 block text-left">
                      Suggested prompts
                    </span>
                    <div className="flex flex-col gap-2">
                      {quickPrompts.map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(prompt)}
                          type="button"
                          className="w-full text-left text-xs sm:text-sm p-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-[#cbff00]/50 hover:bg-white/[0.08] hover:text-white transition-all duration-200 text-white/80 flex items-center justify-between gap-2 group font-sans"
                        >
                          <span className="group-hover:text-white transition-colors">{prompt}</span>
                          <Send className="w-3.5 h-3.5 shrink-0 text-white/40 group-hover:text-[#cbff00] transition-colors" aria-hidden="true" />
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
                      className={`min-w-0 max-w-[88%] p-3.5 text-sm leading-relaxed [overflow-wrap:anywhere] ${
                        msg.sender === "user"
                          ? "bg-[#cbff00] text-black font-medium rounded-2xl rounded-br-sm shadow-[0_4px_16px_rgba(203,255,0,0.25)]"
                          : "bg-white/[0.06] border border-white/12 text-white/90 rounded-2xl rounded-bl-sm backdrop-blur-xl shadow-lg font-sans"
                      }`}
                    >
                      <span className="sr-only">{msg.sender === "user" ? "You" : "CarbonTerra AI"}: </span>
                      {/* Tool Badge Indicator */}
                      {msg.toolUsed && (
                        <div className="mb-2 pb-2 border-b border-white/10 flex flex-wrap items-center gap-1.5 text-xs font-sans text-[#cbff00]">
                          <Wrench className="w-3.5 h-3.5 shrink-0" />
                          <span className="shrink-0 text-white/70">Tool executed:</span>
                          <code className="bg-black/60 px-1.5 py-0.5 rounded border border-white/15 text-[#cbff00] break-all font-mono">
                            {msg.toolUsed}
                          </code>
                        </div>
                      )}

                      {/* Formatted Message / Text Content */}
                      <FormattedMessageText text={msg.text} isUser={msg.sender === "user"} />

                      {/* Rich Tool Output Card (when structured data available) */}
                      {msg.toolOutput && (
                        <div className="mt-3 pt-2.5 border-t border-white/10 space-y-2">
                          {/* 1. Live Audit Telemetry Card */}
                          {msg.toolOutput.domain && (msg.toolOutput.totalBytes !== undefined || msg.toolOutput.co2Grams !== undefined) && (
                            <div className="p-3.5 rounded-2xl bg-black/60 border border-[#cbff00]/30 space-y-2.5 shadow-xl font-sans text-xs">
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                                <span className="font-bold text-white truncate">{msg.toolOutput.domain}</span>
                                {msg.toolOutput.ecoScore && (
                                  <Badge variant="lime" className="font-bold text-[10px] px-2 py-0.5 font-sans">
                                    Grade {msg.toolOutput.ecoScore}
                                  </Badge>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-[11px]">
                                <div className="bg-white/[0.04] p-2 rounded-xl border border-white/10">
                                  <span className="text-white/50 block text-[10px] font-medium">TRANSFER</span>
                                  <span className="text-white font-bold font-display tabular-nums">
                                    {msg.toolOutput.totalBytes ? `${(msg.toolOutput.totalBytes / (1024 * 1024)).toFixed(2)} MB` : "N/A"}
                                  </span>
                                </div>
                                <div className="bg-white/[0.04] p-2 rounded-xl border border-white/10">
                                  <span className="text-white/50 block text-[10px] font-medium">DIGITAL CARBON</span>
                                  <span className="text-[#cbff00] font-bold font-display tabular-nums">
                                    {msg.toolOutput.co2Grams !== undefined ? `${msg.toolOutput.co2Grams}g` : "N/A"}
                                  </span>
                                </div>
                              </div>
                              {msg.toolOutput.hosting && (
                                <div className="flex items-center justify-between text-[11px] pt-0.5 text-white/70">
                                  <span>Hosting:</span>
                                  <span className={msg.toolOutput.hosting.isGreen ? "text-[#cbff00] font-semibold flex items-center gap-1" : "text-white/80"}>
                                    {msg.toolOutput.hosting.isGreen ? (
                                      <>
                                        <Leaf className="w-3 h-3 text-[#cbff00]" />
                                        <span>100% Renewable</span>
                                      </>
                                    ) : (
                                      <span>Standard Grid</span>
                                    )}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* 2. Dual-Site Comparison Card */}
                          {msg.toolOutput.siteA && msg.toolOutput.siteB && (
                            <div className="p-3.5 rounded-2xl bg-black/60 border border-[#cbff00]/30 space-y-2.5 shadow-xl font-sans text-xs">
                              <div className="flex items-center justify-between border-b border-white/10 pb-1.5 text-[#cbff00] font-semibold">
                                <span>Comparative Telemetry</span>
                                <Badge variant="lime" className="text-[10px]">
                                  {msg.toolOutput.differencePct}% Delta
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-[11px]">
                                <div className="bg-white/[0.04] p-2 rounded-xl border border-white/10 space-y-0.5">
                                  <div className="font-bold text-white truncate">{msg.toolOutput.siteA.domain}</div>
                                  <div className="text-white/70">{(msg.toolOutput.siteA.bytes / (1024 * 1024)).toFixed(2)} MB</div>
                                  <div className="text-[#cbff00] font-semibold">{msg.toolOutput.siteA.co2Grams}g ({msg.toolOutput.siteA.ecoScore})</div>
                                </div>
                                <div className="bg-white/[0.04] p-2 rounded-xl border border-white/10 space-y-0.5">
                                  <div className="font-bold text-white truncate">{msg.toolOutput.siteB.domain}</div>
                                  <div className="text-white/70">{(msg.toolOutput.siteB.bytes / (1024 * 1024)).toFixed(2)} MB</div>
                                  <div className="text-[#cbff00] font-semibold">{msg.toolOutput.siteB.co2Grams}g ({msg.toolOutput.siteB.ecoScore})</div>
                                </div>
                              </div>
                              {msg.toolOutput.cleanerDomain && (
                                <div className="text-[11px] text-[#cbff00] pt-0.5 flex items-center gap-1.5 font-semibold">
                                  <Award className="w-3.5 h-3.5 text-[#cbff00] shrink-0" />
                                  <span><strong>{msg.toolOutput.cleanerDomain}</strong> is {msg.toolOutput.differencePct}% cleaner</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* 3. Simulation Scenario Delta Card */}
                          {msg.toolOutput.deltaBytes !== undefined && msg.toolOutput.percentSaved !== undefined && !msg.toolOutput.outcome && !msg.toolOutput.exitCode && (
                            <div className="p-3.5 rounded-2xl bg-black/60 border border-[#cbff00]/30 space-y-2 font-sans text-xs shadow-xl">
                              <div className="flex items-center justify-between text-[#cbff00] font-semibold border-b border-white/10 pb-1.5">
                                <span>Simulated Reduction</span>
                                <Badge variant="lime" className="text-[10px] font-sans">
                                  -{msg.toolOutput.percentSaved}%
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-[11px]">
                                <div className="bg-white/[0.04] p-2 rounded-xl border border-white/10">
                                  <span className="text-white/50 block text-[10px] font-medium">TRANSFER SAVED</span>
                                  <span className="text-white font-bold font-display tabular-nums">{Math.round(msg.toolOutput.deltaBytes / 1024)} KB</span>
                                </div>
                                <div className="bg-white/[0.04] p-2 rounded-xl border border-white/10">
                                  <span className="text-white/50 block text-[10px] font-medium">AVOIDED EMISSIONS</span>
                                  <span className="text-[#cbff00] font-bold font-display tabular-nums">{msg.toolOutput.co2SavedGrams} g</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 4. Experiment Patch proposal */}
                          {msg.toolOutput.patchProposal && (
                            <div className="p-3.5 rounded-xl bg-black/60 border border-white/12 text-xs font-sans space-y-1.5">
                              <div className="flex flex-wrap items-center justify-between gap-2 text-[#cbff00]">
                                <span className="font-semibold">Patch Proposal</span>
                                <Badge variant="lime" className="text-[9px] font-sans">
                                  -{msg.toolOutput.patchProposal.estimatedSavingPct}% Projected
                                </Badge>
                              </div>
                              <p className="text-white/70 break-words [overflow-wrap:anywhere]">
                                Target: <span className="font-mono text-white/90">{msg.toolOutput.patchProposal.targetFile}</span>
                              </p>
                            </div>
                          )}

                          {/* 5. Candidate Verification outcome */}
                          {msg.toolOutput.outcome && (
                            <div className="p-3.5 rounded-xl bg-black/60 border border-white/12 text-xs font-sans space-y-1.5">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="text-white/70">Verification</span>
                                {msg.toolOutput.outcome === "VERIFIED_IMPROVEMENT" || msg.toolOutput.outcome === "observed_improvement" ? (
                                  <Badge variant="lime" className="flex items-center gap-1 font-sans">
                                    <CheckCircle2 className="w-3 h-3" /> Verified
                                  </Badge>
                                ) : (
                                  <Badge variant="danger" className="flex items-center gap-1 font-sans">
                                    <AlertTriangle className="w-3 h-3" /> Blocked
                                  </Badge>
                                )}
                              </div>
                              {msg.toolOutput.percentSaved !== undefined && (
                                <div className="text-white/80 text-[11px]">
                                  Measured Saving:{" "}
                                  <strong className="text-[#cbff00] font-display tabular-nums">
                                    {msg.toolOutput.percentSaved}%
                                  </strong>{" "}
                                  (<span className="font-display tabular-nums">{Math.round(msg.toolOutput.bytesSaved / 1024)} KB</span>)
                                </div>
                              )}
                            </div>
                          )}

                          {/* 6. Release Shield Budget */}
                          {msg.toolOutput.exitCode !== undefined && (
                            <div className="p-3.5 rounded-xl bg-black/60 border border-white/12 text-xs font-sans space-y-1.5">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="text-white/70">Release Shield</span>
                                <Badge
                                  variant={msg.toolOutput.passed ? "lime" : "danger"}
                                  className="text-[9px] font-sans"
                                >
                                  {msg.toolOutput.passed ? "Passed (exit 0)" : "Blocked (exit 1)"}
                                </Badge>
                              </div>
                              <div className="text-white/80 text-[10px] font-display tabular-nums">
                                Transfer: {Math.round(msg.toolOutput.actualBytes / 1024)} KB /{" "}
                                {Math.round(msg.toolOutput.thresholdBytes / 1024)} KB Ceiling
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Interactive Action Links (Always rendered if present) */}
                      {msg.actionLinks && msg.actionLinks.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2.5 mt-2 border-t border-white/10">
                          {msg.actionLinks.map((link, idx) => (
                            <Link
                              key={idx}
                              href={link.href}
                              onClick={() => setIsOpen(false)}
                              className="inline-flex items-center gap-1.5 min-h-8 text-xs px-3.5 py-1.5 rounded-full bg-[#cbff00]/15 border border-[#cbff00]/40 text-[#cbff00] hover:bg-[#cbff00] hover:text-black transition-all font-medium"
                            >
                              <span>{link.label}</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Message Metadata Bar */}
                    <div className="flex items-center gap-2 mt-1.5 px-1">
                      <span className="text-[10px] font-sans font-medium text-white/40">
                        {msg.timestamp}
                      </span>
                      {msg.engine && (
                        <span className="text-[10px] font-sans font-medium text-white/60 bg-white/[0.05] border border-white/10 px-1.5 py-0.5 rounded">
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
                  <div className="p-3.5 rounded-2xl rounded-bl-sm bg-white/[0.06] border border-[#cbff00]/30 text-[#cbff00] text-xs font-sans space-y-2 max-w-[88%] backdrop-blur-xl shadow-xl">
                    <div className="flex items-center gap-2.5">
                      <Loader2 className="w-4 h-4 text-[#cbff00] animate-spin shrink-0" />
                      <span className="font-semibold text-white">CarbonTerra AI is thinking…</span>
                    </div>
                    {activeTool && (
                      <div className="text-xs text-white/70 bg-black/60 p-2.5 rounded-xl border border-white/10 flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5 text-[#cbff00] shrink-0" />
                        <span className="font-sans text-[#cbff00] break-words">{activeTool}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action Bar (if active chat) */}
            {messages.length > 0 && (
              <div role="group" aria-label="Suggested questions" className="px-4 py-2 border-t border-white/10 bg-black/40 overflow-x-auto flex gap-2 shrink-0 no-scrollbar">
                {quickPrompts.slice(0, 3).map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    disabled={loading}
                    onClick={() => handleSend(prompt)}
                    className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-white/70 hover:text-black hover:bg-[#cbff00] hover:border-[#cbff00] transition-all font-medium"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3.5 border-t border-white/10 bg-black/60 backdrop-blur-2xl shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2 min-w-0"
              >
                <label htmlFor="carbonerra-chat-message" className="sr-only">Message CarbonTerra AI</label>
                <input
                  ref={inputRef}
                  id="carbonerra-chat-message"
                  type="text"
                  value={input}
                  disabled={loading}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder='Ask anything: "audit stripe.com", "what if 50% image compression", "how to center a div"...'
                  className="flex-1 min-w-0 min-h-11 bg-white/[0.05] border border-white/15 rounded-2xl px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#cbff00] focus:ring-1 focus:ring-[#cbff00] transition-colors"
                />
                <Button
                  type="submit"
                  variant="lime"
                  size="sm"
                  disabled={loading || !input.trim()}
                  aria-label="Send message"
                  className="px-3.5 py-2.5 min-w-11 h-11 rounded-2xl shrink-0 bg-[#cbff00] hover:bg-[#b5e600] text-black font-semibold shadow-[0_0_20px_rgba(203,255,0,0.3)] transition-all disabled:opacity-30 disabled:shadow-none"
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
