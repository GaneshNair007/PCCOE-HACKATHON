"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Search, Loader2, Sparkles, Pause, Play } from "lucide-react";

interface HeroAnimation {
  setActive: (active: boolean) => void;
  dispose: () => void;
  scan?: () => void;
}

type SylvaWindow = Window & {
  initSylvaScene?: (root: HTMLElement, options: { active: boolean }) => HeroAnimation;
  initLiquidMetal?: (root: HTMLElement, options: { active: boolean }) => HeroAnimation;
};

// A loaded script is shared; each route mount owns its own animation instance.
const scriptLoads = new Map<string, Promise<void>>();
function loadHeroScript(src: string) {
  const pending = scriptLoads.get(src);
  if (pending) return pending;
  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => { script.remove(); scriptLoads.delete(src); reject(new Error('Hero script failed: ' + src)); };
    document.body.appendChild(script);
  });
  scriptLoads.set(src, promise);
  return promise;
}

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
  const [motionPaused, setMotionPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const animations = useRef<HeroAnimation[]>([]);
  const activeRef = useRef(false);
  const submittedAtRef = useRef(-Infinity);

  useEffect(() => {
    const root = heroRef.current;
    if (!root) return;
    let mounted = true;
    let visible = root.getBoundingClientRect().bottom > 0;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      const active = visible && !document.hidden && !media.matches && root.dataset.userPaused !== 'true';
      activeRef.current = active;
      setReducedMotion(media.matches);
      root.dataset.motion = active ? 'running' : 'paused';
      animations.current.forEach((animation) => animation.setActive(active));
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(root);
    media.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    sync();

    const initialize = async () => {
      try {
        await loadHeroScript('/inner-green-assets/three.min.js');
        await loadHeroScript('/inner-green-assets/sylva-liquid-metal.js');
        await loadHeroScript('/inner-green-assets/sylva-scene.js');
        if (!mounted) return;
        const runtime = window as SylvaWindow;
        const options = { active: activeRef.current };
        const scene = runtime.initSylvaScene?.(root, options);
        const liquid = runtime.initLiquidMetal?.(root, options);
        animations.current = [scene, liquid].filter((animation): animation is HeroAnimation => !!animation);
        sync();
      } catch (error) {
        root.classList.add('is-ready', 'intro-done');
        console.error('Failed to load Sylva Hero scripts:', error);
      }
    };
    void initialize();
    return () => {
      mounted = false;
      observer.disconnect();
      media.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
      animations.current.forEach((animation) => animation.dispose());
      animations.current = [];
    };
  }, []);

  useEffect(() => {
    const root = heroRef.current;
    if (!root) return;
    root.dataset.userPaused = String(motionPaused);
    // The animation controllers also gate against the user's pause setting.
    animations.current.forEach((animation) => animation.setActive(activeRef.current && !motionPaused));
    if (!motionPaused) document.dispatchEvent(new Event('visibilitychange'));
    else root.dataset.motion = 'paused';
  }, [motionPaused]);

  const focusAudit = () => {
    inputRef.current?.focus({ preventScroll: true });
    inputRef.current?.scrollIntoView({ block: 'center', behavior: reducedMotion ? 'instant' : 'smooth' });
  };

  const runAudit = (url: string) => {
    if (auditStatus === 'running' || performance.now() - submittedAtRef.current < 500) return;
    if (!url.trim()) { focusAudit(); return; }
    submittedAtRef.current = performance.now();
    animations.current.forEach((animation) => animation.scan?.());
    onRunAudit(url);
  };

  const handleSubmitAudit = (event: React.FormEvent) => {
    event.preventDefault();
    runAudit(targetUrl);
  };

  const handlePillClick = () => {
    if (targetUrl.trim()) runAudit(targetUrl);
    else focusAudit();
  };

  return (
    <div className="relative w-full">
      {/* Load Sylva Hero CSS */}

      {/* Main Sylva Hero Container */}
      <section ref={heroRef} className="hero sylva-hero" id="hero" aria-labelledby="hero-headline">
        <canvas id="scene" aria-hidden="true"></canvas>
        <button className="hero-motion-toggle" type="button" onClick={() => setMotionPaused((paused) => !paused)} aria-pressed={motionPaused} disabled={reducedMotion}>
          {motionPaused || reducedMotion ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
          {reducedMotion ? "Motion reduced" : motionPaused ? "Resume motion" : "Pause motion"}
        </button>

        {/* Centered 1600 × 880 Stage */}
        <div className="stage" id="stage">
          {/* Subtle column guide lines */}
          <div className="guides fade" style={{ ["--d" as any]: "900ms" }} aria-hidden="true">
            <i style={{ left: "calc(405 * var(--hero-unit))" }}></i>
            <i style={{ left: "calc(748 * var(--hero-unit))" }}></i>
            <i style={{ left: "calc(1091 * var(--hero-unit))" }}></i>
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
              onClick={focusAudit}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#1b1e18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="#1b1e18" />
              </svg>
            </button>
          </span>

          {/* Headline */}
          <h1 id="hero-headline" className="headline" style={{ ["--pd" as any]: 18, ["--pr" as any]: 1.2 }}>
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
                  disabled={auditStatus === "running"}
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
                    aria-label="Run website audit"
                    disabled={auditStatus === 'running'}
                    onClick={() => {
                      if (auditStatus === 'running') return;
                      const url = targetUrl.trim() || 'https://stripe.com';
                      if (!targetUrl.trim()) setTargetUrl(url);
                      runAudit(url);
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
          <div className="hero-audit-form">
            <form
              onSubmit={handleSubmitAudit}
              data-spec
              className="p-3.5 rounded-2xl glass-panel-elevated shadow-2xl space-y-2.5 transition-all"
            >
              <div className="hero-audit-heading flex items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#cbff00] animate-pulse" />
                  <span className="text-[11px] font-mono font-bold tracking-widest text-[#cbff00] uppercase">
                    SWDM v4 DUAL-SOURCE ENGINE
                  </span>
                </div>
                <span className="hero-audit-detail text-[10px] font-mono text-white/60">
                  Lighthouse + Static DOM Concordance
                </span>
              </div>
              <div className="hero-audit-entry flex items-center gap-2">
                <div className="min-w-0 flex-1 relative flex items-center">
                  <Search className="w-4 h-4 text-[#cbff00] absolute left-3 pointer-events-none" />
                  <input
                    ref={inputRef}
                    type="text"
                    inputMode="url"
                    autoComplete="url"
                    aria-label="Website URL to audit"
                    disabled={auditStatus === "running"}
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
              <div className="hero-presets flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-white/60 pt-1">
                <span>Presets:</span>
                {["stripe.com", "vercel.com", "pccoepune.com", "github.com"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    disabled={auditStatus === 'running'}
                    onClick={() => {
                      if (auditStatus === 'running') return;
                      setTargetUrl(`https://${preset}`);
                      runAudit(`https://${preset}`);
                    }}
                    className="px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 hover:border-[#cbff00]/40 transition"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {/* Status / Phase update */}
              {auditStatus === "running" && (
                <div role="status" className="text-[11px] font-mono text-[#cbff00] flex items-center gap-1.5 pt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#cbff00] animate-ping" />
                  <span>{currentPhase || "Running dual-source audit..."}</span>
                </div>
              )}

              {/* Error notification */}
              {errorMessage && (
                <div role="alert" className="text-[11px] font-mono text-red-400 pt-1">
                  {errorMessage}
                </div>
              )}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
