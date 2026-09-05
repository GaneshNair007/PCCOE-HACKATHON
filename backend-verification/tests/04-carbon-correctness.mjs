/**
 * Test Suite 04: Carbon & Audit Correctness
 * Validates SWDM v4 equations, sensitivity boundaries, zero-lever invariants,
 * non-overlapping savings, and truthful telemetry representation.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { calculateCarbonSWDM4, simulateScenario } from "../../ai-sidecar/src/lib/engine/swdm.ts";

const ROOT_API = "http://127.0.0.1:3001";

describe("04. Carbon and Audit Correctness", () => {
  test("4.1 Determinism: Identical inputs produce identical emissions down to 4 decimal places", () => {
    const bytes = 1845230;
    const run1 = calculateCarbonSWDM4(bytes, { gridIntensity: 494 });
    const run2 = calculateCarbonSWDM4(bytes, { gridIntensity: 494 });
    const run3 = calculateCarbonSWDM4(bytes, { gridIntensity: 494 });

    assert.equal(run1.gCO2e, run2.gCO2e);
    assert.equal(run2.gCO2e, run3.gCO2e);
    assert.equal(run1.uncertaintyRange.low, run2.uncertaintyRange.low);
    assert.equal(run1.uncertaintyRange.high, run2.uncertaintyRange.high);
  });

  test("4.2 Sensitivity range: ±20% sensitivity boundary is properly bounded and labeled", () => {
    const bytes = 2000000;
    const result = calculateCarbonSWDM4(bytes);

    assert.ok(result.uncertaintyRange.low < result.gCO2e, "Low bound must be lower than median estimate");
    assert.ok(result.gCO2e < result.uncertaintyRange.high, "High bound must be higher than median estimate");
    assert.ok(result.uncertaintyRange.note.includes("20%"));
  });

  test("4.3 Zero-change scenario reproduces baseline transfer and emissions exactly", async () => {
    const baseBytes = 2500000;
    const res = await fetch(`${ROOT_API}/api/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        baseline_bytes: baseBytes,
        img_comp: 0,
        js_defer: 0,
        cache_ttl: 0,
      }),
    });
    const data = await res.json();
    assert.equal(data.status, "success");
    assert.equal(data.simulated.bytes_transferred, baseBytes);
    assert.equal(data.simulated.co2_grams, data.baseline.co2_grams);
    assert.equal(data.saving_pct, 0);
  });

  test("4.4 Zero-image page receives 0 image-transfer savings when image compression is requested", async () => {
    const baseBytes = 1000000;
    const res = await fetch(`${ROOT_API}/api/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        baseline_bytes: baseBytes,
        image_bytes: 0, // Explicitly 0 image bytes
        js_bytes: 500000,
        img_comp: 50, // 50% image compression requested
        js_defer: 0,
      }),
    });
    const data = await res.json();
    assert.equal(data.status, "success");
    // With 0 image bytes, image compression cannot reduce bytes!
    assert.equal(data.simulated.bytes_transferred, baseBytes, "Zero-image page must not receive image savings");
    assert.equal(data.saving_pct, 0);
  });

  test("4.5 Parameter fidelity: 20% compression uses exactly 20% on eligible assets", () => {
    const breakdown = {
      imagesBytes: 1000000,
      scriptBytes: 500000,
      styleBytes: 100000,
      fontBytes: 50000,
      documentBytes: 20000,
      otherBytes: 10000,
      totalBytes: 1680000,
    };

    const sim20 = simulateScenario(breakdown, { imageCompressionPercent: 20 });
    const sim10 = simulateScenario(breakdown, { imageCompressionPercent: 10 });

    // 20% should save exactly double of 10% on image assets
    assert.equal(sim20.bytesSaved, 200000, "20% of 1,000,000 imagesBytes must be 200,000 bytes");
    assert.equal(sim10.bytesSaved, 100000, "10% of 1,000,000 imagesBytes must be 100,000 bytes");
    assert.equal(sim20.bytesSaved, sim10.bytesSaved * 2, "Savings must scale linearly with parameter");
  });

  test("4.6 Green hosting verification drops emissions without changing payload bytes", () => {
    const totalBytes = 2000000;
    const standard = calculateCarbonSWDM4(totalBytes, { greenHosting: false });
    const green = calculateCarbonSWDM4(totalBytes, { greenHosting: true });

    assert.equal(standard.bytes, green.bytes, "Payload bytes must remain identical");
    assert.ok(green.gCO2e < standard.gCO2e, "Green hosting must reduce co2 emissions");
  });

  test("4.7 Deferring scripts does not eliminate essential script payload", async () => {
    const baseBytes = 1000000;
    const res = await fetch(`${ROOT_API}/api/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        baseline_bytes: baseBytes,
        image_bytes: 0,
        js_bytes: 800000,
        img_comp: 0,
        js_defer: 100, // 100% script deferral
      }),
    });
    const data = await res.json();
    assert.equal(data.status, "success");
    // Even at 100% deferral, scripts still download on a full journey (capped at 15% unused code elimination)
    assert.ok(data.simulated.bytes_transferred >= 880000, "Script deferral must not eliminate downloaded code completely");
  });

  test("4.8 Non-overlapping actions cannot remove the same bytes twice", () => {
    const breakdown = {
      imagesBytes: 1000000,
      scriptBytes: 500000,
      styleBytes: 50000,
      fontBytes: 50000,
      documentBytes: 20000,
      otherBytes: 10000,
      totalBytes: 1630000,
    };

    const combinedSim = simulateScenario(breakdown, {
      imageCompressionPercent: 50,
      removeUnusedJsPercent: 30,
    });

    const imageOnly = simulateScenario(breakdown, { imageCompressionPercent: 50 });
    const jsOnly = simulateScenario(breakdown, { removeUnusedJsPercent: 30 });

    // Independent orthogonal categories: combined savings must equal sum of individual savings
    assert.equal(combinedSim.bytesSaved, imageOnly.bytesSaved + jsOnly.bytesSaved);
  });
});
