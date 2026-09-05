# Todo (Ralph Loop)

## Now
- [x] TASK-01: Bootstrap Ralph Loop infrastructure (`.ai-skills/`, `.ralph/`, and cross-platform loop scripts).
- [x] TASK-02: Generate `docs/architecture.md`, `docs/hardcoded-inventory.md`, and `docs/decisions.md`.
- [x] TASK-03: Implement Python SWDM v4 Carbon Calculation Engine & Green Web Foundation API lookup (`engine/carbon.py`).
- [x] TASK-04: Implement Real Web Asset Scanner (`engine/scanner.py`) with SSRF protection to measure actual page transfer weights.
- [x] TASK-05: Upgrade `server.py` to serve REST API endpoints (`POST /api/audit`, `POST /api/simulate`) and wire `app.js` to render live data into the EcoScore, Annual Impact, Green Hosting badge, and Hotspot cards.

## Soon
- [ ] TASK-06: Replace static Chart.js coordinates with dynamic time-series projections based on actual audited page weight and user-defined traffic growth.
- [ ] TASK-07: Add document/HAR file upload flow to allow importing external Lighthouse / WebPageTest audit archives.
- [ ] TASK-08: Add environment-based configuration for emission thresholds, rate limits, and custom carbon budget policies.
- [ ] TASK-09: Add automated test suite covering SWDM v4 math, scanner edge-cases, and API endpoints.

## Later
- [ ] TASK-10: Persistent database layer (PostgreSQL + SQLAlchemy) for organization audits, history trends, and team multi-tenancy.
- [ ] TASK-11: GitHub Action CI/CD Integration ("Regression Shield") to evaluate staging PRs against baseline budgets.
- [ ] TASK-12: Three.js / React Three Fiber 3D carbon particle visualization as specified in `3d_design.md`.
