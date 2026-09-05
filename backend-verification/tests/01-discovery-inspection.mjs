/**
 * Test Suite 01: Discovery & Architecture Inspection
 * Validates route presence, contracts, configurations, and environment variables.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..", "..");

const ROOT_API = "http://127.0.0.1:3001";
const SIDECAR_API = "http://127.0.0.1:3002";

describe("01. Discovery & Architecture Inspection", () => {
  test("1.1 Root backend service is running and exposes documented health metadata", async () => {
    const res = await fetch(`${ROOT_API}/api/health`);
    assert.equal(res.status, 200, "Health endpoint must return HTTP 200");
    const data = await res.json();
    assert.equal(data.status, "healthy");
    assert.equal(data.engine, "Sustainable Web Design Model (SWDM v4)");
    assert.ok(data.version, "Version must be present");
  });

  test("1.2 AI Sidecar companion service is running and exposes health & provider status", async () => {
    const res = await fetch(`${SIDECAR_API}/api/companion/status`);
    assert.equal(res.status, 200, "Sidecar status must return HTTP 200");
    const data = await res.json();
    assert.equal(data.status, "healthy");
    assert.equal(data.service, "Carbonerra Mission Control AI Companion");
    assert.ok(data.provider, "Provider details must be present");
    assert.equal(data.swdmVersion, "SWDM-4.0");
  });

  test("1.3 Methodology endpoint documents SWDM v4 specifications and transparent constants", async () => {
    const res = await fetch(`${ROOT_API}/api/methodology`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, "success");
    assert.ok(data.model_version.includes("swdmv4") || data.model_version.includes("SWDM"), "Must document SWDM v4 model");
    assert.ok(data.grade_thresholds, "Grade thresholds must be present");
    assert.equal(data.global_default_grid_intensity, 494);
  });

  test("1.4 Project and Journey metadata endpoint exposes seeded controlled projects", async () => {
    const res = await fetch(`${ROOT_API}/api/projects`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, "success");
    const proj = Array.isArray(data.projects)
      ? data.projects.find((p) => p.id === "campus-events")
      : data.projects["campus-events"];
    assert.ok(proj, "campus-events project must be present");

    const journey = Array.isArray(data.journeys)
      ? data.journeys.find((j) => j.id === "event-registration")
      : data.journeys["event-registration"];
    assert.ok(journey, "event-registration journey must be present");
  });

  test("1.5 Environment configuration files contain no live secrets or real credentials", () => {
    const rootEnvExample = fs.readFileSync(path.join(rootDir, ".env.example"), "utf8");
    const sidecarEnvExample = fs.readFileSync(path.join(rootDir, "ai-sidecar", ".env.example"), "utf8");

    // Ensure placeholders only
    assert.match(rootEnvExample, /PAGESPEED_API_KEY=\s*$/m);
    assert.match(rootEnvExample, /DATABASE_URL=\s*$/m);
    assert.match(sidecarEnvExample, /GROQ_API_KEY=\s*$/m);

    // Assert no high-entropy private keys or bearer tokens
    assert.doesNotMatch(rootEnvExample, /gsk_[a-zA-Z0-9]{20,}/);
    assert.doesNotMatch(sidecarEnvExample, /gsk_[a-zA-Z0-9]{20,}/);
  });

  test("1.6 File storage directories and stores exist without data corruption", () => {
    const rootStore = path.join(rootDir, "data", "carbonerra-store.json");
    const sidecarStore = path.join(rootDir, "ai-sidecar", "data", "sidecar-store.json");

    assert.ok(fs.existsSync(rootStore), "Root store must exist");
    assert.ok(fs.existsSync(sidecarStore), "Sidecar store must exist");

    const rootData = JSON.parse(fs.readFileSync(rootStore, "utf8"));
    const sidecarData = JSON.parse(fs.readFileSync(sidecarStore, "utf8"));

    assert.ok(rootData.projects, "Root store must contain projects");
    assert.ok(sidecarData.experiments, "Sidecar store must contain experiments");
  });
});
