"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Modal } from "@/components/ui/modal";
import { SectionHeading, Reveal } from "@/components/ui/page";


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
import { SylvaHero } from "@/components/landing/sylva-hero";
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

  const reducedMotion = useReducedMotion();

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
        cockpitRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
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
    <div className="w-full">
      {/* ==========================================================================
           SYLVA LIVING WORLD HERO: 100% Exact Reference UI + Live Audit Integration
           ========================================================================== */}
      <SylvaHero
        onRunAudit={runAudit}
        auditStatus={auditStatus}
        currentPhase={currentPhase}
        errorMessage={errorMessage}
        targetUrl={targetUrl}
        setTargetUrl={setTargetUrl}
      />

      {/* Main Container below full-width hero */}
      <div className="ct-home-content">
        {/* ==========================================================================
             AUDIT COCKPIT: Only renders when a real audit has completed
             ========================================================================== */}
        <section id="cockpit" ref={cockpitRef} className="space-y-8 scroll-mt-28">
          {auditStatus === "completed" && auditData ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-surface-border/60 pb-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-lime uppercase tracking-wider mb-1">
                    <Sparkles className="w-3.5 h-3.5" /> Real Telemetry Audit Result
                </div>
                <h2 className="font-display text-4xl sm:text-5xl text-cream tracking-tight ">
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

            {/* Top Evidenced Opportunity Banner (tech-green-dark-mode-modern & ) */}
            <div className=" -emerald  p-5 rounded-2xl bg-gradient-to-r from-forest/40 via-surface-elevated to-forest/20 border border-lime/40 shadow-[0_4px_25px_rgba(203,255,0,0.12)] flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                <div className="min-w-0">
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
                </div>
              </div>

              {/* Right Column: 3D Exploded Payload & Datacenter Grid Cards */}
              <div className="lg:col-span-8 space-y-6">
                {/* 3D Datacenter Grid Telemetry Banner + Interactive Globe */}
                <div className="min-w-0">
                  <Card className="   p-5 glass-panel-elevated border border-lime/30">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                      <div className="md:col-span-7 space-y-3">
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

                        <div className="flex items-center gap-2 pt-1">
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

                      {/* 3D Earth Globe: focuses active datacenter region upon audit */}
                      <div className="md:col-span-5 h-[190px] relative flex items-center justify-center">
                        <CarbonGlobe3D
                          activeRegion={auditData?.hosting_country_code || auditData?.hosting_country}
                          gridIntensity={auditData?.grid_intensity_val || 494}
                          isGreen={auditData?.hosting.green || false}
                          hasAuditedTarget={true}
                          className="w-full h-full"
                        />
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Transfer Payload Breakdown Visualizer */}
                <div className="min-w-0">
                  <Card className="   p-6 glass-panel-elevated">
                    <PayloadBreakdown
                      totalBytes={auditData.total_bytes}
                      totalMb={auditData.metrics.payload_mb}
                      breakdown={auditData.breakdown}
                    />
                  </Card>
                </div>

                {/* Interactive 3D Sensitivity Chamber Slider */}
                <div className="min-w-0">
                  <Card className="   p-5 glass-panel-elevated space-y-3">
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
                      aria-label="Model sensitivity cache variance"
                      aria-valuetext={`${sensitivityVariance}% cache variance`}
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
                </div>
              </div>
            </div>

            {/* Hotspot Recommendations Section */}
            {auditData.hotspots && auditData.hotspots.length > 0 && (
              <div className="space-y-4 pt-4">
                <h3 className="font-display text-2xl text-cream  flex items-center gap-2">
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
        ) : auditStatus === "running" ? (
          /* Live Dual-Source Auditing State */
          <div className="p-12 text-center rounded-3xl glass-panel-elevated border border-lime/40 space-y-6 relative overflow-hidden shadow-[0_0_50px_rgba(203,255,0,0.15)]">
            <div className="absolute inset-0 bg-radial-gradient from-lime/10 via-transparent to-transparent animate-pulse pointer-events-none" />
            <div className="w-16 h-16 rounded-3xl bg-lime/10 border border-lime/40 text-lime flex items-center justify-center mx-auto relative">
              <RefreshCw className="w-8 h-8 animate-spin text-lime" />
              <div className="absolute inset-0 rounded-3xl border border-lime animate-ping opacity-25" />
            </div>
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-lime/10 border border-lime/30 text-[11px] font-mono text-lime font-bold uppercase tracking-wider">
                SWDM v4 Telemetry Engine Active
              </span>
              <h3 className="font-display text-3xl sm:text-4xl text-cream  tracking-tight">
                Auditing {targetUrl || "Target Host"}
              </h3>
              <p className="text-sm font-mono text-lime max-w-lg mx-auto flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
                {currentPhase || "Running cross-validation crawl..."}
              </p>
            </div>
            <div className="w-full max-w-md mx-auto bg-surface-elevated rounded-full h-2 overflow-hidden border border-surface-border">
              <div className="bg-lime h-full rounded-full animate-[pulse_1.5s_ease-in-out_infinite] w-3/4 shadow-[0_0_10px_#cbff00]" />
            </div>
          </div>
        ) : (
          /* Clean Empty Workspace State with Quick-Scan Launchers */
          <div className="p-10 sm:p-14 text-center rounded-3xl glass-panel-elevated border border-surface-border space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-lime/10 border border-lime/30 text-lime flex items-center justify-center mx-auto">
              <Zap className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display text-3xl sm:text-4xl text-cream  tracking-tight">
                Your audit workspace is ready
              </h3>
              <p className="text-sm text-sage/75 max-w-lg mx-auto">
                Enter any public website URL in the hero dock above to trigger the live dual-source accuracy engine. Or launch an instant benchmark scan below:
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {BENCHMARK_PRESETS.map((p) => (
                <button
                  key={p.url}
                  onClick={() => {
                    setTargetUrl(p.url);
                    if (typeof (window as any).__triggerSylvaScan === "function") {
                      (window as any).__triggerSylvaScan();
                    }
                    runAudit(p.url);
                  }}
                  className="px-4 py-2 rounded-full glass-panel border border-surface-border hover:border-lime/50 text-xs font-mono text-cream hover:text-lime transition-all hover:scale-105 flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Sparkles className="w-3 h-3 text-lime" />
                  <span>Audit {p.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ==========================================================================
           3D FEATURE MATRIX: Staggered GSAP ScrollTrigger Section
           ========================================================================== */}
      <section ref={featuresRef} className="space-y-8">
        <SectionHeading eyebrow="Explore CarbonTerra" title="A lighter web. A clearer picture."
          description="From a single website to your entire fleet. Measure impact, explore improvements, and protect the progress you make." />
        <div className="ct-home-capabilities">
          {[
            { icon: Globe, title: "Fleet telemetry", href: "/dashboard", action: "Manage your fleet", copy: "Manage domain portfolios with saved audit baselines, green-hosting verification, real-time filtering, and CSV exports." },
            { icon: Sliders, title: "What-if simulator", href: "/simulator", action: "Explore the levers", copy: "Model image transcoding, script tree-shaking, and CDN caching. Compare grams of CO₂e and projected annual savings before you commit." },
            { icon: TrendingDown, title: "Emissions forecasts", href: "/forecasts", action: "View scenarios", copy: "Explore traffic growth and grid decarbonization assumptions through forward-looking emission paths. Scenarios remain distinct from measured outcomes." },
            { icon: ShieldCheck, title: "Regression Shield", href: "/shield", action: "Set a release budget", copy: "Evaluate byte and carbon budgets, inspect breaches, and generate a GitHub Actions workflow to protect your improvements." },
          ].map(({icon: Icon, title, href, action, copy}) => <Reveal key={href} className="ct-capability">
            <Icon size={25} strokeWidth={1.5} aria-hidden="true" /><h3>{title}</h3><p>{copy}</p>
            <Link href={href}>{action}<ArrowRight size={17} className="ml-2" aria-hidden="true" /></Link>
          </Reveal>)}
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
          <h2 className="font-display text-4xl sm:text-5xl text-cream  tracking-tight">
            Developer telemetry API
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
      <Modal isOpen={showMethodologyModal} onClose={() => setShowMethodologyModal(false)} title="Methodology & accuracy">
<div className="space-y-4 text-xs sm:text-sm text-sage/85 leading-relaxed font-sans">
                <p className="italic text-sage/70">
                  {CARBONERRA_CONFIG.terminology.disclaimer}
                </p>

                <div className="p-4 rounded-xl bg-surface-elevated/70 border border-surface-border space-y-2">
                  <h4 className="font-mono font-bold text-lime text-xs ">
                    1. Reference Implementation ({CARBONERRA_CONFIG.referenceStandard})
                  </h4>
                  <p className="text-xs">
                    Calculations utilize the official Sustainable Web Design Model (SWDM v4) reference library (`@tgwf/co2`), eliminating formula transcription errors. Segment operational emissions ({CARBONERRA_CONFIG.operationalKwhPerByte} kWh/byte) and embodied hardware manufacturing footprint ({CARBONERRA_CONFIG.embodiedKwhPerByte} kWh/byte) are individually accounted for.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface-elevated/70 border border-surface-border space-y-2">
                  <h4 className="font-mono font-bold text-lime text-xs ">
                    2. Dual-Source Cross-Validation
                  </h4>
                  <p className="text-xs">
                    Transfer byte volume is validated from two independent sources: Google PageSpeed Insights v5 (Lighthouse synthetic browser execution) and an independent Cheerio DOM crawler with concurrent HTTP HEAD probes. Discrepancies within {CARBONERRA_CONFIG.sourceAgreementThresholdPct}% receive high confidence tags.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface-elevated/70 border border-surface-border space-y-2">
                  <h4 className="font-mono font-bold text-lime text-xs ">
                    3. Real Datacenter Grid Intensity
                  </h4>
                  <p className="text-xs">
                    Target host domain is resolved to its hosting IP via safe DNS resolution and looked up against The Green Web Foundation regional grid API, replacing flat global averages with real location-specific carbon intensity.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface-elevated/70 border border-surface-border space-y-2">
                  <h4 className="font-mono font-bold text-lime text-xs ">
                    4. Sensitivity Banding (±20%)
                  </h4>
                  <p className="text-xs">
                    Instead of a false-precision point estimate, Carbonerra reports a verified sensitivity range (range_low_g to range_high_g) modeling caching and repeat-visit variance.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface-elevated/70 border border-surface-border space-y-2">
                  <h4 className="font-mono font-bold text-lime text-xs ">
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
      </Modal>
      </div>
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
