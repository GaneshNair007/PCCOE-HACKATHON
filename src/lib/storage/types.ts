/**
 * Carbonerra Savings Lab — Storage & Persistence Data Models
 * Append-only data architecture for auditable verification records.
 */

export interface Project {
  id: string;
  name: string;
  allowedTargetOrigins: string[];
  repoRef: string;
  defaultJourneyId: string;
  budgetCeilingBytes: number;
  requestLimit: number;
  carbonCeilingGrams: number;
  createdAt: string;
}

export interface JourneyAssertion {
  id: string;
  description: string;
  type: "text_present" | "selector_visible" | "form_submission";
  selector?: string;
  expectedText?: string;
}

export interface Journey {
  id: string;
  projectId: string;
  name: string;
  version: string;
  targetPath: string; // e.g. "/demo/event"
  assertions: JourneyAssertion[];
  measurementPolicy: {
    coldCache: boolean;
    viewport: { width: number; height: number };
    settleTimeoutMs: number;
  };
}

export interface ResourceObservation {
  id: string;
  runId: string;
  url: string;
  category: "image" | "script" | "stylesheet" | "html" | "font" | "media" | "other";
  observedBytes: number | null;
  status: "measured" | "unmeasured" | "failed";
  dimensions?: string; // e.g. "3840x2160"
  format?: string; // e.g. "jpeg", "webp"
  isFirstParty: boolean;
}

export interface RunAssertionResult {
  assertionId: string;
  passed: boolean;
  message: string;
}

export interface AuditRun {
  id: string;
  projectId: string;
  journeyId: string;
  targetUrl: string;
  runIndex: number; // 1, 2, 3 for triple-run verification
  variant: "baseline" | "candidate" | "broken_candidate" | "deployed";
  timestamp: string;
  status: "completed" | "failed" | "inconclusive";
  totalBytes: number;
  requestCount: number;
  co2Grams: number;
  ecoScore: string;
  assertionsPassed: boolean;
  assertionResults: RunAssertionResult[];
  resources: ResourceObservation[];
  conditions: {
    browser: string;
    viewport: string;
    cachePolicy: string;
    environment: string;
  };
}

export interface Recommendation {
  id: string;
  auditRunId: string;
  resourceId: string;
  resourceUrl: string;
  title: string;
  evidence: string;
  sourceRef?: string;
  proposedAction: string;
  classification: "do_now" | "plan_next" | "investigate" | "monitor";
  effort: "low" | "medium" | "high";
  risk: "low" | "medium" | "high";
  expectedSavingsBytes: number;
  estimatedCarbonSavingGrams: number;
  verificationMethod: string;
  limitations: string[];
}

export type ExperimentStatus =
  | "draft"
  | "baseline_recorded"
  | "fix_proposed"
  | "approved"
  | "candidate_tested"
  | "awaiting_deployment"
  | "verification_complete"
  | "protected"
  | "rejected";

export interface Experiment {
  id: string;
  projectId: string;
  journeyId: string;
  baselineRunIds: string[];
  recommendationId?: string;
  affectedResourceUrl: string;
  patchDiff: string;
  reviewerDecision: "pending" | "approved" | "rejected";
  reviewedAt?: string;
  reviewerNotes?: string;
  candidateRunIds: string[];
  deployedRunIds?: string[];
  status: ExperimentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationResult {
  id: string;
  experimentId: string;
  baselineMedianBytes: number;
  candidateMedianBytes: number;
  bytesSaved: number;
  percentSaved: number;
  baselineCo2Grams: number;
  candidateCo2Grams: number;
  co2GramsSaved: number;
  functionalChecksPassed: boolean;
  assertionsSummary: { passed: number; total: number };
  outcome:
    | "observed_improvement"
    | "functional_checks_failed"
    | "regression_observed"
    | "inconclusive"
    | "cannot_compare";
  reasons: string[];
  receiptGeneratedAt: string;
}

export interface Budget {
  id: string;
  projectId: string;
  journeyId: string;
  verifiedBaselineRunId?: string;
  byteCeiling: number;
  categoryLimits: {
    imageBytes?: number;
    scriptBytes?: number;
    styleBytes?: number;
  };
  requestCountLimit: number;
  carbonCeilingGrams: number;
  tolerancePercent: number; // e.g. 5%
  mode: "strict" | "warn";
  updatedAt: string;
}

export interface BudgetCheckResult {
  passed: boolean;
  isWarning: boolean;
  actualBytes: number;
  thresholdBytes: number;
  actualRequests: number;
  thresholdRequests: number;
  actualCarbonGrams: number;
  thresholdCarbonGrams: number;
  breaches: string[];
  details: string;
}
