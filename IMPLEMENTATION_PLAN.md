# CarbonTerra: Complete Frontend Overhaul & Architecture Implementation Plan

**Workspace**: `/Users/tzierrr/PCCOE-HACKATHON`  
**Author**: Senior Software Engineering Lead  
**Penalty Log Reference**: [`PENALTY_LOG.md`](./PENALTY_LOG.md) (Running Score: -2975 Pts | Strike 70 Logged)  
**Strict Operating Directive**: Local execution only. **NEVER run `git push`**.  

---

## 1. Executive Summary & Problem Diagnosis

### 1.1 The Failure Mode
The previous iterations suffered from superficial "whack-a-mole" edits:
1. **Template Clutter Preserved**: The landing page still rendered `SylvaHero` with stock photos of moss (`card-ethos.jpg`), camping stoves (`card-ecostove.jpg`), dashed circular glyphs (`Stat A / Stat B`), and typo wordmarks (`CARBONERRA`).
2. **AI Dashboard Tropes / Sci-Fi Slop**: The audit results still mounted over-engineered 3D wireframe cylinders (`HologramGauge3D`), rotating 3D globes (`CarbonGlobe3D`), arbitrary cache sliders (`SensitivityChamber`), and dense statistical explainability panels (`ExplainabilityPanel`).
3. **Consumer Homepage Pollution**: A raw REST API terminal (`ApiExplorer`) with cURL commands and JSON responses was mounted directly on the consumer landing page.
4. **Disjointed User Flow**: The progression did not match the clean, human-readable vision specified in `pccoe.rtfd`.

### 1.2 The Target Architectural State
A radical transformation into an **Apple Cupertino dark velvet command center**:
* **High Contrast, Zero Noise**: Deep velvet backdrop (`#0d110e` / `#131914`), refined typography (Clash Display + Satoshi / Inter), and clean glass panels with subtle hairlines (`border-white/10`).
* **Zero Academic Yap**: All metrics delivered in clear, human terms.
* **Streamlined Flow**: Hero & Model Overview $\rightarrow$ Auditing Command Station (Flapping Butterfly Orbit) $\rightarrow$ 4 High-Signal Result Cards $\rightarrow$ Savings Lab (Drop-in Fix + Asset Download + Executive SMTP Dispatch) $\rightarrow$ Evidence Vault (CSRD/ESG Proof) $\rightarrow$ Simulator & Forecasts.

---

## 2. Technology Stack & Process Map

| Layer | Technology | Port / Gateway | Responsibilities |
| :--- | :--- | :--- | :--- |
| **Frontend Shell** | Next.js 14 (App Router) + Tailwind CSS + Framer Motion | `http://localhost:3001` | Cupertino UI, responsive states, interactive controls, client state management |
| **API Proxy** | Next.js Rewrites (`/api/backend/:path*`) | `localhost:3001` $\rightarrow$ `8082` | Transparent reverse proxy connecting browser requests to backend |
| **Backend Core** | Python 3.11 + FastAPI + Uvicorn | `http://127.0.0.1:8082` | Dual-source web crawler, carbon attribution engine, SMTP report dispatcher |
| **Outbound Email** | Python `smtplib` + MIME multipart | Port 587 (SMTP) / Local Outbox | Dispatches executive audit summaries and drop-in fixes to company engineering leads |
| **Static Verification** | Sharp + Python PIL + Task Preservation Runner | Internal | Validates asset optimization, visual layout, and aspect ratios |

---

## 3. Detailed Component-by-Component Implementation Plan

### Phase 1: Landing Page & Hero Teardown (`src/components/landing/sylva-hero.tsx` & `src/app/page.tsx`)
1. **Purge Legacy Template Assets**:
   - Delete all references to `card-ethos.jpg` (moss photo) and `card-ecostove.jpg` (camping stove photo).
   - Delete all circular stat glyphs (`Stat A`, `Stat B`), liquid metal buttons, and ghost text `CARBONERRA`.
   - Remove `ApiExplorer` from `page.tsx` entirely.
   - Remove `world-stories` (the 4 nature-camping cards) from `page.tsx`.
2. **Rebuild Cupertino Hero**:
   - **Headline**: "Make your website lighter. Prove the improvement."
   - **Lede**: "Dual-source cold-cache analysis to measure web page transfer, pinpoint the heaviest assets, and generate drop-in code fixes."
   - **Input Command Station**: Sleek Cupertino command bar with search icon, URL input, clear button, and an active "AUDIT WEBSITE" button.
   - **Benchmark Presets**: Instant single-click test pills (`Stripe`, `Vercel`, `PCCOE`, `GitHub`).
3. **Feature Highlights on Scroll (4 Cupertino Cards)**:
   - Card 1: **Measure Real Bytes** — Dual-source synthetic testing preventing false cached readings.
   - Card 2: **Diagnose Hotspots** — Automated asset attribution pinpointing the exact file causing 80%+ of transfer.
   - Card 3: **Drop-in Optimizations** — Ready-to-use WebP `<picture>` markup and direct asset download.
   - Card 4: **Executive Dispatch (SMTP)** — Instant automated email delivery to company dev leads and CTOs.

---

### Phase 2: Auditing Station & Circular Butterfly Orbit (`src/components/ambient/butterfly-orbit.tsx`)
1. **Loading State Transformation**:
   - When the user triggers an audit, the input station transitions into a focused scanning stage.
   - Centered prominently: The custom **Butterfly Orbit** featuring:
     - Real-time flapping wings (CSS keyframe animations: `scaleX(1)` $\rightarrow$ `scaleX(0.2)`).
     - Continuous 3.2s circular orbital path around the scanning hub.
     - Ambient green pulse ring.
   - Dynamic 4-stage transparent progress ticker below the butterfly:
     - `Stage 1/4`: SSRF Validation & DNS Pre-Resolution
     - `Stage 2/4`: Cold-Cache DOM Crawler & Asset Transfer Measurement
     - `Stage 3/4`: Regional Datacenter & Power Grid Intensity Resolution
     - `Stage 4/4`: Sustainable Web Design Model v4 Carbon Attribution

---

### Phase 3: Zero-Yap Audit Results Dashboard (`src/app/page.tsx`)
1. **Purge 3D Sci-Fi Clutter**:
   - Remove `HologramGauge3D` (spinning Three.js wireframes).
   - Remove `CarbonGlobe3D` (rotating wireframe globe).
   - Remove `ExplainabilityPanel` (dense academic statistical tables).
   - Remove `SensitivityChamber` (arbitrary -20%/+20% slider).
2. **Mount 4 High-Signal Cupertino Cards**:
   - **Card 1: Page Transfer Weight**: Large typography (`2.42 MB`), accompanied by a clear comparison badge (*"42% heavier than global web median"*).
   - **Card 2: EcoScore Grade**: Crisp high-contrast badge (`Grade B` / `Grade D`) with clean color indicator.
   - **Card 3: Carbon per Visit**: Plain-English footprint (`0.58 g CO2e`) with real-world equivalent (e.g. charging an iPhone or boiling a cup of water).
   - **Card 4: The Primary Culprit**: One actionable sentence identifying the bottleneck (e.g. `hero-banner.jpg is 2.1 MB and accounts for 87% of all transferred bytes`).
3. **Transparent Formula Box**:
   - Display the clear mathematical formula without academic jargon:
     $$\text{Emissions (gCO2e)} = \left[\text{Data (GB)} \times 0.81\text{ kWh/GB}\right] \times \text{Grid Intensity (gCO2/kWh)}$$
   - Verified data sources: The Green Web Foundation regional grid factor + Sustainable Web Design Model v4.
4. **Primary Forward Call-to-Action**:
   - Prominent glowing button: `[ Proceed to Savings Lab → ]` (carrying audit parameters and hotspot data).

---

### Phase 4: Savings Lab (`src/app/savings-lab/page.tsx`)
1. **Purge Prototype Quirks**:
   - Completely eliminate the fake "Ganesh Nair (Product Lead)" approval box.
   - Eradicate raw git diff code dumps that confuse users.
2. **Deliver Actionable Engineering Solutions**:
   - **Before vs After Visual Staging**: Clear side-by-side comparison showing original `2.42 MB` (JPEG) reduced to `176 KB` (WebP) — **92.7% reduction**.
   - **Direct Asset Download Button**: Instant download of the optimized WebP asset (`campus-hackathon-hero.webp`).
   - **Production Drop-in Code Snippet**: Pre-formatted, copy-ready responsive `<picture>` tag:
     ```html
     <picture>
       <source srcset="/demo/assets/campus-hackathon-hero.webp" type="image/webp" />
       <img src="/demo/assets/campus-hackathon-hero.jpg" width="1200" height="400" loading="lazy" decoding="async" />
     </picture>
     ```
   - **Task Preservation Verification**: Proves aspect ratio, LCP, and interactive elements remain identical.
3. **Executive SMTP Dispatch Hub**:
   - Clean email input field: `"Enter engineering lead email (e.g. lead@company.com)"`.
   - Connected to FastAPI `/api/email-report` via Next.js proxy.
   - Generates an executive HTML report with core metrics, drop-in fix snippet, and direct download links.
   - Instant visual feedback: *"Report successfully dispatched to lead@company.com via SMTP"*.

---

### Phase 5: Evidence Vault & Forward Flows (`/evidence`, `/simulator`, `/forecasts`)
1. **Evidence Vault (`src/app/evidence/page.tsx`)**:
   - Remove light `.world-paper` beige CSS styling; enforce dark Cupertino canvas.
   - Present immutable SHA-256 cryptographic receipt for corporate ESG/CSRD compliance.
   - Forward CTA to `/simulator`.
2. **What-If Simulator (`src/app/simulator/page.tsx`)**:
   - Interactive sliders for monthly visitor traffic, image optimization level, and CDN cache hit ratio.
   - Forward CTA to `/forecasts`.
3. **Emissions Forecasts (`src/app/forecasts/page.tsx`)**:
   - 12-month trajectory projecting grid decarbonization paths and traffic growth.

---

## 4. Verification & Testing Protocol

1. **Static Build Verification**:
   - Run `npm run build` in `/Users/tzierrr/PCCOE-HACKATHON` to ensure 0 TypeScript errors, 0 ESLint errors, and 0 missing imports across all 21 routes.
2. **Service Orchestration**:
   - FastAPI daemon on `http://127.0.0.1:8082` (verified `/health`, `/docs`, `/api/email-report`).
   - Next.js server on `http://localhost:3001`.
3. **End-to-End User Flow Test**:
   - Input `https://stripe.com` or `https://www.pccoepune.com`.
   - Verify circular flapping butterfly orbit during scan.
   - Verify 4 high-signal results render without 3D wireframe lag.
   - Click `Proceed to Savings Lab`, test asset download, and trigger SMTP email dispatch.
   - Navigate to Evidence Vault $\rightarrow$ Simulator $\rightarrow$ Forecasts.
4. **Git Safety Check**:
   - Confirm **zero git push commands** were issued. All changes remain local.
