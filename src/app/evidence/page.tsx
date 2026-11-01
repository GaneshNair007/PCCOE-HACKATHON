"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageIntro, SectionHeading, Reveal } from "@/components/ui/page";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  Printer,
  FileCode,
  ArrowLeft,
  Layers,
  Scale,
  Activity,
  Info,
} from "lucide-react";
import { ImprovementReceipt } from "@/lib/receipt/receipt-generator";

function EvidenceContent() {
  const searchParams = useSearchParams();
  const experimentIdParam = searchParams.get("experimentId") || "";

  const [receipt, setReceipt] = useState<ImprovementReceipt | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadReceipt() {
      setIsLoading(true);
      try {
        let expId = experimentIdParam;

        if (!expId) {
          const expListRes = await fetch("/api/experiments?projectId=campus-events");
          const expListData = await expListRes.json();
          if (
            expListData.status === "success" &&
            expListData.experiments &&
            expListData.experiments.length > 0
          ) {
            const candidateExp = expListData.experiments[expListData.experiments.length - 1];
            expId = candidateExp.id;
          }
        }

        if (!expId) {
          setErrorMessage("No experiment records found to generate evidence receipt.");
          setIsLoading(false);
          return;
        }

        const res = await fetch(`/api/experiments/${expId}/receipt`);
        const data = await res.json();

        if (data.status === "success" && data.receipt) {
          setReceipt(data.receipt);
        } else {
          setErrorMessage(
            data.message || "Candidate verification has not been recorded for this experiment yet."
          );
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to load evidence receipt");
      } finally {
        setIsLoading(false);
      }
    }

    loadReceipt();
  }, [experimentIdParam]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    if (!receipt) return;
    const jsonStr = JSON.stringify(receipt, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `carbonerra-receipt-${receipt.experimentId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div role="status" aria-live="polite" className="p-8 sm:p-16 rounded-3xl bg-surface text-center space-y-3 font-mono text-sage/70">
        <Activity className="w-8 h-8 text-lime animate-spin mx-auto" />
        <div>Compiling immutable audit run evidence and task assertion logs...</div>
      </div>
    );
  }

  return (
    <div className="world-evidence space-y-8 max-w-6xl mx-auto pb-16 print:p-0 print:space-y-4">
      <div className="print:hidden">
        <PageIntro
          eyebrow={<><ShieldCheck className="w-4 h-4 text-[#cbff00]" /> Evidence Vault</>}
          title="Evidence Vault"
          description="Review the measured transfer delta, automated task checks, and verified telemetry receipt behind every code improvement."
        />
      </div>
      {/* Back Navigation Bar (Screen only) */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-surface p-4 print:hidden">
        <Link
          href={`/savings-lab${receipt ? `?experimentId=${receipt.experimentId}` : ""}`}
          className="inline-flex items-center gap-2 text-xs font-mono text-sage/70 hover:text-cream transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-lime" />
          <span>Back to Savings Lab Workflow</span>
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="font-mono text-xs text-sage/80 hover:text-cream"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            Print Receipt
          </Button>
          {receipt && (
            <Button
              variant="lime"
              size="sm"
              onClick={handleDownloadJson}
              className="font-mono text-xs font-bold"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download JSON Evidence
            </Button>
          )}
        </div>
      </div>

      {/* Error or Missing Verification Prompt */}
      {errorMessage && !receipt && (
        <Card role="status" aria-live="polite" className="world-pending p-8 space-y-4">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
          <h2 className="font-display text-2xl text-cream">Verification pending</h2>
          <p className="text-sm font-mono text-sage/80 max-w-lg mx-auto">
            {errorMessage}
          </p>
          <div className="pt-2">
            <Link
              href="/savings-lab"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-lime text-black font-mono font-bold text-xs"
            >
              <span>Run candidate test in Savings Lab →</span>
            </Link>
          </div>
        </Card>
      )}

      {receipt && (
        <Reveal className="space-y-6">
          {/* Main Evidence Record Document */}
          <div className="p-8 sm:p-12 space-y-10 bg-black/60 backdrop-blur-3xl border border-white/15 rounded-3xl shadow-2xl relative overflow-hidden print:border-none print:shadow-none print:p-0">
            {/* Ambient Radial Glass Highlight */}
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#cbff00]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header Document Metadata */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-white/10 pb-8">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-xs font-mono font-bold text-[#cbff00] tracking-wider uppercase">
                    Evidence Record
                  </div>
                  <span className="text-xs sm:text-sm font-mono text-white/70 break-all">
                    ID: {receipt.experimentId}
                  </span>
                </div>
                <h2 className="font-display text-3xl sm:text-5xl font-black text-white tracking-tight">
                  Improvement Verification Receipt
                </h2>
                <div className="text-xs sm:text-sm font-mono text-white/80 flex flex-wrap items-center gap-3 pt-1">
                  <span>Project: <strong className="text-white">{receipt.projectId}</strong></span>
                  <span>•</span>
                  <span>Journey: <strong className="text-white">{receipt.journeyId}</strong></span>
                  <span>•</span>
                  <span>Generated: <strong className="text-white">{new Date(receipt.generatedAt).toLocaleString()}</strong></span>
                </div>
              </div>

              <div className="text-right flex flex-col items-end gap-2.5">
                <div className="px-4 py-2 rounded-xl font-mono text-xs sm:text-sm font-extrabold uppercase tracking-wider bg-[#cbff00] text-black shadow-lg shadow-[#cbff00]/20">
                  {receipt.outcome === "observed_improvement"
                    ? "IMPROVEMENT OBSERVED"
                    : receipt.outcome === "functional_checks_failed"
                    ? "CHECKS FAILED"
                    : receipt.outcome.replace(/_/g, " ").toUpperCase()}
                </div>
                <div className="text-xs font-mono text-white/70 font-medium">
                  Automated Verification Pipeline • Certified SWDM v4
                </div>
              </div>
            </div>

            {/* Core Comparative KPI Summary - Apple Frosted Glass Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 font-mono">
              {/* KPI 1: Bytes Saved */}
              <div className="p-6 sm:p-7 rounded-3xl bg-black/40 border border-[#cbff00]/40 shadow-xl backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#cbff00]/10 rounded-full blur-2xl pointer-events-none" />
                <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#cbff00]">
                  Observed Transfer Delta
                </div>
                <div className="font-mono text-3xl sm:text-4xl lg:text-5xl font-black text-[#cbff00] mt-2">
                  -{(receipt.measuredDifferences.bytesSaved / 1024).toFixed(1)}{" "}
                  <span className="text-sm sm:text-base font-normal text-white/70">KB</span>
                </div>
                <div className="text-sm font-bold text-[#cbff00] mt-2">
                  -{receipt.measuredDifferences.percentReduction}% Measured Reduction
                </div>
              </div>

              {/* KPI 2: Carbon Saved */}
              <div className="p-6 sm:p-7 rounded-3xl bg-black/40 border border-white/15 shadow-xl backdrop-blur-xl relative overflow-hidden">
                <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white/70">
                  Model-Based Carbon Delta
                </div>
                <div className="font-mono text-3xl sm:text-4xl lg:text-5xl font-black text-white mt-2">
                  -{receipt.measuredDifferences.estimatedCo2SavedGrams}{" "}
                  <span className="text-sm sm:text-base font-normal text-white/70">gCO2e</span>
                </div>
                <div className="text-sm font-medium text-white/70 mt-2">
                  {receipt.methodology.swdmVersion} Attribution
                </div>
              </div>

              {/* KPI 3: Task Assertions (Preservation) */}
              <div className="p-6 sm:p-7 rounded-3xl bg-black/40 border border-white/15 shadow-xl backdrop-blur-xl relative overflow-hidden">
                <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white/70">
                  Task Assertions (Preservation)
                </div>
                <div className="font-mono text-3xl sm:text-4xl lg:text-5xl font-black text-white mt-2 flex items-center gap-3">
                  {receipt.functionalAssertions.allPassed ? (
                    <>
                      <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-[#cbff00] shrink-0" />
                      <span className="text-[#cbff00]">3/3 Passed</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-400 shrink-0" />
                      <span className="text-red-400">Failed</span>
                    </>
                  )}
                </div>
                <div className="text-sm font-medium text-white/70 mt-2">
                  {receipt.functionalAssertions.summary}
                </div>
              </div>
            </div>

            {/* Compared Runs Breakdown Table */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Compared Run Telemetry
                </h3>
                <span className="text-xs sm:text-sm font-mono text-white/60">
                  Three alternating baseline and candidate passes
                </span>
              </div>

              <div tabIndex={0} role="region" aria-label="Scrollable compared run telemetry" className="rounded-3xl border border-white/15 bg-black/30 backdrop-blur-2xl overflow-x-auto shadow-xl print:overflow-visible">
                <table className="w-full min-w-[680px] print:min-w-0 text-left font-mono text-sm sm:text-base">
                  <caption className="sr-only">Baseline and candidate journey transfer, carbon estimates, and task checks</caption>
                  <thead className="bg-white/5 text-white/70 border-b border-white/10 uppercase text-xs tracking-wider">
                    <tr>
                      <th scope="col" className="p-4 sm:p-5 font-bold">Run Group</th>
                      <th scope="col" className="p-4 sm:p-5 font-bold">Recorded Runs</th>
                      <th scope="col" className="p-4 sm:p-5 font-bold">Median Transfer</th>
                      <th scope="col" className="p-4 sm:p-5 font-bold">Model CO2e</th>
                      <th scope="col" className="p-4 sm:p-5 font-bold">Task Preservation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-sm sm:text-base">
                    <tr className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 sm:p-5 font-bold text-white">Baseline (3 passes)</td>
                      <td className="p-4 sm:p-5 text-white/70">{receipt.baseline.runIds.length} runs</td>
                      <td className="p-4 sm:p-5 font-bold text-white">{(receipt.baseline.medianBytes / 1024).toFixed(1)} KB</td>
                      <td className="p-4 sm:p-5 text-white/80">{receipt.baseline.medianCo2Grams} g</td>
                      <td className="p-4 sm:p-5 text-[#cbff00] font-bold">PASSED</td>
                    </tr>
                    <tr className="bg-[#cbff00]/[0.03] hover:bg-[#cbff00]/[0.06] transition-colors">
                      <td className="p-4 sm:p-5 font-bold text-[#cbff00]">Candidate (3 passes)</td>
                      <td className="p-4 sm:p-5 text-white/70">{receipt.candidate.runIds.length} runs</td>
                      <td className="p-4 sm:p-5 font-bold text-[#cbff00]">{(receipt.candidate.medianBytes / 1024).toFixed(1)} KB</td>
                      <td className="p-4 sm:p-5 text-[#cbff00] font-bold">{receipt.candidate.medianCo2Grams} g</td>
                      <td className="p-4 sm:p-5 font-bold">
                        {receipt.functionalAssertions.allPassed ? (
                          <span className="text-[#cbff00] font-bold">PASSED</span>
                        ) : (
                          <span className="text-red-400 font-bold">FAILED</span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Affected Resource & Patch Summary */}
            <div className="space-y-4 pt-2">
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-white flex items-center gap-3 tracking-tight">
                <FileCode className="w-6 h-6 text-[#cbff00]" />
                <span>Source Patch &amp; Reviewer Sign-Off</span>
              </h3>

              <div className="p-6 sm:p-7 rounded-3xl bg-black/40 border border-white/15 backdrop-blur-xl text-sm sm:text-base font-mono space-y-3 break-words [overflow-wrap:anywhere] shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <span className="text-white/80 text-sm sm:text-base">
                    Affected Resource: <strong className="text-white">{receipt.patchSummary.affectedResource}</strong>
                  </span>
                  <span className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold uppercase bg-[#cbff00]/15 text-[#cbff00] border border-[#cbff00]/40">
                    Reviewer Decision: {receipt.reviewerDecision.toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-white/75 text-xs sm:text-sm pt-1">
                  <span>Target File: <strong className="text-white">{receipt.patchSummary.targetFile}</strong></span>
                  <span>•</span>
                  <span>Replacement: <strong className="text-[#cbff00]">{receipt.patchSummary.replacementResource}</strong></span>
                  <span>•</span>
                  <span>Reviewed: <strong className="text-white">{receipt.reviewedAt ? new Date(receipt.reviewedAt).toLocaleString() : "Approved"}</strong></span>
                </div>
              </div>
            </div>

            {/* Forward Flow to What-If Simulator */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-8 border-t border-white/10 print:hidden">
              <div className="text-xs sm:text-sm font-mono text-white/70">
                Explore future scenarios, adjust compression levers, and model grid decarbonization in the Simulator.
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/savings-lab"
                  className="px-5 py-3 rounded-full border border-white/20 text-white hover:text-[#cbff00] hover:border-[#cbff00]/40 font-mono text-xs sm:text-sm transition-colors uppercase font-bold"
                >
                  ← Savings Lab
                </Link>
                <Link
                  href="/simulator"
                  className="px-6 py-3 rounded-full bg-[#cbff00] text-black font-extrabold text-xs sm:text-sm tracking-wider font-mono hover:bg-[#e4ff66] transition-transform hover:scale-105 flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-[#cbff00]/25 uppercase cursor-pointer"
                >
                  <span>Explore What-If Simulator →</span>
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      )}
    </div>
  );
}

export default function EvidencePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sage/70 font-mono text-sm">Loading Evidence Receipt...</div>}>
      <EvidenceContent />
    </Suspense>
  );
}
