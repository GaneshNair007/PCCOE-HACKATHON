import React from "react";
import { cn } from "@/lib/utils";

export interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  valueDisplay: string;
}

export function Slider({ className, label, valueDisplay, ...props }: SliderProps) {
  const id = React.useId();
  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="flex items-center justify-between text-sm font-medium gap-4">
        <label htmlFor={props.id || id} className="text-sage">{label}</label>
        <span className="font-mono text-lime font-bold">{valueDisplay}</span>
      </div>
      <input
        type="range"
        id={id}
        aria-valuetext={valueDisplay}
        className="w-full h-6 bg-surface-elevated rounded-lg appearance-none cursor-pointer accent-lime focus:outline-none focus:ring-1 focus:ring-lime"
        {...props}
      />
    </div>
  );
}
