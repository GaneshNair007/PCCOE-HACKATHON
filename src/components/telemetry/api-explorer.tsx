"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Code2,
  Terminal,
  Play,
  Copy,
  Check,
  Zap,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  FileCode,
} from "lucide-react";

interface ApiEndpointConfig {
  id: string;
  name: string;
  method: "GET" | "POST";
  path: string;
  description: string;
  defaultPayload?: Record<string, any>;
}

const ENDPOINTS: ApiEndpointConfig[] = [
  {
    id: "audit",
    name: "Perform Live Audit",
    method: "POST",
    path: "/api/audit",
    description: "Executes multi-source crawl, DNS lookup, regional grid intensity, and SWDM v4 footprint calculation.",
    defaultPayload: { url: "stripe.com" },
  },
  {
    id: "methodology",
    name: "Retrieve Methodology",
    method: "GET",
    path: "/api/methodology",
    description: "Returns versioned carbon energy coefficients, EcoScore grade thresholds, and documented limitations.",
  },
  {
    id: "simulate",
    name: "Run What-If Simulation",
    method: "POST",
    path: "/api/simulate",
    description: "Models transfer reductions (image AVIF compression, JS deferral) against an audited baseline.",
    defaultPayload: {
      baseline_bytes: 2150000,
      img_comp: 85,
      js_defer: 60,
      cache_ttl: 30,
      green_hosting: true,
    },
  },
  {
    id: "chat",
    name: "Agentic Assistant Tool",
    method: "POST",
    path: "/api/chat",
    description: "Grounded assistant executing deterministic tools (run_audit, compare, simulate, explain_for_exec).",
    defaultPayload: { message: "explain for executives" },
  },
];

export function ApiExplorer() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpointConfig>(ENDPOINTS[0]);
  const [payloadText, setPayloadText] = useState<string>(
    JSON.stringify(ENDPOINTS[0].defaultPayload, null, 2) || "{}"
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [responseBody, setResponseBody] = useState<any>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const handleSelectEndpoint = (endpoint: ApiEndpointConfig) => {
    setSelectedEndpoint(endpoint);
    setPayloadText(
      endpoint.defaultPayload ? JSON.stringify(endpoint.defaultPayload, null, 2) : ""
    );
    setResponseStatus(null);
    setResponseBody(null);
    setLatencyMs(null);
  };

  const handleExecuteRequest = async () => {
    setIsLoading(true);
    setResponseStatus(null);
    setResponseBody(null);
    const start = performance.now();

    try {
      let body: string | undefined = undefined;
      if (selectedEndpoint.method === "POST" && payloadText.trim()) {
        body = payloadText;
      }

      const res = await fetch(selectedEndpoint.path, {
        method: selectedEndpoint.method,
        headers: {
          "Content-Type": "application/json",
          "X-Client": "carbonerra-api-explorer",
        },
        body,
      });

      const elapsed = Math.round(performance.now() - start);
      setLatencyMs(elapsed);
      setResponseStatus(res.status);

      const headersObj: Record<string, string> = {
        "content-type": res.headers.get("content-type") || "application/json",
        "cache-control": res.headers.get("cache-control") || "no-store",
      };
      setResponseHeaders(headersObj);

      const data = await res.json();
      setResponseBody(data);
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - start);
      setLatencyMs(elapsed);
      setResponseStatus(500);
      setResponseBody({ error: err.message || "Network request failed." });
    } finally {
      setIsLoading(false);
    }
  };

  const generateCurlSnippet = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3001";
    if (selectedEndpoint.method === "GET") {
      return `curl -X GET "${origin}${selectedEndpoint.path}" \\
  -H "Accept: application/json"`;
    }
    const cleanJson = payloadText.replace(/\n\s*/g, " ");
    return `curl -X POST "${origin}${selectedEndpoint.path}" \\
  -H "Content-Type: application/json" \\
  -d '${cleanJson}'`;
  };

  const generateJsSnippet = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3001";
    if (selectedEndpoint.method === "GET") {
      return `const response = await fetch("${origin}${selectedEndpoint.path}");
const data = await response.json();
console.log(data);`;
    }
    return `const response = await fetch("${origin}${selectedEndpoint.path}", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(${payloadText || "{}"}),
});
const data = await response.json();
console.log(data);`;
  };

  const generatePythonSnippet = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3001";
    if (selectedEndpoint.method === "GET") {
      return `import requests

res = requests.get("${origin}${selectedEndpoint.path}")
print(res.json())`;
    }
    return `import requests

payload = ${payloadText || "{}"}
res = requests.post("${origin}${selectedEndpoint.path}", json=payload)
print(res.json())`;
  };

  const handleCopyCode = (format: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <Card className="p-6 sm:p-8 glass-panel-elevated border border-lime/30 rounded-3xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-lime uppercase tracking-wider mb-1">
            <Terminal className="w-4 h-4 text-lime" />
            <span>Interactive API Explorer</span>
            <span className="bg-lime/10 px-2 py-0.5 rounded text-[10px] text-lime border border-lime/30">
              Live Gateway
            </span>
          </div>
          <h3 className="font-display text-2xl sm:text-3xl text-cream uppercase">
            Test Carbonerra Endpoints
          </h3>
          <p className="text-xs text-sage/75 mt-1 max-w-xl">
            Directly probe Carbonerra&apos;s REST endpoints from your browser. Inspect request headers, test custom payloads, and export production code snippets.
          </p>
        </div>

        {/* Action button */}
        <Button
          variant="lime"
          size="md"
          onClick={handleExecuteRequest}
          isLoading={isLoading}
          className="font-bold font-mono text-xs shrink-0 shadow-[0_0_20px_rgba(203,255,0,0.3)]"
        >
          <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
          SEND REQUEST
        </Button>
      </div>

      {/* Endpoint Selector Tabs */}
      <div className="flex flex-wrap gap-2">
        {ENDPOINTS.map((ep) => {
          const isSelected = selectedEndpoint.id === ep.id;
          return (
            <button
              key={ep.id}
              onClick={() => handleSelectEndpoint(ep)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                isSelected
                  ? "bg-lime text-black font-bold shadow-[0_0_15px_rgba(203,255,0,0.3)]"
                  : "bg-surface-elevated text-sage/80 hover:text-cream border border-surface-border hover:border-lime/40"
              }`}
            >
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  isSelected
                    ? "bg-black/20 text-black"
                    : ep.method === "POST"
                    ? "bg-lime/10 text-lime border border-lime/30"
                    : "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                }`}
              >
                {ep.method}
              </span>
              <span>{ep.name}</span>
            </button>
          );
        })}
      </div>

      {/* URL & Method Bar */}
      <div className="p-3.5 rounded-xl bg-black/60 border border-surface-border font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 truncate">
          <Badge
            variant={selectedEndpoint.method === "POST" ? "lime" : "outline"}
            className="font-mono text-[10px] uppercase font-bold"
          >
            {selectedEndpoint.method}
          </Badge>
          <span className="text-cream font-bold truncate">{selectedEndpoint.path}</span>
        </div>
        <div className="text-[11px] text-sage/60 shrink-0">
          {selectedEndpoint.description}
        </div>
      </div>

      {/* Grid: Request Editor (Left) & Response Viewer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Request Payload & Code Snippets */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-cream font-bold flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-lime" /> Request Payload (JSON)
            </span>
            <span className="text-sage/60 text-[11px]">
              {selectedEndpoint.method === "GET" ? "No body required" : "Editable parameters"}
            </span>
          </div>

          {selectedEndpoint.method === "POST" ? (
            <textarea
              value={payloadText}
              onChange={(e) => setPayloadText(e.target.value)}
              rows={8}
              className="w-full p-3.5 rounded-xl bg-black/70 border border-surface-border font-mono text-xs text-lime focus:outline-none focus:border-lime transition-all resize-y shadow-inner"
              placeholder="{}"
            />
          ) : (
            <div className="p-6 rounded-xl bg-black/40 border border-surface-border/60 text-center text-xs font-mono text-sage/60">
              This endpoint accepts URL query parameters and does not require a request body.
            </div>
          )}

          {/* Quick Copy Snippets (cURL, JS, Python) */}
          <div className="space-y-2 pt-2 border-t border-surface-border/50">
            <div className="flex items-center justify-between text-[11px] font-mono text-sage/70">
              <span>Code Snippets for Production:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleCopyCode("curl", generateCurlSnippet())}
                  className="px-2 py-1 rounded bg-surface-elevated border border-surface-border hover:border-lime/40 text-[10px] text-cream flex items-center gap-1 cursor-pointer"
                >
                  {copiedFormat === "curl" ? <Check className="w-3 h-3 text-lime" /> : <Copy className="w-3 h-3" />}
                  cURL
                </button>
                <button
                  onClick={() => handleCopyCode("js", generateJsSnippet())}
                  className="px-2 py-1 rounded bg-surface-elevated border border-surface-border hover:border-lime/40 text-[10px] text-cream flex items-center gap-1 cursor-pointer"
                >
                  {copiedFormat === "js" ? <Check className="w-3 h-3 text-lime" /> : <Copy className="w-3 h-3" />}
                  JavaScript
                </button>
                <button
                  onClick={() => handleCopyCode("py", generatePythonSnippet())}
                  className="px-2 py-1 rounded bg-surface-elevated border border-surface-border hover:border-lime/40 text-[10px] text-cream flex items-center gap-1 cursor-pointer"
                >
                  {copiedFormat === "py" ? <Check className="w-3 h-3 text-lime" /> : <Copy className="w-3 h-3" />}
                  Python
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Response Viewer */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-cream font-bold flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-lime" /> Live Response Inspector
            </span>
            {responseStatus !== null && (
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    responseStatus >= 200 && responseStatus < 300
                      ? "bg-lime/20 text-lime border border-lime/40"
                      : "bg-red-500/20 text-red-300 border border-red-500/40"
                  }`}
                >
                  {responseStatus} {responseStatus === 200 ? "OK" : "ERROR"}
                </span>
                {latencyMs !== null && (
                  <span className="text-[11px] text-sage/70 font-mono">
                    {latencyMs} ms
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl bg-black/80 border border-surface-border font-mono text-xs min-h-[220px] max-h-[360px] overflow-y-auto space-y-2 shadow-inner">
            {isLoading ? (
              <div className="h-44 flex flex-col items-center justify-center gap-2 text-lime">
                <span className="w-5 h-5 border-2 border-lime border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Executing server query...</span>
              </div>
            ) : responseBody ? (
              <pre className="text-cream/90 text-[11px] leading-relaxed whitespace-pre-wrap break-all">
                {JSON.stringify(responseBody, null, 2)}
              </pre>
            ) : (
              <div className="h-44 flex flex-col items-center justify-center gap-2 text-sage/50 text-center">
                <Terminal className="w-6 h-6 text-sage/40" />
                <span>Click &quot;Send Request&quot; above to execute query against live API.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
