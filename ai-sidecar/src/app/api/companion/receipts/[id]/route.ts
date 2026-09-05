import { NextRequest, NextResponse } from "next/server";
import { sidecarStore } from "@/lib/storage/store";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const receiptId = params.id;
  const format = req.nextUrl.searchParams.get("format") || "json";

  const store = sidecarStore.get();
  const receipt = store.receipts[receiptId] || Object.values(store.receipts)[0];

  if (!receipt) {
    return NextResponse.json(
      { error: `Receipt '${receiptId}' not found. Verification must be run first.` },
      { status: 404 }
    );
  }

  if (format === "html") {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Carbonerra Evidence Receipt — ${receipt.receiptId}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #06150e; color: #f6f8f0; padding: 40px; margin: 0; }
    .container { max-width: 800px; margin: 0 auto; background: #0a2217; border: 1px solid #1b5239; border-radius: 12px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    h1 { color: #a3e635; margin-top: 0; font-size: 24px; border-bottom: 1px solid #1b5239; padding-bottom: 16px; }
    .badge { display: inline-block; background: #133a28; color: #a3e635; border: 1px solid #256f4d; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0; }
    .card { background: #0e2c1e; border: 1px solid #1b5239; border-radius: 8px; padding: 16px; }
    .card-title { font-size: 11px; text-transform: uppercase; color: #889980; margin-bottom: 6px; }
    .card-val { font-size: 20px; font-weight: bold; color: #f6f8f0; }
    .diff-saved { color: #a3e635; }
    .hash { font-family: monospace; font-size: 11px; background: #06150e; padding: 6px 10px; border-radius: 4px; word-break: break-all; color: #a3e635; }
    .footer { margin-top: 32px; border-top: 1px solid #1b5239; padding-top: 16px; font-size: 12px; color: #889980; }
  </style>
</head>
<body>
  <div class="container">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <span class="badge">EVIDENCE RECEIPT</span>
      <span style="font-size: 12px; color: #889980;">${receipt.timestamp}</span>
    </div>
    <h1>Carbonerra Mission Control — Physical Verification</h1>
    
    <div class="grid">
      <div class="card">
        <div class="card-title">Receipt ID</div>
        <div style="font-family: monospace; font-size: 14px;">${receipt.receiptId}</div>
      </div>
      <div class="card">
        <div class="card-title">Outcome</div>
        <div class="card-val diff-saved">${receipt.outcome.toUpperCase()}</div>
      </div>
      <div class="card">
        <div class="card-title">Transfer Delta</div>
        <div class="card-val diff-saved">-${(receipt.measurements.bytesSaved / 1024).toFixed(1)} KB (${receipt.measurements.percentSaved}%)</div>
        <div style="font-size: 12px; color: #889980; margin-top: 4px;">Baseline: ${(receipt.measurements.baselineMedianBytes / 1024).toFixed(1)} KB → Candidate: ${(receipt.measurements.candidateMedianBytes / 1024).toFixed(1)} KB</div>
      </div>
      <div class="card">
        <div class="card-title">Carbon Reduction (SWDM v4)</div>
        <div class="card-val diff-saved">-${receipt.measurements.gco2eSaved} gCO2e / journey</div>
        <div style="font-size: 12px; color: #889980; margin-top: 4px;">Baseline: ${receipt.measurements.baselineGco2e} g → Candidate: ${receipt.measurements.candidateGco2e} g</div>
      </div>
    </div>

    <div class="card" style="margin-bottom: 16px;">
      <div class="card-title">Task Assertion Guardrail</div>
      <div style="font-size: 14px; font-weight: bold; color: ${receipt.taskAssertions.functionalChecksPassed ? '#a3e635' : '#f87171'}">
        ${receipt.taskAssertions.testedJourney} — ${receipt.taskAssertions.functionalChecksPassed ? 'PASSED (HTTP 200)' : 'FAILED'}
      </div>
      <div style="font-size: 12px; color: #cbd5e1; margin-top: 4px;">${receipt.taskAssertions.details}</div>
    </div>

    <div class="card" style="margin-bottom: 16px;">
      <div class="card-title">Candidate Patch SHA-256</div>
      <div class="hash">${receipt.patchHash}</div>
      <div style="font-size: 11px; color: #889980; margin-top: 6px;">
        Approved by: ${receipt.approvalRecord.signer} at ${receipt.approvalRecord.approvedAt}
      </div>
    </div>

    <div class="footer">
      <strong>Engineering Disclaimer:</strong> ${receipt.limitations} This document constitutes reproducible local test evidence; it is not a commercial carbon offset credit.
    </div>
  </div>
</body>
</html>`;
    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  return NextResponse.json(receipt);
}
