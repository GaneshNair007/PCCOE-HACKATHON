import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, type, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {icon && <div className="absolute left-4 text-lime">{icon}</div>}
        <input
          type={type}
          ref={ref}
          className={cn(
            "w-full bg-surface/80 text-cream placeholder:text-sage/40 rounded-full border border-surface-border px-5 py-3.5 text-sm transition-all duration-200",
            "focus:outline-none focus:border-lime/60 focus:ring-2 focus:ring-lime/20 focus:bg-surface-elevated/90",
            icon && "pl-12",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";
