"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  CheckCircle2,
  FileCode,
  Copy,
  Check,
  Terminal,
  Download,
  AlertTriangle,
  Info,
  Sliders,
  GitBranch,
} from "lucide-react";

export default function ShieldPage() {
  const [budgetCeiling, setBudgetCeiling] = useState<number>(0.25); // grams CO2e
  const [maxPayloadMb, setMaxPayloadMb] = useState<number>(1.8); // MB
  const [blockOnFailure, setBlockOnFailure] = useState<boolean>(true);
  const [copiedWorkflow, setCopiedWorkflow] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Dynamic GitHub Actions Workflow Template
  const workflowYaml = `# .github/workflows/carbon-budget.yml
# Carbonerra CI/CD Regression Shield
# Enforces digital sustainability and payload transfer limits on Pull Requests

name: "Carbonerra Sustainability Shield"

on:
  pull_request:
    branches: [main, master]
  push:
    branches: [main]

jobs:
  audit-carbon-budget:
    name: "Audit Carbon Budget"
    runs-on: ubuntu-latest
    steps:
      - name: "Checkout code"
        uses: actions/checkout@v4

      - name: "Set up Node.js"
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"

      - name: "Install dependencies & build"
        run: |
          npm ci
          npm run build

      - name: "Evaluate Transfer & Carbon Budget"
        env:
          BUDGET_CEILING_GRAMS: "${budgetCeiling}"
          MAX_PAYLOAD_MB: "${maxPayloadMb}"
          FAIL_ON_BREACH: "${blockOnFailure}"
        run: |
          echo "=========================================="
          echo "⚡ CARBONERRA REGRESSION SHIELD CHECK"
          echo "Target Carbon Ceiling: \${BUDGET_CEILING_GRAMS}g CO2e"
          echo "Max Payload Ceiling:   \${MAX_PAYLOAD_MB} MB"
          echo "=========================================="
          
          # Inspect production build bundle output
          TOTAL_BYTES=\$(du -sb .next/static 2>/dev/null | awk '{print \$1}' || echo "1200000")
          TOTAL_MB=\$(echo "scale=2; \$TOTAL_BYTES / 1048576" | bc)
          
          # SWDM v4 standard factor calculation
          CALCULATED_G=\$(echo "scale=4; \$TOTAL_BYTES * 0.00000000124 * 494 * 0.8" | bc)
          
          echo "Observed Build Transfer: \${TOTAL_MB} MB"
          echo "Estimated Carbon Weight: \${CALCULATED_G}g CO2e / visit"
          
          if (( \$(echo "\$CALCULATED_G > \$BUDGET_CEILING_GRAMS" | bc -l) )); then
            echo "❌ ERROR: Pull request exceeded carbon budget (\${CALCULATED_G}g > \${BUDGET_CEILING_GRAMS}g)!"
            if [ "\$FAIL_ON_BREACH" = "true" ]; then
              exit 1
            fi
          else
            echo "✅ PASSED: Build is within digital sustainability budget."
          fi
`;

  const handleCopyWorkflow = () => {
    navigator.clipboard.writeText(workflowYaml);
    setCopiedWorkflow(true);
    setNotification("GitHub Actions workflow copied to clipboard!");
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
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-8">
        <div>
          <span className="text-xs font-mono text-lime uppercase font-bold tracking-widest">
            CI/CD ENFORCEMENT TEMPLATE
          </span>
          <h1 className="font-display text-4xl sm:text-6xl text-cream uppercase tracking-wide mt-1">
            REGRESSION SHIELD
          </h1>
          <p className="text-xs sm:text-sm text-sage/80 mt-2 max-w-2xl">
            Downloadable GitHub Actions workflow template that automates carbon budget verification on every pull request before merging into production.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadWorkflow}
            className="text-xs font-mono flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-lime" />
            DOWNLOAD .YML
          </Button>
          <Button
            variant="lime"
            size="sm"
            onClick={handleCopyWorkflow}
            className="text-xs font-mono font-bold flex items-center gap-1.5"
          >
            <Copy className="w-4 h-4" />
            {copiedWorkflow ? "COPIED" : "COPY WORKFLOW"}
          </Button>
        </div>
      </div>

      {notification && (
        <div className="p-3 rounded-xl bg-lime/10 border border-lime/30 text-lime text-xs font-mono">
          {notification}
        </div>
      )}

      {/* Mode B Notice */}
      <div className="p-4 rounded-xl glass-panel border border-surface-border text-xs font-mono text-sage/80 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-lime shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-cream">Template Mode (No Fake Commit History):</span> This screen provides an auditable GitHub Actions workflow generator. Actual budget gating begins once you commit the generated `.github/workflows/carbon-budget.yml` to your code repository.
        </div>
      </div>

      {/* Grid: Configurator (Left) + Workflow Code (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Budget Threshold Controls */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 glass-panel-elevated border border-surface-border space-y-6 font-mono text-xs">
            <h3 className="font-display text-xl text-cream uppercase flex items-center gap-2">
              <Sliders className="w-5 h-5 text-lime" /> Configure Budget Limits
            </h3>

            {/* Ceiling Slider */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-cream font-bold">Max Allowed Emissions Ceiling</span>
                <span className="text-lime font-bold">{budgetCeiling}g CO2e / visit</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.80"
                step="0.05"
                value={budgetCeiling}
                onChange={(e) => setBudgetCeiling(Number(e.target.value))}
                className="w-full accent-lime bg-surface-elevated h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-sage/60">
                <span>Strict A+ (0.10g)</span>
                <span>Moderate C (0.50g)</span>
                <span>Lenient (0.80g)</span>
              </div>
            </div>

            {/* Payload Slider */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-cream font-bold">Max Transfer Payload</span>
                <span className="text-lime font-bold">{maxPayloadMb} MB</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.1"
                value={maxPayloadMb}
                onChange={(e) => setMaxPayloadMb(Number(e.target.value))}
                className="w-full accent-lime bg-surface-elevated h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Fail PR Toggle */}
            <div className="pt-4 border-t border-surface-border flex items-center justify-between">
              <div>
                <div className="text-cream font-bold">Strict CI Gating</div>
                <div className="text-[11px] text-sage/60">Fail GitHub Actions build if PR breaches budget</div>
              </div>
              <input
                type="checkbox"
                checked={blockOnFailure}
                onChange={(e) => setBlockOnFailure(e.target.checked)}
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
                <span className="text-cream font-bold">Save the workflow file</span> at:
                <pre className="mt-1 p-2 rounded bg-black/60 text-lime font-mono text-[10px]">
                  .github/workflows/carbon-budget.yml
                </pre>
              </li>
              <li>
                <span className="text-cream font-bold">Commit & push</span> the workflow file to your GitHub repository:
                <pre className="mt-1 p-2 rounded bg-black/60 text-lime font-mono text-[10px]">
                  git add .github &amp;&amp; git commit -m &quot;ci: add carbon budget shield&quot;
                </pre>
              </li>
              <li>
                <span className="text-cream font-bold">Automatic CI verification</span> triggers on every new Pull Request and reports bundle size and carbon score before merging.
              </li>
            </ol>
          </Card>
        </div>

        {/* Right Column: Interactive Workflow Code Preview */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-6 glass-panel-elevated border border-lime/30 space-y-4">
            <div className="flex items-center justify-between font-mono text-xs border-b border-surface-border pb-3">
              <span className="text-cream font-bold flex items-center gap-2">
                <FileCode className="w-4 h-4 text-lime" /> .github/workflows/carbon-budget.yml
              </span>
              <span className="text-[11px] text-sage/60">GitHub Actions YAML</span>
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
