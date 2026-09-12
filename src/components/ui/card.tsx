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
  ({ className, hoverEffect = false, glow = "none", specular = false, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}

        data-spec={specular ? "" : undefined}
        className={cn(
          "ct-card rounded-[2rem] p-6 relative min-w-0",
          "glass-panel text-cream",
          glow === "lime" && "border-lime/30",
          glow === "forest" && "border-forest-700/50",
          hoverEffect && "ct-card-interactive",
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
