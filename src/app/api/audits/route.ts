import { NextRequest, NextResponse } from "next/server";
import { performAudit, getAllAuditRecords } from "@/lib/scanner";
import { checkRateLimit } from "@/lib/security";

export async function GET() {
  const records = getAllAuditRecords();
  return NextResponse.json({
    status: "success",
    count: records.length,
    records,
    audits: records,
  });
}

export async function POST(req: NextRequest) {
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
      { status: 429 }
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
          message: "Please enter a valid website address.",
        },
        { status: 400 }
      );
    }

    const auditResult = await performAudit(targetUrl);
    return NextResponse.json(auditResult);
  } catch (error: any) {
    const code = error.code || "AUDIT_ERROR";
    let message = error.message || "Audit execution failed.";

    if (code === "SSRF_BLOCKED") {
      message = "Private, internal, loopback, or metadata addresses cannot be audited.";
    } else if (code === "INVALID_URL") {
      message = "The provided URL format is invalid.";
    }

    return NextResponse.json({ status: "error", code, message }, { status: 400 });
  }
}
