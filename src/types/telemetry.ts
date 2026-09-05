/**
 * Carbonerra Telemetry Domain Data Model
 * Real Data Only — No Static Guesses or Invented Numbers
 */

export type EcoScoreGrade = "A+" | "A" | "B" | "C" | "D" | "F";

export type AuditStatus =
  | "queued"
  | "running"
  | "completed"
  | "partial"
  | "failed"
  | "blocked";

export type ConfidenceLevel =
  | "high"
  | "medium"
  | "low"
  | "unavailable";

export type HostingEnergyStatus =
  | "verified_green"
  | "not_verified"
  | "unknown";

export type GridIntensitySource =
  | "provider_api"
  | "country_fallback"
  | "unknown";

export interface AuditSourceResult {
  provider: string; // e.g. "Google PageSpeed Insights v5" or "Cheerio DOM Crawler"
  status: "success" | "failed" | "unavailable";
  measuredAt: string;
  durationMs?: number;
  payloadBytes?: number;
  pageWeightBytes?: number;
  notes?: string[];
  errorMessage?: string;
}

export interface AssetBreakdown {
  htmlBytes: number | null;
  cssBytes: number | null;
  javascriptBytes: number | null;
  imageBytes: number | null;
  fontBytes: number | null;
  videoBytes: number | null;
  otherBytes: number | null;
  totalBytes: number | null;
  assetCount: number | null;
}

export interface GridContext {
  resolvedIp: string | null;
  hostingCountryCode: string | null;
  hostingCountryName: string | null;
  gridIntensityGco2ePerKwh: number | null;
  gridIntensitySource: GridIntensitySource;
  greenHostingStatus: HostingEnergyStatus;
  greenHostingProvider: string | null;
  retrievedAt: string | null;
  limitations: string[];
}

export interface CarbonEstimate {
  gramsCo2ePerVisit: number | null;
  lowerBoundGramsCo2e: number | null;
  upperBoundGramsCo2e: number | null;
  grade: EcoScoreGrade | null;
  modelVersion: string;
  uncertaintyPercent: number | null;
  assumptions: string[];
  limitations: string[];
}

export interface CarbonHotspot {
  id: string;
  category:
    | "image"
    | "javascript"
    | "css"
    | "font"
    | "video"
    | "third_party"
    | "cache"
    | "hosting"
    | "other";
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  evidence: string;
  observedBytes: number | null;
  estimatedReducibleBytes: number | null;
  estimatedCarbonSavingGrams: number | null;
  recommendation: string;
  remediationType: string;
  sourceAssetUrls?: string[];
}

export interface AuditRecord {
  id: string;
  targetUrl: string;
  normalizedUrl: string;
  normalizedHost: string;
  status: AuditStatus;
  startedAt: string;
  completedAt: string | null;
  auditVersion: string;
  sources: AuditSourceResult[];
  assetBreakdown: AssetBreakdown;
  gridContext: GridContext;
  carbonEstimate: CarbonEstimate;
  confidence: ConfidenceLevel;
  confidenceExplanation: string[];
  hotspots: CarbonHotspot[];
  warnings: string[];
  errors: string[];
}

export interface AnnualImpact {
  views_basis: number;
  co2_kg: number;
  co2_metric_tons: number;
  trees_equivalent: number;
  kwh_consumed: number;
  car_miles_equivalent: number;
}

export interface CarbonMetrics {
  bytes_transferred: number;
  payload_mb: number;
  co2_grams: number;
  total_kwh: number;
  operational_kwh: number;
  embodied_kwh: number;
  is_green_hosting: boolean;
  ecoscore_grade: EcoScoreGrade;
  cleaner_than_percentile: number;
  annual_impact: AnnualImpact;
}

export interface GreenHostingInfo {
  is_green: boolean;
  hosted_by: string;
  data_source: string;
  verified: boolean;
  confirmed: boolean;
  provider?: string | null;
}

export interface BreakdownItem {
  category: string;
  bytes: number;
  pct_of_total: number;
}

export interface RecommendationItem {
  rule_id: string;
  title: string;
  category: string;
  byte_savings: number;
  co2_savings_grams: number;
  priority: "P0" | "P1" | "P2";
}

export interface HotspotCardData {
  priority: string;
  priority_level: "danger" | "warning" | "forest";
  title: string;
  size: string;
  co2_est: string;
  desc: string;
  fix_action: string;
  cta_label: string;
}

export interface CrossValidationData {
  source1_lighthouse_bytes: number;
  source2_raw_fetch_bytes: number;
  discrepancy_pct: number;
  agreement: boolean;
}

export interface AuditResult {
  id?: string;
  status: "success" | "error";
  url: string;
  target_url: string;
  domain: string;
  methodology_version: string;
  calculated_at: string;

  // Primary Accuracy Engine fields
  total_bytes: number;
  co2_grams: number;
  range_low_g: number;
  range_high_g: number;
  confidence: "high" | "medium" | "low" | "unavailable";
  confidence_note?: string;
  confidence_explanation?: string[];
  eco_score: EcoScoreGrade;

  hosting: {
    green: boolean;
    confirmed: boolean;
    provider: string | null;
  };
  grid_intensity_source: "resolved_regional" | "country_fallback" | "global_default" | "unknown";
  grid_intensity_val: number;
  hosting_country?: string;
  hosting_country_code?: string;

  cross_validation?: CrossValidationData;
  trace_variables?: Record<string, any>;

  // Complete Domain Audit Record
  record?: AuditRecord;

  // Backward-compatible UI support fields
  metrics: CarbonMetrics;
  green_hosting: GreenHostingInfo;
  breakdown: BreakdownItem[];
  recommendations: RecommendationItem[];
  payload_breakdown: {
    total_bytes: number;
    total_mb: number;
    html_kb: number;
    image_kb: number;
    script_kb: number;
    stylesheet_kb: number;
    assets_discovered: number;
  };
  hotspots: HotspotCardData[];
  message?: string;
  code?: string;
  warnings?: string[];
  limitations?: string[];
}

export interface SimulationResult {
  status: "success" | "error";
  baseline: CarbonMetrics;
  simulated: CarbonMetrics;
  saving_pct: number;
  annual_saving_metric_tons: number;
  message?: string;
}
