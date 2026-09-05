#!/usr/bin/env node

/**
 * Carbonerra CLI — Regression Shield Budget Evaluator
 * Runs the deterministic journey check and exits 0 on pass (or warn), or 1 on strict failure.
 */

const targetUrl = process.env.TARGET_URL || process.argv[2] || "http://127.0.0.1:3001";
const ceilingBytes = parseInt(process.env.BUDGET_CEILING_BYTES || "350000", 10);
const mode = (process.env.BUDGET_MODE || "strict").trim();
const variant = (process.env.DEMO_VARIANT || process.env.VARIANT || process.argv[3] || "baseline").trim();

console.log("==========================================");
console.log("⚡ CARBONERRA SAVINGS LAB REGRESSION SHIELD");
console.log(`Target Base URL:     ${targetUrl}`);
console.log(`Transfer Ceiling:    ${Math.round(ceilingBytes / 1024)} KB (${ceilingBytes} B)`);
console.log(`Enforcement Mode:    ${mode.toUpperCase()}`);
console.log(`Test Variant:        ${variant}`);
console.log("==========================================\n");

async function runCheck() {
  try {
    const payload = JSON.stringify({
      projectId: "campus-events",
      journeyId: "event-registration",
      targetBaseUrl: targetUrl,
      variant,
      customCeilingBytes: ceilingBytes,
      customMode: mode,
    });

    const res = await fetch(`${targetUrl}/api/shield/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
    });

    if (!res.ok) {
      console.error(`❌ HTTP ${res.status}: Failed to execute budget evaluation.`);
      process.exit(1);
    }

    const data = await res.json();
    const { result, run } = data;

    console.log(`Measured Transfer:   ${Math.round(result.actualBytes / 1024)} KB (${result.actualBytes} B)`);
    console.log(`Budget Ceiling:      ${Math.round(result.thresholdBytes / 1024)} KB`);
    console.log(`Request Count:       ${result.actualRequests} requests`);
    console.log(`Task Assertions:     ${run.assertionsPassed ? "PASSED ✅" : "FAILED ❌"}`);
    if (!run.assertionsPassed && run.assertionResults) {
      run.assertionResults.forEach((a) => console.log(`   * ${a.assertionId}: ${a.passed ? "PASS" : "FAIL"} (${a.message})`));
    }
    console.log("");

    if (result.passed && !result.isWarning) {
      console.log("✅ RESULT: PASS — Build payload within verified carbon budget.");
      process.exit(0);
    } else if (result.isWarning) {
      console.log("⚠️ RESULT: WARNING — Budget exceeded in non-blocking WARN mode:");
      result.breaches.forEach((b) => console.log(`   - ${b}`));
      process.exit(0);
    } else {
      console.error("❌ RESULT: STRICT FAILURE — Carbon budget breached:");
      result.breaches.forEach((b) => console.error(`   - ${b}`));
      process.exit(1);
    }
  } catch (err) {
    console.error("❌ Fatal execution error during budget evaluation:", err.message);
    process.exit(1);
  }
}

runCheck();
