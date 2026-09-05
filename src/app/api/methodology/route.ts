import { NextResponse } from "next/server";
import { CARBONERRA_CONFIG } from "@/lib/config";

export async function GET() {
  return NextResponse.json({
    status: "success",
    model_version: CARBONERRA_CONFIG.methodologyVersion,
    grade_thresholds: CARBONERRA_CONFIG.gradeThresholds,
    global_default_grid_intensity: CARBONERRA_CONFIG.globalDefaultGridIntensityGco2ePerKwh,
    assumptions: CARBONERRA_CONFIG.standardAssumptions,
    limitations: CARBONERRA_CONFIG.standardLimitations,
    methodology: CARBONERRA_CONFIG,
  });
}
