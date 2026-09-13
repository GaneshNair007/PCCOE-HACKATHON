import { NextResponse } from "next/server";
import { storageMode, StorageRepository } from '@/lib/storage/repository';
export const dynamic = 'force-dynamic';

export async function GET() {
  let storageReady = storageMode !== 'unconfigured-serverless';
  if (storageReady) try { await StorageRepository.getProjects(); } catch { storageReady = false; }
  return NextResponse.json({
    status: storageReady ? "healthy" : "degraded",
    service: "Carbonerra Next.js Horizon X Platform",
    version: "2.0.0",
    engine: "Sustainable Web Design Model (SWDM v4)",
    methodology: "SWDM v4 + Green Web Foundation Verified API",
    runtime: "Next.js Node.js",
    storage: {mode: storageMode, ready: storageReady},
  }, {status: storageReady ? 200 : 503});
}
