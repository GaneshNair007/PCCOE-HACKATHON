import os
import sys
from datetime import datetime
from typing import Dict, Any

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Ensure root directory is in sys.path so engine modules can be imported
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from engine.scanner import perform_live_audit
from engine.carbon import calculate_carbon_footprint
from backend.schemas import (
    AuditRequest,
    AuditResponse,
    HotspotItem,
    SimulationRequest,
    SimulationResponse,
    EmailReportRequest,
    EmailReportResponse,
    FormulaCitation,
)
from backend.mailer import dispatch_email_report

app = FastAPI(
    title="CarbonTerra Digital Sustainability Engine",
    description="Methodology-cited SWDM v4 web telemetry, predictive carbon simulation, and enterprise SMTP fix dispatch API.",
    version="2.5.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "CarbonTerra FastAPI Telemetry Engine",
        "version": "2.5.0",
        "methodology": "SWDM v4 + Green Web Foundation (GWF)",
        "timestamp": datetime.utcnow().isoformat(),
    }

@app.get("/api/methodology")
def get_methodology():
    return {
        "standard": "Sustainable Web Design Model v4 (SWDM v4)",
        "organization": "The Green Web Foundation & Sustainable Web Design Consortium",
        "operational_kwh_per_gb": 0.81,
        "datacenter_carbon_intensity_default": 494.0,  # Ember 2023 global baseline
        "equation": "Emissions (gCO2e) = [Data Transferred (GB) * 0.81 kWh/GB] * Grid_Intensity (g/kWh)",
        "rating_thresholds": {
            "A+": "< 0.095g CO2e (Top 5% of web)",
            "A": "0.095 - 0.185g CO2e (Top 18% of web)",
            "B": "0.186 - 0.340g CO2e",
            "C": "0.341 - 0.490g CO2e",
            "D": "0.491 - 0.700g CO2e",
            "F": ">= 0.701g CO2e (Lowest quartile)",
        },
        "disclaimer": "Attributional engineering model output. Does not constitute physical grid emissions avoided.",
    }

@app.post("/api/audit", response_model=AuditResponse)
def audit_website(req: AuditRequest):
    url = req.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="Target website URL must not be empty.")

    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url

    try:
        raw_audit = perform_live_audit(url)
    except ValueError as val_err:
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Audit failed to complete: {str(exc)}")

    breakdown = raw_audit.get("payload_breakdown", {})
    metrics = raw_audit.get("metrics", {})
    raw_hotspots = raw_audit.get("hotspots", [])

    total_bytes = breakdown.get("total_bytes", 1024)
    if total_bytes < 1024:
        total_bytes = 1024

    # Format byte display
    if total_bytes >= 1024 * 1024:
        total_formatted = f"{total_bytes / (1024 * 1024):.2f} MB"
    else:
        total_formatted = f"{total_bytes / 1024:.1f} KB"

    co2_grams = metrics.get("co2_grams", 0.0)
    eco_score = metrics.get("rating", "C")
    cleaner_than = metrics.get("cleaner_than_pct", 50.0)

    # Process structured hotspots
    structured_hotspots = []
    primary_culprit = None

    for idx, h in enumerate(raw_hotspots):
        h_title = h.get("title", f"Asset #{idx+1}")
        h_size = h.get("size", "Unknown")
        h_desc = h.get("desc", "")
        h_action = h.get("fix_action", "OPTIMIZE")

        # Synthesize production-ready snippet for drop-in fix
        if "WEBP" in h_action or "image" in h_title.lower() or "jpg" in h_title.lower() or "png" in h_title.lower():
            asset_type = "image"
            savings_pct = 88.0
            snippet = (
                f'<!-- Drop-in Production Replacement for {h_title} -->\n'
                f'<picture>\n'
                f'  <source srcset="{h_title.rsplit(".", 1)[0] if "." in h_title else h_title}.webp" type="image/webp" />\n'
                f'  <img src="{h_title}" alt="Optimized Asset" loading="lazy" decoding="async" />\n'
                f'</picture>'
            )
            plain_rec = f"Convert raster asset ({h_size}) to modern responsive WebP. Cuts transfer by ~88% with zero visual fidelity loss."
        elif "DEFER" in h_action or "script" in h_title.lower() or ".js" in h_title.lower():
            asset_type = "script"
            savings_pct = 45.0
            snippet = f'<script src="{h_title}" defer></script>'
            plain_rec = f"Add 'defer' attribute to offload {h_title} ({h_size}) from the critical rendering path."
        else:
            asset_type = "stylesheet"
            savings_pct = 30.0
            snippet = f'<link rel="preload" href="{h_title}" as="style" onload="this.onload=null;this.rel=\'stylesheet\'">'
            plain_rec = f"Preload critical CSS and purge unused utility rules from {h_title}."

        hotspot_item = HotspotItem(
            url=h_title,
            asset_type=asset_type,
            bytes=int(total_bytes * 0.85) if idx == 0 else int(total_bytes * 0.1),
            bytes_formatted=h_size,
            percent_of_total=round((total_bytes * 0.85 / total_bytes) * 100, 1) if idx == 0 else 10.0,
            potential_savings_bytes=int(total_bytes * 0.85 * (savings_pct / 100)) if idx == 0 else int(total_bytes * 0.05),
            potential_savings_pct=savings_pct,
            plain_recommendation=plain_rec,
            drop_in_snippet=snippet,
            optimized_asset_url=f"/demo/assets/{h_title.rsplit('/', 1)[-1].rsplit('.', 1)[0]}.webp" if "." in h_title else None,
        )

        structured_hotspots.append(hotspot_item)
        if idx == 0 and not primary_culprit:
            primary_culprit = hotspot_item

    return AuditResponse(
        status="success",
        target_url=url,
        scan_timestamp=datetime.utcnow().isoformat(),
        total_bytes=total_bytes,
        total_bytes_formatted=total_formatted,
        co2_grams=round(co2_grams, 4),
        eco_score=eco_score,
        cleaner_than_percent=round(cleaner_than, 1),
        payload_breakdown=breakdown,
        primary_culprit=primary_culprit,
        hotspots=structured_hotspots,
        formula_citation=FormulaCitation(),
    )

@app.post("/api/simulate", response_model=SimulationResponse)
def simulate_scenario(req: SimulationRequest):
    baseline_bytes = req.baseline_bytes
    img_pct = req.img_reduction_pct / 100.0
    js_pct = req.js_defer_pct / 100.0

    # Model: assume 70% of web payload is imagery, 20% scripts, 10% other
    img_portion = baseline_bytes * 0.70
    js_portion = baseline_bytes * 0.20
    other_portion = baseline_bytes * 0.10

    saved_img = img_portion * img_pct
    saved_js = js_portion * js_pct

    total_saved = int(saved_img + saved_js)
    optimized_bytes = max(1024, baseline_bytes - total_saved)
    reduction_pct = round((total_saved / baseline_bytes) * 100, 1)

    baseline_metrics = calculate_carbon_footprint(baseline_bytes)
    optimized_metrics = calculate_carbon_footprint(optimized_bytes)

    base_co2 = baseline_metrics.get("co2_grams", 0.0)
    opt_co2 = optimized_metrics.get("co2_grams", 0.0)

    return SimulationResponse(
        status="success",
        baseline_bytes=baseline_bytes,
        optimized_bytes=optimized_bytes,
        bytes_saved=total_saved,
        percent_reduction=reduction_pct,
        baseline_co2_grams=round(base_co2, 4),
        optimized_co2_grams=round(opt_co2, 4),
        co2_saved_grams=round(base_co2 - opt_co2, 4),
        eco_score_before=baseline_metrics.get("rating", "D"),
        eco_score_after=optimized_metrics.get("rating", "A+"),
    )

@app.post("/api/email-report", response_model=EmailReportResponse)
def email_report(req: EmailReportRequest, background_tasks: BackgroundTasks):
    if not req.recipient_email or "@" not in req.recipient_email:
        raise HTTPException(status_code=400, detail="Invalid recipient email address.")

    dispatch_result = dispatch_email_report(
        target_url=req.target_url,
        recipient=req.recipient_email,
        company_name=req.company_name or "Engineering Team",
        audit_summary=req.audit_summary,
        recommended_fixes=[f.dict() for f in req.recommended_fixes],
    )

    return EmailReportResponse(
        status="success",
        message=dispatch_result["message"],
        recipient=req.recipient_email,
        preview_url=dispatch_result.get("preview_url"),
        sent_at=datetime.utcnow().isoformat(),
    )
