"use client";

import { useEffect } from "react";

/**
 * Completely suppresses Next.js development error badges, toasts, and overlay portals.
 * Ensures clean production-grade viewport presentation without dev overlay clutter.
 */
export function DevOverlaySuppression() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const purgeOverlay = () => {
      const portals = document.querySelectorAll("nextjs-portal");
      portals.forEach((p) => p.remove());
    };

    purgeOverlay();

    const observer = new MutationObserver(() => {
      purgeOverlay();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
