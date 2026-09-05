"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

export function CursorOrb3D() {
  const orbRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only enable on fine pointer / desktop
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const orb = orbRef.current;
    const trail = trailRef.current;
    if (!orb || !trail) return;

    const xOrbTo = gsap.quickTo(orb, "x", { duration: 0.15, ease: "power2.out" });
    const yOrbTo = gsap.quickTo(orb, "y", { duration: 0.15, ease: "power2.out" });

    const xTrailTo = gsap.quickTo(trail, "x", { duration: 0.45, ease: "power3.out" });
    const yTrailTo = gsap.quickTo(trail, "y", { duration: 0.45, ease: "power3.out" });

    const handleMouseMove = (e: MouseEvent) => {
      xOrbTo(e.clientX);
      yOrbTo(e.clientY);
      xTrailTo(e.clientX);
      yTrailTo(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden select-none hidden md:block">
      {/* Primary Laser Dot */}
      <div
        ref={orbRef}
        className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-lime shadow-[0_0_12px_#cbff00]"
      />
      {/* Secondary Ambient Aura */}
      <div
        ref={trailRef}
        className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-lime/5 blur-3xl"
      />
    </div>
  );
}
