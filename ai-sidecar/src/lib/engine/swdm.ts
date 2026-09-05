/**
 * Carbonerra Mission Control — Pinned SWDM v4 Deterministic Accounting Engine
 * Sustainable Web Design Model (SWDM) v4 Specification
 *
 * Explicit Principles:
 * 1. Primary observed outcome: Bytes transferred per successful tested journey.
 * 2. Secondary modeled outcome: gCO2e calculated strictly via SWDM v4 coefficients.
 * 3. Never invent confidence ranges around source factors.
 * 4. Distinct concepts:
 *    - Measurement variation (from multiple physical browser runs)
 *    - Model sensitivity (e.g. ±20% sensitivity boundary on carbon intensity)
 * 5. Scenario deltas are computed by running both baseline and scenario through
 *    the exact same model parameters and subtracting: Delta = Baseline - Scenario.
 * 6. Zero levers invariant: 0% reduction reproduces baseline bytes and emissions exactly.
 */

export interface SWDMSpecs {
  version: "SWDM-4.0";
  operationalCarbonIntensity: 442; // Global average gCO2/kWh (Ember 2023 / IEA)
  embodiedCarbonIntensity: 531; // Manufacturing/embodied amortized gCO2/kWh
  systemSegmentShares: {
    dataCenter: 0.15;
    network: 0.14;
    userDevice: 0.52;
    hardwareProduction: 0.19;
  };
  energyPerGigabyte: 0.0577; // kWh per GB (SWDM v4 standard)
}

export const SWDM_V4_CONSTANTS: SWDMSpecs = {
  version: "SWDM-4.0",
  operationalCarbonIntensity: 442,
  embodiedCarbonIntensity: 531,
  systemSegmentShares: {
    dataCenter: 0.15,
    network: 0.14,
    userDevice: 0.52,
    hardwareProduction: 0.19,
  },
  energyPerGigabyte: 0.0577,
};

export interface CarbonResult {
  bytes: number;
  kilobytes: number;
  megabytes: number;
  kwh: number;
  gCO2e: number;
  uncertaintyRange: {
    low: number; // -20% sensitivity boundary
    nominal: number;
    high: number; // +20% sensitivity boundary
    note: string;
  };
  segmentBreakdown: {
    dataCenterGco2: number;
    networkGco2: number;
    userDeviceGco2: number;
    hardwareProductionGco2: number;
  };
  provenance: {
    methodology: string;
    energyIntensityFactor: string;
    gridFactor: string;
    calculatedAt: string;
  };
}

/**
 * Computes deterministic SWDM v4 emissions for a given byte transfer.
 */
export function calculateCarbonSWDM4(
  bytes: number,
  options?: {
    gridIntensity?: number;
    greenHosting?: boolean;
    greenHostingPercentage?: number;
  }
): CarbonResult {
  const safeBytes = Math.max(0, bytes);
  const gb = safeBytes / (1024 * 1024 * 1024);
  const totalKwh = gb * SWDM_V4_CONSTANTS.energyPerGigabyte;

  const operationalGrid = options?.gridIntensity ?? SWDM_V4_CONSTANTS.operationalCarbonIntensity;
  const greenHosting = options?.greenHosting ?? false;
  const greenPercent = greenHosting ? (options?.greenHostingPercentage ?? 100) / 100 : 0;

  // Segment shares
  const dcKwh = totalKwh * SWDM_V4_CONSTANTS.systemSegmentShares.dataCenter;
  const netKwh = totalKwh * SWDM_V4_CONSTANTS.systemSegmentShares.network;
  const devKwh = totalKwh * SWDM_V4_CONSTANTS.systemSegmentShares.userDevice;
  const hwKwh = totalKwh * SWDM_V4_CONSTANTS.systemSegmentShares.hardwareProduction;

  // Green hosting adjustment applies strictly to data center operational emissions
  const dcGridEffective = operationalGrid * (1 - greenPercent);
  const dcEmissions = dcKwh * dcGridEffective;
  const netEmissions = netKwh * operationalGrid;
  const devEmissions = devKwh * operationalGrid;
  const hwEmissions = hwKwh * SWDM_V4_CONSTANTS.embodiedCarbonIntensity;

  const totalGco2e = dcEmissions + netEmissions + devEmissions + hwEmissions;

  return {
    bytes: safeBytes,
    kilobytes: Number((safeBytes / 1024).toFixed(2)),
    megabytes: Number((safeBytes / (1024 * 1024)).toFixed(4)),
    kwh: Number(totalKwh.toFixed(6)),
    gCO2e: Number(totalGco2e.toFixed(4)),
    uncertaintyRange: {
      low: Number((totalGco2e * 0.8).toFixed(4)),
      nominal: Number(totalGco2e.toFixed(4)),
      high: Number((totalGco2e * 1.2).toFixed(4)),
      note: "Standard ±20% grid & client device model sensitivity bound per SWDM v4 guidelines",
    },
    segmentBreakdown: {
      dataCenterGco2: Number(dcEmissions.toFixed(4)),
      networkGco2: Number(netEmissions.toFixed(4)),
      userDeviceGco2: Number(devEmissions.toFixed(4)),
      hardwareProductionGco2: Number(hwEmissions.toFixed(4)),
    },
    provenance: {
      methodology: "SWDM-4.0 (Sustainable Web Design Model v4)",
      energyIntensityFactor: `${SWDM_V4_CONSTANTS.energyPerGigabyte} kWh/GB`,
      gridFactor: `${operationalGrid} gCO2/kWh operational, ${SWDM_V4_CONSTANTS.embodiedCarbonIntensity} gCO2/kWh embodied`,
      calculatedAt: new Date().toISOString(),
    },
  };
}

export interface ResourceBreakdown {
  imagesBytes: number;
  scriptBytes: number;
  styleBytes: number;
  fontBytes: number;
  documentBytes: number;
  otherBytes: number;
  totalBytes: number;
}

export interface ScenarioLevers {
  imageCompressionPercent?: number; // e.g. 20 means reduce image bytes by 20%
  deferUnusedScriptsPercent?: number; // e.g. 15 means 15% reduction in initial transfer
  modernFontSubsettingPercent?: number; // e.g. 30
  greenHosting?: boolean;
}

export interface ScenarioDeltaResult {
  baselineBytes: number;
  scenarioBytes: number;
  bytesSaved: number;
  percentageSaved: number;
  baselineGco2e: number;
  scenarioGco2e: number;
  gco2eSaved: number;
  baseline: CarbonResult;
  scenario: CarbonResult;
  appliedLevers: ScenarioLevers;
  overlapWarning?: string;
}

/**
 * Computes reproducible scenario delta.
 * Invariant: If levers are empty or 0, bytesSaved == 0, gco2eSaved == 0.
 */
export function simulateScenario(
  breakdown: ResourceBreakdown,
  levers: ScenarioLevers
): ScenarioDeltaResult {
  const imgPct = Math.max(0, Math.min(95, levers.imageCompressionPercent ?? 0)) / 100;
  const scriptPct = Math.max(0, Math.min(95, levers.deferUnusedScriptsPercent ?? 0)) / 100;
  const fontPct = Math.max(0, Math.min(95, levers.modernFontSubsettingPercent ?? 0)) / 100;

  const newImgBytes = Math.round(breakdown.imagesBytes * (1 - imgPct));
  const newScriptBytes = Math.round(breakdown.scriptBytes * (1 - scriptPct));
  const newFontBytes = Math.round(breakdown.fontBytes * (1 - fontPct));

  const scenarioTotalBytes =
    newImgBytes +
    newScriptBytes +
    newFontBytes +
    breakdown.styleBytes +
    breakdown.documentBytes +
    breakdown.otherBytes;

  const baselineResult = calculateCarbonSWDM4(breakdown.totalBytes, {
    greenHosting: false,
  });

  const scenarioResult = calculateCarbonSWDM4(scenarioTotalBytes, {
    greenHosting: levers.greenHosting ?? false,
  });

  const bytesSaved = breakdown.totalBytes - scenarioTotalBytes;
  const gco2eSaved = Number((baselineResult.gCO2e - scenarioResult.gCO2e).toFixed(4));
  const percentageSaved =
    breakdown.totalBytes > 0
      ? Number(((bytesSaved / breakdown.totalBytes) * 100).toFixed(2))
      : 0;

  let overlapWarning: string | undefined;
  if (imgPct > 0 && scriptPct > 0) {
    overlapWarning =
      "Multiple simultaneous optimizations. Real physical savings will reflect actual network waterfalls rather than purely additive linear sums.";
  }

  return {
    baselineBytes: breakdown.totalBytes,
    scenarioBytes: scenarioTotalBytes,
    bytesSaved,
    percentageSaved,
    baselineGco2e: baselineResult.gCO2e,
    scenarioGco2e: scenarioResult.gCO2e,
    gco2eSaved,
    baseline: baselineResult,
    scenario: scenarioResult,
    appliedLevers: levers,
    overlapWarning,
  };
}
