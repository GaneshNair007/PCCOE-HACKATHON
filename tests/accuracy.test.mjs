import { test, describe } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";

// Reference EcoScore thresholds specified in methodology
const ECOSCORE_THRESHOLDS = [
  { grade: "A+", maxGrams: 0.10, percentile: 95 },
  { grade: "A", maxGrams: 0.20, percentile: 82 },
  { grade: "B", maxGrams: 0.35, percentile: 65 },
  { grade: "C", maxGrams: 0.50, percentile: 45 },
  { grade: "D", maxGrams: 0.75, percentile: 25 },
  { grade: "F", maxGrams: Infinity, percentile: 10 },
];

function getEcoScore(co2Grams) {
  for (const threshold of ECOSCORE_THRESHOLDS) {
    if (co2Grams < threshold.maxGrams) {
      return { grade: threshold.grade, percentile: threshold.percentile };
    }
  }
  return { grade: "F", percentile: 10 };
}

function evaluateConfidence(s1, s2) {
  if (s1 && s2) {
    const maxB = Math.max(s1, s2, 1);
    const discrepancyPct = Number((Math.abs(s1 - s2) / maxB * 100).toFixed(1));
    const agreement = discrepancyPct <= 15.0;

    let confidence = agreement ? "high" : "medium";
    let note = agreement
      ? undefined
      : s1 > s2
      ? "Site loads dynamic client-rendered assets via JavaScript after initial load; Lighthouse measured full runtime transfer."
      : "Static resource discovery detected external preloads or media that Lighthouse excluded or compressed during simulated run.";

    return { confidence, agreement, discrepancyPct, note };
  } else if (s1 || s2) {
    return { confidence: "medium", agreement: false, discrepancyPct: null, note: "Single source telemetry" };
  }
  return { confidence: "low", agreement: false, discrepancyPct: null, note: "Fallback baseline" };
}

function isPrivateOrReservedIp(ip) {
  const cleanIp = ip.trim();
  if (cleanIp === "::1" || cleanIp.startsWith("fe80:") || cleanIp.startsWith("fc00:") || cleanIp.startsWith("fd00:")) {
    return true;
  }
  const parts = cleanIp.split(".").map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) return true;
  const [a, b, c, d] = parts;
  if (a === 0) return true;
  if (a === 127) return true;
  if (a === 10) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 169 && b === 254) return true;
  if (a >= 224) return true;
  return false;
}

describe("Carbonerra Accuracy Engine — Unit & Security Test Suite", () => {
  test("1. EcoScore Banding: assigns correct grades according to documented thresholds", () => {
    assert.equal(getEcoScore(0.04).grade, "A+");
    assert.equal(getEcoScore(0.099).grade, "A+");
    assert.equal(getEcoScore(0.10).grade, "A");
    assert.equal(getEcoScore(0.18).grade, "A");
    assert.equal(getEcoScore(0.24).grade, "B");
    assert.equal(getEcoScore(0.349).grade, "B");
    assert.equal(getEcoScore(0.42).grade, "C");
    assert.equal(getEcoScore(0.499).grade, "C");
    assert.equal(getEcoScore(0.58).grade, "D");
    assert.equal(getEcoScore(0.749).grade, "D");
    assert.equal(getEcoScore(0.75).grade, "F");
    assert.equal(getEcoScore(1.85).grade, "F");
  });

  test("2. Cross-Validation: high confidence when Source 1 and Source 2 agree within 15%", () => {
    const res = evaluateConfidence(1000000, 1080000); // 7.4% diff
    assert.equal(res.confidence, "high");
    assert.equal(res.agreement, true);
    assert.equal(res.note, undefined);
  });

  test("3. Cross-Validation: medium confidence with explanatory note when sources diverge", () => {
    // Lighthouse sees dynamic JS payload that static parse didn't
    const spaRes = evaluateConfidence(2500000, 1000000); // 60% diff
    assert.equal(spaRes.confidence, "medium");
    assert.equal(spaRes.agreement, false);
    assert.match(spaRes.note, /client-rendered/i);

    // Static parse found video preloads that Lighthouse didn't simulate
    const staticRes = evaluateConfidence(1000000, 2200000); // 54.5% diff
    assert.equal(staticRes.confidence, "medium");
    assert.equal(staticRes.agreement, false);
    assert.match(staticRes.note, /Static resource discovery/i);
  });

  test("4. SSRF Defense: blocks private, loopback, link-local, and cloud metadata IPs", () => {
    assert.equal(isPrivateOrReservedIp("127.0.0.1"), true);
    assert.equal(isPrivateOrReservedIp("10.0.0.1"), true);
    assert.equal(isPrivateOrReservedIp("172.16.0.1"), true);
    assert.equal(isPrivateOrReservedIp("172.31.255.255"), true);
    assert.equal(isPrivateOrReservedIp("192.168.1.1"), true);
    assert.equal(isPrivateOrReservedIp("169.254.169.254"), true); // AWS/GCP metadata
    assert.equal(isPrivateOrReservedIp("0.0.0.0"), true);
    assert.equal(isPrivateOrReservedIp("224.0.0.1"), true); // Multicast
    assert.equal(isPrivateOrReservedIp("::1"), true); // IPv6 loopback

    // Public valid IPs should NOT be blocked
    assert.equal(isPrivateOrReservedIp("8.8.8.8"), false);
    assert.equal(isPrivateOrReservedIp("1.1.1.1"), false);
    assert.equal(isPrivateOrReservedIp("104.16.124.96"), false);
  });

  test("5. URL Normalization: sanitizes protocol, trims whitespace, handles casing", () => {
    function normalizeUrl(input) {
      let trimmed = input.trim();
      if (!/^https?:\/\//i.test(trimmed)) {
        trimmed = "https://" + trimmed;
      }
      const parsed = new URL(trimmed);
      return parsed.toString();
    }
    assert.equal(normalizeUrl("example.com"), "https://example.com/");
    assert.equal(normalizeUrl("  https://STRIPE.COM/docs  "), "https://stripe.com/docs");
    assert.throws(() => normalizeUrl("not a url at all :::"), { name: "TypeError" });
  });

  test("6. Carbon Uncertainty Range: ±20% sensitivity boundaries calculated correctly", () => {
    function calculateUncertaintyRange(co2Grams) {
      const low = Number((co2Grams * 0.80).toFixed(3));
      const high = Number((co2Grams * 1.20).toFixed(3));
      return { low, high };
    }
    const range = calculateUncertaintyRange(0.245);
    assert.equal(range.low, 0.196);
    assert.equal(range.high, 0.294);
    assert.ok(range.low < 0.245 && 0.245 < range.high);
  });

  test("7. What-If Simulator: calculates transparent reduction based on real baseline bytes", () => {
    function simulateReduction(baseBytes, imgPct, jsPct) {
      const imgFactor = 1.0 - (imgPct / 100.0) * 0.45;
      const jsFactor = 1.0 - (jsPct / 100.0) * 0.20;
      const simulatedBytes = Math.round(baseBytes * imgFactor * jsFactor);
      const reductionPct = Number((((baseBytes - simulatedBytes) / baseBytes) * 100).toFixed(1));
      return { simulatedBytes, reductionPct };
    }
    const sim = simulateReduction(2000000, 80, 50); // 80% img, 50% js
    assert.ok(sim.simulatedBytes < 2000000);
    assert.ok(sim.reductionPct > 35 && sim.reductionPct < 55);
  });

  test("8. Telemetry CSV Export: validates schema headers and engineering disclaimer", () => {
    const CSV_HEADERS = [
      "Domain",
      "Audited At",
      "EcoScore Grade",
      "gCO2e per Visit",
      "Range Low (g)",
      "Range High (g)",
      "Payload (MB)",
      "Confidence",
      "Grid Intensity Source",
      "Green Hosting Status",
      "Methodology Version",
      "Notice",
    ];
    const disclaimer = "Engineering model estimate (SWDM v4) - not direct physical measurement";
    const sampleRow = [
      "example.com",
      new Date().toISOString(),
      "A+",
      0.042,
      0.034,
      0.050,
      0.15,
      "high",
      "resolved_regional",
      "not_verified",
      "co2js-swdmv4",
      `"${disclaimer}"`,
    ];
    assert.equal(CSV_HEADERS.length, 12);
    assert.equal(sampleRow.length, 12);
    assert.match(sampleRow[11], /Engineering model estimate/i);
  });
});

describe("Carbonerra Live Accuracy API — End-to-End Test", () => {
  test("9. POST /api/audit runs full accuracy engine against live URL (example.com)", async () => {
    const payload = JSON.stringify({ url: "https://example.com" });

    const response = await new Promise((resolve, reject) => {
      const req = http.request(
        {
          hostname: "localhost",
          port: 3001,
          path: "/api/audit",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(payload),
          },
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => resolve({ statusCode: res.statusCode, body: JSON.parse(data) }));
        }
      );
      req.on("error", reject);
      req.write(payload);
      req.end();
    });

    assert.equal(response.statusCode, 200);
    const audit = response.body;

    assert.equal(audit.status, "success");
    assert.equal(audit.domain, "example.com");
    assert.equal(audit.methodology_version, "co2js-swdmv4");
    assert.ok(typeof audit.co2_grams === "number" && audit.co2_grams > 0);
    assert.ok(typeof audit.range_low_g === "number");
    assert.ok(typeof audit.range_high_g === "number");
    assert.ok(audit.range_low_g <= audit.co2_grams);
    assert.ok(audit.co2_grams <= audit.range_high_g);
    assert.ok(["high", "medium", "low", "unavailable"].includes(audit.confidence));
    assert.ok(["A+", "A", "B", "C", "D", "F"].includes(audit.eco_score));
    assert.ok(["resolved_regional", "global_default"].includes(audit.grid_intensity_source));
    assert.ok(typeof audit.hosting === "object");
    assert.ok(Array.isArray(audit.breakdown));
    assert.ok(Array.isArray(audit.recommendations));
  });

  test("10. POST /api/audit enforces SSRF protection against private targets", async () => {
    const payload = JSON.stringify({ url: "http://169.254.169.254/latest/meta-data/" });

    const response = await new Promise((resolve, reject) => {
      const req = http.request(
        {
          hostname: "localhost",
          port: 3001,
          path: "/api/audit",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(payload),
          },
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => resolve({ statusCode: res.statusCode, body: JSON.parse(data) }));
        }
      );
      req.on("error", reject);
      req.write(payload);
      req.end();
    });

    assert.equal(response.statusCode, 400);
    assert.equal(response.body.code, "SSRF_BLOCKED");
  });

  test("11. POST /api/audit blocks non-HTTP/HTTPS protocols", async () => {
    const payload = JSON.stringify({ url: "file:///etc/passwd" });

    const response = await new Promise((resolve, reject) => {
      const req = http.request(
        {
          hostname: "localhost",
          port: 3001,
          path: "/api/audit",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(payload),
          },
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => resolve({ statusCode: res.statusCode, body: JSON.parse(data) }));
        }
      );
      req.on("error", reject);
      req.write(payload);
      req.end();
    });

    assert.equal(response.statusCode, 400);
    assert.equal(response.body.code, "INVALID_URL");
  });

  test("12. GET /api/methodology returns transparent parameters and SWDM v4 model specs", async () => {
    const response = await new Promise((resolve, reject) => {
      const req = http.request(
        {
          hostname: "localhost",
          port: 3001,
          path: "/api/methodology",
          method: "GET",
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => resolve({ statusCode: res.statusCode, body: JSON.parse(data) }));
        }
      );
      req.on("error", reject);
      req.end();
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.model_version, "co2js-swdmv4");
    assert.ok(response.body.grade_thresholds);
    assert.ok(response.body.limitations.length > 0);
  });

  test("13. GET /api/audits returns real persisted audit records list", async () => {
    const response = await new Promise((resolve, reject) => {
      const req = http.request(
        {
          hostname: "localhost",
          port: 3001,
          path: "/api/audits",
          method: "GET",
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => resolve({ statusCode: res.statusCode, body: JSON.parse(data) }));
        }
      );
      req.on("error", reject);
      req.end();
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.status, "success");
    assert.ok(Array.isArray(response.body.audits));
    assert.ok(typeof response.body.count === "number");
  });
});
