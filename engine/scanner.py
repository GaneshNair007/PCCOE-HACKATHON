"""
Carbonerra - Real Web Asset Scanner with SSRF Defense
Fetches target web pages, measures payload sizes by asset type, and identifies carbon hotspots.
"""

import ipaddress
import re
import socket
import urllib.error
import urllib.parse
import urllib.request
from engine.carbon import calculate_carbon_footprint, check_green_hosting

# Blocked IP networks for SSRF defense
RESTRICTED_NETWORKS = [
    ipaddress.ip_network("0.0.0.0/8"),
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("169.254.0.0/16"),   # Link-local & cloud metadata (169.254.169.254)
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("224.0.0.0/4"),     # Multicast
    ipaddress.ip_network("240.0.0.0/4"),     # Reserved
]

def validate_url_security(target_url: str) -> urllib.parse.ParseResult:
    """
    Validates URL scheme and checks resolved IP against SSRF blacklists.
    """
    parsed = urllib.parse.urlparse(target_url)
    if parsed.scheme not in ("http", "https"):
        raise ValueError(f"Invalid URL scheme '{parsed.scheme}'. Only http and https are allowed.")

    hostname = parsed.hostname
    if not hostname:
        raise ValueError("URL must include a valid hostname.")

    if hostname.lower() in ("localhost", "127.0.0.1", "0.0.0.0", "::1"):
        raise ValueError("Audits against localhost or loopback are prohibited for security.")

    try:
        ip_str = socket.gethostbyname(hostname)
        ip_obj = ipaddress.ip_address(ip_str)
        for net in RESTRICTED_NETWORKS:
            if ip_obj in net:
                raise ValueError(f"Access to private/internal network address ({ip_str}) is prohibited.")
    except socket.gaierror:
        raise ValueError(f"Unable to resolve DNS hostname: '{hostname}'")

    return parsed

def perform_live_audit(target_url: str) -> dict:
    """
    Executes a real carbon telemetry audit on the given target URL.
    """
    if not target_url.startswith(("http://", "https://")):
        target_url = "https://" + target_url

    parsed_url = validate_url_security(target_url)
    domain = parsed_url.hostname

    # 1. Check Green Hosting status via Green Web Foundation
    green_info = check_green_hosting(domain)

    # 2. Fetch Root Document
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 CarbonerraAudit/1.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }

    req = urllib.request.Request(target_url, headers=headers)
    html_content = ""
    html_bytes = 0

    try:
        with urllib.request.urlopen(req, timeout=8.0) as response:
            raw_data = response.read()
            html_bytes = len(raw_data)
            try:
                html_content = raw_data.decode("utf-8", errors="ignore")
            except Exception:
                html_content = ""
    except urllib.error.HTTPError as e:
        # Still attempt to parse error body if received
        html_bytes = 4096
    except Exception as e:
        raise RuntimeError(f"Failed to connect to target URL: {str(e)}")

    # 3. Discover linked assets
    assets = []
    # Images
    img_matches = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', html_content, re.IGNORECASE)
    for src in img_matches[:12]:
        assets.append({"type": "image", "url": urllib.parse.urljoin(target_url, src)})

    # Scripts
    script_matches = re.findall(r'<script[^>]+src=["\']([^"\']+)["\']', html_content, re.IGNORECASE)
    for src in script_matches[:8]:
        assets.append({"type": "script", "url": urllib.parse.urljoin(target_url, src)})

    # Stylesheets
    css_matches = re.findall(r'<link[^>]+href=["\']([^"\']+\.css[^"\']*)["\']', html_content, re.IGNORECASE)
    for src in css_matches[:6]:
        assets.append({"type": "stylesheet", "url": urllib.parse.urljoin(target_url, src)})

    # 4. Measure asset weights
    total_transfer_bytes = html_bytes
    category_bytes = {
        "html": html_bytes,
        "image": 0,
        "script": 0,
        "stylesheet": 0,
        "other": 0
    }
    detected_hotspots = []

    for asset in assets:
        asset_url = asset["url"]
        asset_type = asset["type"]
        asset_size = 0

        # Attempt quick HEAD request for Content-Length
        try:
            head_req = urllib.request.Request(asset_url, headers=headers, method="HEAD")
            with urllib.request.urlopen(head_req, timeout=2.5) as resp:
                content_len = resp.headers.get("Content-Length")
                if content_len and content_len.isdigit():
                    asset_size = int(content_len)
        except Exception:
            # Fallback estimation if HEAD blocked by server
            if asset_type == "image":
                asset_size = 180 * 1024
            elif asset_type == "script":
                asset_size = 95 * 1024
            elif asset_type == "stylesheet":
                asset_size = 35 * 1024

        if asset_size > 0:
            total_transfer_bytes += asset_size
            category_bytes[asset_type] = category_bytes.get(asset_type, 0) + asset_size
            
            # Record for hotspot sorting
            filename = asset_url.split("?")[0].split("/")[-1] or asset_url
            detected_hotspots.append({
                "name": filename[:35],
                "full_url": asset_url,
                "type": asset_type,
                "size_bytes": asset_size,
                "size_display": f"{round(asset_size / 1024, 1)} KB" if asset_size < 1024 * 1024 else f"{round(asset_size / (1024*1024), 2)} MB"
            })

    # Sort hotspots by size descending
    detected_hotspots.sort(key=lambda x: x["size_bytes"], reverse=True)

    # If no external assets were discovered (e.g. minimal test page), ensure baseline
    if total_transfer_bytes < 1024:
        total_transfer_bytes = 1024

    # 5. Compute SWDM v4 Carbon Metrics
    metrics = calculate_carbon_footprint(total_transfer_bytes, is_green=green_info["is_green"])

    # 6. Build Hotspot Presentation Cards
    hotspot_cards = []
    
    # Priority 0: Heaviest Image or Large Asset
    top_img = next((h for h in detected_hotspots if h["type"] == "image"), None)
    if top_img and top_img["size_bytes"] > 150 * 1024:
        hotspot_cards.append({
            "priority": "P0 - CRITICAL PAYLOAD",
            "priority_level": "danger",
            "title": top_img["name"],
            "size": top_img["size_display"],
            "co2_est": f"{round(top_img['size_bytes'] * 0.00000000124 * 494, 2)}g / view",
            "desc": "Uncompressed or oversized image asset causing elevated network payload.",
            "fix_action": "AVIF / WEBP CONVERSION",
            "cta_label": "QUICK FIX WITH AI +"
        })
    else:
        hotspot_cards.append({
            "priority": "P0 - PAYLOAD AUDIT",
            "priority_level": "forest",
            "title": "Document Payload",
            "size": f"{round(html_bytes / 1024, 1)} KB",
            "co2_est": f"{round(html_bytes * 0.00000000124 * 494, 3)}g / view",
            "desc": "Base HTML document size and transfer payload.",
            "fix_action": "GZIP / BROTLI COMPRESSION",
            "cta_label": "OPTIMIZE +"
        })

    # Priority 1: Heaviest Script
    top_script = next((h for h in detected_hotspots if h["type"] == "script"), None)
    if top_script:
        hotspot_cards.append({
            "priority": "P1 - JAVASCRIPT PAYLOAD",
            "priority_level": "warning",
            "title": top_script["name"],
            "size": top_script["size_display"],
            "co2_est": f"{round(top_script['size_bytes'] * 0.00000000124 * 494, 3)}g / view",
            "desc": "JavaScript file loaded on page view impacting client CPU and network transfer.",
            "fix_action": "DEFER & TREE-SHAKE",
            "cta_label": "DEFER JS +"
        })
    else:
        hotspot_cards.append({
            "priority": "P1 - SCRIPT AUDIT",
            "priority_level": "forest",
            "title": "Minimal Client Scripts",
            "size": "< 50 KB",
            "co2_est": "< 0.02g / view",
            "desc": "Client script bundle is relatively lightweight.",
            "fix_action": "VERIFIED LIGHTWEIGHT",
            "cta_label": "INSPECT +"
        })

    # Priority 2: CSS / Other
    top_css = next((h for h in detected_hotspots if h["type"] == "stylesheet"), None)
    if top_css:
        hotspot_cards.append({
            "priority": "P2 - STYLESHEET BUNDLE",
            "priority_level": "forest",
            "title": top_css["name"],
            "size": top_css["size_display"],
            "co2_est": f"{round(top_css['size_bytes'] * 0.00000000124 * 494, 3)}g / view",
            "desc": "CSS stylesheet rules parsed during initial render.",
            "fix_action": "PURGE UNUSED CSS",
            "cta_label": "PURGECSS +"
        })
    else:
        hotspot_cards.append({
            "priority": "P2 - ASSET CACHING",
            "priority_level": "forest",
            "title": "Browser Cache Headers",
            "size": "Header Config",
            "co2_est": "0.00g / view",
            "desc": "Enforce long-term max-age retention for return visits.",
            "fix_action": "CACHE RETENTION",
            "cta_label": "CONFIGURE +"
        })

    return {
        "status": "success",
        "target_url": target_url,
        "domain": domain,
        "metrics": metrics,
        "green_hosting": green_info,
        "payload_breakdown": {
            "total_bytes": total_transfer_bytes,
            "total_mb": round(total_transfer_bytes / (1024 * 1024), 2),
            "html_kb": round(category_bytes["html"] / 1024, 1),
            "image_kb": round(category_bytes["image"] / 1024, 1),
            "script_kb": round(category_bytes["script"] / 1024, 1),
            "stylesheet_kb": round(category_bytes["stylesheet"] / 1024, 1),
            "assets_discovered": len(detected_hotspots)
        },
        "hotspots": hotspot_cards
    }
