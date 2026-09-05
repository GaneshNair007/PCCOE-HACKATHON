import { NextRequest, NextResponse } from "next/server";
import { performAudit } from "@/lib/scanner";
import { checkRateLimit } from "@/lib/security";

export async function POST(req: NextRequest) {
  // 1. Rate Limiting per Client IP
  const clientIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  const rateCheck = checkRateLimit(clientIp);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        status: "error",
        code: "RATE_LIMITED",
        message: `Rate limit reached. Please wait ${Math.ceil(
          rateCheck.resetInMs / 1000
        )} seconds before submitting another audit.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil(rateCheck.resetInMs / 1000).toString(),
        },
      }
    );
  }

  try {
    const body = await req.json();
    const targetUrl = (body.url || "").trim();

    if (!targetUrl) {
      return NextResponse.json(
        {
          status: "error",
          code: "INVALID_URL",
          message:
            "That doesn't look like a working URL. Please enter a valid website address (e.g., https://stripe.com).",
        },
        { status: 400 }
      );
    }

    const auditResult = await performAudit(targetUrl);
    return NextResponse.json(auditResult);
  } catch (error: any) {
    const code = error.code || "AUDIT_ERROR";
    let message = error.message || "Audit execution encountered an issue.";

    // Sanitized, user-friendly security & validation error messages
    if (code === "SSRF_BLOCKED") {
      message = "Private, internal, loopback, or metadata addresses cannot be audited. Please enter a public website URL.";
    } else if (code === "INVALID_URL") {
      message = "The provided URL format is invalid. Check for typos or make sure it includes a valid domain.";
    } else if (code === "DNS_RESOLUTION_FAILED") {
      message = error.message || "Could not resolve domain name. Check for typos or verify the site is online.";
    } else if (error.name === "AbortError" || message.includes("timeout")) {
      message = "The website audit timed out. The target site may be slow to respond or experiencing high latency.";
    }

    // Log internally for debugging, never leak stack traces to client
    console.error(`[AUDIT_ERROR] Code: ${code}, Client IP: ${clientIp}, Error: ${error.message}`);

    return NextResponse.json(
      {
        status: "error",
        code,
        message,
      },
      { status: code === "RATE_LIMITED" ? 429 : 400 }
    );
  }
}
