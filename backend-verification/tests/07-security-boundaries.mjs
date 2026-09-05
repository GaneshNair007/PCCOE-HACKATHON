/**
 * Test Suite 07: Security Boundaries & SSRF Defense
 * Validates SSRF blocking for private, loopback, link-local, and cloud metadata targets,
 * protocol whitelisting, path traversal defense, and secrets protection.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";

const ROOT_API = "http://127.0.0.1:3001";
const SIDECAR_API = "http://127.0.0.1:3002";

describe("07. Security Boundaries & SSRF Defense", () => {
  // 7.1 SSRF Defenses on POST /api/audit
  const prohibitedTargets = [
    { target: "http://127.0.0.1:8080", reason: "Loopback IPv4 address" },
    { target: "http://localhost:3000", reason: "Localhost alias" },
    { target: "http://169.254.169.254/latest/meta-data", reason: "AWS/GCP Cloud Metadata Service" },
    { target: "http://10.0.0.1", reason: "Private Class A RFC 1918 range" },
    { target: "http://192.168.1.1", reason: "Private Class C RFC 1918 range" },
    { target: "http://172.16.0.1", reason: "Private Class B RFC 1918 range" },
    { target: "http://0.0.0.0", reason: "Zero IP / local host broadcast" },
  ];

  for (const { target, reason } of prohibitedTargets) {
    test(`7.1 SSRF Block: ${target} (${reason})`, async () => {
      const res = await fetch(`${ROOT_API}/api/audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target }),
      });
      assert.equal(res.status, 400, "Must return HTTP 400 for prohibited SSRF address");
      const data = await res.json();
      assert.equal(data.status, "error");
      assert.equal(data.code, "SSRF_BLOCKED");
      assert.ok(data.message.includes("Private, internal, loopback, or metadata"));
    });
  }

  // 7.2 Non-HTTP Protocol Rejection
  test("7.2 Non-HTTP protocol (file://) is strictly rejected", async () => {
    const res = await fetch(`${ROOT_API}/api/audit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "file:///etc/passwd" }),
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.status, "error");
    assert.equal(data.code, "INVALID_URL");
  });

  test("7.3 Non-HTTP protocol (ftp://) is strictly rejected", async () => {
    const res = await fetch(`${ROOT_API}/api/audit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "ftp://ftp.example.com" }),
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.status, "error");
  });

  // 7.4 Path Traversal Defense
  test("7.4 Path traversal on experiment ID returns sanitized 404 without leaking filesystem", async () => {
    const res = await fetch(`${ROOT_API}/api/experiments/..%2F..%2Fetc%2Fpasswd/receipt`);
    assert.ok(res.status >= 400, "Must return 4xx for traversal attempt");
    const data = await res.json().catch(() => ({}));
    assert.ok(!JSON.stringify(data).includes("root:x:0:0"), "Must not leak system files");
  });

  // 7.5 Secret Leakage Defense
  test("7.5 Public status and methodology endpoints contain no API keys or tokens", async () => {
    const endpoints = [
      `${ROOT_API}/api/health`,
      `${ROOT_API}/api/methodology`,
      `${ROOT_API}/api/projects`,
      `${SIDECAR_API}/api/companion/status`,
    ];

    for (const url of endpoints) {
      const res = await fetch(url);
      const text = await res.text();
      assert.doesNotMatch(text, /gsk_[a-zA-Z0-9]{20,}/, `URL ${url} must not leak Groq keys`);
      assert.doesNotMatch(text, /AIza[a-zA-Z0-9_\-]{30,}/, `URL ${url} must not leak Google keys`);
      assert.doesNotMatch(text, /sk-[a-zA-Z0-9]{20,}/, `URL ${url} must not leak OpenAI/Anthropic keys`);
      assert.doesNotMatch(text, /password/i, `URL ${url} must not contain password fields`);
    }
  });
});
