"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Calendar, MapPin, Users, CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";

function ControlledEventDemoContent() {
  const searchParams = useSearchParams();
  const variant = (searchParams.get("variant") as "baseline" | "optimized" | "broken") || "baseline";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [track, setTrack] = useState("sustainability");
  const [submitting, setSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/demo/event/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, track, variant }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}: Registration endpoint failure`);
      }

      const data = await res.json();
      setTicketId(data.ticketId);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07130e] text-cream-50 font-sans">
      {/* Top Banner indicating variant */}
      <div className="border-b border-forest-800 bg-forest-900/80 px-4 py-2 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-lime-400 hover:underline flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Mission Control
          </Link>
          <span className="text-forest-700">|</span>
          <span className="font-mono text-zinc-400">Controlled Demo Fixture:</span>
          <span
            className={`font-mono px-2 py-0.5 rounded text-xs font-semibold ${
              variant === "baseline"
                ? "bg-amber-950 text-amber-300 border border-amber-800"
                : variant === "optimized"
                ? "bg-lime-950 text-lime-400 border border-lime-800"
                : "bg-rose-950 text-rose-300 border border-rose-800"
            }`}
          >
            Variant: {variant.toUpperCase()}
          </span>
        </div>
        <div className="text-zinc-400 text-xs hidden sm:block">
          {variant === "baseline" && "2.45 MB Uncompressed Raw JPEG Banner"}
          {variant === "optimized" && "185 KB WebP Responsive Picture Element"}
          {variant === "broken" && "Broken Candidate: HTTP 500 Task Assertion Failure"}
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Event Header */}
        <div className="space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-800/60 text-lime-400 text-xs border border-forest-700">
            <Calendar className="w-3.5 h-3.5" /> September 18-20, 2026
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-cream-50">
            PCCOE Green Campus Hackathon 2026
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-forest-600" /> PCCOE Campus Auditorium & Hybrid
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-forest-600" /> 500+ Student Builders
            </span>
          </div>
        </div>

        {/* Hero Banner Component (Active Variant Difference) */}
        <div className="mb-8 rounded-2xl overflow-hidden border border-forest-800 bg-forest-950 shadow-2xl relative">
          {variant === "baseline" ? (
            /* Baseline: Oversized 2.45MB JPEG hero poster */
            <div className="relative group">
              <img
                src="/demo/hero-poster.jpg"
                alt="PCCOE Hackathon Poster"
                className="w-full h-auto aspect-video object-cover"
                id="hero-banner-image"
              />
              <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur px-3 py-1 rounded text-xs font-mono text-amber-300 border border-amber-900/60">
                Asset: 2.45 MB (JPEG)
              </div>
            </div>
          ) : variant === "optimized" ? (
            /* Optimized: 185KB Responsive WebP Picture Element */
            <div className="relative group">
              <picture id="hero-banner-picture">
                <source srcSet="/demo/hero-poster.webp" type="image/webp" />
                <img
                  src="/demo/hero-poster.jpg"
                  alt="PCCOE Hackathon Poster"
                  className="w-full h-auto aspect-video object-cover"
                  loading="eager"
                  decoding="async"
                  width="1200"
                  height="675"
                  id="hero-banner-image"
                />
              </picture>
              <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur px-3 py-1 rounded text-xs font-mono text-lime-400 border border-lime-900/60">
                Asset: 185 KB (WebP Picture)
              </div>
            </div>
          ) : (
            /* Broken candidate: smaller asset but broken handlers */
            <div className="relative group">
              <img
                src="/demo/hero-poster.webp"
                alt="PCCOE Hackathon Poster"
                className="w-full h-auto aspect-video object-cover"
                id="hero-banner-image"
              />
              <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur px-3 py-1 rounded text-xs font-mono text-rose-300 border border-rose-900/60">
                Asset: 140 KB (Broken Form Injection)
              </div>
            </div>
          )}
        </div>

        {/* Event Details & Registration Card */}
        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-3 space-y-4 text-zinc-300 text-sm leading-relaxed">
            <h2 className="text-xl font-bold text-cream-50">Build Low-Carbon Digital Solutions</h2>
            <p>
              Join engineers, designers, and climate researchers at PCCOE to build high-performance,
              sustainably engineered digital platforms. Every student registration on this page is
              tested under live network conditions to prove that lightweight asset delivery preserves
              conversion while slashing gigabytes of unnecessary data transfer.
            </p>
            <div className="p-4 rounded-xl bg-forest-900/40 border border-forest-800 space-y-2">
              <div className="font-semibold text-cream-50 text-xs tracking-wider uppercase">
                Challenge Tracks
              </div>
              <ul className="list-disc list-inside space-y-1 text-xs text-zinc-400">
                <li>Digital Decarbonization & Edge Caching</li>
                <li>Sustainable Web Design Model (SWDM v4) Tools</li>
                <li>Automated Image Compression & Format Negotiation</li>
              </ul>
            </div>
          </div>

          {/* Registration Form (Core User Task Assertion) */}
          <div className="md:col-span-2">
            <div className="rounded-2xl border border-forest-800 bg-forest-900/90 p-6 shadow-xl space-y-4">
              <h3 className="font-bold text-cream-50 text-base flex items-center justify-between">
                <span>Register for Pass</span>
                <span className="text-xs font-mono text-lime-400">Free Tier</span>
              </h3>

              {ticketId ? (
                <div
                  id="registration-success-card"
                  className="p-4 rounded-xl bg-forest-950 border border-lime-800 space-y-3"
                >
                  <div className="flex items-center gap-2 text-lime-400 font-semibold text-sm">
                    <CheckCircle className="w-5 h-5" /> Registration Confirmed!
                  </div>
                  <div className="text-xs text-zinc-300">
                    Your student pass has been confirmed. Present this ticket at the registration desk.
                  </div>
                  <div className="font-mono text-xs bg-forest-900 px-3 py-2 rounded text-lime-300 border border-forest-800">
                    Ticket ID: <span id="issued-ticket-id">{ticketId}</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3" id="event-registration-form">
                  {error && (
                    <div
                      id="registration-error-card"
                      className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-start gap-2"
                    >
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="w-full px-3 py-2 rounded-lg bg-forest-950 border border-forest-700 text-sm text-cream-50 focus:outline-none focus:border-lime-500 font-sans"
                      id="input-full-name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">Student Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="priya@pccoe.edu"
                      className="w-full px-3 py-2 rounded-lg bg-forest-950 border border-forest-700 text-sm text-cream-50 focus:outline-none focus:border-lime-500 font-sans"
                      id="input-student-email"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">Hackathon Track</label>
                    <select
                      value={track}
                      onChange={(e) => setTrack(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-forest-950 border border-forest-700 text-sm text-cream-50 focus:outline-none focus:border-lime-500 font-sans"
                      id="select-track"
                    >
                      <option value="sustainability">Sustainable Web Design</option>
                      <option value="carbon-tools">Carbon Measurement Engines</option>
                      <option value="edge-optimization">Edge & Media Optimization</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    id="btn-register-submit"
                    className="w-full py-2.5 px-4 rounded-lg bg-lime-500 hover:bg-lime-400 text-forest-950 font-bold text-sm shadow-md transition disabled:opacity-50"
                  >
                    {submitting ? "Submitting Registration..." : "Complete Registration"}
                  </button>
                  <p className="text-[10px] text-zinc-500 text-center">
                    Synthetic test registration fixture. No real emails or charges.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ControlledEventDemoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07130e] text-cream-50 p-8 flex items-center justify-center font-mono text-sm">
          Loading demo fixture...
        </div>
      }
    >
      <ControlledEventDemoContent />
    </Suspense>
  );
}
