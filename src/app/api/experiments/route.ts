import { NextRequest, NextResponse } from "next/server";
import { StorageRepository } from "@/lib/storage/repository";
import { executeJourneyPass } from "@/lib/runner/journey-runner";
import { generateEventHeroImagePatch } from "@/lib/runner/image-patch";
import { Experiment } from "@/lib/storage/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId") || undefined;
  const experiments = StorageRepository.listExperiments(projectId);
  return NextResponse.json({
    status: "success",
    experiments,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const projectId = body.projectId || "campus-events";
    const journeyId = body.journeyId || "event-registration";
    const targetBaseUrl =
      body.targetBaseUrl || `${req.nextUrl.protocol}//${req.nextUrl.host}`;

    const expId = `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // 1. Record 3 real baseline passes
    const baselineRuns = [];
    for (let i = 1; i <= 3; i++) {
      const bRun = await executeJourneyPass({
        projectId,
        journeyId,
        targetBaseUrl,
        variant: "baseline",
        runIndex: i,
      });
      baselineRuns.push(bRun);
    }

    // 2. Generate reviewable patch proposal
    const patch = generateEventHeroImagePatch(expId);

    // 3. Create persistent Experiment record
    const experiment: Experiment = {
      id: expId,
      projectId,
      journeyId,
      baselineRunIds: baselineRuns.map((r) => r.id),
      affectedResourceUrl: patch.resourceOriginalUrl,
      patchDiff: patch.unifiedDiff,
      reviewerDecision: "pending",
      candidateRunIds: [],
      status: "fix_proposed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    StorageRepository.saveExperiment(experiment);

    return NextResponse.json({
      status: "success",
      experiment,
      patch,
      baselineRuns,
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", message: err.message || "Failed to create experiment" },
      { status: 500 }
    );
  }
}
