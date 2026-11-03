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

  // Peer-Reviewed Scientific Research Papers & Provenance
  researchPapers: [
    {
      citation: "Aslan, J., Mayers, K., Koomey, J. G., & France, C. (2018)",
      title: "Electricity Intensity of Internet Data Transmission: Untangling the Estimates",
      journal: "Journal of Industrial Ecology, 22(4), 785-798",
      keyFinding: "Established empirical data transmission baseline (~0.06 kWh/GB fixed-line/core) with ~50% energy efficiency improvement every 2 years.",
    },
    {
      citation: "Freitag, C., Berners-Lee, M., Widdicks, K., Friday, A., et al. (2021)",
      title: "The Real Climate and Transformative Impact of ICT: A Critique of Estimates, Trends, and Regulations",
      journal: "Patterns (Cell Press), 2(9), 100340",
      keyFinding: "Quantified ICT sector emissions at 2.1% to 3.9% of global greenhouse gases, demonstrating the critical weight of embodied hardware lifecycle carbon.",
    },
    {
      citation: "Preist, C., Schien, D., & Blevis, E. (2016)",
      title: "Understanding and Mitigating the Effects of Device and Cloud Service Design Decisions on Digital Media Footprints",
      journal: "Proceedings of the 2016 ACM CHI Conference on Human Factors in Computing Systems",
      keyFinding: "Established the 3-segment digital system boundary: User Devices (54%), Network Transmission (24%), and Cloud Datacenters (22%).",
    },
    {
      citation: "Masanet, E., Shehabi, A., Ramakrishnan, N., et al. (2020)",
      title: "Recalibrating Global Data Center Energy-Use Estimates",
      journal: "Science, 367(6481), 984-986",
      keyFinding: "Validated hyperscale cloud datacenter PUE trends (<1.2), isolating payload bloat over networks as primary addressable waste.",
    },
  ],

  // HTTP Archive & Web Almanac Empirical Benchmarks (2024-2025)
  httpArchiveBenchmarks: {
    medianPayloadKb: 2450,
    medianPayloadMb: 2.45,
    topDecileEcoKb: 400,
    worstDecileBloatKb: 7800,
    globalAverageGridIntensityGco2PerKwh: 494.0,
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
