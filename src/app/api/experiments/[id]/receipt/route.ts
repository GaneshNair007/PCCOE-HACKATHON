import { NextRequest, NextResponse } from "next/server";
import { StorageRepository } from "@/lib/storage/repository";
import { generateImprovementReceipt } from "@/lib/receipt/receipt-generator";

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

  const verification = StorageRepository.getVerificationByExperiment(experiment.id);
  if (!verification) {
    return NextResponse.json(
      {
        status: "error",
        message: "No verification result recorded for this experiment yet.",
      },
      { status: 400 }
    );
  }

  const receipt = generateImprovementReceipt(verification, experiment);
  return NextResponse.json({
    status: "success",
    receipt,
  });
}
