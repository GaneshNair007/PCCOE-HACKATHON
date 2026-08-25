# Carbonerra — Frontend Architecture Specification

Stack: Next.js (App Router) + TypeScript + React + Tailwind CSS + shadcn/ui + Recharts + React Three Fiber (optional, code-split per `3d_design.md`) + TanStack Query + Zustand.

---

## 1. Folder Structure

```
/app
  /(marketing)/page.tsx                 // Landing
  /(marketing)/pricing/page.tsx         // (v2+)
  /(auth)/login/page.tsx
  /(auth)/signup/page.tsx
  /(app)/onboarding/page.tsx
  /(app)/app/page.tsx                    // Dashboard
  /(app)/app/websites/page.tsx
  /(app)/app/websites/new/page.tsx
  /(app)/app/websites/[id]/page.tsx
  /(app)/app/websites/[id]/audits/[auditId]/page.tsx
  /(app)/app/websites/[id]/audits/[auditId]/hotspots/page.tsx
  /(app)/app/websites/[id]/audits/[auditId]/recommendations/page.tsx
  /(app)/app/websites/[id]/lab/page.tsx
  /(app)/app/websites/[id]/forecast/page.tsx
  /(app)/app/websites/[id]/budget/page.tsx
  /(app)/app/websites/[id]/regressions/page.tsx
  /(app)/app/reports/page.tsx
  /(app)/app/reports/[id]/page.tsx
  /(app)/app/settings/(org|integrations|members)/page.tsx
  layout.tsx, error.tsx, not-found.tsx, loading.tsx (per route group)
/components
  /ui                    // shadcn/ui primitives
  /charts                 // ResourceBreakdownChart, ForecastChart, BudgetGauge, etc. (ui.md §13)
  /carbon-flow             // 3d_design.md §16 component tree (lazy-loaded)
  /audit                   // AuditProgressTracker, AuditStepStatus
  /recommendations
  /layout                  // AppSidebar, MobileTabBar, ThemeToggle
  /shared                  // EmptyState, SkeletonCard, ErrorBanner, AccessibleChartTable
/lib
  /api                     // typed API client functions
  /hooks                   // TanStack Query hooks per domain
  /store                   // Zustand stores (ui state only, not server state)
  /schemas                 // zod validation schemas (shared client/server-boundary types)
  /utils
/types                     // domain TypeScript interfaces (mirrors api_contracts.md)
/styles                    // globals.css, Tailwind config, design tokens (ui.md §4)
```

---

## 2. Route Structure & Page Structure

Next.js App Router, route groups separating `(marketing)`, `(auth)`, `(app)`. Each authenticated data page follows: `page.tsx` (server component shell) → client component for interactive body → TanStack Query hook for data fetching, with `loading.tsx`/`error.tsx` providing the route-level skeleton/error boundary matching `ui.md` §11 per-page loading/error specs.

---

## 3. Component Hierarchy (example: Audit Detail)

```
AuditDetailPage (server shell)
  └─ AuditDetailClient
       ├─ EcoScoreGauge
       ├─ CarbonRangeBadge
       ├─ ResourceBreakdownChart
       ├─ GreenHostingBadge
       ├─ MethodologyFootnote
       └─ QuickLinks (Hotspots / Recommendations / Carbon Lab)
```

---

## 4. Shared Component Inventory

See `ui.md` §13 for the full authoritative list (`EcoScoreGauge`, `CarbonRangeBadge`, `ResourceBreakdownChart`, `HotspotTreemap`, `RecommendationCard`, `CarbonLabSliderPanel`, `ForecastChart`, `BudgetGauge`, `RegressionTimeline`, `AuditProgressTracker`, `AccessibleChartTable`, etc.). This document only adds implementation notes, not a duplicate list.

---

## 5. TypeScript Domain Models

```ts
// types/audit.ts
export interface CarbonEstimate {
  valueGrams: number;
  rangeLowGrams: number;
  rangeHighGrams: number;
  methodologyVersion: string;   // e.g. "swdm-v4.0"
  calculatedAt: string;         // ISO timestamp
}

export interface ResourceItem {
  id: string;
  url: string;
  category: "image" | "js" | "css" | "font" | "video" | "third_party" | "html" | "other";
  transferBytes: number;
  requestCount: number;
  cached: boolean;
  estimatedCarbonShareGrams: number;
}

export interface HostingInfo {
  provider?: string;
  ipAddress?: string;
  region?: string;
  greenVerified: boolean;
  cdnDetected: boolean;
  cdnProvider?: string;
  gridIntensityGCo2PerKwh?: number;
}

export interface AuditSummary {
  totalTransferBytes: number;
  requestCount: number;
  resourcesNotCaptured: string[];  // e.g. ["consent-walled: chat-widget.js"]
}

export interface AuditResult {
  id: string;
  websiteId: string;
  url: string;
  status: "queued" | "running" | "completed" | "failed" | "partial";
  device: "desktop" | "mobile";
  network: "broadband" | "4g" | "slow-3g";
  createdAt: string;
  completedAt?: string;
  summary: AuditSummary;
  hosting: HostingInfo;
  carbon: {
    perVisit: CarbonEstimate;
    per1000Views: CarbonEstimate;
    monthlyProjection?: CarbonEstimate;
    annualProjection?: CarbonEstimate;
  };
  ecoScore: {
    value: number;         // 0-100
    grade: string;         // "A+".."F"
    components: Array<{ name: string; weight: number; rawValue: number; contribution: number }>;
  };
  resources: ResourceItem[];
}

export interface Recommendation {
  id: string;
  ruleId: string;
  priority: "P0" | "P1" | "P2";
  title: string;
  causeExplanation: string;
  evidence: Array<{ label: string; value: string }>;   // e.g. [{label: "Largest image", value: "hero.jpg — 2.4MB"}]
  estimatedImpact: { rangeLowGrams: number; rangeHighGrams: number; assumptionNote: string };
  effort: "low" | "medium" | "high";
  confidence: "low" | "medium" | "high";
  codeSnippet?: string;
  category: "frontend" | "backend" | "assets" | "hosting" | "cdn" | "content";
}

export interface ForecastScenario {
  label: "baseline" | "optimistic" | "pessimistic";
  points: Array<{ date: string; gCo2ePerMonth: number }>;
}

export interface ForecastResult {
  assumptions: {
    trafficGrowthPct: number;
    pageWeightGrowthPct: number;
    releaseFrequencyPerMonth: number;
    gridIntensityTrendPct: number;
  };
  scenarios: ForecastScenario[];
  limitationsNote: string;
}
```

---

## 6. API Client Structure

Thin typed wrapper per domain, using `fetch` with a shared base client (auth header injection, error normalization):

```ts
// lib/api/client.ts
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...authHeader(), ...(init?.headers ?? {}) },
    credentials: "include",
  });
  if (!res.ok) throw await normalizeApiError(res);
  return res.json() as Promise<T>;
}

// lib/api/audits.ts
export const startAudit = (websiteId: string, config: AuditConfig) =>
  apiFetch<{ auditId: string }>(`/v1/websites/${websiteId}/audits`, {
    method: "POST",
    body: JSON.stringify(config),
  });

export const getAuditStatus = (auditId: string) =>
  apiFetch<{ status: AuditResult["status"]; step: string; progressPct: number }>(
    `/v1/audits/${auditId}/status`
  );

export const getAuditResult = (auditId: string) =>
  apiFetch<AuditResult>(`/v1/audits/${auditId}`);
```

---

## 7. Authentication Flow

- Email/password + magic-link at MVP; JWT access token (short-lived, ~15min) stored in memory/React context, refresh token in an httpOnly secure cookie (never exposed to JS) to reduce XSS token-theft risk.
- Silent refresh via a dedicated `/v1/auth/refresh` call triggered by a TanStack Query `onError` 401 interceptor before retrying the original request once.
- Route protection via a Next.js middleware checking session presence for all `/app/*` routes, redirecting unauthenticated users to `/login` with a return-to param.
- GitHub OAuth/App connection (integrations) handled as a separate, explicitly-scoped flow — not conflated with primary account auth.

---

## 8. State Management Strategy

- **Server state** (audits, websites, recommendations, forecasts, budgets): TanStack Query exclusively — query keys namespaced per domain (`["audit", auditId]`, `["website", websiteId, "hotspots"]`), with polling (`refetchInterval`) for in-progress audits (§14) and standard cache invalidation on mutations (e.g., saving a budget invalidates `["website", id, "budget"]`).
- **Client/UI state** (theme, sidebar collapsed, Carbon Lab slider positions before "apply", 3D reduced-motion toggle): Zustand, split into small focused stores (`useThemeStore`, `useCarbonLabStore`, `useUiChromeStore`) rather than one global store, to keep re-renders scoped.
- No client state library is used for data that TanStack Query already owns — avoids the classic dual-source-of-truth bug.

---

## 9. Form Validation Strategy

- `zod` schemas in `/lib/schemas`, shared shape between the URL-submission form, budget form, and forecast-assumptions form; `react-hook-form` + `zodResolver` for form wiring.
- Server-side validation is authoritative (`backend.md` §Pydantic schemas) — client validation is a UX convenience, not a security boundary (relevant given SSRF concerns on the URL field).

---

## 10. Error Handling Strategy

- TanStack Query global `onError` → normalized `ApiError { code, message, retryable }`, surfaced via `ErrorBanner` (page-level) or toast (action-level), matching `ui.md` per-page error-state specs.
- Route-level `error.tsx` boundaries catch render-time failures with a "Something went wrong — reload" fallback, distinct from in-page data-fetch errors.
- Partial-success states (e.g., audit `status: "partial"`) are **not** treated as errors — they render normally with an inline "partial results" banner, per `upgradation_plan.md` §12 reliability requirement.

---

## 11. Loading and Skeleton Strategy

- Every data-bearing component has a matching `Skeleton*` variant (`SkeletonCard`, table-row skeletons, chart-area skeletons) shown while the relevant TanStack Query is `isPending`.
- Route-level `loading.tsx` provides an immediate shell (matches the target page's layout) to avoid layout shift when real content arrives.
- Audit progress uses a dedicated live-polling component (§14), not a generic skeleton, since it has genuine step-by-step state to communicate.

---

## 12. Responsive Strategy

- Mobile-first Tailwind breakpoints (`ui.md` §5): base styles target mobile, `md:`/`lg:` progressively enhance to desktop layouts (sidebar nav, side-by-side comparisons, docked panels).
- Complex desktop-only interactions (side-by-side Carbon Lab comparison, docked 3D drill-down panel) have explicit mobile alternatives defined per-page in `ui.md` §11 (stacked layout, bottom sheets) — never simply "shrunk" desktop layouts.

---

## 13. Accessibility Implementation Requirements

- All interactive components sourced from shadcn/ui (built on Radix primitives) for baseline keyboard/ARIA correctness; custom chart/3D components implement the `AccessibleChartTable` pattern (`ui.md` §12) explicitly.
- Automated checks: `eslint-plugin-jsx-a11y` in CI lint step; `axe-core` integrated into component tests (§18).
- Manual checks: full keyboard-only pass and screen-reader spot-check (VoiceOver/NVDA) required before each release, tracked as a checklist item alongside the 3D-specific checklist in `3d_design.md` §19.
- `prefers-reduced-motion` respected globally via a shared `useReducedMotion` hook consumed by both CSS animation classes and the 3D scene (`3d_design.md` §10).

---

## 14. Theme Implementation

- CSS custom properties for every semantic token in `ui.md` §4.2, defined once in `globals.css` under `:root` (light) and `.dark` (dark), consumed by Tailwind via `tailwind.config` `extend.colors` referencing `var(--token-name)`.
- Theme toggle persists choice to `localStorage`-equivalent **only outside of any artifact/sandboxed context** — within the actual deployed app (not an in-chat artifact) this is standard browser storage and is fine; default follows `prefers-color-scheme` on first visit.
- Chart components receive theme-aware color props (not hardcoded hex) so series colors correctly swap per `ui.md` §4.2's light/dark pairs.

---

## 15. Chart Implementation Plan

- **Recharts** for all standard 2D charts (`ResourceBreakdownChart` stacked bar, `ForecastChart` multi-line with shaded band via `Area` + `Line` composition, `BudgetGauge` via `RadialBarChart`, `RegressionTimeline` via a custom `Scatter`/timeline composition).
- `HotspotTreemap` uses Recharts' `Treemap` component with the sequential single-hue scale from `ui.md` §12.
- Every chart wrapped by `AccessibleChartTable`, which renders the chart plus a visually-hidden-by-default (toggleable) `<table>` with the same underlying data array, satisfying `ui.md` §6 accessibility requirement without duplicating data-fetching logic (both consume the same query result).

---

## 16. 3D Integration Plan

- The `carbon-flow` component tree (`3d_design.md` §16) is dynamically imported (`next/dynamic`, `ssr: false`) so React Three Fiber and Three.js are never included in the initial bundle for users who don't open the 3D view.
- `useDeviceCapability` hook runs before the dynamic import is even triggered, so low-capability devices never download the 3D chunk at all (§12 of `3d_design.md`).
- The 3D view and its 2D fallback share the exact same `useCarbonFlowData` transform hook, guaranteeing data consistency between the two representations.

---

## 17. Audit Polling / Realtime Status Strategy

- MVP: **polling** via TanStack Query `refetchInterval` (e.g., 2s while `status` is `queued`/`running`, stopped once `completed`/`failed`/`partial`) against `GET /v1/audits/:id/status` — simplest reliable approach for a student-team MVP, avoids WebSocket infra.
- v2+: optional upgrade to Server-Sent Events or WebSocket push for lower-latency step updates, with polling retained as the automatic fallback if the realtime channel fails to connect (progressive enhancement, not a hard replacement).

---

## 18. Environment Variables

```
NEXT_PUBLIC_API_BASE_URL=
NEXT_PUBLIC_APP_ENV=development|staging|production
NEXT_PUBLIC_ENABLE_3D=true|false          # kill-switch, independent of per-device capability check
NEXT_PUBLIC_POSTHOG_KEY=                   # or equivalent product analytics, optional
NEXTAUTH_URL=                              # if NextAuth is used for OAuth (GitHub integration) instead of hand-rolled OAuth
GITHUB_OAUTH_CLIENT_ID=                    # public client id for GitHub App connect flow (secret stays server-side)
```

---

## 19. Frontend Test Strategy

- **Unit tests** (Vitest): pure functions — `useCarbonFlowData` transform, EcoScore formatting helpers, forecast-assumption math, carbon-range formatting.
- **Component tests** (React Testing Library + Vitest): each shared component in `ui.md` §13 gets a render + interaction test (e.g., `RecommendationCard` shows evidence chip, `CarbonLabSliderPanel` recalculates on slider change), including an `axe-core` accessibility assertion per component.
- **End-to-end tests** (Playwright): critical flows from `ui.md` §10 — first audit, reviewing results, Carbon Lab simulation, setting a budget, investigating a regression, viewing a forecast, exporting a report — run against a seeded staging environment.
- **Accessibility tests:** automated `axe-core` in CI (component + key page level) plus the manual keyboard/screen-reader checklist (§13) gating each release.

---

## 20. Performance Optimization

- **Code splitting:** route-based (automatic via App Router) plus explicit dynamic imports for the 3D bundle (§16) and any PDF-report-generation client code (v2, only loaded on the Reports page).
- **Lazy loading:** below-the-fold dashboard widgets and chart components lazy-mounted via intersection observer where they're not immediately in viewport (mirrors the existing mockup's scroll-reveal pattern, reimplemented accessibly).
- **Image handling:** Next.js `<Image>` for all product-UI imagery (not audit-target screenshots, which are out of scope) with modern-format (`AVIF`/`WebP`) auto-negotiation — notably, Carbonerra's own frontend should itself follow the optimizations it recommends to users (dogfooding, called out explicitly in onboarding copy as a credibility signal).
- **3D loading constraints:** hard 3MB budget for the 3D chunk (`3d_design.md` §13), capability-gated loading (§16 above), paused render loop when tab hidden.

---

## 21. Phased Frontend Implementation Checklist

**Phase 1 (Weeks 1–4, MVP core):**
- [ ] Design tokens + Tailwind config from `ui.md` §3–5
- [ ] Auth flow (login/signup/onboarding)
- [ ] Website add + audit configuration page
- [ ] Audit progress page with polling
- [ ] Dashboard shell + Website list

**Phase 2 (Weeks 5–8, MVP depth):**
- [ ] Audit detail page (EcoScore, breakdown, hosting badge)
- [ ] Hotspot analysis page (table + treemap)
- [ ] AI recommendations page
- [ ] Carbon Lab simulator (2D only)

**Phase 3 (Weeks 9–12, MVP completion + polish):**
- [ ] Forecast page (single-scenario at MVP, scenario bands if ahead of schedule)
- [ ] Carbon budget page
- [ ] Reports page (shareable HTML link)
- [ ] Settings/integrations page (GitHub connect UI, even if v2 wires the backend)
- [ ] Full accessibility pass, responsive pass, E2E test suite green

**Phase 4 (v2, post-MVP):**
- [ ] Regression timeline page + live CI integration UI
- [ ] Scenario-banded forecasting UI
- [ ] 3D Carbon Flow view (`3d_design.md`)
- [ ] Multi-tenant org/member management UI
