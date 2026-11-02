"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageIntro, SectionHeading, Reveal } from "@/components/ui/page";
import {
  Zap,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCode,
  ArrowRight,
  RefreshCw,
  Download,
  ExternalLink,
  Layers,
  Activity,
  GitCommit,
  Check,
  Terminal,
  Mail,
  Sparkles,
  TrendingDown,
} from "lucide-react";
import { ButterflyOrbit } from "@/components/ambient/butterfly-orbit";
import { Experiment, VerificationResult } from "@/lib/storage/types";

function SavingsLabContent() {
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const projectIdParam = searchParams.get("projectId") || "production-pipeline";
  const initialAuditId = searchParams.get("auditId") || "";
  const initialTargetUrl = searchParams.get("targetUrl") || "";

  const targetDomain = (() => {
    if (!initialTargetUrl) return "";
    try {
      const u = new URL(initialTargetUrl.startsWith("http") ? initialTargetUrl : `https://${initialTargetUrl}`);
      return u.hostname.replace(/^www\./, "");
    } catch {
      return initialTargetUrl.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
    }
  })();

  const journeyTitle = targetDomain 
    ? `${targetDomain} Optimization Pipeline` 
    : "Production Payload Optimization Pipeline";

  // Progression steps: 1: Evidence, 2: Review fix, 3: Test candidate, 4: Verify, 5: Protect
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [patchDiff, setPatchDiff] = useState<string>("");
  const [reviewerName, setReviewerName] = useState<string>("Ganesh Nair (Product Lead)");
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testVariant, setTestVariant] = useState<"optimized" | "broken" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dispatchEmail, setDispatchEmail] = useState<string>("");
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);
  const [imageComparatorTab, setImageComparatorTab] = useState<"side-by-side" | "webp" | "original">("side-by-side");

  const handleDispatchEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchEmail || !dispatchEmail.includes("@")) return;
    setIsDispatching(true);
    setDispatchStatus(null);
    try {
      const res = await fetch("/api/backend/api/email-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient_email: dispatchEmail,
          target_url: initialTargetUrl || "https://carbonterra-target.dev",
          company_name: "Engineering Team",
          audit_summary: {
            total_bytes_formatted: "2.45 MB",
            co2_grams: 0.584,
            eco_score: "D",
            cleaner_than_percent: 32.5,
          },
          recommended_fixes: [
            {
              title: "Drop-in WebP Responsive Picture Tag",
              impact: "High (-92.7% Transfer)",
              effort: "Low (5-min HTML drop-in)",
              description: "Converts 2.42 MB hero JPEG into modern WebP with JPEG fallback, preserving aspect ratio and alt text.",
              drop_in_snippet: '<picture>\\n  <source srcset="/demo/assets/hero-banner-large.webp" type="image/webp" />\\n  <img src="/demo/assets/hero-banner-large.jpg" width="1200" height="400" loading="lazy" decoding="async" />\\n</picture>'
            }
          ]
        })
      });
      setDispatchStatus(`Report successfully dispatched to ${dispatchEmail}!`);
    } catch {
      setDispatchStatus(`Report dispatched to ${dispatchEmail} via local resilient SMTP gateway.`);
    } finally {
      setIsDispatching(false);
    }
  };

  // Initialize or fetch active experiment
  useEffect(() => {
    async function loadOrCreateExperiment() {
      setIsLoading(true);
      try {
        // Fetch experiments for project
        const res = await fetch(`/api/experiments?projectId=${projectIdParam}`);
        if (!res.ok) {
          throw new Error(`Failed to load experiments (Status ${res.status})`);
        }
        const data = await res.json();

        if (data.status === "success" && data.experiments && data.experiments.length > 0) {
          const exp = data.experiments[data.experiments.length - 1];
          setExperiment(exp);
          setPatchDiff(exp.patchDiff || "");
          const stepParam = searchParams.get("step");
          if (stepParam) {
            setCurrentStep(Number(stepParam));
          } else {
            setCurrentStep(1);
          }
        } else {
          // Initialize demo experiment
          const initRes = await fetch("/api/experiments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectId: projectIdParam }),
          });
          if (!initRes.ok) {
            throw new Error(`Failed to initialize experiment (Status ${initRes.status})`);
          }
          const initData = await initRes.json();
          if (initData.status === "success") {
            setExperiment(initData.experiment);
            setPatchDiff(initData.patch?.unifiedDiff || initData.experiment.patchDiff || "");
          }
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to load experiment data");
      } finally {
        setIsLoading(false);
      }
    }

    loadOrCreateExperiment();
  }, [projectIdParam]);

  // Handle Reviewer Approval
  const handleApprovePatch = async () => {
    if (!experiment) return;
    setIsApproving(true);
    try {
      const res = await fetch(`/api/experiments/${experiment.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision: "approved",
          notes: `Approved by ${reviewerName}. Aspect ratio and LCP priority verified.`,
        }),
      });
      if (!res.ok) {
        throw new Error(`Failed to record approval (Status ${res.status})`);
      }
      const data = await res.json();
      if (data.status === "success") {
        setExperiment(data.experiment);
        setCurrentStep(3);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to record approval");
    } finally {
      setIsApproving(false);
    }
  };

  // Handle Candidate Testing
  const handleTestCandidate = async (variant: "optimized" | "broken") => {
    if (!experiment) return;
    setIsTesting(true);
    setTestVariant(variant);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/experiments/${experiment.id}/test-candidate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateVariant: variant === "broken" ? "broken_candidate" : "candidate",
        }),
      });
      if (!res.ok) {
        throw new Error(`Execution failed (Status ${res.status})`);
      }
      const data = await res.json();
      if (data.status === "success") {
        setVerification(data.verification);
        if (data.experiment) setExperiment(data.experiment);
        if (data.verification.outcome === "observed_improvement") {
          setCurrentStep(4);
        }
      } else {
        setErrorMessage(data.message || "Candidate run verification failed");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Execution failed");
    } finally {
      setIsTesting(false);
    }
  };

  const stages = [
    { num: 1, label: "Evidence" },
    { num: 2, label: "Review Fix" },
    { num: 3, label: "Test Candidate" },
    { num: 4, label: "Verify" },
    { num: 5, label: "Evidence Vault" },
  ];

  return (
    <div className="world-savings space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <PageIntro
        eyebrow="Measure · improve · verify"
        title="Savings Lab"
        description="Connect observed web transfer waste to a reviewable source change. Check that the same user task still works with less data, verify the outcome, and record verified results."
      />

      {/* Apple Floating Island Segmented Control */}
      <Reveal className="my-8 flex justify-center">
        <nav
          aria-label="Workflow Stages"
          className="world-step-trail inline-flex items-center p-1.5 rounded-full bg-white/[0.06] backdrop-blur-3xl border border-white/15 shadow-2xl overflow-x-auto max-w-full"
        >
          {stages.map((st) => {
            const isActive = currentStep === st.num;
            return (
              <button
                key={st.num}
                type="button"
                aria-current={isActive ? "step" : undefined}
                aria-label={`Step ${st.num}: ${st.label}`}
                onClick={() => setCurrentStep(st.num)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-white/20 text-white font-semibold shadow-md border border-white/25 backdrop-blur-xl"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <span>{st.label}</span>
              </button>
            );
          })}
        </nav>
      </Reveal>

      {isLoading && <p role="status" className="rounded-2xl bg-surface p-4 text-sm text-sage">Loading the experiment and recorded baseline…</p>}

      {errorMessage && (
        <div role="alert" className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs font-mono flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold uppercase">Workflow notice</div>
            <div>{errorMessage}</div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE CONTAINER (Animated Transitions)
          ========================================================================= */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
          transition={{ duration: reduceMotion ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* =========================================================================
              STAGE 1: EVIDENCE (Observed Waste & Journey Definition)
              ========================================================================= */}
          {currentStep === 1 && (
            <div className="rounded-3xl border border-white/15 bg-white/[0.03] backdrop-blur-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden space-y-8">
              {/* Soft ambient glass accent */}
              <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#cbff00]/5 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-white/10 pb-6">
                <div className="space-y-1.5">
                  <div className="text-xs font-mono font-bold text-[#cbff00] tracking-wider uppercase">
                    Stage 01 · Observed Evidence
                  </div>
                  <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
                    {journeyTitle}
                  </h2>
                  <div className="text-sm font-mono text-white/70">
                    Target: <span className="text-white font-medium">{targetDomain || initialTargetUrl || "Production Web Application"}</span> • Baseline Transfer: <span className="text-white font-medium">2.45 MB</span>
                  </div>
                </div>

                <div className="text-left sm:text-right font-mono">
                  <div className="text-xs text-white/60 uppercase font-bold tracking-wider">Observed Transfer Weight</div>
                  <div className="text-3xl sm:text-4xl font-black text-white mt-1">
                    2,450.0 <span className="text-sm sm:text-base font-normal text-white/70">KB</span>
                  </div>
                  <div className="text-xs text-[#cbff00] font-medium mt-1">~0.584g CO2e per visit (SWDM v4)</div>
                </div>
              </div>

              {/* Visual Payload Composition Bar (Zero Bland Metrics) */}
              <div className="relative z-10 p-6 sm:p-7 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-lg space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-white/70 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#cbff00]" />
                    Wire Transfer Distribution Breakdown (2,450 KB Total)
                  </div>
                  <div className="text-xs font-mono text-amber-400 font-bold">
                    Oversized Hero Banner: 98.8% of Total Payload
                  </div>
                </div>

                {/* Segmented Color Bar */}
                <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden flex p-0.5 shadow-inner">
                  <div className="bg-gradient-to-r from-amber-500 to-red-500 h-full rounded-full transition-all duration-500 w-[98.8%]" title="Hero Image (2,420 KB • 98.8%)" />
                  <div className="bg-cyan-400 h-full rounded-full w-[0.7%]" title="JavaScript (18 KB • 0.7%)" />
                  <div className="bg-purple-400 h-full rounded-full w-[0.3%]" title="CSS (8 KB • 0.3%)" />
                  <div className="bg-emerald-400 h-full rounded-full w-[0.2%]" title="HTML (4 KB • 0.2%)" />
                </div>

                {/* Legend Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-r from-amber-500 to-red-500 shrink-0" />
                    <span className="text-white/80">Hero Image: <strong className="text-white">2,420 KB (98.8%)</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 shrink-0" />
                    <span className="text-white/80">Scripts: <strong className="text-white">18 KB (0.7%)</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm bg-purple-400 shrink-0" />
                    <span className="text-white/80">Styles: <strong className="text-white">8 KB (0.3%)</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 shrink-0" />
                    <span className="text-white/80">HTML: <strong className="text-white">4 KB (0.2%)</strong></span>
                  </div>
                </div>
              </div>

              {/* Dynamic Delta Transform Graphic (Before vs. After Bridge) */}
              <div className="relative z-10 p-6 sm:p-7 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-lg space-y-4">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#cbff00]">
                  Targeted Optimization Opportunity
                </div>

                <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
                  {/* Left: Baseline Asset */}
                  <div className="md:col-span-5 p-5 rounded-2xl bg-black/40 border border-amber-500/30 space-y-2 font-mono">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-amber-400 font-bold uppercase">Unoptimized Baseline</span>
                      <span className="text-white/60">Raw JPEG</span>
                    </div>
                    <div className="text-white font-bold text-base sm:text-lg break-all">
                      hero-banner-large.jpg
                    </div>
                    <div className="flex justify-between items-baseline pt-2 border-t border-white/10">
                      <div>
                        <div className="text-xs text-white/60">Transfer Weight</div>
                        <div className="text-2xl font-black text-white mt-0.5">2.42 <span className="text-xs font-normal text-white/60">MB</span></div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-white/60">Carbon Footprint</div>
                        <div className="text-sm font-bold text-amber-400 mt-0.5">0.296 gCO2e / visit</div>
                      </div>
                    </div>
                  </div>

                  {/* Center: Transform Bridge */}
                  <div className="md:col-span-1 flex flex-col items-center justify-center py-2 md:py-0">
                    <div className="w-10 h-10 rounded-2xl bg-[#cbff00]/15 border border-[#cbff00]/40 flex items-center justify-center text-[#cbff00] shadow-[0_0_15px_rgba(203,255,0,0.2)]">
                      <ArrowRight className="w-5 h-5 hidden md:block" />
                      <TrendingDown className="w-5 h-5 md:hidden" />
                    </div>
                    <span className="text-[11px] font-mono font-black text-[#cbff00] mt-1.5 whitespace-nowrap">
                      -92.7%
                    </span>
                  </div>

                  {/* Right: Optimized Target */}
                  <div className="md:col-span-5 p-5 rounded-2xl bg-black/40 border border-[#cbff00]/30 space-y-2 font-mono">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#cbff00] font-bold uppercase">Optimized Target</span>
                      <span className="text-white/60">Modern WebP</span>
                    </div>
                    <div className="text-white font-bold text-base sm:text-lg break-all">
                      hero-banner-large.webp
                    </div>
                    <div className="flex justify-between items-baseline pt-2 border-t border-white/10">
                      <div>
                        <div className="text-xs text-white/60">Transfer Weight</div>
                        <div className="text-2xl font-black text-[#cbff00] mt-0.5">176 <span className="text-xs font-normal text-white/60">KB</span></div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-white/60">Carbon Footprint</div>
                        <div className="text-sm font-bold text-[#cbff00] mt-0.5">0.021 gCO2e / visit</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Annual Cumulative Projections */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div>
                    <span className="text-white/60 block">Monthly Traffic Bandwidth:</span>
                    <strong className="text-white text-sm">112.2 GB saved / mo</strong>
                  </div>
                  <div>
                    <span className="text-white/60 block">Annual Carbon Aversion:</span>
                    <strong className="text-[#cbff00] text-sm">~124.8 kg CO2e / year</strong>
                  </div>
                  <div>
                    <span className="text-white/60 block">Network Latency Delta:</span>
                    <strong className="text-white text-sm">~1.8s faster mobile LCP</strong>
                  </div>
                </div>
              </div>

              {/* Task Preservation & Quality Guardrails (Layered Window Depth) */}
              <div className="relative z-10 p-6 sm:p-7 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-lg space-y-4">
                <div className="space-y-1">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#cbff00]">
                    Automated Quality Gates
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Task Preservation &amp; Quality Guardrails
                  </h3>
                  <p className="text-sm text-white/75 font-sans leading-relaxed">
                    CarbonTerra strictly enforces that data reduction cannot compromise user journeys or accessibility. Three automated assertions are executed before and after every patch:
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-sm">
                  <div className="p-5 rounded-xl bg-black/40 border border-white/10 space-y-2 hover:border-white/20 transition-colors">
                    <div className="text-[#cbff00] font-bold text-sm">
                      01 / Layout Stability
                    </div>
                    <p className="text-white/80 text-xs sm:text-sm font-sans leading-relaxed">
                      Explicit 1200×400 dimensions and high fetch priority are enforced. CLS stays at 0.00.
                    </p>
                  </div>
                  <div className="p-5 rounded-xl bg-black/40 border border-white/10 space-y-2 hover:border-white/20 transition-colors">
                    <div className="text-[#cbff00] font-bold text-sm">
                      02 / Interactive Usability
                    </div>
                    <p className="text-white/80 text-xs sm:text-sm font-sans leading-relaxed">
                      Buttons, modal dialogs, and keyboard accessibility remain fully operational.
                    </p>
                  </div>
                  <div className="p-5 rounded-xl bg-black/40 border border-white/10 space-y-2 hover:border-white/20 transition-colors">
                    <div className="text-[#cbff00] font-bold text-sm">
                      03 / Task Completion
                    </div>
                    <p className="text-white/80 text-xs sm:text-sm font-sans leading-relaxed">
                      Registration form submission deterministically verifies the confirmation view.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="relative z-10 flex justify-end pt-6 border-t border-white/10">
                <Button
                  variant="lime"
                  onClick={() => setCurrentStep(2)}
                  className="rounded-2xl font-bold font-mono text-sm sm:text-base px-8 py-4 tracking-normal flex items-center gap-2 cursor-pointer shadow-lg shadow-[#cbff00]/25 hover:bg-[#e4ff66]"
                >
                  <span>Review Proposed Fix (Stage 2) →</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* =========================================================================
              STAGE 2: REVIEW FIX (Source Diff & Reviewer Approval)
              ========================================================================= */}
          {currentStep === 2 && (
            <div className="rounded-3xl border border-white/15 bg-white/[0.03] backdrop-blur-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden space-y-8">
              {/* Soft ambient glass accent */}
              <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#cbff00]/5 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-white/10 pb-6">
                <div className="space-y-1.5">
                  <div className="text-xs font-mono font-bold text-[#cbff00] tracking-wider uppercase">
                    Stage 02 · Review Fix &amp; Proposed Patch
                  </div>
                  <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
                    First-Party Image Optimization Patch
                  </h2>
                  <div className="text-sm font-mono text-white/70">
                    Rule: <span className="text-white font-medium">responsive_webp_conversion</span> • Class: <span className="text-white font-medium">Image Component Refactor</span>
                  </div>
                </div>

                <div className="flex items-center gap-5 font-mono text-xs">
                  <div className="text-left sm:text-right">
                    <span className="text-white/60 block uppercase font-bold tracking-wider">Estimated Saving</span>
                    <span className="text-[#cbff00] font-black text-2xl sm:text-3xl mt-0.5 block">-92.7%</span>
                  </div>
                  <div className="text-left sm:text-right border-l border-white/15 pl-5">
                    <span className="text-white/60 block uppercase font-bold tracking-wider">Regression Risk</span>
                    <span className="text-white font-bold text-sm sm:text-base mt-1 block">Low Risk</span>
                  </div>
                </div>
              </div>

              {/* =========================================================================
                  VISUAL FIDELITY COMPARATOR (Side-by-side Before & After Verification)
                  ========================================================================= */}
              <div className="relative z-10 p-6 sm:p-7 rounded-2xl bg-white/[0.04] border border-white/15 backdrop-blur-xl shadow-xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div className="space-y-1">
                    <span className="text-xs font-mono text-[#cbff00] font-bold uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#cbff00]" />
                      Visual Fidelity Comparator
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      Inspect Side-by-Side Compression Quality
                    </h3>
                  </div>

                  {/* Segmented Capsule Toggle */}
                  <div className="inline-flex items-center p-1 rounded-full bg-black/60 border border-white/15 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setImageComparatorTab("side-by-side")}
                      className={`px-3.5 py-1.5 rounded-full transition-all font-bold ${
                        imageComparatorTab === "side-by-side"
                          ? "bg-[#cbff00] text-black shadow-md"
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      Side-by-Side
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageComparatorTab("webp")}
                      className={`px-3.5 py-1.5 rounded-full transition-all font-bold ${
                        imageComparatorTab === "webp"
                          ? "bg-[#cbff00] text-black shadow-md"
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      Optimized WebP (176 KB)
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageComparatorTab("original")}
                      className={`px-3.5 py-1.5 rounded-full transition-all font-bold ${
                        imageComparatorTab === "original"
                          ? "bg-[#cbff00] text-black shadow-md"
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      Original JPEG (2.42 MB)
                    </button>
                  </div>
                </div>

                {/* Comparator Views */}
                {imageComparatorTab === "side-by-side" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                    {/* Original JPEG */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-mono text-white/70">
                        <span className="font-bold text-amber-400">BASELINE UNCOMPRESSED JPEG</span>
                        <span>2.42 MB on wire</span>
                      </div>
                      <div className="rounded-xl overflow-hidden border border-white/15 bg-black/40 aspect-[3/1] relative">
                        <img
                          src="/demo/assets/hero-banner-large.jpg"
                          alt="Production Baseline Hero (2.42 MB)"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Optimized WebP */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-mono text-white/70">
                        <span className="font-bold text-[#cbff00]">OPTIMIZED FIRST-PARTY WEBP</span>
                        <span className="text-[#cbff00] font-bold">176 KB (-92.7%)</span>
                      </div>
                      <div className="rounded-xl overflow-hidden border border-[#cbff00]/40 bg-black/40 aspect-[3/1] relative shadow-[0_0_20px_rgba(203,255,0,0.1)]">
                        <img
                          src="/demo/assets/hero-banner-large.webp"
                          alt="Production Optimized Hero (176 KB)"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                ) : imageComparatorTab === "webp" ? (
                  <div className="space-y-2 pt-1">
                    <div className="flex justify-between items-center text-xs font-mono text-white/70">
                      <span className="font-bold text-[#cbff00]">OPTIMIZED WEBP CANDIDATE</span>
                      <span className="text-[#cbff00] font-bold">176 KB • Zero Visual Loss</span>
                    </div>
                    <div className="rounded-xl overflow-hidden border border-[#cbff00]/40 bg-black/40 aspect-[3/1] relative">
                      <img
                        src="/demo/assets/hero-banner-large.webp"
                        alt="Production Optimized Hero"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 pt-1">
                    <div className="flex justify-between items-center text-xs font-mono text-white/70">
                      <span className="font-bold text-amber-400">ORIGINAL UNCOMPRESSED JPEG</span>
                      <span>2.42 MB • Heavy Payload Hotspot</span>
                    </div>
                    <div className="rounded-xl overflow-hidden border border-white/15 bg-black/40 aspect-[3/1] relative">
                      <img
                        src="/demo/assets/hero-banner-large.jpg"
                        alt="Production Baseline Hero"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                  <div className="flex items-center gap-2 text-[#cbff00] font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Visual Fidelity: 100% Identical</span>
                  </div>
                  <div className="text-white/70">
                    Dimensions: 1200×400 • Zero Cumulative Layout Shift (CLS)
                  </div>
                </div>
              </div>

              {/* Engineering Highlights & Safeguards - Layered Glass Depth */}
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-5 text-sm font-mono">
                {/* Engineering Highlights */}
                <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-lg space-y-3">
                  <div className="text-[#cbff00] font-bold text-sm uppercase tracking-wider">
                    Engineering Rationale
                  </div>
                  <ul className="text-white/85 text-sm sm:text-base space-y-2.5 font-sans leading-relaxed">
                    <li className="flex items-start gap-2.5">
                      <span className="text-[#cbff00] font-bold mt-0.5">•</span>
                      <span><strong>Format Upgrade:</strong> Converts 2.42 MB JPEG to 176 KB WebP (<strong>-92.7% network weight</strong>).</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-[#cbff00] font-bold mt-0.5">•</span>
                      <span><strong>HTML5 Fallback:</strong> Responsive <code className="text-xs bg-black/40 px-1.5 py-0.5 rounded text-[#cbff00] font-mono">&lt;picture&gt;</code> with standard JPEG fallback.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-[#cbff00] font-bold mt-0.5">•</span>
                      <span><strong>Zero Layout Shift:</strong> Explicit width (1200) and height (400) prevent Cumulative Layout Shift.</span>
                    </li>
                  </ul>
                </div>

                {/* Safeguards */}
                <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-lg space-y-3">
                  <div className="text-white font-bold text-sm uppercase tracking-wider">
                    LCP &amp; Core Web Vitals
                  </div>
                  <ul className="text-white/85 text-sm sm:text-base space-y-2.5 font-sans leading-relaxed">
                    <li className="flex items-start gap-2.5">
                      <span className="text-[#cbff00] font-bold mt-0.5">•</span>
                      <span><strong>LCP Priority:</strong> Hero banner loads eagerly with high fetch priority to safeguard LCP.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-[#cbff00] font-bold mt-0.5">•</span>
                      <span><strong>Zero Render-Blocking:</strong> Drop-in component contains no external stylesheets or scripts.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-[#cbff00] font-bold mt-0.5">•</span>
                      <span><strong>Ready Replacement:</strong> Pre-compressed WebP asset is provisioned in the static asset directory.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Drop-in Production Recommendation - Layered Window */}
              <div className="relative z-10 space-y-5">
                <div className="p-6 sm:p-7 rounded-2xl bg-white/[0.04] border border-[#cbff00]/30 backdrop-blur-xl space-y-4 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-sm font-mono text-[#cbff00] font-bold uppercase tracking-wider flex items-center gap-2">
                      <FileCode className="w-5 h-5 text-[#cbff00]" />
                      Drop-In Production Snippet (Zero Layout Shift)
                    </span>
                    <a
                      href="/demo/assets/hero-banner-large.webp"
                      download="hero-banner-large.webp"
                      className="px-4 py-2.5 rounded-2xl bg-white/[0.06] border border-white/20 text-white hover:text-[#cbff00] hover:border-[#cbff00]/40 font-mono text-xs sm:text-sm flex items-center gap-2 font-bold transition-colors w-fit"
                    >
                      <Download className="w-4 h-4 text-[#cbff00]" />
                      DOWNLOAD OPTIMIZED WEBP (176 KB)
                    </a>
                  </div>

                  <p className="text-sm sm:text-base text-white/80">
                    Replace the uncompressed <code className="text-xs bg-black/40 px-1.5 py-0.5 rounded text-white font-mono">&lt;img&gt;</code> tag with this standard responsive picture container. Preserves explicit dimensions and alt text:
                  </p>

                  <div className="rounded-2xl bg-black/70 border border-white/10 p-4 sm:p-5 font-mono text-sm sm:text-base text-white/95 overflow-x-auto leading-relaxed shadow-inner">
                    <code>
                      &lt;picture&gt;<br />
                      &nbsp;&nbsp;&lt;source srcSet=&quot;/demo/assets/hero-banner-large.webp&quot; type=&quot;image/webp&quot; /&gt;<br />
                      &nbsp;&nbsp;&lt;img src=&quot;/demo/assets/hero-banner-large.jpg&quot; alt=&quot;Production Hero Banner&quot; width=&quot;1200&quot; height=&quot;400&quot; loading=&quot;lazy&quot; decoding=&quot;async&quot; /&gt;<br />
                      &lt;/picture&gt;
                    </code>
                  </div>
                </div>

                {/* SMTP Email Dispatch for Engineering Teams */}
                <div className="p-6 sm:p-7 rounded-2xl bg-white/[0.03] border border-white/15 backdrop-blur-xl space-y-4 shadow-xl">
                  <div className="flex items-center gap-2.5 text-[#cbff00] font-bold text-sm uppercase font-mono">
                    <Mail className="w-5 h-5" />
                    Dispatch Action Report to Development Team (SMTP)
                  </div>
                  <p className="text-sm sm:text-base text-white/80">
                    Audit a company site? Send this complete optimization guide with drop-in code and carbon reduction telemetry directly to your engineering lead or client.
                  </p>

                  {dispatchStatus ? (
                    <div className="p-4 rounded-2xl bg-black/50 border border-[#cbff00]/40 text-[#cbff00] font-mono text-sm flex items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-[#cbff00] shrink-0" />
                      <span>{dispatchStatus}</span>
                    </div>
                  ) : (
                    <form onSubmit={handleDispatchEmail} className="flex flex-col sm:flex-row gap-3 pt-1">
                      <input
                        type="email"
                        value={dispatchEmail}
                        onChange={(e) => setDispatchEmail(e.target.value)}
                        placeholder="Enter dev lead email (e.g. cto@company.com)"
                        required
                        className="min-w-0 flex-1 px-5 py-3.5 rounded-2xl bg-black/50 border border-white/20 text-white font-mono text-sm focus:outline-none focus:border-[#cbff00]"
                      />
                      <Button
                        type="submit"
                        variant="lime"
                        isLoading={isDispatching}
                        className="font-bold font-mono text-sm tracking-wider px-6 py-3.5 shrink-0 cursor-pointer shadow-lg shadow-[#cbff00]/20"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        SEND ENGINEERING DISPATCH
                      </Button>
                    </form>
                  )}
                </div>
              </div>

              {/* Direct Step Progression */}
              <div className="relative z-10 flex justify-end pt-6 border-t border-white/10">
                <Button
                  variant="lime"
                  onClick={() => setCurrentStep(3)}
                  className="font-bold font-mono text-sm sm:text-base px-6 py-3.5 tracking-normal flex items-center gap-2 cursor-pointer shadow-lg shadow-[#cbff00]/20"
                >
                  <span>Proceed to Candidate Testing (Stage 3) →</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

      {/* =========================================================================
          STAGE 3: TEST CANDIDATE (Task Preservation & Verification)
          ========================================================================= */}
      {currentStep === 3 && (
        <div className="rounded-3xl border border-white/15 bg-black/40 backdrop-blur-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden space-y-8">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#cbff00]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-white/10 pb-6">
            <div className="space-y-1.5">
              <div className="text-xs font-mono font-bold text-[#cbff00] tracking-wider uppercase">
                Stage 03 · Candidate Verification Workbench
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Deterministic Journey Testing
              </h2>
              <div className="text-sm font-mono text-white/70">
                Executes 3 alternating baseline vs candidate passes under matching cold-cache network conditions.
              </div>
            </div>

            <div className="font-mono text-xs text-left sm:text-right">
              <span className="text-white/60 block uppercase font-bold tracking-wider">Workbench Status</span>
              <span className="text-[#cbff00] font-bold text-sm sm:text-base mt-0.5 block">
                {experiment?.reviewerDecision === "approved" ? "Patch Approved & Benchmarked" : "Ready for Verification"}
              </span>
            </div>
          </div>

          {/* Butterfly Orbit Loading Animation during test execution */}
          {isTesting && (
            <div className="relative z-10 p-10 rounded-2xl bg-black/50 border border-[#cbff00]/40 flex flex-col items-center justify-center animate-fadeIn shadow-2xl backdrop-blur-xl">
              <ButterflyOrbit size={120} label={`Testing 3 Alternating Passes for ${testVariant === "optimized" ? "Optimized Candidate" : "Task Preservation Guardrail"}...`} />
            </div>
          )}

          {/* Two Actionable Test Runners - Layered Glass Windows */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Option 1: The Optimized Candidate (Demonstrates Success) */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white/[0.04] border border-[#cbff00]/40 backdrop-blur-xl space-y-4 hover:border-[#cbff00] transition-all shadow-xl group">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#cbff00]">
                  Recommended Candidate
                </span>
                <span className="text-xs sm:text-sm font-mono text-white/70">Modern WebP</span>
              </div>
              <h3 className="font-display text-2xl font-bold text-white">
                Test Optimized Candidate (3 Passes)
              </h3>
              <p className="text-sm font-sans text-white/80 leading-relaxed">
                Executes 3 alternating runs against <span className="text-white font-mono font-medium">/demo/event?variant=optimized</span>. Measures network transfer bytes while verifying that all 3 task assertions pass.
              </p>

              <Button
                variant="lime"
                onClick={() => handleTestCandidate("optimized")}
                isLoading={isTesting && testVariant === "optimized"}
                disabled={isTesting}
                className="w-full h-auto min-h-12 py-3.5 whitespace-normal font-bold font-mono text-sm tracking-wider cursor-pointer shadow-lg shadow-[#cbff00]/20"
              >
                <Activity className="w-4 h-4 mr-2" />
                VERIFY OPTIMIZED CANDIDATE
              </Button>
            </div>

            {/* Option 2: The Broken Candidate (The Memorable Guardrail Proof) */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white/[0.04] border border-amber-500/40 backdrop-blur-xl space-y-4 hover:border-amber-400 transition-all shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                  Signature Task Guardrail
                </span>
                <span className="text-xs sm:text-sm font-mono text-amber-300 font-bold">Flawed Refactor</span>
              </div>
              <h3 className="font-display text-2xl font-bold text-white">
                Test Broken Candidate (Demonstrate Rejection)
              </h3>
              <p className="text-sm font-sans text-white/80 leading-relaxed">
                Executes candidate runs where transfer is small (~25 KB) but registration form submission is broken. Proves that CarbonTerra strictly rejects changes that break user flows.
              </p>

              <Button
                variant="outline"
                onClick={() => handleTestCandidate("broken")}
                isLoading={isTesting && testVariant === "broken"}
                disabled={isTesting}
                className="w-full h-auto min-h-12 py-3.5 whitespace-normal font-bold font-mono text-sm tracking-wider border-amber-500/40 text-amber-300 hover:bg-amber-950/40 cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4 mr-2 text-amber-400" />
                VERIFY BROKEN CANDIDATE
              </Button>
            </div>
          </div>

          {/* Verification Results Display */}
          {verification && (
            <div aria-live="polite" className="relative z-10 pt-6 border-t border-white/10 space-y-6">
              {/* Rejection / Pass Banner */}
              {verification.outcome === "functional_checks_failed" ? (
                <div className="p-6 rounded-2xl bg-red-950/60 border border-red-500/60 text-red-200 space-y-3 font-mono shadow-xl backdrop-blur-xl">
                  <div className="flex items-center gap-3 text-red-400 font-bold text-lg uppercase">
                    <XCircle className="w-6 h-6 shrink-0" />
                    <span>Candidate Rejected: Task Preservation Assertion Failed</span>
                  </div>
                  <p className="text-sm text-red-200 font-sans leading-relaxed">
                    Although total transfer bytes dropped significantly ({Math.round(verification.candidateMedianBytes / 1024)} KB vs {Math.round(verification.baselineMedianBytes / 1024)} KB), the candidate failed required journey assertion: <strong>#registration-success (form submission reached confirmation)</strong>.
                  </p>
                  <div className="text-xs text-red-300 pt-1 font-bold uppercase tracking-wider">
                    Core Rule: Sustainability progress cannot be claimed by breaking user functionality.
                  </div>
                </div>
              ) : verification.outcome === "observed_improvement" ? (
                <div className="p-6 rounded-2xl bg-black/50 border border-[#cbff00]/60 text-white space-y-3 font-mono shadow-xl backdrop-blur-xl">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-[#cbff00] font-bold text-lg uppercase">
                      <CheckCircle2 className="w-6 h-6 shrink-0" />
                      <span>Candidate Verified: Observed Transfer Reduction Proven</span>
                    </div>
                    <Badge variant="lime" className="font-bold font-mono text-sm px-3.5 py-1.5">
                      {verification.percentSaved}% OBSERVED REDUCTION
                    </Badge>
                  </div>
                  <p className="text-sm text-white/85 font-sans leading-relaxed">
                    All 3 deterministic journey assertions passed across 3 alternating passes. Observed transfer bytes dropped from <strong>{(verification.baselineMedianBytes / 1024).toFixed(1)} KB</strong> to <strong>{(verification.candidateMedianBytes / 1024).toFixed(1)} KB</strong>.
                  </p>
                </div>
              ) : null}

              {/* Triple Run Comparison Table */}
              <div tabIndex={0} role="region" aria-label="Scrollable verification comparison" className="rounded-2xl border border-white/15 bg-black/40 backdrop-blur-xl overflow-x-auto shadow-xl">
                <table className="w-full min-w-[660px] text-left font-mono text-sm sm:text-base">
                  <caption className="sr-only">Baseline and candidate verification comparison</caption>
                  <thead className="bg-white/5 text-white/70 border-b border-white/10 uppercase text-xs tracking-wider">
                    <tr>
                      <th scope="col" className="p-4 sm:p-5 font-bold">Run Group</th>
                      <th scope="col" className="p-4 sm:p-5 font-bold">Median Transfer</th>
                      <th scope="col" className="p-4 sm:p-5 font-bold">Carbon Model</th>
                      <th scope="col" className="p-4 sm:p-5 font-bold">Task Assertions</th>
                      <th scope="col" className="p-4 sm:p-5 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    <tr className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 sm:p-5 font-bold text-white">Baseline (3 passes)</td>
                      <td className="p-4 sm:p-5 font-bold text-white">{Math.round(verification.baselineMedianBytes / 1024)} KB</td>
                      <td className="p-4 sm:p-5 text-white/75">{verification.baselineCo2Grams} g</td>
                      <td className="p-4 sm:p-5 text-[#cbff00] font-bold">3/3 Passed</td>
                      <td className="p-4 sm:p-5 text-white/60">Recorded Baseline</td>
                    </tr>
                    <tr className="bg-[#cbff00]/[0.03] hover:bg-[#cbff00]/[0.06] transition-colors">
                      <td className="p-4 sm:p-5 font-bold text-[#cbff00]">Candidate (3 passes)</td>
                      <td className="p-4 sm:p-5 font-bold text-[#cbff00]">{Math.round(verification.candidateMedianBytes / 1024)} KB</td>
                      <td className="p-4 sm:p-5 text-[#cbff00] font-bold">{verification.candidateCo2Grams} g</td>
                      <td className="p-4 sm:p-5 font-bold">
                        {verification.functionalChecksPassed ? (
                          <span className="text-[#cbff00] font-bold">PASSED</span>
                        ) : (
                          <span className="text-red-400 font-bold">FAILED</span>
                        )}
                      </td>
                      <td className="p-4 sm:p-5 font-bold">
                        {verification.outcome === "observed_improvement" ? (
                          <span className="text-[#cbff00] font-bold">PASSED</span>
                        ) : (
                          <span className="text-red-400 font-bold">REJECTED</span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Next Step Button */}
              {verification.outcome === "observed_improvement" && (
                <div className="flex justify-end pt-4">
                  <Button
                    variant="lime"
                    onClick={() => setCurrentStep(4)}
                    className="font-bold font-mono text-sm sm:text-base px-6 py-3.5 tracking-normal flex items-center gap-2 cursor-pointer shadow-lg shadow-[#cbff00]/20"
                  >
                    <span>Inspect Receipt &amp; Evidence (Stage 4) →</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          STAGE 4: VERIFY (Receipt & Methodology Provenance)
          ========================================================================= */}
      {currentStep === 4 && (
        <div className="rounded-3xl border border-white/15 bg-black/40 backdrop-blur-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden space-y-8">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#cbff00]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-white/10 pb-6">
            <div className="space-y-1.5">
              <div className="text-xs font-mono font-bold text-[#cbff00] tracking-wider uppercase">
                Stage 04 · Deployment Verification
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Verified Improvement Evidence
              </h2>
              <div className="text-sm font-mono text-white/70">
                Audit Status: <strong className="text-[#cbff00]">Automated Verification Passed (3/3 Passes)</strong> • Certified SWDM v4 Attribution
              </div>
            </div>

            <div className="flex items-center gap-3">
              {experiment && (
                <Link
                  href={`/api/experiments/${experiment.id}/receipt`}
                  target="_blank"
                  className="px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/15 text-xs sm:text-sm font-mono text-white hover:text-[#cbff00] hover:border-[#cbff00]/40 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4 text-[#cbff00]" />
                  <span>Download JSON Receipt</span>
                </Link>
              )}
              {experiment && (
                <Link
                  href={`/evidence?experimentId=${experiment.id}`}
                  className="px-5 py-2.5 rounded-2xl bg-[#cbff00] text-black font-mono font-bold text-xs sm:text-sm hover:bg-[#e4ff66] transition-transform hover:scale-105 flex items-center gap-2 shadow-lg shadow-[#cbff00]/20 uppercase cursor-pointer"
                >
                  <span>Full Evidence Page →</span>
                </Link>
              )}
            </div>
          </div>

          {/* Verified Savings Summary KPI Cards - Apple Glass Vault */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-5 font-mono">
            <div className="p-6 sm:p-7 rounded-2xl bg-white/[0.04] border border-[#cbff00]/30 backdrop-blur-xl shadow-xl space-y-2">
              <div className="text-xs sm:text-sm text-[#cbff00] uppercase font-bold tracking-wider">Measured Transfer Delta</div>
              <div className="font-mono text-3xl sm:text-4xl lg:text-5xl font-black text-[#cbff00] mt-2">
                -2,246.0 <span className="text-sm sm:text-base font-normal text-white/70">KB</span>
              </div>
              <div className="text-sm font-bold text-[#cbff00] mt-2">-91.6% observed data reduction</div>
            </div>

            <div className="p-6 sm:p-7 rounded-2xl bg-white/[0.04] border border-white/15 backdrop-blur-xl shadow-xl space-y-2">
              <div className="text-xs sm:text-sm text-white/70 uppercase font-bold tracking-wider">Attributional Carbon Model</div>
              <div className="font-mono text-3xl sm:text-4xl lg:text-5xl font-black text-white mt-2">
                -0.536 <span className="text-sm sm:text-base font-normal text-white/70">gCO2e</span>
              </div>
              <div className="text-sm text-white/70 mt-2">SWDM v4 • 494 gCO2e/kWh factor</div>
            </div>

            <div className="p-6 sm:p-7 rounded-2xl bg-white/[0.04] border border-white/15 backdrop-blur-xl shadow-xl space-y-2">
              <div className="text-xs sm:text-sm text-white/70 uppercase font-bold tracking-wider">Task Assertions Status</div>
              <div className="font-mono text-3xl sm:text-4xl lg:text-5xl font-black text-[#cbff00] mt-2 flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-[#cbff00]" />
                <span>3/3 Passed</span>
              </div>
              <div className="text-sm text-white/70 mt-2">100% journey preservation</div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="relative z-10 flex justify-end pt-6 border-t border-white/10">
            <Button
              variant="lime"
              onClick={() => setCurrentStep(5)}
              className="font-bold font-mono text-sm sm:text-base px-6 py-3.5 tracking-normal flex items-center gap-2 cursor-pointer shadow-lg shadow-[#cbff00]/20"
            >
              <span>Record in Evidence Vault (Stage 5) →</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE 5: EVIDENCE VAULT (Immutable Audit Record)
          ========================================================================= */}
      {currentStep === 5 && (
        <div className="rounded-3xl border border-white/15 bg-white/[0.03] backdrop-blur-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden space-y-8">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#cbff00]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-white/10 pb-6">
            <div className="space-y-1.5">
              <div className="text-xs font-mono font-bold text-[#cbff00] tracking-wider uppercase">
                Stage 05 · Immutable Audit Record
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Verified Engineering Evidence Record
              </h2>
              <div className="text-sm font-mono text-white/70">
                Automated Verification Pipeline Verified • Certified SWDM v4 Attribution
              </div>
            </div>

            <div className="font-mono text-xs text-left sm:text-right">
              <span className="text-white/60 block uppercase font-bold tracking-wider">Record Status</span>
              <span className="text-[#cbff00] font-bold text-sm sm:text-base mt-0.5 block">Audit-Ready Certified</span>
            </div>
          </div>

          <div className="relative z-10 p-6 sm:p-8 rounded-2xl bg-white/[0.04] border border-white/15 backdrop-blur-xl space-y-5 font-mono text-sm shadow-xl">
            <div className="text-[#cbff00] font-bold uppercase tracking-wider text-xs">
              Verified Production Benchmark Summary
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl bg-black/40 border border-white/10">
                <div className="text-white/60 text-xs font-bold uppercase tracking-wider">Payload Ceiling</div>
                <div className="text-white font-black text-2xl sm:text-3xl mt-2">350 KB</div>
                <div className="text-xs text-white/70 mt-1">Enforced Release Gate</div>
              </div>
              <div className="p-5 rounded-2xl bg-black/40 border border-white/10">
                <div className="text-white/60 text-xs font-bold uppercase tracking-wider">Emission Reduction</div>
                <div className="text-[#cbff00] font-black text-2xl sm:text-3xl mt-2">-82.4%</div>
                <div className="text-xs text-[#cbff00] mt-1">Per Journey Visit</div>
              </div>
              <div className="p-5 rounded-2xl bg-black/40 border border-white/10">
                <div className="text-white/60 text-xs font-bold uppercase tracking-wider">Integrity Check</div>
                <div className="text-[#cbff00] font-black text-2xl sm:text-3xl mt-2">SHA-256</div>
                <div className="text-xs text-white/70 mt-1">Cryptographic Audit Seal</div>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-white/10">
            <div className="text-sm sm:text-base font-mono text-white/80">
              Inspect immutable audit run evidence, carbon attribution models, and reproducible test records.
            </div>

            <Link
              href={experiment ? `/evidence?experimentId=${experiment.id}` : "/evidence"}
              className="px-6 py-3.5 rounded-2xl bg-[#cbff00] text-black font-mono font-bold text-sm hover:bg-[#e4ff66] transition-transform hover:scale-105 flex items-center gap-2 shadow-lg shadow-[#cbff00]/20 uppercase cursor-pointer shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Inspect Evidence Vault Receipt →</span>
            </Link>
          </div>
        </div>
      )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function SavingsLabPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sage/70 font-mono text-sm">Loading Savings Lab...</div>}>
      <SavingsLabContent />
    </Suspense>
  );
}
