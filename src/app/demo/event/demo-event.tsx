"use client";

import React, { useState } from "react";

import {
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageIntro, SectionHeading, Reveal } from "@/components/ui/page";

export function DemoEventContent({ variant }: { variant: "baseline" | "optimized" | "broken" }) {

  const [name, setName] = useState("");
  const [heroUnavailable, setHeroUnavailable] = useState(false);
  const [email, setEmail] = useState("");
  const [dept, setDept] = useState("Computer Engineering");
  const [team, setTeam] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/demo/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          department: dept,
          teamName: team,
          variant,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.status === "error") {
        throw new Error(data.message || "Registration failed");
      }

      setTicketId(data.ticketId);
      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || "Could not complete registration.");
    } finally {
      setSubmitting(false);
    }
  };

  const isBroken = variant === "broken";

  return (
    <div className="world-campus max-w-4xl mx-auto space-y-8 pb-16 font-sans">
      {/* Controlled demo site Notice Banner */}
      <div className="p-4 rounded-2xl bg-surface border border-surface-border text-xs font-mono text-sage flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-lime shrink-0" />
          <span>
            <strong>Controlled demo site</strong> — Isolated campus registration property for Savings Lab verification.
          </span>
        </div>
        <Badge variant="outline" className="font-mono text-[10px] uppercase border-lime/40 text-cream">
          Variant: {variant}
        </Badge>
      </div>

      {/* Header Info */}
      <PageIntro
        eyebrow={<><Calendar className="w-3.5 h-3.5" /> March 20–22, 2026 • Annual hackathon</>}
        title={<span id="event-title">PCCOE Green Campus Hackathon 2026</span>}
      >
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-mono">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" /> PCCOE Pimpri Campus, Pune
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> 3-person teams • Student track
          </span>
        </div>
      </PageIntro>

      {/* First-Party Event Hero Image Component */}
      <div className="world-campus-banner relative rounded-3xl overflow-hidden border border-surface-border bg-surface-elevated">
        {heroUnavailable && variant !== 'broken' && <div className="world-campus-banner-fallback"><span>Campus event · banner preview unavailable</span><p>Grow ideas.<br />Leave an impact.</p></div>}
        {variant === "baseline" && (
          <div>
            {/* Uncompressed 2.4MB JPEG without responsive srcset */}
            <img
              id="event-hero-img"
              onError={() => setHeroUnavailable(true)}
              style={{opacity: heroUnavailable ? 0 : 1}}
              src="/demo/assets/campus-hackathon-hero.jpg"
              alt="PCCOE Green Campus Hackathon 2026 Banner"
              className="w-full h-72 sm:h-96 object-cover"
            />
            <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/80 border border-yellow-500/50 text-[10px] font-mono text-yellow-300">
              Unoptimized First-Party Asset (~2.4 MB JPEG)
            </div>
          </div>
        )}

        {variant === "optimized" && (
          <div>
            {/* Optimized WebP with modern encoding (~176 KB) */}
            <picture>
              <source srcSet="/demo/assets/campus-hackathon-hero.webp" type="image/webp" />
              <img
                id="event-hero-img"
                onError={() => setHeroUnavailable(true)}
                style={{opacity: heroUnavailable ? 0 : 1}}
                src="/demo/assets/campus-hackathon-hero.webp"
                alt="PCCOE Green Campus Hackathon 2026 Banner"
                width="1200"
                height="400"
                className="w-full h-72 sm:h-96 object-cover"
                fetchPriority="high"
              />
            </picture>
            <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/80 border border-lime/50 text-[10px] font-mono text-lime">
              Optimized Responsive WebP (~176 KB, -92% bytes)
            </div>
          </div>
        )}

        {variant === "broken" && (
          <div className="h-48 flex items-center justify-center bg-black/40 text-red-400 font-mono text-xs p-6 text-center">
            [Image stripped in broken candidate to artificially reduce bytes]
          </div>
        )}
      </div>

      {/* Event Overview Description */}
      <Reveal className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 p-6 space-y-4 text-sm text-sage/90 leading-relaxed font-sans">
          <p>
            Welcome to the PCCOE Green Campus Hackathon 2026! Over 48 hours, engineering teams will construct
            digital solutions that measure and curtail energy waste across college infrastructure, transportation,
            and digital web services.
          </p>
          <p>
            Participants receive mentor access, cloud sandbox credits, and verifiable digital badges. All current PCCOE
            undergraduate and graduate students are invited to register free of charge.
          </p>

          <div className="pt-2">
            {!isBroken ? (
              <a
                id="register-cta"
                href="#registration-form"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-lime text-black font-medium text-sm hover:bg-lime/90 transition-colors"
              >
                Go to registration form <ArrowRight className="w-3.5 h-3.5" />
              </a>
            ) : (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-mono">
                [Registration CTA intentionally missing in broken variant]
              </div>
            )}
          </div>
        </Card>

        <Card className="p-5 glass-panel-elevated border border-surface-border space-y-3 h-fit">
          <h2 className="font-display text-xl text-cream">Event schedule</h2>
          <ul className="text-xs text-sage/80 space-y-2 font-mono">
            <li>• Fri 18:00 — Opening Ceremony</li>
            <li>• Sat 12:00 — Architecture Review</li>
            <li>• Sun 14:00 — Final Pitches & Demos</li>
          </ul>
        </Card>
      </Reveal>

      {/* Registration Section */}
      {!isBroken ? (
        <section id="registration-form" className="space-y-6 rounded-3xl bg-surface border border-surface-border p-6 sm:p-8 scroll-mt-28">
          <SectionHeading title="Student registration" description="Complete the fields below to confirm your team seat." />

          {submitted ? (
            <div
              id="registration-success"
              role="status"
              aria-live="polite"
              className="p-6 rounded-2xl bg-lime/10 border border-lime/40 text-cream space-y-3 font-mono"
            >
              <div className="flex items-center gap-2.5 text-lime font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-lime" /> Registration Confirmed!
              </div>
              <p className="text-xs text-sage/90">
                You have been registered for PCCOE Green Campus Hackathon 2026.
              </p>
              <div className="p-3 rounded-xl bg-black/60 border border-surface-border w-fit text-xs text-lime">
                Confirmed Ticket ID: <strong>{ticketId}</strong>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} aria-busy={submitting} className="space-y-5 max-w-xl">
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-sm text-sage">Full name *</label>
                <Input
                  id="name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aditi Sharma"
                  required
                  className="bg-surface-elevated/70 border-surface-border text-cream font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm text-sage">College email *</label>
                <Input
                  id="email"
                  autoComplete="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. aditi.sharma@pccoepune.org"
                  required
                  className="bg-surface-elevated/70 border-surface-border text-cream font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="department" className="text-sm text-sage">Department</label>
                <select
                  id="department"
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                  className="w-full min-h-12 px-3 rounded-xl bg-surface-elevated border border-surface-border text-cream text-sm focus:outline-none focus:border-lime focus:ring-2 focus:ring-lime/30"
                >
                  <option value="Computer Engineering">Computer Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Telecomm">Electronics & Telecomm</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="team-name" className="text-sm text-sage">Team name (optional)</label>
                <Input
                  id="team-name"
                  value={team}
                  onChange={(e) => setTeam(e.target.value)}
                  placeholder="e.g. EcoCoders PCCOE"
                  className="bg-surface-elevated/70 border-surface-border text-cream font-mono text-xs"
                />
              </div>

              {submitError && (
                <div
                  id="registration-error"
                  role="alert"
                  className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs font-mono flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0" /> {submitError}
                </div>
              )}

              <Button
                id="submit-registration"
                type="submit"
                variant="lime"
                size="md"
                isLoading={submitting}
                className="font-mono font-bold text-xs tracking-normal"
              >
                Submit registration
              </Button>
            </form>
          )}
        </section>
      ) : (
        <div
          id="broken-registration-notice"
          className="p-6 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-300 font-mono text-xs space-y-2"
        >
          <div className="font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" /> BROKEN CANDIDATE VARIANT ACTIVE
          </div>
          <p>
            The registration form has been broken/disabled in this candidate. While this reduces page transfer bytes,
            Savings Lab functional assertions will detect the missing registration capability and automatically
            REJECT this candidate.
          </p>
        </div>
      )}
    </div>
  );
}

