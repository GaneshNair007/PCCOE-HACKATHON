"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { motionTokens } from "@/lib/motion";

interface EcoScoreGaugeProps {
  grade: string;
  co2Grams: number;
  percentile: number;
}

export function EcoScoreGauge({ grade, co2Grams, percentile }: EcoScoreGaugeProps) {
  const reducedMotion = useReducedMotion();
  // Score to gauge percentage (0 to 100 where A+ is 95% full)
  const scorePct = grade === "A+" ? 95 : grade === "A" ? 80 : grade === "B" ? 65 : grade === "C" ? 45 : grade === "D" ? 25 : 10;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scorePct / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center relative p-2">
      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* Background track circle */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128" aria-hidden="true">
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            className="text-sage/15"
            strokeWidth="10"
            fill="transparent"
          />
          {/* Animated score arc */}
          <motion.circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            className="text-lime"
            strokeWidth="10"
            strokeDasharray={circumference}
            initial={false}
            animate={{ strokeDashoffset }}
            transition={{ duration: reducedMotion ? 0 : 0.3, ease: motionTokens.ease }}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center Grade Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-display text-4xl sm:text-5xl font-light text-cream leading-none tracking-tight" aria-label={`EcoScore grade ${grade}`}>
            {grade}
          </span>
          <span className="font-mono text-xs font-bold text-lime mt-0.5">
            {co2Grams} g CO2e
          </span>
        </div>
      </div>

      <div className="mt-3 text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-lime/10 text-lime border border-lime/30">
          Cleaner than {percentile}% of sites
        </span>
      </div>
    </div>
  );
}
