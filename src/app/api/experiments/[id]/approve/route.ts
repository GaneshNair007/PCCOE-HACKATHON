import { NextRequest, NextResponse } from "next/server";
import { StorageRepository } from "@/lib/storage/repository";
import { generateEventHeroImagePatch } from "@/lib/runner/image-patch";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json().catch(() => ({}));
    const decision = body.decision === "rejected" ? "rejected" : "approved";
    const reviewerNotes = body.notes || "Approved responsive image WebP optimization.";

    let experiment = await StorageRepository.getExperiment(params.id);
    if (!experiment && body.experimentData) {
      experiment = await StorageRepository.saveExperiment(body.experimentData);
    }
    if (!experiment) {
      const patch = generateEventHeroImagePatch(params.id);
      experiment = await StorageRepository.saveExperiment({
        id: params.id,
        projectId: "campus-events",
        journeyId: "event-registration",
        baselineRunIds: ["run_baseline_1", "run_baseline_2", "run_baseline_3"],
        affectedResourceUrl: "/demo/assets/hero-banner-large.jpg",
        patchDiff: patch.unifiedDiff,
        reviewerDecision: decision,
        candidateRunIds: [],
        status: decision === "approved" ? "approved" : "rejected",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    const updated = await StorageRepository.updateExperiment(experiment.id, {
      reviewerDecision: decision,
      reviewedAt: new Date().toISOString(),
      reviewerNotes,
      status: decision === "approved" ? "approved" : "rejected",
    });

    return NextResponse.json({
      status: "success",
      experiment: updated || experiment,
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", message: err.message || "Approval update failed" },
      { status: 500 }
    );
  }
}
