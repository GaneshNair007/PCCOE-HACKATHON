"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  Activity,
  Globe,
  Zap,
  ArrowUpRight,
  Plus,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Download,
  Search,
  Trash2,
  Filter,
  Layers,
  ShieldCheck,
  AlertCircle,
  Info,
} from "lucide-react";
import Link from "next/link";
import { EcoScoreGrade } from "@/types/telemetry";

export interface FleetSiteRecord {
  id: string;
  domain: string;
  grade: EcoScoreGrade;
  co2: number;
  payloadMb: number;
  isGreen: boolean;
  hostingProvider: string;
  lastAudited: string;
  confidence?: string;
  modelVersion?: string;
}

export default function DashboardPage() {
  const [sites, setSites] = useState<FleetSiteRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<string>("ALL");
  const [isAuditingNew, setIsAuditingNew] = useState(false);
  const [newDomainInput, setNewDomainInput] = useState("");
  const [auditError, setAuditError] = useState<string | null>(null);
  const [refreshingDomain, setRefreshingDomain] = useState<string | null>(null);
  const [deleteConfirmDomain, setDeleteConfirmDomain] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved fleet audits from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("carbonerra_fleet");
      if (stored) {
        const parsed: FleetSiteRecord[] = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSites(parsed);
        }
      }
    } catch {
      // Storage unavailable
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveFleet = (updated: FleetSiteRecord[]) => {
    setSites(updated);
    try {
      localStorage.setItem("carbonerra_fleet", JSON.stringify(updated));
    } catch {
      // LocalStorage error fallback
    }
  };

  // Add & audit a new domain into the fleet
  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newDomainInput.trim();
    if (!trimmed) return;

    setIsAuditingNew(true);
    setAuditError(null);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });

      const data = await res.json();
      if (!res.ok || data.status === "error") {
        setAuditError(data.message || "Failed to audit domain.");
        return;
      }

      const newRecord: FleetSiteRecord = {
        id: data.id || `fleet_${Date.now()}`,
        domain: data.domain,
        grade: data.eco_score,
        co2: data.co2_grams,
        payloadMb: data.metrics.payload_mb,
        isGreen: data.hosting.green,
        hostingProvider: data.hosting.provider || "Standard Datacenter Grid",
        lastAudited: new Date().toISOString(),
        confidence: data.confidence,
        modelVersion: data.methodology_version,
      };

      const updated = [newRecord, ...sites.filter((s) => s.domain !== data.domain)];
      saveFleet(updated);
      setNewDomainInput("");
    } catch (err: any) {
      setAuditError(err.message || "Network error while auditing domain.");
    } finally {
      setIsAuditingNew(false);
    }
  };

  // Re-audit an existing domain
  const handleReaudit = async (domain: string) => {
    setRefreshingDomain(domain);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: domain }),
      });

      const data = await res.json();
      if (res.ok && data.status !== "error") {
        const updated = sites.map((s) =>
          s.domain === domain
            ? {
                ...s,
                grade: data.eco_score,
                co2: data.co2_grams,
                payloadMb: data.metrics.payload_mb,
                isGreen: data.hosting.green,
                hostingProvider: data.hosting.provider || "Standard Datacenter Grid",
                lastAudited: new Date().toISOString(),
                confidence: data.confidence,
              }
            : s
        );
        saveFleet(updated);
      }
    } catch {
      // Failed to re-audit
    } finally {
      setRefreshingDomain(null);
    }
  };

  const handleDelete = (domain: string) => {
    const updated = sites.filter((s) => s.domain !== domain);
    saveFleet(updated);
    setDeleteConfirmDomain(null);
  };

  // Filter and search
  const filteredSites = sites.filter((s) => {
    const matchesSearch = s.domain.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = selectedGrade === "ALL" || s.grade === selectedGrade;
    return matchesSearch && matchesGrade;
  });

  // Export Real Data CSV
  const handleExportCsv = () => {
    if (sites.length === 0) return;

    const headers = [
      "Domain",
      "EcoScore Grade",
      "Estimated gCO2e per Visit",
      "Transfer Payload (MB)",
      "Green Hosting Verified",
      "Hosting Infrastructure Provider",
      "Measurement Confidence",
      "Model Version",
      "Last Audited (ISO Timestamp)",
      "Methodology Disclaimer",
    ];

    const disclaimerText =
      "Model-based engineering estimate per SWDM v4. Not a direct physical meter measurement. For formal CSRD/ESG reporting, professional validation is recommended.";

    const rows = sites.map((s) => [
      `"${s.domain}"`,
      `"${s.grade}"`,
      s.co2,
      s.payloadMb,
      s.isGreen ? "YES" : "NO",
      `"${s.hostingProvider}"`,
      `"${s.confidence || "medium"}"`,
      `"${s.modelVersion || "co2js-swdmv4"}"`,
      `"${s.lastAudited}"`,
      `"${disclaimerText}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `carbonerra-digital-sustainability-export-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fleet summary statistics
  const avgCo2 =
    sites.length > 0
      ? Number((sites.reduce((acc, s) => acc + s.co2, 0) / sites.length).toFixed(3))
      : null;
  const greenPct =
    sites.length > 0
      ? Math.round((sites.filter((s) => s.isGreen).length / sites.length) * 100)
      : null;

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-8">
        <div>
          <span className="text-xs font-mono text-lime uppercase font-bold tracking-widest">
            REAL FLEET MONITORING
          </span>
          <h1 className="font-display text-4xl sm:text-6xl text-cream uppercase tracking-wide mt-1">
            FLEET CARBON DASHBOARD
          </h1>
          <p className="text-xs sm:text-sm text-sage/80 mt-2 max-w-2xl">
            Real multi-site sustainability monitoring. Every metric is recorded from actual executed SWDM v4 audits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={sites.length === 0}
            className="text-xs font-mono font-bold flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-lime" />
            EXPORT CSV
          </Button>
        </div>
      </div>

      {/* Fleet KPI Cards (Derived strictly from real fleet audits) */}
      {sites.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="p-6 glass-panel-elevated border border-surface-border">
            <div className="text-xs font-mono text-sage/70 uppercase">Monitored Domains</div>
            <div className="font-display text-4xl text-cream mt-2">{sites.length}</div>
            <div className="text-xs text-sage/60 mt-1">Active in local fleet storage</div>
          </Card>

          <Card className="p-6 glass-panel-elevated border border-surface-border">
            <div className="text-xs font-mono text-sage/70 uppercase">Avg Estimated CO2e</div>
            <div className="font-display text-4xl text-lime mt-2">
              {avgCo2} <span className="text-xs font-mono text-cream font-normal">g / visit</span>
            </div>
            <div className="text-xs text-sage/60 mt-1">Across all monitored pages</div>
          </Card>

          <Card className="p-6 glass-panel-elevated border border-surface-border">
            <div className="text-xs font-mono text-sage/70 uppercase">Green Hosting Adoption</div>
            <div className="font-display text-4xl text-cream mt-2">{greenPct}%</div>
            <div className="text-xs text-sage/60 mt-1">Verified renewable power</div>
          </Card>
        </div>
      )}

      {/* Add New Domain Form */}
      <Card className="p-6 glass-panel-elevated border border-lime/30">
        <form onSubmit={handleAddDomain} className="space-y-3">
          <div className="text-xs font-mono text-lime font-bold uppercase flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Audit & Add Real Domain to Fleet
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              value={newDomainInput}
              onChange={(e) => {
                setNewDomainInput(e.target.value);
                if (auditError) setAuditError(null);
              }}
              placeholder="Enter public domain (e.g. pccoepune.com or github.com)"
              className="flex-1 font-mono text-cream"
              disabled={isAuditingNew}
            />
            <Button
              type="submit"
              variant="lime"
              size="md"
              isLoading={isAuditingNew}
              className="font-bold tracking-wider shrink-0"
            >
              {isAuditingNew ? "AUDITING..." : "AUDIT & ADD"}
            </Button>
          </div>
          {auditError && (
            <p className="text-xs text-red-400 font-mono flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" /> {auditError}
            </p>
          )}
        </form>
      </Card>

      {/* Filter & Search Bar */}
      {sites.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 max-w-sm">
            <Input
              icon={<Search className="w-4 h-4 text-sage/60" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search audited domains..."
              className="font-mono text-xs"
            />
          </div>

          {/* Grade Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-xs font-mono text-sage/60 mr-1">Grade:</span>
            {["ALL", "A+", "A", "B", "C", "D", "F"].map((grade) => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all ${
                  selectedGrade === grade
                    ? "bg-lime text-black"
                    : "bg-surface-elevated border border-surface-border text-sage hover:text-cream"
                }`}
              >
                {grade}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Monitored Domains Table / Empty State */}
      {filteredSites.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl glass-panel border border-surface-border">
          <table className="w-full text-left font-mono text-xs">
            <thead className="border-b border-surface-border bg-surface-elevated/80 text-sage/70 uppercase">
              <tr>
                <th className="p-4">Domain</th>
                <th className="p-4">EcoScore</th>
                <th className="p-4">Est. CO2 / Visit</th>
                <th className="p-4">Payload</th>
                <th className="p-4">Hosting</th>
                <th className="p-4">Last Audited</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/40">
              {filteredSites.map((site) => (
                <tr key={site.domain} className="hover:bg-surface-elevated/40 transition-colors">
                  <td className="p-4 font-bold text-cream">
                    <Link href={`/?url=${encodeURIComponent(site.domain)}`} className="hover:text-lime underline">
                      {site.domain}
                    </Link>
                  </td>
                  <td className="p-4">
                    <Badge variant={site.grade === "A+" || site.grade === "A" ? "lime" : "outline"}>
                      Grade {site.grade}
                    </Badge>
                  </td>
                  <td className="p-4 text-cream font-semibold">{site.co2}g</td>
                  <td className="p-4 text-sage/80">{site.payloadMb} MB</td>
                  <td className="p-4">
                    <span className={site.isGreen ? "text-lime" : "text-amber-400"}>
                      {site.isGreen ? "Verified Green" : "Standard Grid"}
                    </span>
                  </td>
                  <td className="p-4 text-sage/60">
                    {new Date(site.lastAudited).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReaudit(site.domain)}
                      isLoading={refreshingDomain === site.domain}
                      className="p-1.5"
                      title="Re-audit domain"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirmDomain(site.domain)}
                      className="p-1.5 text-red-400 hover:text-red-300"
                      title="Remove from fleet"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : isLoaded ? (
        /* Real Empty State */
        <div className="p-12 text-center rounded-3xl glass-panel-elevated border border-surface-border space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-surface-elevated border border-surface-border text-sage flex items-center justify-center mx-auto">
            <Globe className="w-7 h-7" />
          </div>
          <h3 className="font-display text-2xl text-cream uppercase">No Domains in Fleet Yet</h3>
          <p className="text-xs sm:text-sm text-sage/75 max-w-md mx-auto">
            Add a website using the input above or audit any site from the home page. Domains and real measurements will be automatically tracked here.
          </p>
        </div>
      ) : null}

      {/* Delete Confirmation Modal */}
      {deleteConfirmDomain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="p-6 rounded-2xl glass-panel-elevated border border-surface-border max-w-md w-full space-y-4 font-mono">
            <h3 className="text-base font-bold text-cream">Remove {deleteConfirmDomain}?</h3>
            <p className="text-xs text-sage/80">
              This domain and its saved audit record will be removed from your fleet monitoring list.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setDeleteConfirmDomain(null)}>
                Cancel
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-red-500/50 text-red-400 hover:bg-red-950"
                onClick={() => handleDelete(deleteConfirmDomain)}
              >
                Confirm Remove
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Legal & Methodology Notice */}
      <div className="p-4 rounded-xl glass-panel border border-surface-border text-[11px] font-mono text-sage/70 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-lime shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-cream">Disclaimer on Telemetry CSV Export:</span> Exported figures are model-based engineering estimates calculated using the Sustainable Web Design Model (SWDM v4). Formal CSRD/ESG environmental filings may require professional energy audit review.
        </div>
      </div>
    </div>
  );
}
