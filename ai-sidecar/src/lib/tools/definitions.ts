/**
 * Carbonerra Mission Control — Tool Definitions
 * 8 concrete typed tools adhering strictly to specification Section 7:
 * 1. inspectAudit
 * 2. compareScenarios
 * 3. prepareImageExperiment
 * 4. startVerification
 * 5. rankActions
 * 6. retrieveKnowledge
 * 7. saveActionPlan
 * 8. getReceipt
 */

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
}

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: "inspectAudit",
    description:
      "Inspects a verified project audit snapshot or live URL breakdown. Returns measured byte coverage, resource summary (images, scripts, fonts, etc.), top eligible carbon issues, SWDM v4 assumptions, and evidence provenance. Rejects implicit latest audit.",
    parameters: {
      type: "object",
      properties: {
        projectId: {
          type: "string",
          description: "Authorized project snapshot ID (e.g. 'proj-campus-hackathon') or known target.",
        },
        resourceType: {
          type: "string",
          enum: ["all", "images", "scripts", "fonts", "css"],
          description: "Optional resource category to focus on.",
        },
      },
      required: ["projectId"],
    },
  },
  {
    name: "compareScenarios",
    description:
      "Recomputes counterfactual scenarios with the deterministic SWDM v4 engine. Applies explicit user reduction percentages (e.g. '20% image reduction' or '10% instead') or hosting changes. Labels assumptions, returns byte/gCO2e differences and overlap warnings.",
    parameters: {
      type: "object",
      properties: {
        projectId: {
          type: "string",
          description: "Baseline project snapshot ID.",
        },
        imageCompressionPercent: {
          type: "number",
          description: "Hypothetical percentage reduction in image transfer (0 to 95).",
        },
        deferUnusedScriptsPercent: {
          type: "number",
          description: "Hypothetical percentage reduction in initial script transfer (0 to 95).",
        },
        modernFontSubsettingPercent: {
          type: "number",
          description: "Hypothetical percentage reduction in font transfer (0 to 95).",
        },
        greenHosting: {
          type: "boolean",
          description: "Whether hosting is verified 100% renewable (Green Web Foundation).",
        },
      },
      required: ["projectId"],
    },
  },
  {
    name: "prepareImageExperiment",
    description:
      "Prepares a real image optimization experiment in sidecar storage. Generates candidate asset variants (e.g. WebP responsive picture element), computes actual encoded file sizes, creates previews, and outputs a reviewable git diff against the target page.",
    parameters: {
      type: "object",
      properties: {
        projectId: {
          type: "string",
          description: "Project ID to run the experiment for.",
        },
        targetAsset: {
          type: "string",
          description: "The hero image asset path to optimize (e.g. '/demo/hero-poster.jpg').",
        },
        targetFormat: {
          type: "string",
          enum: ["webp", "avif"],
          description: "Desired modern image format.",
        },
        preserveTask: {
          type: "boolean",
          description: "Must be true to preserve form inputs and user registration CTA.",
        },
      },
      required: ["projectId"],
    },
  },
  {
    name: "startVerification",
    description:
      "Executes physical comparable runs for the candidate variant in the controlled demo environment. Tests task assertions (keyboard CTA, form input, registration completion) and measures network transfer. Rejects broken candidates even if transfer is lower.",
    parameters: {
      type: "object",
      properties: {
        experimentId: {
          type: "string",
          description: "Experiment ID to verify.",
        },
        variant: {
          type: "string",
          enum: ["optimized", "broken"],
          description: "Which candidate variant to test against baseline.",
        },
      },
      required: ["experimentId"],
    },
  },
  {
    name: "rankActions",
    description:
      "Ranks feasible optimization actions using a documented multi-objective policy. Filters by user constraints (can edit source, can change hosting, budget limits) and ranks remaining actions by byte saving, evidence quality, and effort/risk.",
    parameters: {
      type: "object",
      properties: {
        projectId: {
          type: "string",
          description: "Project ID.",
        },
        canEditSource: {
          type: "boolean",
          description: "Whether the engineering team can modify source code.",
        },
        canChangeHosting: {
          type: "boolean",
          description: "Whether migrating hosting provider is feasible.",
        },
        maxBudgetKb: {
          type: "number",
          description: "Target payload ceiling in kilobytes (e.g. 350).",
        },
      },
      required: ["projectId"],
    },
  },
  {
    name: "retrieveKnowledge",
    description:
      "Searches the curated knowledge corpus for SWDM v4 methodology, Green Web Foundation hosting rules, modern image syntax, script deferral nuances, or Carbonerra platform boundaries. Returns attributable text with primary URLs and version timestamps.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search topic or question (e.g. 'SWDM v4 grid factors', 'green hosting rules', 'responsive images').",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "saveActionPlan",
    description:
      "Persists a user-approved digital sustainability action plan with priority actions, expected byte savings, and verified next steps.",
    parameters: {
      type: "object",
      properties: {
        projectId: {
          type: "string",
          description: "Project ID.",
        },
        actionIds: {
          type: "array",
          items: { type: "string" },
          description: "List of action IDs to include in the plan.",
        },
        title: {
          type: "string",
          description: "Name for the action plan.",
        },
      },
      required: ["projectId", "actionIds"],
    },
  },
  {
    name: "getReceipt",
    description:
      "Retrieves an auditable verification receipt for a completed experiment. Contains baseline & candidate median transfer, SWDM v4 delta, task assertion outcomes, approval hash, and timestamp. Never fabricates numbers.",
    parameters: {
      type: "object",
      properties: {
        experimentId: {
          type: "string",
          description: "ID of the completed experiment.",
        },
      },
      required: ["experimentId"],
    },
  },
];
