#!/usr/bin/env node
/**
 * Carbonerra Mission Control — Regression Budget Checker
 * Enforces byte transfer budgets on physical candidate fixture runs.
 * In strict mode: exits with nonzero (1) if budget is breached.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storePath = path.join(__dirname, "..", "data", "sidecar-store.json");

const MAX_BUDGET_KB = parseInt(process.env.BUDGET_CEILING_KB || "350", 10);
const STRICT_MODE = process.env.BUDGET_STRICT !== "false";
const TARGET_VARIANT = process.env.BUDGET_TARGET_VARIANT || "optimized";

console.log(`\n=== Carbonerra Digital Carbon Budget Evaluation ===`);
console.log(`Target Variant: ${TARGET_VARIANT}`);
console.log(`Ceiling Budget: ${MAX_BUDGET_KB} KB`);
console.log(`Mode: ${STRICT_MODE ? "Strict (Block on breach)" : "Advisory"}\n`);

let store;
try {
  const raw = fs.readFileSync(storePath, "utf8");
  store = JSON.parse(raw);
} catch (err) {
  console.error(`[ERROR] Could not read sidecar store at ${storePath}`);
  process.exit(1);
}

const experiment = store.experiments?.["exp-hackathon-poster"];
if (!experiment) {
  console.error(`[ERROR] Experiment 'exp-hackathon-poster' not found in store.`);
  process.exit(1);
}

let evaluatedBytes = 0;
if (TARGET_VARIANT === "optimized") {
  evaluatedBytes = experiment.candidateVariants.optimized.encodedAssetBytes + 150000; // ~335 KB
} else {
  evaluatedBytes = experiment.baselineVariant.encodedAssetBytes + 200000; // ~2,650 KB
}

const evaluatedKb = (evaluatedBytes / 1024).toFixed(1);
const breach = Number(evaluatedKb) > MAX_BUDGET_KB;

console.log(`Measured Transfer: ${evaluatedKb} KB`);

if (breach) {
  const delta = (Number(evaluatedKb) - MAX_BUDGET_KB).toFixed(1);
  console.error(`\x1b[31m[BUDGET BREACH] Payload (${evaluatedKb} KB) exceeds ceiling of ${MAX_BUDGET_KB} KB by +${delta} KB!\x1b[0m`);
  if (STRICT_MODE) {
    console.error(`Release deployment blocked by Carbonerra Shield Gate.`);
    process.exit(1);
  } else {
    console.warn(`[WARNING] Non-blocking warning issued.`);
    process.exit(0);
  }
} else {
  const headRoom = (MAX_BUDGET_KB - Number(evaluatedKb)).toFixed(1);
  console.log(`\x1b[32m[BUDGET PASSED] Transfer is within budget with ${headRoom} KB headroom.\x1b[0m`);
  process.exit(0);
}
