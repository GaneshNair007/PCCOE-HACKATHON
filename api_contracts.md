# Carbonerra — API Contracts

All carbon figures below are **illustrative example values marked as estimates**, consistent with `research.md`/`ui.md` transparency requirements. Every response carrying a carbon number includes `methodology_version` and a range. Base path: `/v1`.

---

## 1. Create Website

**POST** `/v1/websites`

Request:
```json
{
  "root_url": "https://example-shop.com",
  "name": "Example Shop — Marketing Site"
}
```

Response `201`:
```json
{
  "id": "web_8f2a1c",
  "org_id": "org_4b91",
  "root_url": "https://example-shop.com",
  "name": "Example Shop — Marketing Site",
  "created_at": "2026-08-25T09:12:04Z"
}
```

Error `400` (SSRF-blocked):
```json
{
  "error": {
    "code": "url_not_allowed",
    "message": "This address can't be audited because it resolves to a private or internal network range.",
    "retryable": false
  }
}
```

---

## 2. Start Audit

**POST** `/v1/websites/{website_id}/audits`

Request:
```json
{
  "device": "desktop",
  "network": "broadband",
  "crawl_depth": 1
}
```

Response `202`:
```json
{
  "audit_id": "aud_c93e7d",
  "status": "queued",
  "created_at": "2026-08-25T09:13:00Z"
}
```

Error `429`:
```json
{
  "error": {
    "code": "rate_limited",
    "message": "You've reached the audit limit for your current plan (10/hour). Try again in 42 minutes.",
    "retryable": true
  }
}
```

---

## 3. Audit Status

**GET** `/v1/audits/{audit_id}/status`

Response `200` (in progress):
```json
{
  "audit_id": "aud_c93e7d",
  "status": "running",
  "step": "carbon_calc",
  "progress_pct": 65,
  "resources_discovered": 82
}
```

Response `200` (complete):
```json
{
  "audit_id": "aud_c93e7d",
  "status": "completed",
  "step": "done",
  "progress_pct": 100,
  "resources_discovered": 91
}
```

---

## 4. Audit Result

**GET** `/v1/audits/{audit_id}`

Response `200`:
```json
{
  "id": "aud_c93e7d",
  "website_id": "web_8f2a1c",
  "url": "https://example-shop.com",
  "status": "completed",
  "device": "desktop",
  "network": "broadband",
  "created_at": "2026-08-25T09:13:00Z",
  "completed_at": "2026-08-25T09:14:22Z",
  "summary": {
    "total_transfer_bytes": 2984213,
    "request_count": 91,
    "resources_not_captured": [
      "consent-walled: cookie-consent-widget.js",
      "blocked-by-robots: /internal-preview.js"
    ]
  },
  "hosting": {
    "provider": "Example Cloud Hosting",
    "region": "us-east-1",
    "green_verified": false,
    "cdn_detected": true,
    "cdn_provider": "Example CDN",
    "grid_intensity_g_co2_per_kwh": 412.5
  },
  "carbon": {
    "per_visit": {
      "value_grams": 0.61,
      "range_low_grams": 0.49,
      "range_high_grams": 0.78,
      "methodology_version": "swdm-v4.0+gwf-2026-08",
      "calculated_at": "2026-08-25T09:14:20Z"
    },
    "per_1000_views": {
      "value_grams": 610.0,
      "range_low_grams": 490.0,
      "range_high_grams": 780.0,
      "methodology_version": "swdm-v4.0+gwf-2026-08",
      "calculated_at": "2026-08-25T09:14:20Z"
    },
    "monthly_projection": {
      "value_grams": 18300.0,
      "range_low_grams": 14700.0,
      "range_high_grams": 23400.0,
      "methodology_version": "swdm-v4.0+gwf-2026-08",
      "calculated_at": "2026-08-25T09:14:20Z"
    }
  },
  "eco_score": {
    "value": 71,
    "grade": "B-",
    "components": [
      { "name": "Page weight", "weight": 0.3, "raw_value": 2984213, "contribution": 18.5 },
      { "name": "Green hosting", "weight": 0.2, "raw_value": 0, "contribution": 4.0 },
      { "name": "Request efficiency", "weight": 0.2, "raw_value": 91, "contribution": 13.0 },
      { "name": "Caching", "weight": 0.15, "raw_value": 0.62, "contribution": 10.5 },
      { "name": "Third-party load", "weight": 0.15, "raw_value": 12, "contribution": 9.0 }
    ]
  },
  "resources": [
    {
      "id": "res_001",
      "url": "https://example-shop.com/assets/hero.jpg",
      "category": "image",
      "transfer_bytes": 842000,
      "request_count": 1,
      "cached": false,
      "estimated_carbon_share_grams": 0.18
    },
    {
      "id": "res_002",
      "url": "https://example-shop.com/assets/app.bundle.js",
      "category": "js",
      "transfer_bytes": 512300,
      "request_count": 1,
      "cached": false,
      "estimated_carbon_share_grams": 0.11
    }
  ]
}
```

Error `425` (fetched too early):
```json
{
  "error": {
    "code": "audit_not_ready",
    "message": "This audit hasn't completed yet. Poll /v1/audits/{audit_id}/status.",
    "retryable": true
  }
}
```

---

## 5. Resource Hotspot

**GET** `/v1/audits/{audit_id}/hotspots?category=image`

Response `200`:
```json
{
  "audit_id": "aud_c93e7d",
  "category_filter": "image",
  "resources": [
    {
      "id": "res_001",
      "url": "https://example-shop.com/assets/hero.jpg",
      "category": "image",
      "transfer_bytes": 842000,
      "request_count": 1,
      "cached": false,
      "estimated_carbon_share_grams": 0.18,
      "carbon_share_pct_of_page": 29.5
    },
    {
      "id": "res_014",
      "url": "https://example-shop.com/assets/product-grid.png",
      "category": "image",
      "transfer_bytes": 398000,
      "request_count": 1,
      "cached": true,
      "estimated_carbon_share_grams": 0.05,
      "carbon_share_pct_of_page": 8.2
    }
  ],
  "methodology_version": "swdm-v4.0+gwf-2026-08"
}
```

---

## 6. Carbon Breakdown

**GET** `/v1/audits/{audit_id}/carbon-breakdown`

Response `200`:
```json
{
  "audit_id": "aud_c93e7d",
  "by_resource_type": [
    { "category": "image", "bytes": 1240000, "pct_of_total": 41.6, "carbon_share_grams": 0.25 },
    { "category": "js", "bytes": 890000, "pct_of_total": 29.8, "carbon_share_grams": 0.18 },
    { "category": "font", "bytes": 210000, "pct_of_total": 7.0, "carbon_share_grams": 0.04 },
    { "category": "css", "bytes": 140000, "pct_of_total": 4.7, "carbon_share_grams": 0.03 },
    { "category": "third_party", "bytes": 504213, "pct_of_total": 16.9, "carbon_share_grams": 0.11 }
  ],
  "by_system_segment": {
    "device_operational": 0.19,
    "network": 0.15,
    "data_center_operational": 0.21,
    "embodied": 0.06
  },
  "methodology_version": "swdm-v4.0+gwf-2026-08",
  "confidence_note": "Range reflects sensitivity to assumed return-visit ratio and unconfirmed green-hosting status."
}
```

---

## 7. EcoScore

**GET** `/v1/audits/{audit_id}/eco-score`

Response `200`:
```json
{
  "audit_id": "aud_c93e7d",
  "value": 71,
  "grade": "B-",
  "benchmark": {
    "peer_median": 64,
    "peer_group": "Marketing/E-commerce sites, similar traffic tier"
  },
  "components": [
    { "name": "Page weight", "weight": 0.3, "raw_value": 2984213, "contribution": 18.5, "improve_hint": "Reduce total transfer size, especially hero.jpg (842KB)." },
    { "name": "Green hosting", "weight": 0.2, "raw_value": 0, "contribution": 4.0, "improve_hint": "Hosting is unconfirmed as green — consider a Green Web Foundation-verified provider." }
  ]
}
```

---

## 8. Recommendation List

**GET** `/v1/audits/{audit_id}/recommendations`

Response `200`:
```json
{
  "audit_id": "aud_c93e7d",
  "recommendations": [
    {
      "id": "rec_101",
      "rule_id": "oversized-hero-image",
      "priority": "P0",
      "title": "Compress and modernize hero.jpg",
      "cause_explanation": "hero.jpg is 842KB and served as JPEG. It accounts for an estimated 29.5% of this page's carbon footprint.",
      "evidence": [
        { "label": "Resource", "value": "hero.jpg" },
        { "label": "Current size", "value": "842 KB" },
        { "label": "Format", "value": "JPEG" }
      ],
      "estimated_impact": {
        "range_low_grams": 0.08,
        "range_high_grams": 0.14,
        "assumption_note": "Assumes conversion to AVIF/WebP at equivalent visual quality, ~70-85% size reduction typical for photographic images."
      },
      "effort": "low",
      "confidence": "high",
      "category": "assets",
      "code_snippet": "<picture>\n  <source srcset=\"/assets/hero.avif\" type=\"image/avif\">\n  <source srcset=\"/assets/hero.webp\" type=\"image/webp\">\n  <img src=\"/assets/hero.jpg\" alt=\"Product hero\" loading=\"lazy\">\n</picture>"
    },
    {
      "id": "rec_102",
      "rule_id": "non-green-unconfirmed-hosting",
      "priority": "P1",
      "title": "Verify or migrate to a green-certified host",
      "cause_explanation": "Example Cloud Hosting is not currently listed as verified in the Green Web Foundation dataset.",
      "evidence": [
        { "label": "Current host", "value": "Example Cloud Hosting" },
        { "label": "Green Web Foundation status", "value": "Unconfirmed" }
      ],
      "estimated_impact": {
        "range_low_grams": 0.05,
        "range_high_grams": 0.1,
        "assumption_note": "Impact estimated from the difference between the current unconfirmed grid-intensity assumption and the green-hosting flag used in this methodology; actual improvement depends on the destination provider's real energy mix."
      },
      "effort": "medium",
      "confidence": "medium",
      "category": "hosting"
    }
  ]
}
```

---

## 9. Carbon Lab Simulation — Request/Response

**POST** `/v1/audits/{audit_id}/simulate`

Request:
```json
{
  "levers": {
    "image_compression_pct": 70,
    "js_deferral_pct": 40,
    "cache_ttl_days": 30,
    "green_hosting_enabled": true,
    "hosting_region_override": null
  }
}
```

Response `200`:
```json
{
  "simulation_id": "sim_44e2",
  "audit_id": "aud_c93e7d",
  "baseline": {
    "value_grams": 0.61,
    "range_low_grams": 0.49,
    "range_high_grams": 0.78
  },
  "target": {
    "value_grams": 0.24,
    "range_low_grams": 0.19,
    "range_high_grams": 0.31
  },
  "pct_change": -60.7,
  "trade_offs": [
    {
      "lever": "js_deferral_pct",
      "note": "Aggressive deferral (40%) may delay interactivity for below-fold widgets — verify UX impact before shipping.",
      "risk": "medium"
    },
    {
      "lever": "green_hosting_enabled",
      "note": "Simulated only — actual savings depend on migrating to a Green Web Foundation-verified provider.",
      "risk": "low"
    }
  ],
  "disclaimer": "Simulated estimate based on the audited resource data. Re-audit after implementing changes to confirm the real-world result.",
  "methodology_version": "swdm-v4.0+gwf-2026-08"
}
```

---

## 10. Forecast — Request/Response

**POST** `/v1/websites/{website_id}/forecast`

Request:
```json
{
  "assumptions": {
    "traffic_growth_pct": 15,
    "page_weight_growth_pct": 8,
    "release_frequency_per_month": 4,
    "grid_intensity_trend_pct": -3
  },
  "horizon_months": 12
}
```

Response `200`:
```json
{
  "website_id": "web_8f2a1c",
  "assumptions": {
    "traffic_growth_pct": 15,
    "page_weight_growth_pct": 8,
    "release_frequency_per_month": 4,
    "grid_intensity_trend_pct": -3
  },
  "scenarios": [
    {
      "label": "baseline",
      "points": [
        { "date": "2026-09-01", "g_co2e_per_month": 18300 },
        { "date": "2027-08-01", "g_co2e_per_month": 24900 }
      ]
    },
    {
      "label": "optimistic",
      "points": [
        { "date": "2026-09-01", "g_co2e_per_month": 18300 },
        { "date": "2027-08-01", "g_co2e_per_month": 20100 }
      ]
    },
    {
      "label": "pessimistic",
      "points": [
        { "date": "2026-09-01", "g_co2e_per_month": 18300 },
        { "date": "2027-08-01", "g_co2e_per_month": 31800 }
      ]
    }
  ],
  "limitations_note": "Forecasts are projections based on the assumptions above, not predictions of certainty. Small changes in traffic or content strategy can shift these lines significantly.",
  "methodology_version": "swdm-v4.0+gwf-2026-08"
}
```

---

## 11. Carbon Budget Create/Update

**PUT** `/v1/websites/{website_id}/budget`

Request:
```json
{
  "scope": "page",
  "page_id": "page_9a2c",
  "threshold_g": 0.5,
  "alert_channel": "email"
}
```

Response `200`:
```json
{
  "id": "budget_77d1",
  "website_id": "web_8f2a1c",
  "scope": "page",
  "page_id": "page_9a2c",
  "threshold_g": 0.5,
  "alert_channel": "email",
  "current_estimate_g": 0.61,
  "status": "over_budget",
  "headroom_pct": -22.0,
  "created_at": "2026-08-25T09:20:00Z"
}
```

---

## 12. Regression Event

**GET** `/v1/websites/{website_id}/regressions`

Response `200`:
```json
{
  "website_id": "web_8f2a1c",
  "events": [
    {
      "id": "reg_305",
      "budget_id": "budget_77d1",
      "audit_id": "aud_c93e7d",
      "previous_audit_id": "aud_b81f22",
      "delta_pct": 22.0,
      "severity": "moderate",
      "detected_at": "2026-08-25T09:14:30Z",
      "resolved": false,
      "resource_deltas": [
        { "category": "image", "previous_bytes": 620000, "new_bytes": 1240000, "delta_bytes": 620000 },
        { "category": "third_party", "previous_bytes": 340000, "new_bytes": 504213, "delta_bytes": 164213 }
      ],
      "linked_recommendation_id": "rec_101"
    }
  ]
}
```

---

## 13. Dashboard Summary

**GET** `/v1/orgs/{org_id}/dashboard`

Response `200`:
```json
{
  "org_id": "org_4b91",
  "website_count": 4,
  "avg_eco_score": 68,
  "total_estimated_monthly_g_co2e": 74200,
  "active_regressions": 1,
  "websites": [
    {
      "id": "web_8f2a1c",
      "name": "Example Shop — Marketing Site",
      "eco_score": 71,
      "grade": "B-",
      "trend_pct_last_30d": 22.0,
      "last_audit_at": "2026-08-25T09:14:22Z"
    }
  ],
  "as_of": "2026-08-25T09:30:00Z",
  "methodology_version": "swdm-v4.0+gwf-2026-08"
}
```

---

## 14. Report Export — Request/Status

**POST** `/v1/reports`

Request:
```json
{
  "scope": { "website_id": "web_8f2a1c", "date_range": { "from": "2026-07-25", "to": "2026-08-25" } },
  "audience": "both",
  "expires_in_days": 14
}
```

Response `202`:
```json
{
  "report_id": "rep_5c11",
  "status": "generating"
}
```

**GET** `/v1/reports/{report_id}/status`

Response `200`:
```json
{
  "report_id": "rep_5c11",
  "status": "ready",
  "share_url": "https://app.carbonerra.io/r/8b3f9e2a",
  "expires_at": "2026-09-08T09:00:00Z"
}
```

---

## 15. GitHub/CI Regression Webhook Payload

**Outbound: Carbonerra → GitHub Check Run**

```json
{
  "name": "carbonerra/carbon-budget",
  "head_sha": "f8a192cd3e1b7...",
  "status": "completed",
  "conclusion": "failure",
  "output": {
    "title": "Carbon budget exceeded: +22% (0.50g → 0.61g per view)",
    "summary": "This deployment increases estimated carbon per page view by 22%, exceeding the configured budget of 0.50g for this page.\n\nTop contributors:\n- hero.jpg grew from 620KB to 1.24MB (+620KB)\n- Third-party scripts grew by 164KB\n\nSee full report: https://app.carbonerra.io/app/websites/web_8f2a1c/regressions/reg_305",
    "text": "Estimated using swdm-v4.0+gwf-2026-08. This is a modeled estimate, not a direct measurement."
  }
}
```

**Inbound: CI → Carbonerra regression-check trigger**

**POST** `/v1/ci/regression-check`

Request:
```json
{
  "website_id": "web_8f2a1c",
  "deployment_url": "https://pr-482--example-shop.preview.example.com",
  "pull_request": {
    "repo": "example-org/example-shop",
    "number": 482,
    "head_sha": "f8a192cd3e1b7..."
  }
}
```

Response `200`:
```json
{
  "audit_id": "aud_c93e7d",
  "verdict": "fail",
  "delta_pct": 22.0,
  "severity": "moderate",
  "budget_threshold_g": 0.5,
  "current_estimate_g": 0.61,
  "summary_markdown": "**Carbon budget exceeded: +22%** (0.50g → 0.61g per view). Top contributor: hero.jpg (+620KB).",
  "methodology_version": "swdm-v4.0+gwf-2026-08"
}
```
