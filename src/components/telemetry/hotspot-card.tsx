"use client";

import React from "react";
import { HotspotCardData } from "@/types/telemetry";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface HotspotCardProps {
  hotspot: HotspotCardData;
  index: number;
}

export function HotspotCard({ hotspot, index }: HotspotCardProps) {
  const router = useRouter();

  const isDanger = hotspot.priority_level === "danger";
  const isWarning = hotspot.priority_level === "warning";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="tech-frame gradient-border beautiful-md group relative h-[320px] rounded-2xl p-6 glass-panel overflow-hidden flex flex-col justify-between hover:border-lime/40 transition-all duration-300"
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
          <h4 className="font-mono text-sm sm:text-base font-bold text-cream truncate">
            {hotspot.title}
          </h4>
          <div className="flex items-center gap-2 mt-1 text-xs font-mono">
            <span className="text-sage">Size: <strong className="text-cream">{hotspot.size}</strong></span>
            <span className="text-sage/40">•</span>
            <span className={isDanger ? "text-red-400 font-bold" : isWarning ? "text-amber-300 font-bold" : "text-lime"}>
              {hotspot.co2_est}
            </span>
          </div>
        </div>
        <p className="text-xs text-sage/75 leading-relaxed line-clamp-3">
          {hotspot.desc}
        </p>
      </div>

      {/* Blur Overlay with Quick Fix CTA */}
      <div className="absolute inset-0 bg-forest-950/80 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-6 text-center z-20">
        <span className="text-[10px] font-mono font-bold text-lime uppercase tracking-widest mb-3">
          {hotspot.fix_action}
        </span>
        <Button
          variant="lime"
          size="sm"
          onClick={() => router.push("/fix-hub")}
          className="shadow-lime"
        >
          {hotspot.cta_label}
        </Button>
      </div>
    </motion.div>
  );
}
