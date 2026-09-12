"use client";
import { Globe2, Leaf } from "lucide-react";
interface CarbonGlobeProps { className?: string; activeRegion?: string | null; gridIntensity?: number; isGreen?: boolean; hasAuditedTarget?: boolean; }
/** Compact region summary keeps measured results stable and removes idle WebGL work. */
export function CarbonGlobe3D({className, activeRegion, gridIntensity = 494, isGreen = false, hasAuditedTarget = false}: CarbonGlobeProps) {
  return <div className={`flex flex-col items-center justify-center gap-3 rounded-2xl bg-surface p-4 text-center ${className || ''}`}>
    <Globe2 size={56} strokeWidth={.75} className="text-sage" aria-hidden="true" />
    <p className="text-sm text-cream">{hasAuditedTarget ? activeRegion || "Global reference" : "Awaiting an audited region"}</p>
    <p className="text-xs font-mono text-sage">{gridIntensity} gCO2e / kWh</p>
    {isGreen && <span className="flex items-center gap-1 text-xs text-lime"><Leaf size={13} />Green-hosting dataset match</span>}
  </div>;
}
