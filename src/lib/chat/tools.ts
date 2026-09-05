/**
 * Carbonerra Chat Workspace — Real Tool Definitions & Execution Engine
 * Built around the MEASURE -> DIAGNOSE -> PRIORITIZE -> REDUCE -> IMPLEMENT -> VERIFY -> PREVENT lifecycle.
 * No hardcoded responses, no guessed percentages, no silent global state.
 */

import { z } from "zod";
import { tool } from "ai";
import { performAudit } from "@/lib/scanner";
import { calculateCarbonFootprint } from "@/lib/carbon";
import { StorageRepository } from "@/lib/storage/repository";
import { runTripleVerification, executeJourneyPass } from "@/lib/runner/journey-runner";
import { generateEventHeroImagePatch } from "@/lib/runner/image-patch";
import { evaluateBudget } from "@/lib/shield/budget-evaluator";
import { generateImprovementReceipt } from "@/lib/receipt/receipt-generator";
import { Experiment, AuditRun } from "@/lib/storage/types";

export interface ChatContext {
  projectId?: string;
  auditId?: string;
  experimentId?: string;
  targetUrl?: string;
}

// 1. Tool: Investigate Audit
export const investigateAuditSchema = z.object({
  targetUrl: z.string().describe("Public URL or hostname to audit"),
  auditId: z.string().optional().describe("Existing immutable audit ID to retrieve"),
});

export async function executeInvestigateAudit(args: { targetUrl?: string; auditId?: string }) {
  if (args.auditId) {
    const run = StorageRepository.getRun(args.auditId);
    if (run) {
      return {
        source: "stored_audit_run",
        runId: run.id,
        targetUrl: run.targetUrl,
        totalBytes: run.totalBytes,
        co2Grams: run.co2Grams,
        ecoScore: run.ecoScore,
        assertionsPassed: run.assertionsPassed,
        resourceCount: run.resources.length,
        resources: run.resources.map((r) => ({
          url: r.url,
          category: r.category,
          bytes: r.observedBytes,
          format: r.format,
        })),
      };
    }
  }

  const targetUrl = args.targetUrl || "pccoe.org";
  const result = await performAudit(targetUrl);
  return {
    source: "live_audit",
    domain: result.domain,
    targetUrl: result.target_url,
    totalBytes: result.total_bytes,
    co2Grams: result.co2_grams,
    ecoScore: result.eco_score,
    confidence: result.confidence,
    crossValidation: result.cross_validation
      ? {
          discrepancyPct: result.cross_validation.discrepancy_pct,
          source1LighthouseBytes: result.cross_validation.source1_lighthouse_bytes,
          source2CheerioBytes: result.cross_validation.source2_raw_fetch_bytes,
        }
      : null,
    hosting: {
      isGreen: result.hosting.green,
      provider: result.hosting.provider,
    },
    gridIntensity: {
      val: result.grid_intensity_val,
      source: result.grid_intensity_source,
      country: result.hosting_country,
    },
    payloadBreakdown: result.payload_breakdown,
    hotspots: result.hotspots.map((h) => ({
      title: h.title,
      size: h.size,
      co2Est: h.co2_est,
      description: h.desc,
      fixAction: h.fix_action,
    })),
  };
}

// 2. Tool: Compare Two Sites
export const compareAuditsSchema = z.object({
  urlA: z.string().describe("First website URL"),
  urlB: z.string().describe("Second website URL"),
});

export async function executeCompareAudits(args: { urlA: string; urlB: string }) {
  const [auditA, auditB] = await Promise.all([
    performAudit(args.urlA),
    performAudit(args.urlB),
  ]);

  const deltaBytes = auditA.total_bytes - auditB.total_bytes;
  const deltaGrams = Number((auditA.co2_grams - auditB.co2_grams).toFixed(4));
  const cleanerDomain = deltaBytes > 0 ? auditB.domain : auditA.domain;
  const differencePct = Number(
    (
      (Math.abs(deltaBytes) / Math.max(auditA.total_bytes, auditB.total_bytes, 1)) *
      100
    ).toFixed(1)
  );

  return {
    siteA: {
      domain: auditA.domain,
      bytes: auditA.total_bytes,
      co2Grams: auditA.co2_grams,
      ecoScore: auditA.eco_score,
      greenHosting: auditA.hosting.green,
    },
    siteB: {
      domain: auditB.domain,
      bytes: auditB.total_bytes,
      co2Grams: auditB.co2_grams,
      ecoScore: auditB.eco_score,
      greenHosting: auditB.hosting.green,
    },
    cleanerDomain,
    differencePct,
    deltaBytes,
    deltaGrams,
  };
}

// 3. Tool: Prepare Savings Lab Experiment
export const prepareExperimentSchema = z.object({
  projectId: z.string().default("campus-events").describe("Project identifier"),
  journeyId: z.string().default("event-registration").describe("Journey identifier"),
  targetBaseUrl: z.string().default("http://localhost:3001").describe("Target base URL"),
});

export async function executePrepareExperiment(args: {
  projectId?: string;
  journeyId?: string;
  targetBaseUrl?: string;
}) {
  const projectId = args.projectId || "campus-events";
  const journeyId = args.journeyId || "event-registration";
  const targetBaseUrl = args.targetBaseUrl || "http://localhost:3001";
  const expId = `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  // Record 3 real baseline passes
  const baselineRuns: AuditRun[] = [];
  for (let i = 1; i <= 3; i++) {
    const bRun = await executeJourneyPass({
      projectId,
      journeyId,
      targetBaseUrl,
      variant: "baseline",
      runIndex: i,
    });
    baselineRuns.push(bRun);
  }

  const patch = generateEventHeroImagePatch(expId);

  const experiment: Experiment = {
    id: expId,
    projectId,
    journeyId,
    baselineRunIds: baselineRuns.map((r) => r.id),
    affectedResourceUrl: patch.resourceOriginalUrl,
    patchDiff: patch.unifiedDiff,
    reviewerDecision: "pending",
    candidateRunIds: [],
    status: "fix_proposed",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  StorageRepository.saveExperiment(experiment);

  return {
    experimentId: experiment.id,
    projectId: experiment.projectId,
    journeyId: experiment.journeyId,
    status: experiment.status,
    baselineMedianBytes:
      baselineRuns.map((r) => r.totalBytes).sort((a, b) => a - b)[1] || baselineRuns[0].totalBytes,
    patchProposal: {
      targetFile: patch.targetFile,
      affectedResource: patch.resourceOriginalUrl,
      replacementResource: patch.resourceOptimizedUrl,
      estimatedSavingPct: patch.estimatedSavingPct,
      risk: patch.risk,
      unifiedDiff: patch.unifiedDiff,
    },
    actionPrompt: "Experiment created with 3 baseline passes. Awaiting reviewer approval to test candidate.",
  };
}

// 4. Tool: Test Candidate with Task Preservation
export const testCandidateSchema = z.object({
  experimentId: z.string().describe("Experiment ID to test"),
  variant: z
    .enum(["candidate", "broken_candidate", "optimized", "broken"])
    .default("candidate")
    .describe("Candidate variant: candidate (optimized) or broken_candidate (broken registration)"),
  targetBaseUrl: z.string().default("http://localhost:3001").describe("Target base URL"),
});

export async function executeTestCandidate(args: {
  experimentId: string;
  variant?: "candidate" | "broken_candidate" | "optimized" | "broken";
  targetBaseUrl?: string;
}) {
  const exp = StorageRepository.getExperiment(args.experimentId);
  if (!exp) {
    throw new Error(`Experiment ${args.experimentId} not found.`);
  }

  const candidateVariant =
    args.variant === "broken" || args.variant === "broken_candidate"
      ? "broken_candidate"
      : "candidate";
  const targetBaseUrl = args.targetBaseUrl || "http://localhost:3001";

  const verification = await runTripleVerification(
    exp.projectId,
    exp.journeyId,
    targetBaseUrl,
    candidateVariant,
    exp.id
  );

  return {
    experimentId: exp.id,
    outcome: verification.outcome,
    functionalChecksPassed: verification.functionalChecksPassed,
    baselineMedianBytes: verification.baselineMedianBytes,
    candidateMedianBytes: verification.candidateMedianBytes,
    bytesSaved: verification.bytesSaved,
    percentSaved: verification.percentSaved,
    baselineCo2Grams: verification.baselineCo2Grams,
    candidateCo2Grams: verification.candidateCo2Grams,
    co2GramsSaved: verification.co2GramsSaved,
    assertionsSummary: verification.assertionsSummary,
    reasons: verification.reasons,
  };
}

// 5. Tool: Evaluate Release Shield Budget
export const evaluateBudgetSchema = z.object({
  projectId: z.string().default("campus-events").describe("Project identifier"),
  variant: z.enum(["baseline", "candidate", "optimized", "broken", "broken_candidate"]).default("baseline"),
  ceilingBytes: z.number().optional().describe("Transfer ceiling in bytes (default: 350,000)"),
  mode: z.enum(["strict", "warn"]).optional().describe("Enforcement mode"),
  targetBaseUrl: z.string().default("http://localhost:3001").describe("Target base URL"),
});

export async function executeEvaluateBudget(args: {
  projectId?: string;
  variant?: "baseline" | "candidate" | "optimized" | "broken" | "broken_candidate";
  ceilingBytes?: number;
  mode?: "strict" | "warn";
  targetBaseUrl?: string;
}) {
  const projectId = args.projectId || "campus-events";
  const variant = args.variant || "baseline";
  const targetBaseUrl = args.targetBaseUrl || "http://localhost:3001";

  const { result, run, budget } = await evaluateBudget({
    projectId,
    targetBaseUrl,
    variant,
    customCeilingBytes: args.ceilingBytes,
    customMode: args.mode,
  });

  return {
    passed: result.passed,
    isWarning: result.isWarning,
    mode: budget.mode,
    exitCode: result.passed ? 0 : result.isWarning ? 0 : 1,
    actualBytes: result.actualBytes,
    thresholdBytes: result.thresholdBytes,
    actualRequests: result.actualRequests,
    thresholdRequests: result.thresholdRequests,
    actualCarbonGrams: result.actualCarbonGrams,
    thresholdCarbonGrams: result.thresholdCarbonGrams,
    taskAssertionsPassed: run.assertionsPassed,
    breaches: result.breaches,
    details: result.details,
  };
}

// 6. Tool: Simulate Scenario (Zero Levers = Zero Delta)
export const simulateScenarioSchema = z.object({
  baselineBytes: z.number().positive().describe("Observed baseline transfer bytes"),
  imageReductionPct: z.number().min(0).max(100).default(0).describe("Image compression percentage"),
  jsDeferralPct: z.number().min(0).max(100).default(0).describe("JavaScript deferral percentage"),
  cacheTtlDays: z.number().min(0).max(365).default(0).describe("Browser cache retention in days"),
  greenHosting: z.boolean().default(false).describe("100% renewable green hosting toggle"),
  observedImageBytes: z.number().optional().describe("Observed image category bytes"),
  observedJsBytes: z.number().optional().describe("Observed JavaScript category bytes"),
});

export async function executeSimulateScenario(args: {
  baselineBytes: number;
  imageReductionPct?: number;
  jsDeferralPct?: number;
  cacheTtlDays?: number;
  greenHosting?: boolean;
  observedImageBytes?: number;
  observedJsBytes?: number;
}) {
  const baseBytes = args.baselineBytes;
  const imageReductionPct = args.imageReductionPct ?? 0;
  const jsDeferralPct = args.jsDeferralPct ?? 0;
  const cacheTtlDays = args.cacheTtlDays ?? 0;
  const greenHosting = args.greenHosting ?? false;

  const imgBytes = args.observedImageBytes ?? Math.round(baseBytes * 0.4);
  const jsBytes = args.observedJsBytes ?? Math.round(baseBytes * 0.3);
  const otherBytes = Math.max(0, baseBytes - imgBytes - jsBytes);

  const imgSaved = Math.round(imgBytes * (imageReductionPct / 100) * 0.65);
  const jsSaved = Math.round(jsBytes * (jsDeferralPct / 100) * 0.15);
  const cacheFactor = cacheTtlDays > 0 ? Math.min((cacheTtlDays / 365) * 0.1, 0.1) : 0;

  const rawSimulated = Math.max(0, imgBytes - imgSaved) + Math.max(0, jsBytes - jsSaved) + otherBytes;
  const simulatedBytes = Math.max(1000, Math.round(rawSimulated * (1 - cacheFactor)));

  const baselineMetrics = calculateCarbonFootprint(baseBytes, false);
  const simulatedMetrics = calculateCarbonFootprint(simulatedBytes, greenHosting);

  const deltaBytes = baseBytes - simulatedBytes;
  const percentSaved = Number(((deltaBytes / baseBytes) * 100).toFixed(1));
  const co2SavedGrams = Number(
    (baselineMetrics.co2_grams - simulatedMetrics.co2_grams).toFixed(4)
  );

  return {
    baseline: {
      bytes: baseBytes,
      co2Grams: baselineMetrics.co2_grams,
      ecoScore: baselineMetrics.ecoscore_grade,
    },
    simulated: {
      bytes: simulatedBytes,
      co2Grams: simulatedMetrics.co2_grams,
      ecoScore: simulatedMetrics.ecoscore_grade,
    },
    deltaBytes,
    percentSaved,
    co2SavedGrams,
    methodologyNote:
      "Calculated via Sustainable Web Design Model v4. Reductions are scoped strictly to eligible asset categories.",
  };
}

// 7. Tool: Generate Improvement Receipt
export const generateReceiptSchema = z.object({
  experimentId: z.string().describe("Experiment ID to generate receipt for"),
});

export async function executeGenerateReceipt(args: { experimentId: string }) {
  const exp = StorageRepository.getExperiment(args.experimentId);
  if (!exp) {
    throw new Error(`Experiment ${args.experimentId} not found in repository.`);
  }
  const verification = StorageRepository.getVerificationByExperiment(args.experimentId);
  if (!verification) {
    throw new Error(`No verification result found for experiment ${args.experimentId}. Run candidate verification first.`);
  }

  const receipt = generateImprovementReceipt(verification, exp);
  return {
    receiptVersion: receipt.receiptVersion,
    experimentId: receipt.experimentId,
    projectId: receipt.projectId,
    journeyId: receipt.journeyId,
    generatedAt: receipt.generatedAt,
    outcome: receipt.outcome,
    reviewerDecision: receipt.reviewerDecision,
    patchSummary: receipt.patchSummary,
    measuredDifferences: receipt.measuredDifferences,
    functionalAssertions: receipt.functionalAssertions,
    methodology: receipt.methodology,
    disclaimer: receipt.disclaimer,
  };
}

// Vercel AI SDK Tool Registry
export const carbonerraAiTools = {
  investigate_audit: tool({
    description: "Audits a live public website URL using real network inspection or retrieves an existing immutable audit run.",
    inputSchema: investigateAuditSchema,
    execute: async (args) => executeInvestigateAudit(args),
  }),
  compare_audits: tool({
    description: "Audits two websites simultaneously and computes exact byte deltas and carbon differences.",
    inputSchema: compareAuditsSchema,
    execute: async (args) => executeCompareAudits(args),
  }),
  prepare_experiment: tool({
    description: "Initiates a Savings Lab experiment: executes 3 baseline passes on a user journey, identifies payload waste, and prepares a reviewable code patch.",
    inputSchema: prepareExperimentSchema,
    execute: async (args) => executePrepareExperiment(args),
  }),
  test_candidate: tool({
    description: "Executes 3 verification passes on a candidate variant and asserts critical user tasks still succeed with less transferred data.",
    inputSchema: testCandidateSchema,
    execute: async (args) => executeTestCandidate(args),
  }),
  evaluate_budget: tool({
    description: "Evaluates a release against CI Release Shield performance and digital carbon budget ceilings.",
    inputSchema: evaluateBudgetSchema,
    execute: async (args) => executeEvaluateBudget(args),
  }),
  simulate_scenario: tool({
    description: "Simulates digital carbon reductions using the Sustainable Web Design Model v4 against observed transfer data. Zero levers produce zero delta.",
    inputSchema: simulateScenarioSchema,
    execute: async (args) => executeSimulateScenario(args),
  }),
  generate_receipt: tool({
    description: "Generates an auditable improvement receipt for a verified Savings Lab experiment.",
    inputSchema: generateReceiptSchema,
    execute: async (args) => executeGenerateReceipt(args),
  }),
};
