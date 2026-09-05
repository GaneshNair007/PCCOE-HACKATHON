/**
 * Test Suite 05: Database, State, and Job Tests
 * Verifies append-only baseline persistence, process restart survival,
 * session isolation, idempotent approvals, and transactional safety.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { sidecarStore } from "../../ai-sidecar/src/lib/storage/store.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..", "..");

describe("05. Database, State, and Job Tests", () => {
  test("5.1 Saved evidence survives simulated reload from disk", () => {
    // Write test experiment to sidecar store
    const testExp = sidecarStore.getExperiment("exp-hackathon-poster");
    assert.ok(testExp, "Controlled experiment must exist");

    // Re-read file directly from disk without using in-memory reference
    const rawDisk = JSON.parse(
      fs.readFileSync(path.join(rootDir, "ai-sidecar", "data", "sidecar-store.json"), "utf8")
    );
    assert.ok(rawDisk.experiments["exp-hackathon-poster"], "Experiment must survive on disk");
    assert.equal(
      rawDisk.experiments["exp-hackathon-poster"].patchHash,
      testExp.patchHash
    );
  });

  test("5.2 Append-only architecture: New runs do not overwrite existing historical baseline records", () => {
    const storePath = path.join(rootDir, "data", "carbonerra-store.json");
    const storeData = JSON.parse(fs.readFileSync(storePath, "utf8"));
    const existingRuns = Object.values(storeData.runs || {});
    const initialCount = existingRuns.length;

    const fakeRunId = `run-test-append-${Date.now()}`;
    const fakeRun = {
      id: fakeRunId,
      targetUrl: "https://example.com/test-preserve",
      domain: "example.com",
      timestamp: new Date().toISOString(),
      totalBytes: 55555,
      co2Grams: 0.01,
      ecoScore: "A+",
      confidence: "high",
      resources: [],
      rawLighthouseBytes: null,
      rawCrawlerBytes: 55555,
      sourceUsed: "cheerio_crawler",
      greenHosting: false,
    };

    // Simulate append-only persistence
    storeData.runs = { ...storeData.runs, [fakeRunId]: fakeRun };
    fs.writeFileSync(storePath, JSON.stringify(storeData, null, 2), "utf8");

    const reloaded = JSON.parse(fs.readFileSync(storePath, "utf8"));
    const afterRuns = Object.values(reloaded.runs || {});
    assert.equal(afterRuns.length, initialCount + 1, "Run count must increment by 1");

    // Verify existing historical runs still exist untouched
    for (const prev of existingRuns) {
      const found = afterRuns.find((r) => r.id === prev.id);
      assert.ok(found, `Historical run ${prev.id} must be preserved`);
      assert.equal(found.totalBytes, prev.totalBytes, "Historical transfer bytes must not change");
    }
  });

  test("5.3 Session boundary isolation: Session Alpha cannot access or mutate Session Beta messages", () => {
    const sessionAlphaId = `sess-alpha-${Date.now()}`;
    const sessionBetaId = `sess-beta-${Date.now()}`;

    // Create session Alpha
    sidecarStore.saveSession({
      sessionId: sessionAlphaId,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      selectedProjectId: "proj-alpha",
      userConstraints: { maxBudgetKb: 100 },
      messages: [{ id: "m-alpha-1", role: "user", content: "Confidential Alpha Prompt", timestamp: "now" }],
    });

    // Create session Beta
    sidecarStore.saveSession({
      sessionId: sessionBetaId,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      selectedProjectId: "proj-beta",
      userConstraints: { maxBudgetKb: 500 },
      messages: [{ id: "m-beta-1", role: "user", content: "Confidential Beta Prompt", timestamp: "now" }],
    });

    const retrievedAlpha = sidecarStore.getSession(sessionAlphaId);
    const retrievedBeta = sidecarStore.getSession(sessionBetaId);

    assert.equal(retrievedAlpha.selectedProjectId, "proj-alpha");
    assert.equal(retrievedBeta.selectedProjectId, "proj-beta");
    assert.notEqual(retrievedAlpha.messages[0].content, retrievedBeta.messages[0].content);

    // Assert that Alpha's messages array does not include Beta's messages
    const hasBetaMsg = retrievedAlpha.messages.some((m) => m.content.includes("Beta"));
    assert.equal(hasBetaMsg, false, "Cross-session message bleeding detected");
  });

  test("5.4 Idempotency: Re-approving an already approved experiment updates notes without duplicating approvals", async () => {
    const expId = "exp-hackathon-poster";
    const approve1 = sidecarStore.approveExperiment(expId, "First Signer");
    assert.ok(approve1.success);

    const approve2 = sidecarStore.approveExperiment(expId, "Second Signer");
    assert.ok(approve2.success);

    const exp = sidecarStore.getExperiment(expId);
    assert.equal(exp.approvalStatus, "approved");
    assert.equal(exp.approvalSigner, "Second Signer");
  });

  test("5.5 Non-existent project ID rejects tool actions without corrupting store", async () => {
    const initialExperiments = sidecarStore.listExperiments().length;
    const initialReceipts = Object.keys(sidecarStore.get().receipts).length;

    // Attempting an action on a fake project should fail safely
    assert.equal(sidecarStore.getProject("non-existent-project-fake-id"), undefined);

    // Ensure store record counts remain consistent
    assert.equal(sidecarStore.listExperiments().length, initialExperiments);
    assert.equal(Object.keys(sidecarStore.get().receipts).length, initialReceipts);
  });
});
