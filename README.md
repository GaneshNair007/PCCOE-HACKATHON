# Carbonerra Savings Lab
> **Make your website lighter. Prove the improvement.**
> 
> *A sustainability decision and action system for web teams.*

Carbonerra connects observed web transfer waste to a reviewable source change, checks that the same user task still works with less transferred data, verifies the deployed outcome, and protects the improvement against regressions in release pipelines.

---

## Product Lifecycle Stages

```
MEASURE ──► DIAGNOSE ──► PRIORITIZE ──► REDUCE ──► IMPLEMENT ──► VERIFY ──► PREVENT REGRESSION
```

1. **MEASURE**: Measure network transfer bytes across real tested user journeys under matching cold-cache browser conditions.
2. **DIAGNOSE**: Pinpoint specific reducible asset hotspots (uncompressed raster assets, unoptimized scripts) mapped to source files.
3. **PRIORITIZE**: Rank opportunities by supported reducible bytes, evidence quality, effort, and verification feasibility.
4. **REDUCE**: Formulate source-level patches (e.g. converting raw JPEGs into modern WebP with responsive `<picture>` tags).
5. **IMPLEMENT**: Provide reviewable unified diffs and record explicit engineering sign-off before applying code changes.
6. **VERIFY**: Run 3 alternating passes to prove data reduction while enforcing deterministic **Task Preservation Assertions**. If a lighter candidate breaks user functionality, Carbonerra strictly rejects it.
7. **PREVENT REGRESSION**: Promote verified baselines into immutable CI release ceilings (Release Shield) to block regressive code merges.

---

## The Signature Experience: Task Preservation

> **Rule Invariant**: A website cannot claim sustainability progress by breaking the service or task people need.

Carbonerra's key differentiator is **Task Preservation Verification**:
- When a candidate site is tested, Carbonerra evaluates explicit functional assertions (DOM content checks, keyboard accessibility, synthetic form submissions).
- **The Win (Optimized Candidate)**: Transfer drops from 2,450 KB to 204 KB (-91.6%), all 3 assertions pass $\rightarrow$ Verified improvement receipt generated.
- **The Judge Twist (Broken Candidate)**: A flawed refactor drops transfer to 25 KB, but breaks registration (HTTP 500) $\rightarrow$ **Candidate Rejected!** Savings achieved by breaking user tasks are never celebrated as sustainability success.

---

## Architecture & Methodology

- **Framework**: Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, `@tgwf/co2`, Cheerio.
- **Carbon Attribution Model**: Official Sustainable Web Design Model v4 (SWDM v4) via `@tgwf/co2`.
  - Operational carbon factor: 494 gCO2e/kWh (Ember 2023 reference) or regional IP proxy.
  - Transparent formula: $E = \text{Data (GB)} \times 0.00000000124 \times \text{Carbon Intensity} \times \text{Rating Factor}$.
  - *Methodology Caveat*: Carbon estimates are attributional model results; a lower model estimate is not proof of the same quantity of physical emissions avoided.
- **Durable Append-Only Persistence**: JSON store (`data/carbonerra-store.json`) backing projects, immutable audit runs, recommendations, experiments, verification records, and release budgets.
- **Shared Budget Evaluator**: Unified engine used across the web app, local CLI runner (`scripts/run-budget-check.mjs`), and GitHub Actions CI workflow.

---
LIVE DEMO IS AT: https://pccoe-hackathon.vercel.app



## Limitations & Honest Boundaries

1. **Attributional Modeling**: Carbon numbers are calculated using The Green Web Foundation's Sustainable Web Design Model v4 (SWDM v4). They represent model attributions; reduced bytes do not guarantee an identical reduction in physical grid emissions.
2. **Geographic Proxy**: Datacenter grid intensity is estimated using IP-based regional lookups (Ember 2023 data). Edge and CDN routing may distribute actual server execution.
3. **Single-User Demo Boundary**: This submission runs locally or on team-controlled staging. It does not provide multi-tenant enterprise OAuth, fleet scheduling, or autonomous remote repository write permissions without approval.
