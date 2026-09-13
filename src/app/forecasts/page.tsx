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
          <Card className="world-chart p-5 sm:p-6 space-y-4">
            <SectionHeading title="Compare your scenarios" description="Monthly estimated emissions in kg CO2e. The renewable + AVIF scenario is a reduction pathway, not a claim of zero emissions." />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-border pb-4">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-red-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  Status quo ({growthRate}% growth)
                </span>
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  Planned asset reductions
                </span>
                <span className="flex items-center gap-1.5 text-lime">
                  <span className="w-2.5 h-2.5 rounded-full bg-lime" />
                  Net-zero pathway (renewable + AVIF)
                </span>
              </div>

            </div>
            <div className="min-h-10 text-xs font-mono text-sage" aria-hidden="true">
              {hoveredPoint ? `${hoveredPoint.month}: Status quo ${hoveredPoint.statusQuoKg}kg · Planned ${hoveredPoint.plannedKg}kg · Net-zero pathway ${hoveredPoint.netZeroKg}kg` : "Hover a point for details, or open the monthly values below."}
            </div>

            {/* SVG Chart */}
            <div className="h-52 sm:h-64 w-full relative px-2">
              <svg viewBox="0 0 800 240" role="img" aria-labelledby="forecast-chart-title forecast-chart-description" className="w-full h-full overflow-visible">
                <title id="forecast-chart-title">Monthly emissions by scenario</title>
                <desc id="forecast-chart-description">Compare status quo, planned reductions, and renewable hosting with AVIF over {monthsCount} months. Exact values are available in the table below.</desc>
                {/* Grid Lines */}
                {[0, 60, 120, 180, 240].map((y) => (
                  <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="currentColor" className="text-sage/10" strokeDasharray="4 4" />
                ))}

                {/* Status Quo Line (Red) */}
                <polyline
                  fill="none"
                  stroke="currentColor"
                  className="text-red-400"
                  strokeWidth="2.5"
                  points={points
                    .map((p, i) => `${(i / (points.length - 1)) * 800},${240 - (p.statusQuoKg / maxVal) * 220}`)
                    .join(" ")}
                />

                {/* Planned Reductions Line (Amber) */}
                <polyline
                  fill="none"
                  stroke="currentColor"
                  className="text-amber-400"
                  strokeWidth="2.5"
                  points={points
                    .map((p, i) => `${(i / (points.length - 1)) * 800},${240 - (p.plannedKg / maxVal) * 220}`)
                    .join(" ")}
                />

                {/* Net-Zero Target Line (Lime) */}
                <polyline
                  fill="none"
                  stroke="currentColor"
                  className="text-lime"
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
                      fill="currentColor"
                      className="cursor-pointer text-red-400"
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
            <details className="border-t border-surface-border pt-3">
              <summary className="cursor-pointer text-sm text-sage">View monthly forecast values</summary>
              <div className="mt-3 max-w-full overflow-x-auto" role="region" aria-label="Monthly forecast values" tabIndex={0}>
                <table className="w-full min-w-[520px] text-left text-xs font-mono">
                  <caption className="sr-only">Estimated emissions in kg CO2e per month</caption>
                  <thead className="text-sage"><tr><th scope="col" className="p-3">Month</th><th scope="col" className="p-3">Status quo</th><th scope="col" className="p-3">Planned</th><th scope="col" className="p-3">Net-zero pathway</th></tr></thead>
                  <tbody>{points.map((point) => <tr key={point.label} className="border-t border-surface-border"><th scope="row" className="p-3 text-cream">{point.label}</th><td className="p-3 text-red-400">{point.statusQuoKg} kg</td><td className="p-3 text-amber-300">{point.plannedKg} kg</td><td className="p-3 text-lime">{point.netZeroKg} kg</td></tr>)}</tbody>
                </table>
              </div>
            </details>
          </Card>

          {/* Cumulative Scenario Comparison */}
          <div className="world-open-metrics grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono text-xs">
            <Card className="p-5 glass-panel border border-red-500/30 space-y-1">
              <div className="text-sage/70">Cumulative status quo</div>
              <div className="text-2xl font-bold text-red-400 font-display">
                {Math.round(cumulativeStatusQuo)} kg CO2e
              </div>
              <div className="text-[11px] text-sage/60">Assuming no code changes</div>
            </Card>

            <Card className="p-5 glass-panel border border-amber-400/30 space-y-1">
              <div className="text-sage/70">Cumulative planned</div>
              <div className="text-2xl font-bold text-amber-300 font-display">
                {Math.round(cumulativePlanned)} kg CO2e
              </div>
              <div className="text-[11px] text-sage/60">With gradual image/script compression</div>
            </Card>

            <Card className="p-5 glass-panel border border-lime/30 space-y-1">
              <div className="text-sage/70">Cumulative net-zero pathway</div>
              <div className="text-2xl font-bold text-lime font-display">
                {Math.round(cumulativeNetZero)} kg CO2e
              </div>
              <div className="text-[11px] text-sage/60">With green hosting & AVIF pipeline</div>
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
