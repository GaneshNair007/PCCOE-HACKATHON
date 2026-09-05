import { NextRequest, NextResponse } from "next/server";
import { evaluateBudget } from "@/lib/shield/budget-evaluator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const projectId = body.projectId || "campus-events";
    const journeyId = body.journeyId || "event-registration";
    const targetBaseUrl =
      body.targetBaseUrl || `${req.nextUrl.protocol}//${req.nextUrl.host}`;
    const variant = body.variant || "baseline";
    const customCeilingBytes = body.customCeilingBytes ? Number(body.customCeilingBytes) : undefined;
    const customMode = body.customMode || undefined;

    const evaluation = await evaluateBudget({
      projectId,
      journeyId,
      targetBaseUrl,
      variant,
      customCeilingBytes,
      customMode,
    });

    return NextResponse.json({
      status: "success",
      result: evaluation.result,
      run: evaluation.run,
      budget: evaluation.budget,
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", message: err.message || "Budget evaluation failed" },
      { status: 500 }
    );
  }
}
