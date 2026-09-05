"""
Carbonerra - SWDM v4 Carbon Calculation Engine & Green Hosting Verifier
Implements the Sustainable Web Design Model version 4 and Green Web Foundation lookups.
"""

import json
import urllib.request
import urllib.error

# SWDM v4 Energy coefficients (kWh per byte)
KWH_PER_BYTE_OPERATIONAL = 0.00000000081  # 0.81 kWh / GB
KWH_PER_BYTE_EMBODIED = 0.00000000043     # 0.43 kWh / GB
GLOBAL_GRID_INTENSITY = 494.0             # g CO2e / kWh (global average)
GREEN_HOSTING_DISCOUNT = 0.70             # 30% reduction for 100% renewable hosting

def calculate_carbon_footprint(total_bytes: int, is_green: bool = False) -> dict:
    """
    Computes carbon footprint metrics per page view using SWDM v4.
    """
    operational_kwh = total_bytes * KWH_PER_BYTE_OPERATIONAL
    embodied_kwh = total_bytes * KWH_PER_BYTE_EMBODIED
    total_kwh = operational_kwh + embodied_kwh

    intensity = GLOBAL_GRID_INTENSITY * (GREEN_HOSTING_DISCOUNT if is_green else 1.0)
    co2_grams = total_kwh * intensity

    # EcoScore calculation & percentile benchmark
    if co2_grams <= 0.15:
        score_grade = "A+"
        percentile = 88
    elif co2_grams <= 0.25:
        score_grade = "A"
        percentile = 76
    elif co2_grams <= 0.40:
        score_grade = "B"
        percentile = 58
    elif co2_grams <= 0.65:
        score_grade = "C"
        percentile = 38
    elif co2_grams <= 0.90:
        score_grade = "D"
        percentile = 20
    else:
        score_grade = "F"
        percentile = 8

    # Annual impact projections (assuming default 100,000 views/year)
    annual_views = 100000
    annual_co2_kg = (co2_grams * annual_views) / 1000.0
    annual_co2_tons = annual_co2_kg / 1000.0
    trees_needed = annual_co2_kg / 21.77
    annual_kwh = total_kwh * annual_views
    car_miles_equiv = annual_co2_kg / 0.404

    return {
        "bytes_transferred": total_bytes,
        "payload_mb": round(total_bytes / (1024 * 1024), 2),
        "co2_grams": round(co2_grams, 3),
        "total_kwh": total_kwh,
        "operational_kwh": operational_kwh,
        "embodied_kwh": embodied_kwh,
        "is_green_hosting": is_green,
        "ecoscore_grade": score_grade,
        "cleaner_than_percentile": percentile,
        "annual_impact": {
            "views_basis": annual_views,
            "co2_kg": round(annual_co2_kg, 1),
            "co2_metric_tons": round(annual_co2_tons, 2),
            "trees_equivalent": round(trees_needed, 1),
            "kwh_consumed": round(annual_kwh, 1),
            "car_miles_equivalent": round(car_miles_equiv, 0)
        }
    }

def check_green_hosting(domain: str) -> dict:
    """
    Queries The Green Web Foundation API to determine if domain is on verified green hosting.
    """
    clean_domain = domain.split(":")[0].strip().lower()
    api_url = f"https://api.thegreenwebfoundation.org/greencheck/{clean_domain}"
    
    headers = {
        "User-Agent": "Carbonerra-PCCOE-Hackathon/1.0 (sustainability-audit)"
    }
    
    req = urllib.request.Request(api_url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=3.5) as response:
            if response.status == 200:
                data = json.loads(response.read().decode("utf-8"))
                return {
                    "is_green": bool(data.get("green", False)),
                    "hosted_by": data.get("hosted_by") or ("Verified Green Host" if data.get("green") else "Standard Grid"),
                    "data_source": "The Green Web Foundation API",
                    "verified": True
                }
    except Exception:
        pass

    # Default fallback if unverified or timeout
    return {
        "is_green": False,
        "hosted_by": "Unconfirmed / Standard Grid",
        "data_source": "The Green Web Foundation (Unverified/Offline)",
        "verified": False
    }
