# CarbonTerra interface system

## Reference and scope

The matching moss hero was found on `demo` at `6b7e809`, while `main` at `1157fd4` contained the older globe design. The live opening page was inspected and matched the demo composition. The referenced video file was not available in this session; this is an adaptation of the matching source and browser appearance, not a pixel-perfect reconstruction of the recording.

The active application is the Next.js App Router frontend in `src/app`. Legacy root HTML, Python, and the AI sidecar were not redesigned. API routes, scientific calculations, storage modules, receipt generation, and verification runners remain unchanged.

## Foundations

`src/app/globals.css` owns the shared tokens; Tailwind references these variables. The hero stylesheet is scoped under `.sylva-hero` and imported once in the root layout.

| Token group | Implementation |
| --- | --- |
| Canvas | Moss grey `#4a4d44`, adapted from the hero |
| Working surfaces | `#282f26` and elevated `#323a2f` |
| Pale surfaces | `#f2f3ef`, secondary `#e4e8dc` |
| Text | Cream `#f2f3ef`, sage `#dae0d2`, pale-surface ink `#23261f`, secondary `#555e4d` |
| Accent | Lime `#cbff00`, hover `#d9ff52`; reserved for actions and emphasis |
| Status | Success `#a5e4b2`, warning `#fcd98a`, danger `#ffacb6`; existing semantic status utilities retained |
| Type | Locally hosted Lexend for body and light display; Consolas/monospace fallback for technical content |
| Layout | 1240px maximum content, fluid 16–40px gutters, compact page introductions |
| Corners | 16px controls, 28px cards, pill navigation |
| Elevation | Subtle card, floating, and dialog shadows; repeated neon/gradient frames removed |
| Layers | Decoration 0, content 10, navigation 40, chat 60, dialog 100 |
| Responsive | Primary navigation collapses below 1024px; page headings and capability grid stack below 768px; hero retains its own scoped composition breakpoints |

`PageIntro`, `SectionHeading`, and `Reveal` remove repeated heading/entrance markup. Existing Card, Button, Input, Slider, Badge, and Modal exports retain their application interfaces. Dark tools sit on the same moss canvas as the landing page, with pale rounded page introductions and lighter typography.

## Route matrix

| Route | Updated treatment | Preserved behavior / verification |
| --- | --- | --- |
| `/` | Original organic hero, shared navigation, harmonized results and pale capability cards | Live example.com audit, persisted Fleet record, methodology dialog, sensitivity range, presets/query/cancel code preserved |
| `/dashboard` | Compact pale introduction, readable metrics, stable table and filters | Browser search/empty state, local storage, accessible remove/cancel dialog; CSV contract tested |
| `/simulator` | Coordinated scenario controls and results, labelled sliders, contained code | Browser keyboard slider, baseline selection and code tabs; existing calculations retained; current server baseline now represented in dropdown even when absent from local Fleet |
| `/forecasts` | Shared settings/chart surfaces, accessible data table | Scenario assumptions and distinction from measured outcomes retained |
| `/fix-hub` | Unified category buttons, readable code and guidance | Existing snippets/qualifications, copy status and failure feedback retained |
| `/savings-lab` | Shared workflow steps, approval and result surfaces | Baseline, approval, optimized and broken candidate tests pass |
| `/evidence` | Restrained report presentation and print rules | Pending/verified data, receipt API and download/print controls retained |
| `/shield` | Shared budget controls, clear pass/breach states and code output | Baseline breach and optimized pass tested; evaluation errors surfaced |
| `/demo/event` | Shared event introduction, form and status styling | Original asset URLs, IDs, query variants and registration preserved; dynamic server page supplies variant to client form so production HTML exposes the measurement fixture |

Loading, error and not-found pages now use the same foundations. The footer and assistant share the palette and typography. Mobile navigation exposes every route and closes after selection.

## Motion ownership

| Effect | Trigger, timing, repetition and fallback |
| --- | --- |
| Shared content entrance | Mount; CSS 8px upward settling over 380ms using cubic-bezier(.22,1,.36,1); once per mount, no opacity hiding; immediate on mobile and reduced motion |
| Controls | CSS color/border changes, 160–220ms; no button scaling or default card translation; optional fine-pointer card border/elevation response |
| React transitions | Framer Motion under `MotionConfig reducedMotion="user"`; `src/lib/motion.ts` defines 160/220/380ms, 50ms stagger and 240ms maximum group delay |
| Gauge | Short 300ms interpolation on actual input changes; immediate under reduced motion; no perpetual 3D spin |
| Hero entrance | Existing scoped CSS masks/fades around 0.7–1.45s with individual delays; introduction settles after about 2.9s; original moss imagery and scene assembly retained |
| Hero ambient scene | Existing Three.js/script-owned scene; scoped mount controllers pause offscreen, on hidden documents, on live reduced-motion preference changes and via Pause/Resume; listeners, observers, timers and animation frames are disposed |
| Scroll | Native browser scrolling; existing Lenis context retained without starting a smooth-scroll loop |
| Chat | Short reduced-motion-aware panel transitions, focus on input, Escape/close restores launcher, visual viewport sizing for mobile keyboards |
| Print | Navigation, footer, chat and decoration omitted; white report surface, black text, no transforms or animation |

Global cursor/noise/grid layers, repeated tilt effects, forecast GSAP entrance and secondary globe animation were removed from mounted application routes. The regional grid summary retains its real values and hosting match. Unused legacy components/dependencies were not deleted as part of this UI task.

## Dependency decision

Added exact `@flowstack-ui/brick@0.2.2` for the concrete missing requirement of accessible modal behavior: portal placement, dialog semantics, keyboard focus containment, Escape and restoration. Exact-version Agent Knowledge was read and resolved. Its public stylesheet is imported once and public theme variables reference the shared tokens. No direct Atom imports or private component selectors are used. Existing working controls were extended rather than replaced wholesale. No unrelated dependency upgrades were requested.

## Verification and limits

- Production build completes with TypeScript and lint validation. Remaining lint warnings concern intentional ordinary image elements (including controlled demo fixtures) and the pre-existing homepage audit-effect dependency.
- All 37 tests pass against the local production server, including live audit, SSRF rejection, methodology, simulation, storage, registration, evidence, release gates and chat tools.
- Chat acceptance setup now records required engineering approval before testing a candidate; application approval semantics were not relaxed.
- Browser layout checks covered all nine routes at 360, 390, 768 and 1024px, with desktop checks at 1440px. No document horizontal overflow was found. Screenshots cover desktop tools and mobile pages.
- Browser interactions verified audit-to-Fleet persistence, filtering/empty state, modal initial focus, reverse-tab containment, Escape and focus restoration, mobile menu selection, scenario controls, chat response and hero pause/revisit.
- Original demo JPEG/WebP fixtures remain byte-for-byte unchanged. The existing baseline JPEG does not decode as a normal image in the browser; measurement and registration checks still pass. Replacing these fixtures requires preserving the controlled byte-size experiment.
- Operating-system reduced-motion changes, a physical mobile keyboard, print-dialog rendering, full screen-reader testing, all clipboard/download actions and formal performance/contrast audits were not independently exercised. Reduced-motion and print behavior were source-reviewed; no claims of measured Lighthouse improvements are made.
- Production publishing requires access to the Vercel project owning `carbonterra.vercel.app`. Do not create a substitute URL or infer that a Git push necessarily updated that alias.

## Manual verification sequence

1. Run `npm ci`, `npm run build`, and `npm run start`; the configured port is 3001. Run `npm test` with the production server active and network access available.
2. Audit a public URL, adjust sensitivity, cancel a fresh audit, open methodology, press Tab/Shift+Tab and Escape, then inspect Fleet persistence and CSV export.
3. Change a Simulator baseline and sliders; inspect Forecasts assumptions and table, then copy a Fix Hub snippet.
4. In Savings Lab create an experiment, approve it, test optimized and deliberately broken variants, and open the generated Evidence receipt; download and print it.
5. Evaluate Shield and inspect the workflow output. Register on baseline and optimized demo variants; the broken variant must fail deliberately.
6. At desktop and phone widths use every navigation link, open chat and submit a query, revisit the hero, pause motion and change the OS reduced-motion preference.
