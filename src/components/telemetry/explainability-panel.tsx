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
} from "lucide-react";
import { AuditResult } from "@/types/telemetry";
import { CARBONERRA_CONFIG } from "@/lib/config";
import Link from "next/link";

interface ExplainabilityPanelProps {
  auditData: AuditResult;
  onRerun?: () => void;
}

export function ExplainabilityPanel({ auditData, onRerun }: ExplainabilityPanelProps) {
  const [activeTab, setActiveTab] = useState<"formula" | "provenance" | "caching" | "limitations">(
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
          <div className="flex items-center gap-2 text-xs font-mono text-lime uppercase tracking-wider mb-1">
            <Scale className="w-4 h-4 text-lime" />
            <span>Human-AI Explainability & Provenance</span>
            <span className="bg-surface-elevated px-2 py-0.5 rounded text-[10px] text-cream border border-surface-border font-mono">
              Google PAIR • IBM Carbon for AI
            </span>
          </div>
          <h3 className="font-display text-2xl sm:text-3xl text-cream uppercase">
            Score Lineage & Scientific Basis
          </h3>
          <p className="text-xs text-sage/75 mt-1 max-w-xl">
            Every metric in Carbonerra is auditable. Inspect the exact physics formulas, regional grid data lineage, and caching boundaries used for{" "}
            <span className="text-lime font-mono font-bold">{auditData.domain}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1.5 rounded-xl bg-surface-elevated border border-surface-border text-xs font-mono text-cream hover:text-lime hover:border-lime/40 transition-all flex items-center gap-1.5 cursor-pointer"
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
              { id: "formula", label: "1. Energy Formula (SWDM v4)", icon: <Zap className="w-3.5 h-3.5" /> },
              { id: "provenance", label: "2. Datacenter Grid Lineage", icon: <Server className="w-3.5 h-3.5" /> },
              { id: "caching", label: "3. Uncertainty & Cache Bounds", icon: <Layers className="w-3.5 h-3.5" /> },
              { id: "limitations", label: "4. Explicit Limitations", icon: <Info className="w-3.5 h-3.5" /> },
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
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
            <div className="space-y-4 font-mono text-xs">
              <div className="p-4 rounded-2xl bg-black/60 border border-surface-border space-y-3">
                <div className="text-lime font-bold text-xs uppercase flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  Sustainable Web Design Model v4 Formula Breakdown
                </div>
                <div className="p-3 rounded-xl bg-surface-elevated/70 border border-surface-border text-cream/90 space-y-1.5 text-[11px] leading-relaxed">
                  <div>
                    <span className="text-sage/60">Transferred Payload (B):</span>{" "}
                    <span className="text-lime font-bold">{totalBytes.toLocaleString()} bytes</span>{" "}
                    ({(totalBytes / (1024 * 1024)).toFixed(2)} MB)
                  </div>
                  <div>
                    <span className="text-sage/60">Operational Energy (E_op):</span>{" "}
                    <span>{totalBytes} × {CARBONERRA_CONFIG.operationalKwhPerByte} = </span>
                    <span className="text-cream font-bold">{operationalKwh} kWh</span>
                  </div>
                  <div>
                    <span className="text-sage/60">Embodied Hardware Energy (E_emb):</span>{" "}
                    <span>{totalBytes} × {CARBONERRA_CONFIG.embodiedKwhPerByte} = </span>
                    <span className="text-cream font-bold">{embodiedKwh} kWh</span>
                  </div>
                  <div className="pt-1 border-t border-surface-border/60">
                    <span className="text-sage/60">Total Electricity (E_total):</span>{" "}
                    <span className="text-lime font-bold">{totalKwh} kWh</span>
                  </div>
                  <div>
                    <span className="text-sage/60">Grid Emissions Factor (I_grid):</span>{" "}
                    <span className="text-cream font-bold">{auditData.grid_intensity_val} gCO2e/kWh</span>{" "}
                    ({auditData.grid_intensity_source === "resolved_regional" ? "Location-Specific Regional Grid" : "Global Default"})
                  </div>
                  <div className="pt-1 text-sm font-bold text-lime">
                    Emissions: {auditData.co2_grams} gCO2e per visit (EcoScore Grade {auditData.eco_score})
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Datacenter Grid Lineage */}
          {activeTab === "provenance" && (
            <div className="space-y-4 font-mono text-xs">
              <div className="p-4 rounded-2xl bg-black/60 border border-surface-border space-y-3">
                <div className="text-lime font-bold text-xs uppercase flex items-center gap-2">
                  <Server className="w-4 h-4" />
                  Infrastructure Lineage & Verification Chain
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div className="p-3 rounded-xl bg-surface-elevated/70 border border-surface-border space-y-1">
                    <div className="text-sage/60 uppercase text-[10px]">Resolved Hosting IP</div>
                    <div className="text-cream font-bold">{auditData.record?.gridContext?.resolvedIp || "Public IP Protected"}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-elevated/70 border border-surface-border space-y-1">
                    <div className="text-sage/60 uppercase text-[10px]">Hosting Country / Region</div>
                    <div className="text-cream font-bold">
                      {auditData.hosting_country} ({auditData.hosting_country_code || "Global"})
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-elevated/70 border border-surface-border space-y-1">
                    <div className="text-sage/60 uppercase text-[10px]">Renewable Hosting State</div>
                    <div className="text-lime font-bold">
                      {auditData.hosting.green ? "Verified Renewable Host" : "Standard Datacenter Grid"}
                    </div>
                    <div className="text-[10px] text-sage/60">
                      Source: The Green Web Foundation greencheck
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-elevated/70 border border-surface-border space-y-1">
                    <div className="text-sage/60 uppercase text-[10px]">Grid Carbon Intensity</div>
                    <div className="text-lime font-bold">
                      {auditData.grid_intensity_val} gCO2e / kWh
                    </div>
                    <div className="text-[10px] text-sage/60">
                      Granularity: {auditData.grid_intensity_source === "resolved_regional" ? "Country-level specific" : "Global baseline fallback"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Caching & Sensitivity Bounds */}
          {activeTab === "caching" && (
            <div className="space-y-4 font-mono text-xs">
              <div className="p-4 rounded-2xl bg-black/60 border border-surface-border space-y-3">
                <div className="text-lime font-bold text-xs uppercase flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Sensitivity Banding & Return-Visitor Physics
                </div>
                <p className="text-sage/80 text-[11px] leading-relaxed">
                  Web pages exhibit divergent footprints between first-time visitors (cold browser cache, full asset download) and returning visitors (warm cache, 60–85% asset reuse). Carbonerra avoids deceptive single-point numbers by modeling a scientific sensitivity range:
                </p>
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-elevated/80 border border-surface-border text-cream">
                  <div>
                    <span className="text-sage/60 block text-[10px] uppercase">Lower Bound (Warm Cache)</span>
                    <span className="text-lime font-bold text-sm">{auditData.range_low_g} g CO2e</span>
                  </div>
                  <div className="text-center">
                    <span className="text-sage/60 block text-[10px] uppercase">Central Estimate</span>
                    <span className="text-cream font-bold text-sm">{auditData.co2_grams} g CO2e</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sage/60 block text-[10px] uppercase">Upper Bound (Cold Cache)</span>
                    <span className="text-amber-400 font-bold text-sm">{auditData.range_high_g} g CO2e</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Explicit Limitations */}
          {activeTab === "limitations" && (
            <div className="space-y-4 font-mono text-xs">
              <div className="p-4 rounded-2xl bg-black/60 border border-surface-border space-y-3">
                <div className="text-lime font-bold text-xs uppercase flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Documented Scientific Limitations
                </div>
                <ul className="list-disc list-inside space-y-1.5 text-sage/80 text-[11px] leading-relaxed">
                  {CARBONERRA_CONFIG.standardLimitations.map((lim, idx) => (
                    <li key={idx}>{lim}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Human Control Bar (PAIR Guidance) */}
          <div className="pt-3 border-t border-surface-border/60 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-sage/70 text-[11px]">
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
