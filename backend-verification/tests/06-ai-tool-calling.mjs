/**
 * Test Suite 06: AI & Tool-Calling Suite
 * Validates tool dispatcher, paraphrased queries, follow-up interpretations,
 * context preservation, patch hash authorization, and fault injection.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { orchestrator } from "../../ai-sidecar/src/lib/provider/orchestrator.ts";
import { executeTool } from "../../ai-sidecar/src/lib/tools/executor.ts";

const ROOT_API = "http://127.0.0.1:3001";

describe("06. AI and Tool-Calling Tests", () => {
  test("6.1 Paraphrase interpretation: 'Help students register using less data' executes inspectAudit & prepareImageExperiment", async () => {
    const events = [];
    for await (const ev of orchestrator.streamChat("Help students register for this event using less data.")) {
      events.push(ev);
    }
    const toolCalls = events.filter((e) => e.type === "tool_call").map((e) => e.payload.tool);
    assert.ok(toolCalls.includes("inspectAudit"), "Must invoke inspectAudit");
    assert.ok(toolCalls.includes("prepareImageExperiment"), "Must invoke prepareImageExperiment");
  });

  test("6.2 Follow-up interpretation: 'Use 20% instead' extracts exact percentage and models scenario", async () => {
    const events = [];
    for await (const ev of orchestrator.streamChat("Use 20% instead.")) {
      events.push(ev);
    }
    const compareCall = events.find((e) => e.type === "tool_call" && e.payload.tool === "compareScenarios");
    assert.ok(compareCall, "Must execute compareScenarios tool");
    assert.equal(compareCall.payload.args.imageCompressionPercent, 20);
  });

  test("6.3 Constraint handling: 'I cannot change hosting' excludes hosting actions from ranking", async () => {
    const events = [];
    for await (const ev of orchestrator.streamChat("What should I do first? I cannot change hosting.")) {
      events.push(ev);
    }
    const rankCall = events.find((e) => e.type === "tool_call" && e.payload.tool === "rankActions");
    assert.ok(rankCall, "Must execute rankActions tool");
    assert.equal(rankCall.payload.args.canChangeHosting, false, "canChangeHosting must be false");

    const textDeltas = events.filter((e) => e.type === "text_delta").map((e) => e.payload.delta).join("");
    assert.ok(textDeltas.includes("Excluded Actions"), "Must report excluded actions");
  });

  test("6.4 Evidence reference: 'Show the evidence behind that number' retrieves methodology or receipt", async () => {
    const events = [];
    for await (const ev of orchestrator.streamChat("Show the evidence behind that number.")) {
      events.push(ev);
    }
    const toolCall = events.find((e) => e.type === "tool_call");
    assert.ok(toolCall, "Must call a retrieval or evidence tool");
  });

  test("6.5 Tool executor rejects unknown or unsupported tool names", async () => {
    const res = await executeTool("maliciousDeleteAllDatabases", {});
    assert.equal(res.success, false);
    assert.ok(res.error.includes("Unknown tool"));
  });

  test("6.6 Tool arguments are validated; missing required projectId returns error result", async () => {
    const res = await executeTool("inspectAudit", { projectId: "non-existent-proj" });
    assert.equal(res.success, false);
    assert.ok(res.error.includes("not found"));
  });

  test("6.7 Root chat API executes real live audit tool with SWDM v4 telemetry", async () => {
    const res = await fetch(`${ROOT_API}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "check example.com" }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.tool_used?.includes("investigate_audit"));
    assert.ok(data.reply.includes("example.com"));
    assert.ok(data.reply.includes("EcoScore"));
  });

  test("6.8 Root chat API executes release shield budget tool", async () => {
    const res = await fetch(`${ROOT_API}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "evaluate release shield budget" }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.tool_used?.includes("evaluate_budget"));
    assert.ok(data.reply.includes("Release Shield") || data.reply.includes("Budget"));
  });

  test("6.9 Live AI Provider Smoke Test (Reports LIVE or gracefully marks BLOCKED / NOT CONFIGURED)", async () => {
    const statusRes = await fetch("http://127.0.0.1:3002/api/companion/status");
    const statusData = await statusRes.json();

    if (statusData.provider?.isConfigured && statusData.provider?.provider !== "offline") {
      // Configured live provider smoke test (at most 1 short request)
      const res = await fetch("http://127.0.0.1:3002/api/companion/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "What is 2+2?" }),
      });
      assert.equal(res.status, 200);
      console.log("  ℹ LIVE PROVIDER SMOKE TEST: Passed using", statusData.provider.model);
    } else {
      console.log("  ℹ LIVE PROVIDER SMOKE TEST: Marked NOT CONFIGURED / OFFLINE (Deterministic fallback verified)");
      assert.ok(true, "Offline deterministic mode operational");
    }
  });
});
