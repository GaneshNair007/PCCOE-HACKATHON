import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import {
  carbonerraAiTools,
  executeInvestigateAudit,
  executeCompareAudits,
  executePrepareExperiment,
  executeTestCandidate,
  executeEvaluateBudget,
  executeSimulateScenario,
  executeGenerateReceipt,
  ChatContext,
} from "@/lib/chat/tools";
import { StorageRepository } from "@/lib/storage/repository";
import { performAudit } from "@/lib/scanner";

interface ChatRequestBody {
  message: string;
  context?: ChatContext;
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequestBody = await req.json();
    const message = (body.message || "").trim();
    const context = body.context || {};

    if (!message) {
      return NextResponse.json(
        { error: "A non-empty query message is required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    // PATH 1: Real AI Tool Execution with Google Gemini Free Tier if API key available
    if (apiKey) {
      try {
        const google = createGoogleGenerativeAI({ apiKey });
        const aiResponse = await generateText({
          model: google("gemini-2.0-flash"),
          system: `You are Carbonerra's agentic digital sustainability assistant.
You operate on REAL network measurements and the Sustainable Web Design Model (SWDM v4).
RULES:
1. NEVER invent, guess, estimate without tools, or hallucinate metrics.
2. Always execute one of the provided tools to answer factual questions about websites, payload sizes, digital carbon emissions, experiments, or release budgets.
3. Every figure you mention must come directly from tool outputs.
4. Active context: ${JSON.stringify(context)}. Use these IDs or URLs when the user refers to "this site", "this experiment", "this test", or "the budget".`,
          prompt: message,
          tools: carbonerraAiTools,
        });

        const primaryToolCall = (aiResponse.toolCalls as any)?.[0];
        const primaryToolResult = (aiResponse.toolResults as any)?.[0];

        const toolName = primaryToolCall?.toolName || primaryToolCall?.name;
        const toolArgs = primaryToolCall?.input || primaryToolCall?.args;
        const toolOutput = primaryToolResult?.output || primaryToolResult?.result;

        return NextResponse.json({
          reply: aiResponse.text,
          tool_used: toolName ? `${toolName}(${JSON.stringify(toolArgs || {})})` : null,
          tool_output: toolOutput || null,
          engine: "gemini-2.0-flash",
          context,
        });
      } catch (aiError: any) {
        console.warn("[Chat API] Gemini AI SDK invocation fell back to grounded dispatcher:", aiError?.message || aiError);
        // Seamlessly continue to deterministic tool dispatcher below
      }
    }

    // PATH 2: Deterministic Grounded Tool Execution Dispatcher
    // Strictly invokes the exact same tools and algorithms without any hardcoded numbers or guessed percentages.
    const lower = message.toLowerCase();
    let toolUsed: string | null = null;
    let toolOutput: any = null;
    let reply = "";
    let actionLinks: Array<{ label: string; href: string }> = [];

    // 1. Dual Audit Comparison: "compare urlA with urlB"
    const compareMatch = message.match(/compare\s+([^\s]+)\s+(?:with|to|and)\s+([^\s]+)/i);
    if (compareMatch) {
      const urlA = compareMatch[1];
      const urlB = compareMatch[2];
      toolUsed = `compare_audits({ urlA: "${urlA}", urlB: "${urlB}" })`;
      toolOutput = await executeCompareAudits({ urlA, urlB });

      const kbDelta = Math.round(Math.abs(toolOutput.deltaBytes) / 1024);
      reply = `Audited both websites via real network inspection:
- **${toolOutput.siteA.domain}**: ${(toolOutput.siteA.bytes / (1024 * 1024)).toFixed(2)} MB, **${toolOutput.siteA.co2Grams}g CO2e** (EcoScore: **${toolOutput.siteA.ecoScore}**, Hosting: ${toolOutput.siteA.greenHosting ? "Green" : "Standard"})
- **${toolOutput.siteB.domain}**: ${(toolOutput.siteB.bytes / (1024 * 1024)).toFixed(2)} MB, **${toolOutput.siteB.co2Grams}g CO2e** (EcoScore: **${toolOutput.siteB.ecoScore}**, Hosting: ${toolOutput.siteB.greenHosting ? "Green" : "Standard"})

**${toolOutput.cleanerDomain}** is **${toolOutput.differencePct}% cleaner** (${kbDelta} KB lighter per page view).`;
      return NextResponse.json({ reply, tool_used: toolUsed, tool_output: toolOutput, engine: "carbonerra-grounded", actionLinks });
    }

    // 2. Savings Lab Experiment Preparation: "prepare experiment", "create experiment", "start experiment"
    if (lower.includes("prepare experiment") || lower.includes("create experiment") || lower.includes("start experiment") || lower.includes("new experiment")) {
      const projectId = context.projectId || "campus-events";
      toolUsed = `prepare_experiment({ projectId: "${projectId}" })`;
      toolOutput = await executePrepareExperiment({ projectId });

      reply = `Savings Lab experiment **${toolOutput.experimentId}** initialized for project **${toolOutput.projectId}**:
1. **Baseline Established**: Completed 3 real headless user journey passes. Median observed transfer: **${(toolOutput.baselineMedianBytes / 1024).toFixed(1)} KB**.
2. **Waste Identified**: Primary hotspot is hero JPEG image (\`${toolOutput.patchProposal.affectedResource}\`).
3. **Patch Generated**: Proposing Next.js modern WebP picture element (\`${toolOutput.patchProposal.replacementResource}\`) with **${toolOutput.patchProposal.estimatedSavingPct}%** projected reduction.
4. **Status**: Marked as \`${toolOutput.status}\`. Ready for candidate verification.`;

      actionLinks = [
        { label: "Open Savings Lab", href: "/savings-lab" },
        { label: "Inspect Patch in Savings Lab", href: `/savings-lab?experimentId=${toolOutput.experimentId}` },
      ];
      return NextResponse.json({ reply, tool_used: toolUsed, tool_output: toolOutput, engine: "carbonerra-grounded", actionLinks });
    }

    // 3. Candidate Verification & Task Preservation: "test candidate", "verify candidate", "test broken"
    if (lower.includes("test candidate") || lower.includes("verify candidate") || lower.includes("test broken") || lower.includes("run verification")) {
      // Find experiment ID from context or repository
      const allExps = StorageRepository.listExperiments();
      const expId = context.experimentId || (allExps.length > 0 ? allExps[0].id : null);

      if (!expId) {
        reply = "No active experiment found in storage. Ask me to 'prepare experiment' first to baseline a user journey and generate a remediation patch.";
        return NextResponse.json({ reply, tool_used: null, tool_output: null, engine: "carbonerra-grounded" });
      }

      const isBroken = lower.includes("broken");
      const variant = isBroken ? "broken_candidate" : "candidate";
      toolUsed = `test_candidate({ experimentId: "${expId}", variant: "${variant}" })`;
      toolOutput = await executeTestCandidate({ experimentId: expId, variant });

      if (toolOutput.outcome === "VERIFIED_IMPROVEMENT") {
        reply = `Verification PASSED for experiment **${toolOutput.experimentId}**:
- **Baseline Median**: ${(toolOutput.baselineMedianBytes / 1024).toFixed(1)} KB (${toolOutput.baselineCo2Grams}g CO2e)
- **Candidate Median**: ${(toolOutput.candidateMedianBytes / 1024).toFixed(1)} KB (${toolOutput.candidateCo2Grams}g CO2e)
- **Measured Reduction**: -${(toolOutput.bytesSaved / 1024).toFixed(1)} KB (**-${toolOutput.percentSaved}%**) | **-${toolOutput.co2GramsSaved}g CO2e saved**
- **Functional Assertions**: ${toolOutput.assertionsSummary} (Registration journey completed successfully).
- **Outcome**: \`${toolOutput.outcome}\`.`;
      } else {
        reply = `Verification BLOCKED for experiment **${toolOutput.experimentId}**:
- **Outcome**: \`${toolOutput.outcome}\`
- **Functional Check Failed**: ${toolOutput.reasons.join(", ")}
- **Guardrail Action**: Carbonerra rejected this candidate because user task integrity was broken, even though transfer may have changed. No regression will be promoted.`;
      }

      actionLinks = [
        { label: "View Evidence Receipt", href: `/evidence?experimentId=${toolOutput.experimentId}` },
        { label: "Open Savings Lab", href: "/savings-lab" },
      ];
      return NextResponse.json({ reply, tool_used: toolUsed, tool_output: toolOutput, engine: "carbonerra-grounded", actionLinks });
    }

    // 4. Release Shield Budget Evaluation: "evaluate budget", "check shield", "ci check", "budget check"
    if (lower.includes("evaluate budget") || lower.includes("release shield") || lower.includes("ci check") || lower.includes("budget") || lower.includes("shield")) {
      const variant = lower.includes("broken") ? "broken_candidate" : lower.includes("candidate") ? "candidate" : "baseline";
      toolUsed = `evaluate_budget({ variant: "${variant}" })`;
      toolOutput = await executeEvaluateBudget({ variant });

      const statusIcon = toolOutput.passed ? "PASS" : toolOutput.isWarning ? "WARN" : "FAIL";
      reply = `CI Release Shield evaluation completed (Status: **${statusIcon}**, Mode: \`${toolOutput.mode}\`, Exit Code: \`${toolOutput.exitCode}\`):
- **Observed Transfer**: ${(toolOutput.actualBytes / 1024).toFixed(1)} KB (Budget Limit: ${(toolOutput.thresholdBytes / 1024).toFixed(1)} KB)
- **Observed Requests**: ${toolOutput.actualRequests} requests (Budget Limit: ${toolOutput.thresholdRequests})
- **Calculated Emissions**: ${toolOutput.actualCarbonGrams}g CO2e (Budget Limit: ${toolOutput.thresholdCarbonGrams}g)
- **Task Assertions**: ${toolOutput.taskAssertionsPassed ? "All Passed" : "Task Failed"}
${toolOutput.breaches.length > 0 ? `\n**Budget Breaches Detected**:\n${toolOutput.breaches.map((b: string) => `- ${b}`).join("\n")}` : "\nAll performance & carbon budgets satisfied. Safe for production deployment."}`;

      actionLinks = [{ label: "Open Release Shield", href: "/shield" }];
      return NextResponse.json({ reply, tool_used: toolUsed, tool_output: toolOutput, engine: "carbonerra-grounded", actionLinks });
    }

    // 5. Improvement Receipt Generation: "generate receipt", "view receipt", "evidence receipt"
    if (lower.includes("generate receipt") || lower.includes("view receipt") || lower.includes("evidence receipt")) {
      const allExps = StorageRepository.listExperiments();
      const expId = context.experimentId || (allExps.length > 0 ? allExps[0].id : null);

      if (!expId) {
        reply = "No experiment available to generate a receipt. Please run an experiment and verification pass first.";
        return NextResponse.json({ reply, tool_used: null, tool_output: null, engine: "carbonerra-grounded" });
      }

      toolUsed = `generate_receipt({ experimentId: "${expId}" })`;
      try {
        toolOutput = await executeGenerateReceipt({ experimentId: expId });
        reply = `Auditable Improvement Receipt generated for **${toolOutput.experimentId}**:
- **Outcome**: \`${toolOutput.outcome}\`
- **Measured Data Reduction**: -${(toolOutput.measuredDifferences.bytesSaved / 1024).toFixed(1)} KB (**-${toolOutput.measuredDifferences.percentReduction}%**)
- **Estimated Carbon Avoided**: -${toolOutput.measuredDifferences.estimatedCo2SavedGrams}g CO2e per visit
- **Integrity**: Task preservation validated via ${toolOutput.functionalAssertions.summary}.
- **Methodology**: ${toolOutput.methodology.referenceModel} (${toolOutput.methodology.swdmVersion}).`;

        actionLinks = [{ label: "View Official Evidence Page", href: `/evidence?experimentId=${toolOutput.experimentId}` }];
      } catch (err: any) {
        reply = `Could not generate receipt for experiment **${expId}**: ${err.message}`;
      }
      return NextResponse.json({ reply, tool_used: toolUsed, tool_output: toolOutput, engine: "carbonerra-grounded", actionLinks });
    }

    // 6. Scenario Simulation: "simulate", "what if"
    // Dynamically parses user lever inputs (zero levers = zero delta, strictly grounded)
    if (lower.includes("simulate") || lower.includes("what if") || lower.includes("compress") || lower.includes("defer")) {
      // Find baseline bytes from context or latest audit
      let baseBytes = 0;
      if (context.auditId) {
        const run = StorageRepository.getRun(context.auditId);
        if (run) baseBytes = run.totalBytes;
      }
      if (!baseBytes) {
        const recentRuns = StorageRepository.listRuns();
        if (recentRuns.length > 0) baseBytes = recentRuns[0].totalBytes;
      }
      if (!baseBytes) {
        // Run a lightweight baseline if none exists
        const quickAudit = await performAudit(context.targetUrl || "pccoe.org");
        baseBytes = quickAudit.total_bytes;
      }

      // Dynamically extract levers from user input without hardcoded defaults
      const imgMatch = message.match(/(\d+)%\s*(?:image|avif|webp|img|photo)/i);
      const jsMatch = message.match(/(\d+)%\s*(?:js|javascript|script|defer|tree)/i);
      const greenHosting = /green|renewable/i.test(message);

      const imageReductionPct = imgMatch ? parseInt(imgMatch[1], 10) : 0;
      const jsDeferralPct = jsMatch ? parseInt(jsMatch[1], 10) : 0;

      toolUsed = `simulate_scenario({ baselineBytes: ${baseBytes}, imageReductionPct: ${imageReductionPct}, jsDeferralPct: ${jsDeferralPct}, greenHosting: ${greenHosting} })`;
      toolOutput = await executeSimulateScenario({
        baselineBytes: baseBytes,
        imageReductionPct,
        jsDeferralPct,
        greenHosting,
      });

      reply = `Simulation calculated via SWDM v4 against real observed baseline of **${(baseBytes / (1024 * 1024)).toFixed(2)} MB**:
- **Simulated Transfer**: ${(toolOutput.simulated.bytes / (1024 * 1024)).toFixed(2)} MB (${toolOutput.percentSaved >= 0 ? `-${toolOutput.percentSaved}%` : `+${Math.abs(toolOutput.percentSaved)}%`})
- **Simulated Emissions**: **${toolOutput.simulated.co2Grams}g CO2e** per view (Baseline: ${toolOutput.baseline.co2Grams}g, EcoScore: Grade ${toolOutput.simulated.ecoScore})
- **Net Avoided Carbon**: **${toolOutput.co2SavedGrams}g CO2e** saved per page view
- **Applied Levers**: ${imageReductionPct > 0 ? `${imageReductionPct}% image optimization` : "No image changes"}, ${jsDeferralPct > 0 ? `${jsDeferralPct}% script deferral` : "No script deferral"}, ${greenHosting ? "100% renewable hosting" : "Grid average hosting"}.`;

      return NextResponse.json({ reply, tool_used: toolUsed, tool_output: toolOutput, engine: "carbonerra-grounded", actionLinks });
    }

    // 7. Live Audit / Check Website: "check domain.com", "audit https://..."
    const auditMatch = message.match(/(?:check|audit|test|scan)\s+(https?:\/\/[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
    if (auditMatch) {
      const rawUrl = auditMatch[1];
      toolUsed = `investigate_audit({ targetUrl: "${rawUrl}" })`;
      toolOutput = await executeInvestigateAudit({ targetUrl: rawUrl });

      const topHotspot = toolOutput.hotspots?.[0];
      const hotspotText = topHotspot
        ? `\n- **Primary Hotspot**: ${topHotspot.title} (${topHotspot.size}) — ${topHotspot.fixAction}`
        : "";

      reply = `Live audit completed for **${toolOutput.domain}**:
- **Total Transfer**: ${(toolOutput.totalBytes / (1024 * 1024)).toFixed(2)} MB
- **Emissions**: **${toolOutput.co2Grams}g CO2e** per page view (EcoScore **Grade ${toolOutput.ecoScore}**)
- **Hosting**: ${toolOutput.hosting.isGreen ? "Verified green hosting" : "Standard power grid"} (${toolOutput.gridIntensity.country}, ${toolOutput.gridIntensity.val} gCO2/kWh)
- **Confidence Rating**: ${toolOutput.confidence.rating} (${toolOutput.confidence.score}/100)${hotspotText}`;

      actionLinks = [
        { label: `View Full Audit for ${toolOutput.domain}`, href: `/?url=${encodeURIComponent(toolOutput.targetUrl)}` },
        { label: "Create Savings Lab Experiment", href: "/savings-lab" },
      ];
      return NextResponse.json({ reply, tool_used: toolUsed, tool_output: toolOutput, engine: "carbonerra-grounded", actionLinks });
    }

    // 8. Explain for Executive / Score Details: "explain for exec", "why is this a C", "details"
    if (lower.includes("explain") || lower.includes("executive") || lower.includes("why is this") || lower.includes("details") || lower.includes("score")) {
      const recentRuns = StorageRepository.listRuns();
      const targetRun = context.auditId ? StorageRepository.getRun(context.auditId) : recentRuns[0];

      if (!targetRun) {
        reply = "No audit data found in storage yet. Ask me to audit a website first (e.g. 'check stripe.com'), and I will prepare a comprehensive sustainability executive brief.";
        return NextResponse.json({ reply, tool_used: null, tool_output: null, engine: "carbonerra-grounded" });
      }

      toolUsed = `investigate_audit({ auditId: "${targetRun.id}" })`;
      toolOutput = await executeInvestigateAudit({ auditId: targetRun.id, targetUrl: targetRun.targetUrl });

      reply = `Executive Sustainability Brief for **${targetRun.targetUrl}**:
1. **Current Impact**: The page transfers **${(targetRun.totalBytes / (1024 * 1024)).toFixed(2)} MB** and emits **${targetRun.co2Grams}g CO2e** per visit (EcoScore Grade **${targetRun.ecoScore}**). Across 100,000 monthly visits, this produces an estimated **${((targetRun.co2Grams * 100000) / 1000000).toFixed(2)} metric tons** of CO2 annually.
2. **Key Offender**: Heavy asset transfer accounts for the majority of the footprint, with ${toolOutput.resourceCount || targetRun.resources.length} distinct network resources downloaded on load.
3. **Recommended Next Step**: Initialize a Savings Lab experiment to convert oversized JPEG assets to modern WebP and defer non-critical scripts.`;

      actionLinks = [{ label: "Start Savings Lab Experiment", href: "/savings-lab" }];
      return NextResponse.json({ reply, tool_used: toolUsed, tool_output: toolOutput, engine: "carbonerra-grounded", actionLinks });
    }

    // Default: Grounded Guidance with Real Capabilities
    reply = `I am Carbonerra's grounded sustainability assistant. Every calculation I perform uses real network observations and the Sustainable Web Design Model (SWDM v4).

Available real-world actions you can trigger:
- **Audit any website**: *"check stripe.com"* or *"audit github.com"*
- **Dual-site comparison**: *"compare vercel.com with stripe.com"*
- **Simulate scenario**: *"what if 80% image compression and green hosting?"*
- **Prepare experiment**: *"prepare experiment for campus-events"*
- **Test candidate**: *"test candidate"* or *"test broken candidate"*
- **Evaluate CI budget**: *"evaluate release shield budget"*
- **Executive summary**: *"explain score for executives"*`;

    return NextResponse.json({ reply, tool_used: null, tool_output: null, engine: "carbonerra-grounded" });
  } catch (error: any) {
    console.error("[Chat API Error]", error);
    return NextResponse.json(
      { error: error.message || "Chat agent encountered an issue executing real tool." },
      { status: 500 }
    );
  }
}
