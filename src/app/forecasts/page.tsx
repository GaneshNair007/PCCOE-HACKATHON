"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageIntro, SectionHeading } from "@/components/ui/page";
import { LineChart, Info, ChevronDown, Check } from "lucide-react";
import Link from "next/link";
import { AuditResult } from "@/types/telemetry";

interface Point2D {
  x: number;
  y: number;
}

/**
 * Computes a smooth, continuous Catmull-Rom / Monotone Cubic Bezier path
 * across discrete data points, eliminating amateurish jagged polylines.
 */
function getCubicBezierPath(pts: Point2D[]): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
  let path = `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i === 0 ? 0 : i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return path;
}

/**
 * Computes a closed smooth area path under a cubic curve down to a baseline Y coordinate.
 */
function getCubicAreaPath(pts: Point2D[], bottomY: number): string {
  if (pts.length === 0) return "";
  const curve = getCubicBezierPath(pts);
  const first = pts[0];
  const last = pts[pts.length - 1];
  return `${curve} L ${last.x.toFixed(1)},${bottomY.toFixed(1)} L ${first.x.toFixed(1)},${bottomY.toFixed(1)} Z`;
}

export default function ForecastsPage() {
  const [selectedAudit, setSelectedAudit] = useState<AuditResult | null>(null);
  const [recentAudits, setRecentAudits] = useState<any[]>([]);
  const [isDemoBaseline, setIsDemoBaseline] = useState(false);

  const [timeframe, setTimeframe] = useState<"6M" | "12M" | "24M">("12M");
  const [growthRate, setGrowthRate] = useState<number>(10); // % monthly traffic growth
  const monthlyViews = 100000;
  const [hoveredPoint, setHoveredPoint] = useState<{
    month: string;
    statusQuoKg: number;
    plannedKg: number;
    netZeroKg: number;
  } | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

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

  return (
    <div className="world-forecasts min-w-0 space-y-8 pb-12">
      <PageIntro
        eyebrow="Emissions forecasts"
        title="See the possibilities ahead."
        description="Model future digital carbon trajectory based on real baseline transfer weights, projected traffic growth, and planned engineering remediations."
        actions={recentAudits.length > 0 ? (
          <div className="relative w-full max-w-xs">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-white/[0.06] border border-white/20 text-xs px-4 py-2.5 rounded-2xl text-white backdrop-blur-2xl flex items-center justify-between gap-2 hover:border-[#cbff00] transition-colors cursor-pointer"
            >
              <span className="truncate">{selectedAudit?.domain || "Select monitored baseline…"}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-white/60 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-[#0d120c]/95 border border-white/15 rounded-2xl p-1.5 shadow-2xl backdrop-blur-3xl max-h-80 overflow-y-auto space-y-1">
                  <div className="text-[10px] uppercase font-bold text-white/40 px-3 py-1">Monitored Fleet Baselines</div>
                  {recentAudits.map((a: any) => {
                    const isSelected = selectedAudit?.domain === a.domain;
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
                </div>
              </>
            )}
          </div>
        ) : undefined}
      />

      {/* Persistent Forecast Disclaimer */}
      <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/15 text-xs text-white/80 flex items-start gap-2.5 leading-relaxed backdrop-blur-2xl">
        <Info className="w-4 h-4 text-[#cbff00] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white">Scenario forecast, not a prediction of measured future emissions.</span> Calculations apply your configured monthly growth rate ({growthRate}%) and engineering reduction schedule against the chosen audit baseline.
          {isDemoBaseline && (
            <span className="block mt-1 font-bold text-[#cbff00]">
              Notice: Modeling against a clearly labeled Demonstration Dataset.
            </span>
          )}
        </div>
      </div>

      {selectedAudit ? (
        <>
          {/* Controls Bar */}
          <div className="world-forecast-controls p-6 rounded-2xl glass-panel-elevated border border-surface-border grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono text-xs">
            <div>
              <div className="text-sage/60">Baseline domain</div>
              <div className="text-cream font-bold text-sm mt-1 break-all">{selectedAudit.domain}</div>
              <div className="text-[11px] text-lime">{selectedAudit.co2_grams}g CO2e / visit</div>
            </div>

            <div>
              <div className="flex justify-between">
                <span className="text-sage/60">Monthly traffic growth</span>
                <span className="text-lime font-bold">+{growthRate}% / mo</span>
              </div>
              <input
                type="range"
                aria-label="Monthly traffic growth"
                aria-valuetext={`${growthRate} percent per month`}
                min="0"
                max="30"
                step="2"
                value={growthRate}
                onChange={(e) => setGrowthRate(Number(e.target.value))}
                className="w-full accent-lime bg-surface-elevated h-2 rounded-lg cursor-pointer mt-2"
              />
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2">
              <span className="text-sage/60">Horizon:</span>
              {(["6M", "12M", "24M"] as const).map((tf) => (
                <button
                  key={tf}
                  type="button"
                  aria-pressed={timeframe === tf}
                  aria-label={`${parseInt(tf)} month forecast horizon`}
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
          <Card className="world-chart p-5 sm:p-6 space-y-5">
            <SectionHeading
              title="Emissions Trajectory Comparison"
              description="Monthly carbon output (in kg CO2e) as your visitor count grows. Shows how asset cleanup and renewable cloud hosting prevent emissions spikes."
            />

            {/* Clear Plain-English Legend */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 text-xs font-mono border-b border-surface-border pb-4">
              <span className="flex items-center gap-2 text-white/60">
                <span className="w-4 h-0.5 rounded bg-white/40" />
                <span className="font-semibold text-white">Do Nothing</span>
                <span className="text-[11px] text-white/50">(Status quo: +{growthRate}%/mo traffic)</span>
              </span>
              <span className="flex items-center gap-2 text-white">
                <span className="w-4 h-0.5 rounded bg-white" />
                <span className="font-semibold text-white">Code Clean-up</span>
                <span className="text-[11px] text-white/70">(Image & script reduction)</span>
              </span>
              <span className="flex items-center gap-2 text-[#cbff00]">
                <span className="w-4 h-0.5 rounded bg-[#cbff00]" />
                <span className="font-semibold text-white">Green Cloud + Lean Code</span>
                <span className="text-[11px] text-[#cbff00]/80">(Renewable host + 50% lighter)</span>
              </span>
            </div>

            {/* Dynamic Inspector Bar */}
            <div className="transition-all">
              {hoveredPoint ? (
                <div className="p-3 rounded-xl bg-surface-elevated border border-surface-border flex flex-wrap items-center justify-between gap-3 text-xs font-mono animate-in fade-in duration-150">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="px-2 py-0.5 rounded bg-white/10 text-cream font-bold">{hoveredPoint.month}</span>
                    <span className="text-white/60">Do Nothing: <strong className="text-white">{hoveredPoint.statusQuoKg} kg</strong></span>
                    <span className="text-white">Code Clean-up: <strong className="text-white">{hoveredPoint.plannedKg} kg</strong></span>
                    <span className="text-[#cbff00]">Green Cloud: <strong className="text-[#cbff00]">{hoveredPoint.netZeroKg} kg</strong></span>
                  </div>
                  <div className="text-black font-bold bg-[#cbff00] border border-[#cbff00] px-2.5 py-1 rounded-lg">
                    Avoids {(hoveredPoint.statusQuoKg - hoveredPoint.netZeroKg).toFixed(1)} kg CO2/mo ({Math.round(((hoveredPoint.statusQuoKg - hoveredPoint.netZeroKg) / hoveredPoint.statusQuoKg) * 100)}% saved)
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-surface/60 border border-surface-border/60 text-xs font-mono text-sage/75 flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-lime" />
                    Hover anywhere on the chart or lines to inspect the exact month-by-month carbon savings.
                  </span>
                  <span className="text-[11px] text-sage/50">Baseline: {selectedAudit.co2_grams}g CO2e / page view</span>
                </div>
              )}
            </div>

            {/* SVG Chart with Y-axis numbers & X-axis month ticks */}
            {(() => {
              const ceilingMax = Math.max(Math.ceil(maxVal * 1.15), 5);
              const chartLeft = 65;
              const chartRight = 835;
              const chartTop = 28;
              const chartBottom = 220;
              const chartWidth = chartRight - chartLeft;
              const chartHeight = chartBottom - chartTop;

              const yRatios = [1, 0.75, 0.5, 0.25, 0];

              const getX = (index: number) => chartLeft + (index / (points.length - 1)) * chartWidth;
              const getY = (val: number) => chartBottom - (val / ceilingMax) * chartHeight;

              return (
                <div className="w-full relative overflow-x-auto pt-2">
                  <div className="min-w-[620px] h-64 sm:h-72 w-full">
                    <svg viewBox="0 0 860 260" role="img" aria-labelledby="forecast-chart-title forecast-chart-description" className="w-full h-full select-none">
                      <title id="forecast-chart-title">Emissions trajectory comparison</title>
                      <desc id="forecast-chart-description">Shows monthly emissions in kg CO2e over {monthsCount} months for Status Quo, Code Clean-up, and Green Cloud pathways.</desc>

                      <defs>
                        {/* Apple-grade atmospheric depth gradients */}
                        <linearGradient id="whiteAreaSpline" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
                          <stop offset="60%" stopColor="#ffffff" stopOpacity="0.04" />
                          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                        </linearGradient>
                        <linearGradient id="limeAreaSpline" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#cbff00" stopOpacity="0.32" />
                          <stop offset="60%" stopColor="#cbff00" stopOpacity="0.10" />
                          <stop offset="100%" stopColor="#cbff00" stopOpacity="0.0" />
                        </linearGradient>

                        {/* Soft luminous line glow filter */}
                        <filter id="splineGlow" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="3.5" result="blur" />
                          <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>

                      {/* Y-Axis Header Label */}
                      <text x={chartLeft} y="15" textAnchor="start" className="text-[11px] font-mono fill-sage/60 font-semibold uppercase tracking-wider">
                        Monthly Carbon Output (kg CO2e)
                      </text>

                      {/* Horizontal Gridlines & Y-Axis Labels */}
                      {yRatios.map((ratio) => {
                        const y = chartBottom - ratio * chartHeight;
                        const labelVal = Math.round(ratio * ceilingMax);
                        return (
                          <g key={ratio}>
                            <line
                              x1={chartLeft}
                              y1={y}
                              x2={chartRight}
                              y2={y}
                              stroke="currentColor"
                              className="text-surface-border/60"
                              strokeDasharray={ratio === 0 ? "none" : "3 5"}
                              strokeWidth={ratio === 0 ? "1.5" : "1"}
                            />
                            <text
                              x={chartLeft - 10}
                              y={y + 3.5}
                              textAnchor="end"
                              className="text-[11px] font-mono fill-sage/70 font-medium"
                            >
                              {labelVal} kg
                            </text>
                          </g>
                        );
                      })}

                      {/* Continuous Smooth Area Fill under Status Quo */}
                      <path
                        fill="url(#whiteAreaSpline)"
                        d={getCubicAreaPath(
                          points.map((p, i) => ({ x: getX(i), y: getY(p.statusQuoKg) })),
                          chartBottom
                        )}
                      />

                      {/* Continuous Smooth Area Fill under Green Cloud */}
                      <path
                        fill="url(#limeAreaSpline)"
                        d={getCubicAreaPath(
                          points.map((p, i) => ({ x: getX(i), y: getY(p.netZeroKg) })),
                          chartBottom
                        )}
                      />

                      {/* Status Quo Cubic Spline Curve (Apple Frosted White 45%) */}
                      <path
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.45)"
                        strokeWidth="2.5"
                        strokeDasharray="4 4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d={getCubicBezierPath(points.map((p, i) => ({ x: getX(i), y: getY(p.statusQuoKg) })))}
                      />

                      {/* Planned Reductions Spline Curve (Crisp Pure White) */}
                      <path
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="2.5"
                        strokeDasharray="6 4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d={getCubicBezierPath(points.map((p, i) => ({ x: getX(i), y: getY(p.plannedKg) })))}
                      />

                      {/* Net-Zero Target Spline Curve (Radiant CarbonTerra Lime) */}
                      <path
                        fill="none"
                        stroke="#cbff00"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter="url(#splineGlow)"
                        d={getCubicBezierPath(points.map((p, i) => ({ x: getX(i), y: getY(p.netZeroKg) })))}
                      />

                      {/* X-Axis Month Markers */}
                      {points.map((p, i) => {
                        const x = getX(i);
                        const isVisibleTick =
                          monthsCount <= 6
                            ? true
                            : monthsCount <= 12
                            ? i === 0 || (i + 1) % 2 === 0 || i === monthsCount - 1
                            : i === 0 || (i + 1) % 4 === 0 || i === monthsCount - 1;

                        return (
                          <g key={`tick-${i}`}>
                            <line
                              x1={x}
                              y1={chartBottom}
                              x2={x}
                              y2={chartBottom + 5}
                              stroke="currentColor"
                              className="text-surface-border"
                              strokeWidth="1.5"
                            />
                            {isVisibleTick && (
                              <text
                                x={x}
                                y={chartBottom + 20}
                                textAnchor="middle"
                                className={`text-[11px] font-mono ${
                                  hoveredPoint?.month === p.label ? "fill-cream font-bold" : "fill-sage/60 font-normal"
                                }`}
                              >
                                {p.label}
                              </text>
                            )}
                          </g>
                        );
                      })}

                      {/* Active Hover Crosshair Line & High-Precision Pulsing Nodes */}
                      {points.map((p, i) => {
                        const x = getX(i);
                        const isHovered = hoveredPoint?.month === p.label;
                        if (!isHovered) return null;

                        const yRed = getY(p.statusQuoKg);
                        const yAmber = getY(p.plannedKg);
                        const yLime = getY(p.netZeroKg);

                        return (
                          <g key={`hover-guide-${i}`} pointerEvents="none">
                            {/* Vertical Crosshair Guide */}
                            <line
                              x1={x}
                              y1={chartTop}
                              x2={x}
                              y2={chartBottom}
                              stroke="#ffffff"
                              strokeOpacity="0.4"
                              strokeDasharray="3 3"
                              strokeWidth="1.5"
                            />

                            {/* Dual Concentric Pulsing Red Node */}
                            <circle cx={x} cy={yRed} r="9" fill="#f87171" fillOpacity="0.25" />
                            <circle cx={x} cy={yRed} r="5" fill="#f87171" stroke="#ffffff" strokeWidth="2" />

                            {/* Dual Concentric Pulsing Amber Node */}
                            <circle cx={x} cy={yAmber} r="8" fill="#fbbf24" fillOpacity="0.25" />
                            <circle cx={x} cy={yAmber} r="4.5" fill="#fbbf24" stroke="#ffffff" strokeWidth="2" />

                            {/* Dual Concentric Pulsing Lime Node */}
                            <circle cx={x} cy={yLime} r="10" fill="#cbff00" fillOpacity="0.3" />
                            <circle cx={x} cy={yLime} r="5.5" fill="#cbff00" stroke="#121610" strokeWidth="2" />
                          </g>
                        );
                      })}

                      {/* Interactive Scrubber Hitbox Columns */}
                      {points.map((p, i) => {
                        const x = getX(i);
                        const colWidth = chartWidth / (points.length - 1);
                        return (
                          <rect
                            key={`hitbox-${i}`}
                            x={x - colWidth / 2}
                            y={chartTop - 10}
                            width={colWidth}
                            height={chartHeight + 35}
                            fill="transparent"
                            className="cursor-pointer"
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
                </div>
              );
            })()}

            {/* Bottom Timeline Summary */}
            <div className="flex justify-between items-center text-xs font-mono text-sage/60 border-t border-surface-border pt-3">
              <span>Start (Month 1)</span>
              <span className="text-cream font-medium">Trajectory Horizon: {timeframe}</span>
              <span>End ({points[points.length - 1]?.label || "End"})</span>
            </div>

            {/* Table Details */}
            <details className="border-t border-surface-border pt-3">
              <summary className="cursor-pointer text-xs font-mono text-sage hover:text-cream">
                View numerical table breakdown ({points.length} months)
              </summary>
              <div className="mt-3 max-w-full overflow-x-auto" role="region" aria-label="Monthly forecast values" tabIndex={0}>
                <table className="w-full min-w-[560px] text-left text-xs font-mono">
                  <caption className="sr-only">Estimated emissions in kg CO2e per month</caption>
                  <thead className="text-sage border-b border-surface-border">
                    <tr>
                      <th scope="col" className="p-3">Timeline</th>
                      <th scope="col" className="p-3">Do Nothing</th>
                      <th scope="col" className="p-3">Code Clean-up</th>
                      <th scope="col" className="p-3">Green Cloud</th>
                      <th scope="col" className="p-3 text-lime">Monthly Saved</th>
                    </tr>
                  </thead>
                  <tbody>
                    {points.map((point) => {
                      const monthlySaved = (point.statusQuoKg - point.netZeroKg).toFixed(1);
                      return (
                        <tr key={point.label} className="border-t border-surface-border/50 hover:bg-surface-elevated/40">
                          <th scope="row" className="p-3 text-cream font-bold">{point.label}</th>
                          <td className="p-3 text-white/60">{point.statusQuoKg} kg</td>
                          <td className="p-3 text-white">{point.plannedKg} kg</td>
                          <td className="p-3 text-[#cbff00] font-bold">{point.netZeroKg} kg</td>
                          <td className="p-3 text-[#cbff00] font-bold">+{monthlySaved} kg</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </details>
          </Card>

          {/* Cumulative Scenario Comparison */}
          <div className="world-open-metrics grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono text-xs">
            <Card className="p-5 glass-panel border border-white/15 space-y-1.5">
              <div className="text-white/60 font-semibold uppercase tracking-wider text-[10px]">Total Footprint (Do Nothing)</div>
              <div className="text-2xl font-bold text-white/70 font-display">
                {Math.round(cumulativeStatusQuo)} kg CO2e
              </div>
              <div className="text-[11px] text-white/50">If website assets and hosting remain unchanged as traffic scales</div>
            </Card>

            <Card className="p-5 glass-panel border border-white/20 space-y-1.5">
              <div className="text-white/80 font-semibold uppercase tracking-wider text-[10px]">Total Footprint (Code Clean-up)</div>
              <div className="text-2xl font-bold text-white font-display">
                {Math.round(cumulativePlanned)} kg CO2e
              </div>
              <div className="text-[11px] text-white/60">Achieved via image compression, script deferral, and tree-shaking</div>
            </Card>

            <Card className="p-5 glass-panel border border-[#cbff00]/40 space-y-1.5 shadow-[0_0_20px_rgba(203,255,0,0.1)]">
              <div className="text-[#cbff00] font-semibold uppercase tracking-wider text-[10px]">Total Footprint (Green Cloud)</div>
              <div className="text-2xl font-bold text-[#cbff00] font-display">
                {Math.round(cumulativeNetZero)} kg CO2e
              </div>
              <div className="text-[11px] text-white/70">Maximum reduction via 100% renewable hosting and lean payloads</div>
            </Card>
          </div>
        </>
      ) : (
        /* Empty State */
        <div className="p-6 sm:p-10 text-center rounded-3xl glass-panel-elevated border border-surface-border space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-surface-elevated border border-surface-border text-sage flex items-center justify-center mx-auto">
            <LineChart className="w-7 h-7" />
          </div>
          <h2 className="font-display text-2xl text-cream">Start with a baseline</h2>
          <p className="text-xs sm:text-sm text-sage/75 max-w-md mx-auto">
            Forecasts require an audited website to determine initial payload weight and electricity intensity. Run an audit on the home page or load a demo baseline.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link href="/" className="px-4 py-2 rounded-xl bg-lime text-black font-mono font-bold text-xs">
              Audit a website →
            </Link>
            <Button variant="outline" size="sm" onClick={handleLoadDemoBaseline} className="text-xs font-mono">
              Load demo baseline
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
