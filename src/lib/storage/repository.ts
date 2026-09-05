/**
 * Carbonerra Savings Lab — Durable Repository Layer
 * Append-only data architecture. Never overwrites a baseline.
 */

import fs from "node:fs";
import path from "node:path";
import {
  Project,
  Journey,
  AuditRun,
  Experiment,
  VerificationResult,
  Budget,
} from "./types";

interface StorageState {
  projects: Record<string, Project>;
  journeys: Record<string, Journey>;
  runs: Record<string, AuditRun>;
  experiments: Record<string, Experiment>;
  verifications: Record<string, VerificationResult>;
  budgets: Record<string, Budget>;
}

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "carbonerra-store.json");

// Default campus demo project and registration journey seed
const SEED_PROJECT: Project = {
  id: "campus-events",
  name: "Campus Event Registration (Controlled Demo)",
  allowedTargetOrigins: ["http://localhost:3001", "http://127.0.0.1:3001"],
  repoRef: "GaneshNair007/PCCOE-HACKATHON",
  defaultJourneyId: "event-registration",
  budgetCeilingBytes: 350_000, // 350 KB transfer budget ceiling
  requestLimit: 12,
  carbonCeilingGrams: 0.08,
  createdAt: new Date().toISOString(),
};

const SEED_JOURNEY: Journey = {
  id: "event-registration",
  projectId: "campus-events",
  name: "Event Details to Registration Success",
  version: "1.0.0",
  targetPath: "/demo/event",
  assertions: [
    {
      id: "title_essential_info",
      description: "Event title, date, venue and track details are present in the DOM",
      type: "text_present",
      expectedText: "PCCOE Green Campus Hackathon 2026",
    },
    {
      id: "cta_accessible",
      description: "Registration CTA is keyboard accessible and opens registration form",
      type: "selector_visible",
      selector: "#registration-form",
    },
    {
      id: "form_submission_success",
      description: "Required registration fields validate and synthetic submission reaches success state",
      type: "form_submission",
    },
  ],
  measurementPolicy: {
    coldCache: true,
    viewport: { width: 1280, height: 800 },
    settleTimeoutMs: 1500,
  },
};

const SEED_BUDGET: Budget = {
  id: "budget-campus-events",
  projectId: "campus-events",
  journeyId: "event-registration",
  byteCeiling: 350_000,
  categoryLimits: {
    imageBytes: 200_000,
    scriptBytes: 100_000,
    styleBytes: 50_000,
  },
  requestCountLimit: 12,
  carbonCeilingGrams: 0.08,
  tolerancePercent: 5,
  mode: "strict",
  updatedAt: new Date().toISOString(),
};

function initStore(): StorageState {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (!parsed.projects || !parsed.projects["campus-events"]) {
        parsed.projects = { ...parsed.projects, [SEED_PROJECT.id]: SEED_PROJECT };
      }
      if (!parsed.journeys || !parsed.journeys["event-registration"]) {
        parsed.journeys = { ...parsed.journeys, [SEED_JOURNEY.id]: SEED_JOURNEY };
      }
      if (!parsed.budgets || !parsed.budgets["campus-events"]) {
        parsed.budgets = { ...parsed.budgets, ["campus-events"]: SEED_BUDGET };
      }
      return parsed;
    }
  } catch (err) {
    console.warn("Storage init warning, recreating clean store:", err);
  }

  const initial: StorageState = {
    projects: { [SEED_PROJECT.id]: SEED_PROJECT },
    journeys: { [SEED_JOURNEY.id]: SEED_JOURNEY },
    runs: {},
    experiments: {},
    verifications: {},
    budgets: { ["campus-events"]: SEED_BUDGET },
  };

  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write initial store:", err);
  }

  return initial;
}

// In-memory synced state
let store: StorageState = initStore();

function persistStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist carbonerra store:", err);
  }
}

export const StorageRepository = {
  // Projects
  getProjects(): Project[] {
    return Object.values(store.projects);
  },

  getProject(id: string): Project | null {
    return store.projects[id] || null;
  },

  // Journeys
  getJourneys(projectId?: string): Journey[] {
    const list = Object.values(store.journeys);
    return projectId ? list.filter((j) => j.projectId === projectId) : list;
  },

  getJourney(id: string): Journey | null {
    return store.journeys[id] || null;
  },

  // Append-Only Runs
  saveRun(run: AuditRun): AuditRun {
    store.runs[run.id] = run;
    persistStore();
    return run;
  },

  getRun(id: string): AuditRun | null {
    return store.runs[id] || null;
  },

  listRuns(projectId?: string, journeyId?: string): AuditRun[] {
    let list = Object.values(store.runs);
    if (projectId) list = list.filter((r) => r.projectId === projectId);
    if (journeyId) list = list.filter((r) => r.journeyId === journeyId);
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  // Experiments
  saveExperiment(exp: Experiment): Experiment {
    store.experiments[exp.id] = {
      ...exp,
      updatedAt: new Date().toISOString(),
    };
    persistStore();
    return store.experiments[exp.id];
  },

  getExperiment(id: string): Experiment | null {
    return store.experiments[id] || null;
  },

  listExperiments(projectId?: string): Experiment[] {
    let list = Object.values(store.experiments);
    if (projectId) list = list.filter((e) => e.projectId === projectId);
    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  updateExperiment(id: string, updates: Partial<Experiment>): Experiment | null {
    const existing = store.experiments[id];
    if (!existing) return null;
    const updated: Experiment = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    store.experiments[id] = updated;
    persistStore();
    return updated;
  },

  // Verifications
  saveVerification(ver: VerificationResult): VerificationResult {
    store.verifications[ver.id] = ver;
    persistStore();
    return ver;
  },

  getVerification(id: string): VerificationResult | null {
    return store.verifications[id] || null;
  },

  getVerificationByExperiment(experimentId: string): VerificationResult | null {
    const list = Object.values(store.verifications).filter((v) => v.experimentId === experimentId);
    if (list.length === 0) return null;
    return list.sort(
      (a, b) => new Date(b.receiptGeneratedAt).getTime() - new Date(a.receiptGeneratedAt).getTime()
    )[0];
  },

  // Budgets
  getBudget(projectId: string): Budget | null {
    return store.budgets[projectId] || null;
  },

  saveBudget(budget: Budget): Budget {
    store.budgets[budget.projectId] = {
      ...budget,
      updatedAt: new Date().toISOString(),
    };
    persistStore();
    return store.budgets[budget.projectId];
  },

  resetDemo() {
    store = {
      projects: { [SEED_PROJECT.id]: SEED_PROJECT },
      journeys: { [SEED_JOURNEY.id]: SEED_JOURNEY },
      runs: {},
      experiments: {},
      verifications: {},
      budgets: { ["campus-events"]: SEED_BUDGET },
    };
    persistStore();
  },
};
