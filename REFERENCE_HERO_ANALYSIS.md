# Reference Hero Analysis: `devinilabs/sylva-hero`

## 1. Cloned Repository & Provenance
- **Repository URL:** `https://github.com/devinilabs/sylva-hero.git`
- **Origin & Authorship:** Extracted standalone distribution of `SylvaHero` from [MengTo/threeui](https://github.com/MengTo/threeui) (ThreeUI Community), authored by **Meng To**.
- **License:** **MIT License** (Copyright (c) 2026 Meng To).
- **Bundled Assets & Licenses:**
  - `inner-green-assets/three.min.js`: Three.js r149 (MIT License).
  - `inner-green-assets/lexend-latin.woff2`: Lexend Font (SIL Open Font License 1.1).
  - `inner-green-assets/card-ecostove.jpg` & `card-ethos.jpg`: ThreeUI MIT release.
- **Reuse Decision:**
  - Architecture, mathematical formulas (fluid `--u` scaling, dispersion shaders, CSS custom property parallax, mask animations) are MIT-permissible.
  - The branding, imagery, and theme must be completely transformed into **Carbonerra's Earth Intelligence & Developer Telemetry** design system (carbon-lime accents `#cbff00`, forest green, electric cyan, real web telemetry, and URL auditing).

---

## 2. Exact Files Responsible for the Hero
- `index.html`: Contains the full DOM layout, CSS styles (fluid `--u` scaling, custom bezier easings, responsive breakpoints), WebGL2 liquid metal button shader, and procedural Three.js scene.
- `inner-green-assets/three.min.js`: Three.js r149 runtime.
- `inner-green-assets/lexend-latin.woff2`: Variable geometric typeface.

---

## 3. Hero DOM / Component Structure
The hero is composed inside `<main class="hero" id="hero">` with an isolated stacking context:
1. **Canvas Layer (`<canvas id="scene">`):** Fullscreen WebGL2 canvas rendering the 3D world, camera parallax, and particle streams.
2. **Floating Top Navigation (`.dock-wrap` -> `.dock.par-dock`):** Apple-inspired glass dock with icons, hover bloom, and magnetic feel.
3. **Centered Reference Stage (`.stage#stage`):**
   - Centred at 50%/50% using margin offsets on a 1600 × 880 reference frame (`--u: calc(100vw / 1600)`).
4. **Column Guides (`.guides`):** Subtle vertical reference lines at `405 * var(--u)`, `748 * var(--u)`, and `1091 * var(--u)`.
5. **Ghost Wordmark (`.ghost`):** Giant background typography (`font-size: calc(310 * var(--u))`) layered behind foreground elements.
6. **Floating Content Cards (`.card--about`, `.card--stove`):**
   - Image portal with pixel-reveal shaders and metadata labels.
   - Parallax depth properties (`--pd: 10`, `--pd: 22`).
7. **Headline (`.headline`):**
   - Split-line typography using `<span><i style="--d:260ms">...</i></span>` with `clip-path` entrance masks.
8. **Lede Paragraph (`.lede`):** Crisp, readable mission statement.
9. **Interactive Primary Action (`.liquid-stage`):**
   - WebGL2 liquid-metal dispersion shader button with dynamic ripple waves and caustic ribbons.
10. **Telemetry Stat Badges (`.stat--a`, `.stat--b`):**
    - Technical metric dials with radial tick SVG marks and live measurements.
11. **Bottom Discovery Indicator (`.scroll`):**
    - Pulsing scroll track linking the hero to downstream workflow sections.

---

## 4. Animation, Timing, and Easing Patterns
- **Primary Design Unit:** `--u: calc(100vw / 1600)` clamped at `>=1900px` to `calc(1900px / 1600)`.
- **Easings:**
  - `--ease: cubic-bezier(.22, .61, .36, 1)` (snappy entry).
  - `--ease-out: cubic-bezier(.16, 1, .3, 1)` (smooth inertial damping).
- **Staggered Delays:**
  - Nav dock: `120ms - 330ms`
  - Headline line 1: `260ms`
  - Headline line 2: `360ms`
  - Lede text: `480ms`
  - Primary button: `600ms`
  - Stat badge A: `700ms`
  - Stat badge B: `770ms`
  - Column guides: `900ms`
  - Ghost wordmark: `1150ms`

---

## 5. Pointer & Scroll Parallax Mechanism
- Every interactive element declares a depth factor `--pd` (e.g. `--pd: 10`, `--pd: 18`, `--pd: 22`).
- A single centralized `requestAnimationFrame` loop calculates smoothed cursor coordinates:
  ```js
  smooth.x += (pointer.x - smooth.x) * 0.055;
  smooth.y += (pointer.y - smooth.y) * 0.055;
  heroEl.style.setProperty('--px', (smooth.x * 24).toFixed(3) + 'px');
  heroEl.style.setProperty('--py', (smooth.y * 24).toFixed(3) + 'px');
  ```
- CSS hardware-accelerates all layers simultaneously with:
  ```css
  transform: translate3d(calc(var(--px) * var(--pd)), calc(var(--py) * var(--pd)), 0);
  ```
  This completely avoids per-element DOM thrashing.

---

## 6. Mapping from Sylva to Carbonerra

| Sylva Reference Concept | Carbonerra Implementation |
|---|---|
| Organic moss branch & drifting pollen | **3D Telemetry Earth Globe & Streaming Resource Transfer Packets** |
| "Into the living world" | **"MAKE YOUR WEBSITE LIGHTER. PROVE THE IMPROVEMENT."** |
| "Our Ethos: Let the wild lead" card | **"Real Telemetry Engine" live scanner card with dual-source validation** |
| Floating specimen knob | **Interactive ±20% SWDM v4 Model Sensitivity Controller** |
| Liquid Metal dispersion button | **High-energy Carbon-Lime dispersion shader audit launch button** |
| Restored canopy stat badges | **Data Center Grid Intensity & Verified Transfer Payload gauges** |
| Column guide lines & ghost wordmark | **Engineering telemetry grid lines & massive "CARBONERRA" ghost typographic backdrop** |
