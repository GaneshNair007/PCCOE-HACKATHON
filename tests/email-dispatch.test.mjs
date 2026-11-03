import test from "node:test";
import assert from "node:assert/strict";

const BASE_URL = process.env.BASE_URL || "http://localhost:3001";

async function postJson(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { status: res.status, data };
}

test("1. GET /api/email-report returns healthy gateway status and capabilities", async () => {
  const res = await fetch(`${BASE_URL}/api/email-report`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, "healthy");
  assert.ok(data.gateway.includes("SMTP Gateway"));
  assert.ok(Array.isArray(data.supported_modes));
  assert.ok(data.supported_modes.includes("live_smtp"));
});

test("2. POST /api/email-report rejects invalid or empty recipient email with HTTP 400", async () => {
  const { status, data } = await postJson("/api/email-report", {
    recipient_email: "invalid-email-no-at-sign",
    target_url: "https://stripe.com",
  });
  assert.equal(status, 400);
  assert.equal(data.status, "error");
  assert.ok(data.message.includes("valid recipient email"));
});

test("3. POST /api/email-report processes valid payload and returns preview URL", async () => {
  const { status, data } = await postJson("/api/email-report", {
    recipient_email: "cto@enterprise.com",
    target_url: "https://stripe.com",
    company_name: "Stripe Infrastructure",
    audit_summary: {
      total_bytes_formatted: "1.35 MB",
      co2_grams: 0.194,
      eco_score: "A",
      reduction_percent: 85.5,
    },
    recommended_fixes: [
      {
        title: "Modern Responsive Picture WebP Conversion",
        impact: "High (-85.5%)",
        effort: "Low",
        description: "Replace raster images with responsive WebP tags.",
        drop_in_snippet: "<picture><source srcset=\"/banner.webp\" type=\"image/webp\" /><img src=\"/banner.jpg\" /></picture>",
      },
    ],
  });

  assert.equal(status, 200);
  assert.equal(data.status, "success");
  assert.equal(data.recipient, "cto@enterprise.com");
  assert.ok(data.preview_url);
  assert.ok(data.preview_url.includes("/api/email-report/preview"));
});

test("4. GET /api/email-report/preview serves rendered executive HTML report", async () => {
  const res = await fetch(`${BASE_URL}/api/email-report/preview?recipient=cto@enterprise.com&url=https://stripe.com&score=A+&bytes=1.35%20MB`);
  assert.equal(res.status, 200);
  const contentType = res.headers.get("content-type") || "";
  assert.ok(contentType.includes("text/html"));
  const html = await res.text();
  assert.ok(html.includes("Executive Engineering Action Report"));
  assert.ok(html.includes("CARBONTERRA DISPATCH GATEWAY"));
  assert.ok(html.includes("cto@enterprise.com"));
});
