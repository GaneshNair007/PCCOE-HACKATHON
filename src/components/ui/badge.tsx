import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "lime" | "forest" | "danger" | "warning" | "outline";
}

export function Badge({ className, variant = "lime", children, ...props }: BadgeProps) {
  const variants = {
    lime: "bg-lime/10 text-lime border border-lime/30 font-bold",
    forest: "bg-forest-900/60 text-sage border border-forest-700/50",
    danger: "bg-red-950/60 text-red-400 border border-red-800/40 font-bold",
    warning: "bg-amber-950/60 text-amber-300 border border-amber-800/40 font-bold",
    outline: "bg-transparent text-sage/80 border border-surface-border",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs uppercase tracking-widest font-mono",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
