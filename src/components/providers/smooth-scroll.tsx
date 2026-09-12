"use client";
import React, { createContext, useContext } from "react";
import type Lenis from "lenis";
import { MotionConfig } from "framer-motion";
const LenisContext = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisContext);
/** Native scrolling preserves anchor, keyboard, dialog, and route restoration behavior. */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  return <LenisContext.Provider value={null}><MotionConfig reducedMotion="user">{children}</MotionConfig></LenisContext.Provider>;
}
