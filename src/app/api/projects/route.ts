import { NextResponse } from "next/server";
import { StorageRepository } from "@/lib/storage/repository";
export const dynamic = 'force-dynamic';

export async function GET() {
  const projects = await StorageRepository.getProjects();
  const journeys = await StorageRepository.getJourneys();
  return NextResponse.json({
    status: "success",
    projects,
    journeys,
  });
}
