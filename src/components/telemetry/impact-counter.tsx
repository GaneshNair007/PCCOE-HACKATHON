import React from "react";
import { AnnualImpact } from "@/types/telemetry";
import { Trees, Zap, Compass } from "lucide-react";

interface ImpactCounterProps {
  impact: AnnualImpact;
}

export function ImpactCounter({ impact }: ImpactCounterProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between p-3 rounded-2xl bg-surface/60 border border-surface-border">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-forest-900/80 text-[#cbff00]">
            <Trees className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-sans font-semibold uppercase text-sage/70">Carbon Offset</div>
            <div className="text-sm font-black text-cream font-display tabular-nums tracking-tight">
              {impact.trees_equivalent} Trees / Year
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 rounded-2xl bg-surface/60 border border-surface-border">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-forest-900/80 text-lime">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-sans font-semibold uppercase text-sage/70">Grid Electricity</div>
            <div className="text-sm font-black text-cream font-display tabular-nums tracking-tight">
              {impact.kwh_consumed} kWh / Year
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 rounded-2xl bg-surface/60 border border-surface-border">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-forest-900/80 text-white">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-sans font-semibold uppercase text-sage/70">Vehicle Travel Equiv</div>
            <div className="text-sm font-black text-cream font-display tabular-nums tracking-tight">
              {impact.car_miles_equivalent.toLocaleString()} Car Miles
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
