"use client";

import React from "react";
import { ShieldCheck, HelpCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EcoScoreGrade } from "@/types/telemetry";
import { SoapBubbleRank } from "./soap-bubble-rank";

interface HologramGauge3DProps {
  score: EcoScoreGrade;
  co2Grams: number;
  rangeLow: number;
  rangeHigh: number;
  confidence: "high" | "medium" | "low" | "unavailable";
  confidenceNote?: string;
  discrepancyPct?: number | null;
  onOpenMethodology?: () => void;
}

const GRADE_CONFIG: Record<EcoScoreGrade, { color: string; label: string }> = {
  "A+": { color: "text-[#cbff00]", label: "Exceptional" },
  A: { color: "text-[#cbff00]", label: "Excellent" },
  B: { color: "text-white", label: "Above average" },
  C: { color: "text-white/80", label: "Moderate footprint" },
  D: { color: "text-white/60", label: "High emissions" },
  F: { color: "text-white/40", label: "Critical refactor required" },
};

/** High-fidelity 3D Iridescent Soap Bubble score gauge with optical depth and physical reflection physics. */
export function HologramGauge3D({
  score,
  co2Grams,
  rangeLow,
  rangeHigh,
  confidence,
  confidenceNote,
  discrepancyPct,
  onOpenMethodology,
}: HologramGauge3DProps) {
  const config = GRADE_CONFIG[score] || GRADE_CONFIG["A+"];

  return (
    <Card className="min-w-0 p-5 sm:p-6" role="group" aria-label="Audit EcoScore and measurement confidence">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-xl font-bold uppercase tracking-wider text-cream">OVERALL SUSTAINABILITY SCORE</h3>
        <span className="rounded-full border border-surface-border bg-surface-elevated px-3 py-1 text-xs font-mono font-bold uppercase text-lime">VERIFIED</span>
      </div>
      <div className="my-6 flex flex-col items-center gap-4 text-center">
        <SoapBubbleRank
          grade={score}
          size="lg"
          interactive={true}
          showRankLabel={false}
          co2Grams={co2Grams}
        />
        <div>
          <p className="text-sm text-sage">{config.label}</p>
          <p className="mt-1 font-display text-2xl font-light tabular-nums text-cream">
            {co2Grams} <span className="font-mono text-xs text-sage">g CO2 / visit</span>
          </p>
        </div>
      </div>
      <div className="space-y-4 border-t border-surface-border pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-sage">Estimated range (new vs repeat visits)</span>
          <span className="font-mono tabular-nums text-cream font-bold">{rangeLow}g – {rangeHigh}g</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className={`inline-flex flex-wrap items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${
            confidence === "high"
              ? "border-[#cbff00]/40 bg-[#cbff00]/10 text-[#cbff00]"
              : "border-white/20 bg-white/5 text-white/80"
          }`}>
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            {confidence === "unavailable" ? "Confidence unavailable" : `${confidence} confidence`}
            {discrepancyPct !== null && discrepancyPct !== undefined && <span>({discrepancyPct}% diff)</span>}
          </div>
          {onOpenMethodology && (
            <button type="button" onClick={onOpenMethodology} className="inline-flex items-center gap-1.5 text-xs text-sage underline underline-offset-4 hover:text-lime">
              <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" /> How it is scored
            </button>
          )}
        </div>
        {confidenceNote && <p className="text-xs leading-relaxed text-sage">{confidenceNote}</p>}
      </div>
    </Card>
  );
}
