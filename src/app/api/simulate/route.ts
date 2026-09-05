import { NextRequest, NextResponse } from "next/server";
import { calculateCarbonFootprint } from "@/lib/carbon";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const baseBytes = Number(body.baseline_bytes);
    if (!baseBytes || isNaN(baseBytes) || baseBytes <= 0) {
      return NextResponse.json(
        {
          status: "error",
          message:
            "A positive baseline_bytes value from an observed audit is required to run a what-if simulation.",
        },
        { status: 400 }
      );
    }
    const imgComp = Number(body.img_comp ?? 85);
    const jsDefer = Number(body.js_defer ?? 60);
    const cacheTtl = Number(body.cache_ttl ?? 30);
    const greenHosting = Boolean(body.green_hosting ?? true);

    const imgFactor = 1.0 - (imgComp / 100.0) * 0.45;
    const jsFactor = 1.0 - (jsDefer / 100.0) * 0.20;
    const cacheFactor = 1.0 - Math.min(cacheTtl / 365.0, 0.15);

    const simulatedBytes = Math.round(baseBytes * imgFactor * jsFactor * cacheFactor);
    const baselineMetrics = calculateCarbonFootprint(baseBytes, false);
    const simulatedMetrics = calculateCarbonFootprint(simulatedBytes, greenHosting);

    const savingPct = Math.max(
      0,
      Number(
        (
          ((baselineMetrics.co2_grams - simulatedMetrics.co2_grams) /
            Math.max(baselineMetrics.co2_grams, 0.001)) *
          100
        ).toFixed(1)
      )
    );

    return NextResponse.json({
      status: "success",
      baseline: baselineMetrics,
      simulated: simulatedMetrics,
      saving_pct: savingPct,
      annual_saving_metric_tons: Number(
        (
          baselineMetrics.annual_impact.co2_metric_tons -
          simulatedMetrics.annual_impact.co2_metric_tons
        ).toFixed(2)
      ),
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message || "Simulation failed." },
      { status: 400 }
    );
  }
}
