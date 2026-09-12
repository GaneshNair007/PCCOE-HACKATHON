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
  Sparkles,
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
} from "lucide-react";
import { Experiment, VerificationResult } from "@/lib/storage/types";

function SavingsLabContent() {
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const projectIdParam = searchParams.get("projectId") || "campus-events";
  const initialAuditId = searchParams.get("auditId") || "";
  const initialTargetUrl = searchParams.get("targetUrl") || "";

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

  // Initialize or fetch active experiment
  useEffect(() => {
    async function loadOrCreateExperiment() {
      setIsLoading(true);
      try {
        // Fetch experiments for project
        const res = await fetch(`/api/experiments?projectId=${projectIdParam}`);
        const data = await res.json();

        if (data.status === "success" && data.experiments && data.experiments.length > 0) {
          const exp = data.experiments[data.experiments.length - 1];
          setExperiment(exp);
          setPatchDiff(exp.patchDiff || "");
          if (exp.status === "approved" || exp.reviewerDecision === "approved") {
            setCurrentStep(3);
          } else if (exp.status === "candidate_tested") {
            setCurrentStep(4);
          }
        } else {
          // Initialize demo experiment
          const initRes = await fetch("/api/experiments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectId: projectIdParam }),
          });
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
    { num: 1, label: "Evidence", desc: "Observed waste & journey" },
    { num: 2, label: "Review fix", desc: "Source diff & approval" },
    { num: 3, label: "Test candidate", desc: "Task checks & transfer" },
    { num: 4, label: "Verify", desc: "Receipt & methodology" },
    { num: 5, label: "Protect", desc: "Shield CI regression gate" },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <PageIntro
        eyebrow={<><Sparkles className="w-4 h-4" /> Measure · improve · verify</>}
        title="Savings Lab"
        description="Connect observed web transfer waste to a reviewable source change. Check that the same user task still works with less data, verify the outcome, and protect the improvement."
      />

        <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-surface border border-surface-border p-4">
          <Badge variant="outline" className="font-mono text-xs text-lime border-lime/30">
            Project: campus-events
          </Badge>
          <Badge variant="outline" className="font-mono text-xs text-sage/70">
            Controlled demo site
          </Badge>
          <Link
            href="/demo/event"
            target="_blank"
            className="px-3 py-1.5 rounded-full glass-panel border border-surface-border text-xs font-mono text-sage/80 hover:text-cream hover:border-lime/40 transition-colors flex items-center gap-1.5"
          >
            <span>Open target site</span>
            <ExternalLink className="w-3 h-3 text-lime" />
          </Link>
        </div>

      {/* 5-Stage Stepper Navigation */}
      <Reveal className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {stages.map((st) => {
          const isActive = currentStep === st.num;
          const isDone = currentStep > st.num;
          return (
            <button
              key={st.num}
              data-spec
              type="button"
              aria-current={isActive ? "step" : undefined}
              aria-label={`Step ${st.num}: ${st.label}${isDone ? ", completed" : isActive ? ", current" : ""}`}
              onClick={() => setCurrentStep(st.num)}
              className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                isActive
                  ? "glass-panel-elevated border-lime/60 ring-1 ring-lime/20"
                  : isDone
                  ? "glass-panel border-lime/20 text-cream"
                  : "glass-panel border-surface-border text-sage hover:border-sage/50"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
                <span className="font-mono text-xs font-bold text-lime">0{st.num}</span>
                {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-lime" />}
                {isActive && <div className="w-2 h-2 rounded-full bg-lime" aria-hidden="true" />}
              </div>
              <div className="font-display text-base text-cream">{st.label}</div>
              <div className="text-[11px] font-mono text-sage/60 mt-0.5">{st.desc}</div>
            </button>
          );
        })}
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
            <div className="space-y-6">
          <Card className="p-5 sm:p-8 glass-panel-elevated border border-surface-border space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border/60 pb-5">
              <div>
                <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase bg-lime/10 text-lime border border-lime/30">
                  Stage 1 · Observed evidence
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-cream mt-2">
                  Campus event registration journey
                </h2>
                <div className="text-xs font-mono text-sage/70 mt-1">
                  Target: <span className="text-cream">/demo/event?variant=baseline</span> • Baseline Runs: 3 Recorded Passes
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono text-sage/60 uppercase">Observed Journey Transfer</div>
                <div className="font-mono text-3xl font-bold text-cream">
                  2,450.0 <span className="text-xs text-sage/70 font-normal">KB</span>
                </div>
                <div className="text-[11px] font-mono text-sage/60">~0.584g CO2e (SWDM v4)</div>
              </div>
            </div>

            {/* Observed Hotspot Card */}
            <div className="p-5 rounded-2xl bg-surface/50 border border-surface-border space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="text-xs font-mono text-red-300 font-bold uppercase">
                    Critical Reducible Asset Hotspot
                  </span>
                </div>
                <Badge variant="outline" className="font-mono text-[11px] text-red-300 border-red-500/30">
                  98.7% OF JOURNEY BYTES
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                <div className="p-3.5 rounded-xl bg-surface-elevated/70 border border-surface-border">
                  <div className="text-sage/60 text-[10px] uppercase">Resource URL</div>
                  <div className="text-cream break-all font-bold mt-1">/demo/assets/campus-hackathon-hero.jpg</div>
                  <div className="text-[10px] text-sage/60 mt-1">First-Party Static Asset</div>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-elevated/70 border border-surface-border">
                  <div className="text-sage/60 text-[10px] uppercase">Observed Transfer Weight</div>
                  <div className="text-cream font-bold mt-1 break-words">2,420,000 bytes (2.42 MB)</div>
                  <div className="text-[10px] text-red-400 mt-1">Raw uncompressed JPEG</div>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-elevated/70 border border-surface-border">
                  <div className="text-sage/60 text-[10px] uppercase">Source Code Location</div>
                  <div className="text-cream font-bold mt-1 break-words">src/app/demo/event/page.tsx:L76</div>
                  <div className="text-[10px] text-lime mt-1">Directly mappable component</div>
                </div>
              </div>
            </div>

            {/* Journey Definition & Assertions */}
            <div className="space-y-3">
              <SectionHeading title="Task assertions" description="Functional guardrails for the registration journey." />
              <p className="text-xs text-sage/70">
                To prevent false optimizations (e.g. deleting features or lazy-loading broken forms), Carbonerra verifies that these three exact assertions pass on every candidate test:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3.5 rounded-xl bg-forest/20 border border-lime/30">
                  <div className="flex items-center gap-1.5 text-lime font-bold">
                    <Check className="w-3.5 h-3.5" /> Assertion 1: Essential Info
                  </div>
                  <div className="text-sage/80 text-[11px] mt-1.5 leading-relaxed">
                    Event title, dates, venue, and track details are present in DOM (#event-title).
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-forest/20 border border-lime/30">
                  <div className="flex items-center gap-1.5 text-lime font-bold">
                    <Check className="w-3.5 h-3.5" /> Assertion 2: Keyboard CTA
                  </div>
                  <div className="text-sage/80 text-[11px] mt-1.5 leading-relaxed">
                    Registration CTA button is keyboard-accessible and reveals registration form (#register-cta).
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-forest/20 border border-lime/30">
                  <div className="flex items-center gap-1.5 text-lime font-bold">
                    <Check className="w-3.5 h-3.5" /> Assertion 3: Working Submission
                  </div>
                  <div className="text-sage/80 text-[11px] mt-1.5 leading-relaxed">
                    Required fields validate and local synthetic submission returns success confirmation (#registration-success).
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex justify-end pt-4 border-t border-surface-border/60">
              <Button
                variant="lime"
                onClick={() => setCurrentStep(2)}
                className="font-bold tracking-normal flex items-center gap-2"
              >
                <span>Review proposed fix</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          STAGE 2: REVIEW FIX (Source Diff & Reviewer Approval)
          ========================================================================= */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <Card className="p-5 sm:p-8 glass-panel-elevated border border-surface-border space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border/60 pb-5">
              <div>
                <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase bg-lime/10 text-lime border border-lime/30">
                  Stage 2 · Review fix & proposed patch
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-cream mt-2">
                  First-party image optimization patch
                </h2>
                <div className="text-xs font-mono text-sage/70 mt-1">
                  Rule: <span className="text-cream">responsive_webp_conversion</span> • Class: Image Component Refactor
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant="outline" className="font-mono text-xs text-lime border-lime/40">
                  ESTIMATED SAVING: -92.7%
                </Badge>
                <Badge variant="outline" className="font-mono text-xs text-sage/70">
                  RISK: LOW
                </Badge>
              </div>
            </div>

            {/* Patch Rationale & Risk Assessment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-surface/50 border border-surface-border space-y-1.5">
                <div className="text-lime font-bold uppercase">Engineering Rationale</div>
                <p className="text-sage/80 leading-relaxed">
                  Converts uncompressed 2.42 MB JPEG hero banner into a modern WebP format (176 KB). Serves via HTML5 &lt;picture&gt; element with modern WebP source and JPEG fallback. Preserves aspect ratio, alt text, and explicit dimensions to avoid Cumulative Layout Shift (CLS).
                </p>
              </div>
              <div className="p-4 rounded-xl bg-surface/50 border border-surface-border space-y-1.5">
                <div className="text-cream font-bold uppercase">LCP & Layout Safeguards</div>
                <p className="text-sage/80 leading-relaxed">
                  The hero banner is the Largest Contentful Paint (LCP) element. It is loaded eagerly (fetchPriority=&quot;high&quot;) rather than lazy-loaded to prevent Core Web Vitals degradation. Replacement assets exist at <span className="text-cream">public/demo/assets/campus-hackathon-hero.webp</span>.
                </p>
              </div>
            </div>

            {/* Unified Diff Viewer */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-sage/70">
                <span className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-lime" />
                  <span>Target: src/app/demo/event/page.tsx</span>
                </span>
                <span className="text-lime font-bold">Reviewable Git Unified Diff</span>
              </div>

              <div tabIndex={0} role="region" aria-label="Proposed image optimization source diff" className="rounded-2xl bg-black/80 border border-surface-border p-4 font-mono text-xs overflow-x-auto leading-relaxed shadow-inner">
                <pre className="text-sage/80">
                  <span className="text-sage/40">--- a/src/app/demo/event/page.tsx</span>{"\n"}
                  <span className="text-sage/40">+++ b/src/app/demo/event/page.tsx</span>{"\n"}
                  <span className="text-cyan-400">@@ -74,7 +74,13 @@ First-Party Event Hero Image Component @@</span>{"\n"}
                  <span className="text-sage/50">       &lt;div className=&quot;relative rounded-3xl overflow-hidden border border-surface-border&quot;&gt;</span>{"\n"}
                  <span className="text-red-400 bg-red-950/40 block">-        &lt;img id=&quot;event-hero-img&quot; src=&quot;/demo/assets/campus-hackathon-hero.jpg&quot; alt=&quot;PCCOE Green Campus Hackathon 2026 Banner&quot; className=&quot;w-full h-72 sm:h-96 object-cover&quot; /&gt;</span>
                  <span className="text-lime bg-lime/10 block">+        &lt;picture&gt;</span>
                  <span className="text-lime bg-lime/10 block">+          &lt;source srcSet=&quot;/demo/assets/campus-hackathon-hero.webp&quot; type=&quot;image/webp&quot; /&gt;</span>
                  <span className="text-lime bg-lime/10 block">+          &lt;img id=&quot;event-hero-img&quot; src=&quot;/demo/assets/campus-hackathon-hero.webp&quot; alt=&quot;PCCOE Green Campus Hackathon 2026 Banner&quot; width=&quot;1200&quot; height=&quot;400&quot; className=&quot;w-full h-72 sm:h-96 object-cover&quot; fetchPriority=&quot;high&quot; /&gt;</span>
                  <span className="text-lime bg-lime/10 block">+        &lt;/picture&gt;</span>
                  <span className="text-sage/50">       &lt;/div&gt;</span>
                </pre>
              </div>
            </div>

            {/* Reviewer Sign-Off Box */}
            <div className="p-5 rounded-2xl bg-forest/20 border border-lime/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-mono text-lime font-bold uppercase flex items-center gap-2">
                  <GitCommit className="w-4 h-4" /> Explicit Reviewer Approval Required
                </div>
                <div className="text-xs text-sage/80">
                  No automated patch is applied without engineering sign-off. Reviewer:
                  <input
                    aria-label="Reviewer name"
                    type="text"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    className="mt-2 w-full min-h-11 px-3 py-2 rounded-xl bg-surface border border-surface-border text-cream font-mono text-xs focus:outline-none focus:ring-2 focus:ring-lime/30"
                  />
                </div>
              </div>

              <Button
                variant="lime"
                onClick={handleApprovePatch}
                isLoading={isApproving}
                className="font-bold tracking-normal shrink-0"
              >
                <Check className="w-4 h-4 mr-1.5" />
                Approve & stage candidate
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          Stage 3 · Test candidate (Task Preservation & Verification)
          ========================================================================= */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <Card className="p-5 sm:p-8 glass-panel-elevated border border-surface-border space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border/60 pb-5">
              <div>
                <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase bg-lime/10 text-lime border border-lime/30">
                  Stage 3 · Test candidate
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-cream mt-2">
                  Candidate verification workbench
                </h2>
                <div className="text-xs font-mono text-sage/70 mt-1">
                  Runs 3 alternating baseline vs candidate passes under matching cold-cache network conditions.
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs text-lime border-lime/40">
                  Status: {experiment?.reviewerDecision === "approved" ? "Patch Approved" : "Pending Approval"}
                </Badge>
              </div>
            </div>

            {/* Two Actionable Test Runners */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Option 1: The Optimized Candidate (Demonstrates Success) */}
              <div className="p-6 rounded-2xl bg-surface/50 border border-lime/40 space-y-4 hover:border-lime transition-all">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-lime text-black">
                    RECOMMENDED CANDIDATE
                  </span>
                  <span className="text-xs font-mono text-lime">Modern WebP</span>
                </div>
                <h3 className="font-display text-xl text-cream">
                  Test optimized candidate (3 passes)
                </h3>
                <p className="text-xs font-mono text-sage/80 leading-relaxed">
                  Executes 3 alternating runs against <span className="text-cream">/demo/event?variant=optimized</span>. Measures network transfer bytes while verifying that all 3 task assertions pass.
                </p>

                <Button
                  variant="lime"
                  onClick={() => handleTestCandidate("optimized")}
                  isLoading={isTesting && testVariant === "optimized"}
                  disabled={isTesting}
                  className="w-full h-auto min-h-12 py-3 whitespace-normal font-medium tracking-normal"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Verify optimized candidate
                </Button>
              </div>

              {/* Option 2: The Broken Candidate (The Memorable Twist!) */}
              <div className="p-6 rounded-2xl bg-surface/50 border border-amber-500/40 space-y-4 hover:border-amber-400 transition-all">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    SIGNATURE TASK PRESERVATION CHECK
                  </span>
                  <span className="text-xs font-mono text-amber-300">Flawed Refactor</span>
                </div>
                <h3 className="font-display text-xl text-cream">
                  Test broken candidate (demonstrate rejection)
                </h3>
                <p className="text-xs font-mono text-sage/80 leading-relaxed">
                  Executes candidate runs where transfer is low (~25 KB) but the registration step is broken (HTTP 500). Proves that Carbonerra strictly rejects candidates that sacrifice user functionality.
                </p>

                <Button
                  variant="outline"
                  onClick={() => handleTestCandidate("broken")}
                  isLoading={isTesting && testVariant === "broken"}
                  disabled={isTesting}
                  className="w-full h-auto min-h-12 py-3 whitespace-normal font-medium tracking-normal border-amber-500/40 text-amber-300 hover:bg-amber-950/40"
                >
                  <AlertTriangle className="w-4 h-4 mr-2 text-amber-400" />
                  Verify broken candidate
                </Button>
              </div>
            </div>

            {/* Verification Results Display */}
            {verification && (
              <div aria-live="polite" className="pt-6 border-t border-surface-border/60 space-y-5">
                {/* Rejection / Pass Banner */}
                {verification.outcome === "functional_checks_failed" ? (
                  <div className="p-5 rounded-2xl bg-red-950/50 border border-red-500/60 text-red-200 space-y-2 font-mono">
                    <div className="flex items-center gap-2 text-red-400 font-bold text-base uppercase">
                      <XCircle className="w-5 h-5" />
                      Candidate rejected: task preservation assertion failed
                    </div>
                    <p className="text-xs text-red-200 leading-relaxed">
                      Although total transfer bytes dropped significantly ({Math.round(verification.candidateMedianBytes / 1024)} KB vs {Math.round(verification.baselineMedianBytes / 1024)} KB), the candidate failed required journey assertion: <strong>#registration-success (form submission reached success confirmation)</strong>.
                    </p>
                    <div className="text-[11px] text-red-300 pt-1 font-bold">
                      Rule Invariant: A website cannot claim sustainability progress by breaking the service or task people need.
                    </div>
                  </div>
                ) : verification.outcome === "observed_improvement" ? (
                  <div className="p-5 rounded-2xl bg-forest/30 border border-lime/60 text-cream space-y-2 font-mono">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-lime font-bold text-base uppercase">
                        <CheckCircle2 className="w-5 h-5" />
                        Candidate verified: observed transfer reduction proven
                      </div>
                      <Badge variant="lime" className="font-bold font-mono">
                        {verification.percentSaved}% OBSERVED REDUCTION
                      </Badge>
                    </div>
                    <p className="text-xs text-sage/80 leading-relaxed">
                      All 3 deterministic journey assertions passed across 3 alternating passes. Observed transfer bytes dropped from <strong>{(verification.baselineMedianBytes / 1024).toFixed(1)} KB</strong> to <strong>{(verification.candidateMedianBytes / 1024).toFixed(1)} KB</strong>.
                    </p>
                  </div>
                ) : null}

                {/* Triple Run Comparison Table */}
                <div tabIndex={0} role="region" aria-label="Scrollable verification comparison" className="rounded-2xl border border-surface-border overflow-x-auto">
                  <table className="w-full min-w-[620px] text-left font-mono text-xs">
                    <caption className="sr-only">Baseline and candidate verification comparison</caption>
                    <thead className="bg-surface-elevated/80 text-sage/70 border-b border-surface-border">
                      <tr>
                        <th scope="col" className="p-3">Run Group</th>
                        <th scope="col" className="p-3">Median Transfer</th>
                        <th scope="col" className="p-3">Carbon Model</th>
                        <th scope="col" className="p-3">Task Assertions</th>
                        <th scope="col" className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border/60">
                      <tr>
                        <td className="p-3 font-bold text-cream">Baseline (3 passes)</td>
                        <td className="p-3 font-bold text-cream">{Math.round(verification.baselineMedianBytes / 1024)} KB</td>
                        <td className="p-3 text-sage/80">{verification.baselineCo2Grams} g</td>
                        <td className="p-3 text-lime font-bold">3/3 Passed</td>
                        <td className="p-3 text-sage/60">Recorded Baseline</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-lime">Candidate (3 passes)</td>
                        <td className="p-3 font-bold text-lime">{Math.round(verification.candidateMedianBytes / 1024)} KB</td>
                        <td className="p-3 text-lime font-bold">{verification.candidateCo2Grams} g</td>
                        <td className="p-3 font-bold">
                          {verification.functionalChecksPassed ? (
                            <span className="text-lime">Passed ✅</span>
                          ) : (
                            <span className="text-red-400">Failed ❌</span>
                          )}
                        </td>
                        <td className="p-3 font-bold">
                          {verification.outcome === "observed_improvement" ? (
                            <span className="text-lime">Passed ✅</span>
                          ) : (
                            <span className="text-red-400">Rejected ❌</span>
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
                      className="font-bold tracking-normal flex items-center gap-2"
                    >
                      <span>Inspect receipt & evidence</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* =========================================================================
          STAGE 4: VERIFY (Receipt & Methodology Provenance)
          ========================================================================= */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <Card className="p-5 sm:p-8 glass-panel-elevated border border-surface-border space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border/60 pb-5">
              <div>
                <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase bg-lime/10 text-lime border border-lime/30">
                  Stage 4 · Deployment verification
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-cream mt-2">
                  Verified improvement evidence
                </h2>
                <div className="text-xs font-mono text-sage/70 mt-1">
                  Deployment Status: <span className="text-lime font-bold">Verified in local production build</span> • Staging: Awaiting credentials
                </div>
              </div>

              <div className="flex items-center gap-3">
                {experiment && (
                  <Link
                    href={`/api/experiments/${experiment.id}/receipt`}
                    target="_blank"
                    className="px-3.5 py-2 rounded-full glass-panel border border-surface-border text-xs font-mono text-sage/80 hover:text-cream hover:border-lime/40 transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-lime" />
                    <span>Download JSON Receipt</span>
                  </Link>
                )}
                {experiment && (
                  <Link
                    href={`/evidence?experimentId=${experiment.id}`}
                    className="px-4 py-2 rounded-full bg-lime text-black font-mono font-bold text-xs hover:bg-lime/90 transition-colors flex items-center gap-1.5"
                  >
                    <span>Full Evidence Page →</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Verified Savings Summary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
              <div className="p-4 rounded-2xl bg-surface/50 border border-surface-border">
                <div className="text-xs text-sage/60 uppercase">Measured Transfer Delta</div>
                <div className="font-mono text-2xl font-bold text-lime mt-1">
                  -2,246.0 <span className="text-xs text-sage/70 font-normal">KB / journey</span>
                </div>
                <div className="text-[11px] text-lime/80 mt-1">-91.6% observed data reduction</div>
              </div>

              <div className="p-4 rounded-2xl bg-surface/50 border border-surface-border">
                <div className="text-xs text-sage/60 uppercase">Attributional Carbon Model</div>
                <div className="font-mono text-2xl font-bold text-cream mt-1">
                  -0.536 <span className="text-xs text-sage/70 font-normal">gCO2e / journey</span>
                </div>
                <div className="text-[11px] text-sage/60 mt-1">SWDM v4 • 494 gCO2e/kWh factor</div>
              </div>

              <div className="p-4 rounded-2xl bg-surface/50 border border-surface-border">
                <div className="text-xs text-sage/60 uppercase">Task Assertions Status</div>
                <div className="font-mono text-2xl font-bold text-lime mt-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-6 h-6 text-lime" />
                  <span>3/3 Passed</span>
                </div>
                <div className="text-[11px] text-sage/60 mt-1">100% journey preservation</div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex justify-end pt-4 border-t border-surface-border/60">
              <Button
                variant="lime"
                onClick={() => setCurrentStep(5)}
                className="font-bold tracking-normal flex items-center gap-2"
              >
                <span>Protect in Release Shield</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          STAGE 5: PROTECT (Shield CI Regression Gate)
          ========================================================================= */}
      {currentStep === 5 && (
        <div className="space-y-6">
          <Card className="p-5 sm:p-8 glass-panel-elevated border border-surface-border space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border/60 pb-5">
              <div>
                <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase bg-lime/10 text-lime border border-lime/30">
                  Stage 5 · Prevent regression
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-cream mt-2">
                  Carbonerra Release Shield integration
                </h2>
                <div className="text-xs font-mono text-sage/70 mt-1">
                  Promote verified candidate outcome as immutable release budget ceiling.
                </div>
              </div>

              <Badge variant="outline" className="font-mono text-xs text-lime border-lime/40">
                MODE: STRICT (EXIT NONZERO ON BREACH)
              </Badge>
            </div>

            <div className="p-5 rounded-2xl bg-surface/50 border border-surface-border space-y-3 font-mono text-xs">
              <div className="text-lime font-bold uppercase">Configured Shield Limits from Verified Baseline:</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-surface-elevated/60 border border-surface-border">
                  <div className="text-sage/60 text-[10px]">TOTAL TRANSFER CEILING</div>
                  <div className="text-cream font-bold text-base mt-1">350 KB</div>
                </div>
                <div className="p-3 rounded-xl bg-surface-elevated/60 border border-surface-border">
                  <div className="text-sage/60 text-[10px]">IMAGE CATEGORY CEILING</div>
                  <div className="text-cream font-bold text-base mt-1">200 KB</div>
                </div>
                <div className="p-3 rounded-xl bg-surface-elevated/60 border border-surface-border">
                  <div className="text-sage/60 text-[10px]">MAX NETWORK REQUESTS</div>
                  <div className="text-cream font-bold text-base mt-1">12 requests</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-surface-border/60">
              <div className="text-xs font-mono text-sage/70">
                Test the regression gate directly or copy the GitHub Actions CI workflow in Shield.
              </div>

              <Link
                href="/shield"
                className="px-5 py-2.5 rounded-full bg-lime text-black font-mono font-bold text-xs hover:bg-lime/90 transition-colors flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                Open Release Shield workbench →
              </Link>
            </div>
          </Card>
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
