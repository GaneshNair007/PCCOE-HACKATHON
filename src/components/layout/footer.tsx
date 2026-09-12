"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Zap } from "lucide-react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubscribed(true);
    setTimeout(() => {
      setEmail("");
    }, 2000);
  };

  return (
    <footer className="ct-footer w-full text-sage mt-16 py-12 px-6 sm:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* Newsletter Signup (Left 6 Cols) */}
        <div className="md:col-span-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-lime " />
            <h4 className="font-display tracking-wide text-lg sm:text-xl text-cream ">
              Carbon telemetry report
            </h4>
          </div>
          <p className="text-xs sm:text-sm text-sage/80 max-w-md leading-relaxed">
            Subscribe to automated CSRD Scope 3 web carbon compliance telemetry, monthly performance regression audits, and green hosting attestation reports.
          </p>

          {isSubscribed ? (
            <div className="p-3.5 rounded-full bg-forest-900 border border-lime/40 text-lime text-sm flex items-center gap-2 max-w-md animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-lime shrink-0" />
              <span>Subscribed to Carbonerra Telemetry Briefing!</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2 max-w-md pt-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Work email for telemetry report"
                placeholder="Your work email"
                required
                className="min-w-0 flex-1 bg-surface-elevated/80 border border-surface-border rounded-full px-5 py-3 text-xs text-cream placeholder:text-sage/70 focus:outline-none focus:border-lime/60 focus:ring-1 focus:ring-lime"
              />
              <button
                type="submit"
                className="bg-lime text-forest-950 px-5 py-3 rounded-full text-sm font-extrabold  tracking-wider hover:bg-lime-hover  cursor-pointer transition-all "
              >
                JOIN
              </button>
            </form>
          )}
        </div>

        {/* Navigation Links (Right 3 Cols) */}
        <div className="md:col-span-3 space-y-3">
          <h5 className="font-mono text-xs font-bold  tracking-wide text-cream">
            PLATFORM
          </h5>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-lime transition-colors">Scanner</Link></li>
            <li><Link href="/savings-lab" className="hover:text-lime transition-colors">Savings Lab</Link></li>
            <li><Link href="/evidence" className="hover:text-lime transition-colors">Evidence receipt</Link></li>
            <li><Link href="/dashboard" className="hover:text-lime transition-colors">Fleet telemetry</Link></li>
            <li><Link href="/simulator" className="hover:text-lime transition-colors">Carbon lab simulator</Link></li>
            <li><Link href="/forecasts" className="hover:text-lime transition-colors">Emissions forecasts</Link></li>
            <li><Link href="/fix-hub" className="hover:text-lime transition-colors">Code Fix Hub</Link></li>
            <li><Link href="/shield" className="hover:text-lime transition-colors">Regression Shield</Link></li>
          </ul>
        </div>

        {/* Compliance Links (Right 3 Cols) */}
        <div className="md:col-span-3 space-y-3">
          <h5 className="font-mono text-xs font-bold  tracking-wide text-cream">
            COMPLIANCE & STANDARDS
          </h5>
          <ul className="space-y-2 text-sm">
            <li><a href="https://sustainablewebdesign.org" target="_blank" rel="noreferrer" className="hover:text-lime transition-colors">SWDM V4 METHODOLOGY ↗</a></li>
            <li><a href="https://www.thegreenwebfoundation.org" target="_blank" rel="noreferrer" className="hover:text-lime transition-colors">GREEN WEB DATASET ↗</a></li>
            <li><span className="text-sage/80">GHG PROTOCOL SCOPE 2/3</span></li>
            <li><span className="text-sage/80">CSRD DIGITAL DIRECTIVE</span></li>
            <li><span className="text-sage/80">EU TAXONOMY DIGITAL</span></li>
          </ul>
        </div>
      </div>

      {/* Bottom Legal Row */}
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-surface-border/40 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-sage/80 gap-4">
        <span>© 2026 CarbonTerra PLATFORM INC. • PCCOE HACKATHON EDITION</span>
        <div className="flex items-center gap-6">
          <span>TERMS // PRIVACY</span>
          <span>ESTIMATES MARKED PER SWDM V4</span>
        </div>
      </div>
    </footer>
  );
}
