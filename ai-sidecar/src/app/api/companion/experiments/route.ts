import { NextResponse } from "next/server";
import { sidecarStore } from "@/lib/storage/store";

export async function GET() {
  const experiments = sidecarStore.listExperiments();
  return NextResponse.json({
    experiments,
    count: experiments.length,
  });
}
