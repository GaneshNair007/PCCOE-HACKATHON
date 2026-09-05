import { NextRequest, NextResponse } from "next/server";
import { sidecarStore, ProjectSnapshot } from "@/lib/storage/store";
import { calculateCarbonSWDM4 } from "@/lib/engine/swdm";

const ORIGINAL_APP_BASE = process.env.ORIGINAL_APP_BASE_URL || "http://localhost:3001";

export async function GET() {
  try {
    // Narrow read adapter to original app
    const res = await fetch(`${ORIGINAL_APP_BASE}/api/audits`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) {
      return NextResponse.json({
        available: false,
        error: `Original app returned HTTP ${res.status}`,
        target: ORIGINAL_APP_BASE,
      });
    }

    const data = await res.json();
    const audits = Array.isArray(data) ? data : data.audits || [];

    // Map each audit into snapshot format with strict provenance preservation
    const mapped = audits.map((audit: any) => ({
      id: audit.id || `audit-${audit.url}`,
      url: audit.url,
      timestamp: audit.timestamp || audit.scannedAt || new Date().toISOString(),
      rawBytes: audit.bytes || 0,
      provenanceLabel: audit.verified ? "Imported from Original App (Scanner Heuristic)" : "Unverified / Fallback Estimate",
      trustLevel: "Existing-app estimate / insufficient physical journey evidence",
    }));

    return NextResponse.json({
      available: true,
      audits: mapped,
      originalAppUrl: ORIGINAL_APP_BASE,
      note: "Records from original app are labeled as scanner estimates. Physical verification requires Sidecar Controlled Runner.",
    });
  } catch (err: any) {
    return NextResponse.json({
      available: false,
      error: `Could not reach original app at ${ORIGINAL_APP_BASE}: ${err.message}`,
      fallback: "Using sidecar controlled demo fixtures.",
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { auditId, url, rawBytes } = body;

    const totalBytes = Number(rawBytes) || 1200000;
    const breakdown = {
      imagesBytes: Math.round(totalBytes * 0.65),
      scriptBytes: Math.round(totalBytes * 0.20),
      styleBytes: Math.round(totalBytes * 0.08),
      fontBytes: Math.round(totalBytes * 0.05),
      documentBytes: Math.round(totalBytes * 0.02),
      otherBytes: 0,
      totalBytes,
    };

    const snapshot: ProjectSnapshot = {
      id: `proj-import-${Date.now()}`,
      name: `Imported: ${url || "Live Audit Target"}`,
      targetUrl: url || "http://example.com",
      source: "original-app-import",
      originalAuditId: auditId,
      capturedAt: new Date().toISOString(),
      breakdown,
      carbonEstimate: calculateCarbonSWDM4(totalBytes),
      provenance: {
        verified: false,
        note: "Imported from original app. Retained as 'Existing-app estimate / insufficient measurement evidence'.",
        collector: "Original App Read Adapter",
      },
    };

    sidecarStore.saveProject(snapshot);

    return NextResponse.json({
      success: true,
      snapshot,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to import audit record." }, { status: 500 });
  }
}
