/**
 * Test Suite 03: API & Validation Suite
 * Tests every endpoint for contracts, boundary conditions, malformed input,
 * unsupported methods, error sanitization, and ID handling.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";

const ROOT_API = "http://127.0.0.1:3001";
const SIDECAR_API = "http://127.0.0.1:3002";

describe("03. API Contracts and Input Validation", () => {
  // 3.1 POST /api/audit
  test("3.1 POST /api/audit: Missing URL returns 400 with sanitized error", async () => {
    const res = await fetch(`${ROOT_API}/api/audit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "" }),
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.status, "error");
    assert.equal(data.code, "INVALID_URL");
    assert.ok(!data.stack, "Stack trace must not be exposed");
  });

  test("3.2 POST /api/audit: Malformed JSON returns 400 or 500 with clean error", async () => {
    const res = await fetch(`${ROOT_API}/api/audit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{malformed_json_without_quotes",
    });
    assert.ok(res.status >= 400, "Must return 4xx/5xx for bad JSON");
    const data = await res.json().catch(() => ({}));
    assert.ok(!data.stack, "Stack trace must not be exposed");
  });

  // 3.3 POST /api/simulate
  test("3.3 POST /api/simulate: Negative baseline_bytes is rejected with 400", async () => {
    const res = await fetch(`${ROOT_API}/api/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ baseline_bytes: -5000 }),
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.status, "error");
    assert.ok(data.message.includes("positive baseline_bytes"));
  });

  test("3.4 POST /api/simulate: Missing baseline_bytes is rejected with 400", async () => {
    const res = await fetch(`${ROOT_API}/api/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ img_comp: 20 }),
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.status, "error");
  });

  test("3.5 POST /api/simulate: Zero levers reproduce baseline metrics exactly", async () => {
    const res = await fetch(`${ROOT_API}/api/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ baseline_bytes: 2000000, img_comp: 0, js_defer: 0, cache_ttl: 0 }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, "success");
    assert.equal(data.baseline.total_bytes, data.simulated.total_bytes);
    assert.equal(data.baseline.co2_grams, data.simulated.co2_grams);
    assert.equal(data.saving_pct, 0);
  });

  // 3.6 POST /api/chat
  test("3.6 POST /api/chat: Empty message returns 400", async () => {
    const res = await fetch(`${ROOT_API}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "   " }),
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.ok(data.error);
  });

  // 3.7 POST /api/shield/evaluate
  test("3.7 POST /api/shield/evaluate: Strict evaluation detects baseline breach", async () => {
    const res = await fetch(`${ROOT_API}/api/shield/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: "campus-events",
        journeyId: "event-registration",
        variant: "baseline",
        customCeilingBytes: 350000,
        customMode: "strict",
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, "success");
    assert.equal(data.result.passed, false, "Baseline (2.65 MB) must fail 350 KB budget");
    assert.ok(data.result.breaches.length > 0, "Must record payload breach");
  });

  // 3.8 POST /api/experiments/[id]/approve
  test("3.8 POST /api/experiments/[id]/approve: Non-existent experiment returns 404", async () => {
    const res = await fetch(`${ROOT_API}/api/experiments/non-existent-exp-9999/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision: "approved" }),
    });
    assert.equal(res.status, 404);
    const data = await res.json();
    assert.equal(data.status, "error");
    assert.equal(data.message, "Experiment not found");
  });

  // 3.9 GET /api/experiments/[id]/receipt
  test("3.9 GET /api/experiments/[id]/receipt: Non-existent experiment returns 404", async () => {
    const res = await fetch(`${ROOT_API}/api/experiments/non-existent-exp-9999/receipt`);
    assert.equal(res.status, 404);
    const data = await res.json();
    assert.equal(data.status, "error");
    assert.equal(data.message, "Experiment not found");
  });

  // 3.10 POST /api/companion/chat (Sidecar SSE)
  test("3.10 POST /api/companion/chat: Empty message returns 400", async () => {
    const res = await fetch(`${SIDECAR_API}/api/companion/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "" }),
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.ok(data.error);
  });

  // 3.11 POST /api/companion/approval (Sidecar)
  test("3.11 POST /api/companion/approval: Mismatched patch hash returns 409 Conflict", async () => {
    const res = await fetch(`${SIDECAR_API}/api/companion/approval`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        experimentId: "exp-hackathon-poster",
        patchHash: "sha256-wronghash-this-does-not-match-candidate-diff",
      }),
    });
    assert.equal(res.status, 409, "Must return 409 Conflict on patch hash mismatch");
    const data = await res.json();
    assert.ok(data.error.includes("Patch hash mismatch"));
  });

  // 3.12 POST /api/companion/budget (Sidecar)
  test("3.12 POST /api/companion/budget: Baseline in strict mode returns 422 Unprocessable Entity", async () => {
    const res = await fetch(`${SIDECAR_API}/api/companion/budget`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        maxTransferKb: 350,
        targetVariant: "baseline",
        strict: true,
      }),
    });
    assert.equal(res.status, 422, "Strict mode breach must return HTTP 422");
    const data = await res.json();
    assert.equal(data.passed, false);
    assert.equal(data.status, "BREACH_DETECTED");
  });

  // 3.13 GET /api/companion/receipts/[id] (Sidecar receipt)
  test("3.13 GET /api/companion/receipts/[id]: Known receipt returns 200 with cryptographic audit trail", async () => {
    const res = await fetch(`${SIDECAR_API}/api/companion/receipts/rcpt-hackathon-verification-001`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.receiptId);
    assert.ok(data.patchHash);
    assert.ok(data.measurements);
    assert.ok(data.taskAssertions);
  });

  // 3.14 Unsupported HTTP Methods
  test("3.14 Unsupported HTTP methods return 405 or clean 404/501 without stack traces", async () => {
    const res = await fetch(`${ROOT_API}/api/methodology`, { method: "DELETE" });
    assert.ok(res.status === 405 || res.status === 404, "DELETE on GET-only route should not succeed");

    const text = await res.text();
    assert.ok(!text.includes("node_modules"), "Internal file paths must not be leaked");
    assert.ok(!text.includes("at Module._compile"), "Stack trace must not be leaked");
  });
});
