import React from "react";
import { cn } from "@/lib/utils";

export interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  valueDisplay: string;
}

export function Slider({ className, label, valueDisplay, ...props }: SliderProps) {
  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider">
        <span className="text-sage">{label}</span>
        <span className="font-mono text-lime font-bold">{valueDisplay}</span>
      </div>
      <input
        type="range"
        className="w-full h-2 bg-surface-elevated rounded-lg appearance-none cursor-pointer accent-lime focus:outline-none focus:ring-1 focus:ring-lime"
        {...props}
      />
    </div>
  );
}
