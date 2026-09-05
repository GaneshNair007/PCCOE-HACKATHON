import { NextRequest, NextResponse } from "next/server";
import { sidecarStore } from "@/lib/storage/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      maxTransferKb = 350,
      targetVariant = "baseline",
      strict = true,
    } = body;

    const experiment = sidecarStore.getExperiment("exp-hackathon-poster");
    if (!experiment) {
      return NextResponse.json({ error: "Controlled experiment not found." }, { status: 404 });
    }

    // Determine target bytes to evaluate
    let evaluatedBytes: number;
    let variantName: string;

    if (targetVariant === "optimized") {
      evaluatedBytes = experiment.candidateVariants.optimized.encodedAssetBytes + 150000; // ~335 KB
      variantName = "Optimized Candidate (WebP Picture Element)";
    } else {
      evaluatedBytes = experiment.baselineVariant.encodedAssetBytes + 200000; // ~2,650 KB
      variantName = "Baseline (Raw JPEG)";
    }

    const evaluatedKb = Number((evaluatedBytes / 1024).toFixed(1));
    const ceilingKb = Number(maxTransferKb);
    const breach = evaluatedKb > ceilingKb;
    const deltaKb = Number((evaluatedKb - ceilingKb).toFixed(1));

    const result = {
      passed: !breach,
      status: breach ? "BREACH_DETECTED" : "PASSED_WITHIN_BUDGET",
      variant: targetVariant,
      variantName,
      metrics: {
        evaluatedTransferKb: evaluatedKb,
        budgetCeilingKb: ceilingKb,
        deltaKb: breach ? `+${deltaKb} KB` : `${deltaKb} KB`,
      },
      evaluation: {
        strictMode: strict,
        actionRequired: breach
          ? "Block release deployment. Transfer exceeds digital carbon performance ceiling."
          : "Release approved. Transfer adheres strictly to digital carbon budget.",
        checkedAt: new Date().toISOString(),
      },
    };

    return NextResponse.json(result, { status: breach && strict ? 422 : 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to evaluate budget." }, { status: 500 });
  }
}
