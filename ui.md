# Carbonerra — UI/UX Specification

Builds on the existing mockup's visual identity (`research.md` §2) — kept and refined, not discarded — while fixing accessibility and honesty-about-uncertainty gaps identified in `research.md` §7–8.

---

## 1. Brand Personality & Design Principles

**Personality:** scientific-credible, calm-confident, developer-respecting. Not preachy, not cutesy-green, not corporate-ESG-generic.

**Principles:**
1. **Evidence over assertion** — every carbon number sits next to its source and range.
2. **Developer-grade density** — this is a working tool, not a marketing page; favor information density over whitespace-for-its-own-sake once past the landing page.
3. **Calm color, not eco-cliché** — avoid overuse of bright green as a blanket "sustainability" signal; reserve saturated green for *verified* good outcomes only.
4. **Explain, don't just score** — every score/grade has a visible "why" one click away.

---

## 2. Visual Direction

Retain the mockup's forest/sage palette and geometric warmth, but rebuild as a proper semantic token system with light/dark modes and AA contrast (the raw mockup's neon-lime-on-cream combination is decorative only and must never carry text at small sizes).

---

## 3. Typography

- **Display:** Anton (open-source, Google Fonts) — hero numbers, section headers only, never body text.
- **UI/Body:** Inter (open-source, variable font) — 400/500/600/700 weights, tight tracking for body (0), slight tracking (0.02em) for all-caps labels.
- **Monospace:** JetBrains Mono — code snippets, byte/gram figures, methodology version strings, PR-patch blocks.

Type scale (rem, 16px base): `12/14/16/18/20/24/30/36/48/64` mapped to `caption/small/body/body-lg/h6/h5/h4/h3/h2/h1(display)`.

---

## 4. Color System

### 4.1 Core palette (from repo, refined)
| Token | Hex | Usage |
|---|---|---|
| `forest-900` | `#01472e` | Dark-mode base / primary brand ink |
| `forest-700` | `#0d5c3e` | Primary buttons (light mode) |
| `sage-300` | `#ccd5ae` | Success-adjacent backgrounds |
| `olive-200` | `#e9edc9` | Subtle section backgrounds (light mode) |
| `cream-50` | `#fefae0` | Light-mode page background |
| `moss-500` | `#a3b18a` | Secondary accents, chart series 2 |
| `lime-500` | `#cbff00` | **Restricted use**: single high-emphasis CTA highlight or a "verified" badge glow only — never body text, never on cream background at small size (fails AA) |

### 4.2 Semantic tokens (light / dark)
| Token | Light | Dark | Purpose |
|---|---|---|---|
| `bg-canvas` | `#fefae0` | `#0b1510` | Page background |
| `bg-surface` | `#ffffff` | `#12211a` | Cards |
| `bg-surface-raised` | `#f7f5e6` | `#17281f` | Elevated cards/modals |
| `text-primary` | `#0f2419` | `#eef3ec` | Body text (contrast ≥ 7:1) |
| `text-secondary` | `#3d5346` | `#b7c7bc` | Secondary text (contrast ≥ 4.5:1) |
| `border-default` | `#dfe3cf` | `#243a2e` | Card/input borders |
| `carbon-measured` | `#0d5c3e` | `#3ddc84` | Verified/measured data series |
| `carbon-estimated` | `#4a6fa5` | `#7fa8e8` | Modeled/estimated data series (blue, deliberately *not* green — see §12) |
| `carbon-regression` | `#b3261e` | `#ff6b5e` | Regression/alert states |
| `carbon-improvement` | `#2e7d4f` | `#5fd88f` | Improvement/positive delta |
| `focus-ring` | `#1a73e8` | `#7fa8e8` | Keyboard focus indicator, 2px, 4.5:1 min contrast against adjacent bg |

All text/background pairs above are chosen to meet **WCAG 2.2 AA** (4.5:1 body text, 3:1 large text/UI components); `lime-500` is excluded from any text-color role for this reason.

---

## 5. Spacing, Radius, Shadow, Grid, Breakpoints

- **Spacing scale (px):** 4/8/12/16/24/32/48/64/96, used as Tailwind spacing tokens `1–24`.
- **Radius scale:** `sm=12px` (inputs), `md=20px` (cards), `lg=32px` (large panels), `xl=48px` (hero/marketing sections only) — a toned-down version of the mockup's `2.5–5rem` scale, kept for brand feel on marketing pages but reduced inside the dense dashboard.
- **Shadow:** `sm` (card rest), `md` (hover/raised), `lg` (modal/popover) — soft, low-opacity, forest-tinted rather than pure black, to stay on-brand.
- **Grid:** 12-column, max content width 1440px, gutters 24px (desktop), 16px (tablet), 12px (mobile).
- **Breakpoints:** `sm=640px, md=768px, lg=1024px, xl=1280px, 2xl=1536px` (Tailwind defaults, kept for ecosystem compatibility).

---

## 6. Accessibility Requirements (WCAG 2.2 AA)

- Minimum 4.5:1 text contrast, 3:1 for large text (≥24px/19px bold) and meaningful UI components/icons.
- All interactive elements keyboard-reachable in logical order; visible focus ring (`focus-ring` token) never suppressed.
- Charts: every chart has a "View as table" toggle producing an accessible HTML table with the same data (see §14 per-chart spec).
- Color never the sole carrier of meaning: EcoScore grade shown as letter + number + label, not color alone; regression severity shown as icon + text + color.
- `prefers-reduced-motion` respected: parallax/scroll-reveal/3D animation disabled or reduced to instant/fade-only.
- Forms: labeled inputs, inline error text (not color-only), `aria-live` regions for async audit status updates.
- Touch targets ≥ 44×44px on mobile.

---

## 7. Light Mode / Dark Mode

Both are first-class (not a dark-mode-as-afterthought). Default follows OS preference; user-togglable, persisted per-user. Chart series colors swap to their dark-mode pair (§4.2) rather than simply reducing opacity, to preserve contrast.

---

## 8. Navigation Architecture

**Top-level (authenticated app):**
- Dashboard (org/project overview)
- Websites (list → per-website detail)
  - Audits (history list → audit detail)
  - Hotspots
  - Recommendations
  - Carbon Lab
  - Forecast
  - Budget & Regressions
- Reports
- Settings
  - Organization & members
  - Integrations (GitHub, hosting, grid-intensity provider)
  - Billing (v2+)

**Marketing/pre-auth:** Landing → Sign in / Sign up → Onboarding (first website add).

Primary nav: left sidebar (collapsible) on desktop ≥1024px; bottom tab bar (Dashboard/Websites/Reports/Settings) + top app bar on mobile.

---

## 9. Complete Sitemap

```
/                          Landing
/login, /signup            Auth
/onboarding                First-run: add first website
/app                       Dashboard (org overview)
/app/websites               Website list
/app/websites/new           Add website / audit configuration
/app/websites/:id           Website overview
/app/websites/:id/audits/:auditId               Audit progress (if running) → Audit detail (if done)
/app/websites/:id/audits/:auditId/hotspots      Resource hotspot analysis
/app/websites/:id/audits/:auditId/recommendations  AI recommendations
/app/websites/:id/lab                            Carbon Lab simulator
/app/websites/:id/forecast                       Forecast
/app/websites/:id/budget                         Carbon budget
/app/websites/:id/regressions                    Regression timeline
/app/reports                                     Reports list
/app/reports/:id                                 Report detail / export
/app/settings/org, /integrations, /members       Settings
```

---

## 10. User Flows

**10.1 First audit:** Landing → Sign up → Onboarding "Add your website" → Audit configuration (device/network/crawl-depth) → Audit progress (live status) → Audit detail (auto-redirect on completion) → guided tooltip pointing to Hotspots and Recommendations.

**10.2 Reviewing audit results:** Website detail → Audits tab → select audit → Audit detail (EcoScore, breakdown, top hotspots) → drill into Hotspots for resource-level detail → drill into Recommendations for action items.

**10.3 Using Carbon Lab:** Audit detail → "Simulate optimizations" CTA → Carbon Lab pre-loaded with this audit's real resource data → adjust levers → view before/after + trade-offs → "Apply to Budget" (sets a target) or "Export PR Fix Patch" (code snippet, MVP: static per-rule snippet; v2: repo-aware patch).

**10.4 Setting a budget:** Website detail → Budget & Regressions → "Set budget" → choose per-page or per-project scope → enter threshold (guided by current EcoScore/carbon as a starting suggestion, editable) → confirm → budget now visible on dashboard and future audits evaluated against it.

**10.5 Investigating a regression:** Dashboard alert or email/Slack notification → Regression timeline → select incident → see before/after diff (resource-level deltas, not a fake git diff) → linked recommendation to fix → optional "mark resolved" once re-audited under budget.

**10.6 Viewing forecasts:** Website detail → Forecast → default baseline scenario shown → expand assumptions panel → adjust traffic/growth/grid-intensity sliders → see optimistic/pessimistic bands update → "model limitations" note always visible below chart.

**10.7 Exporting a report:** Any website or org dashboard → "Generate report" → choose scope (single audit / date range / project) and audience (executive summary / developer detail / both) → preview → export (HTML link always; PDF at MVP+ per `upgradation_plan.md` scope) → shareable link with optional expiry.

---

## 11. Page-by-Page Wireframe Specifications

### 11.1 Landing Page
- **Purpose:** explain the product, establish credibility (methodology transparency as a selling point), drive signup.
- **Major components:** hero with live-feeling (but clearly sample/demo-labeled) EcoScore card; "how it works" 3-step; methodology credibility strip (logos/names of CO2.js, SWDM, GWF referenced honestly as *underlying methodology*, not partners); feature highlights; CTA footer.
- **Primary CTA:** "Audit your site free."
- **Secondary actions:** "See sample report," "Read our methodology."
- **Data shown:** static/demo data, clearly labeled "Sample data."
- **Empty/Loading/Error:** N/A (static marketing page).
- **Mobile behavior:** single column, hero card stacks above copy.

### 11.2 Sign In / Onboarding
- **Purpose:** authenticate and capture first website.
- **Major components:** auth form (email/password + magic link option), org-name prompt (if first login), "add your first website" URL input.
- **Primary CTA:** "Continue."
- **Secondary actions:** SSO (v2+), "skip and explore sample project."
- **Data shown:** none (forms only).
- **Empty state:** N/A. **Loading:** button spinner during auth. **Error:** inline field errors, non-color-only.
- **Mobile:** full-width single-column form.

### 11.3 Add Website / Audit Configuration
- **Purpose:** configure and launch an audit.
- **Major components:** URL input with validation; profile selector (Desktop/Mobile/Both); network profile (Fast broadband/4G/Slow 3G); crawl depth (Single page / Up to N pages, v2); advanced options (custom headers/auth for staging sites — v2).
- **Primary CTA:** "Start audit."
- **Secondary actions:** "Save as default config for this website."
- **Data shown:** none pre-audit; config summary before submit.
- **Empty state:** first-time helper text explaining what happens next.
- **Loading:** N/A here (loading happens on next page). **Error:** URL validation error (invalid, unreachable, or blocked-per-SSRF-policy URL) shown inline with plain-language reason.
- **Mobile:** stacked form, sticky bottom CTA.

### 11.4 Audit Progress Page
- **Purpose:** show live status of an in-flight audit.
- **Major components:** step tracker (Validating URL → Crawling → Running Lighthouse → Calculating carbon → Generating recommendations → Done); live log/ticker of resources discovered; estimated time remaining.
- **Primary CTA:** none required (auto-advances); "Cancel audit" secondary.
- **Data shown:** step status, resource count ticking up, elapsed time.
- **Empty state:** N/A. **Loading:** this *is* the loading state — animated step tracker, `aria-live` region announcing step changes for screen readers.
- **Error state:** step-specific failure (e.g., "Lighthouse run failed — showing partial results from crawl") with retry option; partial results still surfaced per `upgradation_plan.md` §12 reliability requirement.
- **Mobile:** vertical step list, same content.

### 11.5 Main Dashboard
- **Purpose:** org/portfolio-level overview across all websites.
- **Major components:** summary cards (total sites, avg EcoScore, total est. monthly carbon, active regressions/alerts); website list/grid with mini EcoScore + trend sparkline per site; recent activity feed (audits completed, budgets breached).
- **Primary CTA:** "Add website."
- **Secondary actions:** filter/sort website list, view report.
- **Data shown:** aggregated estimates, always with "as of [date]" and methodology-version footnote.
- **Empty state (no websites yet):** illustrated prompt + "Add your first website" CTA.
- **Loading:** skeleton cards for summary + list.
- **Error:** toast + inline retry if aggregate data fails to load.
- **Mobile:** summary cards stack 2-up then 1-up; website list becomes vertical cards.

### 11.6 Audit Detail Page
- **Purpose:** single-audit deep dive.
- **Major components:** EcoScore gauge (with range), carbon-per-view + confidence range, page-weight breakdown (stacked bar by resource type), green-hosting attestation card (verified/unconfirmed, not "green/brown" binary), key equivalencies (trees/car-miles, sourced), "Methodology & Limitations" link, quick links to Hotspots/Recommendations/Lab.
- **Primary CTA:** "View recommendations."
- **Secondary actions:** "Simulate in Carbon Lab," "Re-run audit," "Export report."
- **Data shown:** all audit-derived metrics, always range-qualified.
- **Empty state:** N/A (page only exists once an audit completes).
- **Loading:** skeleton gauge + cards (should rarely be seen — usually arrived at post-completion).
- **Error:** "Audit incomplete" banner if partial data, listing what's missing.
- **Mobile:** gauge and cards stack vertically; breakdown chart becomes horizontal-scroll or simplified list+bar.

### 11.7 Resource Hotspot Analysis
- **Purpose:** resource-level prioritization of emission drivers.
- **Major components:** sortable/filterable table (resource, type, size, requests, est. carbon share, cache status); type filter chips (Images/JS/CSS/Fonts/Video/3rd-party); treemap or bar visualization of relative contribution.
- **Primary CTA:** "Fix top hotspot" (deep-links to related recommendation).
- **Secondary actions:** export CSV of resource list.
- **Data shown:** resource-level detail from the crawl; a visible note listing any resources *not* captured (blocked/consent-walled — see `research.md` §8).
- **Empty state:** N/A (always has at least HTML). **Loading:** skeleton table/treemap.
- **Error:** partial-capture warning banner, not a blocking error.
- **Mobile:** table collapses to stacked cards, treemap replaced by ranked list.

### 11.8 AI Recommendations Page
- **Purpose:** prioritized, evidence-cited action list.
- **Major components:** priority tabs/filter (P0 Critical/P1 Recommended/P2 Polish); recommendation cards (title, plain-language cause tied to specific evidence, estimated impact range, effort badge, confidence badge, code snippet drawer); bulk "export all as checklist."
- **Primary CTA (per card):** "View code fix."
- **Secondary actions:** "Simulate this in Carbon Lab," "Mark as done," "Dismiss with reason."
- **Data shown:** rule ID, evidence snippet, impact estimate with stated assumption.
- **Empty state:** "No recommendations — this page is already well optimized for the areas we check" (never implies zero-carbon).
- **Loading:** skeleton cards.
- **Error:** inline "recommendation engine partial failure" note if rule evaluation errors on a subset.
- **Mobile:** cards full-width, code drawer becomes full-screen sheet.

### 11.9 Carbon Lab Simulator
- **Purpose:** what-if exploration using real audit data.
- **Major components:** lever panel (image compression %, JS deferral/removal %, cache TTL, font subsetting toggle, CDN/green-hosting toggle, hosting-region selector); live before/after comparison (carbon, payload, EcoScore delta); trade-off note per lever (effort, risk, UX impact); "Apply to Budget" and "Export PR Fix Patch" CTAs.
- **Primary CTA:** "Apply to Budget."
- **Secondary actions:** "Export PR Fix Patch," "Reset to audited baseline."
- **Data shown:** real audit-derived baseline; simulated target with confidence caveat ("simulated, not yet verified by a re-audit").
- **Empty state:** if no audit exists yet for the site, prompt to run one first.
- **Loading:** recalculation is near-instant (client-side math on already-fetched data) — brief inline spinner only.
- **Error:** if simulation inputs are out of supported bounds, inline validation message.
- **Mobile:** levers as full-width sliders/toggles, comparison view below (stacked, not side-by-side).

### 11.10 Forecast Page
- **Purpose:** scenario-banded future emissions.
- **Major components:** multi-scenario line chart (baseline/optimistic/pessimistic, 1M/6M/12M/24M range selector); editable assumptions panel (traffic growth, page-weight growth, release frequency, grid-intensity trend); "threshold breach" marker if a budget is set; persistent "model limitations" note.
- **Primary CTA:** "Adjust assumptions."
- **Secondary actions:** "Set a budget from this forecast," "Export forecast."
- **Data shown:** projected ranges, never a single hard number for future dates.
- **Empty state:** requires at least one completed audit; prompts to run one.
- **Loading:** skeleton chart.
- **Error:** if assumption inputs produce a degenerate scenario (e.g., negative growth entered oddly), inline validation guardrails.
- **Mobile:** chart simplifies to single-scenario-at-a-time with a scenario switcher tab, assumptions panel becomes a bottom sheet.

### 11.11 Carbon Budget Page
- **Purpose:** define and monitor thresholds.
- **Major components:** budget scope selector (per-page/per-project), threshold input with suggested-value helper, current-vs-budget gauge, alert channel config (email/Slack — v2), history of past evaluations.
- **Primary CTA:** "Save budget."
- **Secondary actions:** "Disable budget," "View regression history."
- **Data shown:** current estimate vs. threshold, headroom/overage %.
- **Empty state:** "No budget set" prompt with suggested starting value from latest audit.
- **Loading:** skeleton gauge.
- **Error:** validation if threshold is nonsensical (e.g., zero or negative).
- **Mobile:** gauge and inputs stack vertically.

### 11.12 Regression Timeline Page
- **Purpose:** chronological view of budget breaches/regressions.
- **Major components:** timeline/list of incidents (date, severity, delta %, triggering audit/deployment if known), incident detail panel (resource-level before/after diff — real data, not a decorative fake diff), linked recommendation, resolution status.
- **Primary CTA:** "Investigate" (per incident).
- **Secondary actions:** "Mark resolved," "Export incident report."
- **Data shown:** severity classification (Minor/Moderate/Severe based on % over budget), resource-level deltas.
- **Empty state:** "No regressions detected" positive-state illustration.
- **Loading:** skeleton timeline.
- **Error:** N/A beyond standard fetch-failure toast.
- **Mobile:** vertical timeline, tap to expand incident detail inline.

### 11.13 Reports Page
- **Purpose:** generate and manage shareable reports.
- **Major components:** report list (scope, date generated, audience type), "Generate new report" flow (scope/audience/date-range selection), preview pane, share-link management (expiry, revoke).
- **Primary CTA:** "Generate report."
- **Secondary actions:** "Copy share link," "Revoke link," "Download."
- **Data shown:** report metadata; preview shows exec-summary and dev-detail sections per audience toggle.
- **Empty state:** "No reports yet" + CTA.
- **Loading:** skeleton list; generation shows progress if PDF rendering takes >2s.
- **Error:** generation-failure toast with retry.
- **Mobile:** list becomes cards; preview opens full-screen.

### 11.14 Settings / Integrations Page
- **Purpose:** org, member, and integration management.
- **Major components:** org profile, member list + roles (v2 RBAC), integration cards (GitHub App connect/disconnect, hosting-provider hints, grid-intensity provider selection: default static / Electricity Maps / UK NESO where applicable), API key management (for programmatic audit submission, v2).
- **Primary CTA:** "Connect GitHub" (integrations tab) or "Invite member" (members tab), context-dependent.
- **Secondary actions:** "Revoke," "Regenerate API key."
- **Data shown:** connection status, last-sync timestamp.
- **Empty state:** each integration card shows a "not connected" state with a Connect CTA.
- **Loading:** skeleton cards during status check.
- **Error:** inline "connection failed / re-authenticate" state, mirroring the app-wide connector-auth-error pattern.
- **Mobile:** cards stack, forms full-width.

---

## 12. Chart Definitions

| Chart | Type | Data inputs | Tooltip content | Color mapping | Accessibility alt |
|---|---|---|---|---|---|
| EcoScore Gauge | Radial gauge/arc | Score 0–100, grade band | Score, grade, "as of [date]" | Band colors (red→amber→`carbon-improvement` green), never gauge-only | Text equivalent: "EcoScore: 78/100 (B), estimated [date]" always rendered in DOM, not canvas-only |
| Page Weight Breakdown | Stacked horizontal bar | Bytes by resource type | Type, KB, % of total | One hue per resource type (not carbon-semantic colors — this is composition, not carbon severity) | "View as table" toggle: resource type / KB / % |
| Hotspot Treemap | Treemap | Resource, size, est. carbon share | Name, type, KB, est. gCO2e share | Sequential single-hue scale by carbon share (not multi-hue rainbow, to stay serious/credible) | Fallback ranked list view (already the mobile default) |
| Forecast Scenario Chart | Multi-line with shaded band | Time, baseline/optimistic/pessimistic values | Date, scenario, value, assumption snapshot | `carbon-estimated` blue family for all lines (differentiated by line style: solid/dashed/dotted), never green (these are projections, not verified good outcomes) | Data table toggle with scenario columns |
| Carbon Lab Before/After | Grouped bar (2 bars: baseline vs. target) | Baseline carbon, simulated target carbon | Value, % change, confidence caveat | `carbon-estimated` for baseline, `carbon-improvement` for target *only if* target is lower | Text summary line always shown above chart: "Estimated Xg → Yg (−Z%, simulated)" |
| Budget Gauge | Linear/radial gauge with threshold marker | Current estimate, threshold | Current value, threshold, headroom % | Green under threshold, `carbon-regression` red over | Text-equivalent status line always present |
| Regression Timeline | Horizontal timeline with severity-colored markers | Incident date, severity, delta % | Date, delta %, severity label | Severity scale: amber (Minor) → orange (Moderate) → `carbon-regression` red (Severe) | List view is the primary accessible representation; timeline is a visual enhancement over it |

---

## 13. Component Inventory (React)

`EcoScoreGauge`, `CarbonRangeBadge`, `MethodologyFootnote`, `ResourceBreakdownChart`, `HotspotTreemap`, `HotspotTable`, `RecommendationCard`, `RecommendationEvidenceChip`, `CodeSnippetDrawer`, `CarbonLabSliderPanel`, `CarbonLabComparisonView`, `ForecastChart`, `ForecastAssumptionsPanel`, `BudgetGauge`, `RegressionTimeline`, `RegressionDiffPanel`, `GreenHostingBadge`, `AuditProgressTracker`, `AuditStepStatus`, `WebsiteCard`, `WebsiteList`, `OrgSummaryCards`, `ReportPreviewPane`, `ShareLinkManager`, `IntegrationCard`, `ThemeToggle`, `AppSidebar`, `MobileTabBar`, `EmptyState`, `SkeletonCard`, `ErrorBanner`, `AccessibleChartTable` (shared "view as table" wrapper used by every chart component).

---

## 14. Sample Microcopy

**Onboarding:** "Add your first website. We'll crawl one page, estimate its carbon footprint, and show you exactly what's driving it."

**Uncertainty disclosure (persistent footer on any carbon figure):** "Estimated using Sustainable Web Design Model v4 + Green Web Foundation hosting data, calculated Aug 25 2026. This is a model, not a direct measurement — see Methodology & Limitations."

**Green hosting — verified:** "✓ Verified green host (Green Web Foundation)."
**Green hosting — unconfirmed:** "Hosting provider not yet verified as green. This does not mean the host is high-carbon — it means no verification is on file."

**Success (audit complete):** "Audit complete. Your EcoScore is 78/100 (B) — see what's holding it back."

**Error (invalid URL):** "We couldn't reach that URL. Check that it's public and starts with https:// — internal or private network addresses can't be audited."

**Error (SSRF-blocked):** "This address can't be audited for security reasons (it resolves to a private or internal network)."

**Carbon Lab caveat:** "This is a simulated estimate based on your last audit. Re-audit after implementing changes to confirm the real-world result."

**Forecast limitations (always visible):** "Forecasts are projections based on the assumptions above, not predictions of certainty. Small changes in traffic or content strategy can shift these lines significantly."

**Regression alert:** "Estimated carbon per page view increased 22% since the last audit (0.24g → 0.29g), which is outside your set budget. Investigate the top contributing resources below."

**Report footer (every exported report):** "Figures in this report are estimates generated by Carbonerra using [methodology version] and are subject to the limitations described at [link]. They are not a substitute for a certified carbon audit."

---

## 15. How the UI Avoids Misleading Users About Estimated Data

1. Every carbon number is rendered through the shared `CarbonRangeBadge`/`MethodologyFootnote` components — there is no code path that displays a bare carbon figure without its range and methodology tag.
2. Color semantics are reserved: green only for *verified* facts (a confirmed green host, a confirmed improvement after re-audit) or values under budget; blue for *modeled/projected* data; never a blanket "everything carbon-related is green" palette.
3. Forecasts and simulations are visually and lexically distinguished from completed-audit results ("simulated," "projected," dashed/dotted line styles) so they can never be mistaken for measured outcomes.
4. A single, consistently-linked "Methodology & Limitations" page (matching `research.md` §8) is reachable in ≤1 click from every screen that shows a carbon number.
5. Hotspot and audit pages explicitly disclose resources the crawler could not capture, rather than silently presenting an undercount as complete.
