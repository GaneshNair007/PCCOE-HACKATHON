"use client";

import React from "react";
import { motion } from "framer-motion";

interface EcoScoreGaugeProps {
  grade: string;
  co2Grams: number;
  percentile: number;
}

export function EcoScoreGauge({ grade, co2Grams, percentile }: EcoScoreGaugeProps) {
  // Score to gauge percentage (0 to 100 where A+ is 95% full)
  const scorePct = grade === "A+" ? 95 : grade === "A" ? 80 : grade === "B" ? 65 : grade === "C" ? 45 : grade === "D" ? 25 : 10;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scorePct / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center relative p-2">
      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* Background track circle */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="rgba(204, 213, 174, 0.12)"
            strokeWidth="10"
            fill="transparent"
          />
          {/* Animated score arc */}
          <motion.circle
            cx="64"
            cy="64"
            r={radius}
            stroke="#cbff00"
            strokeWidth="10"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center Grade Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="font-display text-4xl sm:text-5xl text-cream leading-none tracking-tight drop-shadow-[0_0_15px_rgba(203,255,0,0.4)]"
          >
            {grade}
          </motion.span>
          <span className="font-mono text-xs font-bold text-lime mt-0.5">
            {co2Grams} g CO2e
          </span>
        </div>
      </div>

      <div className="mt-3 text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-lime/10 text-lime border border-lime/30">
          🌱 CLEANER THAN {percentile}% OF SITES
        </span>
      </div>
    </div>
  );
}
