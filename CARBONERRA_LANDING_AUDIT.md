# Carbonerra Landing Page & Hero Audit

## 1. Current Framework & Runtime
- **Next.js:** 14.2.15 (App Router, React 18.3.1, TypeScript).
- **Styling:** Tailwind CSS 3.4.14 with custom design tokens (`forest`, `lime`, `sage`, `cream`, `surface`).
- **Animation & Visual Libraries Already Installed:**
  - `three` & `@types/three`: Hardware WebGL rendering.
  - `gsap`: Timeline and ScrollTrigger capabilities.
  - `lucide-react`: Technical icon set.
  - `@tgwf/co2`: Official Sustainable Web Design Model (SWDM v4) reference engine.

---

## 2. Existing Landing Component Architecture
- **Route:** `src/app/page.tsx`
- **Key Modules:**
  - `LandingPageContent`: Primary client component containing Hero, Audit Cockpit, 3D Feature Matrix, and API Explorer.
  - `CarbonGlobe3D`: 3D Three.js globe featuring real country markers, datacenter node meshes, great-circle telemetry arcs, and orbital rings.
  - `FallingLeaves`: Ambient canvas particle layer.
  - `ApiExplorer`: Live sandbox for developers.
  - `PayloadBreakdown`: Segment breakdown of transferred bytes.

---

## 3. Design Weaknesses to Eliminate
1. **Vertical Stacking Flatness:** The hero previously had elements stacked with standard Tailwind spacing rather than fluid `--u` multi-plane depth layering.
2. **Standard Buttons:** Primary audit triggers used standard CSS transitions instead of the fluid, metallic dispersion shader found in `sylva-hero`.
3. **Static Typography:** The headline was static text rather than staggered mask reveals (`clip-path` lines with sequential millisecond delays).
4. **Disjointed Pointer Motion:** Mouse interactions were computed independently on cards instead of a unified single-rAF CSS custom property system (`--px`, `--py`, `--pd`).

---

## 4. Preservation Invariant
- **Live URL Audit Pipeline:** The Cheerio crawler, Google PageSpeed PSI v5 dual-source validation, and SSRF guardrails in `src/app/api/audit/route.ts` must remain fully operational.
- **Dynamic Cockpit Rendering:** When an audit finishes, the results cockpit and telemetry breakdown must seamlessly transition in without page reload.
- **Zero Drift on AI Sidecar:** The isolated companion service on port 3002 (`ai-sidecar/`) must remain intact.
