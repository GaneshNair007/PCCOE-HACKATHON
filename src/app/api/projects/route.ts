import { NextResponse } from "next/server";
import { StorageRepository } from "@/lib/storage/repository";

export async function GET() {
  const projects = StorageRepository.getProjects();
  const journeys = StorageRepository.getJourneys();
  return NextResponse.json({
    status: "success",
    projects,
    journeys,
  });
}
