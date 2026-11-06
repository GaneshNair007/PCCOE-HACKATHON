from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class AuditRequest(BaseModel):
    url: str = Field(..., description="Target website URL to audit")

class HotspotItem(BaseModel):
    url: str
    asset_type: str
    bytes: int
    bytes_formatted: str
    percent_of_total: float
    potential_savings_bytes: int
    potential_savings_pct: float
    plain_recommendation: str
    drop_in_snippet: Optional[str] = None
    optimized_asset_url: Optional[str] = None

class FormulaCitation(BaseModel):
    standard: str = "Sustainable Web Design Model (SWDM v4)"
    equation: str = "E = [Data (GB) * 0.81 kWh/GB] * Grid_Intensity (gCO2/kWh)"
    grid_intensity: float = 494.0
    reference_authority: str = "The Green Web Foundation & Ember 2023"

class AuditResponse(BaseModel):
    status: str = "success"
    target_url: str
    scan_timestamp: str
    total_bytes: int
    total_bytes_formatted: str
    co2_grams: float
    eco_score: str  # A+, A, B, C, D, F
    cleaner_than_percent: float
    payload_breakdown: Dict[str, Any]
    primary_culprit: Optional[HotspotItem] = None
    hotspots: List[HotspotItem] = []
    formula_citation: FormulaCitation = FormulaCitation()

class SimulationRequest(BaseModel):
    baseline_bytes: int = Field(..., ge=1, description="Baseline transfer size in bytes")
    img_reduction_pct: float = Field(default=85.0, ge=0.0, le=99.0)
    js_defer_pct: float = Field(default=40.0, ge=0.0, le=99.0)
    grid_intensity: float = Field(default=494.0, ge=50.0, le=1200.0)

class SimulationResponse(BaseModel):
    status: str = "success"
    baseline_bytes: int
    optimized_bytes: int
    bytes_saved: int
    percent_reduction: float
    baseline_co2_grams: float
    optimized_co2_grams: float
    co2_saved_grams: float
    eco_score_before: str
    eco_score_after: str

class RecommendedFix(BaseModel):
    title: str
    impact: str
    effort: str
    description: str
    drop_in_snippet: Optional[str] = None
    optimized_asset_name: Optional[str] = None

class EmailReportRequest(BaseModel):
    recipient_email: str
    target_url: str
    company_name: Optional[str] = "Engineering Team"
    audit_summary: Dict[str, Any]
    recommended_fixes: List[RecommendedFix] = []

class EmailReportResponse(BaseModel):
    status: str = "success"
    message: str
    recipient: str
    preview_url: Optional[str] = None
    sent_at: str
