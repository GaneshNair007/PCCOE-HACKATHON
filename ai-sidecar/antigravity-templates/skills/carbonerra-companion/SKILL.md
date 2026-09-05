---
name: carbonerra-companion
description: Inspects digital sustainability audits, executes SWDM v4 carbon calculations, and runs verification experiments on Carbonerra Mission Control (http://localhost:3002).
---

# Carbonerra Mission Control Skill

This skill allows Antigravity agents to interface with Carbonerra Mission Control running at `http://localhost:3002/`.

## Architecture & Principles
- **Methodology:** Sustainable Web Design Model (SWDM) v4 (`0.0577 kWh/GB`, `442 gCO2e/kWh` operational, `531 gCO2e/kWh` embodied).
- **Core Invariant:** Bytes transferred per tested journey is the primary observed metric; gCO2e is a secondary modeled estimate.
- **Task Preservation Guardrail:** Optimizations must never break core user tasks (e.g. registration form). If assertions fail, the candidate is rejected.
- **Explicit Approval Gate:** Patches require human engineering approval with SHA-256 hash.

## Available Endpoints
- `GET /api/companion/status`: Provider status, active mode, and rate limit telemetry.
- `POST /api/companion/chat`: Streaming SSE chat orchestrator with serial tool execution.
- `GET /api/companion/experiments`: List active controlled experiments.
- `POST /api/companion/approval`: Record explicit engineering approval.
- `POST /api/companion/budget`: Evaluate 350 KB payload ceiling.
- `GET /api/companion/receipts/[id]?format=html`: Export auditable HTML evidence receipt.

## Example Signature Request
"Help students register for this event using less data. Keep the poster readable, preserve registration, and show me the evidence for your recommendation."
