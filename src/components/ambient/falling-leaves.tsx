"use client";

import React, { useEffect, useRef } from "react";

interface Leaf {
  x: number;
  y: number;
  fall: number;      // vertical fall speed (px/sec)
  slip: number;      // lateral slip magnitude
  roll: number;      // in-plane rotation angle
  rollSpeed: number; // in-plane rotation rate
  spin: number;      // through-plane tumble angle (cos crosses 0 for edge-on)
  spinSpeed: number; // tumble frequency
  scale: number;     // size scalar
  alpha: number;     // base opacity
  length: number;    // leaf length
  width: number;     // leaf width
}

/**
 * Organic Ambient Falling Leaves Layer
 * Built to the exact craft specification of `falling-leaves/SKILL.md`:
 * - Through-plane tumble where Math.cos(spin) crosses 0 (edge-on flip)
 * - Aerodynamic coupling of lateral slip to tumble angle
 * - Distinct two-tone face/back rendering
 * - Complete disabling on prefers-reduced-motion
 */
export function FallingLeaves({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // 1. Accessibility Guardrail: disable animation entirely if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    const resize = () => {
      if (!canvas) return;
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    // Subtle leaf density: 18 leaves on desktop, 8 on mobile (atmosphere, not blizzard)
    const count = canvas.width > 768 ? 18 : 8;
    const leaves: Leaf[] = [];

    const resetLeaf = (l: Partial<Leaf>, startAbove = true): Leaf => {
      const w = canvas.width || 800;
      const h = canvas.height || 600;
      return {
        x: Math.random() * w,
        y: startAbove ? -30 - Math.random() * 80 : Math.random() * h,
        fall: 28 + Math.random() * 32, // gentle 28-60 px/sec
        slip: 20 + Math.random() * 26,
        roll: Math.random() * Math.PI * 2,
        rollSpeed: (Math.random() - 0.5) * 0.9,
        spin: Math.random() * Math.PI * 2,
        spinSpeed: 1.2 + Math.random() * 1.8,
        scale: 0.75 + Math.random() * 0.5,
        alpha: 0.12 + Math.random() * 0.16, // subtle atmospheric opacity (0.12 to 0.28)
        length: 18 + Math.random() * 10,
        width: 10 + Math.random() * 6,
      };
    };

    for (let i = 0; i < count; i++) {
      leaves.push(resetLeaf({}, false));
    }

    // Draw an organic curved leaf path centered at (0, 0)
    const drawLeafPath = (context: CanvasRenderingContext2D, len: number, wid: number) => {
      context.beginPath();
      context.moveTo(0, -len / 2);
      // Top tip to bottom stem (right curve)
      context.bezierCurveTo(wid / 1.5, -len / 4, wid / 1.5, len / 4, 0, len / 2);
      // Bottom stem to top tip (left curve)
      context.bezierCurveTo(-wid / 1.5, len / 4, -wid / 1.5, -len / 4, 0, -len / 2);
      context.closePath();
    };

    let isVisible = true;
    const handleVisibility = () => {
      isVisible = !document.hidden;
      if (isVisible) lastTime = performance.now();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const render = (now: number) => {
      if (!isVisible) {
        animId = requestAnimationFrame(render);
        return;
      }

      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < leaves.length; i++) {
        const l = leaves[i];

        // Physical updates
        l.spin += l.spinSpeed * dt;
        l.roll += l.rollSpeed * dt;

        // Coupled aerodynamic lateral slip: fastest when edge-on (cos(spin) ≈ 0)
        l.x += Math.sin(l.spin) * l.slip * dt;
        l.y += l.fall * dt;

        // Recycle leaf if it slips off bottom or sides
        if (l.y > canvas.height + 40) {
          leaves[i] = resetLeaf(l, true);
          continue;
        }
        if (l.x < -40) l.x = canvas.width + 30;
        if (l.x > canvas.width + 40) l.x = -30;

        // Render leaf with through-plane tumble
        ctx.save();
        ctx.translate(l.x, l.y);
        ctx.rotate(l.roll);

        // Through-plane tumble: horizontal scaling across zero
        const tumbleScale = Math.cos(l.spin);
        ctx.scale(tumbleScale * l.scale, l.scale);

        // Two-tone realism: front face is vibrant sage/emerald; back face is duller/paler
        const isBack = tumbleScale < 0;
        ctx.fillStyle = isBack ? "rgba(45, 94, 68, 0.75)" : "rgba(80, 160, 110, 0.85)";
        ctx.globalAlpha = l.alpha;

        drawLeafPath(ctx, l.length, l.width);
        ctx.fill();

        // Subtle center vein
        ctx.strokeStyle = isBack ? "rgba(30, 60, 45, 0.4)" : "rgba(180, 240, 120, 0.35)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(0, -l.length / 2 + 2);
        ctx.lineTo(0, l.length / 2 - 2);
        ctx.stroke();

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-0 ${className}`}
    />
  );
}
