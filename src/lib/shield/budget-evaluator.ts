/**
 * Carbonerra Regression Shield — Shared Budget Evaluator
 * Used by web app, CLI, and downloadable GitHub Actions workflow.
 */

import { Budget, BudgetCheckResult, AuditRun } from "@/lib/storage/types";
import { StorageRepository } from "@/lib/storage/repository";
import { executeJourneyPass } from "@/lib/runner/journey-runner";

export interface EvaluateBudgetOptions {
  projectId: string;
  journeyId?: string;
  targetBaseUrl: string;
  variant?: "baseline" | "candidate" | "optimized" | "broken_candidate" | "broken";
  customCeilingBytes?: number;
  customMode?: "strict" | "warn";
}

export async function evaluateBudget(
  options: EvaluateBudgetOptions
): Promise<{ result: BudgetCheckResult; run: AuditRun; budget: Budget }> {
  const {
    projectId,
    journeyId = "event-registration",
    targetBaseUrl,
    variant = "baseline",
    customCeilingBytes,
    customMode,
  } = options;

  let budget = StorageRepository.getBudget(projectId);
  if (!budget) {
    budget = {
      id: `budget_${projectId}`,
      projectId,
      journeyId,
      byteCeiling: customCeilingBytes || 350_000,
      categoryLimits: {
        imageBytes: 200_000,
      },
      requestCountLimit: 12,
      carbonCeilingGrams: 0.08,
      tolerancePercent: 5,
      mode: customMode || "strict",
      updatedAt: new Date().toISOString(),
    };
    StorageRepository.saveBudget(budget);
  }

  // Override with custom ceiling / mode if provided by caller
  const activeCeilingBytes = customCeilingBytes || budget.byteCeiling;
  const activeMode = customMode || budget.mode;
  const toleranceMultiplier = 1 + budget.tolerancePercent / 100.0;
  const allowedBytesWithTolerance = Math.round(activeCeilingBytes * toleranceMultiplier);

  const normalizedVariant: "baseline" | "candidate" | "broken_candidate" =
    variant === "broken" || variant === "broken_candidate"
      ? "broken_candidate"
      : variant === "optimized" || variant === "candidate"
      ? "candidate"
      : "baseline";

  // 1. Execute live journey pass
  const run = await executeJourneyPass({
    projectId,
    journeyId,
    targetBaseUrl,
    variant: normalizedVariant,
    runIndex: 1,
  });

  const breaches: string[] = [];

  // 2. Check total transfer bytes
  if (run.totalBytes > allowedBytesWithTolerance) {
    const overBytes = run.totalBytes - activeCeilingBytes;
    breaches.push(
      `Payload transfer (${Math.round(run.totalBytes / 1024)} KB) exceeds budget ceiling (${Math.round(
        activeCeilingBytes / 1024
      )} KB) by ${Math.round(overBytes / 1024)} KB.`
    );
  }

  // 3. Check request count
  if (run.requestCount > budget.requestCountLimit) {
    breaches.push(
      `Request count (${run.requestCount}) exceeds limit (${budget.requestCountLimit}).`
    );
  }

  // 4. Check carbon ceiling
  if (run.co2Grams > budget.carbonCeilingGrams) {
    breaches.push(
      `Estimated carbon (${run.co2Grams}g CO2e) exceeds ceiling (${budget.carbonCeilingGrams}g CO2e).`
    );
  }

  // 5. Check functional assertions
  if (!run.assertionsPassed) {
    breaches.push("Journey task assertions failed during verification run.");
  }

  const hasBreaches = breaches.length > 0;
  const isWarning = hasBreaches && activeMode === "warn";
  const passed = !hasBreaches || isWarning;

  const result: BudgetCheckResult = {
    passed,
    isWarning,
    actualBytes: run.totalBytes,
    thresholdBytes: activeCeilingBytes,
    actualRequests: run.requestCount,
    thresholdRequests: budget.requestCountLimit,
    actualCarbonGrams: run.co2Grams,
    thresholdCarbonGrams: budget.carbonCeilingGrams,
    breaches,
    details: hasBreaches
      ? isWarning
        ? `Budget breach detected in WARN mode: ${breaches.join("; ")}`
        : `Budget check FAILED in STRICT mode: ${breaches.join("; ")}`
      : `All budget limits respected (${Math.round(run.totalBytes / 1024)} KB / ${Math.round(
          activeCeilingBytes / 1024
        )} KB ceiling).`,
  };

  return { result, run, budget };
}
