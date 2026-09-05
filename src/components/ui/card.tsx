"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

export interface CardProps extends HTMLMotionProps<"div"> {
  hoverEffect?: boolean;
  glow?: "lime" | "forest" | "none";
  specular?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverEffect = true, glow = "none", specular = true, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={hoverEffect ? { y: -4, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } } : undefined}
        data-spec={specular ? "" : undefined}
        className={cn(
          "rounded-[2rem] p-6 transition-all duration-300 relative overflow-hidden",
          "glass-panel text-cream",
          glow === "lime" && "border-lime/40 shadow-lime",
          glow === "forest" && "border-forest-700/50 shadow-forest",
          hoverEffect && "hover:border-lime/40 hover:shadow-[0_16px_36px_rgba(10,14,8,0.45)]",
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
