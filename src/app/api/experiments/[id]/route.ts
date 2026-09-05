import { NextRequest, NextResponse } from "next/server";
import { StorageRepository } from "@/lib/storage/repository";
import { generateEventHeroImagePatch } from "@/lib/runner/image-patch";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const experiment = StorageRepository.getExperiment(params.id);
  if (!experiment) {
    return NextResponse.json(
      { status: "error", message: "Experiment not found" },
      { status: 404 }
    );
  }

  const baselineRuns = experiment.baselineRunIds
    .map((id) => StorageRepository.getRun(id))
    .filter(Boolean);
  const candidateRuns = experiment.candidateRunIds
    .map((id) => StorageRepository.getRun(id))
    .filter(Boolean);
  const verification = StorageRepository.getVerificationByExperiment(experiment.id);
  const patch = generateEventHeroImagePatch(experiment.id);

  return NextResponse.json({
    status: "success",
    experiment,
    patch,
    baselineRuns,
    candidateRuns,
    verification,
  });
}
