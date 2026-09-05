import { NextRequest, NextResponse } from "next/server";
import { sidecarStore } from "@/lib/storage/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { experimentId, signer = "Lead Engineering Approver", patchHash } = body;

    if (!experimentId) {
      return NextResponse.json({ error: "experimentId is required." }, { status: 400 });
    }

    const exp = sidecarStore.getExperiment(experimentId);
    if (!exp) {
      return NextResponse.json({ error: `Experiment '${experimentId}' not found.` }, { status: 404 });
    }

    // Hash validation if supplied
    if (patchHash && patchHash !== exp.patchHash) {
      return NextResponse.json(
        {
          error: "Patch hash mismatch. The candidate diff has changed since review was initiated.",
          expectedHash: exp.patchHash,
          providedHash: patchHash,
        },
        { status: 409 }
      );
    }

    const result = sidecarStore.approveExperiment(experimentId, signer);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      approvalRecord: {
        experimentId,
        status: "approved",
        approvedAt: result.experiment?.approvedAt,
        signer,
        patchHash: exp.patchHash,
        targetFile: exp.targetFile,
      },
      note: "Explicit engineering approval recorded. Controlled candidate is authorized for verification testing.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Approval failure." }, { status: 500 });
  }
}
