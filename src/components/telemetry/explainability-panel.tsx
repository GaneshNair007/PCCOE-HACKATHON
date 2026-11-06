"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Scale,
  Sparkles,
  ShieldCheck,
  Server,
  Zap,
  Info,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  Compass,
  FileSpreadsheet,
  RefreshCw,
  Sliders,
  BookOpen,
} from "lucide-react";
import { AuditResult } from "@/types/telemetry";
import { CARBONERRA_CONFIG } from "@/lib/config";
import Link from "next/link";

interface ExplainabilityPanelProps {
  auditData: AuditResult;
  onRerun?: () => void;
}

export function ExplainabilityPanel({ auditData, onRerun }: ExplainabilityPanelProps) {
  const [activeTab, setActiveTab] = useState<"formula" | "provenance" | "caching" | "limitations" | "research">(
    "formula"
  );
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const totalBytes = auditData.total_bytes;
  const operationalKwh = (totalBytes * CARBONERRA_CONFIG.operationalKwhPerByte).toExponential(4);
  const embodiedKwh = (totalBytes * CARBONERRA_CONFIG.embodiedKwhPerByte).toExponential(4);
  const totalKwh = (totalBytes * CARBONERRA_CONFIG.totalKwhPerByte).toExponential(4);

  return (
    <Card className="p-6 sm:p-8 glass-panel-elevated border border-lime/30 rounded-3xl space-y-6">
      {/* Header with Human-AI Explainability Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-sans text-lime uppercase tracking-wider mb-1">
            <Scale className="w-4 h-4 text-lime" />
            <span className="font-bold">HOW THIS IS CALCULATED</span>
            <span className="bg-surface-elevated px-2 py-0.5 rounded text-xs text-cream border border-surface-border font-sans font-bold uppercase">
              SUSTAINABLE WEB DESIGN STANDARD
            </span>
          </div>
          <h3 className="font-display text-2xl sm:text-3xl font-bold uppercase text-cream tracking-tight">
            SCIENTIFIC METHODOLOGY &amp; EMISSIONS FORMULA
          </h3>
          <p className="text-xs text-sage/75 mt-1 max-w-xl font-sans">
            Every metric in CarbonTerra is auditable. Inspect the formulas, regional grid electricity factors, and caching boundaries used for{" "}
            <span className="text-lime font-sans font-bold">{auditData.domain}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1.5 rounded-xl bg-surface-elevated border border-surface-border text-xs font-sans text-cream hover:text-lime hover:border-lime/40 transition-all flex items-center gap-1.5 cursor-pointer font-bold uppercase"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" /> Collapse Details
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" /> Expand Inspector
              </>
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: "formula", label: "1. Emissions Formula", icon: <Zap className="w-3.5 h-3.5" /> },
              { id: "provenance", label: "2. Server & Grid Lineage", icon: <Server className="w-3.5 h-3.5" /> },
              { id: "caching", label: "3. Cache & Repeat Visits", icon: <Layers className="w-3.5 h-3.5" /> },
              { id: "limitations", label: "4. Measurement Notes", icon: <Info className="w-3.5 h-3.5" /> },
              { id: "research", label: "5. Research & Benchmarks", icon: <BookOpen className="w-3.5 h-3.5" /> },
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-sans transition-all cursor-pointer ${
                    isSelected
                      ? "bg-lime text-black font-bold shadow-[0_0_15px_rgba(203,255,0,0.3)]"
                      : "bg-surface-elevated text-sage/80 hover:text-cream border border-surface-border hover:border-lime/40"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Formula Transparency */}
          {activeTab === "formula" && (
            <div className="space-y-4 font-sans text-xs">
              <div className="p-4 rounded-2xl bg-black/60 border border-surface-border space-y-3">
                <div className="text-lime font-bold text-xs uppercase flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  Sustainable Web Design Model v4 Formula Breakdown
                </div>
                <div className="p-3 rounded-xl bg-surface-elevated/70 border border-surface-border text-cream/90 space-y-1.5 text-xs leading-relaxed">
                  <div>
                    <span className="text-sage/80">Transferred Payload (B):</span>{" "}
                    <span className="text-lime font-bold font-display tabular-nums">{totalBytes.toLocaleString()} bytes</span>{" "}
                    (<span className="font-display tabular-nums">{(totalBytes / (1024 * 1024)).toFixed(2)} MB</span>)
                  </div>
                  <div>
                    <span className="text-sage/80">Operational Energy (E_op):</span>{" "}
                    <span>{totalBytes} × {CARBONERRA_CONFIG.operationalKwhPerByte} = </span>
                    <span className="text-cream font-bold font-display tabular-nums">{operationalKwh} kWh</span>
                  </div>
                  <div>
                    <span className="text-sage/80">Embodied Hardware Energy (E_emb):</span>{" "}
                    <span>{totalBytes} × {CARBONERRA_CONFIG.embodiedKwhPerByte} = </span>
                    <span className="text-cream font-bold font-display tabular-nums">{embodiedKwh} kWh</span>
                  </div>
                  <div className="pt-1 border-t border-surface-border/60">
                    <span className="text-sage/80">Total Electricity (E_total):</span>{" "}
                    <span className="text-lime font-bold font-display tabular-nums">{totalKwh} kWh</span>
                  </div>
                  <div>
                    <span className="text-sage/80">Grid Emissions Factor (I_grid):</span>{" "}
                    <span className="text-cream font-bold font-display tabular-nums">{auditData.grid_intensity_val} gCO2e/kWh</span>{" "}
                    ({auditData.grid_intensity_source === "resolved_regional" ? "Location-Specific Regional Grid" : "Global Default"})
                  </div>
                  <div className="pt-1 text-sm font-bold text-lime font-display tabular-nums">
                    Emissions: {auditData.co2_grams} gCO2e per visit (EcoScore Grade {auditData.eco_score})
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Datacenter Grid Lineage */}
          {activeTab === "provenance" && (
            <div className="space-y-4 font-sans text-xs">
              <div className="p-4 rounded-2xl bg-black/60 border border-surface-border space-y-3">
                <div className="text-lime font-bold text-xs uppercase flex items-center gap-2">
                  <Server className="w-4 h-4" />
                  Infrastructure Lineage & Verification Chain
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-surface-elevated/70 border border-surface-border space-y-1">
                    <div className="text-sage/80 uppercase text-xs">Resolved Hosting IP</div>
                    <div className="text-cream font-bold">{auditData.record?.gridContext?.resolvedIp || "Public IP Protected"}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-elevated/70 border border-surface-border space-y-1">
                    <div className="text-sage/80 uppercase text-xs">Hosting Country / Region</div>
                    <div className="text-cream font-bold">
                      {auditData.hosting_country} ({auditData.hosting_country_code || "Global"})
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-elevated/70 border border-surface-border space-y-1">
                    <div className="text-sage/80 uppercase text-xs">Renewable Hosting State</div>
                    <div className="text-lime font-bold">
                      {auditData.hosting.green ? "Verified Renewable Host" : "Standard Datacenter Grid"}
                    </div>
                    <div className="text-xs text-sage/80">
                      Source: The Green Web Foundation greencheck
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-elevated/70 border border-surface-border space-y-1">
                    <div className="text-sage/80 uppercase text-xs">Grid Carbon Intensity</div>
                    <div className="text-lime font-bold">
                      {auditData.grid_intensity_val} gCO2e / kWh
                    </div>
                    <div className="text-xs text-sage/80">
                      Granularity: {auditData.grid_intensity_source === "resolved_regional" ? "Country-level specific" : "Global baseline fallback"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Caching & Sensitivity Bounds */}
          {activeTab === "caching" && (
            <div className="space-y-4 font-sans text-xs">
              <div className="p-4 rounded-2xl bg-black/60 border border-surface-border space-y-3">
                <div className="text-lime font-bold text-xs uppercase flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Sensitivity Banding & Return-Visitor Physics
                </div>
                <p className="text-sage/80 text-xs leading-relaxed">
                  Web pages exhibit divergent footprints between first-time visitors (cold browser cache, full asset download) and returning visitors (warm cache, 60–85% asset reuse). CarbonTerra avoids deceptive single-point numbers by modeling a scientific sensitivity range:
                </p>
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-elevated/80 border border-surface-border text-cream">
                  <div>
                    <span className="text-sage/80 block text-xs uppercase font-medium">Lower Bound (Warm Cache)</span>
                    <span className="text-lime font-bold text-sm font-display tabular-nums">{auditData.range_low_g} g CO2e</span>
                  </div>
                  <div className="text-center">
                    <span className="text-sage/80 block text-xs uppercase font-medium">Central Estimate</span>
                    <span className="text-cream font-bold text-sm font-display tabular-nums">{auditData.co2_grams} g CO2e</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sage/80 block text-xs uppercase font-medium">Upper Bound (Cold Cache)</span>
                    <span className="text-white/90 font-bold text-sm font-display tabular-nums">{auditData.range_high_g} g CO2e</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Explicit Limitations */}
          {activeTab === "limitations" && (
            <div className="space-y-4 font-sans text-xs">
              <div className="p-4 rounded-2xl bg-black/60 border border-surface-border space-y-3">
                <div className="text-lime font-bold text-xs uppercase flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Documented Scientific Limitations
                </div>
                <ul className="list-disc list-inside space-y-1.5 text-sage/80 text-xs leading-relaxed">
                  {CARBONERRA_CONFIG.standardLimitations.map((lim, idx) => (
                    <li key={idx}>{lim}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Tab 5: Academic Research & HTTP Archive Benchmarks */}
          {activeTab === "research" && (
            <div className="space-y-4 font-sans text-xs">
              {/* Empirical Benchmark Comparison */}
              <div className="p-4 rounded-2xl bg-black/60 border border-surface-border space-y-3">
                <div className="text-lime font-bold text-xs uppercase flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Scale className="w-4 h-4" /> HTTP Archive &amp; Web Almanac Empirical Benchmarks
                  </span>
                  <span className="text-[10px] text-white/50">Global Web Crawler Crawl Data</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-surface-elevated/70 border border-white/10 space-y-1">
                    <div className="text-white/60 text-[11px] uppercase font-medium">Eco-Optimized (Top 10%)</div>
                    <div className="text-lime font-bold text-base font-display tabular-nums">&lt; 400 KB</div>
                    <div className="text-[10px] text-white/50">Modern WebP/AVIF, strict code splitting</div>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-elevated/70 border border-white/10 space-y-1">
                    <div className="text-white/60 text-[11px] uppercase font-medium">Global Median Page</div>
                    <div className="text-white font-bold text-base font-display tabular-nums">2.45 MB (2,450 KB)</div>
                    <div className="text-[10px] text-white/50">HTTP Archive 50th percentile across millions of URLs</div>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-elevated/70 border border-white/10 space-y-1">
                    <div className="text-white/60 text-[11px] uppercase font-medium">This Monitored Page</div>
                    <div className="text-lime font-bold text-base font-display tabular-nums">{(totalBytes / (1024 * 1024)).toFixed(2)} MB</div>
                    <div className="text-[10px] text-white/50 font-display tabular-nums">{auditData.metrics.cleaner_than_percentile}% cleaner than tested URLs</div>
                  </div>
                </div>
              </div>

              {/* Peer-Reviewed Scientific Research Papers */}
              <div className="p-4 rounded-2xl bg-black/60 border border-surface-border space-y-3">
                <div className="text-lime font-bold text-xs uppercase flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Peer-Reviewed Academic Research Foundations
                </div>
                <div className="space-y-2.5">
                  {CARBONERRA_CONFIG.researchPapers.map((paper, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-surface-elevated/50 border border-white/10 space-y-1 font-sans">
                      <div className="text-white font-bold text-xs flex flex-wrap items-center justify-between gap-2">
                        <span>{paper.title}</span>
                        <span className="text-[10px] font-sans font-semibold text-lime border border-lime/30 px-1.5 py-0.5 rounded">{paper.journal}</span>
                      </div>
                      <div className="text-[11px] text-white/60 font-sans">{paper.citation}</div>
                      <div className="text-xs text-white/80 leading-relaxed font-sans">{paper.keyFinding}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Human Control Bar (PAIR Guidance) */}
          <div className="pt-3 border-t border-surface-border/60 flex flex-wrap items-center justify-between gap-3 text-xs font-sans">
            <div className="flex items-center gap-2 text-sage/70 text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-lime" />
              <span>Human-in-the-loop: You can audit, simulate, or export at any time.</span>
            </div>
            <div className="flex items-center gap-2">
              {onRerun && (
                <button
                  onClick={onRerun}
                  className="px-3 py-1.5 rounded-xl bg-surface-elevated border border-surface-border text-cream hover:text-lime hover:border-lime/40 transition-all flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <RefreshCw className="w-3 h-3" /> Re-Run Audit
                </button>
              )}
              <Link
                href="/simulator"
                className="px-3 py-1.5 rounded-xl bg-lime text-black font-bold hover:bg-lime/90 transition-all flex items-center gap-1.5 text-xs"
              >
                <Sliders className="w-3 h-3" /> Run Simulator →
              </Link>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
