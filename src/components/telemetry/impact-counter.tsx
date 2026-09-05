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
          <div className="p-2 rounded-xl bg-forest-900/80 text-emerald-400">
            <Trees className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-sage/70">Carbon Offset</div>
            <div className="text-sm font-extrabold text-cream font-mono">
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
            <div className="text-[10px] font-mono uppercase text-sage/70">Grid Electricity</div>
            <div className="text-sm font-extrabold text-cream font-mono">
              {impact.kwh_consumed} kWh / Year
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 rounded-2xl bg-surface/60 border border-surface-border">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-forest-900/80 text-amber-300">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-sage/70">Vehicle Travel Equiv</div>
            <div className="text-sm font-extrabold text-cream font-mono">
              {impact.car_miles_equivalent.toLocaleString()} Car Miles
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
