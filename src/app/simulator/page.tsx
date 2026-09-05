"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import {
  Sliders,
  Sparkles,
  ShieldCheck,
  Check,
  Copy,
  Layers,
  Trees,
  Zap,
  TrendingDown,
  FileCode,
  AlertCircle,
  Server,
} from "lucide-react";
import Link from "next/link";
import { AuditResult } from "@/types/telemetry";

export default function SimulatorPage() {
  const [selectedAudit, setSelectedAudit] = useState<AuditResult | null>(null);
  const [recentAudits, setRecentAudits] = useState<any[]>([]);
  const [isDemoBaseline, setIsDemoBaseline] = useState(false);

  // Simulation Sliders
  const [imgComp, setImgComp] = useState(85);
  const [jsDefer, setJsDefer] = useState(60);
  const [cacheTtl, setCacheTtl] = useState(30);
  const [greenHosting, setGreenHosting] = useState(true);
  const [viewsMultiplier, setViewsMultiplier] = useState(100000);

  // Modals & UI states
  const [activePatchTab, setActivePatchTab] = useState<"nextjs" | "html" | "headers">("nextjs");
  const [copiedPatch, setCopiedPatch] = useState(false);
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
    fetch("/api/audits/recent?limit=5")
      .then((r) => r.json())
      .then((data) => {
        if (data && Array.isArray(data.audits) && data.audits.length > 0) {
          setSelectedAudit(data.audits[0]);
        }
      })
      .catch(() => {});
  }, []);

  const handleSelectDomain = async (domain: string) => {
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: domain }),
      });
      const data = await res.json();
      if (data && data.status === "success") {
        setSelectedAudit(data);
        setIsDemoBaseline(false);
      }
    } catch {
      // Fetch error
    }
  };

  const handleLoadDemoBaseline = () => {
    setSelectedAudit({
      status: "success",
      url: "https://demo-sample.internal",
      target_url: "https://demo-sample.internal",
      domain: "demo-sample.org (Demo Dataset)",
      methodology_version: "co2js-swdmv4",
      calculated_at: new Date().toISOString(),
      total_bytes: 2500000,
      co2_grams: 0.36,
      range_low_g: 0.288,
      range_high_g: 0.432,
      confidence: "medium",
      eco_score: "B",
      hosting: { green: false, confirmed: true, provider: "Standard Grid" },
      grid_intensity_source: "global_default",
      grid_intensity_val: 494,
      metrics: {
        bytes_transferred: 2500000,
        payload_mb: 2.38,
        co2_grams: 0.36,
        total_kwh: 0.0031,
        operational_kwh: 0.002,
        embodied_kwh: 0.0011,
        is_green_hosting: false,
        ecoscore_grade: "B",
        cleaner_than_percentile: 65,
        annual_impact: {
          views_basis: 100000,
          co2_kg: 36,
          co2_metric_tons: 0.04,
          trees_equivalent: 1.6,
          kwh_consumed: 310,
          car_miles_equivalent: 89,
        },
      },
      green_hosting: {
        is_green: false,
        hosted_by: "Standard Grid",
        data_source: "Demo Baseline",
        verified: false,
        confirmed: true,
      },
      breakdown: [
        { category: "image", bytes: 1400000, pct_of_total: 56 },
        { category: "script", bytes: 800000, pct_of_total: 32 },
        { category: "stylesheet", bytes: 200000, pct_of_total: 8 },
        { category: "html", bytes: 100000, pct_of_total: 4 },
      ],
      recommendations: [],
      payload_breakdown: {
        total_bytes: 2500000,
        total_mb: 2.38,
        html_kb: 100,
        image_kb: 1400,
        script_kb: 800,
        stylesheet_kb: 200,
        assets_discovered: 12,
      },
      hotspots: [],
    });
    setIsDemoBaseline(true);
  };

  // Real Baseline Numbers
  const baselineCo2 = selectedAudit ? selectedAudit.co2_grams : 0;
  const baselinePayloadBytes = selectedAudit ? selectedAudit.total_bytes : 0;
  const baselinePayloadMb = selectedAudit ? selectedAudit.metrics.payload_mb : 0;

  // Real calculation factors
  const imgFactor = 1 - (imgComp / 100) * 0.45;
  const jsFactor = 1 - (jsDefer / 100) * 0.25;
  const hostingFactor = greenHosting ? 0.72 : 1.0;
  const cacheFactor = 1 - Math.min(cacheTtl / 365, 0.15);

  const calculatedCo2 = Number(
    (baselineCo2 * imgFactor * jsFactor * cacheFactor * hostingFactor).toFixed(4)
  );
  const calculatedPayloadMb = Number((baselinePayloadMb * imgFactor * jsFactor).toFixed(2));

  const savingPct = baselineCo2 > 0
    ? Math.max(0, Math.round(((baselineCo2 - calculatedCo2) / baselineCo2) * 100))
    : 0;

  const annualCo2KgSaved = Math.max(
    0,
    Number((((baselineCo2 - calculatedCo2) * viewsMultiplier * 12) / 1000).toFixed(1))
  );
  const annualTonsSaved = (annualCo2KgSaved / 1000).toFixed(2);
  const illustrativeTrees = (annualCo2KgSaved / 21.77).toFixed(1);

  const patchSnippets = {
    nextjs: `// next.config.mjs — Example Next.js Image Optimization Pattern
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: ${cacheTtl * 86400}, // ${cacheTtl} Days
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
};
export default nextConfig;`,
    html: `<!-- Modern Picture Fallback & Script Deferral Example Pattern -->
<picture>
  <source srcset="/hero-asset.avif" type="image/avif" />
  <source srcset="/hero-asset.webp" type="image/webp" />
  <img src="/hero-asset.jpg" alt="Hero" loading="lazy" decoding="async" />
</picture>

<!-- Defer non-critical scripts -->
<script src="/analytics.js" defer async></script>`,
    headers: `# Nginx / Cloudflare Cache-Control Header Directives
location ~* \\.(?:ico|css|js|gif|jpe?g|png|avif|webp|woff2?)$ {
  expires ${cacheTtl}d;
  add_header Cache-Control "public, max-age=${cacheTtl * 86400}, immutable";
}`,
  };

  const copyPatch = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPatch(true);
    setNotification("Code pattern copied to clipboard!");
    setTimeout(() => {
      setCopiedPatch(false);
      setNotification(null);
    }, 2500);
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-8">
        <div>
          <span className="text-xs font-mono text-lime uppercase font-bold tracking-widest">
            SCENARIO ESTIMATION ENGINE
          </span>
          <h1 className="font-display text-4xl sm:text-6xl text-cream uppercase tracking-wide mt-1">
            WHAT-IF SIMULATOR
          </h1>
          <p className="text-xs sm:text-sm text-sage/80 mt-2 max-w-2xl">
            Simulate the impact of asset compression, code-splitting, and hosting decisions against an audited baseline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {recentAudits.length > 0 && (
            <select
              onChange={(e) => handleSelectDomain(e.target.value)}
              className="bg-surface-elevated border border-surface-border text-xs font-mono px-3 py-2 rounded-xl text-cream"
              value={selectedAudit?.domain || ""}
            >
              <option value="" disabled>
                Select Monitored Baseline...
              </option>
              {recentAudits.map((a: any) => (
                <option key={a.domain} value={a.domain}>
                  {a.domain} ({a.grade}, {a.co2}g)
                </option>
              ))}
            </select>
          )}
        </div>
      </div>


      {selectedAudit ? (
        <>
          {/* Active Baseline Status */}
          <div className="p-5 rounded-2xl glass-panel border border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-lime/10 border border-lime/30 text-lime">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sage/60 uppercase">Selected Baseline Audit</div>
                <div className="text-cream font-bold text-sm flex items-center gap-2">
                  {selectedAudit.domain}
                  <Badge variant={selectedAudit.eco_score === "A+" || selectedAudit.eco_score === "A" ? "lime" : "outline"}>
                    Grade {selectedAudit.eco_score}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sage/80">
              <div>
                <span className="text-sage/60">Baseline CO2:</span>{" "}
                <span className="text-cream font-bold">{selectedAudit.co2_grams}g</span>
              </div>
              <div>
                <span className="text-sage/60">Payload:</span>{" "}
                <span className="text-cream font-bold">{selectedAudit.metrics.payload_mb} MB</span>
              </div>
              <Link href={`/?url=${encodeURIComponent(selectedAudit.domain)}`} className="text-lime underline">
                Re-audit
              </Link>
            </div>
          </div>

          {/* Simulator Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Levers Column */}
            <div className="lg:col-span-6 space-y-6">
              <Card className="p-6 glass-panel-elevated border border-surface-border space-y-6">
                <h3 className="font-display text-xl text-cream uppercase flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-lime" /> Optimization Levers
                </h3>

                {/* Lever 1: Image Compression */}
                <div className="space-y-2 font-mono">
                  <div className="flex justify-between text-xs">
                    <span className="text-cream font-bold">1. Modern Image Compression (AVIF/WebP)</span>
                    <span className="text-lime">{imgComp}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="95"
                    step="5"
                    value={imgComp}
                    onChange={(e) => setImgComp(Number(e.target.value))}
                    className="w-full accent-lime bg-surface-elevated h-2 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-sage/60">
                    <span>Legacy Formats (0%)</span>
                    <span>Aggressive AVIF (95%)</span>
                  </div>
                </div>

                {/* Lever 2: JS Deferral */}
                <div className="space-y-2 font-mono">
                  <div className="flex justify-between text-xs">
                    <span className="text-cream font-bold">2. JavaScript Deferral & Tree-Shaking</span>
                    <span className="text-lime">{jsDefer}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    step="5"
                    value={jsDefer}
                    onChange={(e) => setJsDefer(Number(e.target.value))}
                    className="w-full accent-lime bg-surface-elevated h-2 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-sage/60">
                    <span>All Sync (0%)</span>
                    <span>Aggressive Defer (90%)</span>
                  </div>
                </div>

                {/* Lever 3: Caching Header */}
                <div className="space-y-2 font-mono">
                  <div className="flex justify-between text-xs">
                    <span className="text-cream font-bold">3. Static Cache TTL</span>
                    <span className="text-lime">{cacheTtl} Days</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="365"
                    step="7"
                    value={cacheTtl}
                    onChange={(e) => setCacheTtl(Number(e.target.value))}
                    className="w-full accent-lime bg-surface-elevated h-2 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Lever 4: Renewable Hosting Scenario */}
                <div className="pt-2 border-t border-surface-border flex items-center justify-between font-mono text-xs">
                  <div>
                    <div className="text-cream font-bold">4. Transition to Verified Green Host</div>
                    <div className="text-[10px] text-sage/60">Models a 100% renewable datacenter grid</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={greenHosting}
                    onChange={(e) => setGreenHosting(e.target.checked)}
                    className="w-4 h-4 accent-lime cursor-pointer"
                  />
                </div>

                {/* Traffic Volume Slider */}
                <div className="pt-4 border-t border-surface-border space-y-2 font-mono">
                  <div className="flex justify-between text-xs">
                    <span className="text-cream font-bold">Monthly Pageviews</span>
                    <span className="text-lime">{viewsMultiplier.toLocaleString()} views/mo</span>
                  </div>
                  <input
                    type="range"
                    min="10000"
                    max="1000000"
                    step="10000"
                    value={viewsMultiplier}
                    onChange={(e) => setViewsMultiplier(Number(e.target.value))}
                    className="w-full accent-lime bg-surface-elevated h-2 rounded-lg cursor-pointer"
                  />
                </div>
              </Card>
            </div>

            {/* Right Output Projections Column */}
            <div className="lg:col-span-6 space-y-6">
              <Card className="p-6 glass-panel-elevated border border-lime/30 space-y-6">
                <h3 className="font-display text-xl text-cream uppercase flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-lime" /> Simulated Outcome
                </h3>

                <div className="grid grid-cols-2 gap-4 font-mono">
                  <div className="p-4 rounded-xl bg-surface-elevated border border-surface-border">
                    <div className="text-[11px] text-sage/60 uppercase">Est. CO2 / Visit</div>
                    <div className="text-3xl font-bold text-lime mt-1">{calculatedCo2}g</div>
                    <div className="text-[11px] text-sage/70 mt-1">From {baselineCo2}g (-{savingPct}%)</div>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-elevated border border-surface-border">
                    <div className="text-[11px] text-sage/60 uppercase">Est. Payload</div>
                    <div className="text-3xl font-bold text-cream mt-1">{calculatedPayloadMb} MB</div>
                    <div className="text-[11px] text-sage/70 mt-1">From {baselinePayloadMb} MB</div>
                  </div>
                </div>

                {/* Annual Savings */}
                <div className="p-5 rounded-2xl bg-lime/10 border border-lime/30 font-mono space-y-2">
                  <div className="text-xs text-lime font-bold uppercase">Estimated Annual Reduction</div>
                  <div className="text-4xl font-display text-cream">
                    {annualCo2KgSaved} <span className="text-base font-normal font-mono text-sage">kg CO2e / yr</span>
                  </div>
                  <p className="text-xs text-sage/80">
                    Equivalent to approximately {annualTonsSaved} Metric Tons avoided. (Illustrative carbon equivalency: ~{illustrativeTrees} tree seedlings grown for 10 years per EPA basis).
                  </p>
                </div>

                {/* Example AST Code Guidance Drawer */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-cream uppercase">
                      Example Remediation Pattern
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyPatch(patchSnippets[activePatchTab])}
                      className="text-xs font-mono flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copiedPatch ? "COPIED" : "COPY CODE"}
                    </Button>
                  </div>

                  <div className="flex gap-2 font-mono text-xs border-b border-surface-border pb-2">
                    {(["nextjs", "html", "headers"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActivePatchTab(tab)}
                        className={`px-3 py-1 rounded-lg ${
                          activePatchTab === tab ? "bg-lime text-black font-bold" : "text-sage hover:text-cream"
                        }`}
                      >
                        {tab.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  <pre className="p-4 rounded-xl bg-black/70 border border-surface-border overflow-x-auto text-[11px] font-mono text-lime/90 leading-relaxed max-h-48">
                    {patchSnippets[activePatchTab]}
                  </pre>
                </div>
              </Card>
            </div>
          </div>
        </>
      ) : (
        /* Empty State */
        <div className="p-12 text-center rounded-3xl glass-panel-elevated border border-surface-border space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-surface-elevated border border-surface-border text-sage flex items-center justify-center mx-auto">
            <Sliders className="w-7 h-7" />
          </div>
          <h3 className="font-display text-2xl text-cream uppercase">No Baseline Audit Selected</h3>
          <p className="text-xs sm:text-sm text-sage/75 max-w-md mx-auto">
            Run an audit on the home page first to use your site&apos;s actual transfer bytes as the simulation baseline, or load a sample dataset.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link href="/" className="px-4 py-2 rounded-xl bg-lime text-black font-mono font-bold text-xs">
              Go to Scanner →
            </Link>
            <Button variant="outline" size="sm" onClick={handleLoadDemoBaseline} className="text-xs font-mono">
              Load Demo Baseline
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
