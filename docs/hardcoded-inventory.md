# Hardcoded Data & Mock Inventory

This document tracks all hardcoded data, placeholder metrics, simulated physics constants, and static alerts present in the original codebase, along with their intended real data source and migration status.

---

## 1. Inventory Table

| ID | Location | Original Hardcoded Value | Intended Dynamic Source | Replacement Strategy / Status |
|---|---|---|---|---|
| **MOCK-01** | `index.html:L45` | `BUDGET: 0.28G / 0.50G CO2` | Project budget configuration | Dynamic header calculation against audit baseline (`app.js`). |
| **MOCK-02** | `index.html:L58-62` | `A+`, `0.24 g CO2e`, `Cleaner than 88%` | `engine/carbon.py` SWDM v4 calculation | Live calculation based on scanned page transfer payload. |
| **MOCK-03** | `index.html:L66-70` | `14.2 Trees`, `312 kWh`, `1,280 Car Miles` | GHG Protocol equivalencies formula | Dynamic formula: `annual_emissions_kg * EPA_conversion_factors`. |
| **MOCK-04** | `index.html:L74-77` | `Verified 100% Renewable`, `AWS us-east-1` | Green Web Foundation API | Live query to `https://api.thegreenwebfoundation.org/greencheck/{domain}`. |
| **MOCK-05** | `index.html:L102` | `SITE: MAIN-WEBSITE-V2.COM` | Scanned URL hostname | Dynamic reflection of user-audited target domain. |
| **MOCK-06** | `index.html:L136-179` | Static cards: `/hero-banner.png` (3.4MB), `googletagmanager.js` (420KB), `/app-bundle.js` (280KB) | `engine/scanner.py` asset discovery | Dynamically rendered DOM cards matching actual detected heavy assets. |
| **MOCK-07** | `app.js:L70-71` | `baselineCo2 = 0.58`, `baselinePayload = 3.4` | Actual audit payload results | Pass real scanned payload bytes into `updateSimulatorPhysics()`. |
| **MOCK-08** | `app.js:L82` | Fixed traffic multiplier `100,000 views/mo` | User-defined or project setting | Parameterize traffic view volume in calculations. |
| **MOCK-09** | `app.js:L103-144` | Static Chart.js arrays `[0.24, 0.35, 0.52...]` | Statistical projection engine | Projected from live audit baseline and compound growth rates. |
| **MOCK-10** | `app.js:L196-200` | `setTimeout` 1200ms with static alert | `POST /api/audit` | Real HTTP fetch call updating UI state in real-time. |
| **MOCK-11** | `index.html:L307-314` | Fixed `<picture>` AVIF diff | Diagnostic recommendation engine | Generate rule-based recommendations matching identified assets. |
| **MOCK-12** | `index.html:L341-357` | Mock commit `#f8a192` diff | Staging vs Production audit diff | Staging URL comparison via CI endpoint. |

---

## 2. Empty / Loading State Principles
- When no audit has been run, initial views indicate: `SAMPLE BASELINE — AUDIT A LIVE URL TO POPULATE TELEMETRY`.
- When an audit is executing, visual indicators display real-time scanning progress without blocking the screen.
- Errors (e.g. unreachable domain, DNS failure, SSRF rejection) render clear inline diagnostic feedback rather than crashing the page.
