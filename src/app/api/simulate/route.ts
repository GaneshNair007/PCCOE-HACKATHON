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
    // Levers default to 0 (no-op reproduces baseline exactly)
    const imgComp = Number(body.img_comp ?? 0);
    const jsDefer = Number(body.js_defer ?? 0);
    const cacheTtl = Number(body.cache_ttl ?? 0);
    const greenHosting = body.green_hosting !== undefined ? Boolean(body.green_hosting) : Boolean(body.baseline_green ?? false);

    // If category bytes are provided, apply reductions only to eligible assets
    const observedImageBytes = Number(body.image_bytes ?? Math.round(baseBytes * 0.4));
    const observedJsBytes = Number(body.js_bytes ?? Math.round(baseBytes * 0.3));
    const otherBytes = Math.max(0, baseBytes - observedImageBytes - observedJsBytes);

    // Image compression reduces image category transfer
    const imageSavedBytes = Math.round(observedImageBytes * (imgComp / 100.0) * 0.65);
    const newImageBytes = Math.max(0, observedImageBytes - imageSavedBytes);

    // Deferring JS does not make bytes disappear on a full journey; it optimizes execution timing and eliminates unused bundles (max 15% reducible)
    const jsSavedBytes = Math.round(observedJsBytes * (jsDefer / 100.0) * 0.15);
    const newJsBytes = Math.max(0, observedJsBytes - jsSavedBytes);

    // Repeat visit caching benefit (max 20% on repeat visits)
    const cacheReductionFactor = cacheTtl > 0 ? Math.min((cacheTtl / 365.0) * 0.10, 0.10) : 0;

    const rawSimulated = newImageBytes + newJsBytes + otherBytes;
    const simulatedBytes = Math.max(1000, Math.round(rawSimulated * (1.0 - cacheReductionFactor)));

    const baselineMetrics = calculateCarbonFootprint(baseBytes, Boolean(body.baseline_green ?? false));
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
