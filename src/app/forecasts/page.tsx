"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageIntro, SectionHeading } from "@/components/ui/page";
import { LineChart, Info } from "lucide-react";
import Link from "next/link";
import { AuditResult } from "@/types/telemetry";

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
            <select
              aria-label="Select monitored forecast baseline"
              onChange={(e) => handleSelectDomain(e.target.value)}
              className="w-full max-w-xs bg-surface-elevated border border-surface-border text-xs font-mono px-3 py-2 rounded-xl text-cream"
              value={selectedAudit?.domain || ""}
            >
              <option value="" disabled>
                Select monitored baseline…
              </option>
              {recentAudits.map((a: any) => (
                <option key={a.domain} value={a.domain}>
                  {a.domain} ({a.grade}, {a.co2}g)
                </option>
              ))}
            </select>
        ) : undefined}
      />

      {/* Persistent Forecast Disclaimer */}
      <div className="p-4 rounded-2xl bg-surface border border-amber-400/30 text-xs text-amber-200 flex items-start gap-2.5 leading-relaxed">
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
              <span className="flex items-center gap-2 text-red-400">
                <span className="w-3.5 h-1.5 rounded-full bg-red-400 shadow-sm shadow-red-500/50" />
                <span className="font-semibold text-cream">Do Nothing</span>
                <span className="text-[11px] text-red-400/80">(Status quo: +{growthRate}%/mo traffic)</span>
              </span>
              <span className="flex items-center gap-2 text-amber-300">
                <span className="w-3.5 h-1.5 rounded-full bg-amber-400 shadow-sm shadow-amber-500/50" />
                <span className="font-semibold text-cream">Code Clean-up</span>
                <span className="text-[11px] text-amber-300/80">(Image & script reduction)</span>
              </span>
              <span className="flex items-center gap-2 text-lime">
                <span className="w-3.5 h-1.5 rounded-full bg-lime shadow-sm shadow-lime/50" />
                <span className="font-semibold text-cream">Green Cloud + Lean Code</span>
                <span className="text-[11px] text-lime/80">(Renewable host + 50% lighter)</span>
              </span>
            </div>

            {/* Dynamic Inspector Bar */}
            <div className="transition-all">
              {hoveredPoint ? (
                <div className="p-3 rounded-xl bg-surface-elevated border border-surface-border flex flex-wrap items-center justify-between gap-3 text-xs font-mono animate-in fade-in duration-150">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="px-2 py-0.5 rounded bg-white/10 text-cream font-bold">{hoveredPoint.month}</span>
                    <span className="text-red-400">🔴 Do Nothing: <strong className="text-cream">{hoveredPoint.statusQuoKg} kg</strong></span>
                    <span className="text-amber-300">🟡 Code Clean-up: <strong className="text-cream">{hoveredPoint.plannedKg} kg</strong></span>
                    <span className="text-lime">🟢 Green Cloud: <strong className="text-cream">{hoveredPoint.netZeroKg} kg</strong></span>
                  </div>
                  <div className="text-lime font-bold bg-lime/10 border border-lime/25 px-2.5 py-1 rounded-lg">
                    Avoids {(hoveredPoint.statusQuoKg - hoveredPoint.netZeroKg).toFixed(1)} kg CO2/mo ({Math.round(((hoveredPoint.statusQuoKg - hoveredPoint.netZeroKg) / hoveredPoint.statusQuoKg) * 100)}% saved)
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-surface/60 border border-surface-border/60 text-xs font-mono text-sage/75 flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
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
                        {/* Gradients for visual clarity */}
                        <linearGradient id="redArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f87171" stopOpacity="0.22" />
                          <stop offset="100%" stopColor="#f87171" stopOpacity="0.0" />
                        </linearGradient>
                        <linearGradient id="limeArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#a3e635" stopOpacity="0.18" />
                          <stop offset="100%" stopColor="#a3e635" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Y-Axis Label */}
                      <text x={chartLeft} y="15" textAnchor="start" className="text-[10px] font-mono fill-sage/60 font-semibold uppercase tracking-wider">
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
                              className="text-surface-border"
                              strokeDasharray={ratio === 0 ? "none" : "4 4"}
                              strokeWidth={ratio === 0 ? "1.5" : "1"}
                            />
                            <text
                              x={chartLeft - 10}
                              y={y + 3.5}
                              textAnchor="end"
                              className="text-[10px] font-mono fill-sage/70 font-medium"
                            >
                              {labelVal} kg
                            </text>
                          </g>
                        );
                      })}

                      {/* Area Fill under Status Quo */}
                      <polygon
                        fill="url(#redArea)"
                        points={`
                          ${getX(0)},${chartBottom}
                          ${points.map((p, i) => `${getX(i)},${getY(p.statusQuoKg)}`).join(" ")}
                          ${getX(points.length - 1)},${chartBottom}
                        `}
                      />

                      {/* Area Fill under Green Cloud */}
                      <polygon
                        fill="url(#limeArea)"
                        points={`
                          ${getX(0)},${chartBottom}
                          ${points.map((p, i) => `${getX(i)},${getY(p.netZeroKg)}`).join(" ")}
                          ${getX(points.length - 1)},${chartBottom}
                        `}
                      />

                      {/* Status Quo Curve (Red) */}
                      <polyline
                        fill="none"
                        stroke="#f87171"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={points.map((p, i) => `${getX(i)},${getY(p.statusQuoKg)}`).join(" ")}
                      />

                      {/* Planned Reductions Curve (Amber) */}
                      <polyline
                        fill="none"
                        stroke="#fbbf24"
                        strokeWidth="2.5"
                        strokeDasharray="6 4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={points.map((p, i) => `${getX(i)},${getY(p.plannedKg)}`).join(" ")}
                      />

                      {/* Net-Zero Target Curve (Lime) */}
                      <polyline
                        fill="none"
                        stroke="#a3e635"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={points.map((p, i) => `${getX(i)},${getY(p.netZeroKg)}`).join(" ")}
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
                                className={`text-[10px] font-mono ${
                                  hoveredPoint?.month === p.label ? "fill-cream font-bold" : "fill-sage/60 font-normal"
                                }`}
                              >
                                {p.label}
                              </text>
                            )}
                          </g>
                        );
                      })}

                      {/* Active Hover Crosshair Line & Highlight Dots */}
                      {points.map((p, i) => {
                        const x = getX(i);
                        const isHovered = hoveredPoint?.month === p.label;
                        if (!isHovered) return null;

                        const yRed = getY(p.statusQuoKg);
                        const yAmber = getY(p.plannedKg);
                        const yLime = getY(p.netZeroKg);

                        return (
                          <g key={`hover-guide-${i}`} pointerEvents="none">
                            <line
                              x1={x}
                              y1={chartTop}
                              x2={x}
                              y2={chartBottom}
                              stroke="#ffffff"
                              strokeOpacity="0.3"
                              strokeDasharray="3 3"
                              strokeWidth="1.5"
                            />
                            {/* Glowing Red Dot */}
                            <circle cx={x} cy={yRed} r="6" fill="#f87171" stroke="#ffffff" strokeWidth="2" />
                            {/* Glowing Amber Dot */}
                            <circle cx={x} cy={yAmber} r="5" fill="#fbbf24" stroke="#ffffff" strokeWidth="2" />
                            {/* Glowing Lime Dot */}
                            <circle cx={x} cy={yLime} r="6" fill="#a3e635" stroke="#ffffff" strokeWidth="2" />
                          </g>
                        );
                      })}

                      {/* Transparent Hover Hitbox Columns for easy mouse interaction */}
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
                      <th scope="col" className="p-3">🔴 Do Nothing</th>
                      <th scope="col" className="p-3">🟡 Code Clean-up</th>
                      <th scope="col" className="p-3">🟢 Green Cloud</th>
                      <th scope="col" className="p-3 text-lime">🌿 Monthly Saved</th>
                    </tr>
                  </thead>
                  <tbody>
                    {points.map((point) => {
                      const monthlySaved = (point.statusQuoKg - point.netZeroKg).toFixed(1);
                      return (
                        <tr key={point.label} className="border-t border-surface-border/50 hover:bg-surface-elevated/40">
                          <th scope="row" className="p-3 text-cream font-bold">{point.label}</th>
                          <td className="p-3 text-red-400">{point.statusQuoKg} kg</td>
                          <td className="p-3 text-amber-300">{point.plannedKg} kg</td>
                          <td className="p-3 text-lime">{point.netZeroKg} kg</td>
                          <td className="p-3 text-lime font-bold">+{monthlySaved} kg</td>
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
            <Card className="p-5 glass-panel border border-red-500/30 space-y-1.5">
              <div className="text-sage/70 font-semibold uppercase tracking-wider text-[10px]">Total Footprint (Do Nothing)</div>
              <div className="text-2xl font-bold text-red-400 font-display">
                {Math.round(cumulativeStatusQuo)} kg CO2e
              </div>
              <div className="text-[11px] text-sage/60">If website assets and hosting remain unchanged as traffic scales</div>
            </Card>

            <Card className="p-5 glass-panel border border-amber-400/30 space-y-1.5">
              <div className="text-sage/70 font-semibold uppercase tracking-wider text-[10px]">Total Footprint (Code Clean-up)</div>
              <div className="text-2xl font-bold text-amber-300 font-display">
                {Math.round(cumulativePlanned)} kg CO2e
              </div>
              <div className="text-[11px] text-sage/60">Achieved via image compression, script deferral, and tree-shaking</div>
            </Card>

            <Card className="p-5 glass-panel border border-lime/30 space-y-1.5">
              <div className="text-sage/70 font-semibold uppercase tracking-wider text-[10px]">Total Footprint (Green Cloud)</div>
              <div className="text-2xl font-bold text-lime font-display">
                {Math.round(cumulativeNetZero)} kg CO2e
              </div>
              <div className="text-[11px] text-sage/60">Maximum reduction via 100% renewable hosting and lean payloads</div>
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
