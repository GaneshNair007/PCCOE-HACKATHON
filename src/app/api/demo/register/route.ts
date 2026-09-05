import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, department, variant } = body;

    // In broken candidate variant, submission fails intentionally to demonstrate functional assertion rejection
    if (variant === "broken" || body.forceFail) {
      return NextResponse.json(
        {
          status: "error",
          code: "REGISTRATION_ENDPOINT_BROKEN",
          message: "Registration endpoint failed. Form submission could not be completed.",
        },
        { status: 500 }
      );
    }

    if (!name || !email) {
      return NextResponse.json(
        {
          status: "error",
          code: "VALIDATION_FAILED",
          message: "Name and college email are required.",
        },
        { status: 400 }
      );
    }

    // Synthetic success confirmation for controlled demo
    const ticketId = `PCCOE-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    return NextResponse.json({
      status: "success",
      ticketId,
      message: "Registration confirmed for PCCOE Green Campus Hackathon 2026",
      registeredAt: new Date().toISOString(),
      participant: {
        name,
        email,
        department: department || "Computer Engineering",
      },
      disclaimer: "Synthetic local registration for Carbonerra Savings Lab controlled demo. No real PII stored.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", message: err.message || "Registration service error" },
      { status: 500 }
    );
  }
}
