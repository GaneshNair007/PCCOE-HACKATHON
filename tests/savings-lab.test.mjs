/**
 * Carbonerra Savings Lab — Acceptance & Verification Test Suite
 * Validates the complete: Controlled Demo Property -> Journey Runner -> Task Preservation -> 
 * Patch Generator -> Candidate Verification -> Improvement Receipt -> Shield Budget Gate
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";

const BASE_URL = process.env.TEST_BASE_URL || "http://127.0.0.1:3001";

async function fetchJson(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, options);
  const data = await res.json();
  return { status: res.status, ok: res.ok, data };
}

describe("Carbonerra Savings Lab — Acceptance & Verification Suite", () => {
  let createdExperimentId = null;

  // 1. Projects & Storage API
  test("1. GET /api/projects returns seeded controlled demo project", async () => {
    const { status, data } = await fetchJson("/api/projects");
    assert.equal(status, 200);
    assert.equal(data.status, "success");
    assert.ok(Array.isArray(data.projects));
    const campusProj = data.projects.find((p) => p.id === "campus-events");
    assert.ok(campusProj, "Project campus-events must exist in durable storage");
    assert.equal(campusProj.budgetCeilingBytes, 350000, "Budget ceiling must be 350 KB");
  });

  // 2. Controlled Demo Target Variants
  test("2. Controlled Demo: baseline renders oversized JPEG hero banner", async () => {
    const res = await fetch(`${BASE_URL}/demo/event?variant=baseline`);
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.ok(html.includes("PCCOE Green Campus Hackathon 2026"), "Title must be present");
    assert.ok(html.includes("campus-hackathon-hero.jpg"), "Baseline must use uncompressed JPEG");
    assert.ok(html.includes('id="registration-form"'), "Registration form element must be present");
  });

  test("3. Controlled Demo: optimized candidate renders responsive WebP picture tag", async () => {
    const res = await fetch(`${BASE_URL}/demo/event?variant=optimized`);
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.ok(html.includes("<picture>"), "Optimized must use picture container");
    assert.ok(html.includes("type=\"image/webp\""), "Optimized must offer WebP source");
    assert.ok(html.includes("campus-hackathon-hero.webp"), "Optimized must reference WebP asset");
    assert.ok(html.includes('fetchPriority="high"'), "LCP image must not be lazy loaded");
  });

  // 4. Task Preservation Functional Assertions
  test("4. Functional Task: valid registration completes and returns ticket ID", async () => {
    const { status, data } = await fetchJson("/api/demo/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        variant: "baseline",
        name: "Test Student",
        email: "student@pccoe.edu",
        department: "Computer Engineering",
      }),
    });
    assert.equal(status, 200);
    assert.equal(data.status, "success");
    assert.ok(data.ticketId.startsWith("PCCOE-2026-"));
  });

  test("5. Functional Task: broken candidate variant fails registration with HTTP 500", async () => {
    const { status, data } = await fetchJson("/api/demo/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        variant: "broken",
        name: "Test Student",
        email: "student@pccoe.edu",
        department: "Computer Engineering",
      }),
    });
    assert.equal(status, 500);
    assert.equal(data.status, "error");
    assert.ok(data.message.includes("Registration endpoint failed"));
  });

  // 5. Experiment Initialization & Patch Generation
  test("6. POST /api/experiments initializes baseline runs and generates reviewable diff", async () => {
    const { status, data } = await fetchJson("/api/experiments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: "campus-events",
        journeyId: "event-registration",
      }),
    });

    assert.equal(status, 200);
    assert.equal(data.status, "success");
    assert.ok(data.experiment.id);
    createdExperimentId = data.experiment.id;
    assert.equal(data.experiment.baselineRunIds.length, 3, "Must record 3 baseline passes");
    assert.ok(data.patch.unifiedDiff.includes("<picture>"), "Patch diff must contain <picture>");
    assert.equal(data.patch.risk, "low");
  });

  // 6. Reviewer Approval Workflow
  test("7. POST /api/experiments/[id]/approve records explicit engineering approval", async () => {
    assert.ok(createdExperimentId, "Experiment ID must exist from previous test");
    const { status, data } = await fetchJson(`/api/experiments/${createdExperimentId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        decision: "approved",
        notes: "Approved WebP refactor with layout preservation",
      }),
    });

    assert.equal(status, 200);
    assert.equal(data.status, "success");
    assert.equal(data.experiment.reviewerDecision, "approved");
    assert.equal(data.experiment.status, "approved");
  });

  // 7. Candidate Verification with Task Preservation Gate
  test("8. POST /api/experiments/[id]/test-candidate (Broken) is REJECTED by functional assertions", async () => {
    assert.ok(createdExperimentId);
    const { status, data } = await fetchJson(
      `/api/experiments/${createdExperimentId}/test-candidate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateVariant: "broken_candidate" }),
      }
    );

    assert.equal(status, 200);
    assert.equal(data.verification.outcome, "functional_checks_failed", "Must reject broken candidate");
    assert.equal(data.verification.functionalChecksPassed, false);
  });

  test("9. POST /api/experiments/[id]/test-candidate (Optimized) PROVES observed reduction", async () => {
    assert.ok(createdExperimentId);
    const { status, data } = await fetchJson(
      `/api/experiments/${createdExperimentId}/test-candidate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateVariant: "candidate" }),
      }
    );

    assert.equal(status, 200);
    assert.equal(data.verification.outcome, "observed_improvement", "Must record observed improvement");
    assert.equal(data.verification.functionalChecksPassed, true);
    assert.ok(data.verification.percentSaved > 80, "Expected >80% transfer reduction");
  });

  // 8. Improvement Receipt Export
  test("10. GET /api/experiments/[id]/receipt outputs auditable evidence record", async () => {
    assert.ok(createdExperimentId);
    const { status, data } = await fetchJson(`/api/experiments/${createdExperimentId}/receipt`);
    assert.equal(status, 200);
    assert.equal(data.status, "success");
    assert.equal(data.receipt.receiptVersion, "2.0.0-savings-lab");
    assert.equal(data.receipt.outcome, "observed_improvement");
    assert.ok(data.receipt.measuredDifferences.bytesSaved > 1_500_000);
    assert.ok(data.receipt.disclaimer.includes("not a carbon credit"));
  });

  // 9. Shield Regression Gate
  test("11. Shield Gate: baseline breaches 350 KB ceiling (Status: breach detected)", async () => {
    const { status, data } = await fetchJson("/api/shield/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: "campus-events",
        journeyId: "event-registration",
        variant: "baseline",
      }),
    });

    assert.equal(status, 200);
    assert.equal(data.result.passed, false, "Baseline must fail Shield gate");
    assert.ok(data.result.actualBytes > 2_000_000, "Actual transfer must reflect ~2.4 MB hero");
  });

  test("12. Shield Gate: optimized candidate passes within 350 KB ceiling", async () => {
    const { status, data } = await fetchJson("/api/shield/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: "campus-events",
        journeyId: "event-registration",
        variant: "optimized",
      }),
    });

    assert.equal(status, 200);
    assert.equal(data.result.passed, true, "Optimized candidate must pass Shield gate");
    assert.ok(data.result.actualBytes < 350_000, "Transfer must be under 350 KB");
  });

  // 10. Simulation Zero Levers Invariant
  test("13. Simulation Invariant: zero levers reproduce baseline transfer exactly", async () => {
    const { status, data } = await fetchJson("/api/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        baseline_bytes: 1_500_000,
        img_comp: 0,
        js_defer: 0,
        cache_ttl: 0,
        green_hosting: false,
        baseline_green: false,
      }),
    });

    assert.equal(status, 200);
    assert.equal(data.simulated.bytes_transferred, 1_500_000, "Zero levers must reproduce exact baseline bytes");
    assert.equal(data.saving_pct, 0, "Saving percentage must be 0%");
  });
});
