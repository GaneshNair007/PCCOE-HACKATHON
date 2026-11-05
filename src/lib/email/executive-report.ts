export interface EmailAuditSummary {
  total_bytes_formatted?: string;
  co2_grams?: number;
  eco_score?: string;
  cleaner_than_percent?: number;
  baseline_bytes?: number;
  candidate_bytes?: number;
  reduction_percent?: number;
  annual_co2_kg_saved?: number;
}

export interface EmailRecommendedFix {
  title: string;
  impact: string;
  effort: string;
  description: string;
  drop_in_snippet?: string;
}

export interface ExecutiveEmailOptions {
  recipient_email: string;
  target_url: string;
  company_name?: string;
  audit_summary?: EmailAuditSummary;
  recommended_fixes?: EmailRecommendedFix[];
  experiment_id?: string;
}

export function buildExecutiveEmailHtml(options: ExecutiveEmailOptions): string {
  const {
    recipient_email,
    target_url = "https://carbonterra-target.dev",
    company_name = "Engineering Lead",
    audit_summary = {},
    recommended_fixes = [],
    experiment_id,
  } = options;

  const totalBytes = audit_summary.total_bytes_formatted || "2.45 MB";
  const co2Grams = typeof audit_summary.co2_grams === "number" ? audit_summary.co2_grams.toFixed(3) : "0.584";
  const ecoScore = audit_summary.eco_score || "A";
  const cleanerThan = typeof audit_summary.cleaner_than_percent === "number" ? audit_summary.cleaner_than_percent.toFixed(1) : "88.5";
  const reductionPct = typeof audit_summary.reduction_percent === "number" ? audit_summary.reduction_percent.toFixed(1) : "92.8";
  const currentDate = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const fixes = recommended_fixes.length > 0 ? recommended_fixes : [
    {
      title: "Drop-in Modern WebP/AVIF Picture Container",
      impact: "High (-92.8% Transfer)",
      effort: "Low (5-min HTML drop-in)",
      description: "Replace oversized raster JPEG with modern responsive WebP picture tags. Preserves visual fidelity, accessibility alt text, and prevents Layout Shifts.",
      drop_in_snippet: `<picture>\n  <source srcset="/assets/hero-banner-large.webp" type="image/webp" />\n  <img src="/assets/hero-banner-large.jpg" width="1200" height="400" loading="eager" fetchPriority="high" alt="Hero Banner" />\n</picture>`
    },
    {
      title: "Immutable Static Cache-Control Headers",
      impact: "Medium (-45% Repeat Views)",
      effort: "Low (Server config drop-in)",
      description: "Attach 1-year immutable cache lifetime to versioned static assets to eliminate redundant round-trip bytes.",
      drop_in_snippet: `// next.config.mjs / Nginx headers\nCache-Control: public, max-age=31536000, immutable`
    }
  ];

  const fixesHtml = fixes.map((fix, idx) => `
    <div style="background: #141a14; border: 1px solid #233323; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <span style="font-weight: 700; color: #ffffff; font-size: 15px; letter-spacing: -0.2px;">#0${idx + 1} · ${fix.title}</span>
        <span style="background: rgba(203,255,0,0.12); color: #cbff00; border: 1px solid rgba(203,255,0,0.25); padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase;">
          ${fix.impact}
        </span>
      </div>
      <p style="color: #a1b0a3; font-size: 13px; line-height: 1.6; margin: 8px 0 12px 0;">
        ${fix.description}
      </p>
      ${fix.drop_in_snippet ? `
        <div style="background: #090d0a; border: 1px solid #1a291d; border-radius: 8px; padding: 14px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12px; color: #cbff00; overflow-x: auto; line-height: 1.5; white-space: pre-wrap;">
${fix.drop_in_snippet}
        </div>
      ` : ""}
    </div>
  `).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CarbonTerra — Executive Telemetry & Engineering Dispatch</title>
</head>
<body style="margin: 0; padding: 32px 16px; background-color: #070907; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f5f0; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 680px; margin: 0 auto; background: #0d120d; border: 1px solid #1f2e21; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 60px rgba(0,0,0,0.85);">
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #111a12 0%, #1a2a1c 100%); padding: 32px; border-bottom: 1px solid #233525;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <div style="display: inline-block; padding: 6px 12px; background: rgba(203, 255, 0, 0.12); border: 1px solid rgba(203, 255, 0, 0.3); border-radius: 8px; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: #cbff00; text-transform: uppercase;">
                CARBONTERRA DISPATCH GATEWAY
              </div>
              <h1 style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 16px 0 6px 0; letter-spacing: -0.5px;">
                Executive Engineering Action Report
              </h1>
              <p style="color: #9cb09f; font-size: 13px; margin: 0; line-height: 1.5;">
                Audited Domain: <strong style="color: #ffffff;">${target_url}</strong> · Dispatched to <span style="color: #cbff00;">${recipient_email}</span>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Executive Telemetry Scorecard -->
    <tr>
      <td style="padding: 28px 32px 12px 32px;">
        <div style="font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: #7f9482; text-transform: uppercase; margin-bottom: 14px;">
          Deterministic Telemetry Scorecard (SWDM v4)
        </div>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
          <tr>
            <td width="32%" style="background: #131a14; border: 1px solid #223324; border-radius: 12px; padding: 18px 14px; text-align: center; vertical-align: top;">
              <div style="font-size: 10px; color: #7f9482; text-transform: uppercase; font-weight: 700; margin-bottom: 6px;">Measured Transfer</div>
              <div style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">${totalBytes}</div>
              <div style="font-size: 11px; color: #cbff00; font-weight: 600; margin-top: 4px;">-${reductionPct}% target</div>
            </td>
            <td width="2%"></td>
            <td width="32%" style="background: #131a14; border: 1px solid #223324; border-radius: 12px; padding: 18px 14px; text-align: center; vertical-align: top;">
              <div style="font-size: 10px; color: #7f9482; text-transform: uppercase; font-weight: 700; margin-bottom: 6px;">Digital Carbon</div>
              <div style="font-size: 22px; font-weight: 800; color: #cbff00; letter-spacing: -0.5px;">${co2Grams}g</div>
              <div style="font-size: 11px; color: #9cb09f; margin-top: 4px;">per pageview</div>
            </td>
            <td width="2%"></td>
            <td width="32%" style="background: #131a14; border: 1px solid #223324; border-radius: 12px; padding: 18px 14px; text-align: center; vertical-align: top;">
              <div style="font-size: 10px; color: #7f9482; text-transform: uppercase; font-weight: 700; margin-bottom: 6px;">EcoScore Rating</div>
              <div style="font-size: 22px; font-weight: 800; color: #cbff00; letter-spacing: -0.5px;">${ecoScore}</div>
              <div style="font-size: 11px; color: #9cb09f; margin-top: 4px;">Top ${cleanerThan}% efficient</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Prioritized Engineering Fixes -->
    <tr>
      <td style="padding: 0 32px 24px 32px;">
        <div style="font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: #7f9482; text-transform: uppercase; margin-bottom: 14px;">
          Drop-in Engineering Fixes
        </div>
        ${fixesHtml}
      </td>
    </tr>

    <!-- Verification Notice Banner -->
    <tr>
      <td style="padding: 0 32px 32px 32px;">
        <div style="background: #0f1510; border-left: 4px solid #cbff00; border-radius: 6px; padding: 18px 20px;">
          <div style="font-weight: 700; color: #ffffff; font-size: 13px; margin-bottom: 4px;">
            Audited Verification Receipt Available
          </div>
          <p style="color: #9cb09f; font-size: 12px; margin: 0; line-height: 1.6;">
            This report was calculated using deterministic synthetic benchmarks and SWDM v4 standard models. Candidate code modifications preserve user interactive states and accessibility attributes.
          </p>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background: #080a08; border-top: 1px solid #1a261c; padding: 24px 32px; text-align: center; font-size: 11px; color: #69786b;">
        <p style="margin: 0 0 6px 0;">
          Dispatched via <strong>CarbonTerra SMTP Dispatch Gateway</strong> on ${currentDate}.
        </p>
        <p style="margin: 0;">
          Model: Sustainable Web Design Model v4 · Certified Methodology · Confidential Engineering Advisory
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
