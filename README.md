# ⚡ Carbonerra Savings Lab
> **Make your website lighter. Prove the improvement.**
> 
> *A sustainability decision and action system for web teams.*

Carbonerra connects observed web transfer waste to a reviewable source change, checks that the same user task still works with less transferred data, verifies the deployed outcome, and protects the improvement against regressions in release pipelines.

---

## 🧭 Product Lifecycle Stages

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

## 🌟 The Signature Experience: Task Preservation

> **Rule Invariant**: A website cannot claim sustainability progress by breaking the service or task people need.

Carbonerra's key differentiator is **Task Preservation Verification**:
- When a candidate site is tested, Carbonerra evaluates explicit functional assertions (DOM content checks, keyboard accessibility, synthetic form submissions).
- **The Win (Optimized Candidate)**: Transfer drops from 2,450 KB to 204 KB (-91.6%), all 3 assertions pass $\rightarrow$ Verified improvement receipt generated.
- **The Judge Twist (Broken Candidate)**: A flawed refactor drops transfer to 25 KB, but breaks registration (HTTP 500) $\rightarrow$ **Candidate Rejected!** Savings achieved by breaking user tasks are never celebrated as sustainability success.

---

## 🔬 Architecture & Methodology

- **Framework**: Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, `@tgwf/co2`, Cheerio.
- **Carbon Attribution Model**: Official Sustainable Web Design Model v4 (SWDM v4) via `@tgwf/co2`.
  - Operational carbon factor: 494 gCO2e/kWh (Ember 2023 reference) or regional IP proxy.
  - Transparent formula: $E = \text{Data (GB)} \times 0.00000000124 \times \text{Carbon Intensity} \times \text{Rating Factor}$.
  - *Methodology Caveat*: Carbon estimates are attributional model results; a lower model estimate is not proof of the same quantity of physical emissions avoided.
- **Durable Append-Only Persistence**: JSON store (`data/carbonerra-store.json`) backing projects, immutable audit runs, recommendations, experiments, verification records, and release budgets.
- **Shared Budget Evaluator**: Unified engine used across the web app, local CLI runner (`scripts/run-budget-check.mjs`), and GitHub Actions CI workflow.

---

## 🚀 Quickstart & Working Setup

### Prerequisites
- Node.js 18+ (tested on Node v20/v24)
- npm

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Local Development Server
```bash
npm run dev
```
Open **`http://localhost:3001`** in your browser.

### 3. Run the Full Test Suite
Executes 28 unit and end-to-end integration tests across all 4 suites:
```bash
npm test
```

### 4. Run the Local CLI Budget Gate
Tests the shared budget evaluator directly in your terminal:
```bash
# Run against the local server
node scripts/run-budget-check.mjs http://localhost:3001
```
- Exits **0** when the candidate satisfies transfer limits and passes task assertions.
- Exits **1** on strict budget breach or functional assertion failure.

---

## 🎪 Controlled Demo Property

Carbonerra includes an isolated campus event registration property underteam control:
- **URL**: `http://localhost:3001/demo/event`
- **Variants**:
  - `?variant=baseline`: Working registration with uncompressed 2.42 MB hero JPEG (`public/demo/assets/campus-hackathon-hero.jpg`). Total transfer: 2,450 KB. Passes task checks, breaches 350 KB budget.
  - `?variant=optimized`: Working registration with responsive 176 KB WebP asset (`public/demo/assets/campus-hackathon-hero.webp`) and `<picture>` markup. Total transfer: 204 KB (-91.6%). Passes task checks, passes 350 KB budget.
  - `?variant=broken`: Stripped page (~25 KB) with broken registration submission (HTTP 500). Fails task check #3, rejected by Carbonerra.

---

## ⏱️ 3-Minute Judge Demonstration Script

| Time | Screen | Action & What Judges See | Key Takeaway |
|---|---|---|---|
| **0:00–0:20** | Controlled Demo Site (`/demo/event`) | Show the PCCOE Green Campus Hackathon registration page and complete a synthetic registration. | Concrete campus web problem: students loading heavy registration pages on mobile data. |
| **0:20–0:45** | Overview (`/`) | Run audit or inspect baseline. See **Top Evidenced Opportunity**: 2.42 MB hero image (98.7% of journey bytes). Click "Start improvement experiment →". | Clear diagnosis connecting observed network bytes to a specific asset. |
| **0:45–1:10** | Savings Lab (`/savings-lab`) Stage 1 & 2 | Review the proposed patch: unified diff replacing uncompressed `<img>` with `<picture><source type="image/webp">`. Reviewer sign-off and click "Approve & Stage Candidate". | Feasible engineering action with explicit human approval, not ungrounded AI magic. |
| **1:10–1:40** | Savings Lab Stage 3 | Click **"Test Broken Candidate"**. Carbonerra runs 3 passes, detects 25 KB transfer, but **REJECTS the candidate** because registration failed (HTTP 500). | **The Memorable Twist**: Carbonerra protects user usefulness. Savings cannot come from broken forms. |
| **1:40–2:10** | Savings Lab Stage 3 | Click **"Test Optimized Candidate"**. Shows 3 alternating passes. Transfer drops from 2,450 KB to 204 KB (-91.6%). Assertions: 3/3 passed. Status: **Candidate Verified ✅**. | Proven, reproducible transfer reduction under matching conditions. |
| **2:10–2:40** | Evidence (`/evidence`) | Inspect the **Improvement Verification Receipt**: side-by-side run tables, functional task audit trail, and download the JSON evidence receipt. | An auditable engineering record, explicitly disclosing attributional SWDM v4 assumptions. |
| **2:40–3:00** | Release Shield (`/shield`) | Re-introduce the oversized asset. The shared budget gate triggers a strict failure (exit 1). Show the downloadable GitHub Actions workflow template. | **Prevention of Regression**: Locks in digital sustainability progress across future pull requests. |

---

## 🔒 Limitations & Honest Boundaries

1. **Attributional Modeling**: Carbon numbers are calculated using The Green Web Foundation's Sustainable Web Design Model v4 (SWDM v4). They represent model attributions; reduced bytes do not guarantee an identical reduction in physical grid emissions.
2. **Geographic Proxy**: Datacenter grid intensity is estimated using IP-based regional lookups (Ember 2023 data). Edge and CDN routing may distribute actual server execution.
3. **Single-User Demo Boundary**: This submission runs locally or on team-controlled staging. It does not provide multi-tenant enterprise OAuth, fleet scheduling, or autonomous remote repository write permissions without approval.