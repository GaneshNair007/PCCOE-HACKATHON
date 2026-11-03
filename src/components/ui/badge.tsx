import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "lime" | "forest" | "danger" | "warning" | "outline";
}

export function Badge({ className, variant = "lime", children, ...props }: BadgeProps) {
  const variants = {
    lime: "bg-[#cbff00]/15 text-[#cbff00] border border-[#cbff00]/30 font-bold",
    forest: "bg-white/5 text-white/80 border border-white/10",
    danger: "bg-white/10 text-white border border-white/20 font-bold",
    warning: "bg-white/10 text-white/90 border border-white/20 font-bold",
    outline: "bg-transparent text-white/70 border border-white/15",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs tracking-wide font-mono",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
