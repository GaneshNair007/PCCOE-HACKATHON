# Carbonerra — Upgradation Plan

Companion to `research.md` (evidence base) and `ui.md` / `3d_design.md` / `frontend.md` / `backend.md` / `api_contracts.md` (implementation specs). All product decisions here are 🔵PD (proposed product decisions) unless otherwise noted; factual claims cite `research.md`.

---

## 1. Current-State Assessment

The existing `feature/carbonerra-platform` branch is a static three-file mockup (HTML/CSS/JS) with no backend, no database, no real audit logic, and a fake linear "simulator" (see `research.md` §2). Its value today is a **visual design system and a feature narrative**, not working software. Every capability in the original brief — audit, carbon calculation, forecasting, simulation, budgets/regression — must be built essentially from zero.

---

## 2. Revised Product Vision

> **Carbonerra turns website sustainability from a static score into an operating discipline** — auditing pages with the same rigor as a performance tool, explaining carbon in terms developers can act on, forecasting where emissions are headed under editable assumptions, and catching regressions before they ship — while being transparently honest that every carbon number is a modeled estimate, not a measurement.

---

## 3. Unique Value Proposition

"Other tools tell you your site's carbon number once. **Carbonerra tells you why, what happens if you change it, and stops it from getting worse** — inside your existing dev workflow, with every number traceable to real audit evidence and a stated confidence range."

Differentiators (see `research.md` §4.1, §6): CI/CD-integrated regression gating; scenario-banded forecasting; trade-off-aware what-if simulation; evidence-cited AI recommendations; explicit, published EcoScore formula (unlike Ecograder's un-reproducible proprietary score, `research.md` §4).

---

## 4. Target Users & Personas

| Persona | Role | Goals | Pain today |
|---|---|---|---|
| **Dev Dara** | Frontend/full-stack developer at a mid-size product team | Wants concrete, code-level fixes tied to real metrics she can put in a PR | Existing tools give generic advice ("optimize images") with no file/line specificity |
| **PM Priya** | Product manager | Wants a defensible sustainability story for stakeholders without becoming a carbon-accounting expert | Composite scores from other tools aren't explainable or comparable run-to-run (Ecograder issue, `research.md` §4) |
| **Agency Alex** | Digital agency lead, manages 20+ client sites | Needs to audit many sites fast and produce client-ready reports | No tool combines fleet-wide monitoring with white-label reporting |
| **Sustainability Sam** | Corporate sustainability/ESG lead | Needs website carbon folded into broader GHG Protocol Scope 2/3 reporting | Web carbon tools live in a silo disconnected from corporate carbon accounting |
| **Platform Pat** | DevOps/platform engineer | Wants a CI gate that blocks carbon regressions like a test suite blocks bugs | No mainstream tool offers this today (`research.md` §6) |

---

## 5. Jobs-to-Be-Done

1. "When I ship a new page, I want to know its carbon footprint *before* a client or exec asks."
2. "When my carbon estimate is bad, I want to know exactly which resource is responsible, not a vague grade."
3. "When I'm deciding between two optimization approaches, I want to see the carbon/effort/risk trade-off before I write code."
4. "When traffic grows, I want to know if my current architecture will blow through our carbon budget in 6 months."
5. "When a deployment increases carbon meaningfully, I want to be blocked or alerted the same way a broken test would block me."
6. "When I report to leadership or a client, I want a shareable document that won't get challenged for overstating certainty."

---

## 6. Detailed Upgraded Feature List

Grouped by module, mapped to the ten capabilities in the brief. ✅ = present in some form in the mockup (visual/narrative only); ❌ = does not exist at all today.

1. **Website Audit** ❌ real engine — Playwright crawl, device/network/crawl-depth profiles, resource-level diagnostics, methodology disclosure banner.
2. **Carbon Calculation** ❌ real engine — SWDM v4 via CO2.js, OneByte fallback, confidence range, per-visit/per-1000-views/monthly/annual projections, device/network/data-center breakdown.
3. **EcoScore** ✅ visual only — published, explainable 0–100 formula with component weights, grade bands, benchmark comparison, "how to improve" delta view.
4. **Emission Hotspots** ✅ visual only — real per-resource-type breakdown (images/JS/CSS/fonts/video/3rd-party/requests/cache/hosting) with page-level and resource-level prioritization.
5. **AI Recommendations** ✅ visual only — rule-engine-first, LLM-explanation-optional, prioritized by impact×confidence/effort, each citing specific audit evidence.
6. **Carbon Lab / What-If Simulator** ✅ fake physics only — real simulation using actual audit resource data as input, image/JS/font/CDN/hosting-region levers, trade-off display (not just savings).
7. **Forecasting** ✅ visual only (static chart) — editable-assumption model, baseline/optimistic/pessimistic bands, explicit model-limitation notes.
8. **Carbon Budget & Regression Monitoring** ✅ narrative only (fake commit card) — real per-page/per-project budgets, threshold alerts, real GitHub PR check, before/after deployment comparison, severity classification.
9. **Reporting** ❌ — shareable PDF/HTML report, exec summary + dev detail, methodology/assumptions appendix, historical trend export.
10. **Optional 3D Carbon Flow** ❌ — see `3d_design.md`.

---

## 7. Feature Prioritization (RICE)

Scored 1–10 per factor; RICE = (Reach × Impact × Confidence) / Effort. Higher = higher priority.

| Feature | Reach | Impact | Confidence | Effort | RICE (rounded) | MoSCoW |
|---|---|---|---|---|---|---|
| Real audit engine (Playwright + Lighthouse) | 10 | 10 | 9 | 8 | 112 | Must |
| Carbon calc engine (CO2.js/SWDM v4 + uncertainty) | 10 | 10 | 9 | 6 | 150 | Must |
| EcoScore v2 (transparent formula) | 9 | 8 | 8 | 3 | 192 | Must |
| Emission hotspot breakdown | 9 | 9 | 9 | 5 | 146 | Must |
| Rule-based AI recommendations | 8 | 9 | 8 | 5 | 115 | Must |
| Carbon Lab simulator (real data-driven) | 7 | 8 | 7 | 6 | 65 | Should |
| Forecasting w/ scenario bands | 6 | 7 | 6 | 6 | 42 | Should |
| Carbon budgets + manual regression check | 6 | 8 | 7 | 5 | 67 | Should |
| GitHub Actions CI regression gate | 5 | 9 | 6 | 7 | 39 | Should |
| PDF/shareable reporting | 6 | 6 | 8 | 4 | 72 | Should |
| Multi-tenant org/workspace model | 5 | 6 | 8 | 5 | 48 | Should |
| LLM-generated plain-language explanations | 5 | 5 | 6 | 4 | 38 | Could |
| 3D Carbon Flow visualization | 3 | 5 | 6 | 7 | 13 | Could |
| Fleet-wide agency dashboard | 3 | 6 | 6 | 6 | 18 | Could |
| Anomaly/ML-based drift detection | 2 | 5 | 4 | 8 | 5 | Won't (v1) |
| White-label client reporting | 2 | 5 | 5 | 6 | 8 | Won't (v1) |

---

## 8. MVP Scope (Hackathon / Student Team)

**Goal:** a working, honestly-scoped single-tenant tool that audits one URL end-to-end and demonstrates the full evidence→estimate→recommendation→simulate loop.

**In scope for MVP:**
- URL submission → Playwright crawl (single page, desktop profile) → resource capture (requests, sizes, types).
- Lighthouse run for performance signals.
- CO2.js (SWDM v4) carbon calculation with confidence range and methodology-version tag.
- Green Web Foundation Dataset API check for hosting.
- EcoScore v1 (published formula, 4–5 components).
- Hotspot breakdown by resource type.
- Rule-based recommendations (10–15 deterministic rules) with evidence citations.
- Carbon Lab simulator operating on the real audit's resource data (image compression, JS deferral/removal, cache TTL, green-hosting toggle).
- Single-scenario forecast (linear projection with a stated assumption panel — no ML yet).
- Basic carbon budget (single threshold per project) with manual re-audit comparison (no live CI gate yet — stub/documented API contract only).
- Dashboard, audit detail, hotspots, recommendations, Carbon Lab, forecast, budget pages (2D only — 3D is Should/Could, not MVP-blocking).
- Single-user auth (email/password or magic link), single organization.

**Explicitly out of MVP:** GitHub Actions live integration (contract defined in `api_contracts.md`, not wired), LLM-generated explanations (rules produce plain-language text directly), 3D visualization, multi-tenant RBAC, PDF export (HTML/shareable-link report is enough), anomaly detection ML.

---

## 9. Version 2 Roadmap (Post-MVP, 3–6 months)

- Multi-page crawling with configurable depth; mobile + desktop + network-throttle profiles.
- GitHub Actions check run + PR comment bot (live regression gate).
- Multi-tenant orgs/workspaces with RBAC.
- Scenario-banded forecasting (baseline/optimistic/pessimistic) with traffic-growth, page-weight-growth, and grid-intensity assumption sliders.
- PDF/exportable reporting with exec summary + methodology appendix.
- Optional LLM-generated explanations layered on top of (never replacing) rule-engine output, with hallucination guardrails (see `backend.md` §Recommendation Engine).
- Time-of-day-aware grid intensity via a pluggable provider (Electricity Maps or UK NESO where regionally available).
- 3D Carbon Flow visualization (see `3d_design.md`).

## 10. Version 3 / Research Roadmap (6–12+ months, experimental)

- ML-based traffic/page-weight forecasting (replacing linear projection) with documented model cards and evaluation metrics.
- Anomaly/drift detection beyond fixed thresholds (statistical process control on the carbon time series).
- Fleet-wide agency view with white-label client reporting.
- Real User Monitoring (RUM) integration to replace some SWDM population averages with observed cache-hit rates and device mixes for a given site.
- SCI-formatted export for enterprise sustainability teams integrating with broader GHG Protocol inventories.
- Federated/plugin architecture for community-contributed optimization rules.

---

## 11. User Stories with Acceptance Criteria

**US-1 (Must, MVP).** *As Dev Dara, I want to submit a URL and see a real audit, so that I know my actual page weight and carbon estimate.*
- AC1: Given a valid public URL, when I submit it, then within a configurable timeout (default 90s) I see a completed audit with total transfer bytes, request count, and a carbon estimate with a stated range.
- AC2: Given an invalid or internal/private URL, when I submit it, then I see a clear validation error and no crawl is attempted (SSRF protection, see `backend.md`).
- AC3: Given a completed audit, when I view it, then I see the methodology version and audit timestamp.

**US-2 (Must, MVP).** *As PM Priya, I want an EcoScore with a visible formula, so that I can explain the number to my stakeholders.*
- AC1: The score page shows each component's weight and raw value.
- AC2: A "how to improve" panel lists the top 3 components dragging the score down, each linking to the relevant hotspot.

**US-3 (Must, MVP).** *As Dev Dara, I want each AI recommendation to cite the specific evidence behind it, so that I trust and can verify it.*
- AC1: Every recommendation card shows at least one concrete audit fact (byte count, resource URL/name, request count) that triggered the rule.
- AC2: No recommendation states an exact carbon saving without an accompanying assumption note.

**US-4 (Should, v2).** *As Platform Pat, I want a GitHub Actions check that fails a PR when carbon regresses beyond budget, so that regressions are caught pre-merge.*
- AC1: Given a configured carbon budget and a connected repo, when a PR's preview/staging deployment exceeds the budget by more than the configured threshold, then the check run fails with a remediation summary comment.
- AC2: Given a regression under threshold, the check passes and shows the delta for visibility.

**US-5 (Should, MVP/edge of v2).** *As Dev Dara, I want to simulate optimizations before implementing them, so that I can prioritize effort.*
- AC1: Adjusting a Carbon Lab lever recalculates estimated carbon using the actual audited resource data, not placeholder numbers.
- AC2: The comparison view shows baseline vs. target carbon, an effort indicator, and any noted trade-off (e.g., "aggressive JS removal may break functionality — manual verification required").

**US-6 (Should, v2).** *As Sustainability Sam, I want a forecast with scenario ranges and stated assumptions, so that I don't over- or under-commit to targets.*
- AC1: The forecast page shows baseline/optimistic/pessimistic lines with the assumptions (traffic growth %, page-weight growth %, grid intensity trend) editable and visible.
- AC2: A "model limitations" note is always visible on the forecast page, not hidden behind a tooltip only.

---

## 12. Non-Functional Requirements

- **Performance:** Audit job completes for a typical page (≤5MB, ≤150 requests) within 90 seconds p95; dashboard pages render primary content within 2s p75 on broadband.
- **Reliability:** Audit job queue with retries (max 2) and dead-letter handling; partial-failure audits (e.g., Lighthouse fails but crawl succeeds) still persist partial results rather than discarding everything.
- **Scalability:** Audit workers horizontally scalable (stateless workers behind a queue); MVP target 50 concurrent audits, design for 500+ at v2.
- **Availability:** 99.5% target for the API/dashboard at v2 (not a hard MVP requirement).
- **Data retention:** Audit history retained per plan tier; user-configurable deletion; PII minimized (crawled page content itself is not stored beyond what's needed for resource-level diagnostics).
- **Internationalization:** UI copy externalized to a translation-ready structure even if only English ships at MVP.
- **Accessibility:** WCAG 2.2 AA across the application (see `ui.md`).

---

## 13. Carbon Calculation Transparency Requirements

1. Every displayed or exported carbon figure must show: methodology name + version, calculation date, and a confidence range (not a bare point value).
2. Any comparison across time (trend chart, before/after) must state whether the methodology version was constant across the compared points; if not, flag a "methodology change" annotation instead of silently plotting incomparable numbers.
3. Green-hosting status must distinguish "GWF-verified green," "unverified/unknown," and never silently default unknown hosts to "not green" in copy (label as "unconfirmed").
4. All assumption inputs used in a forecast or simulation (traffic, growth rate, cache ratio, grid intensity) must be visible and editable by the user, not hidden constants.
5. A persistent, one-click "Methodology & Limitations" page must be linked from every screen that displays a carbon number.

---

## 14. Security and Privacy Requirements

- SSRF defense on the audit crawler: URL allow/deny rules, DNS-rebind protection, block private/link-local/metadata-endpoint IP ranges (see `backend.md` §Security for detail).
- Rate limiting per user/org on audit submission to prevent abuse of the crawling infrastructure.
- Secrets (API keys for Lighthouse/Electricity Maps/GitHub App) stored in a managed secret store, never in source or client-exposed config.
- JWT-based auth with short-lived access tokens + refresh tokens; RBAC roles (owner/admin/member/viewer) at the organization level from v2 onward (MVP: single-role, single-org).
- GitHub App / OAuth integration requests only the minimum scopes needed (repo status checks, PR comments) — not full repo write access.
- Audited page content is processed transiently for resource extraction; raw HTML/asset bytes are not retained beyond the audit job's processing window unless the user opts into an evidence-archive feature (v2+).
- Data encryption in transit (TLS everywhere) and at rest (managed database encryption).

---

## 15. Success Metrics and Evaluation Plan

| Metric | Target (MVP demo) | Target (v2, 90 days post-launch) |
|---|---|---|
| Time-to-first-audit-result | < 2 min from signup | < 90s p95 |
| % of recommendations with cited evidence | 100% | 100% |
| EcoScore formula reproducibility (same input → same score) | 100% deterministic | 100% deterministic |
| Forecast pages showing explicit assumptions | 100% | 100% |
| CI regression gate false-positive rate | N/A (not in MVP) | < 5% |
| Weekly active audited projects | Demo-scale (5–10 test sites) | 100+ projects |
| User-reported trust in numbers (qualitative survey) | Directional feedback from judges/testers | ≥ 4/5 average trust rating |

**Evaluation plan:** internal QA against a fixed set of 10 benchmark URLs re-audited across builds to check for calculation stability; usability testing with 5–8 target-persona users before each major release; methodology review checklist (does every number have a range? a version? a source?) run against every new screen before ship.

---

## 16. Risks and Mitigation Plan

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Carbon estimates challenged as inaccurate/greenwashing | Medium | High | Confidence ranges, methodology versioning, visible limitations page (§13); mirrors what leading tools like CCF already disclose (`research.md` §3) |
| Crawler abused for SSRF/internal network scanning | Medium | High | Strict URL allow/deny + private-IP blocking + DNS-rebind protection (`backend.md`) |
| CO2.js/SWDM methodology changes again (as it did v3→v4) and breaks historical comparability | Medium | Medium | Methodology-version field on every audit; re-baseline tooling; explicit "methodology changed" chart annotations |
| Team (5-person, hackathon-origin) underestimates backend complexity of a real crawler+queue system | High | High | MVP scope deliberately excludes CI integration, ML forecasting, multi-tenancy; single-page audits only at MVP |
| Green Web Foundation dataset coverage gaps mislabel real green hosts as "unconfirmed" | Medium | Low–Medium | UI copy explicitly frames "unconfirmed" as "not yet verified," not "not green" (`research.md` §3, §8) |
| Third-party/consent-gated resources undercounted in crawl | Medium | Medium | Audit report explicitly lists "resources not captured" (e.g., blocked by robots, geofenced, or consent-walled) |
| Scope creep toward full cloud-infrastructure carbon accounting (CCF's territory) | Medium | Medium | Explicit product boundary: Carbonerra owns front-end/hosting-layer web carbon; infra-level accounting is a documented non-goal for v1–v3 |

---

## 17. 12-Week Execution Plan (Five-Person Team)

Roles: **Backend Lead (BE)**, **Frontend Lead (FE)**, **Full-stack/Infra (INFRA)**, **Data/ML + Carbon Methodology (DATA)**, **Design/PM (DESIGN)**.

| Week | Backend (BE) | Frontend (FE) | Infra (INFRA) | Data/Methodology (DATA) | Design/PM (DESIGN) |
|---|---|---|---|---|---|
| 1 | Project scaffolding, FastAPI skeleton, DB schema draft | Next.js scaffolding, design tokens from `ui.md` | Docker Compose (Postgres, Redis) | Research CO2.js/SWDM integration, finalize methodology doc | Finalize sitemap, wireframes for audit + dashboard |
| 2 | Auth (JWT), users/orgs models | Auth flow UI, onboarding screens | CI pipeline (lint/test) | Prototype CO2.js calc as standalone service | Component inventory, design tokens in code |
| 3 | Playwright crawler job (single page) | Add-website / audit-config page | Queue worker deployment (Celery/Arq) | Green Web Foundation API integration | Empty/loading/error states for audit flow |
| 4 | Resource extraction + persistence | Audit progress page (polling) | Worker scaling test | Carbon calc engine wired into audit pipeline | Dashboard layout finalized |
| 5 | EcoScore engine (formula v1) | Dashboard + EcoScore UI | Observability (structured logs) | Confidence-range model for estimates | Hotspot page wireframe → build |
| 6 | Hotspot breakdown API | Hotspot page build | — | Validate calc against 5 benchmark URLs | Recommendation card design |
| 7 | Rule-based recommendation engine | AI recommendations page | — | Author 12–15 deterministic rules w/ evidence citations | Carbon Lab simulator design |
| 8 | Carbon Lab simulation API (uses real audit data) | Carbon Lab UI (sliders, before/after) | — | Validate simulator math against calc engine | Forecast page design |
| 9 | Forecast API (linear + assumption panel) | Forecast page UI | — | Document forecast model limitations | Budget/regression page design |
| 10 | Carbon budget model + manual regression compare | Budget page + regression comparison UI | Load-test audit pipeline | Regression severity classification rules | Reports page design |
| 11 | Reporting export (shareable HTML report) | Reports page, settings/integrations page | Deployment to staging | End-to-end methodology QA against benchmark set | Full UX pass, accessibility audit |
| 12 | Bug fixes, API contract polish (`api_contracts.md` alignment) | Bug fixes, responsive/mobile pass | Production deployment, monitoring dashboards | Final validation report + demo dataset | Demo script, pitch deck, final design QA |

**Buffer note:** Weeks 11–12 intentionally light on new features to absorb the inevitable slippage in a first-time full-stack build; 3D visualization and CI live integration are treated as stretch goals only if the team is ahead of schedule by week 9.
