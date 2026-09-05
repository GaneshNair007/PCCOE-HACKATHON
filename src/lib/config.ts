/**
 * Carbonerra Centralized Methodology Configuration
 * Real-Data Policy, Model Thresholds & Scientific Assumptions
 */

export const CARBONERRA_CONFIG = {
  name: "Carbonerra Digital Sustainability Engine",
  version: "2.1.0",
  methodologyVersion: "co2js-swdmv4",
  referenceStandard: "Sustainable Web Design Model (SWDM v4)",

  // Energy & Carbon Constants
  globalDefaultGridIntensityGco2ePerKwh: 494.0, // Global average per SWDM v4 standard
  operationalKwhPerByte: 0.00000000081,
  embodiedKwhPerByte: 0.00000000043,
  totalKwhPerByte: 0.00000000124,

  // Dual-Source Cross-Validation
  sourceAgreementThresholdPct: 15.0, // Within 15% discrepancy = high confidence

  // Sensitivity Range Variance
  sensitivityVarianceFactor: 0.20, // ±20% caching & repeat-visit bounds

  // Standard Reference Annual Traffic Volume
  annualViewsReferenceBasis: 100000,

  // Carbon Grade Thresholds (Centralized & Auditable)
  gradeThresholds: [
    { grade: "A+" as const, maxGrams: 0.10, percentile: 95, label: "Exceptional" },
    { grade: "A" as const, maxGrams: 0.20, percentile: 82, label: "Excellent" },
    { grade: "B" as const, maxGrams: 0.35, percentile: 65, label: "Above Average" },
    { grade: "C" as const, maxGrams: 0.50, percentile: 45, label: "Moderate Footprint" },
    { grade: "D" as const, maxGrams: 0.75, percentile: 25, label: "High Emissions" },
    { grade: "F" as const, maxGrams: Infinity, percentile: 10, label: "Critical Refactor Required" },
  ],

  // Approved Terminology Policy (Non-negotiable)
  terminology: {
    primaryEstimateLabel: "Estimated grams CO2e per visit",
    modelDescription: "Model-based estimate",
    uncertaintyLabel: "Uncertainty range (±20%)",
    confidenceLabel: "Measurement confidence",
    disclaimer:
      "Model-based estimate. Not a direct physical sensor measurement. Results may vary with browser cache state, device efficiency, local telecom network, CDN configuration, and dynamic client-rendered assets.",
  },

  // Documented Scientific Assumptions
  standardAssumptions: [
    "Calculated using the Sustainable Web Design Model v4 (SWDM v4) reference implementation (@tgwf/co2).",
    "Separates operational datacenters/network/device electricity from embodied hardware manufacturing footprints.",
    "Applies real regional grid carbon intensity (gCO2e/kWh) from The Green Web Foundation when IP resolution succeeds.",
    "Computes uncertainty bounds (±20%) modeling fresh cold page loads versus repeat cached visits.",
  ],

  // Documented Methodological Limitations
  standardLimitations: [
    "Headless crawlers and synthetic audits cannot measure real-user cookie/cache states or personalized post-login payload.",
    "Dynamic client-rendered Single Page Applications (SPAs) may load supplementary assets asynchronously after initial DOM lifecycle.",
    "Websites protected by aggressive bot-detection (e.g. Cloudflare Turnstile, interstitial CAPTCHAs) may block external crawler probes.",
    "Third-party analytics, tracking beacons, and dynamically injected ad networks fluctuate between visits.",
  ],
} as const;
