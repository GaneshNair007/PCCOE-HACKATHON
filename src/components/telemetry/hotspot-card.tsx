"use client";

import React from "react";
import { HotspotCardData } from "@/types/telemetry";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";

interface HotspotCardProps {
  hotspot: HotspotCardData;
  index: number;
}

export function HotspotCard({ hotspot, index }: HotspotCardProps) {
  const router = useRouter();
  const reduced = useReducedMotion();

  const isDanger = hotspot.priority_level === "danger";
  const isWarning = hotspot.priority_level === "warning";

  return (
    <motion.div
      initial={{ opacity: 0, y: reduced ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduced ? 0 : Math.min(index * 0.05, 0.24), duration: 0.4 }}
      className="group relative min-h-[300px] rounded-2xl p-6 glass-panel flex flex-col justify-between gap-6"
    >
      <div className="space-y-3 z-10">
        <div className="flex items-center justify-between">
          <Badge variant={isDanger ? "danger" : isWarning ? "warning" : "forest"}>
            {hotspot.priority}
          </Badge>
          <span className="number-detail select-none">
            0{index + 1}
          </span>
        </div>
        <div>
          <h4 className="font-mono text-sm sm:text-base font-bold text-cream break-words">
            {hotspot.title}
          </h4>
          <div className="flex items-center gap-2 mt-1 text-xs font-mono">
            <span className="text-sage">Size: <strong className="text-cream">{hotspot.size}</strong></span>
            <span className="text-sage/75">•</span>
            <span className={isDanger ? "text-red-400 font-bold" : isWarning ? "text-amber-300 font-bold" : "text-lime"}>
              {hotspot.co2_est}
            </span>
          </div>
        </div>
        <p className="text-xs text-sage/75 leading-relaxed ">
          {hotspot.desc}
        </p>
      </div>

      {/* Blur Overlay with Quick Fix CTA */}
      <div className="flex flex-col items-start gap-3 pt-4 border-t border-surface-border">
        <span className="text-xs font-mono font-bold text-lime uppercase tracking-widest mb-3">
          {hotspot.fix_action}
        </span>
        <Button
          variant="lime"
          size="sm"
          onClick={() => router.push("/fix-hub")}
          className=""
        >
          {hotspot.cta_label}
        </Button>
      </div>
    </motion.div>
  );
}
