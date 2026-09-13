# CarbonTerra continuous Sylva experience

This replaces the earlier page-by-page visual adaptation described in `design-system.md`.

## Exact source

`@designcodeio/threeui` is pinned to 1.2.0. The official source catalog identifies SylvaHero, living-green, as **SHA-256 05f359ce157a**. Its original HTML has SHA-256 `69c3694bd63f44ef9f007ebe4dac57a83e4402e0cdf6b54dd10b96dd4f05e197`.

`npm run prepare:world` verifies that fingerprint and copies the unmodified source, local Three.js, local Lexend, authored photographs and licenses into `public/landing-pages/`. The build runs this automatically. `source-manifest.json` records the original and adapted fingerprints. Source: https://raw.githubusercontent.com/MengTo/threeui/main/public/source-code.json

The application adapter uses the same scene extraction boundaries as the package's public SylvaLivingWorldScene. It retains the authored procedural roots, moss, ferns, flowers, butterfly, pollen, lighting and shaders. Changes are explicit: parent-controlled camera poses, scan interaction, lifecycle controls, responsive framing, capped rendering and local asset URLs. The adapter is a modified work, not a byte-identical copy of the original HTML.

The public SylvaHero named import and stylesheet are retained with the requested Lexend fonts, weight 300, white primary color, 63px heading, 16.5px body and -0.006 heading letter spacing. Next.js modularizes the named import to the official SylvaHero component subpath, avoiding unrelated gallery modules from the package barrel.

## One environment

`LivingWorld` is mounted once in the shared root layout. It is never keyed by pathname. The opening page contains interactive DOM, not another WebGL canvas. Client navigation preserves the existing scene, motion preference and controls. A single fixed scene stays behind every route, section, loading/result state and footer.

Named camera poses move between arrival, measurement, roots, canopy, clearing and resolution. Visible scroll chapters select poses; routes provide defaults. Pointer parallax and audit scans use a same-origin message bridge. No scroll hijacking is used. Rendering is capped at 30fps desktop and 24fps narrow layouts with DPR caps of 1.6 and 1.2. Hidden documents pause; reduced motion and the pause control produce a still scene. Failed WebGL leaves an operable interface and a restore control. These are rendering bounds, not a claim of benchmarked frame rates on all devices.

The page compositions use light editorial headings, asymmetric chapters, ivory evidence and outcome surfaces, staggered Shield controls, an open workflow trail, separate code instruments and transparent fleet metrics. Forms, error states, tables and live responses retain their existing contracts. The navigation dialog continues to use FLOWSTACK Brick 0.2.2.

## Backend and production connection

All repository consumers now await persistence. Local development keeps the existing file repository. Vercel uses a persistent Upstash-compatible Redis REST database with server-only `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (or Vercel's `KV_REST_API_*` aliases). `CARBONTERRA_STORAGE_PREFIX` isolates environments.

Shared storage covers audit telemetry, experiments, run evidence, approvals, verification and budgets. Record fields avoid unrelated-request overwrites; experiment field updates are atomic; empty arrays survive updates. Runs and verification records cannot be overwritten with different values. Storage errors propagate instead of reporting a successful durable write. `/api/health` checks the connection and reports HTTP 503 when production storage is missing or unavailable.

Configure a persistent database in the **existing CarbonTerra Vercel project**, attach the server-only variables to Production, and redeploy that project. Do not expose credentials with NEXT_PUBLIC prefixes. Provider contract: https://upstash.com/docs/redis/features/restapi

The shared-storage test uses two repository clients against an HTTP protocol fixture. Live Upstash and Vercel validation still require the owning project's connection and access. Optional Gemini credentials enable natural-language generation; grounded chat tools remain available without them. The existing controlled journey runner inspects HTML, resource transfer and registration responses; it is not a full browser performance audit.

## Verification

Run `npm run build`, start the production server, then run `npm test`. The suite covers scientific invariants, scanner API behavior, registration, baseline and candidate runs, approval, broken candidate rejection, evidence, Shield and chat. Shared-storage checks additionally cover cross-client reads, concurrent writes, immutable evidence, array preservation and provider outages. Browser verification covers the persistent scene, route navigation, scrolling and actual UI-to-API execution.

Deployment must be verified at **https://carbonterra.vercel.app/**. A GitHub push alone is not evidence that the production alias has updated.
