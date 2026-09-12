"use client";

import React from "react";
import { ShieldCheck, HelpCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EcoScoreGrade } from "@/types/telemetry";

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
  "A+": { color: "text-lime", label: "Exceptional" },
  A: { color: "text-emerald-400", label: "Excellent" },
  B: { color: "text-sky-300", label: "Above average" },
  C: { color: "text-amber-300", label: "Moderate footprint" },
  D: { color: "text-orange-400", label: "High emissions" },
  F: { color: "text-red-400", label: "Critical refactor required" },
};

/** Retains the public component name; the score is deliberately static and readable. */
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
        <h3 className="font-display text-xl font-light text-cream">Your EcoScore</h3>
        <span className="rounded-full border border-surface-border bg-surface-elevated px-3 py-1 text-xs font-mono text-sage">SWDM v4</span>
      </div>
      <div className="my-6 flex flex-col items-center gap-4 text-center">
        <div className={`flex h-36 w-36 items-center justify-center rounded-full border-2 border-current bg-surface-elevated ${config.color}`}>
          <span className="font-display text-6xl font-light tracking-tight" aria-label={`Grade ${score}`}>{score}</span>
        </div>
        <div>
          <p className="text-sm text-sage">{config.label}</p>
          <p className="mt-2 font-display text-3xl font-light tabular-nums text-cream">
            {co2Grams} <span className="font-mono text-xs text-sage">g CO2 / visit</span>
          </p>
        </div>
      </div>
      <div className="space-y-4 border-t border-surface-border pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-sage">Sensitivity range (±20%)</span>
          <span className="font-mono tabular-nums text-cream">{rangeLow}g – {rangeHigh}g</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className={`inline-flex flex-wrap items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${
            confidence === "high"
              ? "border-lime/30 bg-lime/10 text-lime"
              : confidence === "medium"
                ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
                : confidence === "low"
                  ? "border-orange-500/30 bg-orange-500/10 text-orange-300"
                  : "border-surface-border bg-surface-elevated text-sage"
          }`}>
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            {confidence === "unavailable" ? "Confidence unavailable" : `${confidence} confidence`}
            {discrepancyPct !== null && discrepancyPct !== undefined && <span>({discrepancyPct}% diff)</span>}
          </div>
          {onOpenMethodology && (
            <button type="button" onClick={onOpenMethodology} className="inline-flex items-center gap-1.5 text-xs text-sage underline underline-offset-4 hover:text-lime">
              <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" /> Audit rules
            </button>
          )}
        </div>
        {confidenceNote && <p className="text-xs leading-relaxed text-sage">{confidenceNote}</p>}
      </div>
    </Card>
  );
}
