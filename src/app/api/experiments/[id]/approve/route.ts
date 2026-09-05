import { NextRequest, NextResponse } from "next/server";
import { StorageRepository } from "@/lib/storage/repository";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json().catch(() => ({}));
    const decision = body.decision === "rejected" ? "rejected" : "approved";
    const reviewerNotes = body.notes || "Approved responsive image WebP optimization.";

    const experiment = StorageRepository.getExperiment(params.id);
    if (!experiment) {
      return NextResponse.json(
        { status: "error", message: "Experiment not found" },
        { status: 404 }
      );
    }

    const updated = StorageRepository.updateExperiment(experiment.id, {
      reviewerDecision: decision,
      reviewedAt: new Date().toISOString(),
      reviewerNotes,
      status: decision === "approved" ? "approved" : "rejected",
    });

    return NextResponse.json({
      status: "success",
      experiment: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", message: err.message || "Approval update failed" },
      { status: 500 }
    );
  }
}
