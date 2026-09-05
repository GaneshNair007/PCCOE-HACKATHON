# Architectural Decision Records (ADRs)

## ADR-001: Unified Python Server Topology for Hackathon Agility
- **Date**: 2026-08-25
- **Status**: Accepted
- **Context**: The existing prototype ran as a static `http.server` on port 8082. Requiring an external database or Docker container to run the basic platform would introduce unnecessary friction for quick local evaluation and hackathon judging.
- **Decision**: Extend `server.py` into a unified server that serves both the static UI assets and the live REST API endpoints (`/api/audit`, `/api/simulate`, `/api/health`) using Python standard library modules (`http.server`, `urllib`, `json`, `socketserver`), with an upgrade path to FastAPI + PostgreSQL.
- **Consequences**: Zero external pip dependencies required to launch the core live telemetry platform.

---

## ADR-002: Selection of Sustainable Web Design Model (SWDM v4)
- **Date**: 2026-08-25
- **Status**: Accepted
- **Context**: Several competing carbon estimation methodologies exist: OneByte (dated, data-center only), SWDM v3 (legacy), and SWDM v4.
- **Decision**: Adopt **SWDM v4** as the standard telemetry engine. SWDM v4 accounts for operational energy ($0.00000000081 \text{ kWh/byte}$) and embodied manufacturing energy ($0.00000000043 \text{ kWh/byte}$) across data centers, networks, and client devices.
- **Consequences**: Calculations are scientifically defensible, verifiable against the Green Web Foundation, and align with leading sustainability standards.

---

## ADR-003: SSRF Protection for Public Audits
- **Date**: 2026-08-25
- **Status**: Accepted
- **Context**: Allowing arbitrary user input URLs to be audited creates Server-Side Request Forgery (SSRF) vulnerabilities (attacking internal network interfaces or cloud metadata endpoints).
- **Decision**: Enforce pre-resolution IP checking: resolve domain DNS before making HTTP requests and explicitly reject any target IP within RFC 1918, loopback, link-local, or cloud metadata (`169.254.169.254`) ranges.
- **Consequences**: Eliminates SSRF vectors while allowing audits of any public internet domain.
