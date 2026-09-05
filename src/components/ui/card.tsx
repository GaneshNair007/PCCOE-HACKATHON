"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

export interface CardProps extends HTMLMotionProps<"div"> {
  hoverEffect?: boolean;
  glow?: "lime" | "forest" | "none";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverEffect = true, glow = "none", children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={hoverEffect ? { y: -4, transition: { duration: 0.2 } } : undefined}
        className={cn(
          "rounded-[2rem] p-6 transition-all duration-300 relative overflow-hidden",
          "glass-panel text-cream",
          glow === "lime" && "border-lime/30 shadow-lime",
          glow === "forest" && "border-forest-700/50 shadow-forest",
          hoverEffect && "hover:border-lime/40 hover:bg-surface-elevated/90",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = "Card";
