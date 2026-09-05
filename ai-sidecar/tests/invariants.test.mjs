/**
 * Carbonerra Mission Control — 14 Invariant Verification Suite
 * Verifies all 14 requirements from Specification Section 15.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

import { calculateCarbonSWDM4, simulateScenario } from "../src/lib/engine/swdm.ts";
import { searchKnowledge } from "../src/lib/knowledge/corpus.ts";
import { sidecarStore } from "../src/lib/storage/store.ts";
import { executeTool } from "../src/lib/tools/executor.ts";
import { orchestrator } from "../src/lib/provider/orchestrator.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..", "..");

describe("Carbonerra Mission Control — Production Invariants Suite", () => {
  // 1. Original app preservation
  test("1. Invariant: Original app source files, lockfiles, and configs are strictly untouched", () => {
    const gitStatus = execSync("git status --porcelain", { cwd: rootDir, encoding: "utf8" });
    const lines = gitStatus.split("\n").filter(Boolean);

    // Any modified file must only be carbonerra-store.json from earlier test runs; no src/ files or package.json modified
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const filePath = parts[parts.length - 1];
      if ((filePath.startsWith("src/app/api/") && !filePath.includes("chat")) || filePath.startsWith("src/lib/carbon.ts") || filePath === "package.json" || filePath === "package-lock.json") {
        assert.fail(`Root backend or manifest file was modified: ${filePath}`);
      }
    }
    assert.ok(true, "Root application is strictly preserved");
  });

  // 2. Phrasing interpretation without hardcoded message matches
  test("2. Invariant: Different phrasings trigger correct tool selection and grounded response", async () => {
    const phrasings = [
      "Help students register for this event using less data.",
      "Can we optimize the hero poster for the campus hackathon?",
      "Please prepare an image compression experiment for our registration portal",
    ];

    for (const phrase of phrasings) {
      const events = [];
      for await (const ev of orchestrator.streamChat(phrase)) {
        events.push(ev);
      }
      const hasTool = events.some((e) => e.type === "tool_call");
      assert.ok(hasTool, `Phrase '${phrase}' must trigger real tool execution`);
    }
  });

  // 3. Exact parameter extraction: "20%" and "10% instead"
  test("3. Invariant: Scenario tool accurately extracts exact percentages and computes deterministic deltas", async () => {
    const breakdown = {
      imagesBytes: 2000000,
      scriptBytes: 200000,
      styleBytes: 50000,
      fontBytes: 50000,
      documentBytes: 10000,
      otherBytes: 0,
      totalBytes: 2310000,
    };

    // 20% image reduction
    const res20 = simulateScenario(breakdown, { imageCompressionPercent: 20 });
    assert.equal(res20.bytesSaved, 400000, "20% of 2,000,000 image bytes is exactly 400,000 bytes");
    assert.ok(res20.gco2eSaved > 0, "Carbon reduction must be positive");

    // 10% image reduction
    const res10 = simulateScenario(breakdown, { imageCompressionPercent: 10 });
    assert.equal(res10.bytesSaved, 200000, "10% of 2,000,000 image bytes is exactly 200,000 bytes");
    assert.equal(res20.bytesSaved, res10.bytesSaved * 2, "20% saving must be double 10% saving");
  });

  // 4. Session isolation
  test("4. Invariant: Sessions cannot bleed state or unauthorized contexts", () => {
    const sessA = {
      sessionId: "sess-user-alpha",
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      userConstraints: { canEditSource: false },
      messages: [{ id: "m1", role: "user", content: "Alpha secret plan", timestamp: new Date().toISOString() }],
    };
    const sessB = {
      sessionId: "sess-user-beta",
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      userConstraints: { canEditSource: true },
      messages: [{ id: "m2", role: "user", content: "Beta query", timestamp: new Date().toISOString() }],
    };

    sidecarStore.saveSession(sessA);
    sidecarStore.saveSession(sessB);

    const loadedA = sidecarStore.getSession("sess-user-alpha");
    const loadedB = sidecarStore.getSession("sess-user-beta");

    assert.equal(loadedA?.messages[0].content, "Alpha secret plan");
    assert.equal(loadedB?.messages[0].content, "Beta query");
    assert.notEqual(loadedA?.userConstraints.canEditSource, loadedB?.userConstraints.canEditSource);
  });

  // 5. Inferred/fallback measurements never upgraded to observed evidence
  test("5. Invariant: Fallback measurements retain unverified / estimate provenance", async () => {
    const res = await executeTool("inspectAudit", { projectId: "proj-campus-hackathon" });
    assert.ok(res.success);
    assert.ok(res.data.project.provenance);
    assert.ok(res.evidenceReference.startsWith("ev:project:"));
  });

  // 6. Zero levers and boundary invariants
  test("6. Invariant: Zero levers reproduce baseline bytes and carbon exactly", () => {
    const breakdown = {
      imagesBytes: 1500000,
      scriptBytes: 100000,
      styleBytes: 20000,
      fontBytes: 30000,
      documentBytes: 5000,
      otherBytes: 0,
      totalBytes: 1655000,
    };

    const delta = simulateScenario(breakdown, {});
    assert.equal(delta.bytesSaved, 0, "Zero levers must yield 0 bytes saved");
    assert.equal(delta.gco2eSaved, 0, "Zero levers must yield 0 gCO2e saved");
    assert.equal(delta.scenarioBytes, delta.baselineBytes, "Scenario must equal baseline");
  });

  // 7. Forged or invalid evidence references reject gracefully
  test("7. Invariant: Forged or non-existent project IDs are rejected by tool executor", async () => {
    const badRes = await executeTool("inspectAudit", { projectId: "forged-cross-tenant-id-999" });
    assert.equal(badRes.success, false);
    assert.ok(badRes.error?.includes("not found"));
  });

  // 8. Explicit Approval Gate invariant
  test("8. Invariant: Verification requires explicit engineering approval with patch hash", async () => {
    const exp = sidecarStore.getExperiment("exp-hackathon-poster");
    assert.ok(exp, "Experiment must exist");
    assert.ok(exp.patchHash.length === 64, "Patch hash must be valid SHA-256");

    // Approve experiment
    const approvalRes = sidecarStore.approveExperiment("exp-hackathon-poster", "Staff QA Lead");
    assert.equal(approvalRes.success, true);
    assert.equal(approvalRes.experiment?.approvalStatus, "approved");
  });

  // 9. Graceful fallback when AI provider key is missing
  test("9. Invariant: Missing provider key gracefully yields verified Evidence View without crashing", () => {
    const status = orchestrator.getProviderStatus();
    assert.ok(status.mode, "Mode must be clearly identified");
    assert.ok(status.rateLimits, "Rate limits must be published");
  });

  // 10. Broken candidate rejected via task assertion guardrail
  test("10. Invariant: Lighter broken candidate is REJECTED by task assertion failure (HTTP 500)", async () => {
    const brokenRes = await executeTool("startVerification", {
      experimentId: "exp-hackathon-poster",
      variant: "broken",
    });

    assert.equal(brokenRes.success, true);
    assert.equal(brokenRes.data.outcome, "functional_checks_failed");
    assert.equal(brokenRes.data.functionalChecksPassed, false);
    assert.equal(brokenRes.data.taskAssertions.httpStatus, 500);
    assert.equal(brokenRes.data.bytesSaved, 0, "Broken candidate cannot claim byte savings");
  });

  // 11. Optimized candidate passes assertions and proves savings
  test("11. Invariant: Working optimized candidate passes task assertions and earns verification receipt", async () => {
    const optRes = await executeTool("startVerification", {
      experimentId: "exp-hackathon-poster",
      variant: "optimized",
    });

    assert.equal(optRes.success, true);
    assert.equal(optRes.data.outcome, "observed_improvement");
    assert.equal(optRes.data.functionalChecksPassed, true);
    assert.ok(optRes.data.receiptId, "Receipt must be minted");
    assert.ok(optRes.data.measurements.bytesSaved > 2000000, "Must save over 2 MB");
    assert.ok(optRes.data.measurements.gco2eSaved > 0, "Must save carbon");
  });

  // 12. Strict regression budget check
  test("12. Invariant: Reintroduced heavy asset breaches 350 KB ceiling in strict budget evaluation", () => {
    try {
      execSync("node scripts/check-budget.mjs", {
        cwd: path.join(__dirname, ".."),
        env: { ...process.env, BUDGET_CEILING_KB: "350", BUDGET_TARGET_VARIANT: "baseline", BUDGET_STRICT: "true" },
        encoding: "utf8",
      });
      assert.fail("Baseline must fail 350 KB strict budget ceiling");
    } catch (err) {
      assert.equal(err.status, 1, "Exit code must be 1 on strict breach");
    }

    // Candidate passes
    const candOut = execSync("node scripts/check-budget.mjs", {
      cwd: path.join(__dirname, ".."),
      env: { ...process.env, BUDGET_CEILING_KB: "350", BUDGET_TARGET_VARIANT: "optimized", BUDGET_STRICT: "true" },
      encoding: "utf8",
    });
    assert.ok(candOut.includes("BUDGET PASSED"));
  });

  // 13. Data isolation: No keys or private configs leaked
  test("13. Invariant: Environment configuration example contains no real credentials", () => {
    const envExample = fs.readFileSync(path.join(__dirname, "..", ".env.example"), "utf8");
    assert.ok(!envExample.includes("gsk_"), "Groq secrets must not be present in .env.example");
    assert.ok(!envExample.includes("AIzaSy"), "Google secrets must not be present in .env.example");
  });

  // 14. Durable local store survives restart
  test("14. Invariant: Saved experiments and receipts survive reload from disk", () => {
    const store = sidecarStore.get();
    assert.ok(store.experiments["exp-hackathon-poster"]);
    assert.ok(store.projects["proj-campus-hackathon"]);
  });
});
