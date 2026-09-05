"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children: React.ReactNode;
  variant?: "lime" | "forest" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "lime", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const variants = {
      lime: "bg-lime text-forest-950 font-extrabold hover:bg-lime-hover shadow-lime active:scale-[0.98]",
      forest: "bg-forest-900 text-cream font-bold hover:bg-forest-800 border border-forest-700 active:scale-[0.98]",
      outline: "bg-transparent text-sage border border-surface-border hover:bg-surface-elevated hover:text-cream active:scale-[0.98]",
      ghost: "bg-transparent text-sage hover:bg-surface-elevated hover:text-cream active:scale-[0.98]",
      danger: "bg-red-950/80 text-red-300 border border-red-800/60 hover:bg-red-900/80 active:scale-[0.98]",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs rounded-full tracking-wider uppercase",
      md: "px-5 py-2.5 text-xs sm:text-sm rounded-full tracking-wider uppercase font-bold",
      lg: "px-7 py-3.5 text-sm sm:text-base rounded-full tracking-wider uppercase font-extrabold",
      icon: "w-10 h-10 rounded-full flex items-center justify-center p-0",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-lime/50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing...
          </span>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
