# Carbonerra — System Architecture Specification (Accuracy-First)

## 1. Executive Summary
**Carbonerra** is a methodology-cited digital sustainability telemetry and predictive carbon optimization platform. Instead of unverifiable point claims, Carbonerra employs a multi-source cross-validated accuracy engine built on the official **Sustainable Web Design Model v4 (`@tgwf/co2:swdm-v4`)**, real regional grid carbon intensity lookups via **The Green Web Foundation**, and auditable sensitivity bands.

---

## 2. Accuracy Engine Architecture

```mermaid
graph TD
    U[User Submits Target URL] --> V[Security Layer: SSRF Defense + IP Validation]
    V --> S1[Source 1: Google PageSpeed Insights v5<br/>Lighthouse Runtime Payload & Opportunity Audits]
    V --> S2[Source 2: Independent Static Crawler<br/>Cheerio Parse + Head Content-Length Probe]
    V --> S3[Source 3: Hostname DNS Resolve -> IP<br/>GWF ip-to-co2intensity: Real Regional Grid]
    V --> S4[Source 4: The Green Web Foundation<br/>greencheck API: Verified Renewable Grid]
    
    S1 --> X[Cross-Validation Engine<br/>Delta <= 15% -> High Confidence<br/>Delta > 15% -> Medium Confidence + Context Note]
    S2 --> X
    
    X --> C[co2().perByteTrace<br/>SWDM v4 with Regional Datacenter Grid Intensity]
    S3 --> C
    S4 --> C
    
    C --> B[Sensitivity Banding Engine<br/>Shift Return-Visit Assumption ±20%<br/>Generates range_low_g / range_high_g]
    
    B --> R[AuditResult JSON API Response<br/>co2_grams, range, confidence, eco_score, trace_variables]
```

---

## 3. Core Accuracy Methodology

### A. Ground Truth vs Model-Based Estimation
Website carbon telemetry is fundamentally a model-based estimate. Carbonerra avoids deceptive point metrics by implementing:
1. **Zero Formula Transcription Error**: Uses the reference implementation (`@tgwf/co2`) with `perByteTrace`.
2. **Dual-Source Byte Cross-Validation**: Compares runtime simulated transfer (PageSpeed Insights v5) against an independent static resource crawl (Cheerio + HEAD requests).
3. **Regional Datacenter Grid Intensity**: Resolves the target host's IP and queries GWF's `ip-to-co2intensity` API for the actual grams CO2/kWh of that specific region.
4. **Sensitivity Banding**: Re-runs calculations with visitor caching assumptions shifted by $\pm 20\%$ to provide a verified confidence interval (`range_low_g` to `range_high_g`).

### B. EcoScore Reference Thresholds
Carbon scores are categorized according to documented thresholds:
- **A+**: $< 0.10 \text{ g CO}_2\text{e}$ (Cleaner than 95% of websites)
- **A**: $0.10 - 0.20 \text{ g CO}_2\text{e}$ (Cleaner than 82%)
- **B**: $0.20 - 0.35 \text{ g CO}_2\text{e}$ (Cleaner than 65%)
- **C**: $0.35 - 0.50 \text{ g CO}_2\text{e}$ (Cleaner than 45%)
- **D**: $0.50 - 0.75 \text{ g CO}_2\text{e}$ (Cleaner than 25%)
- **F**: $\ge 0.75 \text{ g CO}_2\text{e}$ (Lower 10th percentile)

---

## 4. API Endpoints

| Route | Method | Request Payload | Response | Purpose | Auth |
|---|---|---|---|---|---|
| `/api/audit` | `POST` | `{"url": "https://stripe.com"}` | `AuditResult` | Full multi-source cross-validated carbon audit | None (Rate limited: 30 req/min) |
| `/api/audits/recent` | `GET` | `?limit=10` | `{"status":"success", "audits": [...]}` | Recent in-memory scans list for demo UI | None |
| `/api/simulate` | `POST` | `{"baseline_bytes": 1850000, "img_comp": 85, "js_defer": 60}` | `SimulationResult` | Physics simulator lever calculation | None |
| `/api/chat` | `POST` | `{"message": "explain for executives"}` | `{"reply": "...", "tool_used": "..."}` | Grounded agentic chatbot with tool execution | None |
| `/api/health` | `GET` | None | `{"status":"healthy", "version":"2.0.0"}` | Service liveness check | None |

---

## 5. Security & SSRF Defense Architecture

1. **Protocol Restriction**: Only `http:` and `https:` schemes are accepted.
2. **DNS Pre-Resolution**: Hostnames are resolved to IPv4 addresses prior to any outbound network connection.
3. **Blocked Address Ranges**:
   - Loopback: `127.0.0.0/8`, `::1`
   - Private RFC 1918: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`
   - Link-Local & Cloud Metadata: `169.254.0.0/16` (including `169.254.169.254`)
   - Broadcast / Reserved: `0.0.0.0/8`, `224.0.0.0/4`, `240.0.0.0/4`, `255.255.255.255`
   - Local domains: `.internal`, `.local`, `.localhost`
4. **DNS Rebinding Protection**: Re-verifies resolved IP right before raw fetching.
5. **Client Rate Limiting**: In-memory token bucket limits requests to 30 per IP per minute.
6. **Graceful Timeouts**: Explicit 3s to 12s timeouts on all outbound fetch calls prevent hung connections.
