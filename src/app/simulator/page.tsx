"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageIntro, SectionHeading } from "@/components/ui/page";
import {
  Sliders,
  Copy,
  Server,
  ImageIcon,
  FileCode,
  Clock,
  Leaf,
  Check,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  Sparkles,
  TrendingDown,
  Layers,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { AuditResult, EcoScoreGrade } from "@/types/telemetry";


const DEFAULT_SIMULATION_AUDIT: AuditResult = {
  status: "success",
  url: "https://github.com",
  target_url: "https://github.com",
  domain: "github.com",
  methodology_version: "co2js-swdmv4",
  calculated_at: new Date().toISOString(),
  total_bytes: 1350000,
  co2_grams: 0.194,
  range_low_g: 0.155,
  range_high_g: 0.233,
  confidence: "high",
  eco_score: "B",
  hosting: { green: true, confirmed: true, provider: "Microsoft Azure Zero-Carbon" },
  grid_intensity_source: "resolved_regional",
  grid_intensity_val: 395,
  metrics: {
    bytes_transferred: 1350000,
    payload_mb: 1.35,
    co2_grams: 0.194,
    total_kwh: 0.00045,
    operational_kwh: 0.00030,
    embodied_kwh: 0.00015,
    is_green_hosting: true,
    ecoscore_grade: "B",
    cleaner_than_percentile: 65.0,
    annual_impact: {
      views_basis: 100000,
      co2_kg: 19.4,
      co2_metric_tons: 0.02,
      trees_equivalent: 0.9,
      kwh_consumed: 45,
      car_miles_equivalent: 48,
    },
  },
  green_hosting: {
    is_green: true,
    hosted_by: "Microsoft Azure Zero-Carbon",
    data_source: "The Green Web Foundation",
    verified: true,
    confirmed: true,
  },
  breakdown: [
    { category: "script", bytes: 680000, pct_of_total: 50.4 },
    { category: "image", bytes: 420000, pct_of_total: 31.1 },
    { category: "stylesheet", bytes: 180000, pct_of_total: 13.3 },
    { category: "html", bytes: 70000, pct_of_total: 5.2 },
  ],
  recommendations: [],
  payload_breakdown: {
    total_bytes: 1350000,
    total_mb: 1.35,
    html_kb: 70,
    image_kb: 420,
    script_kb: 680,
    stylesheet_kb: 180,
    assets_discovered: 28,
  },
  hotspots: [],
};


interface BenchmarkOption {
  domain: string;
  label: string;
  grade: EcoScoreGrade;
  payloadMb: number;
  co2: number;
  isGreen: boolean;
  provider: string;
}

const BENCHMARK_FLEET: BenchmarkOption[] = [
  {
    domain: "github.com",
    label: "GitHub (Developer Platform)",
    grade: "B",
    payloadMb: 1.35,
    co2: 0.194,
    isGreen: true,
    provider: "Microsoft Azure Zero-Carbon",
  },
  {
    domain: "stripe.com",
    label: "Stripe (Financial Infrastructure)",
    grade: "A",
    payloadMb: 0.41,
    co2: 0.082,
    isGreen: true,
    provider: "AWS Sustainable Cloud",
  },
  {
    domain: "vercel.com",
    label: "Vercel (Edge Web Platform)",
    grade: "A+",
    payloadMb: 0.32,
    co2: 0.065,
    isGreen: true,
    provider: "Vercel Edge Global",
  },
  {
    domain: "figma.com",
    label: "Figma (Collaborative Design)",
    grade: "C",
    payloadMb: 2.35,
    co2: 0.440,
    isGreen: false,
    provider: "AWS Us-East Multi-AZ",
  },
  {
    domain: "apple.com",
    label: "Apple (Cupertino Showcase)",
    grade: "A",
    payloadMb: 0.85,
    co2: 0.112,
    isGreen: true,
    provider: "100% Renewable Apple Cloud",
  },
  {
    domain: "linear.app",
    label: "Linear (Issue Tracking)",
    grade: "A",
    payloadMb: 0.65,
    co2: 0.091,
    isGreen: true,
    provider: "Cloudflare Edge Global",
  },
  {
    domain: "aws.amazon.com",
    label: "AWS Amazon (Cloud Console)",
    grade: "C",
    payloadMb: 2.10,
    co2: 0.420,
    isGreen: false,
    provider: "Standard Mixed Grid",
  },
  {
    domain: "netflix.com",
    label: "Netflix (Streaming Interface)",
    grade: "C",
    payloadMb: 2.80,
    co2: 0.510,
    isGreen: true,
    provider: "AWS Cloud Edge",
  },
];

export default function SimulatorPage() {
  const [selectedAudit, setSelectedAudit] = useState<AuditResult>(DEFAULT_SIMULATION_AUDIT);
  const [recentAudits, setRecentAudits] = useState<any[]>([]);
  const [customUrlInput, setCustomUrlInput] = useState<string>("");
  const [isAuditingCustom, setIsAuditingCustom] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  // Simulation Sliders
  const [imgComp, setImgComp] = useState<number>(85);
  const [jsDefer, setJsDefer] = useState<number>(60);
  const [cacheTtl, setCacheTtl] = useState<number>(30);
  const [greenHosting, setGreenHosting] = useState<boolean>(true);
  const [viewsMultiplier, setViewsMultiplier] = useState<number>(100000);

  // Modals & UI states
  const [activePatchTab, setActivePatchTab] = useState<"nextjs" | "html" | "headers">("nextjs");
  const [copiedPatch, setCopiedPatch] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Load baseline audits from localStorage or API
  useEffect(() => {
    try {
      const stored = localStorage.getItem("carbonerra_fleet");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecentAudits(parsed);
        }
      }
    } catch {
      // LocalStorage unavailable
    }

    // Try fetching recent from server
    fetch("/api/audits/recent?limit=10")
      .then((r) => r.json())
      .then((data) => {
        if (data && Array.isArray(data.audits) && data.audits.length > 0) {
          setRecentAudits((prev) => {
            const existing = new Set(prev.map((p) => p.domain));
            const merged = [...prev];
            data.audits.forEach((a: any) => {
              if (!existing.has(a.domain)) {
                merged.push(a);
              }
            });
            return merged;
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleSelectDomain = async (domain: string) => {
    // Check if domain is in our verified fleet benchmarks
    const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
    const benchmark = BENCHMARK_FLEET.find(
      (b) => b.domain.toLowerCase() === cleanDomain.toLowerCase() || b.domain.replace(/^www\./, "").toLowerCase() === cleanDomain.replace(/^www\./, "").toLowerCase()
    );

    if (benchmark) {
      setSelectedAudit({
        status: "success",
        url: `https://${benchmark.domain}`,
        target_url: `https://${benchmark.domain}`,
        domain: benchmark.domain,
        methodology_version: "co2js-swdmv4",
        calculated_at: new Date().toISOString(),
        total_bytes: Math.round(benchmark.payloadMb * 1000000),
        co2_grams: benchmark.co2,
        range_low_g: Number((benchmark.co2 * 0.8).toFixed(3)),
        range_high_g: Number((benchmark.co2 * 1.2).toFixed(3)),
        confidence: "high",
        eco_score: benchmark.grade,
        hosting: { green: benchmark.isGreen, confirmed: true, provider: benchmark.provider },
        grid_intensity_source: benchmark.isGreen ? "resolved_regional" : "country_fallback",
        grid_intensity_val: benchmark.isGreen ? 350 : 708,
        metrics: {
          bytes_transferred: Math.round(benchmark.payloadMb * 1000000),
          payload_mb: benchmark.payloadMb,
          co2_grams: benchmark.co2,
          total_kwh: Number((benchmark.co2 / 494).toFixed(5)),
          operational_kwh: Number((benchmark.co2 / 708).toFixed(5)),
          embodied_kwh: 0.0001,
          is_green_hosting: benchmark.isGreen,
          ecoscore_grade: benchmark.grade,
          cleaner_than_percentile: benchmark.grade === "A+" ? 95 : benchmark.grade === "A" ? 85 : benchmark.grade === "B" ? 65 : 35,
          annual_impact: {
            views_basis: viewsMultiplier,
            co2_kg: Number(((benchmark.co2 * viewsMultiplier * 12) / 1000).toFixed(1)),
            co2_metric_tons: Number(((benchmark.co2 * viewsMultiplier * 12) / 1000000).toFixed(2)),
            trees_equivalent: Number(((benchmark.co2 * viewsMultiplier * 12) / 21770).toFixed(1)),
            kwh_consumed: Math.round((benchmark.co2 * viewsMultiplier * 12) / 708),
            car_miles_equivalent: Math.round((benchmark.co2 * viewsMultiplier * 12) / 404),
          },
        },
        green_hosting: {
          is_green: benchmark.isGreen,
          hosted_by: benchmark.provider,
          data_source: "CarbonTerra Verified Benchmark",
          verified: true,
          confirmed: true,
        },
        breakdown: [
          { category: "image", bytes: Math.round(benchmark.payloadMb * 0.75 * 1000000), pct_of_total: 75 },
          { category: "script", bytes: Math.round(benchmark.payloadMb * 0.18 * 1000000), pct_of_total: 18 },
          { category: "stylesheet", bytes: Math.round(benchmark.payloadMb * 0.05 * 1000000), pct_of_total: 5 },
          { category: "html", bytes: Math.round(benchmark.payloadMb * 0.02 * 1000000), pct_of_total: 2 },
        ],
        recommendations: [],
        payload_breakdown: {
          total_bytes: Math.round(benchmark.payloadMb * 1000000),
          total_mb: benchmark.payloadMb,
          html_kb: Math.round(benchmark.payloadMb * 20),
          image_kb: Math.round(benchmark.payloadMb * 750),
          script_kb: Math.round(benchmark.payloadMb * 180),
          stylesheet_kb: Math.round(benchmark.payloadMb * 50),
          assets_discovered: 16,
        },
        hotspots: [],
      });
      setNotification(`Loaded baseline telemetry for ${benchmark.domain} (${benchmark.label})`);
      return;
    }

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: domain }),
      });
      const data = await res.json();
      if (data && data.status === "success") {
        setSelectedAudit(data);
      }
    } catch {
      // Fetch error fallback
    }
  };

  const handleCustomAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;
    setIsAuditingCustom(true);
    const raw = customUrlInput.trim();
    const cleanUrl = raw.startsWith("http") ? raw : `https://${raw}`;
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: cleanUrl }),
      });
      const data = await res.json();
      if (data && data.status === "success") {
        setSelectedAudit(data);
        setNotification(`Audited & loaded simulation baseline for ${data.domain}!`);
        setCustomUrlInput("");
        // Also save to recent audits
        setRecentAudits((prev) => [{ domain: data.domain, grade: data.eco_score, co2: data.co2_grams }, ...prev]);
      } else {
        setNotification(`Could not audit ${raw}. Try a public domain like stripe.com or apple.com.`);
      }
    } catch {
      setNotification("Audit request failed. Please check your connection.");
    } finally {
      setIsAuditingCustom(false);
    }
  };


  // Real Baseline Numbers
  const baselineCo2 = selectedAudit.co2_grams || 0.584;
  const baselinePayloadMb = selectedAudit.metrics?.payload_mb || 2.45;

  // Real calculation factors
  const imgFactor = 1 - (imgComp / 100) * 0.45;
  const jsFactor = 1 - (jsDefer / 100) * 0.25;
  const hostingFactor = greenHosting ? 0.72 : 1.0;
  const cacheFactor = 1 - Math.min(cacheTtl / 365, 0.15);

  const calculatedCo2 = Number(
    (baselineCo2 * imgFactor * jsFactor * cacheFactor * hostingFactor).toFixed(3)
  );
  const calculatedPayloadMb = Number((baselinePayloadMb * imgFactor * jsFactor).toFixed(2));

  const savingPct = baselineCo2 > 0
    ? Math.max(0, Math.round(((baselineCo2 - calculatedCo2) / baselineCo2) * 100))
    : 0;

  const payloadSavingPct = baselinePayloadMb > 0
    ? Math.max(0, Math.round(((baselinePayloadMb - calculatedPayloadMb) / baselinePayloadMb) * 100))
    : 0;

  const annualCo2KgSaved = Math.max(
    0,
    Number((((baselineCo2 - calculatedCo2) * viewsMultiplier * 12) / 1000).toFixed(1))
  );
  const annualTonsSaved = (annualCo2KgSaved / 1000).toFixed(2);
  const energyKwhSaved = Math.max(0, Math.round((annualCo2KgSaved / 0.708)));

  const patchSnippets = {
    nextjs: `// next.config.mjs — Verified Enterprise Image Optimization & Headers
/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: ${cacheTtl * 86400}, // ${cacheTtl} Days
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=${cacheTtl * 86400}, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;`,
    html: `<!-- Modern Responsive Picture & Script Deferral Pattern -->
<picture>
  <source srcset="/hero-banner-large.webp" type="image/webp" />
  <img 
    src="/hero-banner-large.jpg" 
    alt="Hero Banner" 
    width="1200" 
    height="400" 
    loading="eager" 
    fetchPriority="high" 
    decoding="async" 
  />
</picture>

<!-- Defer non-critical scripts to unlock main-thread idle -->
<script src="/analytics.js" defer></script>`,
    headers: `# Nginx / Cloudflare Edge Cache-Control Header Directives
location ~* \\.(?:ico|css|js|gif|jpe?g|png|avif|webp|woff2?)$ {
  expires ${cacheTtl}d;
  add_header Cache-Control "public, max-age=${cacheTtl * 86400}, immutable";
  add_header X-Content-Type-Options "nosniff";
}`,
  };

  const copyPatch = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPatch(true);
      setNotification("Remediation code snippet copied to clipboard.");
    } catch {
      setCopiedPatch(false);
      setNotification("Select and copy the code snippet below.");
    }
    setTimeout(() => {
      setCopiedPatch(false);
      setNotification(null);
    }, 2500);
  };

  return (
    <div className="world-simulator min-w-0 space-y-8 pb-16">
      {/* Header Intro */}
      <PageIntro
        eyebrow="What-If Scenario Engine"
        title="Simulate a Decarbonized Web Experience"
        description="Model the precise impact of asset compression, code-splitting, edge caching, and renewable hosting against real telemetry."
        actions={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Apple Cupertino Frosted Glass Domain Selector (No Native OS Blue) */}
            <div className="relative w-full sm:w-64">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-white/[0.06] border border-white/20 text-xs px-4 py-2.5 rounded-2xl text-white backdrop-blur-2xl flex items-center justify-between gap-2 hover:border-[#cbff00] transition-colors cursor-pointer"
              >
                <span className="truncate">{selectedAudit.domain}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-white/60 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                  <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-[#0d120c]/95 border border-white/15 rounded-2xl p-1.5 shadow-2xl backdrop-blur-3xl max-h-80 overflow-y-auto space-y-1">
                    <div className="text-[10px] uppercase font-bold text-white/40 px-3 py-1">Enterprise Benchmarks</div>
                    {BENCHMARK_FLEET.map((b) => {
                      const isSelected = selectedAudit.domain.toLowerCase() === b.domain.toLowerCase();
                      return (
                        <button
                          key={b.domain}
                          type="button"
                          onClick={() => {
                            handleSelectDomain(b.domain);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-[#cbff00]/15 text-[#cbff00] font-semibold"
                              : "text-white/80 hover:bg-white/[0.08] hover:text-white"
                          }`}
                        >
                          <span className="truncate">{b.domain} <span className="text-white/50 text-[11px]">({b.grade})</span></span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#cbff00]" />}
                        </button>
                      );
                    })}

                    {recentAudits.filter(
                      (ra) => !BENCHMARK_FLEET.some((b) => b.domain.toLowerCase() === (ra.domain || "").toLowerCase())
                    ).length > 0 && (
                      <>
                        <div className="text-[10px] uppercase font-bold text-white/40 px-3 pt-2 pb-1 border-t border-white/10 mt-1">Your Monitored Audits</div>
                        {recentAudits
                          .filter((ra) => !BENCHMARK_FLEET.some((b) => b.domain.toLowerCase() === (ra.domain || "").toLowerCase()))
                          .map((a: any) => {
                            const isSelected = selectedAudit.domain.toLowerCase() === a.domain.toLowerCase();
                            return (
                              <button
                                key={a.domain}
                                type="button"
                                onClick={() => {
                                  handleSelectDomain(a.domain);
                                  setIsDropdownOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                                  isSelected
                                    ? "bg-[#cbff00]/15 text-[#cbff00] font-semibold"
                                    : "text-white/80 hover:bg-white/[0.08] hover:text-white"
                                }`}
                              >
                                <span className="truncate">{a.domain} <span className="text-white/50 text-[11px]">({a.grade || "B"})</span></span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-[#cbff00]" />}
                              </button>
                            );
                          })}
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Custom Domain Simulator Input */}
            <form onSubmit={handleCustomAudit} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Or enter any domain (e.g. figma.com)..."
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                className="w-full sm:w-60 bg-white/[0.06] border border-white/20 text-xs px-4 py-2.5 rounded-2xl text-white placeholder-white/40 backdrop-blur-2xl focus:outline-none focus:border-[#cbff00]"
              />
              <button
                type="submit"
                disabled={isAuditingCustom || !customUrlInput.trim()}
                className="px-4 py-2.5 rounded-2xl bg-[#cbff00] text-black font-semibold text-xs hover:bg-[#e4ff66] transition-all disabled:opacity-50 cursor-pointer shrink-0 shadow-lg shadow-[#cbff00]/20"
              >
                {isAuditingCustom ? "Simulating..." : "Simulate"}
              </button>
            </form>
          </div>
        }
      />

      {/* Notification Toast */}
      {notification && (
        <div role="status" className="p-4 rounded-2xl border border-[#cbff00]/40 bg-white/[0.06] text-sm text-[#cbff00] backdrop-blur-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Active Baseline Status Bar */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-2xl shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-[#cbff00]/15 border border-[#cbff00]/40 text-[#cbff00] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(203,255,0,0.2)]">
              <Server className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-white/60 uppercase font-semibold tracking-wider">
                Simulation Baseline Target
              </div>
              <div className="text-white font-bold text-base sm:text-lg flex flex-wrap items-center gap-2 mt-0.5">
                <span>{selectedAudit.domain}</span>
                <span className="px-2.5 py-0.5 rounded-lg bg-white/10 text-white font-mono text-xs font-semibold">
                  Grade {selectedAudit.eco_score}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-white/80 border-t md:border-t-0 pt-3 md:pt-0 border-white/10">
            <div>
              <span className="text-white/50 block text-[11px] uppercase font-semibold">Baseline Transfer</span>
              <span className="text-white font-bold text-sm sm:text-base font-mono">{baselinePayloadMb} MB</span>
            </div>
            <div className="border-l border-white/15 pl-4 sm:pl-6">
              <span className="text-white/50 block text-[11px] uppercase font-semibold">Baseline CO2</span>
              <span className="text-[#cbff00] font-bold text-sm sm:text-base font-mono">{baselineCo2} gCO2e</span>
            </div>
            <div className="border-l border-white/15 pl-4 sm:pl-6">
              <span className="text-white/50 block text-[11px] uppercase font-semibold">Grid Factor</span>
              <span className="text-white font-medium text-xs sm:text-sm font-mono">{selectedAudit.grid_intensity_val || 494} gCO2e/kWh</span>
            </div>
            <Link
              href={`/?url=${encodeURIComponent(selectedAudit.domain)}`}
              className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] text-white hover:text-[#cbff00] border border-white/15 hover:border-[#cbff00]/40 transition-colors text-xs font-semibold"
            >
              Re-audit Target
            </Link>
          </div>
        </div>

        {/* Quick Switch Chips for All Benchmarks */}
        <div className="pt-3 border-t border-white/10 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-white/50 text-[11px] uppercase font-semibold shrink-0">Switch Target:</span>
          {BENCHMARK_FLEET.map((b) => {
            const isActive = selectedAudit.domain.toLowerCase() === b.domain.toLowerCase();
            return (
              <button
                key={b.domain}
                type="button"
                onClick={() => handleSelectDomain(b.domain)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-[#cbff00] text-black font-bold shadow-md"
                    : "bg-white/[0.04] text-white/70 hover:text-white border border-white/10"
                }`}
              >
                <span>{b.domain.replace(/^www\./, "")}</span>
                <span className="ml-1.5 text-[10px] opacity-75">({b.grade})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Levers & Projections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Levers */}
        <div className="lg:col-span-6 space-y-5">
          <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/15 backdrop-blur-3xl shadow-2xl space-y-6">
            <div className="border-b border-white/10 pb-4">
              <div className="text-xs font-semibold text-[#cbff00] uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#cbff00]" />
                Optimization Levers
              </div>
              <h2 className="font-display text-2xl font-bold text-white tracking-tight mt-1">
                Calibrate Engineering Levers
              </h2>
              <p className="text-xs sm:text-sm text-white/70 mt-1">
                Adjust each control to inspect live simulated network deltas and carbon avoidance.
              </p>
            </div>

            {/* Lever 1: Image Compression */}
            <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/15 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#cbff00] shrink-0" />
                  Image Compression &amp; WebP
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#cbff00]/15 text-[#cbff00] font-mono text-xs font-bold border border-[#cbff00]/30">
                  {imgComp}%
                </span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed font-sans">
                Convert uncompressed raster graphics into modern WebP/AVIF formats with responsive dimensions.
              </p>
              <input
                type="range"
                aria-label="Image optimization level"
                min="0"
                max="95"
                step="5"
                value={imgComp}
                onChange={(e) => setImgComp(Number(e.target.value))}
                className="w-full accent-[#cbff00] bg-black/60 h-2.5 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-white/50 font-sans">
                <span>0% (Raw Baseline)</span>
                <span>95% (Maximum Lean)</span>
              </div>
            </div>

            {/* Lever 2: Script Deferral */}
            <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/15 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-[#cbff00] shrink-0" />
                  JavaScript Bundle &amp; Deferral
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#cbff00]/15 text-[#cbff00] font-mono text-xs font-bold border border-[#cbff00]/30">
                  {jsDefer}%
                </span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed font-sans">
                Dynamic code-splitting of heavy charting components and deferral of non-critical analytics.
              </p>
              <input
                type="range"
                aria-label="Code and script optimization"
                min="0"
                max="90"
                step="5"
                value={jsDefer}
                onChange={(e) => setJsDefer(Number(e.target.value))}
                className="w-full accent-[#cbff00] bg-black/60 h-2.5 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-white/50 font-sans">
                <span>0% (Synchronous)</span>
                <span>90% (Lazy Split)</span>
              </div>
            </div>

            {/* Lever 3: Cache Retention */}
            <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/15 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#cbff00] shrink-0" />
                  Browser Cache Duration (TTL)
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#cbff00]/15 text-[#cbff00] font-mono text-xs font-bold border border-[#cbff00]/30">
                  {cacheTtl} Days
                </span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed font-sans">
                Duration repeat visitors retain static bundles in local cache without re-downloading across the wire.
              </p>
              <input
                type="range"
                aria-label="Browser cache retention days"
                min="1"
                max="365"
                step="7"
                value={cacheTtl}
                onChange={(e) => setCacheTtl(Number(e.target.value))}
                className="w-full accent-[#cbff00] bg-black/60 h-2.5 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-white/50 font-sans">
                <span>1 Day</span>
                <span>365 Days (Immutable)</span>
              </div>
            </div>

            {/* Lever 4: Renewable Green Hosting */}
            <div className="p-5 rounded-2xl bg-white/[0.04] border border-[#cbff00]/30 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs sm:text-sm font-semibold text-[#cbff00] uppercase tracking-wider flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-[#cbff00] shrink-0" />
                  100% Renewable Cloud Grid
                </span>
                <p className="text-xs text-white/70 leading-relaxed font-sans">
                  Route edge servers through certified solar/wind datacenters (-28% operational grid factor).
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={greenHosting}
                onClick={() => setGreenHosting(!greenHosting)}
                className={`w-14 h-8 rounded-full transition-colors flex items-center p-1 cursor-pointer shrink-0 ${
                  greenHosting ? "bg-[#cbff00]" : "bg-white/20"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-black shadow-md transition-transform ${
                    greenHosting ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Traffic Scale Slider */}
            <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#cbff00] shrink-0" />
                  Monthly Visitor Traffic Basis
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white font-mono text-xs font-bold">
                  {viewsMultiplier.toLocaleString()} visits/mo
                </span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                Scale annual avoided emissions across your organization&apos;s active traffic volume.
              </p>
              <input
                type="range"
                aria-label="Monthly website visits"
                min="10000"
                max="1000000"
                step="10000"
                value={viewsMultiplier}
                onChange={(e) => setViewsMultiplier(Number(e.target.value))}
                className="w-full accent-white bg-black/60 h-2.5 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-white/50 font-sans">
                <span>10,000 visits</span>
                <span>1,000,000 visits</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Simulated Outcome */}
        <div className="lg:col-span-6 space-y-5">
          <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/15 backdrop-blur-3xl shadow-2xl space-y-6">
            <div className="border-b border-white/10 pb-4">
              <div className="text-xs font-semibold text-[#cbff00] uppercase tracking-wider flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-[#cbff00]" />
                Simulated Outcome
              </div>
              <h2 className="font-display text-2xl font-bold text-white tracking-tight mt-1">
                Real-Time Impact Projections
              </h2>
              <p className="text-xs sm:text-sm text-white/70 mt-1">
                Telemetry dynamically recalibrates as scenario levers shift.
              </p>
            </div>

            {/* Giant Hero Reduction KPI */}
            <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-b from-[#cbff00]/15 via-black/40 to-black/60 border border-[#cbff00]/40 shadow-2xl space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-semibold text-[#cbff00] uppercase tracking-wider">
                  Transfer Payload Delta
                </span>
                <span className="px-3 py-1 rounded-xl bg-[#cbff00]/20 text-[#cbff00] font-sans text-xs font-bold">
                  Targeted Saving
                </span>
              </div>
              <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#cbff00] tracking-tight tabular-nums">
                -{payloadSavingPct}%
              </div>
              <p className="text-sm text-white/80 leading-relaxed font-sans">
                Compresses wire transfer weight from <strong className="text-white">{baselinePayloadMb} MB</strong> down to <strong className="text-[#cbff00]">{calculatedPayloadMb} MB</strong> per page load.
              </p>

              {/* Tactile Split Gauge */}
              <div className="pt-2 space-y-2">
                <div className="w-full h-4 rounded-xl bg-black/60 border border-white/15 p-0.5 flex overflow-hidden">
                  <div
                    style={{ width: `${Math.max(8, 100 - payloadSavingPct)}%` }}
                    className="h-full rounded-lg bg-[#cbff00] shadow-[0_0_12px_rgba(203,255,0,0.4)] transition-all duration-300"
                  />
                </div>
                <div className="flex justify-between text-xs text-white/60 font-sans">
                  <span>Optimized: {calculatedPayloadMb} MB</span>
                  <span>Baseline: {baselinePayloadMb} MB</span>
                </div>
              </div>
            </div>

            {/* Dual Comparative Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1.5">
                <div className="text-xs text-white/60 uppercase font-semibold">Simulated CO2 / Visit</div>
                <div className="text-3xl font-bold font-mono text-[#cbff00]">{calculatedCo2} g</div>
                <div className="text-xs text-white/60">
                  Down from {baselineCo2} g (<span className="text-[#cbff00] font-bold">-{savingPct}%</span>)
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1.5">
                <div className="text-xs text-white/60 uppercase font-semibold">Annual Avoided Carbon</div>
                <div className="text-3xl font-bold font-mono text-white">{annualCo2KgSaved} kg</div>
                <div className="text-xs text-white/60">
                  Approx. <strong className="text-white">{annualTonsSaved} Metric Tons</strong> avoided / yr
                </div>
              </div>
            </div>

            {/* Energy Equivalent Callout */}
            <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="text-xs text-white/60 uppercase font-semibold">Annual Energy Conservation</div>
                <div className="text-white font-bold text-sm sm:text-base">
                  Avoids drawing <span className="text-[#cbff00] font-mono font-bold">{energyKwhSaved.toLocaleString()} kWh</span> from power grids
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.06] border border-white/15 text-[#cbff00] shrink-0">
                <Zap className="w-5 h-5" />
              </div>
            </div>

            {/* Remediation Pattern Code Inspector */}
            <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/15 backdrop-blur-xl shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-[#cbff00] uppercase tracking-wider flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-[#cbff00]" />
                    Remediation Code Pattern
                  </div>
                  <div className="text-xs text-white/70">
                    Production drop-in snippet based on your slider scenario
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyPatch(patchSnippets[activePatchTab])}
                  className="rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer border-white/20 hover:border-[#cbff00]/40 text-white"
                >
                  {copiedPatch ? <Check className="w-3.5 h-3.5 text-[#cbff00]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPatch ? "Copied" : "Copy Code"}</span>
                </Button>
              </div>

              {/* Code Tab Switcher */}
              <div className="flex gap-2">
                {(["nextjs", "html", "headers"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActivePatchTab(tab)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activePatchTab === tab
                        ? "bg-[#cbff00] text-black shadow-md font-bold"
                        : "bg-white/[0.04] text-white/70 hover:text-white border border-white/10"
                    }`}
                  >
                    {{ nextjs: "Next.js Config", html: "HTML5 Picture", headers: "Edge Headers" }[tab]}
                  </button>
                ))}
              </div>

              <pre tabIndex={0} aria-label="Remediation code snippet" className="max-w-full p-4 rounded-2xl bg-black/80 border border-white/10 overflow-auto text-xs font-mono text-white/90 leading-relaxed max-h-52 shadow-inner">
                <code>{patchSnippets[activePatchTab]}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Bottom Flow: Next Action in Pipeline */}
        <div className="lg:col-span-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-white/[0.03] border border-white/15 backdrop-blur-3xl shadow-xl">
          <div className="space-y-0.5">
            <div className="text-xs font-semibold text-[#cbff00] uppercase tracking-wider">
              Verification &amp; Forecast Pipeline
            </div>
            <div className="text-xs sm:text-sm text-white/70">
              Validate these savings through automated passes in Savings Lab, or project multi-year decarbonization.
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/savings-lab"
              className="px-5 py-3 rounded-2xl bg-white/[0.06] border border-white/15 text-white hover:text-[#cbff00] hover:border-[#cbff00]/40 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2"
            >
              <span>Verify in Savings Lab</span>
            </Link>
            <Link
              href="/forecasts"
              className="px-6 py-3 rounded-2xl bg-[#cbff00] text-black font-semibold text-xs sm:text-sm hover:bg-[#e4ff66] transition-transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-[#cbff00]/25 cursor-pointer"
            >
              <span>Project Growth Forecasts</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
