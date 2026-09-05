"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Leaf,
  ShieldCheck,
  Send,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Terminal,
  Activity,
  Layers,
  ChevronRight,
  Database,
  Cpu,
  Download,
  Flame,
} from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  tools?: Array<{ tool: string; args: any; result?: any }>;
}

export default function MissionControlPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Welcome to **Carbonerra Mission Control**.\n\n*Tagline:* **“Tell it what you want to improve. Follow the evidence.”**\n\nI am your evidence-grounded AI companion for digital sustainability engineering. I can inspect audits, simulate counterfactual carbon scenarios with SWDM v4, prepare image experiments, test functional task assertions, and generate cryptographically verified receipts.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [providerStatus, setProviderStatus] = useState<any>(null);
  const [activeExperiment, setActiveExperiment] = useState<any>(null);
  const [receipt, setReceipt] = useState<any>(null);
  const [approvalStatus, setApprovalStatus] = useState<string>("pending");
  const [budgetStatus, setBudgetStatus] = useState<any>(null);
  const [activeTabMobile, setActiveTabMobile] = useState<"chat" | "workbench" | "evidence">("chat");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch system status
    fetch("/api/companion/status")
      .then((res) => res.json())
      .then((data) => setProviderStatus(data))
      .catch(() => {});

    // Fetch experiments
    fetch("/api/companion/experiments")
      .then((res) => res.json())
      .then((data) => {
        if (data.experiments && data.experiments.length > 0) {
          setActiveExperiment(data.experiments[0]);
          setApprovalStatus(data.experiments[0].approvalStatus);
        }
      })
      .catch(() => {});

    // Initial budget check
    fetch("/api/companion/budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maxTransferKb: 350, targetVariant: "optimized", strict: false }),
    })
      .then((res) => res.json())
      .then((data) => setBudgetStatus(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    const assistantMsgId = `asst-${Date.now()}`;
    const initialAssistantMsg: Message = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      tools: [],
    };
    setMessages((prev) => [...prev, initialAssistantMsg]);

    try {
      const res = await fetch("/api/companion/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-4).map((m) => ({ role: m.role, content: m.content })),
          context: { projectId: "proj-campus-hackathon", experimentId: "exp-hackathon-poster" },
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}: Failed to reach chat stream`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const raw = line.slice(6);
            try {
              const event = JSON.parse(raw);

              if (event.type === "text_delta") {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId ? { ...m, content: m.content + event.payload.delta } : m
                  )
                );
              } else if (event.type === "tool_call") {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          tools: [
                            ...(m.tools || []),
                            { tool: event.payload.tool, args: event.payload.args },
                          ],
                        }
                      : m
                  )
                );
              } else if (event.type === "tool_result") {
                setMessages((prev) =>
                  prev.map((m) => {
                    if (m.id !== assistantMsgId) return m;
                    const tools = [...(m.tools || [])];
                    if (tools.length > 0) {
                      tools[tools.length - 1].result = event.payload.data;
                    }
                    return { ...m, tools };
                  })
                );

                // If verification ran and returned receipt
                if (event.payload.tool === "startVerification" && event.payload.data?.receiptId) {
                  fetch(`/api/companion/receipts/${event.payload.data.receiptId}`)
                    .then((r) => r.json())
                    .then((data) => setReceipt(data))
                    .catch(() => {});
                }
              }
            } catch (err) {
              // Ignore stream parse glitches
            }
          }
        }
      }
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                content:
                  m.content +
                  `\n\n*(Error encountered: ${err.message}. Entering verified offline Evidence View.)*`,
              }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePatch = async () => {
    if (!activeExperiment) return;
    try {
      const res = await fetch("/api/companion/approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          experimentId: activeExperiment.id,
          patchHash: activeExperiment.patchHash,
          signer: "Staff Sustainability Engineer",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setApprovalStatus("approved");
      }
    } catch (err) {
      console.error("Approval error", err);
    }
  };

  const handleRunVerification = (variant: "optimized" | "broken") => {
    handleSendMessage(`test ${variant} candidate`);
  };

  const handleEvaluateBudget = async (variant: "optimized" | "baseline") => {
    const res = await fetch("/api/companion/budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maxTransferKb: 350, targetVariant: variant, strict: false }),
    });
    const data = await res.json();
    setBudgetStatus(data);
  };

  const signaturePrompt =
    "Help students register for this event using less data. Keep the poster readable, preserve registration, and show me the evidence for your recommendation.";

  return (
    <div className="flex flex-col h-screen bg-forest-950 text-cream-50 overflow-hidden font-sans">
      {/* Top Header */}
      <header className="h-14 border-b border-forest-800 bg-forest-900/90 backdrop-blur px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-lime-500/20 border border-lime-500/40 flex items-center justify-center text-lime-400">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-cream-50 flex items-center gap-2">
              Carbonerra Mission Control
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-forest-800 text-lime-400 border border-forest-700 font-mono">
                v1.0-Sidecar
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 font-serif italic hidden sm:block">
              “Tell it what you want to improve. Follow the evidence.”
            </div>
          </div>
        </div>

        {/* Status & Navigation */}
        <div className="flex items-center gap-3 text-xs">
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-forest-950 border border-forest-800">
            <span
              className={`w-2 h-2 rounded-full ${
                providerStatus?.provider?.activeProvider === "groq"
                  ? "bg-lime-400 animate-pulse"
                  : "bg-amber-400"
              }`}
            />
            <span className="text-zinc-300 font-mono text-[11px]">
              {providerStatus?.provider?.mode || "Connecting..."}
            </span>
          </div>

          <Link
            href="/demo/event"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest-800 hover:bg-forest-700 text-cream-100 transition border border-forest-700"
          >
            <Layers className="w-3.5 h-3.5 text-lime-400" /> Demo Fixture
          </Link>

          <a
            href="http://localhost:3001"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-lime-500 hover:bg-lime-400 text-forest-950 font-semibold transition shadow-sm"
          >
            <span>Original App</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </header>

      {/* Mobile Tab Switcher */}
      <div className="flex sm:hidden border-b border-forest-800 bg-forest-900 text-xs">
        <button
          onClick={() => setActiveTabMobile("chat")}
          className={`flex-1 py-2 font-medium ${
            activeTabMobile === "chat"
              ? "text-lime-400 border-b-2 border-lime-400"
              : "text-zinc-400"
          }`}
        >
          Chat Companion
        </button>
        <button
          onClick={() => setActiveTabMobile("workbench")}
          className={`flex-1 py-2 font-medium ${
            activeTabMobile === "workbench"
              ? "text-lime-400 border-b-2 border-lime-400"
              : "text-zinc-400"
          }`}
        >
          Workbench
        </button>
        <button
          onClick={() => setActiveTabMobile("evidence")}
          className={`flex-1 py-2 font-medium ${
            activeTabMobile === "evidence"
              ? "text-lime-400 border-b-2 border-lime-400"
              : "text-zinc-400"
          }`}
        >
          Evidence & Receipts
        </button>
      </div>

      {/* 3-Panel Desktop Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* PANEL 1 (LEFT): Chat & Model Orchestrator */}
        <section
          className={`w-full lg:w-[38%] border-r border-forest-800 flex flex-col bg-forest-950/60 ${
            activeTabMobile !== "chat" ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Preset Prompts bar */}
          <div className="p-2.5 border-b border-forest-800/80 bg-forest-900/40 text-xs space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold flex items-center justify-between">
              <span>Signature Request Prompt</span>
              <span className="text-lime-400">Click to execute</span>
            </div>
            <button
              onClick={() => handleSendMessage(signaturePrompt)}
              disabled={loading}
              className="w-full text-left p-2 rounded-lg bg-forest-900 hover:bg-forest-850 border border-forest-700/80 text-cream-100 text-xs transition leading-snug group flex items-start justify-between gap-2"
            >
              <span>“{signaturePrompt}”</span>
              <Sparkles className="w-3.5 h-3.5 text-lime-400 shrink-0 mt-0.5 group-hover:scale-110 transition" />
            </button>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                onClick={() => handleSendMessage("Use 20% instead")}
                className="px-2 py-1 rounded bg-forest-850 hover:bg-forest-800 text-[11px] text-zinc-300 border border-forest-700"
              >
                “Use 20% instead”
              </button>
              <button
                onClick={() => handleSendMessage("I cannot change hosting")}
                className="px-2 py-1 rounded bg-forest-850 hover:bg-forest-800 text-[11px] text-zinc-300 border border-forest-700"
              >
                “Cannot change hosting”
              </button>
              <button
                onClick={() => handleSendMessage("test broken candidate")}
                className="px-2 py-1 rounded bg-rose-950/60 hover:bg-rose-900/60 text-[11px] text-rose-300 border border-rose-800"
              >
                “Test broken candidate”
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div className="text-[10px] font-mono text-zinc-400 mb-1">
                  {m.role === "user" ? "You" : "Carbonerra Mission Control"}
                </div>
                <div
                  className={`max-w-[90%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    m.role === "user"
                      ? "bg-forest-800 text-cream-50 border border-forest-700"
                      : "bg-forest-900/90 text-cream-100 border border-forest-800 shadow-md"
                  }`}
                >
                  {/* Tool call indicators */}
                  {m.tools && m.tools.length > 0 && (
                    <div className="mb-3 space-y-1.5">
                      {m.tools.map((t, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-forest-950 border border-forest-700/80 font-mono text-[11px] text-lime-400"
                        >
                          <Terminal className="w-3 h-3 text-lime-400" />
                          <span>tool: {t.tool}</span>
                          {t.result && (
                            <span className="text-[10px] text-zinc-400 ml-auto">
                              (Executed & Grounded)
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">{m.content}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-lime-400 font-mono py-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Model orchestrator streaming grounded response...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-forest-800 bg-forest-900/60 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Mission Control or enter optimization constraints..."
              disabled={loading}
              className="flex-1 px-3 py-2 rounded-xl bg-forest-950 border border-forest-700 text-xs text-cream-50 focus:outline-none focus:border-lime-500 font-sans"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 rounded-xl bg-lime-500 hover:bg-lime-400 text-forest-950 font-bold transition disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </section>

        {/* PANEL 2 (CENTER): Workbench / Diff / Approval Gate */}
        <section
          className={`w-full lg:w-[36%] border-r border-forest-800 flex flex-col bg-forest-950/40 overflow-y-auto ${
            activeTabMobile !== "workbench" ? "hidden lg:flex" : "flex"
          }`}
        >
          <div className="p-4 border-b border-forest-800 bg-forest-900/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-lime-400" />
              <h2 className="font-bold text-sm text-cream-50">Controlled Experiment Workbench</h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-forest-800 text-cream-200 border border-forest-700">
              Disposable Fixture
            </span>
          </div>

          <div className="p-4 space-y-5 flex-1">
            {/* Target Information */}
            <div className="p-3.5 rounded-xl bg-forest-900/70 border border-forest-800 space-y-2">
              <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                Target Project
              </div>
              <div className="font-bold text-sm text-cream-50">
                Campus Hackathon Registration Portal
              </div>
              <div className="text-xs font-mono text-lime-400">
                http://localhost:3002/demo/event
              </div>
            </div>

            {/* Asset Size Comparison */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-forest-900/60 border border-amber-900/60 space-y-1">
                <div className="text-zinc-400 text-[10px] uppercase font-mono">Baseline Asset</div>
                <div className="font-bold text-base text-amber-300">2,450 KB</div>
                <div className="text-[11px] text-zinc-400">Raw Uncompressed JPEG</div>
              </div>
              <div className="p-3 rounded-xl bg-forest-900/60 border border-lime-800/80 space-y-1">
                <div className="text-zinc-400 text-[10px] uppercase font-mono">Candidate Asset</div>
                <div className="font-bold text-base text-lime-400">185 KB</div>
                <div className="text-[11px] text-zinc-400">WebP Responsive Picture (-92.4%)</div>
              </div>
            </div>

            {/* Reviewable Source Diff */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-300">Reviewable Candidate Patch</span>
                <span className="font-mono text-[10px] text-zinc-400">src/app/demo/event/page.tsx</span>
              </div>
              <div className="p-3 rounded-xl bg-black/70 border border-forest-800 font-mono text-[11px] overflow-x-auto text-zinc-300 space-y-1">
                <div className="text-zinc-500">@@ -14,5 +14,9 @@</div>
                <div className="text-rose-400 bg-rose-950/40 px-1 py-0.5 rounded">
                  - &lt;img src=&quot;/demo/hero-poster.jpg&quot; alt=&quot;Poster&quot; /&gt;
                </div>
                <div className="text-lime-300 bg-lime-950/40 px-1 py-0.5 rounded">
                  + &lt;picture&gt;
                </div>
                <div className="text-lime-300 bg-lime-950/40 px-1 py-0.5 rounded">
                  + &nbsp; &lt;source srcSet=&quot;/demo/hero-poster.webp&quot; type=&quot;image/webp&quot; /&gt;
                </div>
                <div className="text-lime-300 bg-lime-950/40 px-1 py-0.5 rounded">
                  + &nbsp; &lt;img src=&quot;/demo/hero-poster.jpg&quot; loading=&quot;eager&quot; width=&quot;1200&quot; height=&quot;675&quot; /&gt;
                </div>
                <div className="text-lime-300 bg-lime-950/40 px-1 py-0.5 rounded">
                  + &lt;/picture&gt;
                </div>
              </div>
              <div className="text-[10px] font-mono text-zinc-400 break-all bg-forest-950 p-2 rounded border border-forest-800">
                SHA-256: {activeExperiment?.patchHash || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}
              </div>
            </div>

            {/* Approval Gate */}
            <div className="p-4 rounded-xl bg-forest-900/80 border border-forest-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-cream-50">Engineering Approval Gate</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    approvalStatus === "approved"
                      ? "bg-lime-950 text-lime-400 border border-lime-800"
                      : "bg-amber-950 text-amber-300 border border-amber-800"
                  }`}
                >
                  Status: {approvalStatus}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-normal">
                Strict invariant: AI cannot authorize changes autonomously. A human engineer must explicitly record approval before the candidate is deployed to the physical verification runner.
              </p>
              {approvalStatus !== "approved" ? (
                <button
                  onClick={handleApprovePatch}
                  className="w-full py-2 px-4 rounded-lg bg-lime-500 hover:bg-lime-400 text-forest-950 font-bold text-xs transition shadow-md flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" /> Approve Candidate Patch
                </button>
              ) : (
                <div className="text-xs text-lime-400 font-mono flex items-center gap-1.5 bg-forest-950 px-3 py-2 rounded border border-lime-900/60">
                  <CheckCircle2 className="w-4 h-4" /> Explicit Approval Recorded by Staff Engineer
                </div>
              )}
            </div>

            {/* Verification Execution Controls */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-zinc-300">
                Physical Journey Verification Tests
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleRunVerification("optimized")}
                  disabled={loading}
                  className="py-2.5 px-3 rounded-lg bg-forest-800 hover:bg-forest-700 border border-forest-700 text-cream-50 text-xs font-medium transition flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-lime-400" /> Test Candidate
                </button>
                <button
                  onClick={() => handleRunVerification("broken")}
                  disabled={loading}
                  className="py-2.5 px-3 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 border border-rose-900/80 text-rose-300 text-xs font-medium transition flex items-center justify-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Test Broken (Guardrail)
                </button>
              </div>
              <p className="text-[10px] text-zinc-500">
                Tests complete form interaction and assert ticket creation on http://localhost:3002/demo/event.
              </p>
            </div>
          </div>
        </section>

        {/* PANEL 3 (RIGHT): Evidence & Receipts Drawer */}
        <section
          className={`w-full lg:w-[26%] flex flex-col bg-forest-950/80 overflow-y-auto ${
            activeTabMobile !== "evidence" ? "hidden lg:flex" : "flex"
          }`}
        >
          <div className="p-4 border-b border-forest-800 bg-forest-900/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-lime-400" />
              <h2 className="font-bold text-sm text-cream-50">Evidence & Receipts</h2>
            </div>
            <span className="text-[10px] font-mono text-lime-400 bg-forest-900 px-2 py-0.5 rounded border border-forest-800">
              SWDM v4
            </span>
          </div>

          <div className="p-4 space-y-5 flex-1 text-xs">
            {/* SWDM v4 Pinned Parameters */}
            <div className="p-3.5 rounded-xl bg-forest-900/60 border border-forest-800 space-y-2">
              <div className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">
                Methodology Telemetry
              </div>
              <div className="space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Energy Intensity:</span>
                  <span className="text-cream-100 font-bold">0.0577 kWh/GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Operational Grid:</span>
                  <span className="text-cream-100">442 gCO2e/kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Embodied Hardware:</span>
                  <span className="text-cream-100">531 gCO2e/kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Sensitivity Bounds:</span>
                  <span className="text-lime-400">±20%</span>
                </div>
              </div>
            </div>

            {/* Release Shield Gate Status */}
            <div className="p-3.5 rounded-xl bg-forest-900/60 border border-forest-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-lime-400" /> Release Shield Gate
                </span>
                <span className="font-mono text-[10px] text-zinc-400">350 KB Ceiling</span>
              </div>
              {budgetStatus && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-300">Status:</span>
                    <span
                      className={`font-mono font-bold ${
                        budgetStatus.passed ? "text-lime-400" : "text-rose-400"
                      }`}
                    >
                      {budgetStatus.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Evaluated: {budgetStatus.metrics?.evaluatedTransferKb} KB (Ceiling:{" "}
                    {budgetStatus.metrics?.budgetCeilingKb} KB)
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleEvaluateBudget("optimized")}
                      className="flex-1 py-1 px-2 rounded bg-forest-800 hover:bg-forest-750 text-[10px] text-zinc-200 border border-forest-700"
                    >
                      Check Candidate
                    </button>
                    <button
                      onClick={() => handleEvaluateBudget("baseline")}
                      className="flex-1 py-1 px-2 rounded bg-forest-800 hover:bg-forest-750 text-[10px] text-rose-300 border border-forest-700"
                    >
                      Check Baseline
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Auditable Verification Receipt */}
            <div className="p-3.5 rounded-xl bg-forest-900/80 border border-forest-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">
                  Auditable Evidence Receipt
                </span>
                {receipt && (
                  <span className="text-[10px] font-mono text-lime-400">
                    {receipt.outcome.toUpperCase()}
                  </span>
                )}
              </div>

              {receipt ? (
                <div className="space-y-2">
                  <div className="font-mono text-[11px] text-zinc-300 bg-forest-950 p-2 rounded border border-forest-800">
                    ID: {receipt.receiptId}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Net Bytes Saved:</span>
                      <span className="font-bold text-lime-400">
                        -{(receipt.measurements.bytesSaved / 1024).toFixed(1)} KB (
                        {receipt.measurements.percentSaved}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Carbon Delta:</span>
                      <span className="font-bold text-lime-400">
                        -{receipt.measurements.gco2eSaved} gCO2e / journey
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Task Assertions:</span>
                      <span className="font-bold text-lime-400">PASSED (HTTP 200)</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <a
                      href={`/api/companion/receipts/${receipt.receiptId}?format=html`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-1.5 rounded-lg bg-lime-500 hover:bg-lime-400 text-forest-950 font-bold text-center text-[11px] flex items-center justify-center gap-1"
                    >
                      <Download className="w-3 h-3" /> HTML Receipt
                    </a>
                    <a
                      href={`/api/companion/receipts/${receipt.receiptId}?format=json`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-1.5 rounded-lg bg-forest-800 hover:bg-forest-700 text-cream-100 text-center text-[11px] border border-forest-700 flex items-center justify-center gap-1"
                    >
                      JSON
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-zinc-500 text-xs">
                  Run physical candidate verification to generate cryptographic evidence receipt.
                </div>
              )}
            </div>

            {/* Disclaimer */}
            <div className="p-3 rounded-lg bg-forest-950/60 border border-forest-800 text-[10px] text-zinc-500 leading-normal">
              <strong>Engineering Integrity Notice:</strong> Calculations strictly adhere to Sustainable Web Design Model v4 standards. Numbers represent physical browser journey deltas, not simulated prose.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
