/**
 * Carbonerra Savings Lab — Improvement Receipt Generator
 * Produces structured JSON receipts and printable HTML views for verified experiments.
 */

import { VerificationResult, Experiment, AuditRun } from "@/lib/storage/types";
import { StorageRepository } from "@/lib/storage/repository";
import { CARBONERRA_CONFIG } from "@/lib/config";

export interface ImprovementReceipt {
  receiptVersion: string;
  experimentId: string;
  projectId: string;
  journeyId: string;
  generatedAt: string;
  outcome: string;
  reviewerDecision: string;
  reviewedAt?: string;
  patchSummary: {
    targetFile: string;
    affectedResource: string;
    replacementResource: string;
  };
  baseline: {
    runIds: string[];
    medianBytes: number;
    medianCo2Grams: number;
  };
  candidate: {
    runIds: string[];
    medianBytes: number;
    medianCo2Grams: number;
  };
  measuredDifferences: {
    bytesSaved: number;
    percentReduction: number;
    estimatedCo2SavedGrams: number;
  };
  functionalAssertions: {
    allPassed: boolean;
    summary: string;
  };
  methodology: {
    referenceModel: string;
    swdmVersion: string;
    assumptions: string[];
    limitations: string[];
  };
  disclaimer: string;
}

export function generateImprovementReceipt(
  verification: VerificationResult,
  experiment: Experiment
): ImprovementReceipt {
  const baselineRuns = experiment.baselineRunIds
    .map((id) => StorageRepository.getRun(id))
    .filter(Boolean) as AuditRun[];
  const candidateRuns = experiment.candidateRunIds
    .map((id) => StorageRepository.getRun(id))
    .filter(Boolean) as AuditRun[];

  return {
    receiptVersion: "2.0.0-savings-lab",
    experimentId: experiment.id,
    projectId: experiment.projectId,
    journeyId: experiment.journeyId,
    generatedAt: verification.receiptGeneratedAt,
    outcome: verification.outcome,
    reviewerDecision: experiment.reviewerDecision,
    reviewedAt: experiment.reviewedAt,
    patchSummary: {
      targetFile: "src/app/demo/event/page.tsx",
      affectedResource: experiment.affectedResourceUrl,
      replacementResource: "/demo/assets/campus-hackathon-hero.webp",
    },
    baseline: {
      runIds: experiment.baselineRunIds,
      medianBytes: verification.baselineMedianBytes,
      medianCo2Grams: verification.baselineCo2Grams,
    },
    candidate: {
      runIds: experiment.candidateRunIds,
      medianBytes: verification.candidateMedianBytes,
      medianCo2Grams: verification.candidateCo2Grams,
    },
    measuredDifferences: {
      bytesSaved: verification.bytesSaved,
      percentReduction: verification.percentSaved,
      estimatedCo2SavedGrams: verification.co2GramsSaved,
    },
    functionalAssertions: {
      allPassed: verification.functionalChecksPassed,
      summary: `${verification.assertionsSummary.passed} of ${verification.assertionsSummary.total} candidate runs passed all task assertions`,
    },
    methodology: {
      referenceModel: CARBONERRA_CONFIG.referenceStandard,
      swdmVersion: CARBONERRA_CONFIG.methodologyVersion,
      assumptions: [...CARBONERRA_CONFIG.standardAssumptions],
      limitations: [...CARBONERRA_CONFIG.standardLimitations],
    },
    disclaimer:
      "Carbonerra Improvement Receipt is an auditable engineering evidence record documenting observed network transfer change and model-based estimated carbon delta across reproducible test runs. It is not a carbon credit or physical emissions offset certificate.",
  };
}
