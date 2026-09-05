# Carbonerra Mission Control (AI Sidecar Companion)

> **“Tell it what you want to improve. Follow the evidence.”**

Carbonerra Mission Control is a completely isolated, evidence-grounded AI companion service running at `http://localhost:3002/`. It augments the original Carbonerra platform (`http://localhost:3001/`) with grounded digital carbon intelligence, counterfactual scenario simulation (SWDM v4), controlled image optimization experiments, physical task preservation assertions, explicit engineering approvals, release shield budget enforcement, and verifiable evidence receipts.

---

## 1. Quick Start

### Prerequisites
- Node.js >= 22.0.0 (tested on Node v24.15.0)
- The main Carbonerra application running at `http://localhost:3001/` (optional, for live import)

### Start Development Server
```bash
cd ai-sidecar
npm run dev
```
The service will start on **`http://localhost:3002/`**.

### Run All 14 Invariant Tests
```bash
cd ai-sidecar
npm test
```

### Run Regression Budget Evaluation
```bash
cd ai-sidecar
npm run budget:check
```

---

## 2. 3-Minute Hackathon Live Demonstration Script

### Step 1: Open Mission Control (30s)
1. Navigate to **`http://localhost:3002/`**.
2. Notice the 3-panel layout:
   - **Left:** Chat & Model Orchestrator (Live Groq or verified deterministic Evidence View).
   - **Center:** Workbench with active controlled demo fixture (`Campus Hackathon Registration Portal`), reviewable git diff, and explicit Approval Gate.
   - **Right:** Evidence & Receipts drawer with pinned SWDM v4 parameters, 350 KB Release Shield Gate, and verifiable receipts.

### Step 2: Signature Request Execution (60s)
1. Click the preset signature prompt chip:
   > *“Help students register for this event using less data. Keep the poster readable, preserve registration, and show me the evidence for your recommendation.”*
2. Watch the orchestrator execute real tools:
   - `inspectAudit`: Finds that the raw 2.45MB JPEG hero poster represents **92.4%** of total page transfer.
   - `prepareImageExperiment`: Generates candidate WebP responsive `<picture>` syntax with a 92.4% file size reduction (185 KB vs 2,450 KB).
   - Generates a reviewable source diff with cryptographic SHA-256 hash in the Center Workbench.

### Step 3: Engineering Approval Gate & Task Preservation Guardrail (60s)
1. Point out the **Engineering Approval Gate**: AI cannot autonomously apply changes; an engineer must record explicit approval.
2. Click **“Approve Candidate Patch”** (records approval timestamp and signer on server).
3. Test the memorable guardrail by clicking **“Test Broken (Guardrail)”**:
   - The candidate variant is lighter (140 KB), but it breaks the registration endpoint (`POST /demo/event/register` returns HTTP 500).
   - The companion **STRICTLY REJECTS** the broken candidate because task assertions failed! Digital carbon savings are invalid if the core user task is broken.
4. Click **“Test Candidate”**:
   - Tests physical journey on `http://localhost:3002/demo/event`.
   - Registration succeeds (`HTTP 200`, ticket generated).
   - Physical net savings verified: **-2,265.8 KB (85.5% reduction)**, **-0.0575 gCO2e per journey**.
   - An official, cryptographic **Auditable Evidence Receipt** is minted.

### Step 4: Export Evidence & Enforce Release Shield (30s)
1. In the Right Panel, click **“HTML Receipt”** to inspect the downloadable, auditable evidence document.
2. In the Release Shield Gate, click **“Check Candidate”** (Passed within 350 KB budget) and **“Check Baseline”** (Breach detected: 2,650 KB > 350 KB ceiling).

---

## 3. Strict Isolation Guarantee
- **Root Repository Untouched:** `ai-sidecar/` has its own isolated `package.json`, `node_modules`, tests, and config.
- **Zero Modifications:** No edits made to root dependencies, backend `/api/chat`, scanner, or database.
- **Provenance Preservation:** Imported audits from the original app are truthfully labeled as scanner estimates.
