"use client";

import React, { useState } from "react";
import { X, ShieldCheck, FileText, Lock, Mail } from "lucide-react";

export type LegalModalType = "confidentiality" | "terms" | "privacy" | "contact" | null;

interface LegalModalsProps {
  activeModal: LegalModalType;
  onClose: () => void;
}

export function LegalModals({ activeModal, onClose }: LegalModalsProps) {
  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl bg-surface border border-surface-border rounded-2xl p-6 sm:p-8 shadow-2xl text-cream max-h-[85vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-surface-elevated hover:bg-forest-800 text-sage hover:text-cream transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {activeModal === "confidentiality" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-lime">
              <Lock className="w-6 h-6" />
              <h3 className="text-xl font-bold font-sans">Website Confidentiality & Security</h3>
            </div>
            <p className="text-sm text-sage leading-relaxed">
              CarbonTerra operates under strict data privacy invariants for all scanned web domains:
            </p>
            <ul className="space-y-2 text-sm text-sage/90 list-disc pl-5">
              <li><strong>Zero Source Code Retention:</strong> Our scanner inspects only publicly transmitted HTTP headers and markup. Private repositories and uncompiled source code are never accessed or stored.</li>
              <li><strong>SSRF Defense & Network Guard:</strong> Internal RFC 1918 addresses, loopbacks (127.0.0.1), and cloud metadata endpoints (169.254.169.254) are strictly blocked from probe execution.</li>
              <li><strong>Enterprise Privacy:</strong> Email reports requested via SMTP are dispatched securely and recipient emails are never shared or resold to third-party ad networks.</li>
            </ul>
          </div>
        )}

        {activeModal === "terms" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-lime">
              <FileText className="w-6 h-6" />
              <h3 className="text-xl font-bold font-sans">Terms of Service</h3>
            </div>
            <p className="text-sm text-sage leading-relaxed">
              By utilizing CarbonTerra Telemetry and Savings Lab, you agree to the following terms:
            </p>
            <ul className="space-y-2 text-sm text-sage/90 list-disc pl-5">
              <li><strong>Attributional Modeling Disclosure:</strong> Digital carbon calculations are derived using the Sustainable Web Design Model v4 (SWDM v4) and Ember 2023 grid intensity figures. These represent engineering attribution estimates, not proof of direct physical grid avoidance.</li>
              <li><strong>Permitted Use:</strong> The scanner is provided for web performance optimization, educational evaluation, and digital sustainability planning. Automated denial-of-service probing is strictly prohibited.</li>
              <li><strong>Zero Liability:</strong> Suggested code patches (e.g. responsive WebP tags) are drop-in recommendations. Engineering teams are advised to review and test within staging before production merge.</li>
            </ul>
          </div>
        )}

        {activeModal === "privacy" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-lime">
              <ShieldCheck className="w-6 h-6" />
              <h3 className="text-xl font-bold font-sans">Privacy Policy</h3>
            </div>
            <p className="text-sm text-sage leading-relaxed">
              Your digital footprint matters. CarbonTerra collects minimal telemetry required to deliver accurate sustainability auditing:
            </p>
            <ul className="space-y-2 text-sm text-sage/90 list-disc pl-5">
              <li><strong>No Third-Party Trackers:</strong> This platform uses zero advertising pixels, third-party behavioral cookies, or commercial trackers.</li>
              <li><strong>Local Storage:</strong> Optimization state and experiment trials remain stored within your local browser session unless you explicitly choose to dispatch an email report.</li>
              <li><strong>Right to Deletion:</strong> Any dispatched reports or temporary scan traces can be purged upon request.</li>
            </ul>
          </div>
        )}

        {activeModal === "contact" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-lime">
              <Mail className="w-6 h-6" />
              <h3 className="text-xl font-bold font-sans">Contact Engineering Team</h3>
            </div>
            <p className="text-sm text-sage leading-relaxed">
              Built with precision for the PCCOE Hackathon by the CarbonTerra Development Team.
            </p>
            <div className="bg-surface-elevated p-4 rounded-xl border border-surface-border space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-sage">Engineering Lead:</span>
                <span className="text-cream font-sans font-medium">team@carbonterra.dev</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sage">Hackathon Division:</span>
                <span className="text-cream">PCCOE Pune Edition</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sage">GitHub Reference:</span>
                <span className="text-lime font-sans font-medium">github.com/raghunandana1/carbonterra</span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-surface-border flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-lime text-forest-950 font-bold text-xs tracking-wider hover:bg-lime-hover transition-colors"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
}
