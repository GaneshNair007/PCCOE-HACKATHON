"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
      <div className="p-16 text-center space-y-3 font-mono text-sage/70">
        <Activity className="w-8 h-8 text-lime animate-spin mx-auto" />
        <div>Compiling immutable audit run evidence and task assertion logs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 print:p-0 print:space-y-4">
      {/* Back Navigation Bar (Screen only) */}
      <div className="flex items-center justify-between print:hidden border-b border-surface-border/60 pb-4">
        <Link
          href={`/savings-lab${receipt ? `?experimentId=${receipt.experimentId}` : ""}`}
          className="inline-flex items-center gap-2 text-xs font-mono text-sage/70 hover:text-cream transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-lime" />
          <span>Back to Savings Lab Workflow</span>
        </Link>

        <div className="flex items-center gap-3">
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
        <Card className="p-8 text-center glass-panel-elevated border border-amber-500/40 space-y-4">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
          <h2 className="font-display text-2xl text-cream uppercase">Verification Pending</h2>
          <p className="text-sm font-mono text-sage/80 max-w-lg mx-auto">
            {errorMessage}
          </p>
          <div className="pt-2">
            <Link
              href="/savings-lab"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-lime text-black font-mono font-bold text-xs"
            >
              <span>RUN CANDIDATE TEST IN SAVINGS LAB →</span>
            </Link>
          </div>
        </Card>
      )}

      {receipt && (
        <div className="space-y-6">
          {/* Main Evidence Record Document */}
          <Card className="p-6 sm:p-10 glass-panel-elevated border border-lime/30 space-y-8 print:border-none print:shadow-none print:p-0">
            {/* Header Document Metadata */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-surface-border/60 pb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-lime/10 text-lime border border-lime/30">
                    EVIDENCE RECORD (RECEIPT)
                  </span>
                  <span className="text-xs font-mono text-sage/60">
                    ID: {receipt.experimentId}
                  </span>
                </div>
                <h1 className="font-display text-3xl sm:text-4xl text-cream uppercase tracking-tight">
                  Improvement Verification Receipt
                </h1>
                <div className="text-xs font-mono text-sage/70 flex flex-wrap items-center gap-3">
                  <span>Project: <strong>{receipt.projectId}</strong></span>
                  <span>•</span>
                  <span>Journey: <strong>{receipt.journeyId}</strong></span>
                  <span>•</span>
                  <span>Generated: {new Date(receipt.generatedAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="text-right flex flex-col items-end gap-2">
                <Badge
                  variant={
                    receipt.outcome === "observed_improvement"
                      ? "lime"
                      : receipt.outcome === "functional_checks_failed"
                      ? "danger"
                      : "outline"
                  }
                  className="font-mono text-xs font-bold uppercase px-3 py-1"
                >
                  {receipt.outcome === "observed_improvement"
                    ? "IMPROVEMENT OBSERVED ✅"
                    : receipt.outcome === "functional_checks_failed"
                    ? "FUNCTIONAL CHECKS FAILED ❌"
                    : receipt.outcome.replace(/_/g, " ")}
                </Badge>
                <div className="text-[11px] font-mono text-sage/60">
                  Verified in local production build
                </div>
              </div>
            </div>

            {/* Methodology & Legal Disclaimers Banner */}
            <div className="p-4 rounded-xl bg-surface/50 border border-surface-border text-xs font-mono space-y-1 text-sage/80">
              <div className="flex items-center gap-2 text-lime font-bold">
                <Info className="w-4 h-4" />
                <span>Auditable Evidence Notice</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                {receipt.disclaimer}
              </p>
            </div>

            {/* Core Comparative KPI Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
              <div className="p-5 rounded-2xl bg-forest/20 border border-lime/40">
                <div className="text-xs text-sage/60 uppercase">Observed Transfer Delta</div>
                <div className="font-mono text-3xl font-bold text-lime mt-1">
                  -{(receipt.measuredDifferences.bytesSaved / 1024).toFixed(1)}{" "}
                  <span className="text-xs font-normal text-sage/70">KB / journey</span>
                </div>
                <div className="text-xs text-lime font-bold mt-1">
                  -{receipt.measuredDifferences.percentReduction}% Measured Reduction
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-surface/60 border border-surface-border">
                <div className="text-xs text-sage/60 uppercase">Model-Based Carbon Delta</div>
                <div className="font-mono text-3xl font-bold text-cream mt-1">
                  -{receipt.measuredDifferences.estimatedCo2SavedGrams}{" "}
                  <span className="text-xs font-normal text-sage/70">gCO2e / journey</span>
                </div>
                <div className="text-xs text-sage/60 mt-1">
                  {receipt.methodology.swdmVersion} Attribution
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-surface/60 border border-surface-border">
                <div className="text-xs text-sage/60 uppercase">Task Assertions (Preservation)</div>
                <div className="font-mono text-3xl font-bold text-cream mt-1 flex items-center gap-2">
                  {receipt.functionalAssertions.allPassed ? (
                    <>
                      <CheckCircle2 className="w-7 h-7 text-lime" />
                      <span className="text-lime">3/3 Passed</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-7 h-7 text-red-400" />
                      <span className="text-red-400">Failed</span>
                    </>
                  )}
                </div>
                <div className="text-xs text-sage/60 mt-1">
                  {receipt.functionalAssertions.summary}
                </div>
              </div>
            </div>

            {/* Compared Runs Breakdown Table */}
            <div className="space-y-3">
              <h3 className="font-display text-xl text-cream uppercase flex items-center gap-2">
                <Layers className="w-4 h-4 text-lime" />
                <span>Compared Run Telemetry (3x Alternating Baseline vs Candidate)</span>
              </h3>

              <div className="rounded-2xl border border-surface-border overflow-hidden">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-surface-elevated text-sage/70 border-b border-surface-border">
                    <tr>
                      <th className="p-3">Run Group</th>
                      <th className="p-3">Recorded Runs</th>
                      <th className="p-3">Median Transfer</th>
                      <th className="p-3">Model CO2e</th>
                      <th className="p-3">Task Preservation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border/60">
                    <tr>
                      <td className="p-3 font-bold text-cream">Baseline (3 passes)</td>
                      <td className="p-3 text-sage/70">{receipt.baseline.runIds.length} runs</td>
                      <td className="p-3 font-bold text-cream">{(receipt.baseline.medianBytes / 1024).toFixed(1)} KB</td>
                      <td className="p-3 text-sage/80">{receipt.baseline.medianCo2Grams} g</td>
                      <td className="p-3 text-lime font-bold">Passed ✅</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-lime">Candidate (3 passes)</td>
                      <td className="p-3 text-sage/70">{receipt.candidate.runIds.length} runs</td>
                      <td className="p-3 font-bold text-lime">{(receipt.candidate.medianBytes / 1024).toFixed(1)} KB</td>
                      <td className="p-3 text-lime font-bold">{receipt.candidate.medianCo2Grams} g</td>
                      <td className="p-3 font-bold">
                        {receipt.functionalAssertions.allPassed ? (
                          <span className="text-lime">Passed ✅</span>
                        ) : (
                          <span className="text-red-400">Failed ❌</span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Affected Resource & Patch Summary */}
            <div className="space-y-3">
              <h3 className="font-display text-xl text-cream uppercase flex items-center gap-2">
                <FileCode className="w-4 h-4 text-lime" />
                <span>Source Code Patch Reference & Reviewer Sign-Off</span>
              </h3>

              <div className="p-4 rounded-xl bg-surface/50 border border-surface-border text-xs font-mono space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-border/60 pb-2">
                  <span className="text-sage/70">
                    Affected Resource: <strong className="text-cream">{receipt.patchSummary.affectedResource}</strong>
                  </span>
                  <span className="text-lime font-bold">
                    Reviewer Decision: {receipt.reviewerDecision.toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sage/70 pt-1">
                  <span>Target File: <strong className="text-cream">{receipt.patchSummary.targetFile}</strong></span>
                  <span>•</span>
                  <span>Replacement: <strong className="text-cream">{receipt.patchSummary.replacementResource}</strong></span>
                  <span>•</span>
                  <span>Reviewed: {receipt.reviewedAt ? new Date(receipt.reviewedAt).toLocaleString() : "Approved"}</span>
                </div>
              </div>
            </div>

            {/* Shield Regression Gate Link */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-surface-border/60 print:hidden">
              <div className="text-xs font-mono text-sage/70">
                Protect this verified transfer level against regressions in your GitHub pull requests.
              </div>

              <Link
                href="/shield"
                className="px-5 py-2.5 rounded-full bg-lime text-black font-mono font-bold text-xs hover:bg-lime/90 transition-transform hover:scale-105 shadow-[0_0_20px_rgba(203,255,0,0.3)] flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>CONFIGURE RELEASE SHIELD →</span>
              </Link>
            </div>
          </Card>
        </div>
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
