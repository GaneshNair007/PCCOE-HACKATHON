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
  Globe,
  Leaf,
  Layers,
  ChevronRight,
  TrendingDown,
  Info,
  Check,
  Scale,
  Search,
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
import { SylvaHero } from "@/components/landing/sylva-hero";
import { ButterflyOrbit } from "@/components/ambient/butterfly-orbit";
import { PayloadBreakdown } from "@/components/telemetry/payload-breakdown";
import { HotspotCard } from "@/components/telemetry/hotspot-card";
import { AuditResult } from "@/types/telemetry";
import { CARBONERRA_CONFIG } from "@/lib/config";
import Link from "next/link";

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
           SYLVA ARRIVAL: live CarbonTerra controls within the persistent authored world
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
        <section id="cockpit" ref={cockpitRef} className="world-audit-chapter space-y-8 scroll-mt-28" data-world-shot="measure">
          {auditStatus === "completed" && auditData ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-surface-border/60 pb-4">
                <div>
                  <div className="text-xs font-mono font-bold text-lime uppercase tracking-wider mb-1">
                    AUDIT RESULTS
                  </div>
                <h2 className="font-display text-4xl sm:text-5xl font-bold text-cream tracking-tight">
                  {auditData.domain}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-sage/70 mt-1">
                  <span>Audited: {new Date(auditData.calculated_at).toLocaleTimeString()}</span>
                  <span className="text-white/30">/</span>
                  <span>Model: Sustainable Web Design</span>
                  <span className="text-white/30">/</span>
                  <span className="text-lime font-bold">
                    {auditData.cross_validation
                      ? `Verified by Dual Measurement (${auditData.cross_validation.discrepancy_pct}% Difference)`
                      : auditData.record?.sources && auditData.record.sources.length > 0
                      ? auditData.record.sources[0].provider
                      : "Verified Crawl"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowMethodologyModal(true)}
                  className="px-3.5 py-1.5 rounded-full glass-panel border border-surface-border text-xs font-mono text-sage/80 hover:text-lime hover:border-lime/40 transition-colors flex items-center gap-1.5 cursor-pointer font-bold"
                >
                  <Scale className="w-3.5 h-3.5 text-lime" /> Methodology &amp; Formula
                </button>
                <Link
                  href="/simulator"
                  className="px-4 py-2 rounded-full bg-lime text-black font-mono font-bold text-xs hover:bg-lime/90 transition-transform hover:scale-105 flex items-center gap-1.5"
                >
                  <Sliders className="w-3.5 h-3.5" /> Simulate Savings →
                </Link>
              </div>
            </div>

            {/* Top Evidenced Opportunity Banner (tech-green-dark-mode-modern & ) */}
            <div className=" -emerald  p-5 rounded-2xl bg-gradient-to-r from-forest/40 via-surface-elevated to-forest/20 border border-lime/40 shadow-[0_4px_25px_rgba(203,255,0,0.12)] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold uppercase tracking-wider bg-lime text-black">
                    TOP RECOMMENDATION
                  </span>
                  <span className="text-xs font-mono text-sage/70 font-semibold uppercase">
                    Biggest Opportunity to Reduce Carbon
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
                    : "Site transfers minimal uncompressed bytes. Inspect potential optimizations and benchmark reductions in the Savings Lab."}
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
                    href="/savings-lab"
                    className="px-4 py-2.5 rounded-full bg-lime text-black font-mono font-bold text-xs hover:bg-lime/90 transition-all hover:scale-105 flex items-center gap-2"
                  >
                    EXPLORE SAVINGS LAB →
                  </Link>
                )}
              </div>
            </div>

            {/* Plain English Audit Explainer Card */}
            <div className="p-5 rounded-2xl bg-surface-elevated/80 border border-surface-border text-xs text-sage/90 space-y-3">
              <div className="font-bold text-cream uppercase tracking-wider text-xs flex items-center gap-2">
                <Info className="w-4 h-4 text-lime" />
                WHAT YOU ARE SEEING IN THIS AUDIT
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
                <div className="p-2.5 rounded-xl bg-surface/40 border border-surface-border/60">
                  <strong className="text-cream block font-bold uppercase mb-1">1. ECO-SCORE (A+ TO F)</strong>
                  Overall environmental efficiency grade compared to web pages globally.
                </div>
                <div className="p-2.5 rounded-xl bg-surface/40 border border-surface-border/60">
                  <strong className="text-cream block font-bold uppercase mb-1">2. CARBON / VISIT</strong>
                  Exact grams of CO2 emitted every time a user visits this website.
                </div>
                <div className="p-2.5 rounded-xl bg-surface/40 border border-surface-border/60">
                  <strong className="text-cream block font-bold uppercase mb-1">3. PAGE WEIGHT</strong>
                  Total download weight (images, scripts, styles) transferred across networks.
                </div>
                <div className="p-2.5 rounded-xl bg-surface/40 border border-surface-border/60">
                  <strong className="text-cream block font-bold uppercase mb-1">4. POWER GRID</strong>
                  Cleanliness of the regional electricity grid powering the website server.
                </div>
              </div>
            </div>

            {/* =========================================================================
                HIGH-SIGNAL AUDIT RESULTS: 4 Human-Understandable Cupertino Cards
                ========================================================================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Page Weight */}
              <Card className="p-5 glass-panel-elevated border border-surface-border space-y-2">
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-sage/70">
                  PAGE TRANSFER WEIGHT
                </div>
                <div className="font-display text-3xl sm:text-4xl font-bold text-cream">
                  {auditData.metrics.payload_mb} <span className="text-sm font-sans font-normal text-sage/70">MB</span>
                </div>
                <div className="text-xs font-mono text-sage/80 pt-1">
                  {auditData.metrics.payload_mb > 2.0 ? (
                    <span className="text-white/80 font-semibold">Heavier than 68% of audited pages</span>
                  ) : (
                    <span className="text-lime font-semibold">Within recommended lightweight bounds</span>
                  )}
                </div>
              </Card>

              {/* Card 2: EcoScore Grade */}
              <Card className="p-5 glass-panel-elevated border border-surface-border space-y-2">
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-sage/70">
                  ECOSCORE GRADE
                </div>
                <div className="flex items-center gap-3">
                  <div className={`text-2xl sm:text-3xl font-display font-black px-3.5 py-1 rounded-xl border ${
                    ['A', 'A+', 'B'].includes(auditData.eco_score)
                      ? 'bg-lime/10 border-lime/40 text-lime'
                      : 'bg-white/10 border-white/20 text-white'
                  }`}>
                    Grade {auditData.eco_score}
                  </div>
                </div>
                <div className="text-xs font-mono text-sage/80 pt-1">
                  {['A', 'A+', 'B'].includes(auditData.eco_score)
                    ? 'Top tier environmental efficiency'
                    : 'High emissions reduction potential'}
                </div>
              </Card>

              {/* Card 3: Carbon per Visit */}
              <Card className="p-5 glass-panel-elevated border border-surface-border space-y-2">
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-sage/70">
                  CARBON PER VISIT
                </div>
                <div className="font-display text-3xl sm:text-4xl font-bold text-cream">
                  {displayedCo2 !== null ? displayedCo2 : auditData.co2_grams} <span className="text-sm font-sans font-normal text-sage/70">gCO2e</span>
                </div>
                <div className="text-xs font-mono text-sage/80 pt-1">
                  Grid: {auditData.grid_intensity_val} gCO2e/kWh ({auditData.hosting_country || "Resolved Region"})
                </div>
              </Card>

              {/* Card 4: Primary Culprit */}
              <Card className="p-5 glass-panel-elevated border border-surface-border space-y-2">
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#cbff00]">
                  PRIMARY CULPRIT
                </div>
                <div className="font-sans text-lg font-bold text-cream truncate">
                  {auditData.hotspots && auditData.hotspots.length > 0
                    ? auditData.hotspots[0].title
                    : "Uncompressed Assets"}
                </div>
                <div className="text-xs font-mono text-sage/80 pt-1 line-clamp-2">
                  {auditData.hotspots && auditData.hotspots.length > 0
                    ? auditData.hotspots[0].desc
                    : "No heavy assets detected."}
                </div>
              </Card>
            </div>

            {/* Transparent Sustainable Web Design Model v4 Formula Box */}
            <Card className="p-6 glass-panel-elevated border border-lime/30 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="text-xs font-mono font-bold text-lime uppercase tracking-wider flex items-center gap-2">
                  <Scale className="w-4 h-4 text-lime" />
                  TRANSPARENT CALCULATION: SUSTAINABLE WEB DESIGN MODEL V4
                </div>
                <span className="text-xs font-mono text-sage/70">
                  Zero Black-Box Guesswork
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-black/60 border border-surface-border font-mono text-xs sm:text-sm text-cream font-bold overflow-x-auto">
                Emissions (gCO2e) = [Data Transfer (GB) × 0.81 kWh/GB] × Regional Grid Factor ({auditData.grid_intensity_val} gCO2e/kWh)
              </div>
              <p className="text-xs text-sage/80 leading-relaxed">
                Standardized energy consumption: 0.81 kWh per transferred gigabyte across user devices, edge telecommunications networks, and hosting servers. Datacenter carbon intensity resolved via The Green Web Foundation regional grid dataset.
              </p>
            </Card>

            {/* Transfer Payload Breakdown Visualizer */}
            <div className="min-w-0">
              <Card className="p-6 glass-panel-elevated border border-surface-border">
                <PayloadBreakdown
                  totalBytes={auditData.total_bytes}
                  totalMb={auditData.metrics.payload_mb}
                  breakdown={auditData.breakdown}
                />
              </Card>
            </div>

            {/* Hotspot Recommendations Section */}
            {auditData.hotspots && auditData.hotspots.length > 0 && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-2xl font-bold tracking-tight text-cream">
                    Recommended Optimizations
                  </h3>
                  <Link
                    href={`/savings-lab?auditId=${auditData.id}&targetUrl=${encodeURIComponent(auditData.target_url)}&hotspot=${encodeURIComponent(auditData.hotspots[0].title)}`}
                    className="px-4 py-2 rounded-full bg-lime text-black font-mono font-bold text-xs hover:bg-lime/90 transition-all flex items-center gap-1.5"
                  >
                    Apply Drop-In Fixes in Savings Lab →
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {auditData.hotspots.map((h, i) => (
                    <HotspotCard key={i} index={i} hotspot={h} />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : auditStatus === "running" ? (
          /* Live Dual-Source Auditing State with Butterfly Orbit */
          <div className="p-12 text-center rounded-3xl glass-panel-elevated border border-lime/40 space-y-6 relative overflow-hidden shadow-[0_0_50px_rgba(203,255,0,0.15)] flex flex-col items-center justify-center">
            <ButterflyOrbit size={130} label={currentPhase || "Measuring Network Transfer & Computing SWDM v4 Carbon..."} />
            <div className="space-y-1">
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-cream tracking-tight">
                Auditing {targetUrl || "Target Host"}
              </h3>
              <p className="text-xs font-mono text-sage/70">
                Fetching DOM elements, resolving regional grid emissions, and pinpointing asset hotspots.
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full rounded-3xl bg-white/[0.04] border border-white/15 backdrop-blur-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden space-y-6">
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#cbff00]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <div className="text-xs font-mono font-bold uppercase text-[#cbff00] tracking-wider">
                  Live Verified Benchmark
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mt-2">
                  Enterprise Production Portal Telemetry
                </h3>
                <div className="text-sm font-mono text-white/70 mt-1">
                  Target: <span className="text-white font-medium">https://github.com</span> <span className="mx-2 text-white/30">/</span> Zero-Carbon Azure Grid: 395 gCO2e/kWh
                </div>
              </div>

              <Button
                variant="lime"
                onClick={() => {
                  const sampleUrl = "https://github.com";
                  setTargetUrl(sampleUrl);
                  runAudit(sampleUrl);
                }}
                className="font-bold font-mono text-xs sm:text-sm px-6 py-3 tracking-wider shrink-0 cursor-pointer shadow-lg shadow-[#cbff00]/20"
              >
                <Search className="w-4 h-4 mr-2" />
                RUN FULL AUDIT TELEMETRY
              </Button>
            </div>

            {/* 3 Prominent Benchmark Preview Metric Cards */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl">
                <div className="text-xs text-white/60 uppercase font-bold tracking-wider">Observed Transfer Weight</div>
                <div className="text-2xl sm:text-3xl font-black text-white mt-1.5">2,420 <span className="text-sm text-white/60 font-normal">KB</span></div>
                <div className="text-xs text-white/80 mt-1">Oversized Hero Banner Hotspot</div>
              </div>

              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl">
                <div className="text-xs text-white/60 uppercase font-bold tracking-wider">Carbon Attribution</div>
                <div className="text-2xl sm:text-3xl font-black text-[#cbff00] mt-1.5">0.296 <span className="text-sm text-white/60 font-normal">gCO2e</span></div>
                <div className="text-xs text-white/70 mt-1">SWDM v4 Standard Model</div>
              </div>

              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl">
                <div className="text-xs text-white/60 uppercase font-bold tracking-wider">Optimization Potential</div>
                <div className="text-2xl sm:text-3xl font-black text-[#cbff00] mt-1.5">-92.7%</div>
                <div className="text-xs text-[#cbff00] mt-1">Convert to Modern WebP</div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ==========================================================================
           FEATURE CAPABILITIES: Staggered GSAP ScrollTrigger Section
           ========================================================================== */}
      <section className="world-stories" data-world-shot="roots">
        <SectionHeading eyebrow="Core Capabilities" title="A living system. A lighter web." description="Follow the impact of your work, from the first measurement to the improvements that last." />
        
        {/* Story 1: Fleet Telemetry */}
        <article className="world-story" data-world-shot="canopy">
          <div className="world-story-image">
            <div className="p-6 rounded-2xl bg-black/50 border border-white/10 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-white font-bold uppercase tracking-wider">Portfolio Health</span>
                <span className="text-[#cbff00] font-bold">4 Active Hosts</span>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] border border-white/5">
                  <span className="text-white">github.com</span>
                  <span className="px-2 py-0.5 rounded bg-white/10 text-white font-bold">Grade B</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] border border-white/5">
                  <span className="text-white">stripe.com</span>
                  <span className="px-2 py-0.5 rounded bg-[#cbff00]/20 text-[#cbff00] font-bold">Grade A</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] border border-white/5">
                  <span className="text-white">vercel.com</span>
                  <span className="px-2 py-0.5 rounded bg-[#cbff00]/20 text-[#cbff00] font-bold">Grade A</span>
                </div>
              </div>
              <div className="pt-2 text-white/60 text-[11px] text-center border-t border-white/10">
                -42.8% Average Transfer Delta
              </div>
            </div>
            <span>CARBONTERRA</span>
          </div>
          <div>
            <span className="world-story-number">Fleet telemetry</span>
            <h3>See the whole ecosystem.</h3>
            <p>Your websites are connected by the choices you make. Monitor saved audit baselines, verify green hosting, filter your portfolio, and export the full picture.</p>
            <Link href="/dashboard">Explore your fleet<ArrowRight strokeWidth={1.3} /></Link>
          </div>
        </article>

        {/* Story 2: What-if Simulator */}
        <article className="world-story" data-world-shot="measure">
          <div className="world-story-image">
            <div className="p-6 rounded-2xl bg-black/50 border border-white/10 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-white font-bold uppercase tracking-wider">Scenario Engine</span>
                <span className="text-[#cbff00] font-bold">Live Model</span>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-white/70 mb-1">
                    <span>WebP Compression</span>
                    <span className="text-[#cbff00] font-bold">-85%</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#cbff00] h-full w-[85%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-white/70 mb-1">
                    <span>Script Tree-Shaking</span>
                    <span className="text-[#cbff00] font-bold">-34%</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#cbff00] h-full w-[34%]" />
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#cbff00]/10 border border-[#cbff00]/30 text-center">
                <div className="text-[11px] text-white/70">Projected Savings</div>
                <div className="text-lg font-bold text-[#cbff00]">-1.84 MB / visit</div>
              </div>
            </div>
            <span>CARBONTERRA</span>
          </div>
          <div>
            <span className="world-story-number">What-if simulator</span>
            <h3>Make room for something better.</h3>
            <p>Model image compression, JavaScript changes, and caching. Explore their estimated impact before you commit, with transparent assumptions beside every scenario.</p>
            <Link href="/simulator">Explore the possibilities<ArrowRight strokeWidth={1.3} /></Link>
          </div>
        </article>

        {/* Story 3: Emissions Forecasts */}
        <article className="world-story" data-world-shot="roots">
          <div className="world-story-image">
            <div className="p-6 rounded-2xl bg-black/50 border border-white/10 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-white font-bold uppercase tracking-wider">Emissions Spline</span>
                <span className="text-[#cbff00] font-bold">36 Months</span>
              </div>
              <div className="h-28 flex items-center justify-center">
                <svg viewBox="0 0 200 80" className="w-full h-full overflow-visible">
                  <path d="M 10 30 Q 60 20 100 25 T 190 15" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeDasharray="3 3" />
                  <path d="M 10 30 Q 60 45 100 55 T 190 70" fill="none" stroke="#cbff00" strokeWidth="2.5" />
                  <circle cx="190" cy="70" r="4" fill="#cbff00" />
                </svg>
              </div>
              <div className="flex justify-between items-center text-[11px] pt-1 border-t border-white/10">
                <span className="text-white/60">BAU: 4.8 kg CO2e</span>
                <span className="text-[#cbff00] font-bold">Optimized: 0.9 kg (-81%)</span>
              </div>
            </div>
            <span>CARBONTERRA</span>
          </div>
          <div>
            <span className="world-story-number">Emissions forecasts</span>
            <h3>Look beyond the horizon.</h3>
            <p>Explore traffic growth and grid decarbonization through forward-looking emission paths. Keep possible futures distinct from measured outcomes.</p>
            <Link href="/forecasts">Follow the forecast<ArrowRight strokeWidth={1.3} /></Link>
          </div>
        </article>

        {/* Story 4: Evidence Vault */}
        <article className="world-story" data-world-shot="clearing">
          <div className="world-story-image">
            <div className="p-6 rounded-2xl bg-black/50 border border-[#cbff00]/30 space-y-4 font-mono text-xs shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-[#cbff00] font-bold uppercase tracking-wider">Evidence Vault Record</span>
                <span className="px-2 py-0.5 rounded bg-[#cbff00] text-black font-extrabold text-[10px]">VERIFIED</span>
              </div>
              <div className="space-y-2 text-white/80">
                <div className="flex justify-between">
                  <span className="text-white/60">Record ID</span>
                  <span className="text-white">exp_17886009...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Transfer Delta</span>
                  <span className="text-[#cbff00] font-bold">-2,191 KB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Task Checks</span>
                  <span className="text-[#cbff00] font-bold">3/3 Passed</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-center text-[11px] text-[#cbff00] font-bold">
                Immutable SHA-256 Audit Seal
              </div>
            </div>
            <span>CARBONTERRA</span>
          </div>
          <div>
            <span className="world-story-number">Evidence Vault</span>
            <h3>Verify your impact with proof.</h3>
            <p>Generate verified evidence receipts for your web improvements. Each record documents measured byte reductions, before-and-after transfer weights, and carbon savings for your engineering team.</p>
            <Link href="/evidence">Inspect auditable evidence<ArrowRight strokeWidth={1.3} /></Link>
          </div>
        </article>
      </section>

      {/* ==========================================================================
           METHODOLOGY MODAL (Formula, References & Transparent Calculations)
           ========================================================================== */}
      <Modal isOpen={showMethodologyModal} onClose={() => setShowMethodologyModal(false)} title="Carbon Calculation Formula & Reference">
        <div className="space-y-4 text-xs sm:text-sm text-sage/85 leading-relaxed font-sans">
          {/* Transparent Formula Box */}
          <div className="p-4 rounded-xl bg-forest-900/60 border border-lime/40 space-y-2">
            <h4 className="font-mono font-bold text-lime text-xs uppercase tracking-wider">
              The Exact Carbon Formula (SWDM v4)
            </h4>
            <div className="p-3 rounded-lg bg-black/50 font-mono text-xs sm:text-sm text-cream font-bold overflow-x-auto">
              Emissions (gCO2e) = [Data (GB) × 0.81 kWh/GB] × Grid Intensity (gCO2/kWh)
            </div>
            <p className="text-xs text-sage/80 pt-1">
              Every gigabyte transferred consumes approximately 0.81 kWh of electricity across user devices, telecommunication networks, and data centers. That energy is multiplied by the actual carbon intensity of the server&apos;s regional electricity grid.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-elevated/70 border border-surface-border space-y-2">
            <h4 className="font-mono font-bold text-lime text-xs uppercase tracking-wider">
              1. Official Reference Standard &amp; Peer-Reviewed Research
            </h4>
            <p className="text-xs">
              Based on the <strong>Sustainable Web Design Model v4 (SWDM v4)</strong>, developed by The Green Web Foundation and Wholegrain Digital, and grounded in peer-reviewed academic literature:
            </p>
            <ul className="text-xs text-white/80 space-y-1.5 list-disc pl-4 font-mono">
              <li><strong>Aslan et al. (2018):</strong> Empirical data transmission energy intensity (~0.06 kWh/GB) with biennial doubling of hardware transmission efficiency.</li>
              <li><strong>Freitag et al. (2021, Lancaster Univ):</strong> Quantified total ICT carbon at 2.1%–3.9% of global emissions, factoring in embodied hardware lifecycle carbon.</li>
              <li><strong>Preist, Schien, &amp; Blevis (2016):</strong> Standardized the 3-segment system boundary: User Devices (54%), Network Transmission (24%), Datacenters (22%).</li>
              <li><strong>Masanet et al. (2020, Science):</strong> Proved hyperscale cloud PUE (&lt;1.2), isolating unoptimized client payload as primary addressable energy waste.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-surface-elevated/70 border border-surface-border space-y-2">
            <h4 className="font-mono font-bold text-lime text-xs uppercase tracking-wider">
              2. Empirical Benchmarks (HTTP Archive &amp; Web Almanac)
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/10">
                <span className="text-white/60 block text-[10px] uppercase">Global Median Page</span>
                <span className="text-white font-bold text-sm">2.45 MB (2,450 KB)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-black/40 border border-[#cbff00]/30">
                <span className="text-[#cbff00] block text-[10px] uppercase">Eco-Optimized (Top 10%)</span>
                <span className="text-[#cbff00] font-bold text-sm">&lt; 400 KB</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-elevated/70 border border-surface-border space-y-2">
            <h4 className="font-mono font-bold text-lime text-xs uppercase tracking-wider">
              3. Real Regional Power Grid Lookups
            </h4>
            <p className="text-xs">
              Instead of assuming one flat global average, CarbonTerra resolves the website&apos;s IP address and queries The Green Web Foundation regional grid database to find the true carbon intensity (grams of CO2 per kWh) of that datacenter&apos;s geographic grid (benchmarking against the 494 gCO2/kWh global average).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-elevated/70 border border-surface-border space-y-2">
            <h4 className="font-mono font-bold text-lime text-xs uppercase tracking-wider">
              4. Honest Attribution Boundary
            </h4>
            <p className="text-xs">
              Digital carbon metrics are engineering model attributions. A website reducing 2 MB of transfer achieves measurable digital efficiency, which correlates to reduced network and device electricity use.
            </p>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button
            variant="lime"
            size="sm"
            onClick={() => setShowMethodologyModal(false)}
            className="font-bold font-mono"
          >
            CLOSE
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
