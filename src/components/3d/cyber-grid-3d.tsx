"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

export function CyberGrid3D() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gridRef.current) return;

    // Smooth subtle floating animation
    gsap.to(gridRef.current, {
      backgroundPosition: "0px 100px",
      duration: 12,
      repeat: -1,
      ease: "none",
    });
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Radial Depth Horizon Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#060a08]/90 via-[#060a08]/40 to-[#060a08] z-10" />

      {/* 3D Perspective Plane */}
      <div
        style={{
          perspective: "800px",
          perspectiveOrigin: "50% 30%",
        }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div
          ref={gridRef}
          style={{
            transform: "rotateX(72deg) translateY(120px) translateZ(-80px)",
            transformOrigin: "50% 100%",
            backgroundImage: `
              linear-gradient(to right, rgba(203, 255, 0, 0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(203, 255, 0, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
            maskImage: "radial-gradient(ellipse at 50% 40%, black 20%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse at 50% 40%, black 20%, transparent 75%)",
          }}
          className="w-[200vw] h-[150vh] absolute bottom-0 left-[-50vw]"
        />
      </div>

      {/* Cyber Horizon Glow Line */}
      <div className="absolute top-[45%] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-lime/30 to-transparent shadow-[0_0_30px_rgba(203,255,0,0.3)] z-10" />
    </div>
  );
}
