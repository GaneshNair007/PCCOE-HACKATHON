import { NextRequest, NextResponse } from "next/server";
import { StorageRepository } from "@/lib/storage/repository";
import { runTripleVerification } from "@/lib/runner/journey-runner";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json().catch(() => ({}));
    const candidateVariant =
      body.candidateVariant === "broken_candidate" ? "broken_candidate" : "candidate";

    const experiment = StorageRepository.getExperiment(params.id);
    if (!experiment) {
      return NextResponse.json(
        { status: "error", message: "Experiment not found" },
        { status: 404 }
      );
    }

    const targetBaseUrl = `${req.nextUrl.protocol}//${req.nextUrl.host}`;

    // Execute 3x triple-run verification comparing baseline and candidate
    const verification = await runTripleVerification(
      experiment.projectId,
      experiment.journeyId,
      targetBaseUrl,
      candidateVariant,
      experiment.id
    );

    const updatedExperiment = StorageRepository.getExperiment(experiment.id);

    return NextResponse.json({
      status: "success",
      verification,
      experiment: updatedExperiment,
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", message: err.message || "Candidate testing failed" },
      { status: 500 }
    );
  }
}
