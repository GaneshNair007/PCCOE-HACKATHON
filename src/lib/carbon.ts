import { CarbonMetrics, GreenHostingInfo, CarbonEstimate, GridContext, EcoScoreGrade } from "@/types/telemetry";
import { CARBONERRA_CONFIG } from "./config";
// @ts-ignore
import { co2 } from "@tgwf/co2";

export const METHODOLOGY_VERSION = CARBONERRA_CONFIG.methodologyVersion;
export const GLOBAL_DEFAULT_GRID_INTENSITY = CARBONERRA_CONFIG.globalDefaultGridIntensityGco2ePerKwh;
export const ECOSCORE_THRESHOLDS = CARBONERRA_CONFIG.gradeThresholds;

// Instantiate official Green Web Foundation SWDM v4 reference model
const swdModel = new co2({ model: "swd", version: 4 });

export function getEcoScore(co2Grams: number): { grade: EcoScoreGrade; percentile: number } {
  for (const threshold of ECOSCORE_THRESHOLDS) {
    if (co2Grams < threshold.maxGrams) {
      return { grade: threshold.grade, percentile: threshold.percentile };
    }
  }
  return { grade: "F", percentile: 10 };
}

export interface CarbonTraceResult {
  co2_grams: number;
  range_low_g: number;
  range_high_g: number;
  metrics: CarbonMetrics;
  carbonEstimate: CarbonEstimate;
  variables: Record<string, any>;
}

export function calculateCarbonTrace(
  totalBytes: number,
  isGreen: boolean = false,
  regionalGridIntensity?: number
): CarbonTraceResult {
  const intensity =
    regionalGridIntensity && regionalGridIntensity > 0
      ? regionalGridIntensity
      : GLOBAL_DEFAULT_GRID_INTENSITY;

  const traceOptions = {
    gridIntensity: {
      dataCenter: intensity,
    },
  };

  // Primary estimate using SWDM v4
  const trace = swdModel.perByteTrace(totalBytes, isGreen, traceOptions);
  const co2Grams = Number(trace.co2.toFixed(4));
  const { grade, percentile } = getEcoScore(co2Grams);

  // Sensitivity Banding: Return-visit / caching assumption shifted ±20%
  // Low estimate (-20% transfer equivalent due to high repeat caching)
  const lowBytes = Math.round(totalBytes * (1 - CARBONERRA_CONFIG.sensitivityVarianceFactor));
  const lowTrace = swdModel.perByteTrace(lowBytes, isGreen, traceOptions);
  const rangeLowG = Number(lowTrace.co2.toFixed(4));

  // High estimate (+20% transfer equivalent due to cold un-cached visitor traffic)
  const highBytes = Math.round(totalBytes * (1 + CARBONERRA_CONFIG.sensitivityVarianceFactor));
  const highTrace = swdModel.perByteTrace(highBytes, isGreen, traceOptions);
  const rangeHighG = Number(highTrace.co2.toFixed(4));

  // Annual impact projections (100,000 views/year reference basis)
  const annualViews = CARBONERRA_CONFIG.annualViewsReferenceBasis;
  const annualCo2Kg = (co2Grams * annualViews) / 1000.0;
  const annualCo2Tons = annualCo2Kg / 1000.0;
  const treesNeeded = annualCo2Kg / 21.77;
  const annualKwh = totalBytes * CARBONERRA_CONFIG.totalKwhPerByte * annualViews;
  const carMilesEquiv = annualCo2Kg / 0.404;

  const metrics: CarbonMetrics = {
    bytes_transferred: totalBytes,
    payload_mb: Number((totalBytes / (1024 * 1024)).toFixed(2)),
    co2_grams: co2Grams,
    total_kwh: totalBytes * CARBONERRA_CONFIG.totalKwhPerByte,
    operational_kwh: totalBytes * CARBONERRA_CONFIG.operationalKwhPerByte,
    embodied_kwh: totalBytes * CARBONERRA_CONFIG.embodiedKwhPerByte,
    is_green_hosting: isGreen,
    ecoscore_grade: grade,
    cleaner_than_percentile: percentile,
    annual_impact: {
      views_basis: annualViews,
      co2_kg: Number(annualCo2Kg.toFixed(1)),
      co2_metric_tons: Number(annualCo2Tons.toFixed(2)),
      trees_equivalent: Number(treesNeeded.toFixed(1)),
      kwh_consumed: Number(annualKwh.toFixed(1)),
      car_miles_equivalent: Math.round(carMilesEquiv),
    },
  };

  const carbonEstimate: CarbonEstimate = {
    gramsCo2ePerVisit: co2Grams,
    lowerBoundGramsCo2e: rangeLowG,
    upperBoundGramsCo2e: rangeHighG,
    grade,
    modelVersion: CARBONERRA_CONFIG.methodologyVersion,
    uncertaintyPercent: 20.0,
    assumptions: [...CARBONERRA_CONFIG.standardAssumptions],
    limitations: [...CARBONERRA_CONFIG.standardLimitations],
  };

  return {
    co2_grams: co2Grams,
    range_low_g: rangeLowG,
    range_high_g: rangeHighG,
    metrics,
    carbonEstimate,
    variables: trace.variables || {},
  };
}

export function calculateCarbonFootprint(
  totalBytes: number,
  isGreen: boolean = false,
  regionalGridIntensity?: number
): CarbonMetrics {
  return calculateCarbonTrace(totalBytes, isGreen, regionalGridIntensity).metrics;
}

export function calculateSavingGrams(
  byteSavings: number,
  isGreen: boolean = false,
  regionalGridIntensity?: number
): number {
  if (byteSavings <= 0) return 0;
  const intensity =
    regionalGridIntensity && regionalGridIntensity > 0
      ? regionalGridIntensity
      : GLOBAL_DEFAULT_GRID_INTENSITY;

  const trace = swdModel.perByteTrace(byteSavings, isGreen, {
    gridIntensity: { dataCenter: intensity },
  });
  return Number(trace.co2.toFixed(4));
}

export interface RegionalGridResult {
  intensity: number;
  source: "resolved_regional" | "country_fallback" | "global_default";
  country?: string;
  countryCode?: string;
  year?: number;
}

export async function checkRegionalGridIntensity(ip: string): Promise<RegionalGridResult> {
  const apiUrl = `https://api.thegreenwebfoundation.org/api/v3/ip-to-co2intensity/${encodeURIComponent(ip)}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Carbonerra-Accuracy-Engine/2.1 (sustainable-web-design)",
        Accept: "application/json",
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (typeof data.carbon_intensity === "number" && !isNaN(data.carbon_intensity)) {
        return {
          intensity: Number(data.carbon_intensity.toFixed(1)),
          source: "resolved_regional",
          country: data.country_name || "Regional Datacenter",
          countryCode: data.country_code || undefined,
          year: data.year || 2021,
        };
      }
    }
  } catch {
    // Graceful fallback on network timeout / failure
  }

  return {
    intensity: GLOBAL_DEFAULT_GRID_INTENSITY,
    source: "global_default",
    country: "Global Average",
    year: 2021,
  };
}

export async function checkGreenHosting(domain: string): Promise<GreenHostingInfo> {
  const cleanDomain = domain.split(":")[0].trim().toLowerCase();
  const apiUrl = `https://api.thegreenwebfoundation.org/api/v3/greencheck/${cleanDomain}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Carbonerra-Accuracy-Engine/2.1 (sustainable-web-design)",
        Accept: "application/json",
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const isGreen = Boolean(data.green);
      return {
        is_green: isGreen,
        hosted_by: data.hostedby || (isGreen ? "Verified Renewable Host" : "Standard Datacenter Grid"),
        data_source: "The Green Web Foundation API v3",
        verified: isGreen,
        confirmed: true,
        provider: data.hostedby || null,
      };
    }
  } catch {
    // Graceful degradation
  }

  return {
    is_green: false,
    hosted_by: "Hosting provider not yet verified as green in GWF database.",
    data_source: "The Green Web Foundation (Unconfirmed)",
    verified: false,
    confirmed: false,
    provider: null,
  };
}
