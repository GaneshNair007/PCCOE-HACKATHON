"use client";

import React from "react";

interface ButterflyOrbitProps {
  className?: string;
  size?: number;
  label?: string;
}

export function ButterflyOrbit({ className = "", size = 120, label = "Auditing Web Page..." }: ButterflyOrbitProps) {
  return (
    <div className={`relative flex flex-col items-center justify-center p-6 ${className}`}>
      {/* Orbital Container */}
      <div 
        className="relative flex items-center justify-center"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        {/* Soft Background Track */}
        <div className="absolute inset-0 rounded-full border border-lime/20 border-dashed animate-spin-slow" />

        {/* Central Ambient Glow */}
        <div className="w-8 h-8 rounded-full bg-lime/15 blur-lg" />

        {/* Orbiting Wrapper */}
        <div 
          className="absolute inset-0 animate-spin"
          style={{ animationDuration: "3.2s", animationTimingFunction: "linear", animationIterationCount: "infinite" }}
        >
          {/* Butterfly Positioned on Top Edge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center justify-center">
            <svg 
              width="26" 
              height="26" 
              viewBox="0 0 24 24" 
              fill="none" 
              className="drop-shadow-[0_0_8px_rgba(201,255,51,0.8)]"
            >
              {/* Left Wing (flapping via scaleX) */}
              <path
                d="M12 12C9 6 3 4 2 8C1 12 6 15 12 13"
                fill="#c9ff33"
                fillOpacity="0.85"
                stroke="#a3e635"
                strokeWidth="0.8"
                className="origin-right animate-butterfly-left"
              />
              {/* Right Wing (flapping via scaleX) */}
              <path
                d="M12 12C15 6 21 4 22 8C23 12 18 15 12 13"
                fill="#c9ff33"
                fillOpacity="0.85"
                stroke="#a3e635"
                strokeWidth="0.8"
                className="origin-left animate-butterfly-right"
              />
              {/* Butterfly Body */}
              <ellipse cx="12" cy="12" rx="1" ry="3.5" fill="#f4f4f0" />
              {/* Antennae */}
              <path d="M11.5 8.5C11 7 9.5 6 9 6" stroke="#f4f4f0" strokeWidth="0.6" strokeLinecap="round" />
              <path d="M12.5 8.5C13 7 14.5 6 15 6" stroke="#f4f4f0" strokeWidth="0.6" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Status Label */}
      {label && (
        <p className="mt-4 text-xs font-mono tracking-wider text-lime/90 text-center">
          {label}
        </p>
      )}

      {/* Global Embedded Styles for Butterfly Flapping Keyframes */}
      <style jsx global>{`
        @keyframes butterflyFlapLeft {
          0%, 100% { transform: scaleX(1); }
          50% { transform: scaleX(0.2); }
        }
        @keyframes butterflyFlapRight {
          0%, 100% { transform: scaleX(1); }
          50% { transform: scaleX(0.2); }
        }
        .animate-butterfly-left {
          animation: butterflyFlapLeft 0.28s ease-in-out infinite alternate;
        }
        .animate-butterfly-right {
          animation: butterflyFlapRight 0.28s ease-in-out infinite alternate;
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
