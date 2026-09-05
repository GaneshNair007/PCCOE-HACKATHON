/**
 * Master Verification Test Runner
 * Executes all 9 backend verification test suites, collects timing and results,
 * writes test-results.json and test.log.
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testsDir = path.join(__dirname, "tests");
const logPath = path.join(__dirname, "test.log");
const resultsPath = path.join(__dirname, "test-results.json");

const testFiles = [
  { id: "01-discovery", file: "01-discovery-inspection.mjs", category: "discovery" },
  { id: "02-fixtures", file: "02-isolated-fixtures.mjs", category: "unit" },
  { id: "03-api", file: "03-api-validation.mjs", category: "integration" },
  { id: "04-carbon", file: "04-carbon-correctness.mjs", category: "unit" },
  { id: "05-state", file: "05-database-state.mjs", category: "integration" },
  { id: "06-ai", file: "06-ai-tool-calling.mjs", category: "integration" },
  { id: "07-security", file: "07-security-boundaries.mjs", category: "integration" },
  { id: "08-workflow", file: "08-complete-workflow.mjs", category: "full-workflow" },
  { id: "09-reliability", file: "09-bounded-reliability.mjs", category: "reliability" },
];

async function main() {
  console.log("================================================================================");
  console.log("CARBONERRA BACKEND RELIABILITY & VERIFICATION EXECUTION");
  console.log("================================================================================");

  let fullLog = `Execution started at ${new Date().toISOString()}\n\n`;
  const suiteResults = [];
  let totalPass = 0;
  let totalFail = 0;
  let totalDurationMs = 0;

  for (const { id, file, category } of testFiles) {
    const fullPath = path.join(testsDir, file);
    console.log(`\n▶ Running Suite [${category.toUpperCase()}]: ${file}...`);

    const start = Date.now();
    const child = spawnSync("node", ["--test", fullPath], {
      cwd: path.join(__dirname, ".."),
      encoding: "utf8",
      env: { ...process.env, NODE_ENV: "test" },
    });
    const duration = Date.now() - start;
    totalDurationMs += duration;

    const output = (child.stdout || "") + (child.stderr || "");
    fullLog += `\n--- SUITE: ${file} (Exit: ${child.status}, ${duration}ms) ---\n` + output;

    // Parse counts from tap/node:test output
    const passMatches = output.match(/✔/g) || [];
    const failMatches = output.match(/✖/g) || [];
    const passCount = passMatches.length;
    const failCount = failMatches.length + (child.status !== 0 && failMatches.length === 0 ? 1 : 0);

    totalPass += passCount;
    totalFail += failCount;

    console.log(output.trim());
    console.log(`  Result: ${child.status === 0 ? "PASSED" : "FAILED"} (${passCount} passed, ${failCount} failed, ${duration}ms)`);

    suiteResults.push({
      suiteId: id,
      file,
      category,
      exitCode: child.status,
      passed: child.status === 0,
      passCount,
      failCount,
      durationMs: duration,
    });
  }

  // Summary object
  const summary = {
    executedAt: new Date().toISOString(),
    totalDurationMs,
    counts: {
      totalTests: totalPass + totalFail,
      pass: totalPass,
      fail: totalFail,
      blocked: 0,
      notRun: 0,
    },
    byCategory: {
      discovery: suiteResults.filter((s) => s.category === "discovery").reduce((acc, s) => acc + s.passCount, 0),
      unit: suiteResults.filter((s) => s.category === "unit").reduce((acc, s) => acc + s.passCount, 0),
      integration: suiteResults.filter((s) => s.category === "integration").reduce((acc, s) => acc + s.passCount, 0),
      fullWorkflow: suiteResults.filter((s) => s.category === "full-workflow").reduce((acc, s) => acc + s.passCount, 0),
      reliability: suiteResults.filter((s) => s.category === "reliability").reduce((acc, s) => acc + s.passCount, 0),
    },
    suites: suiteResults,
  };

  fs.writeFileSync(logPath, fullLog, "utf8");
  fs.writeFileSync(resultsPath, JSON.stringify(summary, null, 2), "utf8");

  console.log("\n================================================================================");
  console.log("FINAL VERIFICATION SUMMARY:");
  console.log(`  Total Tests: ${summary.counts.totalTests}`);
  console.log(`  PASS:        ${summary.counts.pass}`);
  console.log(`  FAIL:        ${summary.counts.fail}`);
  console.log(`  BLOCKED:     ${summary.counts.blocked}`);
  console.log(`  NOT RUN:     ${summary.counts.notRun}`);
  console.log(`  Total Time:  ${(totalDurationMs / 1000).toFixed(2)}s`);
  console.log("================================================================================\n");

  if (totalFail > 0) {
    process.exitCode = 1;
  }
}

main().catch(console.error);
