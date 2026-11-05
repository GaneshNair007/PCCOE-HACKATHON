"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { EcoScoreGrade } from "@/types/telemetry";

export interface SoapBubbleRankProps {
  grade: EcoScoreGrade;
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  interactive?: boolean;
  showRankLabel?: boolean;
  subLabel?: string;
  co2Grams?: number;
  className?: string;
}

const SIZE_MAP = {
  sm: { bubble: 110, font: "text-3xl", badge: "text-[9px] px-1.5 py-0.5", tag: "text-[10px]" },
  md: { bubble: 154, font: "text-5xl", badge: "text-[10px] px-2 py-0.5", tag: "text-xs" },
  lg: { bubble: 210, font: "text-6xl", badge: "text-xs px-2.5 py-1", tag: "text-sm" },
  xl: { bubble: 260, font: "text-7xl", badge: "text-xs px-3 py-1", tag: "text-sm" },
  hero: { bubble: 290, font: "text-8xl sm:text-9xl", badge: "text-xs px-3.5 py-1 font-bold tracking-widest", tag: "text-sm sm:text-base" },
};

const GRADE_PALETTES: Record<
  EcoScoreGrade,
  {
    textColor: string;
    textShadow: string;
    haloBg: string;
    ringColor: string;
    causticColor: string;
    label: string;
    summary: string;
  }
> = {
  "A+": {
    textColor: "text-[#cbff00]",
    textShadow: "0 0 24px rgba(203,255,0,0.85), 0 0 45px rgba(203,255,0,0.4)",
    haloBg: "radial-gradient(circle, rgba(203,255,0,0.22) 0%, rgba(203,255,0,0.06) 45%, transparent 70%)",
    ringColor: "rgba(203,255,0,0.5)",
    causticColor: "rgba(203,255,0,0.35)",
    label: "Grade A+",
    summary: "Exceptional / Net Zero Leader",
  },
  A: {
    textColor: "text-[#cbff00]",
    textShadow: "0 0 22px rgba(203,255,0,0.8), 0 0 40px rgba(203,255,0,0.35)",
    haloBg: "radial-gradient(circle, rgba(203,255,0,0.2) 0%, rgba(203,255,0,0.05) 45%, transparent 70%)",
    ringColor: "rgba(203,255,0,0.45)",
    causticColor: "rgba(203,255,0,0.3)",
    label: "Grade A",
    summary: "Top Tier Environmental Efficiency",
  },
  B: {
    textColor: "text-white",
    textShadow: "0 0 20px rgba(255,255,255,0.75), 0 0 35px rgba(255,255,255,0.3)",
    haloBg: "radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 45%, transparent 70%)",
    ringColor: "rgba(255,255,255,0.4)",
    causticColor: "rgba(255,255,255,0.25)",
    label: "Grade B",
    summary: "Above Global Industry Average",
  },
  C: {
    textColor: "text-[#fbbf24]",
    textShadow: "0 0 20px rgba(251,191,36,0.75), 0 0 35px rgba(251,191,36,0.3)",
    haloBg: "radial-gradient(circle, rgba(251,191,36,0.18) 0%, rgba(251,191,36,0.04) 45%, transparent 70%)",
    ringColor: "rgba(251,191,36,0.4)",
    causticColor: "rgba(251,191,36,0.25)",
    label: "Grade C",
    summary: "Moderate Baseline Emissions",
  },
  D: {
    textColor: "text-[#f87171]",
    textShadow: "0 0 20px rgba(248,113,113,0.75), 0 0 35px rgba(248,113,113,0.3)",
    haloBg: "radial-gradient(circle, rgba(248,113,113,0.18) 0%, rgba(248,113,113,0.04) 45%, transparent 70%)",
    ringColor: "rgba(248,113,113,0.4)",
    causticColor: "rgba(248,113,113,0.25)",
    label: "Grade D",
    summary: "High Environmental Footprint",
  },
  F: {
    textColor: "text-[#ef4444]",
    textShadow: "0 0 22px rgba(239,68,68,0.85), 0 0 45px rgba(239,68,68,0.4)",
    haloBg: "radial-gradient(circle, rgba(239,68,68,0.22) 0%, rgba(239,68,68,0.06) 45%, transparent 70%)",
    ringColor: "rgba(239,68,68,0.5)",
    causticColor: "rgba(239,68,68,0.35)",
    label: "Grade F",
    summary: "Critical Refactor Required",
  },
};

export function SoapBubbleRank({
  grade,
  size = "md",
  interactive = true,
  showRankLabel = true,
  subLabel,
  co2Grams,
  className = "",
}: SoapBubbleRankProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse tilt tracking with spring damping
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springConfig = { damping: 18, stiffness: 180, mass: 0.6 };
  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [14, -14]), springConfig);
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-14, 14]), springConfig);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!interactive || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      rawX.set(x);
      rawY.set(y);
    },
    [interactive, rawX, rawY]
  );

  const handleMouseLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
    setIsHovered(false);
  }, [rawX, rawY]);

  const cfg = SIZE_MAP[size] || SIZE_MAP.md;
  const palette = GRADE_PALETTES[grade] || GRADE_PALETTES.A;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={`group relative flex flex-col items-center justify-center select-none ${className}`}
      style={{ perspective: 1000 }}
      role="figure"
      aria-label={`3D Soap Bubble Audit Rank: Grade ${grade}`}
    >
      {/* =========================================================================
          FLOATING 3D BUBBLE SPHERE
          ========================================================================= */}
      <motion.div
        style={{
          width: cfg.bubble,
          height: cfg.bubble,
          rotateX: interactive ? rotateX : 0,
          rotateY: interactive ? rotateY : 0,
          transformStyle: "preserve-3d",
        }}
        animate={{
          y: [-5, 5, -5],
          scale: isHovered ? 1.05 : [1, 1.018, 1],
        }}
        transition={{
          y: { duration: 4.8, ease: "easeInOut", repeat: Infinity },
          scale: isHovered
            ? { duration: 0.25, ease: "easeOut" }
            : { duration: 5.6, ease: "easeInOut", repeat: Infinity },
        }}
        className="relative flex items-center justify-center cursor-pointer"
      >
        {/* Layer 1: Ambient Glass Sphere Base */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 40%, rgba(0,0,0,0.3) 75%, transparent 100%)",
            boxShadow: `
              inset 0 0 24px rgba(255,255,255,0.22),
              inset 0 0 8px ${palette.ringColor},
              0 14px 34px -8px rgba(0, 0, 0, 0.75),
              0 0 28px -4px ${palette.causticColor}
            `,
            border: "1px solid rgba(255, 255, 255, 0.28)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
          }}
        />

        {/* Layer 2: Dynamic Iridescent Rainbow Sheen Ring */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none opacity-85 transition-opacity duration-500"
          style={{
            background: `
              conic-gradient(
                from 135deg at 50% 50%,
                rgba(203, 255, 0, 0.35) 0deg,
                rgba(56, 189, 248, 0.45) 60deg,
                rgba(236, 72, 153, 0.4) 130deg,
                rgba(168, 85, 247, 0.4) 200deg,
                rgba(52, 211, 153, 0.4) 270deg,
                rgba(203, 255, 0, 0.35) 360deg
              )
            `,
            maskImage: "radial-gradient(circle, transparent 60%, black 72%, black 97%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(circle, transparent 60%, black 72%, black 97%, transparent 100%)",
            mixBlendMode: "screen",
          }}
        />

        {/* Layer 3: High-Res 3D Soap Bubble Asset (Extracted from clear-soap-bubble) */}
        <div className="absolute inset-0 rounded-full pointer-events-none overflow-hidden">
          <Image
            src="/assets/soap-bubble-3d.webp"
            alt="3D Iridescent Soap Bubble"
            fill
            sizes={`${cfg.bubble}px`}
            priority
            className="object-contain mix-blend-screen opacity-90 scale-[1.04]"
          />
        </div>

        {/* Layer 4: Emissive Caustic Core Glow */}
        <div
          className="absolute inset-[15%] rounded-full pointer-events-none transition-all duration-700"
          style={{
            background: palette.haloBg,
            filter: "blur(4px)",
          }}
        />

        {/* Layer 5: Suspended 3D Floating Rank Typography */}
        <div
          className="relative z-10 flex flex-col items-center justify-center text-center transform-gpu"
          style={{
            transform: "translateZ(32px)",
          }}
        >
          <span
            className={`font-display font-black tracking-tight ${cfg.font} ${palette.textColor}`}
            style={{
              textShadow: palette.textShadow,
              filter: isHovered ? "brightness(1.15)" : "none",
            }}
          >
            {grade}
          </span>
          {showRankLabel && (
            <span
              className={`font-mono font-bold uppercase tracking-wider rounded-full border border-white/20 bg-black/50 text-white/90 backdrop-blur-md mt-0.5 ${cfg.badge}`}
            >
              ECO-SCORE
            </span>
          )}
        </div>

        {/* Layer 6: Front Specular Glare (Overlays text so letter is truly inside the sphere) */}
        <div
          className="absolute top-[10%] left-[15%] w-[32%] h-[22%] rounded-full pointer-events-none transform -rotate-[32deg]"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.45) 50%, transparent 80%)",
            filter: "blur(0.5px)",
            mixBlendMode: "screen",
          }}
        />
        <div
          className="absolute bottom-[14%] right-[16%] w-[24%] h-[15%] rounded-full pointer-events-none transform rotate-[35deg]"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(203,255,0,0.5) 0%, rgba(56,189,248,0.3) 50%, transparent 80%)",
            filter: "blur(1px)",
            mixBlendMode: "screen",
          }}
        />
      </motion.div>

      {/* =========================================================================
          CAUSTIC GROUND SHADOW / LIGHT POOL
          ========================================================================= */}
      <motion.div
        animate={{
          scaleX: isHovered ? 1.15 : [1, 0.9, 1],
          opacity: isHovered ? 0.5 : [0.35, 0.22, 0.35],
        }}
        transition={{
          duration: 4.8,
          ease: "easeInOut",
          repeat: Infinity,
        }}
        className="pointer-events-none -mt-1 rounded-full blur-md"
        style={{
          width: cfg.bubble * 0.72,
          height: 12,
          background: `radial-gradient(ellipse at center, ${palette.causticColor} 0%, rgba(0,0,0,0.6) 60%, transparent 100%)`,
        }}
      />

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
