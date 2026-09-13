"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface HeadingProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("ct-reveal", className)}>{children}</div>;
}

export function PageIntro({ eyebrow, title, description, actions, children, className }: HeadingProps) {
  return <header className={cn("ct-page-intro", className)}>
    <div className="world-intro-mark" aria-hidden="true"><span /><i /><span /></div>
    <div className="ct-intro-heading">
      <div className="min-w-0">
        {eyebrow && <div className="ct-eyebrow">{eyebrow}</div>}
        <h1 className="ct-page-title">{title}</h1>
        {description && <p className="ct-intro-copy">{description}</p>}
      </div>
      {actions && <div className="ct-intro-actions">{actions}</div>}
    </div>
    {children}
  </header>;
}

export function SectionHeading({ eyebrow, title, description, actions, className }: HeadingProps) {
  return <div className={cn("ct-section-heading", className)}>
    <div className="min-w-0">
      {eyebrow && <div className="ct-eyebrow">{eyebrow}</div>}
      <h2 className="font-display text-2xl sm:text-3xl font-light tracking-tight text-cream">{title}</h2>
      {description && <p className="mt-3 text-sm sm:text-base text-sage leading-relaxed max-w-3xl">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
  </div>;
}
