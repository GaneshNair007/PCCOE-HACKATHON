"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Search, Loader2, Sparkles, Globe, Terminal, ShieldCheck, ArrowRight } from "lucide-react";

interface SylvaHeroProps {
  onRunAudit: (url: string) => void;
  auditStatus: "idle" | "running" | "completed" | "failed";
  currentPhase: string;
  errorMessage: string | null;
  targetUrl: string;
  setTargetUrl: (url: string) => void;
}

export function SylvaHero({
  onRunAudit,
  auditStatus,
  currentPhase,
  errorMessage,
  targetUrl,
  setTargetUrl,
}: SylvaHeroProps) {
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const [showAuditInput, setShowAuditInput] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Ensure document.documentElement has "js" class for mask clip-paths
    document.documentElement.classList.add("js");

    let isMounted = true;

    const loadScript = (src: string) => {
      return new Promise<void>((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
          resolve();
          return;
        }
        const s = document.createElement("script");
        s.src = src;
        s.async = false;
        s.onload = () => resolve();
        s.onerror = (e) => reject(e);
        document.body.appendChild(s);
      });
    };

    async function initSylva() {
      try {
        await loadScript("/inner-green-assets/three.min.js");
        if (!isMounted) return;
        await loadScript("/inner-green-assets/sylva-liquid-metal.js");
        if (!isMounted) return;
        await loadScript("/inner-green-assets/sylva-scene.js");
        if (!isMounted) return;

        // Mount Liquid Metal dispersion shaders
        if (typeof (window as any).initLiquidMetal === "function") {
          (window as any).initLiquidMetal();
        }

        setScriptsLoaded(true);
      } catch (err) {
        console.error("Failed to load Sylva Hero scripts:", err);
      }
    }

    initSylva();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmitAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl.trim()) {
      setShowAuditInput(true);
      inputRef.current?.focus();
      return;
    }
    // Trigger 3D scan pulse on the moss root
    if (typeof (window as any).__triggerSylvaScan === "function") {
      (window as any).__triggerSylvaScan();
    }
    onRunAudit(targetUrl);
  };

  const handlePillClick = () => {
    if (!showAuditInput) {
      setShowAuditInput(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      if (targetUrl.trim()) {
        if (typeof (window as any).__triggerSylvaScan === "function") {
          (window as any).__triggerSylvaScan();
        }
        onRunAudit(targetUrl);
      } else {
        inputRef.current?.focus();
      }
    }
  };

  return (
    <div className="relative w-full">
      {/* Load Sylva Hero CSS */}
      <link rel="stylesheet" href="/inner-green-assets/sylva.css" />

      {/* Main Sylva Hero Container */}
      <main className="hero" id="hero">
        <canvas id="scene"></canvas>

        {/* Apple-style floating dock */}
        <div className="dock-wrap">
          <nav className="dock par-dock" style={{ ["--pd" as any]: 5 }} data-spec aria-label="Primary Navigation">
            <Link
              className="dock-item dock-mark"
              data-dock
              data-spec
              data-burst
              href="/"
              style={{ ["--d" as any]: "120ms" }}
              aria-label="Carbonerra — home"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="#cbff00" stroke="#cbff00" />
              </svg>
            </Link>
            <a className="dock-item is-active" data-dock data-spec data-burst href="#hero" style={{ ["--d" as any]: "180ms" }}>
              <span className="glyph" aria-hidden="true">
                <svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" stroke="currentColor" fill="none" strokeWidth="1.5"/><path d="M8 4v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5"/></svg>
              </span>
              <span>Scanner</span>
            </a>
            <Link className="dock-item" data-dock data-spec data-burst href="/savings-lab" style={{ ["--d" as any]: "230ms" }}>
              <span className="glyph" aria-hidden="true">
                <svg viewBox="0 0 16 16"><path d="M2 13h12M4 9l3-3 3 2 4-5" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>
              </span>
              <span>Savings Lab</span>
            </Link>
            <Link className="dock-item" data-dock data-spec data-burst href="/shield" style={{ ["--d" as any]: "280ms" }}>
              <span className="glyph" aria-hidden="true">
                <svg viewBox="0 0 16 16"><path d="M8 2l5 2.5v4c0 3.5-2.5 6-5 6.5-2.5-.5-5-3-5-6.5v-4L8 2z" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>
              </span>
              <span>Shield</span>
            </Link>
            <Link className="dock-item" data-dock data-spec data-burst href="/evidence" style={{ ["--d" as any]: "330ms" }}>
              <span className="glyph" aria-hidden="true">
                <svg viewBox="0 0 16 16"><path d="M3 3h10v10H3zM6 6h4M6 9h4" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>
              </span>
              <span>Evidence</span>
            </Link>
            <Link className="dock-item" data-dock data-spec data-burst href="/dashboard" style={{ ["--d" as any]: "380ms" }}>
              <span className="glyph" aria-hidden="true">
                <svg viewBox="0 0 16 16"><path d="M2 3h5v5H2zM9 3h5v3H9zM9 8h5v5H9zM2 10h5v3H2z" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>
              </span>
              <span>Fleet</span>
            </Link>
            <button
              onClick={() => {
                setShowAuditInput(true);
                setTimeout(() => inputRef.current?.focus(), 50);
              }}
              className="dock-item dock-item--enter"
              data-dock
              data-spec
              data-burst
              type="button"
              style={{ ["--d" as any]: "430ms" }}
            >
              <span className="glyph" aria-hidden="true">
                <svg viewBox="0 0 16 16"><circle cx="7" cy="7" r="4.5" stroke="currentColor" fill="none" strokeWidth="1.4"/><path d="m10.5 10.5 3.5 3.5" stroke="currentColor" strokeWidth="1.4"/></svg>
              </span>
              <span>Audit Now</span>
            </button>
          </nav>
        </div>

        {/* Centered 1600 × 880 Stage */}
        <div className="stage" id="stage">
          {/* Subtle column guide lines */}
          <div className="guides fade" style={{ ["--d" as any]: "900ms" }} aria-hidden="true">
            <i style={{ left: "calc(405 * var(--u))" }}></i>
            <i style={{ left: "calc(748 * var(--u))" }}></i>
            <i style={{ left: "calc(1091 * var(--u))" }}></i>
          </div>

          {/* Ghost Wordmark */}
          <div className="ghost fade" style={{ ["--d" as any]: "1150ms" }} aria-hidden="true">
            CARBONERRA
          </div>

          {/* Card 1: Dual-Source Engine (sitting behind moss canvas) */}
          <article className="card card--about mask" style={{ ["--d" as any]: "760ms", ["--pd" as any]: 10, ["--pr" as any]: 2.2 }}>
            <figure className="portal" data-delay="920">
              <span className="portal-media">
                <img
                  src="/inner-green-assets/card-ethos.jpg"
                  alt="Dual-Source Synthetic Engine & Static DOM Verification"
                  loading="eager"
                  decoding="async"
                />
              </span>
              <canvas className="pixel-reveal" aria-hidden="true"></canvas>
            </figure>
            <p className="label">Dual-Source Engine</p>
            <h2>Lighthouse &amp; DOM Concordance</h2>
          </article>

          {/* Floating Knob for Card 1 */}
          <span className="knob-float" style={{ ["--pd" as any]: 10, ["--pr" as any]: 2.2 }}>
            <button
              className="knob knob--about mask-circle"
              style={{ ["--d" as any]: "1100ms" }}
              aria-label="Run Dual-Source Audit"
              onClick={() => {
                setShowAuditInput(true);
                setTimeout(() => inputRef.current?.focus(), 50);
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#1b1e18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="#1b1e18" />
              </svg>
            </button>
          </span>

          {/* Headline */}
          <h1 className="headline" style={{ ["--pd" as any]: 18, ["--pr" as any]: 1.2 }}>
            <span><i style={{ ["--d" as any]: "260ms" }}>Audit the carbon</i></span>
            <span><i style={{ ["--d" as any]: "360ms" }}>behind every byte</i></span>
          </h1>

          {/* Lede Copy */}
          <p className="lede mask" style={{ ["--d" as any]: "480ms", ["--pd" as any]: 14, ["--pr" as any]: 1 }}>
            Production-grade digital carbon telemetry. Audited with official SWDM v4 reference models, dual-source synthetic execution, and real datacenter grid intensity.
          </p>

          {/* Primary Liquid Metal Button (Pill) */}
          <div className="pill-clip">
            <div className="pill mask" style={{ ["--d" as any]: "600ms", ["--pd" as any]: 15, ["--pr" as any]: 1.4 }}>
              <div className="liquid-stage liquid-stage--explore" data-liquid-metal="explore">
                <div className="liquid-plate plate" aria-hidden="true"></div>
                <canvas className="liquid-fx" aria-hidden="true"></canvas>
                <button
                  className="liquid-button liquid-button--explore btn"
                  type="button"
                  onClick={handlePillClick}
                >
                  <svg className="ico" viewBox="0 0 115 115" aria-hidden="true">
                    <g stroke="currentColor" strokeWidth="11" strokeLinecap="round">
                      <path d="M14 34.5 H101" />
                      <path d="M14 57.5 H101" />
                      <path d="M14 80.5 H68" />
                    </g>
                  </svg>
                  <span className="lbl">{auditStatus === "running" ? "Auditing Site..." : "Audit Website"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Play Wrap Button - Triggers 3D Moss Scan Pulse */}
          <span className="play-wrap" style={{ ["--pd" as any]: 20 }}>
            <span className="play-clip">
              <span className="play-glass mask-circle" style={{ ["--d" as any]: "900ms" }}>
                <span className="liquid-stage liquid-stage--play" data-liquid-metal="play">
                  <span className="liquid-plate plate" aria-hidden="true"></span>
                  <canvas className="liquid-fx" aria-hidden="true"></canvas>
                  <button
                    className="liquid-button liquid-button--play btn"
                    type="button"
                    aria-label="Trigger 3D Wireframe Pulse"
                    onClick={() => {
                      if (typeof (window as any).__triggerSylvaScan === "function") {
                        (window as any).__triggerSylvaScan();
                      }
                      if (!targetUrl.trim()) {
                        setTargetUrl("https://stripe.com");
                        onRunAudit("https://stripe.com");
                      } else {
                        onRunAudit(targetUrl);
                      }
                    }}
                  >
                    <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8 5.2v13.6L19 12z" fill="currentColor" />
                    </svg>
                  </button>
                </span>
              </span>
            </span>
            <span className="play-ring mask-circle" style={{ ["--d" as any]: "840ms" }} aria-hidden="true"></span>
          </span>

          {/* Stat A Badge */}
          <dl className="stat stat--a mask" style={{ ["--d" as any]: "700ms", ["--pd" as any]: 12 }}>
            <span className="mark" aria-hidden="true">
              <svg viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
                <circle cx="15" cy="15" r="10.5" strokeDasharray="0.6 3.6" />
                <circle cx="15" cy="15" r="5.6" strokeDasharray="0.6 3.2" />
                <circle cx="15" cy="15" r="1.1" fill="currentColor" stroke="none" />
              </svg>
            </span>
            <div><dt>Model Standard</dt><dd>SWDM v4 (@tgwf/co2)</dd></div>
          </dl>

          {/* Stat B Badge */}
          <dl className="stat stat--b mask" style={{ ["--d" as any]: "770ms", ["--pd" as any]: 13 }}>
            <span className="mark" aria-hidden="true">
              <svg viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
                <g id="rays">
                  <path d="M15 3.5v5" /><path d="M15 21.5v5" /><path d="M3.5 15h5" /><path d="M21.5 15h5" />
                  <path d="M6.9 6.9l3.5 3.5" /><path d="M19.6 19.6l3.5 3.5" /><path d="M23.1 6.9l-3.5 3.5" /><path d="M10.4 19.6l-3.5 3.5" />
                </g>
                <circle cx="15" cy="15" r="3.6" />
              </svg>
            </span>
            <div><dt>Release Shield</dt><dd>350 KB Budget Gate</dd></div>
          </dl>

          {/* Card 2: Release Shield */}
          <article className="card card--stove mask" style={{ ["--d" as any]: "880ms", ["--pd" as any]: 22, ["--pr" as any]: 2.4 }}>
            <p className="label">Release Shield</p>
            <h2>350 KB CI/CD Budget Gate</h2>
            <figure className="portal" data-delay="1080">
              <span className="portal-media">
                <img
                  src="/inner-green-assets/card-ecostove.jpg"
                  alt="Automated CI/CD 350 KB Release Budget Guard"
                  loading="eager"
                  decoding="async"
                />
              </span>
              <canvas className="pixel-reveal" aria-hidden="true"></canvas>
            </figure>
            <Link
              href="/shield"
              className="knob"
              aria-label="Open Release Shield"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#1b1e18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </Link>
          </article>

          {/* Discover Scroll Cue */}
          <a className="scroll mask" style={{ ["--d" as any]: "1040ms", ["--pd" as any]: 9 }} href="#cockpit">
            Telemetry Cockpit<span className="track"></span>
          </a>

          {/* Live Backend Audit Floating HUD (seamlessly styled in Sylva's glass aesthetic) */}
          <div
            className={`absolute z-30 transition-all duration-500 ${
              showAuditInput
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 -translate-y-4 pointer-events-none"
            }`}
            style={{
              left: "calc(46 * var(--u))",
              bottom: "calc(130 * var(--u))",
              width: "calc(680 * var(--u))",
            }}
          >
            <form
              onSubmit={handleSubmitAudit}
              data-spec
              className="p-3.5 rounded-2xl glass-panel-elevated shadow-2xl space-y-2.5 transition-all"
            >
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#cbff00] animate-pulse" />
                  <span className="text-[11px] font-mono font-bold tracking-widest text-[#cbff00] uppercase">
                    SWDM v4 DUAL-SOURCE ENGINE
                  </span>
                </div>
                <span className="text-[10px] font-mono text-white/50">
                  Lighthouse + Static DOM Concordance
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 relative flex items-center">
                  <Search className="w-4 h-4 text-[#cbff00] absolute left-3 pointer-events-none" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="Enter website URL to audit (e.g. stripe.com)"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#cbff00] transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={auditStatus === "running"}
                  className="px-4 py-2 rounded-xl bg-[#cbff00] text-[#1b1e18] font-bold text-xs hover:bg-[#e4ff66] transition flex items-center gap-1.5 shadow-lg font-mono disabled:opacity-50"
                >
                  {auditStatus === "running" ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Auditing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Run Audit
                    </>
                  )}
                </button>
              </div>

              {/* Benchmark presets */}
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/60 pt-1">
                <span>Presets:</span>
                {["stripe.com", "vercel.com", "pccoepune.com", "github.com"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setTargetUrl(`https://${preset}`);
                      if (typeof (window as any).__triggerSylvaScan === "function") {
                        (window as any).__triggerSylvaScan();
                      }
                      onRunAudit(`https://${preset}`);
                    }}
                    className="px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 hover:border-[#cbff00]/40 transition"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {/* Status / Phase update */}
              {auditStatus === "running" && (
                <div className="text-[11px] font-mono text-[#cbff00] flex items-center gap-1.5 pt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#cbff00] animate-ping" />
                  <span>{currentPhase || "Running dual-source audit..."}</span>
                </div>
              )}

              {/* Error notification */}
              {errorMessage && (
                <div className="text-[11px] font-mono text-red-400 pt-1">
                  {errorMessage}
                </div>
              )}
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
