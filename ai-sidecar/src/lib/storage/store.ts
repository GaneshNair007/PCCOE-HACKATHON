/**
 * Carbonerra Mission Control — Durable Local Store
 * Manages sessions, project snapshots, experiments, verification runs, approvals, and receipts.
 * Stored in ai-sidecar/data/sidecar-store.json
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import type { CarbonResult, ResourceBreakdown } from "../engine/swdm.ts";
import { calculateCarbonSWDM4 } from "../engine/swdm.ts";

export interface SessionData {
  sessionId: string;
  createdAt: string;
  lastActiveAt: string;
  selectedProjectId?: string;
  selectedExperimentId?: string;
  userConstraints: {
    canEditSource?: boolean;
    canChangeHosting?: boolean;
    maxBudgetKb?: number;
    qualityPriority?: "high" | "medium" | "low";
  };
  messages: Array<{
    id: string;
    role: "user" | "assistant" | "system" | "tool";
    content: string;
    timestamp: string;
    toolCalls?: any[];
    toolResult?: any;
    evidenceReferences?: string[];
  }>;
}

export interface ProjectSnapshot {
  id: string;
  name: string;
  targetUrl: string;
  source: "original-app-import" | "sidecar-controlled-fixture" | "manual-report";
  originalAuditId?: string;
  capturedAt: string;
  breakdown: ResourceBreakdown;
  carbonEstimate: CarbonResult;
  provenance: {
    verified: boolean;
    note: string;
    collector: string;
  };
}

export interface ExperimentVariant {
  id: "baseline" | "optimized" | "broken";
  name: string;
  description: string;
  heroAssetUrl: string;
  encodedAssetBytes: number;
  format: "jpeg" | "webp" | "avif";
  taskPreserved: boolean;
  fixturePath: string;
}

export interface ExperimentRecord {
  id: string;
  projectId: string;
  name: string;
  description: string;
  targetFile: string;
  baselineVariant: ExperimentVariant;
  candidateVariants: {
    optimized: ExperimentVariant;
    broken: ExperimentVariant;
  };
  patchDiff: string;
  patchHash: string;
  approvalStatus: "pending" | "approved" | "rejected";
  approvedAt?: string;
  approvalSigner?: string;
  baselineRuns: Array<{
    runId: string;
    timestamp: string;
    transferBytes: number;
    journeyTimeMs: number;
    taskSuccess: boolean;
  }>;
  candidateRuns: Array<{
    runId: string;
    variant: "optimized" | "broken";
    timestamp: string;
    transferBytes: number;
    journeyTimeMs: number;
    taskSuccess: boolean;
    failureReason?: string;
  }>;
  createdAt: string;
}

export interface VerificationReceipt {
  receiptId: string;
  experimentId: string;
  projectId: string;
  timestamp: string;
  environment: {
    sidecarVersion: string;
    swdmVersion: string;
    nodeVersion: string;
    browserUserAgent: string;
  };
  patchHash: string;
  approvalRecord: {
    status: string;
    approvedAt: string;
    signer: string;
  };
  measurements: {
    baselineMedianBytes: number;
    candidateMedianBytes: number;
    bytesSaved: number;
    percentSaved: number;
    baselineGco2e: number;
    candidateGco2e: number;
    gco2eSaved: number;
    runsCount: number;
  };
  taskAssertions: {
    testedJourney: string;
    taskCompleted: boolean;
    functionalChecksPassed: boolean;
    details: string;
  };
  outcome: "observed_improvement" | "functional_checks_failed" | "regression_observed" | "inconclusive";
  limitations: string;
}

export interface SidecarDatabase {
  sessions: Record<string, SessionData>;
  projects: Record<string, ProjectSnapshot>;
  experiments: Record<string, ExperimentRecord>;
  receipts: Record<string, VerificationReceipt>;
  providerUsage: {
    groq: { tokensThisMinute: number; requestsToday: number; lastResetMinute: string };
    gemini: { tokensThisMinute: number; requestsToday: number };
  };
}

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "sidecar-store.json");

function ensureStore(): SidecarDatabase {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(STORE_PATH)) {
    const initial = getInitialStore();
    fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }

  try {
    const raw = fs.readFileSync(STORE_PATH, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    const initial = getInitialStore();
    fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }
}

function getInitialStore(): SidecarDatabase {
  const fixtureBreakdown: ResourceBreakdown = {
    imagesBytes: 2450000, // 2.45 MB uncompressed hero image
    scriptBytes: 120000, // 120 KB JS
    styleBytes: 25000, // 25 KB CSS
    fontBytes: 45000, // 45 KB WOFF2
    documentBytes: 8000, // 8 KB HTML
    otherBytes: 2000,
    totalBytes: 2650000, // ~2.65 MB
  };

  const carbon = calculateCarbonSWDM4(fixtureBreakdown.totalBytes);

  const controlledProject: ProjectSnapshot = {
    id: "proj-campus-hackathon",
    name: "Campus Hackathon Registration Portal",
    targetUrl: "http://localhost:3002/demo/event",
    source: "sidecar-controlled-fixture",
    capturedAt: new Date().toISOString(),
    breakdown: fixtureBreakdown,
    carbonEstimate: carbon,
    provenance: {
      verified: true,
      note: "Locally controlled demo fixture with reproducible baseline and candidate variants",
      collector: "Sidecar Physical Journey Runner",
    },
  };

  const patchDiff = `--- a/src/app/demo/event/page.tsx
+++ b/src/app/demo/event/page.tsx
@@ -14,5 +14,9 @@
-  <img src="/demo/hero-poster.jpg" alt="Event Poster" className="w-full h-auto" />
+  <picture>
+    <source srcSet="/demo/hero-poster.webp" type="image/webp" />
+    <img src="/demo/hero-poster.jpg" alt="Event Poster" className="w-full h-auto" loading="eager" decoding="async" width="1200" height="675" />
+  </picture>`;

  const patchHash = crypto.createHash("sha256").update(patchDiff).digest("hex");

  const initialExperiment: ExperimentRecord = {
    id: "exp-hackathon-poster",
    projectId: "proj-campus-hackathon",
    name: "Hero Poster Optimization: WebP + Responsive Picture",
    description: "Replace 2.45MB raw JPEG poster with 185KB high-fidelity WebP asset while preserving student registration CTA and form validation.",
    targetFile: "src/app/demo/event/page.tsx",
    baselineVariant: {
      id: "baseline",
      name: "Oversized Baseline (Raw JPEG)",
      description: "2.45MB uncompressed JPEG hero banner. High transfer payload.",
      heroAssetUrl: "/demo/hero-poster.jpg",
      encodedAssetBytes: 2450000,
      format: "jpeg",
      taskPreserved: true,
      fixturePath: "/demo/event?variant=baseline",
    },
    candidateVariants: {
      optimized: {
        id: "optimized",
        name: "Optimized Candidate (Responsive WebP)",
        description: "185KB WebP responsive picture element. 92.4% asset byte reduction. Full registration task preserved.",
        heroAssetUrl: "/demo/hero-poster.webp",
        encodedAssetBytes: 185000,
        format: "webp",
        taskPreserved: true,
        fixturePath: "/demo/event?variant=optimized",
      },
      broken: {
        id: "broken",
        name: "Broken Candidate (Broken Form Handlers)",
        description: "140KB asset but introduces form syntax error breaking registration submission (HTTP 500).",
        heroAssetUrl: "/demo/hero-poster.webp",
        encodedAssetBytes: 140000,
        format: "webp",
        taskPreserved: false,
        fixturePath: "/demo/event?variant=broken",
      },
    },
    patchDiff,
    patchHash,
    approvalStatus: "pending",
    baselineRuns: [
      { runId: "base-run-1", timestamp: new Date(Date.now() - 300000).toISOString(), transferBytes: 2651200, journeyTimeMs: 412, taskSuccess: true },
      { runId: "base-run-2", timestamp: new Date(Date.now() - 240000).toISOString(), transferBytes: 2650400, journeyTimeMs: 398, taskSuccess: true },
      { runId: "base-run-3", timestamp: new Date(Date.now() - 180000).toISOString(), transferBytes: 2650800, journeyTimeMs: 405, taskSuccess: true },
    ],
    candidateRuns: [],
    createdAt: new Date().toISOString(),
  };

  return {
    sessions: {},
    projects: {
      [controlledProject.id]: controlledProject,
    },
    experiments: {
      [initialExperiment.id]: initialExperiment,
    },
    receipts: {},
    providerUsage: {
      groq: { tokensThisMinute: 0, requestsToday: 0, lastResetMinute: new Date().toISOString().slice(0, 16) },
      gemini: { tokensThisMinute: 0, requestsToday: 0 },
    },
  };
}

function saveStore(store: SidecarDatabase): void {
  ensureStore();
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

export const sidecarStore = {
  get(): SidecarDatabase {
    return ensureStore();
  },

  // Sessions
  getSession(sessionId: string): SessionData | undefined {
    const store = ensureStore();
    return store.sessions[sessionId];
  },

  saveSession(session: SessionData): void {
    const store = ensureStore();
    store.sessions[session.sessionId] = session;
    saveStore(store);
  },

  // Projects
  getProject(projectId: string): ProjectSnapshot | undefined {
    const store = ensureStore();
    return store.projects[projectId];
  },

  listProjects(): ProjectSnapshot[] {
    const store = ensureStore();
    return Object.values(store.projects);
  },

  saveProject(project: ProjectSnapshot): void {
    const store = ensureStore();
    store.projects[project.id] = project;
    saveStore(store);
  },

  // Experiments
  getExperiment(experimentId: string): ExperimentRecord | undefined {
    const store = ensureStore();
    return store.experiments[experimentId];
  },

  listExperiments(): ExperimentRecord[] {
    const store = ensureStore();
    return Object.values(store.experiments);
  },

  saveExperiment(experiment: ExperimentRecord): void {
    const store = ensureStore();
    store.experiments[experiment.id] = experiment;
    saveStore(store);
  },

  // Receipts
  getReceipt(receiptId: string): VerificationReceipt | undefined {
    const store = ensureStore();
    return store.receipts[receiptId];
  },

  saveReceipt(receipt: VerificationReceipt): void {
    const store = ensureStore();
    store.receipts[receipt.receiptId] = receipt;
    saveStore(store);
  },

  // Approvals
  approveExperiment(experimentId: string, signer: string = "Lead Engineering Approver"): { success: boolean; experiment?: ExperimentRecord; error?: string } {
    const store = ensureStore();
    const exp = store.experiments[experimentId];
    if (!exp) {
      return { success: false, error: `Experiment not found: ${experimentId}` };
    }
    exp.approvalStatus = "approved";
    exp.approvedAt = new Date().toISOString();
    exp.approvalSigner = signer;
    store.experiments[experimentId] = exp;
    saveStore(store);
    return { success: true, experiment: exp };
  },

  // Provider Metering
  trackGroqTokens(tokens: number): { allowed: boolean; remainingInMinute: number } {
    const store = ensureStore();
    const currentMin = new Date().toISOString().slice(0, 16);
    if (store.providerUsage.groq.lastResetMinute !== currentMin) {
      store.providerUsage.groq.tokensThisMinute = 0;
      store.providerUsage.groq.lastResetMinute = currentMin;
    }

    const TPM_LIMIT = 8000;
    if (store.providerUsage.groq.tokensThisMinute + tokens > TPM_LIMIT) {
      return {
        allowed: false,
        remainingInMinute: Math.max(0, TPM_LIMIT - store.providerUsage.groq.tokensThisMinute),
      };
    }

    store.providerUsage.groq.tokensThisMinute += tokens;
    store.providerUsage.groq.requestsToday += 1;
    saveStore(store);

    return {
      allowed: true,
      remainingInMinute: TPM_LIMIT - store.providerUsage.groq.tokensThisMinute,
    };
  },
};
