# Carbonerra — 3D "Carbon Flow" Visualization Specification

Status per `upgradation_plan.md` §9: **Should/Could-have, not MVP-blocking.** This spec exists so the team can build it correctly when they get to it, without it ever gating the core 2D product.

---

## 1. Purpose and User Value

The 3D Carbon Flow view exists to answer one question the 2D dashboard cannot answer as intuitively: **"where physically does my page's carbon come from, in sequence?"** It turns the abstract SWDM system boundary (device → network → data center, `research.md` §3) into a traversable scene, helping non-technical stakeholders (PM Priya, Sustainability Sam — `upgradation_plan.md` §4) grasp *why* a data-center-heavy, image-heavy page differs from a lightweight, cache-friendly one, in a way a stacked bar chart communicates less viscerally in a live demo/pitch context.

## 2. Why 3D Is Justified Here

- The underlying data has genuine **spatial/sequential structure** (resource → device → network → CDN → data center → emissions), which is exactly the case where `request_evaluation_checklist` visual guidance favors a diagram over prose or a flat chart.
- It is a strong **hackathon differentiator** — no reviewed competitor (`research.md` §4) offers anything like it.
- It doubles as a **teaching tool**: for users unfamiliar with SWDM's system boundaries, seeing "device," "network," "CDN," "data center" as distinct stages makes the methodology (and its limitations) easier to grasp than a legend on a bar chart.

## 3. When to Use 2D Instead

- Any time the user needs to **compare precise numbers** (exact byte counts, exact carbon deltas) — 2D charts/tables remain the source of truth; the 3D view is explanatory, not the primary data surface.
- On **low-power/mobile devices** or when `prefers-reduced-motion` is set — fallback to the 2D flow diagram (a static SVG version of the same stage sequence) per §11–12.
- For any **screen-reader or keyboard-only user** — the 2D accessible flow diagram (with the same drill-down data available via focus/click) is the required accessible equivalent, not a "best effort" afterthought.
- During **first-time onboarding**, where load time matters more than illustrative depth — default to 2D, offer 3D as an explicit "Explore in 3D" opt-in.

## 4. Concept Description

Scene stages, left to right (or, in an orbit-camera version, arranged radially): **Website (origin)** → **User Device** → **Network** → **CDN (optional stage, only shown if a CDN is detected)** → **Data Center / Hosting** → **Emissions (terminal visualization)**.

Resource "packets" (one abstracted shape per resource *category*, not one per literal file, to keep the scene legible — see §9) flow from the Website stage through to Emissions, sized and colored by their contribution.

## 5. Scene Layout

- **Camera:** isometric-leaning perspective camera, default framing shows all stages in view; orbit controls (drag to rotate, scroll/pinch to zoom) constrained to a reasonable polar-angle range so users can't flip the scene upside down.
- **Stage nodes:** five-to-six abstract geometric "stations" arranged along a gentle S-curve (not a straight line, for visual interest) on a ground plane, each with a floating label (HTML overlay via `Html` from drei, not baked into geometry, so labels stay crisp and accessible).
- **Ground plane:** minimal, low-contrast grid or gradient, procedural only (no texture assets) — matches `ui.md` calm-not-cliché direction.
- **Lighting:** a single soft directional light + ambient fill; no dramatic/dark "doom and gloom" lighting — keep it neutral and legible per the tone guidance for serious/sensitive topics.

## 6. Objects, Labels, Interactions, Camera Behavior, Animation, Transitions

| Element | Description |
|---|---|
| **Resource packets** | Small rounded-box or capsule meshes (procedural `RoundedBoxGeometry`/`CapsuleGeometry`-alternative — see §13 asset strategy for the r128 constraint), one per resource *category* (Images, JS, CSS, Fonts, Video, Third-party, Other), animated flowing along a spline path from Website → Emissions. |
| **Stage nodes** | Larger anchor shapes (e.g., a torus for Network, a flat platform for Data Center) with a floating `Html` label and a small live metric (e.g., "Data Center — grid intensity: 420 gCO2/kWh"). |
| **Labels** | HTML overlays (drei `<Html>`), always horizontal/legible, never baked-in 3D text that can become unreadable at odd angles. |
| **Camera behavior** | Default: gentle auto-orbit (very slow, pausable) when idle; user drag/scroll takes over immediately and disables auto-orbit until reset. Auto-orbit is disabled entirely under `prefers-reduced-motion`. |
| **Animation** | Packets flow continuously at a rate proportional to (a fixed baseline, not literally real request timing) resource count; on hover, the packet's flow pauses and it enlarges slightly. |
| **Transitions** | Switching between audits (e.g., before/after a simulation) cross-fades packet sizes/colors over ~600ms rather than an abrupt cut, so the "what changed" is visually legible. |

## 7. Data Mapping

| Visual property | Mapped data | Notes |
|---|---|---|
| Packet size | Resource-type byte share of total page weight | Log-scaled to avoid tiny/huge outliers breaking legibility |
| Packet count per category | Request count in that category (capped/clustered visually beyond ~12 per category — show "+N more" rather than rendering hundreds of meshes) | Performance-driven cap, see §10 |
| Packet color | Estimated carbon share of that resource type (sequential single-hue scale, matching `ui.md` §12 Hotspot Treemap mapping for cross-view consistency) | Never literal "green=good" — this is a magnitude scale, not a verdict |
| Data Center node glow/ring | Green Web Foundation verified-host status | Solid ring = verified green; dashed/grey ring = unconfirmed (mirrors `ui.md` §11.6 wording — never implies "confirmed non-green") |
| Data Center node label metric | Grid carbon intensity (gCO2/kWh) for the resolved hosting region | Sourced from the configured grid-intensity provider (`backend.md` §Green-hosting abstraction) |
| Network stage thickness/particle density | Total transfer bytes | |
| Emissions stage (terminal) | Aggregate estimated gCO2e per visit, with the same confidence range shown in 2D | Rendered as an `Html` overlay panel docked at the terminal stage, not as 3D typography |

## 8. Interaction Details

- **Hover** (desktop): packet or stage node highlights, cursor becomes pointer, a tooltip (`Html` overlay) shows name + metric + one-line description.
- **Click:** opens a docked side panel (not a new page) with full detail for that resource category or stage, including a link to the relevant `ui.md` Hotspot/Recommendation page for full data.
- **Focus (keyboard):** all interactive nodes are reachable via Tab in a defined logical order (Website → Device → Network → CDN → Data Center → Emissions, then per-category packets); focus ring uses the same `focus-ring` token as the 2D app for visual consistency, rendered as an `Html`-overlaid outline since WebGL objects can't natively show a CSS focus ring.
- **Keyboard navigation:** Enter/Space activates the same drill-down panel as click; Escape closes the panel and returns focus to the triggering node; arrow keys optionally nudge camera orbit for keyboard-only exploration (non-essential — the scene must be fully usable via the drill-down panels alone, without requiring camera manipulation).
- **Drill-down panel:** reuses `ui.md` §13 components (`ResourceBreakdownChart`, `MethodologyFootnote`, `CarbonRangeBadge`) inside the docked panel, so the 3D scene never introduces a second, inconsistent way of presenting the same numbers.

## 9. Visual Encoding Rules

1. Color encodes **magnitude of carbon contribution** on a single sequential scale — never a multi-hue "category color wheel," to avoid implying qualitative judgments (e.g., "JS is bad, images are worse") that the data doesn't cleanly support.
2. Verified/unconfirmed status (green hosting) is encoded **separately**, via ring style (solid vs. dashed) and an icon, never by hue alone — consistent with `ui.md` §6 (color never the sole carrier of meaning).
3. Size encodes byte share; count is capped and clustered (§10) rather than rendering one mesh per literal HTTP request.
4. No packet, node, or label is ever colored pure/bright green to mean "good" unless it reflects a *verified* fact (matches `ui.md` §12 discipline against greenwashing color use).

## 10. Motion-Reduction Behavior

- `prefers-reduced-motion: reduce` detected via `window.matchMedia`: auto-orbit disabled, packet flow animation replaced with static positioned packets (no continuous motion), transitions between states become instant cuts or a simple opacity cross-fade capped at 200ms instead of animated repositioning.
- A manual "Reduce motion" toggle is also exposed in the scene's UI chrome regardless of OS setting, for users who want control independent of their system-wide preference.

## 11. Mobile Fallback

- Below `md` breakpoint (768px) or on touch devices with constrained GPU tiers (heuristic: `navigator.hardwareConcurrency` low + no WebGL2, or simply viewport width), the 3D canvas is **not loaded at all** by default. Instead render the **2D flow diagram** (a static/lightly-animated SVG built with the same stage sequence, same data mapping rules from §7, rendered via the Visualizer's SVG diagram module) with an explicit "View in 3D" button that lazy-loads the WebGL bundle only on demand and only after a capability check.
- If a user on mobile explicitly opts into 3D, controls switch to touch-drag-to-orbit / pinch-to-zoom, and the drill-down panel becomes a full-screen bottom sheet rather than a docked side panel.

## 12. Low-GPU Fallback

- Feature-detect WebGL support and a minimal capability bar (checking for WebGL2 or a reasonably recent WebGL1 context) before attempting to mount the R3F canvas.
- On failure or low-end detection, render the same static 2D flow diagram used for mobile (§11), with a small explanatory note: "3D view isn't available on this device — showing the 2D flow diagram instead," never a silent blank canvas or a hard error.
- No essential data is ever exclusive to the 3D view — the 2D diagram and the standard dashboard/hotspot pages always carry the complete dataset, satisfying the "3D must enhance, never gate" principle from the brief.

## 13. Performance Budget

- Target: **≤ 3MB** additional JS/asset payload for the 3D bundle (code-split, loaded only when the view is opened), **60fps** on a mid-tier laptop GPU, **≥30fps** minimum acceptable on the lowest supported tier before falling back to 2D.
- Mesh count budget: ≤ ~150 active packet meshes on screen at once (achieved via the per-category clustering/capping rule in §7); use instanced meshes (`InstancedMesh` via drei's `Instances`) for repeated packet geometry rather than individually mounted meshes.
- No large textures; all materials use flat/standard materials with token-driven colors (procedural only, per §14).
- Canvas paused (render loop stopped) when the tab/view is not visible (`document.visibilityState`) to avoid wasted GPU/battery when backgrounded.

## 14. Recommended Stack

- **React Three Fiber** (R3F) as the React-Three.js binding.
- **@react-three/drei** for `Html` overlays, `Instances`/`InstancedMesh` helpers, and camera controls (`OrbitControls` — noting the environment constraint that r128's `THREE.OrbitControls` import path must be used correctly and that `THREE.CapsuleGeometry` is unavailable pre-r142, so packets use `CylinderGeometry`/`SphereGeometry`/`RoundedBoxGeometry`-style custom geometry instead, per the frontend environment's Three.js version constraints).
- **Three.js** directly only for any custom geometry/shader needs beyond what drei exposes.
- **WebGL fallback strategy:** capability-detect before mount (§12); no reliance on WebGPU or any experimental API given broad-device-support requirements.

## 15. Asset Strategy

**Procedural geometry only.** No imported 3D models, no texture files, unless a specific illustrative need is identified later and explicitly justified (e.g., a simple icon sprite for stage labels, still preferably SVG-in-`Html` rather than a texture). This keeps the bundle small (§13) and avoids any licensing/asset-sourcing overhead for a student team.

## 16. Suggested React Component Structure

```
/components/carbon-flow/
  CarbonFlowScene.tsx        // Canvas root, capability-detect + fallback switch
  CarbonFlowCamera.tsx       // Camera + OrbitControls config, reduced-motion handling
  StageNode.tsx              // Single stage (Device/Network/CDN/DataCenter/Emissions)
  ResourcePacketGroup.tsx    // Instanced packets for one resource category
  FlowSpline.tsx             // Path geometry connecting stages
  StageLabel.tsx             // Html-overlay label + live metric
  DrillDownPanel.tsx         // Docked/bottom-sheet detail panel (reuses ui.md components)
  CarbonFlowFallback2D.tsx   // Static SVG flow diagram (mobile/low-GPU/reduced-motion path)
  useCarbonFlowData.ts       // Hook: transforms audit API response into scene data (see §17)
  useDeviceCapability.ts     // Hook: WebGL/GPU/viewport capability detection
```

## 17. Data Interface Between FastAPI and the 3D Frontend

The 3D view consumes the **same audit-result payload** used by the 2D hotspot/breakdown pages (`api_contracts.md` §Audit Result / Resource Hotspot) — no bespoke backend endpoint. A frontend transform hook (`useCarbonFlowData`) reshapes it into scene-ready data:

```ts
interface CarbonFlowSceneData {
  auditId: string;
  methodologyVersion: string;
  stages: {
    device: { label: string; totalBytes: number };
    network: { label: string; totalBytes: number; requestCount: number };
    cdn?: { label: string; provider?: string };
    dataCenter: {
      label: string;
      hostingProvider?: string;
      greenVerified: boolean;         // from Green Web Foundation dataset check
      gridIntensityGCo2PerKwh?: number;
    };
    emissions: {
      gCo2ePerVisit: number;
      rangeLow: number;
      rangeHigh: number;
    };
  };
  resourceCategories: Array<{
    category: "image" | "js" | "css" | "font" | "video" | "third_party" | "other";
    totalBytes: number;
    requestCount: number;
    carbonShareGrams: number;   // this category's share of total estimated gCO2e
    displayCount: number;       // capped count of packets to actually render (see §10)
  }>;
}
```

## 18. Pseudocode for Scene Data Transformation

```ts
function buildCarbonFlowSceneData(auditResult: AuditResultResponse): CarbonFlowSceneData {
  const byCategory = groupResourcesByCategory(auditResult.resources);

  const resourceCategories = byCategory.map((group) => ({
    category: group.category,
    totalBytes: sumBytes(group.resources),
    requestCount: group.resources.length,
    carbonShareGrams: estimateCategoryCarbonShare(group, auditResult.carbon),
    // cap rendered packets for performance; real count still shown in the label/tooltip
    displayCount: Math.min(group.resources.length, MAX_PACKETS_PER_CATEGORY),
  }));

  return {
    auditId: auditResult.id,
    methodologyVersion: auditResult.carbon.methodologyVersion,
    stages: {
      device: { label: "User Device", totalBytes: auditResult.summary.totalBytes },
      network: {
        label: "Network",
        totalBytes: auditResult.summary.totalBytes,
        requestCount: auditResult.summary.requestCount,
      },
      cdn: auditResult.hosting.cdnDetected
        ? { label: "CDN", provider: auditResult.hosting.cdnProvider }
        : undefined,
      dataCenter: {
        label: "Data Center",
        hostingProvider: auditResult.hosting.provider,
        greenVerified: auditResult.hosting.greenVerified,
        gridIntensityGCo2PerKwh: auditResult.carbon.gridIntensity?.dataCenter,
      },
      emissions: {
        gCo2ePerVisit: auditResult.carbon.perVisit.value,
        rangeLow: auditResult.carbon.perVisit.rangeLow,
        rangeHigh: auditResult.carbon.perVisit.rangeHigh,
      },
    },
    resourceCategories,
  };
}
```

## 19. Testing Checklist

- [ ] Scene mounts and renders all stages correctly for a sample audit with a CDN detected, and correctly *omits* the CDN stage when none is detected.
- [ ] Packet sizing/coloring matches the same underlying numbers shown on the 2D Hotspot page (cross-view consistency check).
- [ ] `prefers-reduced-motion` correctly disables auto-orbit and continuous packet animation.
- [ ] Manual "Reduce motion" toggle works independent of OS setting.
- [ ] Keyboard-only navigation reaches every stage and category node in a logical order; Enter/Space opens drill-down; Escape closes and restores focus.
- [ ] Screen reader: drill-down panel content is announced correctly; the 3D canvas itself is marked `aria-hidden` with an adjacent accessible summary/table available (the 2D fallback diagram serves this role and should be reachable, not just a decorative canvas with no text alternative).
- [ ] Low-GPU/no-WebGL2 device correctly falls back to the 2D flow diagram with the explanatory note, no console errors, no blank canvas.
- [ ] Mobile viewport defaults to 2D with a working "View in 3D" opt-in.
- [ ] Performance: frame rate stays within budget (§13) on a mid-tier reference device; bundle size for the 3D chunk measured and under the 3MB budget.
- [ ] Before/after transition (e.g., loading a different audit or simulation result into the same scene) cross-fades correctly without abrupt pops.
- [ ] Tab visibility change pauses/resumes the render loop as expected.

## 20. Text-Only Wireframe / Scene Diagram

```
┌───────────────────────────────────────────────────────────────────────────┐
│  [Reduce motion ⏻]                              [View as 2D] [Reset view] │
│                                                                             │
│      ●Website        ⬡Device        ◎Network      ▢CDN*      ▣DataCenter  │
│        │  \             │  \            │  \          │  \        │        │
│        │   ● images     │   ● images    │   ●●●●      │   ●●      │  ◉──▶ Emissions
│        │   ●● js        │   ●● js       │   ●●●       │   ●●      │   (gCO2e/visit
│        │   ● css        │   ● css       │   ●         │   ●       │    + range,
│        │   ● fonts      │   ● fonts     │   ●         │   ●       │    docked panel)
│        │   ●●● other    │   ●●● other   │   ●●        │   ●●      │
│                                                                             │
│  Stage label (Html overlay): "Data Center — grid intensity 420 gCO2/kWh,   │
│  hosting: Example Cloud — ○ Unconfirmed green host"                        │
│                                                                             │
│  [Click/tap any stage or packet cluster → docked Drill-Down Panel opens    │
│   with ResourceBreakdownChart + CarbonRangeBadge + MethodologyFootnote]    │
│                                                                             │
│  * CDN stage rendered only if detected in the audit's hosting data.        │
└───────────────────────────────────────────────────────────────────────────┘
```
