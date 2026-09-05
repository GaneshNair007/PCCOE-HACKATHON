/**
 * Test Suite 08: Complete Workflow & Guardrail Suite
 * Executes the complete verification chain from baseline collection through
 * approval, candidate testing, task assertion guardrails, receipt generation, and CI shield budgets.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";

const ROOT_API = "http://127.0.0.1:3001";
const SIDECAR_API = "http://127.0.0.1:3002";

describe("08. Complete Engineering Workflow & Guardrail Verification", () => {
  let createdExperimentId = "";

  // 8.1 Project Selection & Baseline Initialization
  test("8.1 Step 1-3: Select project, record 3 baseline passes, and generate reviewable patch", async () => {
    const res = await fetch(`${ROOT_API}/api/experiments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: "campus-events",
        journeyId: "event-registration",
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, "success");
    assert.ok(data.experiment.id);
    createdExperimentId = data.experiment.id;

    assert.equal(data.baselineRuns.length, 3, "Must record exactly 3 baseline passes");
    assert.ok(data.patch.unifiedDiff.includes("<picture>"), "Patch must include responsive picture element");
  });

  // 8.2 Counterfactual Scenario Calculation
  test("8.2 Step 4: Calculate 20% counterfactual image scenario against baseline", async () => {
    const res = await fetch(`${ROOT_API}/api/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        baseline_bytes: 2650000,
        image_bytes: 2450000,
        js_bytes: 120000,
        img_comp: 20,
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, "success");
    assert.ok(data.saving_pct > 0, "Saving pct must be positive");
    assert.ok(data.annual_saving_metric_tons >= 0);
  });

  // 8.3 Engineering Approval
  test("8.3 Step 5-6: Record explicit engineering approval for candidate patch", async () => {
    assert.ok(createdExperimentId, "Experiment must be initialized");
    const res = await fetch(`${ROOT_API}/api/experiments/${createdExperimentId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        decision: "approved",
        notes: "Approved WebP responsive picture tag patch for verification testing.",
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, "success");
    assert.equal(data.experiment.reviewerDecision, "approved");
  });

  // 8.4 TASK ASSERTION GUARDRAIL TEST (Broken candidate with lower transfer)
  test("8.4 Step 7 (GUARDRAIL): Lighter candidate with broken registration MUST BE REJECTED", async () => {
    assert.ok(createdExperimentId);
    const res = await fetch(`${ROOT_API}/api/experiments/${createdExperimentId}/test-candidate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateVariant: "broken_candidate" }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, "success");

    // CRITICAL ASSERTION:
    // Even though transfer bytes were reduced, the task assertion FAILED (HTTP 500 registration error).
    // The candidate must be strictly rejected with functional_checks_failed!
    assert.equal(
      data.verification.outcome,
      "functional_checks_failed",
      "Lighter candidate variant with broken user journey must be REJECTED"
    );
    assert.equal(data.verification.functionalChecksPassed, false);
  });

  // 8.5 Working Candidate Verification
  test("8.5 Step 8: Working optimized candidate passes task assertions and proves physical savings", async () => {
    assert.ok(createdExperimentId);
    const res = await fetch(`${ROOT_API}/api/experiments/${createdExperimentId}/test-candidate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateVariant: "candidate" }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, "success");

    assert.equal(
      data.verification.outcome,
      "observed_improvement",
      "Optimized candidate must earn observed_improvement"
    );
    assert.equal(data.verification.functionalChecksPassed, true);
    assert.ok(data.verification.percentSaved > 70);
  });

  // 8.6 Receipt Generation
  test("8.6 Step 9: Generate auditable evidence receipt with cryptographic patch hash", async () => {
    assert.ok(createdExperimentId);
    const res = await fetch(`${ROOT_API}/api/experiments/${createdExperimentId}/receipt`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, "success");
    assert.ok(data.receipt.experimentId);
    assert.equal(data.receipt.outcome, "observed_improvement");
    assert.ok(data.receipt.receiptVersion.includes("savings-lab"));
  });

  // 8.7 STRICT BUDGET FAILURE TEST (Reintroduced oversized asset)
  test("8.7 Step 10 (BUDGET BREACH): Reintroduced baseline asset breaches 350 KB ceiling", async () => {
    const res = await fetch(`${ROOT_API}/api/shield/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: "campus-events",
        journeyId: "event-registration",
        variant: "baseline", // Reintroduced heavy 2.45 MB JPEG
        customCeilingBytes: 350000, // 350 KB ceiling
        customMode: "strict",
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.result.passed, false, "Baseline payload must breach ceiling");
    assert.ok(data.result.breaches.length > 0, "Must record payload breach");
  });
});
