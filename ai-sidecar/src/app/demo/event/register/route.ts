import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, variant } = body;

    // Task Assertion Guardrail Demonstration:
    // If the candidate variant is 'broken', the registration route fails with HTTP 500.
    if (variant === "broken") {
      return NextResponse.json(
        {
          error: "Internal Server Error: Registration submission failed. Ticket handler corrupted in broken candidate variant.",
          variant: "broken",
          assertionPass: false,
        },
        { status: 500 }
      );
    }

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required for registration." },
        { status: 400 }
      );
    }

    const ticketId = `PCCOE-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    return NextResponse.json({
      success: true,
      ticketId,
      name,
      email,
      variant: variant || "baseline",
      registeredAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to parse registration payload." },
      { status: 500 }
    );
  }
}
