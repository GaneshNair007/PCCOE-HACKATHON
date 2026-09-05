"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Info,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Server,
} from "lucide-react";
import Link from "next/link";
import { AuditResult } from "@/types/telemetry";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ForecastsPage() {
  const [selectedAudit, setSelectedAudit] = useState<AuditResult | null>(null);
  const [recentAudits, setRecentAudits] = useState<any[]>([]);
  const [isDemoBaseline, setIsDemoBaseline] = useState(false);

  const [timeframe, setTimeframe] = useState<"6M" | "12M" | "24M">("12M");
  const [growthRate, setGrowthRate] = useState<number>(10); // % monthly traffic growth
  const [monthlyViews, setMonthlyViews] = useState<number>(100000);
  const [hoveredPoint, setHoveredPoint] = useState<{
    month: string;
    statusQuoKg: number;
    plannedKg: number;
    netZeroKg: number;
  } | null>(null);

  const chartCardRef = useRef<HTMLDivElement>(null);
  const lineStatusQuoRef = useRef<SVGPolylineElement>(null);
  const linePlannedRef = useRef<SVGPolylineElement>(null);
  const lineNetZeroRef = useRef<SVGPolylineElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("carbonerra_fleet");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecentAudits(parsed);
        }
      }
    } catch {}

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
    } catch {}
  };

  const handleLoadDemoBaseline = () => {
    setSelectedAudit({
      status: "success",
      url: "https://demo-sample.internal",
      target_url: "https://demo-sample.internal",
      domain: "demo-sample.org (Demo Dataset)",
      methodology_version: "co2js-swdmv4",
      calculated_at: new Date().toISOString(),
      total_bytes: 2000000,
      co2_grams: 0.28,
      range_low_g: 0.224,
      range_high_g: 0.336,
      confidence: "medium",
      eco_score: "B",
      hosting: { green: false, confirmed: true, provider: "Standard Grid" },
      grid_intensity_source: "global_default",
      grid_intensity_val: 494,
      metrics: {
        bytes_transferred: 2000000,
        payload_mb: 1.9,
        co2_grams: 0.28,
        total_kwh: 0.00248,
        operational_kwh: 0.0016,
        embodied_kwh: 0.00088,
        is_green_hosting: false,
        ecoscore_grade: "B",
        cleaner_than_percentile: 70,
        annual_impact: {
          views_basis: 100000,
          co2_kg: 28,
          co2_metric_tons: 0.03,
          trees_equivalent: 1.3,
          kwh_consumed: 248,
          car_miles_equivalent: 69,
        },
      },
      green_hosting: { is_green: false, hosted_by: "Standard Grid", data_source: "Demo", verified: false, confirmed: true },
      breakdown: [],
      recommendations: [],
      payload_breakdown: { total_bytes: 2000000, total_mb: 1.9, html_kb: 100, image_kb: 1000, script_kb: 700, stylesheet_kb: 200, assets_discovered: 8 },
      hotspots: [],
    });
    setIsDemoBaseline(true);
  };

  // Generate real data-driven curve points
  const monthsCount = timeframe === "6M" ? 6 : timeframe === "12M" ? 12 : 24;
  const baselineGrams = selectedAudit ? selectedAudit.co2_grams : 0;

  const points = [];
  let cumulativeStatusQuo = 0;
  let cumulativePlanned = 0;
  let cumulativeNetZero = 0;

  for (let m = 1; m <= monthsCount; m++) {
    // Traffic growth factor: compound monthly growth
    const traffic = monthlyViews * Math.pow(1 + growthRate / 100, m - 1);

    // Scenario 1: Status Quo (no optimization, emissions grow with traffic)
    const statusQuoKg = Number(((baselineGrams * traffic) / 1000).toFixed(1));

    // Scenario 2: Planned Optimization (gradual rollout of AVIF & script deferral: -3% per month up to -45%)
    const reductionFactor = Math.max(0.55, 1 - (m * 0.04));
    const plannedKg = Number(((baselineGrams * reductionFactor * traffic) / 1000).toFixed(1));

    // Scenario 3: Net-Zero Target (renewable hosting + -50% payload)
    const netZeroKg = Number(((baselineGrams * 0.5 * 0.72 * traffic) / 1000).toFixed(1));

    cumulativeStatusQuo += statusQuoKg;
    cumulativePlanned += plannedKg;
    cumulativeNetZero += netZeroKg;

    points.push({
      label: `M${m}`,
      statusQuoKg,
      plannedKg,
      netZeroKg,
    });
  }

  const maxVal = Math.max(...points.map((p) => p.statusQuoKg), 1);

  // GSAP ScrollTrigger Storytelling Reveal for Projection Paths
  useEffect(() => {
    if (typeof window === "undefined" || !selectedAudit) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lines = [
      lineStatusQuoRef.current,
      linePlannedRef.current,
      lineNetZeroRef.current,
    ].filter(Boolean) as SVGPolylineElement[];

    if (prefersReducedMotion) {
      lines.forEach((line) => {
        line.style.strokeDasharray = "none";
        line.style.strokeDashoffset = "0";
      });
      return;
    }

    lines.forEach((line, idx) => {
      const length = 2400;
      gsap.set(line, {
        strokeDasharray: length,
        strokeDashoffset: length,
      });

      gsap.to(line, {
        strokeDashoffset: 0,
        duration: 1.6,
        delay: idx * 0.25,
        ease: "power2.out",
        scrollTrigger: chartCardRef.current
          ? {
              trigger: chartCardRef.current,
              start: "top 80%",
              once: true,
            }
          : undefined,
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.vars.trigger === chartCardRef.current) {
          t.kill();
        }
      });
    };
  }, [selectedAudit, timeframe, growthRate]);

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-8">
        <div>
          <span className="text-xs font-mono text-lime uppercase font-bold tracking-widest">
            SCENARIO FORECASTING
          </span>
          <h1 className="font-display text-4xl sm:text-6xl text-cream uppercase tracking-wide mt-1">
            EMISSIONS FORECASTS
          </h1>
          <p className="text-xs sm:text-sm text-sage/80 mt-2 max-w-2xl">
            Model future digital carbon trajectory based on real baseline transfer weights, projected traffic growth, and planned engineering remediations.
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

      {/* Persistent Forecast Disclaimer */}
      <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-400/30 text-xs font-mono text-amber-200 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Scenario forecast, not a prediction of measured future emissions.</span> Calculations apply your configured monthly growth rate ({growthRate}%) and engineering reduction schedule against the chosen audit baseline.
          {isDemoBaseline && (
            <span className="block mt-1 font-bold text-amber-300">
              Notice: Modeling against a clearly labeled Demonstration Dataset.
            </span>
          )}
        </div>
      </div>

      {selectedAudit ? (
        <>
          {/* Controls Bar */}
          <div className="p-6 rounded-2xl glass-panel-elevated border border-surface-border grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono text-xs">
            <div>
              <div className="text-sage/60 uppercase">Baseline Domain</div>
              <div className="text-cream font-bold text-sm mt-1">{selectedAudit.domain}</div>
              <div className="text-[11px] text-lime">{selectedAudit.co2_grams}g CO2e / visit</div>
            </div>

            <div>
              <div className="flex justify-between">
                <span className="text-sage/60 uppercase">Monthly Traffic Growth</span>
                <span className="text-lime font-bold">+{growthRate}% / mo</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="2"
                value={growthRate}
                onChange={(e) => setGrowthRate(Number(e.target.value))}
                className="w-full accent-lime bg-surface-elevated h-2 rounded-lg cursor-pointer mt-2"
              />
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2">
              <span className="text-sage/60 uppercase">Horizon:</span>
              {(["6M", "12M", "24M"] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    timeframe === tf ? "bg-lime text-black" : "bg-surface-elevated border border-surface-border text-sage hover:text-cream"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive SVG Projection Chart */}
          <Card ref={chartCardRef} className="tech-frame gradient-border beautiful-md p-6 glass-panel-elevated space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-border pb-4">
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-red-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  Status Quo ({growthRate}% Growth)
                </span>
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  Planned Asset Reductions
                </span>
                <span className="flex items-center gap-1.5 text-lime">
                  <span className="w-2.5 h-2.5 rounded-full bg-lime" />
                  Net-Zero (Renewable + AVIF)
                </span>
              </div>

              {hoveredPoint && (
                <div className="text-xs font-mono text-cream bg-black/60 px-3 py-1 rounded-lg border border-surface-border">
                  {hoveredPoint.month}: Status Quo {hoveredPoint.statusQuoKg}kg • Planned {hoveredPoint.plannedKg}kg • Net-Zero {hoveredPoint.netZeroKg}kg
                </div>
              )}
            </div>

            {/* SVG Chart */}
            <div className="h-64 w-full relative">
              <svg viewBox="0 0 800 240" className="w-full h-full overflow-visible">
                {/* Grid Lines */}
                {[0, 60, 120, 180, 240].map((y) => (
                  <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="rgba(204, 213, 174, 0.1)" strokeDasharray="4 4" />
                ))}

                {/* Status Quo Line (Red) */}
                <polyline
                  ref={lineStatusQuoRef}
                  fill="none"
                  stroke="#ff5c5c"
                  strokeWidth="2.5"
                  points={points
                    .map((p, i) => `${(i / (points.length - 1)) * 800},${240 - (p.statusQuoKg / maxVal) * 220}`)
                    .join(" ")}
                />

                {/* Planned Reductions Line (Amber) */}
                <polyline
                  ref={linePlannedRef}
                  fill="none"
                  stroke="#e3b341"
                  strokeWidth="2.5"
                  points={points
                    .map((p, i) => `${(i / (points.length - 1)) * 800},${240 - (p.plannedKg / maxVal) * 220}`)
                    .join(" ")}
                />

                {/* Net-Zero Target Line (Lime) */}
                <polyline
                  ref={lineNetZeroRef}
                  fill="none"
                  stroke="#cbff00"
                  strokeWidth="2.5"
                  points={points
                    .map((p, i) => `${(i / (points.length - 1)) * 800},${240 - (p.netZeroKg / maxVal) * 220}`)
                    .join(" ")}
                />

                {/* Hover Targets */}
                {points.map((p, i) => {
                  const x = (i / (points.length - 1)) * 800;
                  const y = 240 - (p.statusQuoKg / maxVal) * 220;
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="6"
                      fill="#ff5c5c"
                      className="cursor-pointer hover:scale-150 transition-transform"
                      onMouseEnter={() =>
                        setHoveredPoint({
                          month: p.label,
                          statusQuoKg: p.statusQuoKg,
                          plannedKg: p.plannedKg,
                          netZeroKg: p.netZeroKg,
                        })
                      }
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  );
                })}
              </svg>
            </div>

            <div className="flex justify-between text-[11px] font-mono text-sage/60 border-t border-surface-border/40 pt-2">
              <span>{points[0]?.label || "Start"}</span>
              <span>Horizon ({timeframe})</span>
              <span>{points[points.length - 1]?.label || "End"}</span>
            </div>
          </Card>

          {/* Cumulative Scenario Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono text-xs">
            <Card className="tech-frame gradient-border beautiful-md p-5 glass-panel border border-red-500/30 space-y-1">
              <div className="text-sage/70 uppercase">Cumulative Status Quo</div>
              <div className="text-2xl font-bold text-red-400 font-display">
                {Math.round(cumulativeStatusQuo)} kg CO2e
              </div>
              <div className="text-[11px] text-sage/60">Assuming no code changes</div>
            </Card>

            <Card className="tech-frame gradient-border beautiful-md p-5 glass-panel border border-amber-400/30 space-y-1">
              <div className="text-sage/70 uppercase">Cumulative Planned</div>
              <div className="text-2xl font-bold text-amber-300 font-display">
                {Math.round(cumulativePlanned)} kg CO2e
              </div>
              <div className="text-[11px] text-sage/60">With gradual image/script compression</div>
            </Card>

            <Card className="tech-frame gradient-border beautiful-md p-5 glass-panel border border-lime/30 space-y-1">
              <div className="text-sage/70 uppercase">Cumulative Net-Zero Path</div>
              <div className="text-2xl font-bold text-lime font-display">
                {Math.round(cumulativeNetZero)} kg CO2e
              </div>
              <div className="text-[11px] text-sage/60">With green hosting & AVIF pipeline</div>
            </Card>
          </div>
        </>
      ) : (
        /* Empty State */
        <div className="p-12 text-center rounded-3xl glass-panel-elevated border border-surface-border space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-surface-elevated border border-surface-border text-sage flex items-center justify-center mx-auto">
            <LineChart className="w-7 h-7" />
          </div>
          <h3 className="font-display text-2xl text-cream uppercase">No Baseline Audit Selected</h3>
          <p className="text-xs sm:text-sm text-sage/75 max-w-md mx-auto">
            Forecasts require an audited website to determine initial payload weight and electricity intensity. Run an audit on the home page or load a demo baseline.
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
