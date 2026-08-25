# Carbonerra — Research Dossier

**Scope:** Evidence base for the Carbonerra upgrade. Every claim below is labeled:
- 🟢 **VF** = Verified, source-backed fact (linked source, accessed Aug 25, 2026)
- 🟡 **EA** = Reasonable engineering assumption (no single authoritative source, but standard practice)
- 🔵 **PD** = Proposed product decision (Carbonerra's own design choice, not a claim about the world)

---

## 1. Executive Research Summary

The current `feature/carbonerra-platform` branch is a **static, client-only HTML/CSS/JS mockup** (~1,500 total lines: `index.html`, `app.js`, `styles.css`, a 20-line `server.py` that just serves static files). 🟢VF (verified by downloading and inspecting the repository, Aug 25, 2026 — see §2). None of the ten capabilities in the product brief (real audits, real carbon math, persistence, forecasting, regression detection) exist as working software; they exist as **hard-coded numbers and a linear "physics" formula in JavaScript**.

The good news: the *visual and narrative concept* (EcoScore, Carbon Lab, Regression Shield) is well-formed and gives a strong head start on UX/IA. The work required is almost entirely a **from-scratch backend build**: a real crawler, a real carbon-estimation engine grounded in a published methodology, a real database, and a real forecasting/regression pipeline.

The wider market (Website Carbon Calculator, Ecograder, Digital Beacon, Cloud Carbon Footprint, CodeCarbon, Green Web Foundation's CO2.js) already solves *single-point carbon estimation* reasonably well, using a small number of shared open-source primitives (CO2.js / Sustainable Web Design Model, Green Web Foundation's hosting dataset). 🟢VF What is largely **missing from the market** — and therefore where Carbonerra can differentiate — is: (a) continuous regression monitoring wired into CI/CD, (b) an editable, assumption-transparent forecasting model, (c) a what-if simulator that shows trade-offs (not just "savings"), and (d) an AI recommendation layer that cites the specific audit evidence behind each suggestion rather than generic advice. 🔵PD

---

## 2. Repository Assessment

**Branch inspected:** `feature/carbonerra-platform` (tarball pulled via `codeload.github.com`, since the GitHub UI blocks automated fetches). 🟢VF

| File | Lines | What it actually does |
|---|---|---|
| `index.html` | 415 | Single long landing-page-style document containing every "screen" (dashboard, Carbon Lab, forecast, budget, regression) as scroll sections on one page, with static/hard-coded numbers (`0.24 g CO2e / view`, `14.2 Trees / Year`, `AWS us-east-1`, `100% renewable`). |
| `app.js` | 212 | Scroll-reveal/parallax animation; a `updateSimulatorPhysics()` function that computes a fake "before/after" CO2 number from slider positions using an arbitrary linear formula (`baselineCo2 * imgFactor * jsFactor * cacheFactor * hostingFactor`) with **no real page data as input**; a Chart.js forecast chart seeded with static example values. |
| `styles.css` | 808 | A cohesive "deep forest / sage / neon-lime" design system: color tokens, typography (Anton display + Inter + JetBrains Mono), border-radius scale, motion easing curve. |
| `server.py` | 18 | `http.server` static file server on port 8082. No routes, no API, no database. |
| `README.md` | 64 | Marketing-style feature list describing the *aspirational* product, not what is implemented. |

**Findings, all 🟢VF (from direct inspection):**
1. There is **no backend**, no API, no database, no persistence of any kind. Refreshing the page resets everything.
2. There is **no real audit engine** — no crawler, no Lighthouse call, no network-request capture. All "audit" numbers are literal strings in the HTML.
3. The Carbon Lab "physics comparison engine" is **not physics** — it is a client-side linear multiplier applied to two hard-coded baseline numbers (`0.58g` CO2, `3.4MB` payload), independent of any URL the user might type in.
4. The "Regression Shield" section references a specific git commit (`#f8a192`) and a diff view that are **entirely fictional/decorative** — no git integration exists.
5. There is no authentication, no multi-tenancy, no API contract, and no test suite.
6. Security posture: none evaluated because there is no server-side logic to exploit yet, but the *planned* feature set (accepting arbitrary user-submitted URLs and crawling them) is a textbook SSRF surface that must be designed in from day one (see `backend.md` §Security).
7. What **is** reusable: the visual design language (palette, type scale, radius scale, motion curve), the page/section inventory (it maps closely to the sitemap Carbonerra needs), and the feature *narrative* (EcoScore, Carbon Lab, Regression Shield, PR-fix generator) as a product-requirements sketch.

**Conclusion:** Treat the existing branch as a **design mood-board and feature wish-list**, not as a codebase to extend. The rebuild should keep the visual identity (adapted to real light/dark tokens and WCAG-AA contrast, see `ui.md`) and discard essentially all of `app.js` and `server.py`. 🔵PD

---

## 3. Carbon Methodology Comparison

| Methodology | Publisher | System boundary | Output | Maturity / status | Key limitation |
|---|---|---|---|---|---|
| **OneByte model** | Originated in "Lean ICT" report; implemented in CO2.js | Data center + network only (narrow) | g CO2e per byte, flat multiplier | Simple, stable, used as a fallback | Ignores device energy, ignores caching/return visits, ignores green hosting; treated as a rough order-of-magnitude tool, not a precise estimator. 🟢VF |
| **Sustainable Web Design Model v3 (SWDM v3)** | sustainablewebdesign.org; implemented as default in CO2.js until mid-2024 | Data center, network, end-user device, plus a "production" (embodied) segment | g CO2e per byte / per visit, with green-hosting adjustment | Widely adopted default (2020–2024) across Website Carbon, Digital Beacon, Ecograder | Superseded; some data sources dated. 🟢VF |
| **Sustainable Web Design Model v4 (SWDM v4)** | sustainablewebdesign.org, published for community feedback May 2024; added to CO2.js v0.16 (July 1, 2024); slated to become CO2.js's default from v0.18 (Feb 2026) | Same four segments, but **separates operational vs. embodied emissions explicitly** and updates underlying research/data sources | g CO2e per byte / per visit, decomposed into operational + embodied | Current best-practice model; actively maintained by Green Web Foundation | Green Web Foundation itself recommends re-baselining historical estimates back to ~2022 when switching from v3→v4, because results are **not directly comparable across versions**. 🟢VF |
| **Software Carbon Intensity (SCI)** | Green Software Foundation; standardized as **ISO/IEC 21031:2024** | Whole software system: `SCI = ((E × I) + M) / R` (Energy × grid Intensity, plus embodied Materials, per Functional unit R) | A **rate**, not a total — g CO2e per functional unit (e.g., per page view, per API call) | Broader than web pages; industry-adopted (Accenture, UBS, CAST Highlight case studies cited by GSF) | Requires you to define your own functional unit and hardware/energy model; doesn't ship pre-built web-specific coefficients the way SWDM does. 🟢VF |
| **Grid carbon intensity feeds** (Electricity Maps, UK NESO Carbon Intensity API, WattTime) | Commercial (Electricity Maps, WattTime) / public (UK NESO) | Real-time & historical g CO2eq/kWh by region, hourly granularity, life-cycle emissions basis | Time- and location-varying `I` term for SWDM/SCI formulas | Electricity Maps: 190+ countries, updated ~every 15 min, peer-reviewed flow-tracing methodology; UK NESO: free, GB-only, day-ahead forecast | Electricity Maps' full API is commercial (free tier limited); average annual grid factors (as used by most website-carbon tools) mask large intra-day swings — a "green" estimate at 2pm may not hold at 2am. 🟢VF |
| **Green Web Foundation Green Web Dataset / API** | Green Web Foundation (since 2006) | Binary "is this domain hosted on a verified green host" check + directory of verified providers | Boolean / provider metadata | Free API + downloadable dataset; ~7M checks/day against the dataset per GWF's own figures | Coverage is **self-reported and verified only on request** — hosting providers who haven't applied for verification will show as "grey," which is not proof they are *not* green, just unverified. GWF explicitly cautions it "cannot make promises as to the quality of organisation data." 🟢VF |
| **GHG Protocol (Scope 1/2/3) / IPCC AR6** | WRI/WBCSD; IPCC | Organizational, not per-page | Corporate emissions inventories, categories, global warming context | Authoritative macro-accounting standard | Not a page-level methodology — Carbonerra should reference GHG Protocol categories (Scope 2 for hosting electricity, Scope 3 Cat. 1/11 for embodied/end-user device) to help enterprise users map website carbon into their existing inventories, not to compute per-page numbers itself. 🟡EA |
| **Cloud Carbon Footprint (CCF) methodology** | Thoughtworks (open source) | Cloud compute/storage/networking, using Etsy's "Cloud Jewels" energy coefficients × provider PUE × grid factor | Estimated kWh + metric tons CO2e per cloud resource, incl. embodied (Scope 3) hardware manufacturing | Open, transparent, widely deployed (AWS/Azure/GCP) | CCF's own documentation states it "similarly uses point estimates without confidence intervals" and that different tools' estimates "have varied" in Thoughtworks' own experiments — an explicit acknowledgment of uncertainty from a leading tool vendor. 🟢VF |

### 3.1 What this means for Carbonerra's calculation engine
- Use **CO2.js with the SWD model, explicitly pinned to v4**, as the primary per-page-view estimator (front-end/network/data-center/device segments, operational + embodied split). 🔵PD
- Use the **Green Web Foundation Green Web Dataset API** to determine the `green` boolean input to SWDM, and clearly label an "unverified" host as *not confirmed non-green* rather than "brown." 🔵PD
- Offer an optional **SCI-style rate view** (`gCO2e / functional unit`, e.g., per checkout, per 1,000 sessions) for teams that already report against SCI internally. 🔵PD
- Support pluggable **grid-intensity providers** (static regional averages by default; Electricity Maps or UK NESO as an upgrade path for time-of-day-aware estimates) behind an abstraction layer, because the commercial tier of Electricity Maps is a paid dependency Carbonerra should not hard-require for an MVP. 🔵PD
- **Version every audit's methodology** (`methodology_version: "swdm-v4.0 + gwf-dataset-2026-08"`) so historical values remain interpretable if the model changes later — this directly mirrors what Green Web Foundation itself recommends when SWDM versions change. 🟢VF→🔵PD

---

## 4. Competitor Landscape

| Product | Main purpose | Core engine | Target user | Strengths | Weaknesses | Pricing (public info) |
|---|---|---|---|---|---|---|
| **Website Carbon Calculator** (websitecarbon.com) | Single-URL, single-number carbon check | CO2.js / SWDM | Marketers, general public, quick client demos | Most widely recognized brand in the category; clear "methodology" page is one of the better public explainers of SWDM v4 🟢VF | One-off snapshot only, no monitoring, no code-level recommendations | Free, consumer-facing |
| **Ecograder** (Mightybytes) | Broader "sustainability score," not carbon-only | CO2.js + Google PageSpeed Insights/Lighthouse + Green Web Foundation checks 🟢VF | Agencies, sustainability-conscious marketing teams | Actionable Lighthouse-powered recommendations; useful non-carbon equivalencies (car-miles, home energy) 🟢VF | An independent review found its composite score "has no scientific foundation, varies by more than 60% between runs, and uses a proprietary score than can't be compared with other tools" 🟢VF | Free web tool |
| **Digital Beacon** (Aline) | Detailed carbon breakdown by resource type | CO2.js / SWDM | Developers wanting first-visit vs. cached-visit detail | Splits emissions by file category (images/JS/fonts/CSS) and by first vs. return visit — closest existing tool to Carbonerra's "hotspot" concept 🟢VF | Independent reviewers note its results diverge from Website Carbon's with no clear public explanation of why, undermining comparability 🟢VF | Free web tool |
| **Beacon (Figma/browser plugin, also by Mightybytes)** | Shift-left sustainability checks *during design*, not after launch | Heuristic checks on color contrast, font loading, animation load, layout | Product designers | Genuinely novel "cheapest carbon is carbon never designed in" niche; near-zero competition in this exact niche 🟢VF | Not a live-site measurement tool — cannot verify actual production carbon | Unclear/limited public pricing |
| **Kastor** (Spécinov, for the French Government) | Lighthouse-powered sustainable-design audit for public-sector sites | Google Lighthouse-based, with SWDM-style outputs | Government/public-sector teams | Purpose-built for compliance-style sustainability targets 🟢VF | Narrow target market; limited English documentation | Public-sector tool, free |
| **Cloud Carbon Footprint (CCF)** | Estimate carbon of *cloud infrastructure* (compute/storage/network), not front-end page weight | Etsy "Cloud Jewels" coefficients × PUE × grid factor; multi-cloud (AWS/Azure/GCP) | Platform/DevOps/FinOps teams | Open-source, transparent methodology, splits Scope 2 (energy) and Scope 3 (embodied hardware); often paired with FinOps cost dashboards 🟢VF | Backend/infra-only — has no concept of a "web page" or front-end resource; not a competitor for Carbonerra's audit layer but a natural complement for a future "full-stack carbon" story | Open source (self-hosted) |
| **CodeCarbon** | Track CO2 from *code execution* (ML training, scripts) on local/cloud hardware | Measures CPU/GPU/RAM power draw × regional grid intensity | ML engineers, researchers | Simple `pip install`, direct measurement of compute rather than a static estimate; sibling tool `EcoLogits` now covers third-party GenAI API calls (OpenAI, Anthropic, etc.) 🟢VF | Irrelevant to front-end/page-weight carbon; only useful if Carbonerra later wants to report the carbon of its *own* AI recommendation engine | Open source |
| **Google Lighthouse / PageSpeed Insights** | Performance, accessibility, SEO, best-practice auditing (not carbon-native) | Chrome DevTools Protocol; simulated or field (CrUX) data | Web developers broadly | Industry-standard, free, deeply integrated into CI (Lighthouse CI) and most carbon tools reuse it under the hood (Ecograder, Kastor) 🟡EA (widely known; not separately re-verified with a fresh source in this pass) | Zero native carbon output — carbon tools must layer their own math on top | Free |
| **Green Web Foundation Green Web Dataset/API + CO2.js** | Not a product but the **shared open-source substrate** almost every competitor above builds on | Verified-host lookups + SWDM/OneByte calculation library | Tool builders | The de-facto standard; actively maintained; funded by GitHub, Google Season of Docs, Internet Society Foundation, SIDN Fonds, RIPE NCC 🟢VF | Green-hosting coverage depends on providers opting into verification — real coverage gaps exist | Open source / free API |

### 4.1 Adopt / Avoid / Improve
- **Adopt:** CO2.js + SWDM v4 as the calculation core (don't reinvent it); Digital Beacon's per-resource-type breakdown; Ecograder's plain-language equivalencies; Lighthouse for performance signals that correlate with carbon. 🔵PD
- **Avoid:** Ecograder's opaque proprietary composite score that reviewers can't reproduce or compare across tools — Carbonerra's EcoScore must publish its formula and component weights (see `ui.md` §EcoScore). 🔵PD
- **Improve on all of them:** none of the reviewed tools do **continuous regression monitoring tied to deployments/CI**, none publish **confidence intervals or scenario ranges** for a forecast, and none combine a **what-if simulator with a shareable "apply to budget"/PR-fix workflow**. This is Carbonerra's differentiation lane. 🔵PD

---

## 5. Product Gaps in the Existing Carbonerra Concept

1. No real audit pipeline exists (see §2) — the single biggest gap.
2. No stated uncertainty model anywhere in the mockup; numbers are presented with false precision (`0.24 g CO2e / view` with no ± range), which several competitors and reviewers (see §4, `digidop`/`marmelab` sources) flag as a systemic weakness of this whole category, not just Carbonerra's.
3. No versioned methodology field, so any future change to the carbon formula silently invalidates historical trend charts.
4. No CI/CD or git integration despite the README depicting one (`#f8a192` regression card) — entirely fictional in the current build.
5. No multi-tenant/organization data model, no auth, no persistence layer at all.
6. No accessibility consideration in the current design tokens (neon-lime accent `#cbff00` on cream `#fefae0` and similar high-brightness combinations used in the mockup are likely to fail WCAG 2.2 AA contrast in places — to be re-verified against exact usage in `ui.md`). 🟡EA
7. No SSRF/URL-validation strategy for the "audit any URL" feature — a security gap that must be designed in before any crawler ships.

---

## 6. Market Gaps and Differentiation Opportunities (🔵PD unless cited)

| Gap in the market | Evidence | Carbonerra's response |
|---|---|---|
| No mainstream tool does **regression detection wired to CI/CD** | None of the reviewed competitors (§4) offer a PR-check/quality-gate product; Lighthouse CI does this for performance but not carbon | Carbon Budget + Regression Monitoring module with a GitHub Actions check |
| No tool shows **confidence ranges / scenario bands** for forecasts | CCF's own docs admit "point estimates without confidence intervals" 🟢VF; Ecograder's score "varies by more than 60% between runs" with no stated uncertainty 🟢VF | Every Carbonerra number ships with a stated range and a methodology-version tag |
| Existing simulators (where they exist at all) show **savings only**, not trade-offs | Based on direct review of comparable tools' public feature descriptions (§4) | Carbon Lab explicitly shows effort, risk, and any UX/performance trade-off alongside carbon savings |
| No tool explains **why** a recommendation applies to *your* specific page, beyond generic "compress your images" | Same basis | Every AI recommendation cites the specific audit evidence (byte count, resource URL, request count) that triggered it |
| Fragmented tooling: performance (Lighthouse), cloud infra (CCF), and web carbon (Website Carbon/Digital Beacon) live in separate products | Direct comparison across all sources in §3–4 | Carbonerra positions as the layer that connects front-end audit evidence → carbon estimate → developer action, while remaining honestly scoped to the *front-end/hosting* layer rather than claiming to also do infra-level SCI accounting |

---

## 7. Best-Practice UX Findings

- Sustainability/climate dashboards should visually separate **measured/observed** data from **modeled/predicted** data (distinct chart styling, explicit "estimate" labeling) — this is the direct product implication of the uncertainty findings in §3 and §6, and is standard practice in climate-intelligence and financial dashboards generally. 🟡EA
- Avoid single "green = good, red = bad" color coding for *all* sustainability information, since collapsing nuanced, uncertain data into a traffic-light metaphor is a recognized greenwashing pattern; reserve strong green only for **verified** claims (e.g., a confirmed green host from the GWF dataset), and use neutral/blue tones for modeled estimates. 🔵PD
- Dashboards aimed at both executives and developers benefit from a **two-tier information hierarchy**: a top-level scorecard/summary for stakeholders, with drill-down into resource-level detail for engineers — this matches the pattern already implicit in the existing mockup's "Overview → Resource Cards" structure and is reflected in `ui.md`.
- 3D/WebGL should be **optional and non-blocking**: it should never gate access to the underlying 2D data, and must degrade gracefully on low-power devices and under `prefers-reduced-motion` (see `3d_design.md`).

---

## 8. Risks, Limitations, Assumptions, and Anti-Greenwashing Guidelines

**Structural limitations of *any* website-carbon estimate (apply to Carbonerra as much as any competitor):**
- **User device energy** varies enormously by device class, screen size, and CPU load; SWDM uses population averages, not the visitor's actual device. 🟢VF (inherent to the SWDM system-boundary design)
- **Network energy** depends on connection type (fiber vs. cellular vs. satellite) and is again modeled with averages, not measured per-session.
- **Data-center energy and PUE** vary by provider and specific facility; Carbonerra's hosting-provider detection is a best-effort IP/ASN and CNAME lookup, not a guarantee of the exact physical data center serving a given request.
- **Cache-hit rates** for returning visitors are estimated (SWDM's `returnVisitPercentage`/`dataReloadRatio` parameters), not measured from real user monitoring unless Carbonerra later integrates RUM data.
- **Renewable-energy procurement claims** (a host's "100% renewable" marketing) are only as trustworthy as the underlying verification; Carbonerra should surface **GWF-verified** status distinctly from a provider's self-declared marketing claim.
- **Hosting location** can change (CDNs, multi-region failover) between audits, meaning grid-intensity inputs may drift without any code change on the audited site.
- **Dynamic/personalized content** (A/B tests, logged-in states, geolocated content) means a single crawl cannot represent every real visitor experience.
- **Third-party resources** (ads, embeds, chat widgets) may vary per request and may not be fully capturable by a single automated crawl if they're geofenced, consent-gated, or bot-detected.
- **Traffic assumptions** for "carbon per month/year" projections are only as good as the traffic numbers supplied by the user or estimated from public sources; Carbonerra must clearly label projected-traffic-based numbers as scenario outputs, not measurements.

**Anti-greenwashing guidelines for the product (🔵PD, informed by the uncertainty findings above):**
1. Never present a single point estimate without an accompanying range or explicit "±" / confidence qualifier.
2. Never claim an audit "measures" emissions; always use "estimates," "models," or "calculates using methodology vX.Y."
3. Never let a EcoScore or grade imply certainty greater than what the underlying methodology supports.
4. Always show the methodology version and calculation date next to any carbon figure that is displayed, exported, or shared.
5. Do not allow a "green hosting" badge to be shown unless it is backed by GWF-verified status or equivalent evidence; unverified hosts show as "Unconfirmed," not implicitly "not green."
6. Any equivalence statistic (trees, car miles, kWh) must state the conversion source and date, since these vary across publishers and change over time.

---

## 9. Bibliography

All sources accessed August 25, 2026 via web search/fetch during this research pass.

1. Green Web Foundation — CO2.js Methods reference: https://developers.thegreenwebfoundation.org/co2js/methods/
2. Green Web Foundation — "Release Guide: CO2.js v0.16": https://www.thegreenwebfoundation.org/news/release-guide-co2-js-v0-16/
3. Green Web Foundation — CO2.js Carbon Estimation Models: https://developers.thegreenwebfoundation.org/co2js/models/
4. Green Web Foundation — CO2.js product page: https://www.thegreenwebfoundation.org/co2-js/
5. Green Web Foundation — "Customise website carbon calculations" tutorial: https://developers.thegreenwebfoundation.org/co2js/tutorials/customise-website-carbon-calculations/
6. Green Web Foundation — "Understanding the latest Sustainable Web Design Model update": https://www.thegreenwebfoundation.org/news/understanding-the-latest-sustainable-web-design-model-update/
7. Green Web Foundation — "Methodologies for calculating website carbon" explainer: https://developers.thegreenwebfoundation.org/co2js/explainer/methodologies-for-calculating-website-carbon/
8. Scott Logic — "Carbon Emissions of End-User Devices: Part One — SWD Method": https://blog.scottlogic.com/2024/04/05/carbon-emissions-of-end-user-devices-part-one.html
9. Green Web Foundation — Green Web Dataset API: https://www.thegreenwebfoundation.org/tools/green-web-dataset-api/
10. Green Web Foundation — Green Web Dataset overview: https://www.thegreenwebfoundation.org/tools/green-web-dataset/
11. Green Web Foundation — "An update about our green web datasets": https://www.thegreenwebfoundation.org/news/an-update-about-our-green-web-datasets/
12. Green Web Foundation — "Get verified" (hosting-provider verification process): https://www.thegreenwebfoundation.org/tools/green-web-dataset/get-verified/
13. Green Software Foundation — SCI specification repository (ISO/IEC 21031:2024): https://github.com/Green-Software-Foundation/sci
14. Green Software Foundation — SCI specification (hosted): https://sci.greensoftware.foundation/
15. Green Software Foundation — SCI SPEC.md: https://github.com/Green-Software-Foundation/sci/blob/main/SPEC.md
16. Green Software Foundation — SCI standards page: https://greensoftware.foundation/standards/sci/
17. Green Software Foundation — SCI Guidance, API-based grid intensity: https://sci-guide.greensoftware.foundation/I/APIBased/
18. Electricity Maps — Free Tier API: https://www.electricitymaps.com/free-tier-api
19. Electricity Maps — API docs: https://app.electricitymaps.com/docs
20. Electricity Maps — GitHub (open data / methodology FAQ): https://github.com/electricitymaps/electricitymaps-contrib
21. UK National Energy System Operator — Carbon Intensity API: https://carbon-intensity.github.io/api-definitions/
22. CodeCarbon — product site: https://codecarbon.io/
23. Cloud Carbon Footprint — Thoughtworks Technology Radar entry: https://www.thoughtworks.com/en-us/radar/tools/cloud-carbon-footprint
24. Cloud Carbon Footprint — GitHub repository: https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/
25. Project Exigence — Cloud Carbon Footprint methodology summary: https://projectexigence.eu/green-ict-digest/cloud-carbon-footprint/
26. Scott Logic — "Tools for measuring Cloud Carbon Emissions (updated for 2025)": https://blog.scottlogic.com/2025/05/20/tools-for-measuring-cloud-carbon-emissions-updated-for-2025.html
27. Digidop — "Website carbon footprint 2025: 6 free tools and proven techniques": https://www.digidop.com/blog/how-to-measure-and-reduce-carbon-footprint-website
28. go.eco — "Website carbon audit tool review": https://go.eco/news/website-carbon-audit-tool-review/
29. Root Web Design Studio — "Tools for calculating your website's CO2 emissions": https://rootwebdesign.studio/articles/tools-for-calculating-your-websites-co2-emissions/
30. Marmelab — "Digital Carbon Footprint: The Current State of Measuring Tools": https://marmelab.com/blog/2022/04/05/greenframe-compare.html
31. Do Donut — "Your website's digital footprint. Tools to track its CO2 emissions": https://dodonut.com/blog/digital-carbon-footprint-tools/
32. Carbon Badge — "Best Website Carbon Tools 2026: 7 Tools Tested & Compared": https://carbon-badge.com/en/blog/best-website-carbon-tools-compared/
33. HTTP Archive — Web Almanac 2025, Page Weight chapter: https://almanac.httparchive.org/en/2025/page-weight
34. HTTP Archive — Page Weight report (live data): https://httparchive.org/reports/page-weight
35. GitHub repository under research — `GaneshNair007/PCCOE-HACKATHON`, branch `feature/carbonerra-platform` (tarball retrieved via codeload.github.com, Aug 25, 2026).

---

## 10. Summary Table — Claim Confidence Legend Applied

Every substantive claim in `upgradation_plan.md`, `ui.md`, `3d_design.md`, `frontend.md`, `backend.md`, and `api_contracts.md` that concerns market facts, methodology facts, or the current repository inherits its evidence status from this document. Claims about *future Carbonerra product decisions* in those documents are 🔵PD by default and are not re-cited individually.
