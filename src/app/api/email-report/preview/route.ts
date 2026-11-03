import { NextRequest, NextResponse } from "next/server";
import { buildExecutiveEmailHtml } from "@/lib/email/executive-report";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const recipient_email = searchParams.get("recipient") || "engineering-lead@company.com";
  const target_url = searchParams.get("url") || "https://stripe.com";
  const eco_score = searchParams.get("score") || "A+";
  const total_bytes_formatted = searchParams.get("bytes") || "2.45 MB";
  const co2_grams = parseFloat(searchParams.get("co2") || "0.584");
  const reduction_percent = parseFloat(searchParams.get("saving") || "92.8");

  const html = buildExecutiveEmailHtml({
    recipient_email,
    target_url,
    audit_summary: {
      total_bytes_formatted,
      co2_grams,
      eco_score,
      reduction_percent,
      cleaner_than_percent: 88.5,
    },
    recommended_fixes: [
      {
        title: "Drop-in Modern WebP/AVIF Picture Container",
        impact: "High (-92.8% Transfer)",
        effort: "Low (5-min HTML drop-in)",
        description: "Replace oversized raster JPEG with modern responsive WebP picture tags. Preserves visual fidelity, accessibility alt text, and eliminates Layout Shifts.",
        drop_in_snippet: `<picture>\n  <source srcset="/demo/assets/hero-banner-large.webp" type="image/webp" />\n  <img src="/demo/assets/hero-banner-large.jpg" width="1200" height="400" loading="eager" fetchPriority="high" alt="Hero Banner" />\n</picture>`,
      },
      {
        title: "Immutable Static Cache-Control Headers",
        impact: "Medium (-45% Repeat Views)",
        effort: "Low (Server config drop-in)",
        description: "Attach 1-year immutable cache lifetime to versioned static assets to eliminate redundant network round-trips.",
        drop_in_snippet: `// next.config.mjs / Nginx headers\nCache-Control: public, max-age=31536000, immutable`,
      },
    ],
  });

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
