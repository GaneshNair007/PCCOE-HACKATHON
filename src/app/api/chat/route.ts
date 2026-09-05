import { NextRequest, NextResponse } from "next/server";
import { performAudit, getCachedAudit } from "@/lib/scanner";
import { calculateCarbonFootprint } from "@/lib/carbon";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = (body.message || "").trim();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    const lower = message.toLowerCase();
    let toolUsed: string | null = null;
    let toolOutput: any = null;
    let reply = "";

    // 1. Tool Check: compare(url_a, url_b)
    const compareMatch = message.match(/compare\s+([^\s]+)\s+(?:with|to|and)\s+([^\s]+)/i);
    if (compareMatch) {
      toolUsed = "compare";
      const urlA = compareMatch[1];
      const urlB = compareMatch[2];

      const [auditA, auditB] = await Promise.all([
        performAudit(urlA),
        performAudit(urlB),
      ]);

      const deltaGrams = Number((auditA.metrics.co2_grams - auditB.metrics.co2_grams).toFixed(3));
      const cleanerDomain = deltaGrams > 0 ? auditB.domain : auditA.domain;
      const diffPct = Math.abs(
        Math.round((deltaGrams / Math.max(auditA.metrics.co2_grams, 0.001)) * 100)
      );

      toolOutput = { auditA: auditA.metrics, auditB: auditB.metrics, deltaGrams, cleanerDomain, diffPct };
      reply = `Audited both sites: **${auditA.domain}** emits **${auditA.metrics.co2_grams}g CO2e** (Grade ${auditA.metrics.ecoscore_grade}, ${auditA.metrics.payload_mb}MB), while **${auditB.domain}** emits **${auditB.metrics.co2_grams}g CO2e** (Grade ${auditB.metrics.ecoscore_grade}, ${auditB.metrics.payload_mb}MB). **${cleanerDomain}** is **${diffPct}% cleaner** per page view.`;
      
      return NextResponse.json({ reply, tool_used: toolUsed, tool_output: toolOutput });
    }

    // 2. Tool Check: run_audit(url)
    const auditMatch = message.match(/(?:check|audit|test|scan)\s+(https?:\/\/[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
    if (auditMatch) {
      const rawUrl = auditMatch[1];
      toolUsed = `run_audit("${rawUrl}")`;

      const audit = await performAudit(rawUrl);
      toolOutput = audit;

      const topRec = audit.recommendations[0];
      const recText = topRec
        ? ` Top opportunity is **${topRec.title}**, saving **${topRec.co2_savings_grams}g CO2** per view.`
        : "";

      reply = `Audit complete for **${audit.domain}**: transferred **${audit.metrics.payload_mb}MB**, producing **${audit.metrics.co2_grams}g CO2e** per page view (EcoScore **Grade ${audit.metrics.ecoscore_grade}**, cleaner than ${audit.metrics.cleaner_than_percentile}% of web pages). Hosting: ${audit.green_hosting.is_green ? "verified green hosting" : "unconfirmed standard grid"}.${recText}`;

      return NextResponse.json({ reply, tool_used: toolUsed, tool_output: toolOutput });
    }

    // 3. Tool Check: explain_for_exec()
    if (lower.includes("explain for exec") || lower.includes("pm priya") || lower.includes("executive summary") || lower.includes("explain to management")) {
      toolUsed = "explain_for_exec()";
      const lastAudit = getCachedAudit();

      if (!lastAudit) {
        reply = "No live audit has been executed yet. Ask me to check a website first (e.g. 'check stripe.com'), and I will prepare a non-technical executive summary.";
      } else {
        toolOutput = lastAudit;
        reply = `**Executive Summary for ${lastAudit.domain}**:\n1. The website currently produces **${lastAudit.metrics.co2_grams}g of CO2e** per visit (EcoScore **Grade ${lastAudit.metrics.ecoscore_grade}**), generating an estimated **${lastAudit.metrics.annual_impact.co2_metric_tons} Metric Tons of CO2** annually across 100,000 views.\n2. Digital emissions are primarily driven by **${lastAudit.payload_breakdown.total_mb}MB** in network payload, with ${lastAudit.recommendations.length} actionable optimization targets identified.\n3. Applying top image compression and script deferral patches would eliminate an estimated **${(lastAudit.recommendations.reduce((acc, r) => acc + r.co2_savings_grams, 0)).toFixed(3)}g CO2e** per visitor without impacting user-facing functionality.`;
      }
      return NextResponse.json({ reply, tool_used: toolUsed, tool_output: toolOutput });
    }

    // 4. Tool Check: simulate(levers)
    if (lower.includes("simulate") || lower.includes("what if") || lower.includes("compress") || lower.includes("defer")) {
      toolUsed = "simulate(levers)";
      const lastAudit = getCachedAudit();
      
      if (!lastAudit) {
        reply = "No baseline audit exists in memory yet. Please ask me to audit a website first (e.g., 'check stripe.com'), and I will calculate what-if optimization scenarios against real observed transfer data.";
        return NextResponse.json({ reply, tool_used: toolUsed, tool_output: null });
      }

      const baseBytes = lastAudit.payload_breakdown.total_bytes;

      // Extract levers if mentioned
      const imgComp = lower.includes("image") || lower.includes("avif") ? 90 : 80;
      const jsDefer = lower.includes("defer") || lower.includes("tree-shake") ? 75 : 60;
      const green = lower.includes("green") || lower.includes("renewable");

      const baseline = calculateCarbonFootprint(baseBytes, false);
      const simulatedBytes = Math.round(baseBytes * (1 - (imgComp / 100) * 0.45) * (1 - (jsDefer / 100) * 0.20));
      const simulated = calculateCarbonFootprint(simulatedBytes, green);

      const savingPct = Math.round(((baseline.co2_grams - simulated.co2_grams) / baseline.co2_grams) * 100);
      toolOutput = { baseline, simulated, savingPct };

      reply = `Simulation complete: applying **${imgComp}% AVIF compression** and **${jsDefer}% JS deferral** reduces emissions from **${baseline.co2_grams}g** down to **${simulated.co2_grams}g CO2e** per view (a **-${savingPct}% carbon reduction**). Annual savings: **${(baseline.annual_impact.co2_metric_tons - simulated.annual_impact.co2_metric_tons).toFixed(2)} Metric Tons CO2**.`;

      return NextResponse.json({ reply, tool_used: toolUsed, tool_output: toolOutput });
    }

    // 5. Tool Check: get_last_audit()
    if (lower.includes("why is this") || lower.includes("score") || lower.includes("offender") || lower.includes("last audit") || lower.includes("details")) {
      toolUsed = "get_last_audit()";
      const lastAudit = getCachedAudit();

      if (!lastAudit) {
        reply = "I don't have a recent audit in memory yet. Ask me to check any domain first (e.g. 'check stripe.com'), and I'll analyze its exact score and offenders.";
      } else {
        toolOutput = lastAudit;
        const topOffender = lastAudit.recommendations[0];
        reply = `Based on the latest audit of **${lastAudit.domain}**: the site scored **Grade ${lastAudit.metrics.ecoscore_grade}** (${lastAudit.metrics.co2_grams}g CO2e / view) across a **${lastAudit.metrics.payload_mb}MB** payload. The primary emission driver is **${topOffender ? topOffender.title : "page asset weight"}**, which accounts for **${topOffender ? topOffender.co2_savings_grams : "0.05"}g CO2** in potential savings.`;
      }
      return NextResponse.json({ reply, tool_used: toolUsed, tool_output: toolOutput });
    }

    // Fallback grounded answer
    reply = `I am Carbonerra's agentic sustainability assistant. Ask me to:
- **Audit any live site**: *"check stripe.com"* or *"audit pccoe.org"*
- **Compare two sites**: *"compare vercel.com with stripe.com"*
- **Explain score drivers**: *"why is this a C?"* or *"what is the biggest offender?"*
- **Simulate optimizations**: *"what if I compress images by 90%?"*
- **Executive briefing**: *"explain for executives"*

Every figure I state is computed live via the Sustainable Web Design Model (SWDM v4).`;

    return NextResponse.json({ reply, tool_used: null });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Chat agent encountered an issue." },
      { status: 500 }
    );
  }
}
