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
    <footer className="w-full bg-surface/90 border-t border-surface-border text-sage mt-24 py-16 px-6 sm:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* Newsletter Signup (Left 6 Cols) */}
        <div className="md:col-span-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-lime animate-pulse" />
            <h4 className="font-display tracking-widest text-lg sm:text-xl text-cream uppercase">
              CARBON TELEMETRY REPORT
            </h4>
          </div>
          <p className="text-xs sm:text-sm text-sage/80 max-w-md leading-relaxed">
            Subscribe to automated CSRD Scope 3 web carbon compliance telemetry, monthly performance regression audits, and green hosting attestation reports.
          </p>

          {isSubscribed ? (
            <div className="p-3.5 rounded-full bg-forest-900 border border-lime/40 text-lime text-xs font-mono flex items-center gap-2 max-w-md animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-lime shrink-0" />
              <span>Subscribed to Carbonerra Telemetry Briefing!</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2 max-w-md pt-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ENTER WORK EMAIL FOR CSRD REPORT..."
                required
                className="flex-1 bg-surface-elevated/80 border border-surface-border rounded-full px-5 py-3 text-xs text-cream placeholder:text-sage/40 focus:outline-none focus:border-lime/60 focus:ring-1 focus:ring-lime"
              />
              <button
                type="submit"
                className="bg-lime text-forest-950 px-5 py-3 rounded-full text-xs font-mono font-extrabold uppercase tracking-wider hover:bg-lime-hover shadow-lime cursor-pointer transition-all active:scale-95"
              >
                JOIN
              </button>
            </form>
          )}
        </div>

        {/* Navigation Links (Right 3 Cols) */}
        <div className="md:col-span-3 space-y-3">
          <h5 className="font-mono text-xs font-bold uppercase tracking-widest text-cream">
            PLATFORM
          </h5>
          <ul className="space-y-2 text-xs font-mono">
            <li><Link href="/" className="hover:text-lime transition-colors">LIVE SCANNER</Link></li>
            <li><Link href="/savings-lab" className="hover:text-lime transition-colors">SAVINGS LAB</Link></li>
            <li><Link href="/evidence" className="hover:text-lime transition-colors">EVIDENCE RECEIPT</Link></li>
            <li><Link href="/dashboard" className="hover:text-lime transition-colors">FLEET TELEMETRY</Link></li>
            <li><Link href="/simulator" className="hover:text-lime transition-colors">CARBON LAB SIMULATOR</Link></li>
            <li><Link href="/forecasts" className="hover:text-lime transition-colors">EMISSIONS FORECASTS</Link></li>
            <li><Link href="/fix-hub" className="hover:text-lime transition-colors">CODE FIX HUB</Link></li>
            <li><Link href="/shield" className="hover:text-lime transition-colors">REGRESSION SHIELD</Link></li>
          </ul>
        </div>

        {/* Compliance Links (Right 3 Cols) */}
        <div className="md:col-span-3 space-y-3">
          <h5 className="font-mono text-xs font-bold uppercase tracking-widest text-cream">
            COMPLIANCE & STANDARDS
          </h5>
          <ul className="space-y-2 text-xs font-mono">
            <li><a href="https://sustainablewebdesign.org" target="_blank" rel="noreferrer" className="hover:text-lime transition-colors">SWDM V4 METHODOLOGY ↗</a></li>
            <li><a href="https://www.thegreenwebfoundation.org" target="_blank" rel="noreferrer" className="hover:text-lime transition-colors">GREEN WEB DATASET ↗</a></li>
            <li><span className="text-sage/60">GHG PROTOCOL SCOPE 2/3</span></li>
            <li><span className="text-sage/60">CSRD DIGITAL DIRECTIVE</span></li>
            <li><span className="text-sage/60">EU TAXONOMY DIGITAL</span></li>
          </ul>
        </div>
      </div>

      {/* Bottom Legal Row */}
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-surface-border/40 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-sage/60 gap-4">
        <span>© 2026 CARBONERRA PLATFORM INC. • PCCOE HACKATHON EDITION</span>
        <div className="flex items-center gap-6">
          <span>TERMS // PRIVACY</span>
          <span>ESTIMATES MARKED PER SWDM V4</span>
        </div>
      </div>
    </footer>
  );
}
