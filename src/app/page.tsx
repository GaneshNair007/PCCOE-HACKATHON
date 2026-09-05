"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Zap,
  ArrowRight,
  ShieldCheck,
  Sliders,
  Cpu,
  Activity,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Globe,
  Leaf,
  Layers,
  ChevronRight,
  TrendingDown,
  Info,
  Check,
  Scale,
  Compass,
  Server,
  Code2,
  Lock,
  RefreshCw,
  HelpCircle,
  AlertTriangle,
  XCircle,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CarbonGlobe3D } from "@/components/3d/carbon-globe-3d";
import { FallingLeaves } from "@/components/ambient/falling-leaves";
import { TiltCard3D } from "@/components/3d/tilt-card-3d";
import { HologramGauge3D } from "@/components/3d/hologram-gauge-3d";
import { PayloadBreakdown } from "@/components/telemetry/payload-breakdown";
import { HotspotCard } from "@/components/telemetry/hotspot-card";
import { ApiExplorer } from "@/components/telemetry/api-explorer";
import { ExplainabilityPanel } from "@/components/telemetry/explainability-panel";
import { AuditResult } from "@/types/telemetry";
import { CARBONERRA_CONFIG } from "@/lib/config";
import Link from "next/link";

const BENCHMARK_PRESETS = [
  { label: "Stripe", url: "https://stripe.com" },
  { label: "Vercel", url: "https://vercel.com" },
  { label: "PCCOE", url: "https://www.pccoepune.com" },
  { label: "GitHub", url: "https://github.com" },
];

function LandingPageContent() {
  const searchParams = useSearchParams();
  const [targetUrl, setTargetUrl] = useState("");
  const [auditStatus, setAuditStatus] = useState<"idle" | "running" | "completed" | "failed">("idle");
  const [currentPhase, setCurrentPhase] = useState<string>("");
  const [auditData, setAuditData] = useState<AuditResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [showMethodologyModal, setShowMethodologyModal] = useState(false);
  const [sensitivityVariance, setSensitivityVariance] = useState(0); // -20% to +20%

  const heroRef = useRef<HTMLDivElement>(null);
  const cockpitRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // GSAP ScrollTrigger animations
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (featuresRef.current) {
      const cards = featuresRef.current.querySelectorAll(".feature-card-3d");
      gsap.fromTo(
        cards,
        { opacity: 0, y: 40, rotateX: 10 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 85%",
          },
        }
      );
    }
  }, []);

  const runAudit = async (urlToScan: string) => {
    const trimmed = urlToScan.trim();
    if (!trimmed) {
      setErrorMessage("Please enter a public website URL (e.g. stripe.com).");
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setAuditStatus("running");
    setErrorMessage(null);
    setErrorCode(null);
    setCurrentPhase("Phase 1/4: SSRF Security Validation & DNS Pre-Resolution...");

    const phaseTimer = setTimeout(() => {
      setCurrentPhase("Phase 2/4: Querying Google PageSpeed Insights & Static DOM Crawler...");
    }, 1800);

    const phaseTimer2 = setTimeout(() => {
      setCurrentPhase("Phase 3/4: Resolving Hosting Geolocation Proxy & Grid Intensity...");
    }, 4200);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
        signal: controller.signal,
      });

      clearTimeout(phaseTimer);
      clearTimeout(phaseTimer2);

      const data: AuditResult = await res.json();
      if (!res.ok || data.status === "error") {
        setAuditStatus("failed");
        setErrorCode(data.code || "AUDIT_FAILED");
        setErrorMessage(data.message || "Failed to audit the specified website.");
        return;
      }

      setAuditData(data);
      setAuditStatus("completed");
      setSensitivityVariance(0);
      abortControllerRef.current = null;

      // Save to localStorage for fleet / recent history
      try {
        const storedFleet = JSON.parse(localStorage.getItem("carbonerra_fleet") || "[]");
        const updatedFleet = [
          {
            id: data.id || `fleet_${Date.now()}`,
            domain: data.domain,
            grade: data.eco_score,
            co2: data.co2_grams,
            payloadMb: data.metrics.payload_mb,
            isGreen: data.hosting.green,
            hostingProvider: data.hosting.provider || "Standard Datacenter Grid",
            lastAudited: new Date().toISOString(),
          },
          ...storedFleet.filter((s: any) => s.domain !== data.domain),
        ].slice(0, 25);
        localStorage.setItem("carbonerra_fleet", JSON.stringify(updatedFleet));
      } catch {
        // LocalStorage fallback
      }

      // Smooth scroll to 3D cockpit
      setTimeout(() => {
        cockpitRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } catch (err: any) {
      clearTimeout(phaseTimer);
      clearTimeout(phaseTimer2);
      if (err.name === "AbortError" || controller.signal.aborted) {
        setAuditStatus("idle");
        setCurrentPhase("");
        return;
      }
      setAuditStatus("failed");
      setErrorMessage(err.message || "Network error occurred while connecting to the audit service.");
    }
  };

  const cancelAudit = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setAuditStatus("idle");
      setCurrentPhase("");
    }
  };

  // Auto-run if ?url= query parameter is passed
  useEffect(() => {
    const queryUrl = searchParams.get("url");
    if (queryUrl) {
      setTargetUrl(queryUrl);
      runAudit(queryUrl);
    }
  }, [searchParams]);

  const handleAuditSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    runAudit(targetUrl);
  };

  // Sensitivity adjusted CO2 calculation
  const displayedCo2 = auditData
    ? Number((auditData.co2_grams * (1 + sensitivityVariance / 100)).toFixed(4))
    : null;

  return (
    <div className="space-y-28 pb-28">
      {/* ==========================================================================
           3D HERO SECTION: 3D Globe + Anton Cyber Typography + Audit Workspace
           ========================================================================== */}
      <section
        ref={heroRef}
        className="relative min-h-[80vh] flex flex-col lg:flex-row items-center lg:items-start justify-between gap-12 pt-4 lg:pt-8 overflow-hidden rounded-3xl"
      >
        {/* Living Ambient Falling Leaves Layer (falling-leaves craft) */}
        <FallingLeaves className="opacity-90" />

        {/* Left Column: Input Workspace */}
        <div className="flex-1 max-w-2xl space-y-6 text-left z-10 relative">
          <h1 className="font-display text-[calc(var(--u)*3.2)] sm:text-[calc(var(--u)*4.6)] lg:text-[calc(var(--u)*5.4)] tracking-tight text-cream uppercase leading-[0.9] select-none">
            MAKE YOUR WEBSITE <span className="text-lime drop-shadow-[0_0_35px_rgba(203,255,0,0.4)]">LIGHTER.</span> PROVE THE IMPROVEMENT.
          </h1>

          <p className="text-base sm:text-lg text-[var(--ink-soft)] max-w-xl leading-relaxed">
            Find avoidable downloads, review a practical fix, verify the same user journey uses less data, and protect the improvement in your next release.
          </p>

          {/* Primary CTA & Secondary Demo CTA */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href="#scanner-form"
              className="interactive inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-lime text-black font-mono font-bold text-xs tracking-wider hover:bg-lime/90 transition-all shadow-[0_0_20px_rgba(203,255,0,0.4)] hover:scale-105"
            >
              <Zap className="w-4 h-4 text-black" />
              AUDIT A WEBSITE ↓
            </a>
            <Link
              href="/savings-lab?projectId=campus-events&demo=true"
              className="interactive inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-surface-border text-xs font-mono text-sage/80 hover:text-cream hover:border-lime/40 transition-all"
            >
              <Sliders className="w-3.5 h-3.5 text-lime" />
              Try the Savings Lab demo →
            </Link>
          </div>

          {/* URL Audit Scanner Form */}
          <div id="scanner-form" className="pt-2">
            <form
              onSubmit={handleAuditSubmit}
              className="tech-frame gradient-border beautiful-md flex flex-col sm:flex-row gap-3 items-center glass-panel-elevated p-2 sm:p-2.5 rounded-2xl sm:rounded-full border border-lime/40 shadow-[0_10px_30px_rgba(203,255,0,0.15)] focus-within:border-lime transition-all"
            >
              <div className="w-full flex-1">
                <Input
                  icon={<Zap className="w-5 h-5 text-lime" />}
                  value={targetUrl}
                  onChange={(e) => {
                    setTargetUrl(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Enter public website URL — e.g. stripe.com"
                  className="bg-transparent border-none text-cream placeholder:text-sage/40 font-mono"
                  disabled={auditStatus === "running"}
                />
              </div>
              <Button
                type="submit"
                variant="lime"
                size="md"
                isLoading={auditStatus === "running"}
                className="w-full sm:w-auto shrink-0 font-bold tracking-wider shadow-[0_0_20px_rgba(203,255,0,0.3)] hover:scale-105 transition-transform"
              >
                <Zap className="w-4 h-4 mr-1.5" />
                {auditStatus === "running" ? "AUDITING..." : "AUDIT A WEBSITE"}
              </Button>
            </form>

            {/* Error Message Banner */}
            {errorMessage && (
              <div className="mt-3 p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs font-mono flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">{errorCode || "AUDIT ERROR"}</div>
                  <div>{errorMessage}</div>
                </div>
              </div>
            )}

            {/* Benchmark Presets (Real Triggers — No Precomputed Numbers) */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="text-[11px] font-mono text-sage/60 uppercase tracking-wider">
                Run Real Scan On:
              </span>
              {BENCHMARK_PRESETS.map((site) => (
                <button
                  key={site.url}
                  onClick={() => {
                    setTargetUrl(site.url);
                    runAudit(site.url);
                  }}
                  disabled={auditStatus === "running"}
                  className="interactive text-[11px] font-mono px-3.5 py-1 rounded-full bg-surface-elevated/80 border border-surface-border text-cream hover:text-lime hover:border-lime/50 hover:shadow-[0_0_15px_rgba(203,255,0,0.2)] transition-all cursor-pointer select-none"
                >
                  {site.label} ↗
                </button>
              ))}
            </div>

            {/* Live Progress Feedback with Abort Controller Trigger */}
            <AnimatePresence>
              {auditStatus === "running" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  role="status"
                  aria-live="polite"
                  className="mt-4 p-4 rounded-xl glass-panel border border-lime/30 font-mono text-xs text-lime space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-lime animate-ping" />
                      {currentPhase}
                    </span>
                    <button
                      type="button"
                      onClick={cancelAudit}
                      className="px-2.5 py-1 rounded-md bg-red-950/60 border border-red-500/40 text-red-300 hover:bg-red-900/70 hover:text-white transition-colors flex items-center gap-1 text-[11px] font-mono cursor-pointer"
                      title="Abort active audit request"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Cancel Audit
                    </button>
                  </div>
                  <div className="w-full bg-black/50 h-1.5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-lime"
                      initial={{ width: "20%" }}
                      animate={{ width: "85%" }}
                      transition={{ duration: 5, ease: "linear" }}
                    />
                  </div>
                  <p className="text-[10px] text-sage/60">
                    Executing dual-source cross-validation across Google PageSpeed Insights & independent Cheerio DOM crawler.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Secondary Action CTA: Developer API & Code Snippets */}
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <a
                href="#api-explorer"
                className="interactive inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl glass-panel border border-surface-border hover:border-lime/40 text-xs font-mono text-sage/80 hover:text-cream transition-all"
              >
                <Terminal className="w-3.5 h-3.5 text-lime" />
                <span>Explore Live Developer API & Code Export</span>
                <ArrowRight className="w-3 h-3 text-lime" />
              </a>
            </div>
          </div>

          {/* Privacy & Methodology Footer Notice */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-sage/70 pt-2 border-t border-surface-border/40">
            <span className="flex items-center gap-1.5 text-cream/90">
              <ShieldCheck className="w-3.5 h-3.5 text-lime" />
              SSRF Protected • Public HTTP/S Only
            </span>
            <button
              onClick={() => setShowMethodologyModal(true)}
              className="hover:text-lime underline cursor-pointer"
            >
              Methodology & Transparency Rules
            </button>
          </div>
        </div>

        {/* Right Column: 3D Earth Globe (Shows real country marker when audited) */}
        <div className="flex-1 w-full h-[460px] sm:h-[540px] lg:h-[620px] relative flex items-center justify-center lg:-mt-16 xl:-mt-24">
          <div className="absolute inset-0 bg-radial-gradient from-lime/10 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />
          <CarbonGlobe3D
            activeRegion={auditData?.hosting_country_code || auditData?.hosting_country}
            gridIntensity={auditData?.grid_intensity_val || 494}
            isGreen={auditData?.hosting.green || false}
            hasAuditedTarget={Boolean(auditData)}
            className="w-full h-full"
          />
        </div>
      </section>

      {/* ==========================================================================
           AUDIT COCKPIT: Only renders when a real audit has completed
           ========================================================================== */}
      <section ref={cockpitRef} className="space-y-8 scroll-mt-28">
        {auditStatus === "completed" && auditData ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-surface-border/60 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-lime uppercase tracking-wider mb-1">
                  <Sparkles className="w-3.5 h-3.5" /> Real Telemetry Audit Result
                </div>
                <h2 className="font-display text-4xl sm:text-5xl text-cream tracking-tight uppercase">
                  {auditData.domain}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-sage/70 mt-1">
                  <span>Audited: {new Date(auditData.calculated_at).toLocaleTimeString()}</span>
                  <span>•</span>
                  <span>Model: {auditData.methodology_version}</span>
                  <span>•</span>
                  <span className="text-lime font-bold">
                    {auditData.cross_validation
                      ? `Dual-Source Concordance (${auditData.cross_validation.discrepancy_pct}% Variance)`
                      : auditData.record?.sources && auditData.record.sources.length > 0
                      ? auditData.record.sources[0].provider
                      : "Single Source Crawl"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowMethodologyModal(true)}
                  className="px-3.5 py-1.5 rounded-full glass-panel border border-surface-border text-xs font-mono text-sage/80 hover:text-lime hover:border-lime/40 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Scale className="w-3.5 h-3.5 text-lime" /> Methodology Cited
                </button>
                <Link
                  href="/simulator"
                  className="px-3.5 py-1.5 rounded-full bg-lime text-black font-mono font-bold text-xs hover:bg-lime/90 transition-transform hover:scale-105 flex items-center gap-1.5"
                >
                  <Sliders className="w-3.5 h-3.5" /> Simulate Real Levers →
                </Link>
              </div>
            </div>

            {/* Top Evidenced Opportunity Banner (tech-green-dark-mode-modern & beautiful-md) */}
            <div className="tech-frame gradient-border-emerald beautiful-md p-5 rounded-2xl bg-gradient-to-r from-forest/40 via-surface-elevated to-forest/20 border border-lime/40 shadow-[0_4px_25px_rgba(203,255,0,0.12)] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-lime text-black">
                    TOP EVIDENCED OPPORTUNITY
                  </span>
                  <span className="text-xs font-mono text-sage/70">
                    Observed Transfer Hotspot
                  </span>
                </div>
                <div className="text-cream font-bold text-lg">
                  {auditData.hotspots && auditData.hotspots.length > 0
                    ? auditData.hotspots[0].title
                    : "Payload Transfer Within Typical Thresholds"}
                </div>
                <p className="text-xs text-sage/80 max-w-2xl">
                  {auditData.hotspots && auditData.hotspots.length > 0
                    ? auditData.hotspots[0].desc
                    : "Site transfers minimal uncompressed bytes. Establish a regression Shield budget to protect this state."}
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                {auditData.hotspots && auditData.hotspots.length > 0 ? (
                  <Link
                    href={`/savings-lab?auditId=${auditData.id}&targetUrl=${encodeURIComponent(auditData.target_url)}&hotspot=${encodeURIComponent(auditData.hotspots[0].title)}`}
                    className="px-4 py-2.5 rounded-full bg-lime text-black font-mono font-bold text-xs hover:bg-lime/90 transition-all hover:scale-105 shadow-[0_0_15px_rgba(203,255,0,0.3)] flex items-center gap-2"
                  >
                    START IMPROVEMENT EXPERIMENT →
                  </Link>
                ) : (
                  <Link
                    href="/shield"
                    className="px-4 py-2.5 rounded-full bg-lime text-black font-mono font-bold text-xs hover:bg-lime/90 transition-all hover:scale-105 flex items-center gap-2"
                  >
                    SET A SHIELD BUDGET →
                  </Link>
                )}
              </div>
            </div>

            {/* 3D Grid: Hologram Chamber (Left) + Exploded Payload & Host Telemetry (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: 3D Holographic EcoScore Chamber */}
              <div className="lg:col-span-4">
                <TiltCard3D maxTilt={10} scale={1.02}>
                  <HologramGauge3D
                    score={auditData.eco_score}
                    co2Grams={displayedCo2 !== null ? displayedCo2 : auditData.co2_grams}
                    rangeLow={auditData.range_low_g}
                    rangeHigh={auditData.range_high_g}
                    confidence={auditData.confidence}
                    confidenceNote={auditData.confidence_note}
                    discrepancyPct={auditData.cross_validation?.discrepancy_pct}
                    onOpenMethodology={() => setShowMethodologyModal(true)}
                  />
                </TiltCard3D>
              </div>

              {/* Right Column: 3D Exploded Payload & Datacenter Grid Cards */}
              <div className="lg:col-span-8 space-y-6">
                {/* 3D Datacenter Grid Telemetry Banner */}
                <TiltCard3D maxTilt={8}>
                  <Card className="tech-frame gradient-border beautiful-md p-5 glass-panel-elevated border border-lime/30">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="p-2.5 rounded-xl bg-lime/10 border border-lime/30 text-lime mt-0.5">
                          <Server className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-mono text-sage/70 uppercase">
                            Regional Grid Carbon Intensity (IP Geolocation Proxy)
                          </div>
                          <div className="font-mono text-xl font-bold text-cream flex items-center gap-2">
                            {auditData.grid_intensity_val}{" "}
                            <span className="text-xs text-sage/60 font-normal">gCO2e/kWh</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-surface-elevated border border-surface-border text-cream">
                              {auditData.hosting_country || "Resolved Region"}
                            </span>
                          </div>
                          <p className="text-xs text-sage/70 mt-1">
                            Source:{" "}
                            {auditData.grid_intensity_source === "resolved_regional"
                              ? "The Green Web Foundation IP Telemetry (Ember 2023 grid factors; geographic proxy)"
                              : "Global Reference Datacenter Baseline (494 gCO2e/kWh)"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-start sm:items-end gap-1.5">
                        <Badge
                          variant={auditData.hosting.green ? "lime" : "outline"}
                          className="font-mono text-xs font-bold"
                        >
                          {auditData.hosting.green ? "GREEN HOST DATASET MATCH" : "STANDARD GRID PROXY"}
                        </Badge>
                        <span className="text-[11px] font-mono text-sage/60">
                          {auditData.hosting.provider || "Hosting dataset record not verified green"}
                        </span>
                      </div>
                    </div>
                  </Card>
                </TiltCard3D>

                {/* Transfer Payload Breakdown Visualizer */}
                <TiltCard3D maxTilt={6}>
                  <Card className="tech-frame gradient-border beautiful-md p-6 glass-panel-elevated">
                    <PayloadBreakdown
                      totalBytes={auditData.total_bytes}
                      totalMb={auditData.metrics.payload_mb}
                      breakdown={auditData.breakdown}
                    />
                  </Card>
                </TiltCard3D>

                {/* Interactive 3D Sensitivity Chamber Slider */}
                <TiltCard3D maxTilt={6}>
                  <Card className="tech-frame gradient-border beautiful-md p-5 glass-panel-elevated space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-mono text-lime font-bold">
                        <Sliders className="w-4 h-4" /> MODEL SENSITIVITY ASSUMPTION (±20% CACHE VARIANCE)
                      </div>
                      <span className="font-mono text-xs text-cream font-bold">
                        {sensitivityVariance > 0 ? `+${sensitivityVariance}%` : `${sensitivityVariance}%`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-20"
                      max="20"
                      step="5"
                      value={sensitivityVariance}
                      onChange={(e) => setSensitivityVariance(Number(e.target.value))}
                      className="w-full accent-lime bg-surface-elevated h-2 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] font-mono text-sage/60">
                      <span>-20% (Aggressive Repeat Cache)</span>
                      <span>0% (Baseline Visit)</span>
                      <span>+20% (Cold First-Time Load)</span>
                    </div>
                    <p className="text-[10px] font-mono text-sage/60">
                      Attributional model sensitivity scenario. This explores SWDM caching bounds; it is not a statistically validated confidence interval.
                    </p>
                  </Card>
                </TiltCard3D>
              </div>
            </div>

            {/* Hotspot Recommendations Section */}
            {auditData.hotspots && auditData.hotspots.length > 0 && (
              <div className="space-y-4 pt-4">
                <h3 className="font-display text-2xl text-cream uppercase flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-lime" /> Detected Carbon Hotspots (Observed Evidence)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {auditData.hotspots.map((h, i) => (
                    <HotspotCard key={i} index={i} hotspot={h} />
                  ))}
                </div>
              </div>
            )}

            {/* Explainability & Data Provenance Panel (PAIR / IBM Carbon Framework) */}
            <div className="pt-6">
              <ExplainabilityPanel
                auditData={auditData}
                onRerun={() => runAudit(targetUrl)}
              />
            </div>
          </>
        ) : (
          /* Clean Empty Workspace State (No Fake Data) */
          <div className="p-12 text-center rounded-3xl glass-panel-elevated border border-surface-border space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-surface-elevated border border-surface-border text-lime flex items-center justify-center mx-auto">
              <Zap className="w-7 h-7" />
            </div>
            <h3 className="font-display text-3xl text-cream uppercase tracking-wide">
              No Audit Executed Yet
            </h3>
            <p className="text-sm text-sage/75 max-w-lg mx-auto">
              Enter any public website URL above (or select a preset chip) to trigger the live dual-source accuracy engine. Measurements, breakdown, and sensitivity bounds will appear here.
            </p>
          </div>
        )}
      </section>

      {/* ==========================================================================
           3D FEATURE MATRIX: Staggered GSAP ScrollTrigger Section
           ========================================================================== */}
      <section ref={featuresRef} className="space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-panel text-xs font-mono text-lime border border-lime/30">
            <Cpu className="w-3.5 h-3.5" /> EXECUTIVE CAPABILITY SUITE
          </div>
          <h2 className="font-display text-4xl sm:text-5xl text-cream uppercase tracking-tight">
            Complete Digital Sustainability Arsenal
          </h2>
          <p className="text-sm sm:text-base text-sage/80">
            From single-URL dual-source cross-validation to fleet telemetry, what-if modeling, and CI/CD regression protection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Fleet Dashboard */}
          <div className="feature-card-3d">
            <TiltCard3D maxTilt={12} className="h-full">
              <Card className="tech-frame gradient-border beautiful-md interactive p-6 glass-panel-elevated h-full flex flex-col justify-between hover:border-lime/50 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-lime/10 border border-lime/30 text-lime flex items-center justify-center">
                      <Globe className="w-5 h-5" />
                    </div>
                    <span className="number-detail">
                      01
                    </span>
                  </div>
                  <h3 className="font-display text-xl text-cream uppercase">Fleet Telemetry</h3>
                  <div className="space-y-2 text-xs text-sage/80 leading-relaxed font-sans">
                    <p>
                      <strong className="text-cream font-mono text-[11px] block text-lime/90 uppercase">Problem:</strong>
                      Multi-property sprawl without auditable baselines or green-hosting verification.
                    </p>
                    <p>
                      <strong className="text-cream font-mono text-[11px] block text-lime/90 uppercase">Interaction:</strong>
                      Domain portfolio batch ingestion, real-time filtering, and full CSV exports.
                    </p>
                    <p>
                      <strong className="text-cream font-mono text-[11px] block text-lime/90 uppercase">Observable Result:</strong>
                      Verifiable organization-wide eco-score distribution and carbon budgets.
                    </p>
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  className="interactive mt-6 inline-flex items-center gap-1.5 text-xs font-mono text-lime font-semibold hover:underline"
                >
                  Manage Fleet →
                </Link>
              </Card>
            </TiltCard3D>
          </div>

          {/* Card 2: What-If Simulator */}
          <div className="feature-card-3d">
            <TiltCard3D maxTilt={12} className="h-full">
              <Card className="tech-frame gradient-border beautiful-md interactive p-6 glass-panel-elevated h-full flex flex-col justify-between hover:border-lime/50 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-lime/10 border border-lime/30 text-lime flex items-center justify-center">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <span className="number-detail">
                      02
                    </span>
                  </div>
                  <h3 className="font-display text-xl text-cream uppercase">What-If Simulator</h3>
                  <div className="space-y-2 text-xs text-sage/80 leading-relaxed font-sans">
                    <p>
                      <strong className="text-cream font-mono text-[11px] block text-lime/90 uppercase">Problem:</strong>
                      Engineering commits blind to payload regressions and carbon footprint spikes.
                    </p>
                    <p>
                      <strong className="text-cream font-mono text-[11px] block text-lime/90 uppercase">Interaction:</strong>
                      Interactive levers for image transcoding, script tree-shaking, and CDN caching.
                    </p>
                    <p>
                      <strong className="text-cream font-mono text-[11px] block text-lime/90 uppercase">Observable Result:</strong>
                      Real-time grams CO2e delta and projected annual offset kilograms.
                    </p>
                  </div>
                </div>
                <Link
                  href="/simulator"
                  className="interactive mt-6 inline-flex items-center gap-1.5 text-xs font-mono text-lime font-semibold hover:underline"
                >
                  Simulate Levers →
                </Link>
              </Card>
            </TiltCard3D>
          </div>

          {/* Card 3: Emissions Forecasting */}
          <div className="feature-card-3d">
            <TiltCard3D maxTilt={12} className="h-full">
              <Card className="tech-frame gradient-border beautiful-md interactive p-6 glass-panel-elevated h-full flex flex-col justify-between hover:border-lime/50 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-lime/10 border border-lime/30 text-lime flex items-center justify-center">
                      <Activity className="w-5 h-5" />
                    </div>
                    <span className="number-detail">
                      03
                    </span>
                  </div>
                  <h3 className="font-display text-xl text-cream uppercase">Emissions Forecasts</h3>
                  <div className="space-y-2 text-xs text-sage/80 leading-relaxed font-sans">
                    <p>
                      <strong className="text-cream font-mono text-[11px] block text-lime/90 uppercase">Problem:</strong>
                      Sustainability reports rely on static guesses rather than dynamic multi-year paths.
                    </p>
                    <p>
                      <strong className="text-cream font-mono text-[11px] block text-lime/90 uppercase">Interaction:</strong>
                      Traffic scaling models blended with real grid decarbonization trajectories.
                    </p>
                    <p>
                      <strong className="text-cream font-mono text-[11px] block text-lime/90 uppercase">Observable Result:</strong>
                      Forward-looking emission bands with auditable confidence intervals.
                    </p>
                  </div>
                </div>
                <Link
                  href="/forecasts"
                  className="interactive mt-6 inline-flex items-center gap-1.5 text-xs font-mono text-lime font-semibold hover:underline"
                >
                  View Forecasts →
                </Link>
              </Card>
            </TiltCard3D>
          </div>

          {/* Card 4: Regression Shield */}
          <div className="feature-card-3d">
            <TiltCard3D maxTilt={12} className="h-full">
              <Card className="tech-frame gradient-border beautiful-md interactive p-6 glass-panel-elevated h-full flex flex-col justify-between hover:border-lime/50 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-lime/10 border border-lime/30 text-lime flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <span className="number-detail">
                      04
                    </span>
                  </div>
                  <h3 className="font-display text-xl text-cream uppercase">Regression Shield</h3>
                  <div className="space-y-2 text-xs text-sage/80 leading-relaxed font-sans">
                    <p>
                      <strong className="text-cream font-mono text-[11px] block text-lime/90 uppercase">Problem:</strong>
                      Asset bloat silently slips past manual code review into production branches.
                    </p>
                    <p>
                      <strong className="text-cream font-mono text-[11px] block text-lime/90 uppercase">Interaction:</strong>
                      Automated GitHub Actions workflow generation tailored to domain limits.
                    </p>
                    <p>
                      <strong className="text-cream font-mono text-[11px] block text-lime/90 uppercase">Observable Result:</strong>
                      Strict PR checks enforcing maximum byte weight and carbon budgets.
                    </p>
                  </div>
                </div>
                <Link
                  href="/shield"
                  className="interactive mt-6 inline-flex items-center gap-1.5 text-xs font-mono text-lime font-semibold hover:underline"
                >
                  Inspect Shield →
                </Link>
              </Card>
            </TiltCard3D>
          </div>
        </div>
      </section>

      {/* ==========================================================================
           INTERACTIVE DEVELOPER API EXPLORER (Live Sandbox + Multi-Language Snippets)
           ========================================================================== */}
      <section id="api-explorer" className="space-y-8 pt-10 scroll-mt-24">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-panel text-xs font-mono text-lime border border-lime/30">
            <Terminal className="w-3.5 h-3.5" /> LIVE INTERACTION SURFACE
          </div>
          <h2 className="font-display text-4xl sm:text-5xl text-cream uppercase tracking-tight">
            Developer Telemetry API
          </h2>
          <p className="text-sm sm:text-base text-sage/80">
            Test real endpoints directly against the production server. Inspect response latency, status codes, and copy production-ready code snippets.
          </p>
        </div>
        <ApiExplorer />
      </section>

      {/* ==========================================================================
           METHODOLOGY MODAL (Full Provenance & Caveats)
           ========================================================================== */}
      <AnimatePresence>
        {showMethodologyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl max-h-[85vh] overflow-y-auto glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-lime/40 shadow-[0_20px_60px_rgba(0,0,0,0.8)] space-y-6"
            >
              <div className="flex items-center justify-between border-b border-surface-border/60 pb-4">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-lime" />
                  <h3 className="font-display text-2xl text-cream uppercase">
                    Carbonerra Methodology & Accuracy Design
                  </h3>
                </div>
                <button
                  onClick={() => setShowMethodologyModal(false)}
                  className="p-1 rounded-full text-sage/60 hover:text-cream cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-sage/85 leading-relaxed font-sans">
                <p className="italic text-sage/70">
                  {CARBONERRA_CONFIG.terminology.disclaimer}
                </p>

                <div className="p-4 rounded-xl bg-surface-elevated/70 border border-surface-border space-y-2">
                  <h4 className="font-mono font-bold text-lime text-xs uppercase">
                    1. Reference Implementation ({CARBONERRA_CONFIG.referenceStandard})
                  </h4>
                  <p className="text-xs">
                    Calculations utilize the official Sustainable Web Design Model (SWDM v4) reference library (`@tgwf/co2`), eliminating formula transcription errors. Segment operational emissions ({CARBONERRA_CONFIG.operationalKwhPerByte} kWh/byte) and embodied hardware manufacturing footprint ({CARBONERRA_CONFIG.embodiedKwhPerByte} kWh/byte) are individually accounted for.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface-elevated/70 border border-surface-border space-y-2">
                  <h4 className="font-mono font-bold text-lime text-xs uppercase">
                    2. Dual-Source Cross-Validation
                  </h4>
                  <p className="text-xs">
                    Transfer byte volume is validated from two independent sources: Google PageSpeed Insights v5 (Lighthouse synthetic browser execution) and an independent Cheerio DOM crawler with concurrent HTTP HEAD probes. Discrepancies within {CARBONERRA_CONFIG.sourceAgreementThresholdPct}% receive high confidence tags.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface-elevated/70 border border-surface-border space-y-2">
                  <h4 className="font-mono font-bold text-lime text-xs uppercase">
                    3. Real Datacenter Grid Intensity
                  </h4>
                  <p className="text-xs">
                    Target host domain is resolved to its hosting IP via safe DNS resolution and looked up against The Green Web Foundation regional grid API, replacing flat global averages with real location-specific carbon intensity.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface-elevated/70 border border-surface-border space-y-2">
                  <h4 className="font-mono font-bold text-lime text-xs uppercase">
                    4. Sensitivity Banding (±20%)
                  </h4>
                  <p className="text-xs">
                    Instead of a false-precision point estimate, Carbonerra reports a verified sensitivity range (range_low_g to range_high_g) modeling caching and repeat-visit variance.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface-elevated/70 border border-surface-border space-y-2">
                  <h4 className="font-mono font-bold text-lime text-xs uppercase">
                    5. Known Methodological Limitations
                  </h4>
                  <ul className="text-xs list-disc list-inside space-y-1 text-sage/75">
                    {CARBONERRA_CONFIG.standardLimitations.map((lim, idx) => (
                      <li key={idx}>{lim}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  variant="lime"
                  size="sm"
                  onClick={() => setShowMethodologyModal(false)}
                  className="font-bold font-mono"
                >
                  CLOSE METHODOLOGY
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LandingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center text-lime font-mono text-sm">
          Loading Audit Workspace...
        </div>
      }
    >
      <LandingPageContent />
    </Suspense>
  );
}
