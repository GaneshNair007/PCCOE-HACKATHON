"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { Sparkles, ShieldCheck, HelpCircle } from "lucide-react";
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

const GRADE_CONFIG: Record<EcoScoreGrade, { color: string; glow: string; label: string }> = {
  "A+": { color: "#cbff00", glow: "rgba(203, 255, 0, 0.45)", label: "EXCEPTIONAL" },
  A: { color: "#2ebd6a", glow: "rgba(46, 189, 106, 0.45)", label: "EXCELLENT" },
  B: { color: "#54b3d6", glow: "rgba(84, 179, 214, 0.45)", label: "ABOVE AVERAGE" },
  C: { color: "#e3b341", glow: "rgba(227, 179, 65, 0.45)", label: "MODERATE FOOTPRINT" },
  D: { color: "#f27238", glow: "rgba(242, 114, 56, 0.45)", label: "HIGH EMISSIONS" },
  F: { color: "#ff4757", glow: "rgba(255, 71, 87, 0.5)", label: "CRITICAL REFACTOR REQUIRED" },
};

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
  const containerRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGSVGElement>(null);
  const letterRef = useRef<HTMLDivElement>(null);

  const config = GRADE_CONFIG[score] || GRADE_CONFIG["A+"];

  useEffect(() => {
    if (!ringRef.current || !letterRef.current) return;

    // 3D Orbital Ring Rotation
    gsap.fromTo(
      ringRef.current,
      { rotateZ: 0 },
      {
        rotateZ: 360,
        duration: 25,
        repeat: -1,
        ease: "none",
      }
    );

    // Letter entrance punch
    gsap.fromTo(
      letterRef.current,
      { scale: 0.5, opacity: 0, translateZ: -50 },
      {
        scale: 1,
        opacity: 1,
        translateZ: 30,
        duration: 0.8,
        ease: "back.out(1.7)",
      }
    );
  }, [score]);

  return (
    <div
      ref={containerRef}
      style={{
        perspective: "1000px",
        transformStyle: "preserve-3d",
      }}
      className="relative flex flex-col items-center justify-center p-6 glass-panel-elevated rounded-3xl border border-lime/30 shadow-[0_15px_40px_rgba(0,0,0,0.6)]"
    >
      {/* 3D Glow Ambient Backing */}
      <div
        style={{ background: config.glow }}
        className="absolute w-44 h-44 rounded-full blur-3xl opacity-40 pointer-events-none transition-colors duration-700"
      />

      {/* 3D Holographic Chamber Header */}
      <div className="w-full flex items-center justify-between text-xs font-mono text-sage/70 mb-4 px-2">
        <span className="flex items-center gap-1.5 text-lime">
          <Sparkles className="w-3.5 h-3.5" /> 3D ECOSCORE CHAMBER
        </span>
        <span className="bg-surface-elevated/80 px-2.5 py-0.5 rounded-full border border-surface-border text-[10px] text-cream">
          SWDM v4
        </span>
      </div>

      {/* Interactive 3D Holographic Cylinder */}
      <div
        style={{
          transformStyle: "preserve-3d",
          transform: "rotateX(15deg)",
        }}
        className="relative w-52 h-52 flex items-center justify-center my-2"
      >
        {/* Outer Laser Orbit Ring */}
        <svg
          ref={ringRef}
          viewBox="0 0 200 200"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          <circle
            cx="100"
            cy="100"
            r="88"
            fill="none"
            stroke={config.color}
            strokeWidth="2"
            strokeDasharray="14 10 4 10"
            strokeOpacity="0.8"
          />
          <circle
            cx="100"
            cy="100"
            r="75"
            fill="none"
            stroke={config.color}
            strokeWidth="1.5"
            strokeDasharray="6 8"
            strokeOpacity="0.4"
          />
        </svg>

        {/* Inner Pulsing Core */}
        <div
          style={{
            borderColor: config.color,
            boxShadow: `0 0 25px ${config.glow}, inset 0 0 25px ${config.glow}`,
          }}
          className="w-36 h-36 rounded-full border-2 border-dashed flex items-center justify-center bg-[#07130e]/85 backdrop-blur-md animate-pulse"
        >
          {/* Floating 3D Extruded Grade Letter */}
          <div
            ref={letterRef}
            style={{
              color: config.color,
              textShadow: `0 0 20px ${config.glow}, 0 4px 10px rgba(0,0,0,0.8)`,
              transform: "translateZ(35px)",
            }}
            className="font-display text-7xl select-none"
          >
            {score}
          </div>
        </div>
      </div>

      {/* Grade Label & gCO2 Point Estimate */}
      <div className="text-center mt-3 space-y-1">
        <div className="font-mono text-xs font-bold uppercase tracking-widest text-cream">
          {config.label}
        </div>
        <div className="font-mono text-2xl font-bold text-cream">
          {co2Grams} <span className="text-xs font-normal text-sage/70">g CO2 / visit</span>
        </div>
      </div>

      {/* 3D Sensitivity Confidence Band Banner */}
      <div className="w-full mt-5 pt-4 border-t border-surface-border/60 space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-sage/60 uppercase">Sensitivity Range (±20%):</span>
          <span className="text-lime font-semibold">
            {rangeLow}g – {rangeHigh}g
          </span>
        </div>

        {/* Visual Range Pill */}
        <div className="w-full bg-surface-elevated h-2.5 rounded-full overflow-hidden p-0.5 border border-surface-border">
          <div
            style={{
              width: "100%",
              background: `linear-gradient(90deg, ${config.color}22 0%, ${config.color} 50%, ${config.color}22 100%)`,
            }}
            className="h-full rounded-full"
          />
        </div>

        {/* Confidence Badge & Cross-Validation Note */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold ${
              confidence === "high"
                ? "bg-lime/20 text-lime border border-lime/40"
                : confidence === "medium"
                ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                : confidence === "low"
                ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                : "bg-surface-elevated text-sage/70 border border-surface-border"
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            {confidence === "unavailable" ? "UNAVAILABLE" : `${confidence} CONFIDENCE`}
            {discrepancyPct !== null && discrepancyPct !== undefined && (
              <span className="opacity-80">({discrepancyPct}% diff)</span>
            )}
          </div>

          {onOpenMethodology && (
            <button
              onClick={onOpenMethodology}
              className="text-[10px] font-mono text-sage/60 hover:text-lime underline flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-3 h-3" /> Audit Rules
            </button>
          )}
        </div>

        {confidenceNote && (
          <p className="text-[10px] text-sage/60 italic leading-snug px-1 text-center">
            {confidenceNote}
          </p>
        )}
      </div>
    </div>
  );
}
