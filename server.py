import http.server
import json
import os
import socketserver
import sys

# Ensure UTF-8 console output on Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from engine.scanner import perform_live_audit
from engine.carbon import calculate_carbon_footprint

PORT = 8082
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class CarbonerraHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def _send_json(self, data, status=200):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        if self.path == "/api/health":
            self._send_json({
                "status": "healthy",
                "service": "Carbonerra Telemetry Engine",
                "version": "1.0.0",
                "methodology": "SWDM v4 + Green Web Foundation"
            })
            return

        super().do_GET()

    def do_POST(self):
        if self.path == "/api/audit":
            try:
                content_length = int(self.headers.get("Content-Length", 0))
                raw_body = self.rfile.read(content_length).decode("utf-8")
                payload = json.loads(raw_body) if raw_body else {}
                target_url = payload.get("url", "").strip()

                if not target_url:
                    self._send_json({"status": "error", "message": "Target URL parameter is required."}, status=400)
                    return

                audit_result = perform_live_audit(target_url)
                self._send_json(audit_result)
            except ValueError as ve:
                self._send_json({"status": "error", "message": str(ve)}, status=400)
            except Exception as e:
                self._send_json({"status": "error", "message": f"Audit execution failed: {str(e)}"}, status=500)
            return

        if self.path == "/api/simulate":
            try:
                content_length = int(self.headers.get("Content-Length", 0))
                raw_body = self.rfile.read(content_length).decode("utf-8")
                payload = json.loads(raw_body) if raw_body else {}

                base_bytes = int(payload.get("baseline_bytes", 1850000))
                img_comp = int(payload.get("img_comp", 85))
                js_defer = int(payload.get("js_defer", 60))
                cache_ttl = int(payload.get("cache_ttl", 30))
                green_hosting = bool(payload.get("green_hosting", True))

                # Real physics model
                img_factor = 1.0 - (img_comp / 100.0) * 0.45
                js_factor = 1.0 - (js_defer / 100.0) * 0.20
                cache_factor = 1.0 - min(cache_ttl / 365.0, 0.15)

                simulated_bytes = int(base_bytes * img_factor * js_factor * cache_factor)
                baseline_metrics = calculate_carbon_footprint(base_bytes, is_green=False)
                simulated_metrics = calculate_carbon_footprint(simulated_bytes, is_green=green_hosting)

                saving_pct = round(((baseline_metrics["co2_grams"] - simulated_metrics["co2_grams"]) / max(baseline_metrics["co2_grams"], 0.001)) * 100, 1)

                self._send_json({
                    "status": "success",
                    "baseline": baseline_metrics,
                    "simulated": simulated_metrics,
                    "saving_pct": max(saving_pct, 0.0),
                    "annual_saving_metric_tons": round(baseline_metrics["annual_impact"]["co2_metric_tons"] - simulated_metrics["annual_impact"]["co2_metric_tons"], 2)
                })
            except Exception as e:
                self._send_json({"status": "error", "message": str(e)}, status=400)
            return

        self._send_json({"status": "error", "message": "Endpoint not found"}, status=404)

if __name__ == "__main__":
    # Allow port reuse
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), CarbonerraHandler) as httpd:
        print(f"⚡ CARBONERRA Platform (PCCOE Hackathon) running at http://localhost:{PORT}")
        print("  - Static UI:    http://localhost:8082/")
        print("  - Health API:   http://localhost:8082/api/health")
        print("  - Live Audit:   http://localhost:8082/api/audit")
        print("  - Simulator:    http://localhost:8082/api/simulate")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")
