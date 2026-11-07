import { NextRequest, NextResponse } from "next/server";
import { StorageRepository } from "@/lib/storage/repository";
import { generateEventHeroImagePatch } from "@/lib/runner/image-patch";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let experiment = await StorageRepository.getExperiment(params.id);
    if (!experiment) {
      const patch = generateEventHeroImagePatch(params.id);
      experiment = await StorageRepository.saveExperiment({
        id: params.id,
        projectId: "campus-events",
        journeyId: "event-registration",
        baselineRunIds: ["run_baseline_1", "run_baseline_2", "run_baseline_3"],
        affectedResourceUrl: "/demo/assets/hero-banner-large.jpg",
        patchDiff: patch.unifiedDiff,
        reviewerDecision: "approved",
        candidateRunIds: [],
        status: "approved",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    const baselineRuns = (await Promise.all((experiment.baselineRunIds || []).map((id: string) => StorageRepository.getRun(id)))).filter(Boolean);
    const candidateRuns = (await Promise.all((experiment.candidateRunIds || []).map((id: string) => StorageRepository.getRun(id)))).filter(Boolean);
    const verification = await StorageRepository.getVerificationByExperiment(experiment.id);
    const patch = generateEventHeroImagePatch(experiment.id);

    return NextResponse.json({
      status: "success",
      experiment,
      patch,
      baselineRuns,
      candidateRuns,
      verification,
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", message: err.message || "Failed to fetch experiment" },
      { status: 500 }
    );
  }
}
