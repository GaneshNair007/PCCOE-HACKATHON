"use client";

import React from "react";
import { motion } from "framer-motion";
import { BreakdownItem } from "@/types/telemetry";
import { FileCode, Image, FileText, Palette, Layers, Database } from "lucide-react";

interface PayloadBreakdownProps {
  totalBytes: number;
  totalMb: number;
  breakdown?: BreakdownItem[];
  compact?: boolean;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; bar: string; icon: any }> = {
  image: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    bar: "bg-amber-400",
    icon: Image,
  },
  script: {
    bg: "bg-lime/10",
    text: "text-lime",
    bar: "bg-lime",
    icon: FileCode,
  },
  html: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    bar: "bg-emerald-400",
    icon: FileText,
  },
  document: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    bar: "bg-emerald-400",
    icon: FileText,
  },
  stylesheet: {
    bg: "bg-sky-500/10",
    text: "text-sky-400",
    bar: "bg-sky-400",
    icon: Palette,
  },
  font: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    bar: "bg-purple-400",
    icon: Layers,
  },
  other: {
    bg: "bg-sage/10",
    text: "text-sage",
    bar: "bg-sage",
    icon: Database,
  },
};

export function PayloadBreakdown({
  totalBytes,
  totalMb,
  breakdown,
  compact = false,
}: PayloadBreakdownProps) {
  // Fallback breakdown if none provided
  const items: BreakdownItem[] = breakdown && breakdown.length > 0
    ? breakdown
    : [
        { category: "image", bytes: Math.round(totalBytes * 0.48), pct_of_total: 48.0 },
        { category: "script", bytes: Math.round(totalBytes * 0.32), pct_of_total: 32.0 },
        { category: "stylesheet", bytes: Math.round(totalBytes * 0.10), pct_of_total: 10.0 },
        { category: "html", bytes: Math.round(totalBytes * 0.07), pct_of_total: 7.0 },
        { category: "other", bytes: Math.round(totalBytes * 0.03), pct_of_total: 3.0 },
      ];

  const formatBytes = (bytes: number) => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${Math.round(bytes / 1024)} KB`;
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-lime" />
          <span className="text-xs font-mono font-bold text-cream uppercase tracking-wider">
            Transfer Payload Composition
          </span>
        </div>
        <div className="text-xs font-mono text-sage">
          Total Weight: <strong className="text-lime">{totalMb} MB</strong> ({totalBytes.toLocaleString()} bytes)
        </div>
      </div>

      {/* Multi-segment Stacked Bar */}
      <div className="w-full h-4 rounded-full overflow-hidden flex bg-surface-elevated/80 border border-surface-border/60 p-0.5 shadow-inner">
        {items.map((item, idx) => {
          const config = CATEGORY_COLORS[item.category.toLowerCase()] || CATEGORY_COLORS.other;
          return (
            <motion.div
              key={idx}
              initial={{ width: 0 }}
              animate={{ width: `${item.pct_of_total}%` }}
              transition={{ duration: 0.8, delay: idx * 0.1, ease: "easeOut" }}
              className={`h-full ${config.bar} first:rounded-l-full last:rounded-r-full transition-all hover:brightness-125 cursor-pointer relative group`}
              title={`${item.category.toUpperCase()}: ${formatBytes(item.bytes)} (${item.pct_of_total}%)`}
            />
          );
        })}
      </div>

      {/* Interactive Category Legend Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-1">
        {items.map((item, idx) => {
          const config = CATEGORY_COLORS[item.category.toLowerCase()] || CATEGORY_COLORS.other;
          const Icon = config.icon;
          return (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border border-surface-border bg-surface/50 hover:bg-surface-elevated transition-colors flex items-center gap-2.5`}
            >
              <div className={`p-1.5 rounded-lg ${config.bg} ${config.text} shrink-0`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-mono uppercase text-sage/70 truncate">
                  {item.category}
                </div>
                <div className="text-xs font-mono font-bold text-cream">
                  {formatBytes(item.bytes)}
                </div>
                <div className={`text-[10px] font-mono ${config.text}`}>
                  {item.pct_of_total}% share
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
