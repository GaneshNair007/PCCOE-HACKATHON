# Carbonerra Mission Control — Reference Architecture Mapping

This document details how principles from *“Carbon Footprint AI and Chatbot Architecture for the PCCOE Hackathon”* were implemented, adapted, or deferred in the Carbonerra Mission Control companion service (`ai-sidecar/`).

---

## 1. Summary of Architecture Decisions

| Concept | Status | Implementation Details in `ai-sidecar` |
|---|---|---|
| **Deterministic Carbon Accounting** | **Implemented** | Pinned Sustainable Web Design Model (SWDM) v4 calculator in `src/lib/engine/swdm.ts`. Computes exact bytes and gCO2e with segment allocations (Data Center 15%, Network 14%, User Device 52%, Embodied 19%). |
| **Separate AI Companion / Isolated Deployment** | **Implemented** | 100% independent Next.js 14 service running on `http://localhost:3002/`. Zero modifications made to root application files, dependencies, database, or backend routes. |
| **Model Orchestrator with Serial Tool Use** | **Implemented** | Single model orchestrator (`src/lib/provider/orchestrator.ts`) with 8 typed tools. Serialized tool execution to respect Groq tool-calling constraints. |
| **Task Preservation Guardrail** | **Implemented** | Controlled demo tests complete user journey (registration form submission). If a candidate reduces bytes but fails the task (HTTP 500), it is strictly REJECTED (`startVerification`). |
| **Explicit Engineering Approval Gate** | **Implemented** | Patch application requires recorded approval with cryptographic SHA-256 hash. AI prose saying "approved" cannot authorize changes. |
| **Free-Tier Token & Rate Budgeting** | **Implemented** | Enforces Groq's 8,000 TPM limit via minute-window token tracking (`sidecarStore.trackGroqTokens`). Bounded to maximum 3 model iterations and 6 tool executions per turn. |
| **Deterministic Offline Reference Fallback** | **Implemented** | If `GROQ_API_KEY` is omitted or rate-limited, companion enters verified "Evidence View / Reference Answer" mode with full deterministic tool execution. Never fabricates numbers. |
| **Release Shield Budget Gate** | **Implemented** | 350 KB payload ceiling enforced via `POST /api/companion/budget` and CLI script `scripts/check-budget.mjs`. |
| **Curated Local Knowledge Retrieval** | **Implemented** | Searchable local Markdown corpus in `src/lib/knowledge/corpus.ts` covering SWDM v4, GWF hosting rules, modern image syntax, and caching rules. Primary source URLs retained. |
| **Auditable Evidence Receipts** | **Implemented** | Verifiable JSON and styled HTML receipts exported via `/api/companion/receipts/[id]` recording run medians, SWDM deltas, approval signatures, and limitations. |
| **Household Emission Factors (CEA 0.710)** | **Adapted / Scoped Out** | The reference proposed household activity emissions. Website digital emissions strictly require SWDM v4 grid and embodied factors (442 g/kWh operational, 531 g/kWh embodied). CEA factors are not mixed into website byte accounting. |
| **Multi-Agent Debates & Vector DBs** | **Deferred** | Replaced with single model orchestrator and fast lexical search. A vector DB and multi-agent persona loops add latency and fragility without improving engineering precision. |

---

## 2. Pinned Carbon Model Specifications (SWDM v4)

- **Energy Intensity Factor:** `0.0577 kWh / GB`
- **Operational Grid Carbon Intensity:** `442 gCO2e / kWh`
- **Embodied Hardware Carbon Intensity:** `531 gCO2e / kWh`
- **System Segments:**
  - Data Center: 15% (green hosting reduces only this segment)
  - Network: 14%
  - User Devices: 52% (largest driver)
  - Hardware Manufacturing: 19%
- **Sensitivity Boundary:** Evaluates standard `±20%` boundary per SWDM v4 guidelines.

---

## 3. The 8 Concrete Typed Tools

1. `inspectAudit`: Analyzes verified project breakdown and top issues.
2. `compareScenarios`: Recomputes counterfactual scenarios with reproducible zero-levers invariant.
3. `prepareImageExperiment`: Generates candidate variants, encoded sizes, and reviewable git diff.
4. `startVerification`: Executes physical runs and tests functional registration assertions.
5. `rankActions`: Ranks feasible actions using multi-objective policy considering user constraints.
6. `retrieveKnowledge`: Searches curated primary literature with attributable URLs.
7. `saveActionPlan`: Persists approved digital sustainability roadmap.
8. `getReceipt`: Retrieves official cryptographic evidence receipt.
