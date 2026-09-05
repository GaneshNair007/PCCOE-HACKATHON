import { NextRequest, NextResponse } from "next/server";
import { getRecentAudits } from "@/lib/scanner";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 50);

  const audits = getRecentAudits(limit);
  return NextResponse.json({
    status: "success",
    count: audits.length,
    audits,
  });
}
