/**
 * Carbonerra Agentic Chat & Tool Execution Test Suite
 * Validates that the chat agent executes real sustainability tools
 * without hardcoded strings, guessed percentages, or silent state.
 */

import test from "node:test";
import assert from "node:assert/strict";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3001";

test("Carbonerra Chat Workspace — Grounded Tool Execution Suite", async (t) => {
  await t.test("1. POST /api/chat rejects empty query message", async () => {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "   " }),
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.ok(data.error);
  });

  await t.test("2. POST /api/chat executes real audit tool with SWDM v4 telemetry", async () => {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "check example.com" }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.reply);
    assert.ok(data.tool_used.includes("investigate_audit"));
    assert.ok(data.tool_output);
    assert.equal(data.tool_output.domain, "example.com");
    assert.ok(typeof data.tool_output.totalBytes === "number");
    assert.ok(typeof data.tool_output.co2Grams === "number");
    assert.ok(data.tool_output.ecoScore);
  });

  await t.test("3. POST /api/chat executes dual site comparison with real calculated delta", async () => {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "compare example.com with iana.org" }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.reply);
    assert.ok(data.tool_used.includes("compare_audits"));
    assert.ok(data.tool_output);
    assert.ok(data.tool_output.siteA);
    assert.ok(data.tool_output.siteB);
    assert.ok(typeof data.tool_output.deltaBytes === "number");
    assert.ok(typeof data.tool_output.deltaGrams === "number");
    assert.ok(typeof data.tool_output.differencePct === "number");
  });

  await t.test("4. POST /api/chat executes simulate scenario with zero levers invariant", async () => {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "simulate with no levers" }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.tool_used.includes("simulate_scenario"));
    assert.ok(data.tool_output);
    assert.equal(data.tool_output.deltaBytes, 0, "Zero levers must produce exactly zero byte delta");
    assert.equal(data.tool_output.percentSaved, 0, "Zero levers must produce exactly 0% savings");
    assert.equal(data.tool_output.co2SavedGrams, 0, "Zero levers must produce exactly 0g CO2 savings");
  });

  await t.test("5. POST /api/chat executes release shield budget check", async () => {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "evaluate release shield budget" }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.tool_used.includes("evaluate_budget"));
    assert.ok(data.tool_output);
    assert.ok(data.tool_output.actualBytes > 0);
    assert.ok(typeof data.tool_output.exitCode === "number");
    assert.ok(typeof data.tool_output.passed === "boolean");
  });

  let sharedExpId = "";

  await t.test("6. POST /api/chat prepares Savings Lab experiment with 3 baseline passes", async () => {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "prepare experiment for campus-events" }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.tool_used.includes("prepare_experiment"));
    assert.ok(data.tool_output.experimentId);
    assert.ok(data.tool_output.baselineMedianBytes > 1000000);
    assert.ok(data.actionLinks && data.actionLinks.length > 0);
    sharedExpId = data.tool_output.experimentId;
  });

  await t.test("7. POST /api/chat tests candidate and asserts task preservation", async () => {
    assert.ok(sharedExpId, "Shared experiment ID must be established");

    const testRes = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "test candidate", context: { experimentId: sharedExpId } }),
    });

    assert.equal(testRes.status, 200);
    const testData = await testRes.json();
    assert.ok(testData.tool_used.includes("test_candidate"));
    assert.equal(testData.tool_output.outcome, "observed_improvement");
    assert.equal(testData.tool_output.functionalChecksPassed, true);
    assert.ok(testData.tool_output.bytesSaved > 1000000);
  });

  await t.test("8. POST /api/chat rejects broken candidate via task assertion guardrail", async () => {
    assert.ok(sharedExpId, "Shared experiment ID must be established");

    const testRes = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "test broken candidate", context: { experimentId: sharedExpId } }),
    });

    assert.equal(testRes.status, 200);
    const testData = await testRes.json();
    assert.ok(testData.tool_used.includes("test_candidate"));
    assert.equal(testData.tool_output.outcome, "functional_checks_failed");
    assert.equal(testData.tool_output.functionalChecksPassed, false);
  });
});

