import { NextResponse } from "next/server";
import { orchestrator } from "@/lib/provider/orchestrator";
import { sidecarStore } from "@/lib/storage/store";

export async function GET() {
  const providerStatus = orchestrator.getProviderStatus();
  const store = sidecarStore.get();

  return NextResponse.json({
    status: "healthy",
    service: "Carbonerra Mission Control AI Companion",
    port: process.env.SIDECAR_PORT || 3002,
    timestamp: new Date().toISOString(),
    provider: providerStatus,
    usage: store.providerUsage,
    knowledgeVersion: process.env.KNOWLEDGE_VERSION || "2026.1",
    swdmVersion: "SWDM-4.0",
    originalAppUrl: process.env.ORIGINAL_APP_BASE_URL || "http://localhost:3001",
  });
}
