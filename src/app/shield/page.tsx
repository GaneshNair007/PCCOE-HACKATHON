"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileCode,
  Copy,
  Check,
  Terminal,
  Download,
  AlertTriangle,
  Info,
  Sliders,
  GitBranch,
  Play,
  ArrowRight,
  Activity,
} from "lucide-react";
import { BudgetCheckResult } from "@/lib/storage/types";

export default function ShieldPage() {
  const [byteCeilingKb, setByteCeilingKb] = useState<number>(350); // 350 KB
  const [imageLimitKb, setImageLimitKb] = useState<number>(200); // 200 KB
  const [requestLimit, setRequestLimit] = useState<number>(12);
  const [strictMode, setStrictMode] = useState<boolean>(true);
  const [copiedWorkflow, setCopiedWorkflow] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Live Evaluator State
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evalVariant, setEvalVariant] = useState<"baseline" | "optimized" | "broken" | null>(null);
  const [evalResult, setEvalResult] = useState<BudgetCheckResult | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);

  // Dynamic GitHub Actions Workflow Template using shared budget evaluator
  const workflowYaml = `# .github/workflows/carbon-budget.yml
# Carbonerra Release Shield — Regression Budget Gate
# Audits the production-built journey and enforces actual total transfer, category, and request limits.
# Note: A failing job blocks merging only when configured as a required status check in GitHub branch protection rules.

name: "Carbonerra Sustainability Shield"

on:
  pull_request:
    branches: [main, master]
  push:
    branches: [main]

jobs:
  carbon-budget-gate:
    name: "Enforce Journey Transfer Budget"
    runs-on: ubuntu-latest
    steps:
      - name: "Checkout repository"
        uses: actions/checkout@v4

      - name: "Set up Node.js"
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"

      - name: "Install dependencies and build app"
        run: |
          npm ci
          npm run build

      - name: "Start production server in background"
        run: |
          npm run start &
          npx wait-on http://localhost:3000 --timeout 60000

      - name: "Execute Shared Carbonerra Budget Evaluator"
        env:
          TARGET_URL: "http://localhost:3000"
          BUDGET_CEILING_BYTES: "${byteCeilingKb * 1024}"
          IMAGE_CEILING_BYTES: "${imageLimitKb * 1024}"
          MAX_REQUESTS: "${requestLimit}"
          STRICT_MODE: "${strictMode}"
        run: |
          node scripts/run-budget-check.mjs \${TARGET_URL}
`;

  const handleCopyWorkflow = () => {
    navigator.clipboard.writeText(workflowYaml);
    setCopiedWorkflow(true);
    setNotification("GitHub Actions workflow template copied to clipboard!");
    setTimeout(() => {
      setCopiedWorkflow(false);
      setNotification(null);
    }, 2500);
  };

  const handleDownloadWorkflow = () => {
    const blob = new Blob([workflowYaml], { type: "text/yaml;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "carbon-budget.yml");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Run real evaluation via API
  const handleRunEvaluation = async (variant: "baseline" | "optimized" | "broken") => {
    setIsEvaluating(true);
    setEvalVariant(variant);
    setEvalError(null);
    setEvalResult(null);

    try {
      const res = await fetch("/api/shield/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: "campus-events",
          journeyId: "event-registration",
          variant: variant === "optimized" ? "optimized" : variant,
          budget: {
            byteCeiling: byteCeilingKb * 1024,
            categoryLimits: {
              imageBytes: imageLimitKb * 1024,
            },
            requestCountLimit: requestLimit,
            mode: strictMode ? "strict" : "warn",
          },
        }),
      });

      const data = await res.json();
      if (data.status === "success" && data.result) {
        setEvalResult(data.result);
      } else {
        setEvalError(data.message || "Budget check failed");
      }
    } catch (err: any) {
      setEvalError(err.message || "Failed to communicate with Shield evaluator");
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-surface-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-lime uppercase font-bold tracking-wider mb-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>STAGE 7: PREVENT REGRESSION • SHARED BUDGET EVALUATOR</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl text-cream uppercase tracking-tight">
            Release Shield
          </h1>
          <p className="text-xs sm:text-sm text-sage/80 mt-1 max-w-2xl">
            Protect verified savings in your release pipeline. Enforces total transfer bytes, image category ceilings, and essential task assertions in local CLI and GitHub Actions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline" className="font-mono text-xs text-sage/70">
            Workflow Template Ready
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadWorkflow}
            className="text-xs font-mono flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-lime" />
            <span>DOWNLOAD .YML</span>
          </Button>
          <Button
            variant="lime"
            size="sm"
            onClick={handleCopyWorkflow}
            className="text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(203,255,0,0.3)]"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copiedWorkflow ? "COPIED" : "COPY WORKFLOW"}</span>
          </Button>
        </div>
      </div>

      {notification && (
        <div className="p-3 rounded-xl bg-lime/10 border border-lime/30 text-lime text-xs font-mono">
          {notification}
        </div>
      )}

      {/* Real Interactive Gate Testing Workbench */}
      <Card className="p-6 sm:p-8 glass-panel-elevated border border-lime/30 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border/60 pb-4">
          <div>
            <div className="text-xs font-mono text-lime font-bold uppercase">
              Interactive Gating Workbench
            </div>
            <h2 className="font-display text-2xl text-cream uppercase mt-0.5">
              Simulate Real CI Gate Execution
            </h2>
            <div className="text-xs font-mono text-sage/70 mt-1">
              Target: Campus Event Registration Journey • Active Ceiling: {byteCeilingKb} KB Transfer • Mode: {strictMode ? "Strict (Exit Nonzero)" : "Warn"}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs text-lime border-lime/30">
              CLI / CI Invariant
            </Badge>
          </div>
        </div>

        {/* 3 Real Execution Triggers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          {/* Trigger 1: Baseline (Demonstrates Strict Budget Failure) */}
          <div className="p-4 rounded-xl bg-surface/50 border border-red-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-red-400 font-bold uppercase text-[10px]">Test 1: Regression</span>
              <Badge variant="outline" className="text-[10px] text-red-400 border-red-500/30">
                Breach Demo
              </Badge>
            </div>
            <div className="text-cream font-bold text-sm">Oversized Hero Baseline</div>
            <p className="text-[11px] text-sage/70 leading-relaxed">
              Tests candidate with re-introduced 2.42 MB raw JPEG. Observed 2,450 KB transfer breaches the 350 KB ceiling.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRunEvaluation("baseline")}
              isLoading={isEvaluating && evalVariant === "baseline"}
              disabled={isEvaluating}
              className="w-full font-bold text-red-300 border-red-500/40 hover:bg-red-950/40"
            >
              <Play className="w-3.5 h-3.5 mr-1 text-red-400" />
              RUN BASELINE (BREACH)
            </Button>
          </div>

          {/* Trigger 2: Optimized Candidate (Demonstrates CI Pass) */}
          <div className="p-4 rounded-xl bg-surface/50 border border-lime/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-lime font-bold uppercase text-[10px]">Test 2: Candidate</span>
              <Badge variant="lime" className="text-[10px] font-bold">
                Pass Demo
              </Badge>
            </div>
            <div className="text-cream font-bold text-sm">Optimized Modern WebP</div>
            <p className="text-[11px] text-sage/70 leading-relaxed">
              Tests candidate with 176 KB WebP asset. Total transfer is ~204 KB, well within the 350 KB ceiling.
            </p>
            <Button
              variant="lime"
              size="sm"
              onClick={() => handleRunEvaluation("optimized")}
              isLoading={isEvaluating && evalVariant === "optimized"}
              disabled={isEvaluating}
              className="w-full font-bold shadow-[0_0_15px_rgba(203,255,0,0.3)]"
            >
              <Check className="w-3.5 h-3.5 mr-1" />
              RUN OPTIMIZED (PASS)
            </Button>
          </div>

          {/* Trigger 3: Broken Candidate (Demonstrates Functional Rejection) */}
          <div className="p-4 rounded-xl bg-surface/50 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-amber-300 font-bold uppercase text-[10px]">Test 3: Broken Flow</span>
              <Badge variant="outline" className="text-[10px] text-amber-300 border-amber-500/30">
                Assertion Demo
              </Badge>
            </div>
            <div className="text-cream font-bold text-sm">Broken Registration Flow</div>
            <p className="text-[11px] text-sage/70 leading-relaxed">
              Tests candidate where transfer is small (~25 KB) but registration is broken (HTTP 500). Strictly fails gate.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRunEvaluation("broken")}
              isLoading={isEvaluating && evalVariant === "broken"}
              disabled={isEvaluating}
              className="w-full font-bold text-amber-300 border-amber-500/40 hover:bg-amber-950/40"
            >
              <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-400" />
              RUN BROKEN (TASK FAIL)
            </Button>
          </div>
        </div>

        {/* Live Evaluator Output Terminal */}
        {evalResult && (
          <div className="rounded-2xl bg-black/90 border border-surface-border p-5 font-mono text-xs space-y-3 shadow-inner">
            <div className="flex items-center justify-between border-b border-surface-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-lime" />
                <span className="text-cream font-bold">CLI Budget Gate Terminal Output</span>
              </div>
              <Badge
                variant={evalResult.passed ? "lime" : !evalResult.isWarning ? "danger" : "outline"}
                className="font-bold text-[10px]"
              >
                STATUS: {evalResult.passed ? "PASSED (EXIT 0)" : evalResult.isWarning ? "WARNING (EXIT 0)" : "FAILED (EXIT 1)"}
              </Badge>
            </div>

            <div className="space-y-1.5 text-sage/80 leading-relaxed">
              <div className="text-cream font-bold">⚡ CARBONERRA REGRESSION SHIELD CHECK ({strictMode ? "STRICT MODE" : "WARN MODE"})</div>
              <div>Status: <strong className={evalResult.passed ? "text-lime" : evalResult.isWarning ? "text-amber-300" : "text-red-400"}>{evalResult.passed ? "PASSED" : evalResult.isWarning ? "WARNING" : "BREACH DETECTED"}</strong></div>
              <div>Measured Journey Transfer: <strong className="text-cream">{(evalResult.actualBytes / 1024).toFixed(1)} KB</strong> (Ceiling: {(evalResult.thresholdBytes / 1024).toFixed(0)} KB)</div>
              <div>Network Requests: <strong className="text-cream">{evalResult.actualRequests}</strong> (Limit: {evalResult.thresholdRequests})</div>
              <div>Estimated Carbon: <strong className="text-cream">{evalResult.actualCarbonGrams} gCO2e</strong> (SWDM v4)</div>
              <div>Breaches: {evalResult.breaches.length === 0 ? <span className="text-lime">None (Within tolerance)</span> : <span className="text-red-400 font-bold">{evalResult.breaches.join("; ")}</span>}</div>
              <div className="text-[11px] text-sage/60 pt-1">{evalResult.details}</div>
            </div>

            <div className="pt-2 text-[11px] text-sage/60 border-t border-surface-border/40">
              {evalResult.passed ? (
                <span className="text-lime">✅ PASSED: Target journey satisfies digital sustainability transfer and task assertion budgets.</span>
              ) : evalResult.isWarning ? (
                <span className="text-amber-300">⚠️ WARNING: Target journey breached configured limits in non-blocking warning mode.</span>
              ) : (
                <span className="text-red-400">❌ STRICT BREACH: Candidate journey violated configured transfer budget or failed essential task assertions. Pull requests are blocked.</span>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Grid: Configurator (Left) + Workflow Code (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Budget Threshold Controls */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 glass-panel-elevated border border-surface-border space-y-6 font-mono text-xs">
            <h3 className="font-display text-xl text-cream uppercase flex items-center gap-2">
              <Sliders className="w-5 h-5 text-lime" /> Configure Budget Limits
            </h3>

            {/* Transfer Ceiling Slider */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-cream font-bold">Total Transfer Budget Ceiling</span>
                <span className="text-lime font-bold">{byteCeilingKb} KB</span>
              </div>
              <input
                type="range"
                min="150"
                max="2500"
                step="50"
                value={byteCeilingKb}
                onChange={(e) => setByteCeilingKb(Number(e.target.value))}
                className="w-full accent-lime bg-surface-elevated h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-sage/60">
                <span>Optimized (200 KB)</span>
                <span>Balanced (350 KB)</span>
                <span>Uncompressed (2.5 MB)</span>
              </div>
            </div>

            {/* Image Limit Slider */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-cream font-bold">Image Category Transfer Limit</span>
                <span className="text-lime font-bold">{imageLimitKb} KB</span>
              </div>
              <input
                type="range"
                min="100"
                max="2400"
                step="50"
                value={imageLimitKb}
                onChange={(e) => setImageLimitKb(Number(e.target.value))}
                className="w-full accent-lime bg-surface-elevated h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Request Limit Slider */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-cream font-bold">Max HTTP Requests Limit</span>
                <span className="text-lime font-bold">{requestLimit} requests</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="1"
                value={requestLimit}
                onChange={(e) => setRequestLimit(Number(e.target.value))}
                className="w-full accent-lime bg-surface-elevated h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Strict CI Gating Toggle */}
            <div className="pt-4 border-t border-surface-border flex items-center justify-between">
              <div>
                <div className="text-cream font-bold">Strict CI Gating</div>
                <div className="text-[11px] text-sage/60">Exit nonzero on budget breach to block PR merge</div>
              </div>
              <input
                type="checkbox"
                checked={strictMode}
                onChange={(e) => setStrictMode(e.target.checked)}
                className="w-4 h-4 accent-lime cursor-pointer"
              />
            </div>
          </Card>

          {/* Setup Instructions Card */}
          <Card className="p-6 glass-panel border border-surface-border space-y-4 font-mono text-xs">
            <h4 className="font-bold text-cream uppercase flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-lime" /> How to Install in 3 Steps
            </h4>
            <ol className="space-y-3 list-decimal list-inside text-sage/80 leading-relaxed text-[11px]">
              <li>
                <span className="text-cream font-bold">Save the workflow template</span> at:
                <pre className="mt-1 p-2 rounded bg-black/60 text-lime font-mono text-[10px]">
                  .github/workflows/carbon-budget.yml
                </pre>
              </li>
              <li>
                <span className="text-cream font-bold">Commit &amp; push</span> the workflow file to your GitHub repository:
                <pre className="mt-1 p-2 rounded bg-black/60 text-lime font-mono text-[10px]">
                  git add .github &amp;&amp; git commit -m &quot;ci: add carbonerra release shield&quot;
                </pre>
              </li>
              <li>
                <span className="text-cream font-bold">Configure required status checks</span> in GitHub Branch Protection rules under &quot;Require status checks to pass before merging&quot;.
              </li>
            </ol>
          </Card>
        </div>

        {/* Right Column: Workflow Code Preview */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-6 glass-panel-elevated border border-lime/30 space-y-4">
            <div className="flex items-center justify-between font-mono text-xs border-b border-surface-border pb-3">
              <span className="text-cream font-bold flex items-center gap-2">
                <FileCode className="w-4 h-4 text-lime" /> .github/workflows/carbon-budget.yml
              </span>
              <span className="text-[11px] text-sage/60">GitHub Actions Workflow Template</span>
            </div>

            <pre className="p-4 rounded-xl bg-black/80 border border-surface-border overflow-x-auto text-[11px] font-mono text-lime/90 leading-relaxed max-h-[500px]">
              {workflowYaml}
            </pre>
          </Card>
        </div>
      </div>
    </div>
  );
}
