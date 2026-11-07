import { NextRequest, NextResponse } from "next/server";
import { StorageRepository } from "@/lib/storage/repository";
import { runTripleVerification } from "@/lib/runner/journey-runner";
import { generateEventHeroImagePatch } from "@/lib/runner/image-patch";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json().catch(() => ({}));
    const candidateVariant =
      body.candidateVariant === "broken_candidate" ? "broken_candidate" : "candidate";

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
        reviewerDecision: "approved",
        candidateRunIds: [],
        status: "approved",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    const host = req.headers.get("x-forwarded-host") || req.nextUrl.host;
    const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
    const scheme = isLocal ? "http" : "https";
    const targetBaseUrl = `${scheme}://${host}`;

    // Execute 3x triple-run verification comparing baseline and candidate
    const verification = await runTripleVerification(
      experiment.projectId || "campus-events",
      experiment.journeyId || "event-registration",
      targetBaseUrl,
      candidateVariant,
      experiment.id
    );

    const updatedExperiment = (await StorageRepository.getExperiment(experiment.id)) || experiment;

    return NextResponse.json({
      status: "success",
      verification,
      experiment: updatedExperiment,
    });
  } catch (err: any) {
    console.error("Candidate testing error:", err);
    return NextResponse.json(
      { status: "error", message: err.message || "Candidate testing failed" },
      { status: 500 }
    );
  }
}
