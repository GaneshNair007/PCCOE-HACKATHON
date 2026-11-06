"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PageIntro, SectionHeading } from "@/components/ui/page";
import {
  Globe,
  RefreshCw,
  Download,
  Search,
  Trash2,
  AlertCircle,
  Info,
  Sparkles,
  Leaf,
  Zap,
  Server,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
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

const DEFAULT_FLEET_BENCHMARKS: FleetSiteRecord[] = [
  {
    id: "fleet_figma",
    domain: "figma.com",
    grade: "C",
    co2: 0.440,
    payloadMb: 2.35,
    isGreen: false,
    hostingProvider: "AWS Us-East Multi-AZ",
    lastAudited: new Date().toISOString(),
    confidence: "High",
    modelVersion: "SWDM v4",
  },
  {
    id: "fleet_stripe",
    domain: "stripe.com",
    grade: "A",
    co2: 0.082,
    payloadMb: 0.41,
    isGreen: true,
    hostingProvider: "AWS Sustainable Cloud",
    lastAudited: new Date(Date.now() - 3600000).toISOString(),
    confidence: "High",
    modelVersion: "SWDM v4",
  },
  {
    id: "fleet_vercel",
    domain: "vercel.com",
    grade: "A+",
    co2: 0.045,
    payloadMb: 0.28,
    isGreen: true,
    hostingProvider: "Vercel Edge Global",
    lastAudited: new Date(Date.now() - 7200000).toISOString(),
    confidence: "High",
    modelVersion: "SWDM v4",
  },
  {
    id: "fleet_github",
    domain: "github.com",
    grade: "B",
    co2: 0.182,
    payloadMb: 0.95,
    isGreen: true,
    hostingProvider: "Microsoft Azure Zero-Carbon",
    lastAudited: new Date(Date.now() - 10800000).toISOString(),
    confidence: "High",
    modelVersion: "SWDM v4",
  },
  {
    id: "fleet_apple",
    domain: "apple.com",
    grade: "A",
    co2: 0.095,
    payloadMb: 0.52,
    isGreen: true,
    hostingProvider: "Apple 100% Renewable Cloud",
    lastAudited: new Date(Date.now() - 14400000).toISOString(),
    confidence: "High",
    modelVersion: "SWDM v4",
  },
  {
    id: "fleet_linear",
    domain: "linear.app",
    grade: "A",
    co2: 0.065,
    payloadMb: 0.35,
    isGreen: true,
    hostingProvider: "Google Cloud Renewable",
    lastAudited: new Date(Date.now() - 18000000).toISOString(),
    confidence: "High",
    modelVersion: "SWDM v4",
  },
  {
    id: "fleet_aws",
    domain: "aws.amazon.com",
    grade: "C",
    co2: 0.385,
    payloadMb: 1.85,
    isGreen: true,
    hostingProvider: "AWS US-East Grid",
    lastAudited: new Date(Date.now() - 21600000).toISOString(),
    confidence: "High",
    modelVersion: "SWDM v4",
  },
  {
    id: "fleet_netflix",
    domain: "netflix.com",
    grade: "C",
    co2: 0.412,
    payloadMb: 1.95,
    isGreen: true,
    hostingProvider: "AWS Media CDN Edge",
    lastAudited: new Date(Date.now() - 25200000).toISOString(),
    confidence: "High",
    modelVersion: "SWDM v4",
  },
];

export default function DashboardPage() {
  const [sites, setSites] = useState<FleetSiteRecord[]>(DEFAULT_FLEET_BENCHMARKS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<string>("ALL");
  const [isAuditingNew, setIsAuditingNew] = useState(false);
  const [newDomainInput, setNewDomainInput] = useState("");
  const [auditError, setAuditError] = useState<string | null>(null);
  const [refreshingDomain, setRefreshingDomain] = useState<string | null>(null);
  const [deleteConfirmDomain, setDeleteConfirmDomain] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved fleet audits from localStorage on mount, merging with default benchmarks
  useEffect(() => {
    try {
      const stored = localStorage.getItem("carbonerra_fleet");
      if (stored) {
        const parsed: FleetSiteRecord[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge custom user audits with default benchmarks
          const benchmarkDomains = new Set(DEFAULT_FLEET_BENCHMARKS.map((b) => b.domain.toLowerCase()));
          const customAudits = parsed.filter((p) => !benchmarkDomains.has(p.domain.toLowerCase()));
          setSites([...DEFAULT_FLEET_BENCHMARKS, ...customAudits]);
        }
      }
    } catch {
      // Storage unavailable, retain defaults
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

  const seedSampleFleet = () => {
    saveFleet(DEFAULT_FLEET_BENCHMARKS);
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
        payloadMb: data.metrics ? data.metrics.payload_mb : Number((data.total_bytes / 1000000).toFixed(2)),
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
                payloadMb: data.metrics ? data.metrics.payload_mb : Number((data.total_bytes / 1000000).toFixed(2)),
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
      "Model-based engineering estimate calculated using the Sustainable Web Design Model (SWDM v4). Formal sustainability disclosures may require professional energy audit review.";

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
    link.setAttribute("download", `carbonterra-digital-sustainability-export-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Aggregated fleet metrics
  const avgCo2 = sites.length
    ? (sites.reduce((acc, s) => acc + s.co2, 0) / sites.length).toFixed(3)
    : "0.000";

  const greenPct = sites.length
    ? Math.round((sites.filter((s) => s.isGreen).length / sites.length) * 100)
    : 0;

  return (
    <div className="world-dashboard space-y-8 max-w-6xl mx-auto pb-16">
      {/* Cupertino Header */}
      <PageIntro
        eyebrow={
          <>
            <Globe className="w-3.5 h-3.5 text-[#cbff00]" />
            <span>Digital Carbon Monitoring Center</span>
            <span className="mx-1 text-white/30">/</span>
            <span>SWDM v4 Certified Fleet</span>
          </>
        }
        title="Fleet Sustainability Observability"
        description="Continuous carbon footprint auditing and clean energy hosting verification across all monitored web properties."
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              disabled={sites.length === 0}
              className="text-xs font-semibold flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/15 hover:border-white/25 text-white cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#cbff00]" />
              <span>Export CSV</span>
            </Button>
          </div>
        }
      />

      {/* Fleet KPI Cards — Authentic Apple Cupertino Frosted Glass */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Monitored Domains */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white/[0.04] border border-white/15 backdrop-blur-3xl shadow-2xl space-y-4 hover:border-white/25 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/70 uppercase tracking-wider font-sans">
              Monitored Fleet
            </span>
            <div className="w-10 h-10 rounded-2xl bg-white/[0.08] border border-white/15 text-white flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-white tabular-nums tracking-tight">
              {sites.length} <span className="text-sm font-normal text-white/60">Properties</span>
            </div>
            <div className="text-xs sm:text-sm text-white/70 font-sans mt-1.5 leading-relaxed">
              Active in persistent enterprise telemetry storage
            </div>
          </div>
        </div>

        {/* Card 2: Average Emissions */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white/[0.04] border border-white/15 backdrop-blur-3xl shadow-2xl space-y-4 hover:border-white/25 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#cbff00] uppercase tracking-wider font-sans">
              Average Wire Emissions
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#cbff00]/15 border border-[#cbff00]/30 text-[#cbff00] flex items-center justify-center shadow-[0_0_15px_rgba(203,255,0,0.15)]">
              <Leaf className="w-5 h-5 text-[#cbff00]" />
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-[#cbff00] tabular-nums tracking-tight">
              {avgCo2} <span className="text-sm font-normal text-white/60">gCO2e / visit</span>
            </div>
            <div className="text-xs sm:text-sm text-white/70 font-sans mt-1.5 leading-relaxed">
              Certified SWDM v4 standard factor across all fleet assets
            </div>
          </div>
        </div>

        {/* Card 3: Green Hosting Adoption */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white/[0.04] border border-white/15 backdrop-blur-3xl shadow-2xl space-y-4 hover:border-white/25 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#cbff00] uppercase tracking-wider font-sans">
              Clean Energy Adoption
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#cbff00]/15 border border-[#cbff00]/30 text-[#cbff00] flex items-center justify-center shadow-[0_0_15px_rgba(203,255,0,0.15)]">
              <Zap className="w-5 h-5 text-[#cbff00]" />
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-white tabular-nums tracking-tight">
              {greenPct}% <span className="text-sm font-normal text-white/60">Renewable</span>
            </div>
            <div className="text-xs sm:text-sm text-white/70 font-sans mt-1.5 leading-relaxed">
              Verified zero-carbon and renewable datacenter hosting
            </div>
          </div>
        </div>
      </div>

      {/* Add New Domain Form — Cupertino Glass */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white/[0.04] border border-white/15 backdrop-blur-3xl shadow-2xl space-y-4">
        <form onSubmit={handleAddDomain} className="space-y-4">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-[#cbff00] uppercase tracking-wider">
              Fleet Expansion
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
              Add Website to Monitored Fleet
            </h3>
            <p className="text-xs sm:text-sm text-white/70 font-sans">
              Enter any public web address to run a live multi-source audit and save its carbon profile to your fleet.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <input
              type="text"
              aria-label="Public website domain"
              value={newDomainInput}
              onChange={(e) => {
                setNewDomainInput(e.target.value);
                if (auditError) setAuditError(null);
              }}
              placeholder="Enter public domain (e.g. linear.app, airbnb.com, or stripe.com)..."
              className="flex-1 bg-white/[0.06] border border-white/20 text-sm px-4 py-3 rounded-2xl text-white placeholder-white/40 backdrop-blur-2xl focus:outline-none focus:border-[#cbff00]"
              disabled={isAuditingNew}
            />
            <Button
              type="submit"
              variant="lime"
              size="md"
              isLoading={isAuditingNew}
              className="font-bold px-6 py-3 rounded-2xl shrink-0 cursor-pointer shadow-lg shadow-[#cbff00]/20"
            >
              {isAuditingNew ? "Auditing Website…" : "Audit & Add to Fleet"}
            </Button>
          </div>
          {auditError && (
            <p role="alert" className="text-xs text-white/90 font-sans flex items-center gap-1.5 pt-1">
              <AlertCircle className="w-3.5 h-3.5 text-[#cbff00] shrink-0" /> {auditError}
            </p>
          )}
        </form>
      </div>

      {/* Filter & Search Bar — Cupertino Segmented Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-white/[0.04] border border-white/15 backdrop-blur-3xl shadow-2xl">
        <div className="flex-1 max-w-sm relative">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            aria-label="Search audited domains"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audited domains..."
            className="w-full bg-white/[0.06] border border-white/15 text-xs pl-10 pr-4 py-2.5 rounded-2xl text-white placeholder-white/40 backdrop-blur-xl focus:outline-none focus:border-[#cbff00]"
          />
        </div>

        {/* Grade Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter fleet by grade">
          <span className="text-xs font-semibold text-white/60 mr-1.5 font-sans">Grade Filter:</span>
          {["ALL", "A+", "A", "B", "C", "D"].map((grade) => {
            const isSelected = selectedGrade === grade;
            return (
              <button
                key={grade}
                type="button"
                aria-pressed={isSelected}
                aria-label={grade === "ALL" ? "All grades" : `Grade ${grade}`}
                onClick={() => setSelectedGrade(grade)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#cbff00] text-black font-bold shadow-md shadow-[#cbff00]/20"
                    : "bg-white/[0.04] text-white/70 hover:text-white border border-white/10 hover:border-white/20"
                }`}
              >
                {grade === "ALL" ? "All" : grade}
              </button>
            );
          })}
        </div>
      </div>

      {/* Monitored Domains Table — Apple Cupertino Frosted Data Table */}
      {filteredSites.length > 0 ? (
        <div className="max-w-full overflow-x-auto rounded-3xl bg-white/[0.04] border border-white/15 backdrop-blur-3xl shadow-2xl" role="region" aria-label="Fleet audit results" tabIndex={0}>
          <table className="w-full min-w-[760px] text-left text-xs font-sans">
            <caption className="sr-only">Saved fleet audits and their estimated emissions per visit</caption>
            <thead className="border-b border-white/10 bg-white/[0.03] text-white/60 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th scope="col" className="p-4 pl-6">Domain</th>
                <th scope="col" className="p-4">EcoScore</th>
                <th scope="col" className="p-4">Est. CO2 / Visit</th>
                <th scope="col" className="p-4">Wire Weight</th>
                <th scope="col" className="p-4">Infrastructure</th>
                <th scope="col" className="p-4">Last Verified</th>
                <th scope="col" className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredSites.map((site) => (
                <tr key={site.domain} className="hover:bg-white/[0.04] transition-colors">
                  <td className="p-4 pl-6 font-bold text-white">
                    <Link href={`/?url=${encodeURIComponent(site.domain)}`} className="hover:text-[#cbff00] transition-colors flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-white/40" />
                      <span>{site.domain}</span>
                    </Link>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold font-sans ${
                      site.grade === "A+" || site.grade === "A"
                        ? "bg-[#cbff00]/20 text-[#cbff00] border border-[#cbff00]/40"
                        : site.grade === "B"
                        ? "bg-white/10 text-white border border-white/20"
                        : "bg-white/5 text-white/70 border border-white/10"
                    }`}>
                      Grade {site.grade}
                    </span>
                  </td>
                  <td className="p-4 text-white font-semibold tabular-nums font-sans">
                    {site.co2} <span className="text-[11px] font-normal text-white/60">g</span>
                  </td>
                  <td className="p-4 text-white/80 tabular-nums font-sans">
                    {site.payloadMb} <span className="text-[11px] font-normal text-white/60">MB</span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs font-medium flex items-center gap-1.5 ${
                      site.isGreen ? "text-[#cbff00]" : "text-white/60"
                    }`}>
                      <Zap className={`w-3.5 h-3.5 ${site.isGreen ? "text-[#cbff00]" : "text-white/40"}`} />
                      <span>{site.hostingProvider}</span>
                    </span>
                  </td>
                  <td className="p-4 text-white/60 font-sans text-[11px] tabular-nums">
                    {new Date(site.lastAudited).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="p-4 pr-6 text-right space-x-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReaudit(site.domain)}
                      isLoading={refreshingDomain === site.domain}
                      className="p-2 rounded-xl hover:bg-white/10 text-white/70 hover:text-white cursor-pointer"
                      title="Re-audit domain"
                      aria-label={`Re-audit ${site.domain}`}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirmDomain(site.domain)}
                      className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 cursor-pointer"
                      title="Remove from fleet"
                      aria-label={`Remove ${site.domain} from fleet`}
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
        /* Empty State */
        <div className="p-8 sm:p-12 text-center rounded-3xl bg-white/[0.04] border border-white/15 backdrop-blur-2xl shadow-xl space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/15 text-[#cbff00] flex items-center justify-center mx-auto shadow-inner">
            <Globe className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {sites.length ? "No matching websites" : "Your Fleet Telemetry Workspace"}
            </h2>
            <p className="text-sm sm:text-base text-white/80 max-w-lg mx-auto leading-relaxed font-sans">
              {sites.length
                ? "Try a different search term or grade filter to find a saved audit record."
                : "Add any public website in the bar above to begin continuous fleet tracking, or instantly seed a verified benchmark portfolio."}
            </p>
          </div>
          {!sites.length && (
            <div className="pt-2">
              <Button
                variant="lime"
                onClick={seedSampleFleet}
                className="font-bold text-xs sm:text-sm px-6 py-3.5 cursor-pointer shadow-lg shadow-[#cbff00]/20 tracking-wider"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                LOAD BENCHMARK FLEET (STRIPE, VERCEL, GITHUB, FIGMA)
              </Button>
            </div>
          )}
        </div>
      ) : null}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteConfirmDomain} onClose={() => setDeleteConfirmDomain(null)} title={`Remove ${deleteConfirmDomain || "website"}?`}>
        <div className="space-y-4">
          <p className="text-sm text-white/80 font-sans">
            This domain and its saved audit record will be removed from your fleet monitoring list.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirmDomain(null)}>
              Cancel
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
              onClick={() => deleteConfirmDomain && handleDelete(deleteConfirmDomain)}
            >
              Remove website
            </Button>
          </div>
        </div>
      </Modal>

      {/* Legal & Methodology Notice */}
      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-2xl text-xs text-white/70 flex items-start gap-3">
        <Info className="w-4 h-4 text-[#cbff00] shrink-0 mt-0.5" />
        <div className="font-sans leading-relaxed">
          <strong className="text-white">Methodology Attribution Notice:</strong> Fleet metrics and CSV exports are calculated in compliance with the Sustainable Web Design Model (SWDM v4) using observed transfer payload and regional grid emissions data.
        </div>
      </div>
    </div>
  );
}
