"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Zap, ArrowUpRight } from "lucide-react";
import { LegalModals, LegalModalType } from "@/components/layout/legal-modals";

export function Footer() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [activeModal, setActiveModal] = useState<LegalModalType>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubscribed(true);
    setTimeout(() => {
      setEmail("");
    }, 2000);
  };

  return (
    <>
      <footer className="ct-footer world-footer w-full text-sage" data-world-shot="resolve">
        <div className="world-footer-invitation">
          <div className="world-chapter-label">Rooted in a better web</div>
          <h2>Leave a lighter<br />footprint.</h2>
          <Link href="/savings-lab">Make your next improvement <ArrowUpRight size={21} /></Link>
        </div>
        <div className="world-footer-content max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Newsletter Signup (Left 5 Cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <h4 className="font-display tracking-wide text-lg sm:text-xl text-cream">
                Carbon telemetry report
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-sage/80 max-w-md leading-relaxed">
              Subscribe to monthly web performance and carbon reduction reports. Receive actionable drop-in fixes and verified benchmarks for your engineering team.
            </p>

            {isSubscribed ? (
              <div className="p-3.5 rounded-full bg-forest-900 border border-lime/40 text-lime text-sm flex items-center gap-2 max-w-md animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-lime shrink-0" />
                <span>Subscribed to CarbonTerra Telemetry Briefing!</span>
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
                  className="bg-lime text-forest-950 px-5 py-3 rounded-full text-sm font-extrabold tracking-wider hover:bg-lime-hover cursor-pointer transition-all"
                >
                  JOIN
                </button>
              </form>
            )}
          </div>

          {/* Navigation Column 1: Platform (2-3 Cols) */}
          <div className="md:col-span-2 space-y-3">
            <h5 className="font-mono text-xs font-bold tracking-wide text-cream uppercase">
              PLATFORM
            </h5>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><Link href="/" className="hover:text-lime transition-colors">Scanner</Link></li>
              <li><Link href="/savings-lab" className="hover:text-lime transition-colors">Savings Lab</Link></li>
              <li><Link href="/evidence" className="hover:text-lime transition-colors">Evidence Vault</Link></li>
              <li><Link href="/simulator" className="hover:text-lime transition-colors">Simulator</Link></li>
              <li><Link href="/forecasts" className="hover:text-lime transition-colors">Forecasts</Link></li>
              <li><Link href="/dashboard" className="hover:text-lime transition-colors">Fleet Dashboard</Link></li>
            </ul>
          </div>

          {/* Navigation Column 2: Resources & Methodology (3 Cols) */}
          <div className="md:col-span-3 space-y-3">
            <h5 className="font-mono text-xs font-bold tracking-wide text-cream uppercase">
              RESOURCES &amp; DATA
            </h5>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><a href="https://sustainablewebdesign.org" target="_blank" rel="noreferrer" className="hover:text-lime transition-colors">SWDM v4 Standard ↗</a></li>
              <li><a href="https://www.thegreenwebfoundation.org" target="_blank" rel="noreferrer" className="hover:text-lime transition-colors">Green Web Dataset ↗</a></li>
              <li><button onClick={() => setActiveModal("confidentiality")} className="hover:text-lime transition-colors text-left cursor-pointer">Website Confidentiality</button></li>
              <li><span className="text-sage/70">Dual-Source Measurement</span></li>
            </ul>
          </div>

          {/* Navigation Column 3: Trust & Legal (2 Cols) */}
          <div className="md:col-span-2 space-y-3">
            <h5 className="font-mono text-xs font-bold tracking-wide text-cream uppercase">
              LEGAL &amp; TRUST
            </h5>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><button onClick={() => setActiveModal("terms")} className="hover:text-lime transition-colors text-left cursor-pointer">Terms of Service</button></li>
              <li><button onClick={() => setActiveModal("privacy")} className="hover:text-lime transition-colors text-left cursor-pointer">Privacy Policy</button></li>
              <li><button onClick={() => setActiveModal("contact")} className="hover:text-lime transition-colors text-left cursor-pointer">Contact Team</button></li>
            </ul>
          </div>
        </div>

        <div className="world-footer-wordmark" aria-hidden="true">CarbonTerra</div>
        
        {/* Bottom Legal Row */}
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-surface-border/40 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-sage/80 gap-4">
          <span>© 2026 CarbonTerra PLATFORM INC. • PCCOE HACKATHON EDITION</span>
          <div className="flex items-center gap-6">
            <button onClick={() => setActiveModal("terms")} className="hover:text-lime transition-colors">TERMS OF SERVICE</button>
            <button onClick={() => setActiveModal("privacy")} className="hover:text-lime transition-colors">PRIVACY POLICY</button>
            <button onClick={() => setActiveModal("contact")} className="hover:text-lime transition-colors">CONTACT TEAM</button>
            <span>ESTIMATES MARKED PER SWDM V4</span>
          </div>
        </div>
      </footer>

      {/* Global Legal Modals */}
      <LegalModals activeModal={activeModal} onClose={() => setActiveModal(null)} />
    </>
  );
}
