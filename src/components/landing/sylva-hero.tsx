"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { Search, Loader2 } from "lucide-react";

import { useLivingWorld } from "@/components/world/living-world";
import { SoapBubbleRank } from "@/components/3d/soap-bubble-rank";
import { AuditResult } from "@/types/telemetry";

interface SylvaHeroProps {
  onRunAudit: (url: string) => void;
  auditStatus: "idle" | "running" | "completed" | "failed";
  auditData?: AuditResult | null;
  currentPhase: string;
  errorMessage: string | null;
  targetUrl: string;
  setTargetUrl: (url: string) => void;
}

export function SylvaHero({
  onRunAudit,
  auditStatus,
  auditData,
  currentPhase,
  errorMessage,
  targetUrl,
  setTargetUrl,
}: SylvaHeroProps) {
  const { scan, reducedMotion } = useLivingWorld();
  const inputRef = useRef<HTMLInputElement>(null);
  const submittedAtRef = useRef(-Infinity);

  const focusAudit = () => {
    inputRef.current?.focus({ preventScroll: true });
    inputRef.current?.scrollIntoView({ block: 'center', behavior: reducedMotion ? 'instant' : 'smooth' });
  };

  const runAudit = (url: string) => {
    if (auditStatus === 'running' || performance.now() - submittedAtRef.current < 500) return;
    if (!url.trim()) { focusAudit(); return; }
    submittedAtRef.current = performance.now();
    scan();
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
      {/* Interactive DOM belongs to the same persistent Sylva world as every route. */}

      {/* Main Sylva Hero Container */}
      <section className="hero sylva-hero world-hero is-ready intro-done" id="hero" data-world-shot="arrival" aria-labelledby="hero-headline">
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
            CARBONTERRA
          </div>

          {/* Card 1: 3D Iridescent Soap Bubble Eco-Score Centerpiece */}
          <article className="card card--about mask" style={{ ["--d" as any]: "760ms", ["--pd" as any]: 10, ["--pr" as any]: 2.2 }}>
            <div
              className="absolute inset-x-[calc(14*var(--hero-unit))] top-[calc(14*var(--hero-unit))] h-[calc(185*var(--hero-unit))] rounded-[calc(28*var(--hero-unit))] bg-black/50 border border-white/10 flex items-center justify-center overflow-visible z-10 backdrop-blur-sm shadow-inner"
              style={{ minHeight: "165px" }}
            >
              <SoapBubbleRank
                grade={auditData?.eco_score || "A"}
                size="md"
                interactive={true}
                showRankLabel={false}
              />
            </div>
            <p className="label" style={{ top: "calc(210 * var(--hero-unit))" }}>Live 3D Eco-Score</p>
            <h2 style={{ top: "calc(234 * var(--hero-unit))", width: "calc(260 * var(--hero-unit))" }}>
              {auditData ? `${auditData.domain} · Grade ${auditData.eco_score}` : "Interactive 3D Soap Bubble"}
            </h2>
          </article>

          {/* Floating Knob for Card 1 */}
          <span className="knob-float" style={{ ["--pd" as any]: 10, ["--pr" as any]: 2.2 }}>
            <button
              className="knob knob--about mask-circle"
              style={{ ["--d" as any]: "1100ms" }}
              aria-label="Run Website Audit"
              onClick={focusAudit}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#1b1e18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="#1b1e18" />
              </svg>
            </button>
          </span>

          {/* Headline */}
          <h1 id="hero-headline" className="headline font-bold" style={{ ["--pd" as any]: 18, ["--pr" as any]: 1.2 }}>
            <span><i style={{ ["--d" as any]: "260ms" }}>Audit the carbon </i></span>
            <span><i style={{ ["--d" as any]: "360ms" }}>behind every byte</i></span>
          </h1>

          {/* Lede Copy */}
          <p className="lede mask" style={{ ["--d" as any]: "480ms", ["--pd" as any]: 14, ["--pr" as any]: 1 }}>
            Measure the environmental footprint of any website. See page weight, carbon emissions per visit, and hosting efficiency.
          </p>

          {/* Primary Liquid Metal Button (Pill) */}
          <div className="pill-clip">
            <div className="pill mask" style={{ ["--d" as any]: "600ms", ["--pd" as any]: 15, ["--pr" as any]: 1.4 }}>
              <div className="liquid-stage liquid-stage--explore" data-liquid-metal="explore">
                <div className="liquid-plate plate" aria-hidden="true"></div>
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
                  <span className="lbl">{auditStatus === "running" ? "AUDITING..." : "AUDIT WEBSITE"}</span>
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
            <div><dt>Standard</dt><dd>Sustainable Web Design</dd></div>
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
            <div><dt>Savings Lab</dt><dd>Interactive Optimization</dd></div>
          </dl>

          {/* Card 2: Savings Lab */}
          <article className="card card--stove mask" style={{ ["--d" as any]: "880ms", ["--pd" as any]: 22, ["--pr" as any]: 2.4 }}>
            <p className="label">Savings Lab</p>
            <h2>Drop-In WebP &amp; Script Fixes</h2>
            <figure className="portal" data-delay="1080">
              <span className="portal-media">
                <img
                  src="/landing-pages/inner-green-assets/card-ecostove.jpg"
                  alt="Interactive Green Engineering Optimization Lab"
                  loading="eager"
                  decoding="async"
                />
              </span>
            </figure>
            <Link
              href="/savings-lab"
              className="knob"
              aria-label="Open Savings Lab"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#1b1e18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </article>

          {/* Discover Scroll Cue */}
          <a className="scroll mask font-bold uppercase tracking-wider" style={{ ["--d" as any]: "1040ms", ["--pd" as any]: 9 }} href="#cockpit">
            VIEW AUDIT COCKPIT<span className="track"></span>
          </a>

          {/* Live Backend Audit Floating HUD (seamlessly styled in Sylva's glass aesthetic) */}
          <div className="hero-audit-form w-full max-w-3xl mx-auto z-30">
            <form
              onSubmit={handleSubmitAudit}
              data-spec
              className="hero-audit-dock p-5 sm:p-6 rounded-3xl glass-panel-elevated shadow-2xl space-y-3.5 transition-all w-full"
            >
              <div className="hero-audit-heading flex items-center justify-between gap-3 px-1">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-[#cbff00]" />
                  <span className="text-xs sm:text-sm font-semibold tracking-wider text-[#cbff00] uppercase">
                    WEBSITE CARBON AUDIT
                  </span>
                </div>
                <span className="hero-audit-detail text-xs sm:text-sm text-white/80 font-sans">
                  Page Weight &amp; Emissions Analysis
                </span>
              </div>
              <div className="hero-audit-entry flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="min-w-0 flex-1 relative flex items-center">
                  <Search className="w-5 h-5 text-[#cbff00] absolute left-4 pointer-events-none" />
                  <input
                    ref={inputRef}
                    type="text"
                    inputMode="url"
                    autoComplete="url"
                    aria-label="Website URL to audit"
                    disabled={auditStatus === "running"}
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="Enter website URL to audit (e.g. gmail.com, stripe.com)"
                    className="w-full pl-12 pr-4 py-3.5 sm:py-4 rounded-2xl bg-black/50 border border-white/20 text-white font-sans text-sm sm:text-base focus:outline-none focus:border-[#cbff00] focus:ring-1 focus:ring-[#cbff00] transition shadow-inner"
                  />
                </div>
                <button
                  type="submit"
                  disabled={auditStatus === "running"}
                  className="px-6 py-3.5 sm:py-4 rounded-2xl bg-[#cbff00] text-[#1b1e18] font-bold text-sm sm:text-base hover:bg-[#e4ff66] transition flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(203,255,0,0.35)] disabled:opacity-50 uppercase tracking-wider shrink-0 cursor-pointer"
                >
                  {auditStatus === "running" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      AUDITING...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      AUDIT WEBSITE
                    </>
                  )}
                </button>
              </div>

              {/* Benchmark presets */}
              <div className="hero-presets flex flex-wrap items-center gap-2 text-xs sm:text-sm text-white/80 pt-1">
                <span className="font-bold uppercase text-white/60">Presets:</span>
                {["gmail.com", "stripe.com", "vercel.com", "github.com"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    disabled={auditStatus === 'running'}
                    onClick={() => {
                      if (auditStatus === 'running') return;
                      const fullUrl = `https://${preset}`;
                      setTargetUrl(fullUrl);
                      runAudit(fullUrl);
                    }}
                    className="px-3 py-1 rounded-xl bg-white/10 hover:bg-[#cbff00]/20 hover:text-[#cbff00] border border-white/10 transition cursor-pointer font-medium"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {/* Status / Phase update with 3D Centerpiece Bubble */}
              {auditStatus === "running" && (
                <div role="status" className="pt-4 flex flex-col items-center gap-3">
                  <SoapBubbleRank grade="B" size="md" interactive={true} showRankLabel={false} />
                  <p className="text-xs sm:text-sm font-sans text-[#cbff00] font-semibold text-center">
                    {currentPhase || "Probing Network Payloads & Carbon Attribution..."}
                  </p>
                </div>
              )}

              {/* Completed Verdict in Hero Dock */}
              {auditStatus === "completed" && auditData && (
                <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <SoapBubbleRank grade={auditData.eco_score} size="sm" interactive={true} showRankLabel={false} />
                    <div className="text-left">
                      <div className="text-xs font-sans font-bold text-[#cbff00] uppercase tracking-wider">
                        AUDIT COMPLETE · GRADE {auditData.eco_score}
                      </div>
                      <div className="text-sm font-display font-bold text-white">
                        {auditData.domain} · <span className="tabular-nums">{auditData.co2_grams}</span> gCO2 / visit
                      </div>
                    </div>
                  </div>
                  <a
                    href="#cockpit"
                    className="px-4 py-2.5 rounded-xl bg-[#cbff00] text-black hover:bg-[#e4ff66] font-sans text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-[#cbff00]/20 shrink-0"
                  >
                    View Full 3D Breakdown ↓
                  </a>
                </div>
              )}

              {/* Error notification */}
              {errorMessage && (
                <div role="alert" className="text-[11px] font-sans text-white/80 pt-1">
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
