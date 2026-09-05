# Carbonerra Hero Implementation Status & Checklist

## Implementation Milestones
- [x] **Milestone 1: Reference Acquisition & Deep Inspection**
  - Cloned `devinilabs/sylva-hero` to scratch directory.
  - Inspected MIT License, NOTICE.md, index.html (4,305 lines), assets.
  - Authored `REFERENCE_HERO_ANALYSIS.md`.
  - Authored `CARBONERRA_LANDING_AUDIT.md`.

- [ ] **Milestone 2: Fluid Multi-Plane Stage & CSS Architecture**
  - Implement fluid design unit `--u: calc(100vw / 1600)` with 1600x880 reference frame.
  - Implement unified single-rAF pointer parallax system (`--px`, `--py`, `--pd`).
  - Add staggered entrance masks (`.mask`, `clip-path` split-text reveals).
  - Add engineering column guides (`.guides i`) and massive "CARBONERRA" ghost wordmark.

- [ ] **Milestone 3: Liquid Metal Dispersion Shader Button**
  - Implement WebGL2 liquid dispersion shader button (`mountLiquidMetal`) adapted with Carbonerra's carbon-lime `#cbff00` palette, wave ripples, and caustic ribbons.

- [ ] **Milestone 4: Rebuild Hero Experience in `src/app/page.tsx`**
  - Combine technical eyebrow, staggered mask headline, fluid lede, URL audit form, 3D Carbon Globe, and live telemetry stat dials.
  - Connect real audit submission state to visual transitions.

- [ ] **Milestone 5: Verification & Quality Testing**
  - Compile production build (`npm run build`).
  - Verify live HTTP 200 response on `http://localhost:3001/`.
  - Test responsive breakpoints (desktop, tablet, mobile).
  - Verify zero console errors and preserved audit workflow.
