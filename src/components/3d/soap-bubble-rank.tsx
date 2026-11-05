"use client";

import React from "react";
import { motion } from "framer-motion";
import { EcoScoreGrade } from "@/types/telemetry";
import { WebGLSoapBubble } from "./webgl-soap-bubble";

export interface SoapBubbleRankProps {
  grade: EcoScoreGrade;
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  interactive?: boolean;
  showRankLabel?: boolean;
  subLabel?: string;
  co2Grams?: number;
  className?: string;
  wobbleSpeed?: number;
  wobbleStrength?: number;
}

const SIZE_MAP = {
  sm: { bubble: 130, badge: "text-[9px] px-2 py-0.5", tag: "text-[10px]" },
  md: { bubble: 180, badge: "text-[10px] px-2.5 py-0.5", tag: "text-xs" },
  lg: { bubble: 240, badge: "text-xs px-3 py-1", tag: "text-sm" },
  xl: { bubble: 300, badge: "text-xs px-3.5 py-1", tag: "text-sm" },
  hero: { bubble: 360, badge: "text-xs px-4 py-1.5 font-black tracking-widest", tag: "text-sm sm:text-base font-bold" },
};

const GRADE_PALETTES: Record<
  EcoScoreGrade,
  {
    causticColor: string;
    label: string;
    summary: string;
  }
> = {
  "A+": {
    causticColor: "rgba(203,255,0,0.4)",
    label: "Grade A+",
    summary: "Exceptional / Net Zero Leader",
  },
  A: {
    causticColor: "rgba(203,255,0,0.35)",
    label: "Grade A",
    summary: "Top Tier Environmental Efficiency",
  },
  B: {
    causticColor: "rgba(56,189,248,0.35)",
    label: "Grade B",
    summary: "Above Global Industry Average",
  },
  C: {
    causticColor: "rgba(251,191,36,0.3)",
    label: "Grade C",
    summary: "Moderate Baseline Emissions",
  },
  D: {
    causticColor: "rgba(249,115,22,0.35)",
    label: "Grade D",
    summary: "High Environmental Footprint",
  },
  F: {
    causticColor: "rgba(239,68,68,0.4)",
    label: "Grade F",
    summary: "Critical Refactor Required",
  },
};

export function SoapBubbleRank({
  grade,
  size = "md",
  interactive = true,
  showRankLabel = false,
  subLabel,
  co2Grams,
  className = "",
  wobbleSpeed = 1.0,
  wobbleStrength = 0.09,
}: SoapBubbleRankProps) {
  const cfg = SIZE_MAP[size] || SIZE_MAP.md;
  const palette = GRADE_PALETTES[grade] || GRADE_PALETTES.A;

  return (
    <div
      className={`group relative flex flex-col items-center justify-center select-none ${className}`}
      role="figure"
      aria-label={`3D Soap Bubble Audit Rank: Grade ${grade}`}
    >
      {/* =========================================================================
          PROCEDURAL 3D WEBGL SOAP BUBBLE (THREE.JS + SHADERS)
          ========================================================================= */}
      <div className="relative flex items-center justify-center">
        <WebGLSoapBubble
          grade={grade}
          size={size}
          interactive={interactive}
          wobbleSpeed={wobbleSpeed}
          wobbleStrength={wobbleStrength}
        />
      </div>

      {/* =========================================================================
          CAUSTIC GROUND SHADOW / LIGHT POOL
          ========================================================================= */}
      <motion.div
        animate={{
          scaleX: [1, 0.9, 1],
          opacity: [0.45, 0.25, 0.45],
        }}
        transition={{
          duration: 4.8,
          ease: "easeInOut",
          repeat: Infinity,
        }}
        className="pointer-events-none -mt-4 rounded-full blur-md"
        style={{
          width: cfg.bubble * 0.72,
          height: 14,
          background: `radial-gradient(ellipse at center, ${palette.causticColor} 0%, rgba(0,0,0,0.6) 60%, transparent 100%)`,
        }}
      />

      {/* Optional ECO-SCORE Badge */}
      {showRankLabel && (
        <span
          className={`font-mono font-bold uppercase tracking-wider rounded-full border border-white/20 bg-black/60 text-white/90 backdrop-blur-md mt-2 shadow-[0_2px_12px_rgba(0,0,0,0.4)] ${cfg.badge}`}
        >
          ECO-SCORE
        </span>
      )}

      {/* Optional Subtitle Summary / Details */}
      {subLabel !== undefined ? (
        <div className={`mt-2 text-center font-mono ${cfg.tag} text-sage/85`}>
          {subLabel}
        </div>
      ) : co2Grams !== undefined ? (
        <div className={`mt-2 text-center font-mono ${cfg.tag} text-sage/85`}>
          <span className="text-cream font-bold">{co2Grams}</span> gCO2 / visit · {palette.summary}
        </div>
      ) : null}
    </div>
  );
}
