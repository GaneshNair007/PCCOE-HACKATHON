# Carbonerra AI Companion — complete Antigravity build prompt

Implement this specification in my PCCOE-HACKATHON workspace. This is an additive AI-companion project. **My latest explicit decision is: separate AI companion; preserve the existing app.** This overrides earlier suggestions to modify Carbonerra's existing pages, chatbot route, scanner, database, or shared layout.

Use my reference “Carbon Footprint AI and Chatbot Architecture for the PCCOE Hackathon” as architectural input. Incorporate its deterministic accounting, uncertainty, counterfactual scenarios, feasible-action ranking, bounded conversation, curated retrieval, privacy, fallback, evaluation, and isolated deployment principles. Adapt examples to Carbonerra's actual website-sustainability product.

Do the implementation, integration preparation, tests, and demonstration. Do not stop after returning an architecture plan. Inspect the actual checkout and available capabilities first; preserve all existing user edits.

## 1. Product: Carbonerra Mission Control

Build **Carbonerra Mission Control**, a separate AI companion to the existing Carbonerra website at `http://localhost:3001/`.

Stages: Measure → Diagnose → Prioritize → Reduce → Implement → Verify → Prevent regression.

Tagline: **“Tell it what you want to improve. Follow the evidence.”**

Signature request:

“Help students register for this event using less data. Keep the poster readable, preserve registration, and show me the evidence for your recommendation.”

The AI should understand natural paraphrases, use selected project context, inspect actual resources, compare feasible scenarios, prepare an image-optimization experiment in its controlled demo, show a real source diff, run comparable tests, explain the result, and produce an evidence receipt. It must accept follow-ups such as “Use 20% instead”, “I cannot change hosting”, “Why this fix?”, “Show the source”, and “Prove the registration still works.”

The memorable demonstration is an apparently lighter candidate that breaks registration: the companion rejects that candidate from real failed assertions. The properly optimized candidate then passes the tested journey. A later oversized-image regression triggers a real budget failure.

No script of predetermined assistant answers or fabricated success outcomes. Demonstrate the actual model interpreting new phrasing and operating real tools.

## 2. Strict isolation and integration

Create everything under a new `ai-sidecar/` directory with its own package manifest, lockfile, UI, server, tests, documentation, data store, and demo fixture. Inspect whether that directory exists before creating it; do not overwrite existing work. Record hashes/status of pre-existing tracked and untracked application files and confirm they are unchanged at completion.

Do not modify the existing frontend, `/api/chat`, scanner/carbon engine, backend routes, root dependencies/lockfile, database/schema, environment files, layout, or app configuration. Do not “repair” the main application's currently hardcoded behavior as part of this companion task. Make deficiencies visible in the adapter's evidence status instead.

Run the companion independently, preferably at `http://localhost:3002/`, with a link back to the original app. Verify port availability and document the chosen port. The companion UI and API should share its own origin. An independent Node/TypeScript service with a lightweight React UI is suitable; keep its install/build/run workflow contained in `ai-sidecar/`.

Consume the existing app only through explicitly configured, schema-validated APIs or user-exported reports. A server-side read adapter may access the known local original-app endpoint; this is a narrowly configured adapter, separate from the public target scanner. Do not auto-select the original app's server-global “latest audit”. Show selectable URL/time/source records and persist a snapshot in the sidecar with its original ID and provenance.

The existing scanner can contain inferred fallback sizes. Its display label “verified” does not make it trusted. Validate each imported record's provenance. Fallback or uncertain measurements remain “Existing-app estimate / insufficient measurement evidence”. Never upgrade them into companion-observed evidence. Use a sidecar-owned browser runner or imported validated Lighthouse evidence for real verification. Do not launder manufactured page weights through a new LLM.

Optional embedded widget: build an externally served widget plus documented GTM/CMS/edge integration snippets, but activate them only if an existing authorized integration point actually exists. Do not install GTM, change proxy/DNS/CSP configuration, inject a loader into the original source, or claim an embedded widget was installed when only a standalone companion exists. With no existing injection point, deliver the working standalone companion and mark embedding “Integration point required”. Cross-origin iframe isolation must be respected; never assume an iframe can read the parent DOM. If postMessage integration is available, validate exact origins and payloads and exchange only explicit context.

All source inspection is read-only for the existing Carbonerra app and external selected repositories. Generate downloadable patch artifacts for those targets. Apply changes only within the sidecar's own disposable demonstration fixture after recorded product approval. Existing-app preservation is not relaxed by an AI-generated approval message.

## 3. What “real AI, no hardcoded answers” means

The existing chat implementation uses regex intent matching and templated replies rather than an LLM. Do not reuse it as the companion intelligence engine. Specifically avoid its fixed image/JS percentages, guessed `0.05g` saving, implicit latest audit, and client-side guessed tool activity.

Use one actual model orchestrator with typed application tools. Investigation, planning, verification, and explanation are workflow phases, not four fake agent personalities. The LLM handles intent interpretation, follow-up questions, language, and selection of permitted tools. Application code owns calculations, eligibility, ranking policy, evidence retrieval, approvals, state transitions, and execution outcomes.

Fixed tool schemas, UI labels, validators, versioned factors, reproducible tests, and documented policy settings are appropriate software. What must never be fixed or manufactured is a target-specific measurement, user-request percentage, personalized outcome, model answer, tool result, or success state.

## 4. Provider choice and configuration

Use direct provider integrations to preserve access to their own free tiers. Do not add a paid gateway or assume a third-party gateway inherits another provider's free allowance.

Recommended default: **Groq, model `openai/gpt-oss-120b`**. The official published Free Plan table checked on 5 September 2026 lists 30 requests/minute, 1,000 requests/day, 8,000 tokens/minute, and 200,000 tokens/day. These are documentation figures, not a verified quota for my account. The model supports custom tool calling. Its currently documented parallel-tool support is absent; serialize model tool calls. Independent operations may be batched inside a narrowly defined application tool.

`openai/gpt-oss-20b` is an optional alternative for benchmarked simpler requests, with the same published free limits; do not claim switching to it creates more quota. Choose based on measured tool reliability and latency for this app, not parameter count alone.

Optional second hosted provider: Google Gemini `gemini-3.8-flash`, currently documented as stable with text/image input, function calling, and free input/output pricing. Actual free quota must be checked in the account's AI Studio. `gemini-3.5-flash-lite` may be an alternative efficiency preset if available and its actual quota is more useful. The reference's 3.1 Flash-Lite recommendation must not be treated as the only current model. Verify provider availability and capabilities before enabling either preset. Free Search/Maps grounding is not included for these Gemini entries; use the sidecar's curated retrieval instead.

Optional local provider: Ollama with a locally installed tool-capable model, such as `qwen3:4b` or `qwen3:8b`, selected after checking hardware and running the same capability tests. Local use avoids hosted token quotas but uses the machine's memory, compute, and electricity. A model download size is not its runtime RAM requirement. Do not download large weights silently; provide the exact setup instructions and let an existing installation be used. A hosted sidecar cannot reach a user's laptop localhost automatically. Enable Ollama only when reachable from the sidecar server; do not publicly expose the local model endpoint.

Keep keys server-side in sidecar-specific configuration. Do not ask for keys in a chat transcript, logs, or client assets. Suggested config names: `AI_PROVIDER`, `GROQ_API_KEY`, `GROQ_MODEL`, `GOOGLE_GENERATIVE_AI_API_KEY`, `GOOGLE_MODEL`, `OLLAMA_BASE_URL`, `OLLAMA_MODEL`, `ALLOW_HOSTED_FALLBACK`, `ORIGINAL_APP_BASE_URL`, `SIDECAR_PORT`, `KNOWLEDGE_VERSION`, and `PROMPT_VERSION`. Model IDs and settings are configurable. Billing-disabled/free-tier account setup must be verified by the owner; code cannot guarantee a credential belongs to a free account. Never silently fall back to a paid model or enable billing.

Add a setup panel showing provider configured/unavailable, selected model, optional connection test, supported capabilities, and relevant limits with source and timestamp. “Remaining quota” is shown only when available from actual provider headers/API; a local estimate must be labeled as such. Missing key returns “AI not configured” and functional non-AI evidence controls.

Free Google API terms permit data use to improve products; minimize public audit context and do not send private repository snippets, personal information, credentials, or private reports to that free provider. A storage flag is not a promise of no training/retention. Use privacy settings only where supported by the exact endpoint/SDK. Fallback respects the same data-sharing policy and only uses explicitly configured eligible providers.

## 5. SDK and response architecture

Use a verified compatible Vercel AI SDK with direct provider adapters, or an equally typed provider-native adapter if necessary. Inspect installed package docs before coding. Current inspected `ai` package was 7.0.93 and requires Node >=22; its local docs use `ToolLoopAgent`, `tool({ inputSchema })`, and `isStepCount(...)` for loop control. Check the sidecar's runtime and peer dependencies; never change the original app's runtime/dependencies to make this work. Do not copy obsolete useChat/streaming examples without checking the installed version.

Groq's documented Structured Outputs cannot currently be combined with streaming or tool use. Implement the normal streaming text/tool-event path without a strict response schema in that same provider call. Server tool inputs/outputs still have validated schemas. If a strict final envelope is needed, perform a separate bounded no-tools, nonstreaming finalization call, and count it against the turn's model budget. Prefer deterministic construction of numerical cards so an extra model call is usually unnecessary.

No hidden reasoning or chain-of-thought panels. Display actual execution records and short decision explanations.

## 6. Request and execution flow

Client sends a random session/thread identifier, new user message, explicit selected project/run/experiment identifiers, locale, and any user-selected context. The server loads authorized history and project context. Do not accept client-provided system/developer messages, trusted tool results, permission claims, or arbitrary file paths as authority.

Pipeline:

1. Validate request size, session/project access, concurrent-turn status, and quota budget.
2. Minimize/redact sensitive data before provider calls and logs; preserve the original user meaning and show if necessary inputs were removed.
3. Interpret domain/intent semantically, using the real orchestrator in the MVP. Do not call another LLM only to classify every message. A trained local classifier can later reduce cost when supported by evaluated data.
4. Resolve explicit selected context. Ask one focused question if necessary data or the target is ambiguous. A missing value is not zero.
5. Supply compact relevant evidence, allowed tool definitions, user constraints, and curated knowledge when relevant.
6. Execute validated tool calls. Tools return factual typed values, provenance, warnings, and status. Long jobs return an ID promptly.
7. Validate final evidence references and render numerical cards from trusted data. The model explains the result and proposes a supported next action.

Allowed domain: website sustainability, Carbonerra navigation/methodology, relevant optimization code, audit interpretation, scenario comparison, uncertainty, and low-risk related sustainability concepts. Unrelated homework, unrelated code, general trivia/current news, and medical/legal/financial decisions receive a brief domain boundary response. Relevant image/font/cache/JavaScript optimization code is in scope; do not inherit the reference's blanket prohibition on programming.

Possible response decisions: ANSWER, CLARIFY, OUT_OF_SCOPE, INSUFFICIENT_DATA, TEMPORARILY_UNAVAILABLE. Keep misuse/safety handling appropriate to the content. Do not show model self-reported “intent confidence 0.93” as a calibrated probability.

## 7. Concrete tools

Start with these small typed tool groups; enable only capabilities actually implemented:

| Tool | Input | Actual result |
|---|---|---|
| `inspectAudit` | authorized project/run IDs, optional resource IDs | Coverage, measured resource summary, top eligible issues, model assumptions, evidence references. No implicit latest audit. |
| `startAudit` / `readJob` | allowed public target or trusted fixture ID; job ID | Creates/reads a real sidecar browser job. No invented progress or return values. |
| `compareScenarios` | baseline ID, up to three explicit resource changes, constraints | Recomputes each eligible scenario with the deterministic engine, labels assumptions, returns differences and overlap warnings. |
| `rankActions` | baseline/evidence IDs, time/budget/hosting constraints | Eligible actions ranked using a documented versioned policy, with why-fit/why-excluded evidence. |
| `prepareImageExperiment` | fixture/source evidence and selected image, explicit constraints | Real candidate asset variants, actual encoded file sizes, previews, and a diff in sidecar storage. Existing target source stays untouched. |
| `startVerification` / `compareRuns` | experiment and explicit run IDs | Starts actual comparable runs, evaluates task assertions, computes differences/outcome reasons; no “success” from prose. |
| `retrieveKnowledge` | question/topic and bounded query | Relevant curated text, document URL, source/chunk ID, version, retrieval time, and limitations. |
| `saveActionPlan` / `getReceipt` | selected evidence/actions or experiment ID | Stores a user-requested plan or fetches the actual evidence receipt. Never fabricates verification. |

Where the full Savings Lab worker is unavailable, the tool returns `CAPABILITY_UNAVAILABLE` and a useful alternative, such as importing a Lighthouse report or preparing a manual patch. A declared tool name without an implementation is not a feature.

Use server-owned IDs and ownership checks. Reject unsupported operations, impossible percentages, cross-project resource IDs, missing evidence, and unknown units. No arbitrary shell, SQL, unrestricted filesystem or browser-control tool is exposed to the chatbot. A model must not request a URL fetch that can reach private or metadata addresses. Apply target validation to redirects and subresources; keep the narrow original-app adapter and local fixture runner isolated from public scanning.

## 8. Deterministic carbon, uncertainty, and scenarios

For website audits, reuse the methodology, not the original app's mutable business logic: a sidecar-owned, version-pinned official CO2.js SWDM v4 adapter consumes valid observed bytes and documented assumptions. Keep the original calculator unchanged. Store the exact inputs, model/package version, grid/hosting source, geography/year, units, boundary, and proxy flags. If a different version changes an estimate, identify the methodology change rather than attributing it to optimization.

Use bytes per successful tested journey as the primary observed outcome and modeled gCO2e per same journey as a secondary estimate. Do not apply repeated-visit/caching factors again when the measured journey already captures that policy. Calculate baseline and scenario totals through the same model and then subtract them. Avoid double-counting overlapping resource changes.

Honor the requested parameters: “reduce image transfer by 20%” means a hypothetical 20% reduction of selected eligible image-transfer bytes, not 90% image compression and not 20% of the whole page. Distinguish encoded file size, observed transfer, codec-quality settings, and an assumed percentage. Image conversion does not guarantee a particular byte saving. Deferring a script does not remove its transfer if it still downloads during the journey. A no-op reproduces baseline; zero image bytes yields no image-transfer saving.

Keep three concepts separate: measurement variation/coverage, carbon-factor/model sensitivity, and uncertainty of any future learned predictor. Three repeated browser runs do not create a validated statistical confidence interval. Never invent a confidence range around a source factor. Monte Carlo is optional only when defensible input distributions exist; label the assumptions and interval meaning. It is not needed to make the MVP look intelligent.

The household `activity × emission factor` architecture from the reference is a future domain extension with explicit units and scope. Do not apply a CEA electricity factor directly to website bytes or replace all SWDM segments with an Indian household grid factor. Do not embed the reference's unverified 0.710 value or example household totals into website results. If that extension is later added, independently verify official factor versions, distinguish CO2 from CO2e, and label foreign factors as geographic proxies.

## 9. Personalization and “what should I do first?”

Gather only useful optional preferences: framework, ability to edit source, hosting-change permission, available time, cost constraint, image-quality priority, and desired user journey. No identity details are necessary.

Use deterministic, documented multi-objective ranking for the MVP. Filter ineligible actions first; rank remaining actions by supported byte-reduction opportunity, evidence quality, fit to the declared constraints, effort/risk, and ease of verification. Explain excluded options. Treat effort/cost as an estimate or a user-supplied value, never an observed fact. Support “Why isn't this practical?” and record an optional reason so the next ranking respects that explicit preference.

Include an optional ML module boundary for local intent classification and adoption/ranking models. Start disabled unless suitable human-reviewed training and held-out evaluation data exist. Keep action preferences, explicit feedback, and observed completions separate. Synthetic labels may test plumbing but do not establish real adoption probability. Do not claim the system trained itself or learned what works from a single click. Collect anonymized feedback only with opt-in; train offline and version the dataset/model/evaluation. Contextual bandits, conformal prediction and production learning-to-rank are future phases, not dependencies for this hackathon.

## 10. Curated knowledge and numerical grounding

Build a small local searchable corpus covering SWDM/CO2.js, Green Web Foundation hosting/grid methodology, resource-transfer measurement, responsive images, loading behavior, fonts, caching, and Carbonerra's actual capabilities. Fetch verified primary documentation, retain modest attributable excerpts/notes, record source URL and date, and make it refreshable. Start with local lexical search; optional local embeddings may follow if retrieval tests show a useful improvement. A vector database is not required.

Do not use open web search as a default per-chat tool. Knowledge failure is different from provider failure: another LLM is not a substitute for missing evidence.

Every numerical result card is populated from a server-validated tool field with unit and reference, never from generated prose. Use citation tokens or metric references that the server resolves into exact values. Permit a model to describe a metric, but prohibit it from supplying the authoritative metric value. Reject forged/nonexistent/cross-project evidence references. Use at most one bounded correction; otherwise show validated evidence and an honest inability to finish the explanation.

For the MVP, buffer substantive answers that contain claims until references pass validation; stream real tool status and approved non-numeric text as appropriate. Do not briefly display an invented number and remove it after validation. Escape/sanitize rendered content and links. Retrieved pages, code comments, uploads and report text cannot change the system policy or authorize actions.

Provide source-backed cards with: finding, evidence, proposed user action, observed-versus-estimated label, expected effect if supported, assumptions, effort/risk, verification method, and unavailable-data behavior.

## 11. Companion UX

Build a polished standalone workspace in Carbonerra's forest/cream/lime brand. Desktop: conversation at left, current experiment/scenario at center, expandable evidence drawer at right. Mobile: one focused panel with switchable Chat / Experiment / Evidence views. The optional external widget can open this workspace.

Show the selected project, exact URL, audit timestamp, evidence source, and provider status. Useful actions:

- **Ask about this:** attach a selected audit/resource reference, never scrape unrelated fields.
- **Compare my options:** show up to three actual scenario cards, constraints, assumptions and unsupported states.
- **Choose the tradeoff:** show real candidate-image previews and encoded sizes; do not call them browser savings until measured.
- **Show your evidence:** open the supporting run/source and calculation inputs.
- **Challenge this result:** rerun the deterministic comparability/eligibility/assertion checks and explain any inconsistency.
- **Remember this constraint:** explicitly store a preference for this session, with optional saved profile.
- **Turn this into an action:** create a reviewable action item with owner/due date only if supplied.

Progress records are emitted by the server: reading evidence, preparing candidate, awaiting approval, testing registration, comparing runs, or failed. “AI typing”, “tool requested”, “job queued”, and “job running” are different states. No fabricated agent dialogue, thought process, progress percentages, or synthetic token counters.

Include Stop, retry, keyboard support, readable text, reduced motion, empty states, reconnect handling, and a clear “AI unavailable — evidence tools still work” state. A deterministic fallback is visibly labeled “Evidence view” or “Reference answer”; it must not impersonate model-generated conversation.

## 12. Session, storage, approvals, and events

Use a sidecar-owned SQLite store or another compatible durable local store for saved evidence, jobs, experiments, actions, approvals, and receipts. Keep raw chat session-only by default, with a proposed 30-minute inactivity expiry; make persistent conversation history opt-in. Store optional saved preferences for a declared configurable retention period, with a clear delete control. No personalized shared response cache.

Maintain a small recent-message window plus structured session state: selected IDs, user constraints, pending clarification, proposed/accepted/rejected actions, and evidence references. Token-limit the combined context; never resend full HAR files or whole repositories each turn. Sessions and saved projects must have access checks; a random ID alone is not authorization for public deployment.

Minimum records: Session/optional SavedConversation; ProjectSnapshot; immutable AuditRun/ResourceObservation; Scenario; ActionPlan/Feedback; Experiment/PatchArtifact; Approval; Job/JobEvent; Verification/Receipt; ProviderUsage; KnowledgeDocument/Chunk; Model/Prompt/RankingPolicy version metadata.

For fixture patch application, the approval button hits a server endpoint storing exact patch hash, fixture/source version, session/project, action, and timestamp. A changed patch or stale source needs new review. A model saying “approved” is not approval. Non-fixture patches are export-only.

Use idempotency keys on jobs, plan saves, approvals and applications. Provider retries, repeated messages, refreshes or replayed stream events must not duplicate effects. Cancellation must show the actual job state; cancelling text generation is not proof a browser job stopped.

Stream typed, sequenced events with event ID, run/message/job ID, timestamp, and payload. Persist important job events and reconnect after the last event sequence. The LLM should not repeatedly poll jobs; application polling or server events handle progress. At most one bounded model continuation explains a completed job when useful.

## 13. Free-tier efficiency and fallbacks

Use one model orchestrator; perform numerical work, validation, ranking and job updates without LLM calls. Batch related evidence reads into `inspectAudit` and scenario alternatives into `compareScenarios`. Cache immutable evidence by run ID and knowledge by version. Fresh verification always bypasses measurement caches.

Configure at most three model generations per user turn, including any repair/finalizer; at most six narrow tool executions; one active heavy browser job per project; bounded message, context, output, total-token and wall-clock budgets. Tool-schema and reasoning tokens also consume budget where applicable. Use a request timeout suitable for text generation and separate job lifetimes for browser work. Do not keep a model request open for the entire experiment.

For Groq's documented 8k TPM setting, keep model requests compact and meter the total token expenditure across sequential calls in the minute. A million-token advertised context window on another model does not mean the account can freely process it. Use actual provider usage/headers when available and conservative estimates before submission. Keep quotas server-configurable and show when the next request must wait.

On 429 honor Retry-After and persist state. Permit one bounded transient retry, then one configured eligible fallback; no recursive multi-provider retry storm. Daily exhaustion should pause the provider until reset or an eligible configured provider is chosen. Missing knowledge, invalid tool arguments and unauthorized operations must not trigger a provider search for a more permissive answer. Partial streamed responses must be marked interrupted; do not concatenate two providers' answers as one clean completion. Do not rotate accounts/keys to evade limits.

If all models fail or no key is configured, keep the companion's audit, report import, scenario controls, evidence, and demo verification working. Show a truthful availability status rather than canned “AI success”.

## 14. Controlled demonstration and verification

Create a sidecar-owned event-site fixture, served as a production build on a separate available local port. Use synthetic registration data only and a local confirmation; no real emails or submissions.

Actual variants: oversized-image baseline; optimized image with working registration; lighter broken registration variant; reintroduced oversized resource. Label these controlled demo variants.

Run three baseline and three candidate browser journeys under the same browser/version, viewport, network/cache/service-worker/consent policy, fixture content and measurement window. Keep individual runs, medians, observed variability, errors, screenshots and task assertions. Measure through the same useful completion window, including deferred resources that load during it.

Assertions include essential event content, keyboard-accessible registration CTA, form interaction, local success confirmation, and required images loading. Image readability/visual quality requires an honest human preview check or a narrowly described measurement; do not claim an LLM or a screenshot proves full visual equivalence.

Compare only compatible evidence. Outcomes include observed improvement, no measurable change, regression observed, inconclusive, cannot compare, and functional checks failed. Never show verified savings when registration fails or collection breaks. Distinguish local production-build verification from actual deployed verification. Existing Carbonerra remains unchanged throughout.

Receipt: baseline/candidate IDs, environment, timestamps, changed fixture/source refs, approval, actual resource and journey deltas, assertion results, model inputs/versions, limitations, and outcome. Export readable HTML and JSON. It is evidence, not a certification or carbon credit.

Implement a real local regression budget check over fixture journey transfer and request count. In strict mode a breach or collection failure returns nonzero. Warning mode may exit zero with an explicit warning, never a pass. A downloadable CI workflow remains a template until integrated; do not write it into the original app's workflows.

## 15. Evaluation and delivery order

First: sidecar isolation + provider connection + context + one real inspect/explain tool. Then: scenario comparison and curated retrieval. Then: controlled image experiment, approval, real verification, receipt, and budget failure. Then: visual polish, feedback/preferences, optional provider adapters. Defer voice, fine-tuning, autonomous arbitrary repo changes, multi-agent debate, and vector infrastructure.

Add targeted tests invoking actual production functions:

1. Original app files/config/dependencies remain unchanged from the starting snapshot.
2. Different phrasings produce correct intent/tool arguments without exact-message matching.
3. “20%” and later “10% instead” use exact requested changes and the correct selected baseline.
4. Sessions/projects cannot see each other's context or evidence.
5. Missing/fallback measurements do not become observed totals or invented savings.
6. No-op scenarios, zero-image scenarios, overlapping fixes and deferred downloads behave correctly.
7. Forged evidence IDs, model numbers, malicious report instructions and injected tool results fail validation.
8. No approval, stale source, changed diff and replay cannot apply a fixture patch improperly; original/external repositories remain export-only.
9. Provider unavailable/429/timeout/midstream failure produces truthful bounded recovery and working non-AI tools.
10. A smaller but broken registration candidate is rejected using actual assertions.
11. Fresh, compatible working-candidate runs yield the computed outcome; incompatible or noisy runs do not imply success.
12. Reintroduced heavy asset fails the actual strict budget check.
13. No keys, personal inputs or confidential source leak to browser bundles, shared caches or logs.
14. Saved evidence survives restart; unsaved chat follows its documented expiry.

Create an evaluation fixture set with paraphrases, ambiguous requests, in-scope optimization code, out-of-scope questions, no-data cases and injection attempts. Report tool-selection accuracy, unsupported-number rate, evidence-reference validity, functional completion, latency, tokens per completed turn, and fallback rate only when actually measured. Do not invent benchmark results, calibrated probabilities, learned adoption scores or user traction.

Deliver: working standalone companion; optional embedding assets/snippets with truthful integration status; own env example without secrets; original-app adapter; typed tools; independent runner/fixture; knowledge notes with real links; tests and recorded results; setup/start/reset instructions; a three-minute demo script; and `reference-mapping.md` explaining which reference concepts were implemented, adapted, or deferred.

Also include a concise operational system prompt embodying these rules: stay in Carbonerra's domain, treat tools as factual authority, obey user constraints, ask when necessary evidence is missing, distinguish observed/estimated/scenario, cite real references, and never claim an action completed without an actual result. Keep this prompt separate and versioned.

To incorporate the reference's reusable Antigravity package idea, prepare optional skill/custom-agent templates under `ai-sidecar/antigravity-templates/`. Verify the current official Antigravity configuration format before generating frontmatter, tool names, or installation instructions; do not blindly copy the reference's schema. Scope these templates to building/testing the sidecar and reading the original app. Leave activation or installation into the original workspace's `.agents` configuration as a documented optional step; it is not necessary for the companion to work.

If an external key/injection point/provider quota is missing, complete all independent implementation and state the precise configuration requirement. Never mark a missing capability as working. Run the sidecar build/tests and the actual browser demo before reporting completion.

## Primary references to verify during implementation

- Groq model/free limits: https://console.groq.com/docs/rate-limits
- Groq custom tool support: https://console.groq.com/docs/tool-use/overview
- Groq Structured Outputs limitations: https://console.groq.com/docs/structured-outputs
- Groq data controls: https://console.groq.com/docs/your-data
- Gemini pricing: https://ai.google.dev/gemini-api/docs/pricing
- Gemini project-specific limits: https://ai.google.dev/gemini-api/docs/rate-limits
- Gemini 3.8 Flash capabilities: https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash
- Gemini terms: https://ai.google.dev/gemini-api/terms
- Ollama local model options: https://ollama.com/library/qwen3
- Ollama tools: https://docs.ollama.com/capabilities/tool-calling
- AI SDK: installed package docs first, then https://ai-sdk.dev/docs/agents/building-agents
- CO2.js: https://developers.thegreenwebfoundation.org/co2js/overview/
- SWDM boundaries/limitations: https://sustainablewebdesign.org/estimating-digital-emissions/

The internal citation markers and sample response numbers in the supplied research reference are not usable evidence. Resolve authoritative URLs and verify facts rather than copying those markers or samples into the product.
