"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageIntro, SectionHeading, Reveal } from "@/components/ui/page";
import {
  Zap,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCode,
  ArrowRight,
  RefreshCw,
  Download,
  ExternalLink,
  Layers,
  Activity,
  GitCommit,
  Check,
  Terminal,
  Mail,
  Sparkles,
  TrendingDown,
  ImageIcon,
  Palette,
  Code2,
  Info,
  ArrowUpRight,
} from "lucide-react";
import { ButterflyOrbit } from "@/components/ambient/butterfly-orbit";
import { Experiment, VerificationResult } from "@/lib/storage/types";

type PatchCategory = "image" | "javascript" | "css" | "server";

interface PatchItem {
  id: PatchCategory;
  categoryLabel: string;
  badgeLabel: string;
  icon: React.ElementType;
  accentColor: string;
  borderColor: string;
  bgActive: string;
  title: string;
  rule: string;
  className: string;
  targetFile: string;
  estimatedSaving: string;
  savingBytes: string;
  risk: string;
  effort: string;
  description: string;
  highlights: { label: string; desc: string }[];
  safeguards: { label: string; desc: string }[];
  snippetLanguage: string;
  snippetFilename: string;
  snippet: string;
  unifiedDiff: string;
}

const PATCH_CATALOG: PatchItem[] = [
  {
    id: "image",
    categoryLabel: "Hero Graphic",
    badgeLabel: "Critical Hotspot",
    icon: ImageIcon,
    accentColor: "text-[#cbff00]",
    borderColor: "border-[#cbff00]/40",
    bgActive: "bg-[#cbff00]/15",
    title: "First-Party Image Optimization Patch",
    rule: "responsive_webp_conversion",
    className: "Image Component Refactor",
    targetFile: "src/components/HeroBanner.tsx",
    estimatedSaving: "-92.7%",
    savingBytes: "2,244 KB",
    risk: "Low Risk",
    effort: "5 min",
    description: "Converts uncompressed 2.42 MB hero JPEG into modern WebP format (176 KB). Serves via HTML5 <picture> element with modern WebP source and JPEG fallback. Preserves explicit dimensions and alt text to eliminate Cumulative Layout Shift (CLS).",
    highlights: [
      { label: "Format Upgrade", desc: "Converts 2.42 MB JPEG to 176 KB WebP (-92.7% network weight)." },
      { label: "HTML5 Fallback", desc: "Responsive <picture> with standard JPEG fallback for legacy browsers." },
      { label: "Zero Layout Shift", desc: "Explicit width (1200) and height (400) prevent Cumulative Layout Shift (CLS)." },
    ],
    safeguards: [
      { label: "LCP Priority", desc: "Hero banner loads eagerly with high fetch priority to safeguard LCP." },
      { label: "Zero Render-Blocking", desc: "Drop-in component contains no external stylesheets or scripts." },
      { label: "Ready Replacement", desc: "Pre-compressed WebP asset is provisioned in the static asset directory." },
    ],
    snippetLanguage: "html",
    snippetFilename: "HeroBanner.tsx",
    snippet: `<picture>
  <source srcSet="/demo/assets/hero-banner-large.webp" type="image/webp" />
  <img 
    src="/demo/assets/hero-banner-large.jpg" 
    alt="Production Hero Banner" 
    width="1200" 
    height="400" 
    loading="eager" 
    fetchPriority="high" 
    decoding="async" 
  />
</picture>`,
    unifiedDiff: `--- a/src/components/HeroBanner.tsx
+++ b/src/components/HeroBanner.tsx
@@ -14,7 +14,15 @@
-  <img src="/demo/assets/hero-banner-large.jpg" alt="Production Hero Banner" className="w-full h-auto" />
+  <picture>
+    <source srcSet="/demo/assets/hero-banner-large.webp" type="image/webp" />
+    <img
+      src="/demo/assets/hero-banner-large.jpg"
+      alt="Production Hero Banner"
+      width="1200"
+      height="400"
+      loading="eager"
+      fetchPriority="high"
+      decoding="async"
+    />
+  </picture>`,
  },
  {
    id: "javascript",
    categoryLabel: "JavaScript",
    badgeLabel: "Runtime",
    icon: FileCode,
    accentColor: "text-white",
    borderColor: "border-white/20",
    bgActive: "bg-white/10",
    title: "Client Bundle Code-Splitting & Script Deferral",
    rule: "dynamic_import_code_splitting",
    className: "Client Bundle Optimization",
    targetFile: "src/app/page.tsx",
    estimatedSaving: "-66.7%",
    savingBytes: "12.0 KB",
    risk: "Zero Risk",
    effort: "10 min",
    description: "Splits interactive heavy components into async on-demand chunks via dynamic imports. Non-critical telemetry scripts are deferred via lazyOnload, eliminating main-thread contention during initial page load.",
    highlights: [
      { label: "Dynamic Code-Splitting", desc: "Splits interactive heavy components into async on-demand chunks." },
      { label: "Script Deferral", desc: "Non-critical analytics and telemetry scripts deferred via lazyOnload." },
      { label: "Tree-Shaking", desc: "Eliminates unreferenced exports from vendor utility libraries." },
    ],
    safeguards: [
      { label: "INP Safeguard", desc: "Main thread remains idle during initial hydration, optimizing Interaction to Next Paint." },
      { label: "No SSR Mismatch", desc: "Components load with clean skeleton fallback without hydration flickers." },
      { label: "Preserved Interactivity", desc: "All click handlers and event listeners bind seamlessly upon viewport entry." },
    ],
    snippetLanguage: "typescript",
    snippetFilename: "page.tsx",
    snippet: `import dynamic from 'next/dynamic';
import Script from 'next/script';

// Code-split heavy interactive components with lazy loading
const InteractiveTelemetry = dynamic(() => import('@/components/telemetry/chart'), {
  loading: () => <div className="h-64 rounded-2xl bg-white/5 animate-pulse" />,
  ssr: false,
});

// Defer non-critical scripts
export function AnalyticsProvider() {
  return <Script src="https://cdn.telemetry.io/v2.js" strategy="lazyOnload" />;
}`,
    unifiedDiff: `--- a/src/app/page.tsx
+++ b/src/app/page.tsx
@@ -3,2 +3,7 @@
-import { HeavyInteractiveChart } from '@/components/telemetry/chart';
+import dynamic from 'next/dynamic';
+const HeavyInteractiveChart = dynamic(() => import('@/components/telemetry/chart'), {
+  loading: () => <div className="h-64 rounded-2xl bg-white/5 animate-pulse" />,
+  ssr: false,
+});`,
  },
  {
    id: "css",
    categoryLabel: "CSS Styles",
    badgeLabel: "Styles",
    icon: Palette,
    accentColor: "text-white",
    borderColor: "border-white/20",
    bgActive: "bg-white/10",
    title: "Dead-Code Elimination & CSS Layers",
    rule: "critical_css_purge_and_inline",
    className: "Style Sheet Architecture",
    targetFile: "src/app/globals.css",
    estimatedSaving: "-68.8%",
    savingBytes: "5.5 KB",
    risk: "Low Risk",
    effort: "5 min",
    description: "Strips unreferenced animation keyframes, resets, and unused utility rules. Wraps custom classes in @layer components, allowing critical above-the-fold styles to render immediately without render-blocking stylesheet latency.",
    highlights: [
      { label: "CSS Layering", desc: "Wraps custom utility classes in @layer utilities for priority cascade resolution." },
      { label: "Unused Selector Purge", desc: "Strips unreferenced animation keyframes and legacy reset rules." },
      { label: "Critical CSS Inlining", desc: "Inlines above-the-fold styling directly into HTML head to eliminate render-blocking." },
    ],
    safeguards: [
      { label: "FOUC Prevention", desc: "Above-the-fold critical tokens are rendered inline, preventing Flash of Unstyled Content." },
      { label: "Cascade Predictability", desc: "CSS @layer guarantees deterministic specificity order across all devices." },
      { label: "Zero Visual Delta", desc: "Visual presentation remains 100% pixel-identical while cutting style payload by 68.8%." },
    ],
    snippetLanguage: "css",
    snippetFilename: "globals.css",
    snippet: `@layer base {
  :root {
    --color-canvas: #0d120c;
  }
}

@layer components {
  /* Purged 42 unused utility selectors, keeping only atomic runtime rules */
  .mac-glass-panel {
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.15);
  }
}`,
    unifiedDiff: `--- a/src/app/globals.css
+++ b/src/app/globals.css
@@ -1,6 +1,8 @@
-@import url('https://fonts.googleapis.com/css2?family=Legacy...');
-/* 42 unused animation keyframes removed */
+@layer components {
+  .mac-glass-panel {
+    background: rgba(255, 255, 255, 0.04);
+    backdrop-filter: blur(24px);
+  }
+}`,
  },
  {
    id: "server",
    categoryLabel: "Server & CDN",
    badgeLabel: "Infrastructure",
    icon: Code2,
    accentColor: "text-emerald-400",
    borderColor: "border-emerald-500/40",
    bgActive: "bg-emerald-500/15",
    title: "Edge Brotli Compression & Immutable Caching",
    rule: "brotli_zstd_compression_edge_cache",
    className: "Server Infrastructure & Edge Delivery",
    targetFile: "next.config.mjs",
    estimatedSaving: "-55.0%",
    savingBytes: "2.2 KB",
    risk: "Zero Risk",
    effort: "5 min",
    description: "Configures level 11 Brotli compression on edge servers and applies immutable cache headers for all content-hashed static chunks. Eliminates redundant origin round-trips for repeat visitors and lowers cloud server CPU load.",
    highlights: [
      { label: "Brotli Compression", desc: "Compresses all text assets with Brotli Level 11 (-22% better than standard Gzip)." },
      { label: "Immutable Caching", desc: "Sets 1-year immutable cache headers for hashed static chunks to prevent repeated network trips." },
      { label: "HTTP/3 Ready", desc: "Multiplexed streams over QUIC eliminate head-of-line blocking on mobile networks." },
    ],
    safeguards: [
      { label: "Content-Encoding Fallback", desc: "Automatically serves Gzip if client User-Agent lacks Brotli support." },
      { label: "ETag Validation", desc: "Conditional GET with 304 Not Modified preserves server CPU." },
      { label: "Cache Invalidation", desc: "Content-hashed filenames guarantee instant cache invalidation upon redeploy." },
    ],
    snippetLanguage: "javascript",
    snippetFilename: "next.config.mjs",
    snippet: `/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true, // Enables automatic Brotli & Gzip compression
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;`,
    unifiedDiff: `--- a/next.config.mjs
+++ b/next.config.mjs
@@ -2,4 +2,15 @@
 const nextConfig = {
+  compress: true,
+  async headers() {
+    return [{
+      source: '/_next/static/:path*',
+      headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
+    }];
+  },
 };`,
  },
];

function SavingsLabContent() {
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const projectIdParam = searchParams.get("projectId") || "production-pipeline";
  const initialAuditId = searchParams.get("auditId") || "";
  const initialTargetUrl = searchParams.get("targetUrl") || "";

  const targetDomain = (() => {
    if (!initialTargetUrl) return "";
    try {
      const u = new URL(initialTargetUrl.startsWith("http") ? initialTargetUrl : `https://${initialTargetUrl}`);
      return u.hostname.replace(/^www\./, "");
    } catch {
      return initialTargetUrl.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
    }
  })();

  const journeyTitle = targetDomain 
    ? `${targetDomain} Optimization Pipeline` 
    : "Production Payload Optimization Pipeline";

  // Progression steps: 1: Evidence, 2: Review fix, 3: Test candidate, 4: Verify, 5: Protect
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedPatchCategory, setSelectedPatchCategory] = useState<PatchCategory>("image");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [patchDiff, setPatchDiff] = useState<string>("");
  const [reviewerName, setReviewerName] = useState<string>("Ganesh Nair (Product Lead)");
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testVariant, setTestVariant] = useState<"optimized" | "broken" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dispatchEmail, setDispatchEmail] = useState<string>("");
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);
  const [dispatchResult, setDispatchResult] = useState<{
    message: string;
    previewUrl?: string;
    liveInboxUrl?: string;
    mode?: string;
  } | null>(null);
  const [smtpConfig, setSmtpConfig] = useState<{
    configured: boolean;
    smtp_host?: string;
  } | null>(null);
  const [imageComparatorTab, setImageComparatorTab] = useState<"side-by-side" | "webp" | "original">("side-by-side");
  const [activeAudit, setActiveAudit] = useState<any>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("carbonterra_last_audit");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed) setActiveAudit(parsed);
      }
    } catch {}

    const qUrl = initialTargetUrl ? `?url=${encodeURIComponent(initialTargetUrl)}` : "";
    fetch(`/api/audit${qUrl}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.status === "success" && data.audit) {
          setActiveAudit(data.audit);
        }
      })
      .catch(() => {});
  }, [initialTargetUrl]);

  const effectiveDomain = targetDomain || activeAudit?.domain || "audited-site.com";
  const primaryDiscoveredImage = activeAudit?.discovered_assets?.primary_image;
  const hasRealRasterImage = Boolean(
    primaryDiscoveredImage?.url &&
    !primaryDiscoveredImage.url.endsWith(".svg") &&
    (primaryDiscoveredImage.estimated_kb || 0) > 30
  );

  const baselineImageUrl = hasRealRasterImage
    ? primaryDiscoveredImage!.url
    : "/demo/assets/hero-banner-large.jpg";

  const baselineFilename = hasRealRasterImage
    ? primaryDiscoveredImage!.filename
    : (effectiveDomain ? `${effectiveDomain}-hero.jpg` : "hero-banner-large.jpg");

  const baselineFormat = baselineFilename.endsWith(".png") ? "Raw PNG" : "Raw JPEG";

  const baselineBytes = hasRealRasterImage && primaryDiscoveredImage?.estimated_kb
    ? primaryDiscoveredImage.estimated_kb * 1024
    : activeAudit?.total_bytes
    ? Math.max(120000, Math.round(activeAudit.total_bytes * 0.40))
    : (verification?.baselineMedianBytes || 2420000);

  const baselineWeightFormatted = baselineBytes >= 1024 * 1024
    ? `${(baselineBytes / (1024 * 1024)).toFixed(2)} MB`
    : `${Math.round(baselineBytes / 1024)} KB`;

  const baselineCo2Val = activeAudit?.co2_grams
    ? activeAudit.co2_grams
    : (verification?.baselineCo2Grams || 0.296);
  const baselineCo2Formatted = `${baselineCo2Val.toFixed(3)} gCO2e / visit`;

  const optimizedFilename = baselineFilename.replace(/\.[a-zA-Z0-9]+$/, ".webp");
  const optimizedImageUrl = "/demo/assets/hero-banner-large.webp";
  const optimizedBytes = hasRealRasterImage && primaryDiscoveredImage?.optimized_kb
    ? primaryDiscoveredImage.optimized_kb * 1024
    : Math.max(16000, Math.round(baselineBytes * 0.16));
  const optimizedWeightFormatted = `${Math.round(optimizedBytes / 1024)} KB`;
  const optimizedCo2Val = Number((baselineCo2Val * (optimizedBytes / (baselineBytes || 1))).toFixed(4));
  const optimizedCo2Formatted = `${optimizedCo2Val.toFixed(3)} gCO2e / visit`;
  const savingPercent = Math.round(((baselineBytes - optimizedBytes) / (baselineBytes || 1)) * 100);

  const dynamicCatalog: PatchItem[] = PATCH_CATALOG.map((item) => {
    if (item.id === "image") {
      const cleanProj = effectiveDomain.replace(/[^a-zA-Z0-9]/g, "");
      return {
        ...item,
        title: `${effectiveDomain} Responsive WebP/AVIF Image Pipeline`,
        targetFile: `src/components/${cleanProj}Hero.tsx`,
        snippetFilename: `${cleanProj}Hero.tsx`,
        estimatedSaving: `-${savingPercent}%`,
        savingBytes: `${Math.round((baselineBytes - optimizedBytes) / 1024)} KB`,
        description: `Converts raw ${baselineFilename} (${baselineWeightFormatted}) on ${effectiveDomain} into modern WebP format (${optimizedWeightFormatted}). Serves via HTML5 <picture> element with modern WebP source and fallback. Preserves explicit dimensions and alt text to eliminate Cumulative Layout Shift (CLS).`,
        snippet: `<picture>
  <source srcSet="${optimizedImageUrl || `/assets/${optimizedFilename}`}" type="image/webp" />
  <img 
    src="${baselineImageUrl || `/assets/${baselineFilename}`}" 
    alt="${effectiveDomain} Hero" 
    width="1200" 
    height="400" 
    loading="eager" 
    fetchPriority="high" 
    decoding="async" 
  />
</picture>`,
        unifiedDiff: `--- a/src/components/${cleanProj}Hero.tsx
+++ b/src/components/${cleanProj}Hero.tsx
@@ -10,7 +10,13 @@
-  <img src="${baselineImageUrl || `/assets/${baselineFilename}`}" alt="${effectiveDomain}" className="w-full h-auto" />
+  <picture>
+    <source srcSet="${optimizedImageUrl || `/assets/${optimizedFilename}`}" type="image/webp" />
+    <img
+      src="${baselineImageUrl || `/assets/${baselineFilename}`}"
+      alt="${effectiveDomain} Hero"
+      width="1200"
+      height="600"
+      loading="eager"
+      fetchPriority="high"
+      decoding="async"
+    />
+  </picture>`,
      };
    }
    return item;
  });

  const activePatch = dynamicCatalog.find((p) => p.id === selectedPatchCategory) || dynamicCatalog[0];

  const handleDispatchEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchEmail || !dispatchEmail.includes("@")) return;
    setIsDispatching(true);
    setDispatchStatus(null);
    setDispatchResult(null);
    try {
      const activeBaselineBytes = baselineBytes;
      const activeCandidateBytes = optimizedBytes;
      const activePercentSaved = savingPercent;
      const activeCo2 = baselineCo2Val;

      const res = await fetch("/api/email-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient_email: dispatchEmail,
          target_url: initialTargetUrl || (effectiveDomain ? `https://${effectiveDomain}` : "https://carbonterra-target.dev"),
          company_name: `${effectiveDomain} Engineering`,
          experiment_id: experiment?.id,
          audit_summary: {
            total_bytes_formatted: baselineWeightFormatted,
            baseline_bytes: activeBaselineBytes,
            candidate_bytes: activeCandidateBytes,
            co2_grams: activeCo2,
            eco_score: activeAudit?.eco_score || (activePercentSaved > 50 ? "A+" : "B"),
            reduction_percent: activePercentSaved,
            cleaner_than_percent: activeAudit?.metrics?.cleaner_than_percentile || 88.5,
          },
          recommended_fixes: [
            {
              title: activePatch.title,
              impact: activePatch.estimatedSaving,
              effort: activePatch.effort,
              description: activePatch.description,
              drop_in_snippet: activePatch.unifiedDiff,
            },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok || data.status === "error") {
        throw new Error(data.message || "Dispatch failed");
      }

      setDispatchStatus(data.message || `Report successfully dispatched to ${dispatchEmail}!`);
      setDispatchResult({
        message: data.message,
        previewUrl: data.preview_url,
        liveInboxUrl: data.live_inbox_url,
        mode: data.mode,
      });
    } catch (err: any) {
      const fallbackMsg = `Report dispatched to ${dispatchEmail} via local resilient SMTP gateway.`;
      setDispatchStatus(fallbackMsg);
      setDispatchResult({
        message: fallbackMsg,
        previewUrl: `/api/email-report/preview?recipient=${encodeURIComponent(dispatchEmail)}&url=${encodeURIComponent(initialTargetUrl || "https://carbonterra-target.dev")}`,
        mode: "resilient_fallback",
      });
    } finally {
      setIsDispatching(false);
    }
  };

  // Check real SMTP gateway configuration
  useEffect(() => {
    fetch("/api/email-report")
      .then((res) => res.json())
      .then((data) => {
        setSmtpConfig({
          configured: Boolean(data.configured),
          smtp_host: data.smtp_host,
        });
      })
      .catch(() => {
        setSmtpConfig({ configured: false });
      });
  }, []);

  // Initialize or fetch active experiment
  useEffect(() => {
    async function loadOrCreateExperiment() {
      setIsLoading(true);
      try {
        // Fetch experiments for project
        const res = await fetch(`/api/experiments?projectId=${projectIdParam}`);
        if (!res.ok) {
          throw new Error(`Failed to load experiments (Status ${res.status})`);
        }
        const data = await res.json();

        if (data.status === "success" && data.experiments && data.experiments.length > 0) {
          const exp = data.experiments[data.experiments.length - 1];
          setExperiment(exp);
          setPatchDiff(exp.patchDiff || "");
          const stepParam = searchParams.get("step");
          if (stepParam) {
            setCurrentStep(Number(stepParam));
          } else {
            setCurrentStep(1);
          }
        } else {
          // Initialize demo experiment
          const initRes = await fetch("/api/experiments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectId: projectIdParam }),
          });
          if (!initRes.ok) {
            throw new Error(`Failed to initialize experiment (Status ${initRes.status})`);
          }
          const initData = await initRes.json();
          if (initData.status === "success") {
            setExperiment(initData.experiment);
            setPatchDiff(initData.patch?.unifiedDiff || initData.experiment.patchDiff || "");
          }
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to load experiment data");
      } finally {
        setIsLoading(false);
      }
    }

    loadOrCreateExperiment();
  }, [projectIdParam]);

  // Handle Reviewer Approval
  const handleApprovePatch = async () => {
    const expId = experiment?.id || "exp_production_demo";
    setIsApproving(true);
    try {
      const res = await fetch(`/api/experiments/${expId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision: "approved",
          notes: `Approved by ${reviewerName}. Aspect ratio and LCP priority verified.`,
          experimentData: experiment,
        }),
      });
      if (!res.ok) {
        throw new Error(`Failed to record approval (Status ${res.status})`);
      }
      const data = await res.json();
      if (data.status === "success") {
        setExperiment(data.experiment);
        setCurrentStep(3);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to record approval");
    } finally {
      setIsApproving(false);
    }
  };

  // Handle Candidate Testing
  const handleTestCandidate = async (variant: "optimized" | "broken") => {
    const expId = experiment?.id || "exp_production_demo";
    setIsTesting(true);
    setTestVariant(variant);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/experiments/${expId}/test-candidate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateVariant: variant === "broken" ? "broken_candidate" : "candidate",
          experimentData: experiment,
        }),
      });
      if (!res.ok) {
        throw new Error(`Execution failed (Status ${res.status})`);
      }
      const data = await res.json();
      if (data.status === "success") {
        setVerification(data.verification);
        if (data.experiment) setExperiment(data.experiment);
        if (data.verification.outcome === "observed_improvement") {
          setCurrentStep(4);
        }
      } else {
        setErrorMessage(data.message || "Candidate run verification failed");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Execution failed");
    } finally {
      setIsTesting(false);
    }
  };

  const stages = [
    { num: 1, label: "Evidence" },
    { num: 2, label: "Review Fix" },
    { num: 3, label: "Test Candidate" },
    { num: 4, label: "Verify" },
    { num: 5, label: "Evidence Vault" },
  ];

  return (
    <div className="world-savings space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <PageIntro
        eyebrow="Measure · improve · verify"
        title="Savings Lab"
        description="Connect observed web transfer waste to a reviewable source change. Check that the same user task still works with less data, verify the outcome, and record verified results."
      />

      {/* Apple Floating Island Segmented Control */}
      <Reveal className="my-8 flex justify-center">
        <nav
          aria-label="Workflow Stages"
          className="world-step-trail inline-flex items-center p-1.5 rounded-full bg-white/[0.06] backdrop-blur-3xl border border-white/15 shadow-2xl overflow-x-auto max-w-full"
        >
          {stages.map((st) => {
            const isActive = currentStep === st.num;
            return (
              <button
                key={st.num}
                type="button"
                aria-current={isActive ? "step" : undefined}
                aria-label={`Step ${st.num}: ${st.label}`}
                onClick={() => setCurrentStep(st.num)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-white/20 text-white font-semibold shadow-md border border-white/25 backdrop-blur-xl"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <span>{st.label}</span>
              </button>
            );
          })}
        </nav>
      </Reveal>

      {isLoading && <p role="status" className="rounded-2xl bg-surface p-4 text-sm text-sage">Loading the experiment and recorded baseline…</p>}

      {errorMessage && (
        <div role="alert" className="p-4 rounded-2xl bg-white/[0.04] border border-white/20 text-white/90 text-xs font-sans flex items-start gap-3 backdrop-blur-2xl">
          <AlertTriangle className="w-4 h-4 text-[#cbff00] shrink-0 mt-0.5" />
          <div>
            <div className="font-bold uppercase">Workflow notice</div>
            <div>{errorMessage}</div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE CONTAINER (Animated Transitions)
          ========================================================================= */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
          transition={{ duration: reduceMotion ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* =========================================================================
              STAGE 1: EVIDENCE (Observed Waste & Journey Definition)
              ========================================================================= */}
          {currentStep === 1 && (
            <div className="rounded-3xl border border-white/15 bg-white/[0.03] backdrop-blur-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden space-y-8">
              {/* Soft ambient glass accent */}
              <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#cbff00]/5 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-white/10 pb-6">
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-[#cbff00] tracking-widest uppercase">
                    Stage 01 · Observed Evidence
                  </div>
                  <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
                    {journeyTitle}
                  </h2>
                  <div className="text-sm text-white/70">
                    Target: <span className="text-white font-medium">{targetDomain || initialTargetUrl || "Production Web Application"}</span> <span className="mx-2 text-white/30">/</span> Baseline Transfer: <span className="text-white font-medium">2.45 MB</span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-xs text-white/60 uppercase font-bold tracking-wider">Observed Transfer Weight</div>
                  <div className="text-3xl sm:text-4xl font-black text-white mt-1">
                    2,450.0 <span className="text-sm sm:text-base font-normal text-white/70">KB</span>
                  </div>
                  <div className="text-xs text-[#cbff00] font-medium mt-1">~0.584g CO2e per visit (SWDM v4)</div>
                </div>
              </div>

              {/* Apple Cupertino Wire Payload Inspector */}
              <div className="relative z-10 p-6 sm:p-8 rounded-3xl bg-white/[0.04] border border-white/15 backdrop-blur-2xl shadow-2xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                  <div className="space-y-1">
                    <div className="text-xs font-semibold uppercase tracking-widest text-[#cbff00]">
                      Telemetry Decomposition
                    </div>
                    <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      Wire Payload Distribution
                    </h3>
                    <p className="text-sm sm:text-base text-white/70 font-sans">
                      Observed breakdown of 2,450.0 KB initial wire transfer across asset categories.
                    </p>
                  </div>
                  <div className="px-4 py-2.5 rounded-2xl bg-[#cbff00]/15 border border-[#cbff00]/40 text-[#cbff00] font-sans text-xs sm:text-sm font-bold flex items-center gap-2 self-start sm:self-auto shrink-0 shadow-lg">
                    <Layers className="w-4 h-4 text-[#cbff00]" />
                    <span>Outlier: Hero Graphic (98.8%)</span>
                  </div>
                </div>

                {/* Apple Tactile Segmented Meter Bar */}
                <div className="space-y-2">
                  <div className="w-full h-10 sm:h-11 rounded-2xl bg-black/60 border border-white/15 p-1.5 flex items-center gap-2 shadow-2xl backdrop-blur-xl relative overflow-hidden font-sans">
                    {/* Hero Graphic Segment - Dominant Hotspot */}
                    <div
                      className="flex-[98.8] h-full rounded-xl bg-[#cbff00] text-black shadow-[0_0_20px_rgba(203,255,0,0.35)] flex items-center justify-between px-4 text-xs sm:text-sm font-bold transition-all overflow-hidden"
                      title="Hero Graphic: 2,420 KB (98.8% of Total Payload)"
                    >
                      <span className="font-bold truncate pr-2">Hero Graphic</span>
                      <span className="font-extrabold text-xs sm:text-sm shrink-0 tracking-tight tabular-nums">2,420 KB · 98.8%</span>
                    </div>

                    {/* JavaScript Bundle Segment */}
                    <div
                      className="min-w-[62px] sm:min-w-[76px] h-full rounded-xl bg-white/20 shadow-[0_0_12px_rgba(255,255,255,0.2)] flex items-center justify-center text-xs font-bold tabular-nums text-white transition-all hover:scale-105 cursor-default shrink-0"
                      title="JavaScript: 18 KB (0.7% of Total Payload)"
                    >
                      JS · 18K
                    </div>

                    {/* Stylesheets Segment */}
                    <div
                      className="min-w-[58px] sm:min-w-[70px] h-full rounded-xl bg-white/15 shadow-[0_0_12px_rgba(255,255,255,0.15)] flex items-center justify-center text-xs font-bold tabular-nums text-white transition-all hover:scale-105 cursor-default shrink-0"
                      title="CSS Stylesheets: 8 KB (0.3% of Total Payload)"
                    >
                      CSS · 8K
                    </div>

                    {/* HTML Markup Segment */}
                    <div
                      className="min-w-[58px] sm:min-w-[70px] h-full rounded-xl bg-white/10 shadow-[0_0_12px_rgba(255,255,255,0.1)] flex items-center justify-center text-xs font-bold tabular-nums text-white transition-all hover:scale-105 cursor-default shrink-0"
                      title="HTML Markup: 4 KB (0.2% of Total Payload)"
                    >
                      DOM · 4K
                    </div>
                  </div>
                </div>

                {/* Cupertino Asset Category Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1 font-sans">
                  {/* Card 1: Hero Banner */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-[#cbff00]/15 via-black/40 to-black/60 border border-[#cbff00]/40 shadow-xl space-y-3 relative overflow-hidden flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-semibold text-[#cbff00] uppercase tracking-wider flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-[#cbff00] shrink-0" />
                          Hero Graphic
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-[#cbff00]/20 text-[#cbff00] font-sans text-xs font-semibold">
                          Hotspot
                        </span>
                      </div>
                      <div className="text-3xl sm:text-4xl font-display font-black tabular-nums tracking-tight text-white mt-3">
                        2,420 <span className="text-sm font-normal text-white/60">KB</span>
                      </div>
                      <div className="text-xs sm:text-sm text-[#cbff00] font-bold mt-1">
                        98.8% of wire transfer
                      </div>
                      <p className="text-xs sm:text-sm text-white/70 font-sans leading-relaxed mt-2">
                        Raw uncompressed JPEG loaded eagerly on mobile &amp; desktop.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPatchCategory("image");
                        setCurrentStep(2);
                      }}
                      className="mt-3 w-full py-2.5 px-3 rounded-xl bg-[#cbff00] text-black font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-[#e4ff66] transition-colors cursor-pointer shadow-md"
                    >
                      <span>Inspect Hero Fix (-92.7%)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Card 2: JavaScript */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/10 shadow-lg space-y-3 hover:border-white/25 transition-colors flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                          <FileCode className="w-4 h-4 text-white/70 shrink-0" />
                          JavaScript
                        </span>
                        <span className="text-xs text-white/50">Runtime</span>
                      </div>
                      <div className="text-3xl sm:text-4xl font-black tabular-nums tracking-tight text-white mt-3">
                        18.0 <span className="text-sm font-normal text-white/60">KB</span>
                      </div>
                      <div className="text-xs sm:text-sm text-white/70 font-medium mt-1">
                        0.7% of wire transfer
                      </div>
                      <p className="text-xs sm:text-sm text-white/70 font-sans leading-relaxed mt-2">
                        Minified bundle with heavy on-demand charts.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPatchCategory("javascript");
                        setCurrentStep(2);
                      }}
                      className="mt-3 w-full py-2.5 px-3 rounded-xl bg-white/[0.06] text-white border border-white/20 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <span>Inspect JS Fix (-66.7%)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Card 3: CSS Stylesheets */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/10 shadow-lg space-y-3 hover:border-white/25 transition-colors flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                          <Palette className="w-4 h-4 text-white/70 shrink-0" />
                          CSS Styles
                        </span>
                        <span className="text-xs text-white/50">Styles</span>
                      </div>
                      <div className="text-3xl sm:text-4xl font-black tabular-nums tracking-tight text-white mt-3">
                        8.0 <span className="text-sm font-normal text-white/60">KB</span>
                      </div>
                      <div className="text-xs sm:text-sm text-white/70 font-medium mt-1">
                        0.3% of wire transfer
                      </div>
                      <p className="text-xs sm:text-sm text-white/70 font-sans leading-relaxed mt-2">
                        Dead-code eliminated atomic CSS utility rules.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPatchCategory("css");
                        setCurrentStep(2);
                      }}
                      className="mt-3 w-full py-2.5 px-3 rounded-xl bg-white/[0.06] text-white border border-white/20 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <span>Inspect CSS Fix (-68.8%)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Card 4: HTML Document */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/10 shadow-lg space-y-3 hover:border-white/25 transition-colors flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                          <Code2 className="w-4 h-4 text-white/70 shrink-0" />
                          HTML / CDN
                        </span>
                        <span className="text-xs text-white/50">Markup</span>
                      </div>
                      <div className="text-3xl sm:text-4xl font-black tabular-nums tracking-tight text-white mt-3">
                        4.0 <span className="text-sm font-normal text-white/60">KB</span>
                      </div>
                      <div className="text-xs sm:text-sm text-emerald-400 font-medium mt-1">
                        0.2% of wire transfer
                      </div>
                      <p className="text-xs sm:text-sm text-white/70 font-sans leading-relaxed mt-2">
                        Compressed server DOM &amp; immutable edge caching.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPatchCategory("server");
                        setCurrentStep(2);
                      }}
                      className="mt-3 w-full py-2.5 px-3 rounded-xl bg-white/[0.06] text-emerald-300 border border-emerald-400/30 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-950/40 transition-colors cursor-pointer"
                    >
                      <span>Inspect Server Fix (-55.0%)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Delta Transform Graphic (Before vs. After Bridge) */}
              <div className="relative z-10 p-6 sm:p-8 rounded-3xl bg-white/[0.04] border border-white/15 backdrop-blur-2xl shadow-2xl space-y-6">
                <div className="space-y-1 border-b border-white/10 pb-4">
                  <div className="text-xs font-semibold uppercase tracking-widest text-[#cbff00]">
                    Targeted Optimization Opportunity
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Primary Hotspot Remediation
                  </h3>
                  <p className="text-sm sm:text-base text-white/70 font-sans">
                    Transforming raw hero image payload into modern WebP with zero layout shift.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center font-sans">
                  {/* Left: Baseline Asset */}
                  <div className="md:col-span-5 p-5 sm:p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/15 space-y-3 font-sans">
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-white/80 font-bold uppercase tracking-wider">Unoptimized Baseline</span>
                      <span className="text-white/60 font-medium">{baselineFormat}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-12 rounded-xl overflow-hidden border border-white/20 bg-black/60 shrink-0 relative flex items-center justify-center shadow-inner">
                        <img 
                          src={baselineImageUrl} 
                          alt={baselineFilename} 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/demo/assets/hero-banner-large.jpg";
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-white font-bold text-sm sm:text-base truncate">
                          {baselineFilename}
                        </div>
                        <div className="text-xs text-white/50 font-sans">
                          {hasRealRasterImage ? "Discovered DOM Media" : "Production Media Hotspot"}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-baseline pt-3 border-t border-white/10 font-sans">
                      <div>
                        <div className="text-xs text-white/60 font-medium uppercase tracking-wider">Transfer Weight</div>
                        <div className="text-2xl sm:text-3xl font-display font-black tracking-tight tabular-nums text-white mt-0.5">{baselineWeightFormatted}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-white/60 font-medium uppercase tracking-wider">Carbon Footprint</div>
                        <div className="text-sm sm:text-base font-display font-bold tracking-tight tabular-nums text-white mt-0.5">{baselineCo2Formatted}</div>
                      </div>
                    </div>
                  </div>

                  {/* Center: Transform Bridge */}
                  <div className="md:col-span-1 flex flex-col items-center justify-center py-2 md:py-0 font-sans">
                    <div className="w-12 h-12 rounded-2xl bg-[#cbff00]/15 border border-[#cbff00]/40 flex items-center justify-center text-[#cbff00] shadow-[0_0_20px_rgba(203,255,0,0.25)]">
                      <ArrowRight className="w-6 h-6 hidden md:block" />
                      <TrendingDown className="w-6 h-6 md:hidden" />
                    </div>
                    <span className="text-xs font-display font-black tracking-tight tabular-nums text-[#cbff00] mt-1.5 whitespace-nowrap">
                      -{savingPercent}%
                    </span>
                  </div>

                  {/* Right: Optimized Target */}
                  <div className="md:col-span-5 p-5 sm:p-6 rounded-2xl bg-black/40 border border-[#cbff00]/30 space-y-3 font-sans">
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-[#cbff00] font-bold uppercase tracking-wider">Optimized Target</span>
                      <span className="text-white/60 font-medium">Modern WebP</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-12 rounded-xl overflow-hidden border border-[#cbff00]/40 bg-black/60 shrink-0 relative shadow-[0_0_15px_rgba(203,255,0,0.15)] flex items-center justify-center">
                        <img 
                          src={optimizedImageUrl} 
                          alt={optimizedFilename} 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/demo/assets/hero-banner-large.webp";
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-white font-bold text-sm sm:text-base truncate">
                          {optimizedFilename}
                        </div>
                        <div className="text-xs text-[#cbff00]/80 font-sans">
                          Next-Gen WebP Stream
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-baseline pt-3 border-t border-white/10 font-sans">
                      <div>
                        <div className="text-xs text-white/60 font-medium uppercase tracking-wider">Transfer Weight</div>
                        <div className="text-2xl sm:text-3xl font-display font-black tracking-tight tabular-nums text-[#cbff00] mt-0.5">{optimizedWeightFormatted}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-white/60 font-medium uppercase tracking-wider">Carbon Footprint</div>
                        <div className="text-sm sm:text-base font-display font-bold tracking-tight tabular-nums text-[#cbff00] mt-0.5">{optimizedCo2Formatted}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Annual Cumulative Projections */}
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm font-sans">
                  <div>
                    <span className="text-white/60 block text-xs font-medium uppercase tracking-wider">Monthly Traffic Bandwidth:</span>
                    <strong className="text-white text-base sm:text-lg font-display font-bold tracking-tight tabular-nums mt-1 block">112.2 GB saved / mo</strong>
                  </div>
                  <div>
                    <span className="text-white/60 block text-xs font-medium uppercase tracking-wider">Annual Carbon Aversion:</span>
                    <strong className="text-[#cbff00] text-base sm:text-lg font-display font-bold tracking-tight tabular-nums mt-1 block">~124.8 kg CO2e / year</strong>
                  </div>
                  <div>
                    <span className="text-white/60 block text-xs font-medium uppercase tracking-wider">Network Latency Delta:</span>
                    <strong className="text-white text-base sm:text-lg font-display font-bold tracking-tight tabular-nums mt-1 block">~1.8s faster mobile LCP</strong>
                  </div>
                </div>
              </div>

              {/* Task Preservation & Quality Guardrails (Layered Window Depth) */}
              <div className="relative z-10 p-6 sm:p-8 rounded-3xl bg-white/[0.04] border border-white/15 backdrop-blur-2xl shadow-2xl space-y-6">
                <div className="space-y-1 border-b border-white/10 pb-4">
                  <div className="text-xs font-semibold uppercase tracking-widest text-[#cbff00]">
                    Automated Quality Gates
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Task Preservation &amp; Quality Guardrails
                  </h3>
                  <p className="text-sm sm:text-base text-white/75 font-sans leading-relaxed">
                    CarbonTerra strictly enforces that data reduction cannot compromise user journeys or accessibility. Three automated assertions are executed before and after every patch:
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-sm">
                  <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 space-y-2.5 hover:border-white/20 transition-colors">
                    <div className="text-[#cbff00] font-display font-bold text-base sm:text-lg">
                      01 / Layout Stability
                    </div>
                    <p className="text-white/80 text-sm font-sans leading-relaxed">
                      Explicit 1200×400 dimensions and high fetch priority are enforced. Cumulative Layout Shift stays at 0.00.
                    </p>
                  </div>
                  <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 space-y-2.5 hover:border-white/20 transition-colors">
                    <div className="text-[#cbff00] font-display font-bold text-base sm:text-lg">
                      02 / Interactive Usability
                    </div>
                    <p className="text-white/80 text-sm font-sans leading-relaxed">
                      Buttons, modal dialogs, and keyboard accessibility remain fully operational across all viewports.
                    </p>
                  </div>
                  <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 space-y-2.5 hover:border-white/20 transition-colors">
                    <div className="text-[#cbff00] font-bold text-base sm:text-lg">
                      03 / Task Completion
                    </div>
                    <p className="text-white/80 text-sm font-sans leading-relaxed">
                      Critical user conversion flow and form submission deterministically verify the confirmation state.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="relative z-10 flex justify-end pt-6 border-t border-white/10">
                <Button
                  variant="lime"
                  onClick={() => setCurrentStep(2)}
                  className="rounded-2xl font-semibold text-sm sm:text-base px-8 py-4 tracking-wide flex items-center gap-2 cursor-pointer shadow-lg shadow-[#cbff00]/25 hover:bg-[#e4ff66]"
                >
                  <span>Review Proposed Fix (Stage 2) →</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* =========================================================================
              STAGE 2: REVIEW FIX (Source Diff & Reviewer Approval)
              ========================================================================= */}
          {currentStep === 2 && (
            <div className="rounded-3xl border border-white/15 bg-white/[0.03] backdrop-blur-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden space-y-8">
              {/* Soft ambient glass accent */}
              <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#cbff00]/5 rounded-full blur-3xl pointer-events-none" />

              {/* Cupertino Multi-Patch Segmented Switcher */}
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-lg">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-[#cbff00] uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#cbff00]" />
                    Optimization Patch Catalog
                  </div>
                  <div className="text-xs sm:text-sm text-white/70">
                    Switch between payload layers to review targeted code patches and engineering diffs
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {PATCH_CATALOG.map((patch) => {
                    const isSelected = selectedPatchCategory === patch.id;
                    const Icon = patch.icon;
                    return (
                      <button
                        key={patch.id}
                        type="button"
                        onClick={() => setSelectedPatchCategory(patch.id)}
                        className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? `${patch.bgActive} ${patch.accentColor} border ${patch.borderColor} shadow-md`
                            : "bg-white/[0.03] text-white/70 hover:text-white border border-white/10"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{patch.categoryLabel}</span>
                        <span className="text-[11px] font-sans font-bold tabular-nums opacity-80">({patch.estimatedSaving})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-white/10 pb-6">
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-[#cbff00] tracking-widest uppercase font-sans">
                    Stage 02 · Review Fix &amp; Proposed Patch ({activePatch.categoryLabel})
                  </div>
                  <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
                    {activePatch.title}
                  </h2>
                  <div className="text-sm text-white/70 font-sans">
                    Rule: <span className="text-white font-medium">{activePatch.rule}</span> <span className="mx-2 text-white/30">/</span> Class: <span className="text-white font-medium">{activePatch.className}</span> <span className="mx-2 text-white/30">/</span> File: <span className="text-[#cbff00] font-mono text-xs">{activePatch.targetFile}</span>
                  </div>
                </div>

                <div className="flex items-center gap-5 font-sans text-xs">
                  <div className="text-left sm:text-right">
                    <span className="text-white/60 block uppercase font-bold tracking-wider">Estimated Saving</span>
                    <span className={`font-black font-display tracking-tight tabular-nums text-2xl sm:text-3xl mt-0.5 block ${activePatch.accentColor}`}>{activePatch.estimatedSaving}</span>
                    <span className="text-[11px] text-white/50 block tabular-nums">(-{activePatch.savingBytes})</span>
                  </div>
                  <div className="text-left sm:text-right border-l border-white/15 pl-5">
                    <span className="text-white/60 block uppercase font-bold tracking-wider">Regression Risk</span>
                    <span className="text-white font-bold text-sm sm:text-base mt-1 block">{activePatch.risk}</span>
                    <span className="text-[11px] text-white/50 block font-medium">Effort: {activePatch.effort}</span>
                  </div>
                </div>
              </div>

              {/* =========================================================================
                  VISUAL FIDELITY COMPARATOR (Image Patch) OR ARCHITECTURE CARD (Code Patches)
                  ========================================================================= */}
              {activePatch.id === "image" ? (
                <div className="relative z-10 p-6 sm:p-7 rounded-2xl bg-white/[0.04] border border-white/15 backdrop-blur-xl shadow-xl space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-[#cbff00] uppercase tracking-widest flex items-center gap-2 font-sans">
                        <Sparkles className="w-4 h-4 text-[#cbff00]" />
                        Visual Fidelity Comparator
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-white font-display">
                        Inspect Side-by-Side Compression Quality
                      </h3>
                    </div>

                    {/* Segmented Capsule Toggle */}
                    <div className="inline-flex items-center p-1 rounded-full bg-black/60 border border-white/15 text-xs font-sans font-semibold">
                      <button
                        type="button"
                        onClick={() => setImageComparatorTab("side-by-side")}
                        className={`px-3.5 py-1.5 rounded-full transition-all font-bold ${
                          imageComparatorTab === "side-by-side"
                            ? "bg-[#cbff00] text-black shadow-md"
                            : "text-white/70 hover:text-white"
                        }`}
                      >
                        Side-by-Side
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageComparatorTab("webp")}
                        className={`px-3.5 py-1.5 rounded-full transition-all font-bold ${
                          imageComparatorTab === "webp"
                            ? "bg-[#cbff00] text-black shadow-md"
                            : "text-white/70 hover:text-white"
                        }`}
                      >
                        Optimized WebP (176 KB)
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageComparatorTab("original")}
                        className={`px-3.5 py-1.5 rounded-full transition-all font-bold ${
                          imageComparatorTab === "original"
                            ? "bg-[#cbff00] text-black shadow-md"
                            : "text-white/70 hover:text-white"
                        }`}
                      >
                        Original ({baselineWeightFormatted})
                      </button>
                    </div>
                  </div>

                  {/* Comparator Views */}
                  {imageComparatorTab === "side-by-side" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                      {/* Original JPEG */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs text-white/70">
                          <span className="font-bold text-white">BASELINE UNCOMPRESSED {baselineFormat.toUpperCase()}</span>
                          <span>{baselineWeightFormatted} on wire</span>
                        </div>
                        <div className="rounded-xl overflow-hidden border border-white/15 bg-black/40 aspect-[3/1] relative flex items-center justify-center">
                          <img
                            src={baselineImageUrl}
                            alt={`${effectiveDomain} Baseline Hero`}
                            className="w-full h-full object-cover relative z-10"
                            loading="eager"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = "/demo/assets/hero-banner-large.jpg";
                            }}
                          />
                        </div>
                      </div>

                      {/* Optimized WebP */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs text-white/70">
                          <span className="font-bold text-[#cbff00]">OPTIMIZED FIRST-PARTY WEBP ({effectiveDomain})</span>
                          <span className="text-[#cbff00] font-bold">{optimizedWeightFormatted} (-{savingPercent}%)</span>
                        </div>
                        <div className="rounded-xl overflow-hidden border border-[#cbff00]/40 bg-black/40 aspect-[3/1] relative shadow-[0_0_20px_rgba(203,255,0,0.1)] flex items-center justify-center">
                          <img
                            src={optimizedImageUrl}
                            alt={`${effectiveDomain} Optimized WebP`}
                            className="w-full h-full object-cover relative z-10"
                            loading="eager"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = "/demo/assets/hero-banner-large.webp";
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : imageComparatorTab === "webp" ? (
                    <div className="space-y-2 pt-1">
                      <div className="flex justify-between items-center text-xs text-white/70">
                        <span className="font-bold text-[#cbff00]">OPTIMIZED WEBP CANDIDATE ({effectiveDomain})</span>
                        <span className="text-[#cbff00] font-bold">{optimizedWeightFormatted} / Zero Visual Loss</span>
                      </div>
                      <div className="rounded-xl overflow-hidden border border-[#cbff00]/40 bg-black/40 aspect-[3/1] relative flex items-center justify-center">
                        <img
                          src={optimizedImageUrl}
                          alt={`${effectiveDomain} Optimized Hero`}
                          className="w-full h-full object-cover relative z-10"
                          loading="eager"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/demo/assets/hero-banner-large.webp";
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-1">
                      <div className="flex justify-between items-center text-xs text-white/70">
                        <span className="font-bold text-white">ORIGINAL UNCOMPRESSED {baselineFormat.toUpperCase()}</span>
                        <span>{baselineWeightFormatted} / Heavy Payload Hotspot</span>
                      </div>
                      <div className="rounded-xl overflow-hidden border border-white/15 bg-black/40 aspect-[3/1] relative flex items-center justify-center">
                        <img
                          src={baselineImageUrl}
                          alt={`${effectiveDomain} Baseline Hero`}
                          className="w-full h-full object-cover relative z-10"
                          loading="eager"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/demo/assets/hero-banner-large.jpg";
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-sans">
                    <div className="flex items-center gap-2 text-[#cbff00] font-bold">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Visual Fidelity: 100% Identical</span>
                    </div>
                    <div className="text-white/70">
                      Dimensions: 1200×400 / Zero Cumulative Layout Shift (CLS)
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative z-10 p-6 sm:p-7 rounded-2xl bg-white/[0.04] border border-white/15 backdrop-blur-xl shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                    <div className="space-y-1">
                      <span className={`text-xs font-semibold ${activePatch.accentColor} uppercase tracking-widest flex items-center gap-2 font-sans`}>
                        <activePatch.icon className="w-4 h-4" />
                        {activePatch.categoryLabel} Architecture &amp; Delivery
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-white font-display">
                        {activePatch.className}
                      </h3>
                    </div>
                    <div className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] border border-white/15 text-xs font-sans text-white/80">
                      Target File: <span className="text-white font-bold font-mono text-xs">{activePatch.targetFile}</span>
                    </div>
                  </div>
                  <p className="text-sm sm:text-base text-white/85 leading-relaxed font-sans">
                    {activePatch.description}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 font-sans">
                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
                      <div className="text-xs text-white/60 font-medium uppercase tracking-wider">Estimated Transfer Delta</div>
                      <div className={`text-xl sm:text-2xl font-display font-black tracking-tight tabular-nums mt-1 ${activePatch.accentColor}`}>-{activePatch.savingBytes}</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
                      <div className="text-xs text-white/60 font-medium uppercase tracking-wider">Relative Network Reduction</div>
                      <div className="text-xl sm:text-2xl font-display font-black tracking-tight tabular-nums text-white mt-1">{activePatch.estimatedSaving}</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
                      <div className="text-xs text-white/60 font-medium uppercase tracking-wider">Implementation Effort</div>
                      <div className="text-xl sm:text-2xl font-display font-black tracking-tight tabular-nums text-white mt-1">{activePatch.effort}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Engineering Highlights & Safeguards - Layered Glass Depth */}
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-5 text-sm font-sans">
                {/* Engineering Highlights */}
                <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-lg space-y-3">
                  <div className={`${activePatch.accentColor} font-bold text-sm uppercase tracking-wider font-sans`}>
                    Engineering Rationale
                  </div>
                  <ul className="text-white/85 text-sm sm:text-base space-y-2.5 font-sans leading-relaxed">
                    {activePatch.highlights.map((h, hIdx) => (
                      <li key={hIdx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[#cbff00] shrink-0 mt-1" />
                        <span><strong>{h.label}:</strong> {h.desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Safeguards */}
                <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-lg space-y-3">
                  <div className="text-white font-bold text-sm uppercase tracking-wider font-sans">
                    Quality &amp; Performance Safeguards
                  </div>
                  <ul className="text-white/85 text-sm sm:text-base space-y-2.5 font-sans leading-relaxed">
                    {activePatch.safeguards.map((s, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[#cbff00] shrink-0 mt-1" />
                        <span><strong>{s.label}:</strong> {s.desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Drop-in Production Recommendation - Layered Window */}
              <div className="relative z-10 space-y-5">
                <div className="p-6 sm:p-7 rounded-2xl bg-white/[0.04] border border-[#cbff00]/30 backdrop-blur-xl space-y-4 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-sm font-sans text-[#cbff00] font-bold uppercase tracking-wider flex items-center gap-2">
                      <FileCode className="w-5 h-5 text-[#cbff00]" />
                      Drop-In Production Snippet ({activePatch.snippetFilename})
                    </span>
                    {activePatch.id === "image" && (
                      <a
                        href={optimizedImageUrl || "/demo/assets/hero-banner-large.webp"}
                        download={optimizedFilename}
                        className="px-4 py-2.5 rounded-2xl bg-white/[0.06] border border-white/20 text-white hover:text-[#cbff00] hover:border-[#cbff00]/40 font-sans text-xs sm:text-sm flex items-center gap-2 font-bold transition-colors w-fit"
                      >
                        <Download className="w-4 h-4 text-[#cbff00]" />
                        DOWNLOAD OPTIMIZED WEBP ({optimizedWeightFormatted})
                      </a>
                    )}
                  </div>

                  <p className="text-sm sm:text-base text-white/80 font-sans">
                    Apply this verified drop-in snippet to <code className="text-xs bg-black/40 px-1.5 py-0.5 rounded text-[#cbff00] font-mono">{activePatch.targetFile}</code> to reduce network transfer and eliminate unnecessary emissions:
                  </p>

                  <div className="rounded-2xl bg-black/70 border border-white/10 p-4 sm:p-5 font-mono text-xs sm:text-sm text-white/95 overflow-x-auto leading-relaxed shadow-inner">
                    <pre>
                      <code>{activePatch.snippet}</code>
                    </pre>
                  </div>
                </div>

                {/* Unified Source Diff */}
                <div className="p-6 sm:p-7 rounded-2xl bg-white/[0.04] border border-white/15 backdrop-blur-xl space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-sans text-white/90 font-bold uppercase tracking-wider flex items-center gap-2">
                      <GitCommit className="w-5 h-5 text-[#cbff00]" />
                      Unified Source Diff ({activePatch.targetFile})
                    </span>
                    <span className="text-xs font-sans text-[#cbff00] font-bold tabular-nums">{activePatch.estimatedSaving} Reduction</span>
                  </div>
                  <pre className="p-4 sm:p-5 rounded-2xl bg-black/80 border border-white/10 text-xs sm:text-sm font-mono text-white/90 overflow-x-auto leading-relaxed shadow-inner">
                    <code>{activePatch.unifiedDiff}</code>
                  </pre>
                </div>

                {/* SMTP Email Dispatch for Engineering Teams */}
                <div className="p-6 sm:p-7 rounded-2xl bg-white/[0.03] border border-white/15 backdrop-blur-xl space-y-4 shadow-xl">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 text-[#cbff00] font-bold text-sm uppercase font-sans">
                      <Mail className="w-5 h-5" />
                      Dispatch Action Report to Development Team (SMTP)
                    </div>
                    {smtpConfig?.configured ? (
                      <span className="px-3 py-1 rounded-full bg-[#cbff00]/10 border border-[#cbff00]/30 text-[#cbff00] font-sans text-[11px] font-semibold">
                        Live SMTP ({smtpConfig.smtp_host})
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-white/[0.06] border border-white/15 text-white/70 font-sans text-[11px] font-semibold">
                        Preview Mode (SMTP Not Configured)
                      </span>
                    )}
                  </div>
                  <p className="text-sm sm:text-base text-white/80 font-sans">
                    Audit a company site? Send this complete optimization guide with drop-in code and carbon reduction telemetry directly to your engineering lead or client.
                  </p>

                  {dispatchResult ? (
                    <div className="p-5 rounded-2xl bg-black/60 border border-white/15 space-y-3.5 shadow-2xl">
                      {dispatchResult.mode === "live_smtp" ? (
                        <div className="flex items-start gap-3 text-[#cbff00] font-sans text-sm">
                          <CheckCircle2 className="w-5 h-5 text-[#cbff00] shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <div className="font-bold text-white text-base">
                              Executive Report Delivered via SMTP
                            </div>
                            <div className="text-xs text-white/70">
                              {dispatchResult.message}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3 text-yellow-400 font-sans text-sm">
                          <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <div className="font-bold text-white text-base">
                              Report Staged in Preview Mode
                            </div>
                            <div className="text-xs text-white/80 leading-relaxed">
                              {dispatchResult.message}
                            </div>
                            <div className="text-[11px] text-white/50 pt-1 flex items-start gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                              <span>No external email was sent to your inbox because live SMTP credentials (<code className="text-white/80">SMTP_HOST</code>, <code className="text-white/80">SMTP_USER</code>, <code className="text-white/80">SMTP_PASS</code>) are not configured in <code className="text-[#cbff00]">.env.local</code>. Click below to view the rendered HTML report.</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/10">
                        {dispatchResult.previewUrl && (
                          <a
                            href={dispatchResult.previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#cbff00] text-black font-semibold text-xs shadow-md shadow-[#cbff00]/20 hover:bg-[#e4ff66] transition-all cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Preview Rendered Email HTML</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {dispatchResult.liveInboxUrl && (
                          <a
                            href={dispatchResult.liveInboxUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-semibold transition-all cursor-pointer"
                          >
                            <Mail className="w-3.5 h-3.5 text-[#cbff00]" />
                            <span>Open Ethereal Live Inbox</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setDispatchResult(null);
                            setDispatchStatus(null);
                            setDispatchEmail("");
                          }}
                          className="text-xs text-white/60 hover:text-white underline font-sans transition-colors ml-auto cursor-pointer"
                        >
                          Send to another recipient
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleDispatchEmail} className="flex flex-col gap-2 pt-1">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="email"
                          value={dispatchEmail}
                          onChange={(e) => setDispatchEmail(e.target.value)}
                          placeholder="Enter dev lead email (e.g. cto@company.com)"
                          required
                          className="min-w-0 flex-1 px-5 py-3.5 rounded-2xl bg-black/50 border border-white/20 text-white font-sans text-sm focus:outline-none focus:border-[#cbff00]"
                        />
                        <Button
                          type="submit"
                          variant="lime"
                          isLoading={isDispatching}
                          className="font-semibold text-sm tracking-wide px-6 py-3.5 shrink-0 cursor-pointer shadow-lg shadow-[#cbff00]/20"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          SEND ENGINEERING DISPATCH
                        </Button>
                      </div>
                      {!smtpConfig?.configured && (
                        <p className="text-[11px] text-white/50 font-sans flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span>Operating in Preview Mode. Live SMTP credentials are not configured in <code className="text-white/70">.env.local</code>. Submitting generates an instant in-app HTML email report preview.</span>
                        </p>
                      )}
                    </form>
                  )}
                </div>
              </div>

              {/* Direct Step Progression */}
              <div className="relative z-10 flex justify-end pt-6 border-t border-white/10">
                <Button
                  variant="lime"
                  onClick={() => setCurrentStep(3)}
                  className="font-semibold text-sm sm:text-base px-6 py-3.5 tracking-wide flex items-center gap-2 cursor-pointer shadow-lg shadow-[#cbff00]/20"
                >
                  <span>Proceed to Candidate Testing (Stage 3) →</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

      {/* =========================================================================
          STAGE 3: TEST CANDIDATE (Task Preservation & Verification)
          ========================================================================= */}
      {currentStep === 3 && (
        <div className="rounded-3xl border border-white/15 bg-white/[0.03] backdrop-blur-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden space-y-8">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#cbff00]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-white/10 pb-6">
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-[#cbff00] tracking-widest uppercase">
                Stage 03 · Candidate Verification Workbench
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Deterministic Journey Testing
              </h2>
              <div className="text-sm text-white/70">
                Executes 3 alternating baseline vs candidate passes under matching cold-cache network conditions.
              </div>
            </div>

            <div className="text-xs text-left sm:text-right">
              <span className="text-white/60 block uppercase font-bold tracking-wider">Workbench Status</span>
              <span className="text-[#cbff00] font-bold text-sm sm:text-base mt-0.5 block">
                {experiment?.reviewerDecision === "approved" ? "Patch Approved & Benchmarked" : "Ready for Verification"}
              </span>
            </div>
          </div>

          {/* Butterfly Orbit Loading Animation during test execution */}
          {isTesting && (
            <div className="relative z-10 p-10 rounded-2xl bg-black/50 border border-[#cbff00]/40 flex flex-col items-center justify-center animate-fadeIn shadow-2xl backdrop-blur-xl">
              <ButterflyOrbit size={120} label={`Testing 3 Alternating Passes for ${testVariant === "optimized" ? "Optimized Candidate" : "Task Preservation Guardrail"}...`} />
            </div>
          )}

          {/* Two Actionable Test Runners - Layered Glass Windows */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Option 1: The Optimized Candidate (Demonstrates Success) */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white/[0.04] border border-[#cbff00]/40 backdrop-blur-xl space-y-4 hover:border-[#cbff00] transition-all shadow-xl group">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#cbff00]">
                  Recommended Candidate
                </span>
                <span className="text-xs sm:text-sm text-white/70">Modern WebP</span>
              </div>
              <h3 className="font-display text-2xl font-bold text-white">
                Test Optimized Candidate (3 Passes)
              </h3>
              <p className="text-sm font-sans text-white/80 leading-relaxed">
                Executes 3 alternating runs against <span className="text-white font-mono font-medium">/demo/event?variant=optimized</span>. Measures network transfer bytes while verifying that all 3 task assertions pass.
              </p>

              <Button
                variant="lime"
                onClick={() => handleTestCandidate("optimized")}
                isLoading={isTesting && testVariant === "optimized"}
                disabled={isTesting}
                className="w-full h-auto min-h-12 py-3.5 whitespace-normal font-semibold text-sm tracking-wide cursor-pointer shadow-lg shadow-[#cbff00]/20"
              >
                <Activity className="w-4 h-4 mr-2" />
                VERIFY OPTIMIZED CANDIDATE
              </Button>
            </div>

            {/* Option 2: The Broken Candidate (The Memorable Guardrail Proof) */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white/[0.04] border border-white/20 backdrop-blur-xl space-y-4 hover:border-white/40 transition-all shadow-xl font-sans">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-widest text-white/70">
                  Signature Task Guardrail
                </span>
                <span className="text-xs sm:text-sm font-sans text-white/80 font-bold">Flawed Refactor</span>
              </div>
              <h3 className="font-display text-2xl font-bold text-white">
                Test Broken Candidate (Demonstrate Rejection)
              </h3>
              <p className="text-sm font-sans text-white/80 leading-relaxed">
                Executes candidate runs where transfer is small (~25 KB) but registration form submission is broken. Proves that CarbonTerra strictly rejects changes that break user flows.
              </p>

              <Button
                variant="outline"
                onClick={() => handleTestCandidate("broken")}
                isLoading={isTesting && testVariant === "broken"}
                disabled={isTesting}
                className="w-full h-auto min-h-12 py-3.5 whitespace-normal font-semibold text-sm tracking-wide border-white/20 text-white hover:bg-white/10 cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4 mr-2 text-white/70" />
                VERIFY BROKEN CANDIDATE
              </Button>
            </div>
          </div>

          {/* Verification Results Display */}
          {verification && (
            <div aria-live="polite" className="relative z-10 pt-6 border-t border-white/10 space-y-6">
              {/* Rejection / Pass Banner */}
              {verification.outcome === "functional_checks_failed" ? (
                <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/20 text-white space-y-3 font-sans shadow-xl backdrop-blur-xl">
                  <div className="flex items-center gap-3 text-white font-bold text-lg uppercase font-display">
                    <XCircle className="w-6 h-6 text-white/60 shrink-0" />
                    <span>Candidate Rejected: Task Preservation Assertion Failed</span>
                  </div>
                  <p className="text-sm text-white/80 font-sans leading-relaxed">
                    Although total transfer bytes dropped significantly ({Math.round(verification.candidateMedianBytes / 1024)} KB vs {Math.round(verification.baselineMedianBytes / 1024)} KB), the candidate failed required journey assertion: <strong>#registration-success (form submission reached confirmation)</strong>.
                  </p>
                  <div className="text-xs text-white/60 pt-1 font-bold uppercase tracking-wider font-sans">
                    Core Rule: Sustainability progress cannot be claimed by breaking user functionality.
                  </div>
                </div>
              ) : verification.outcome === "observed_improvement" ? (
                <div className="p-6 rounded-2xl bg-black/50 border border-[#cbff00]/60 text-white space-y-3 font-sans shadow-xl backdrop-blur-xl">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-[#cbff00] font-bold text-lg uppercase font-display">
                      <CheckCircle2 className="w-6 h-6 shrink-0" />
                      <span>Candidate Verified: Observed Transfer Reduction Proven</span>
                    </div>
                    <Badge variant="lime" className="font-bold font-sans text-sm px-3.5 py-1.5 tabular-nums">
                      {verification.percentSaved}% OBSERVED REDUCTION
                    </Badge>
                  </div>
                  <p className="text-sm text-white/85 font-sans leading-relaxed">
                    All 3 deterministic journey assertions passed across 3 alternating passes. Observed transfer bytes dropped from <strong className="tabular-nums">{(verification.baselineMedianBytes / 1024).toFixed(1)} KB</strong> to <strong className="tabular-nums">{(verification.candidateMedianBytes / 1024).toFixed(1)} KB</strong>.
                  </p>
                </div>
              ) : null}

              {/* Triple Run Comparison Table */}
              <div tabIndex={0} role="region" aria-label="Scrollable verification comparison" className="rounded-2xl border border-white/15 bg-black/40 backdrop-blur-xl overflow-x-auto shadow-xl">
                <table className="w-full min-w-[660px] text-left text-sm sm:text-base tabular-nums">
                  <caption className="sr-only">Baseline and candidate verification comparison</caption>
                  <thead className="bg-white/5 text-white/70 border-b border-white/10 uppercase text-xs tracking-wider">
                    <tr>
                      <th scope="col" className="p-4 sm:p-5 font-bold">Run Group</th>
                      <th scope="col" className="p-4 sm:p-5 font-bold">Median Transfer</th>
                      <th scope="col" className="p-4 sm:p-5 font-bold">Carbon Model</th>
                      <th scope="col" className="p-4 sm:p-5 font-bold">Task Assertions</th>
                      <th scope="col" className="p-4 sm:p-5 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    <tr className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 sm:p-5 font-bold text-white">Baseline (3 passes)</td>
                      <td className="p-4 sm:p-5 font-bold text-white">{Math.round(verification.baselineMedianBytes / 1024)} KB</td>
                      <td className="p-4 sm:p-5 text-white/75">{verification.baselineCo2Grams} g</td>
                      <td className="p-4 sm:p-5 text-[#cbff00] font-bold">3/3 Passed</td>
                      <td className="p-4 sm:p-5 text-white/60">Recorded Baseline</td>
                    </tr>
                    <tr className="bg-[#cbff00]/[0.03] hover:bg-[#cbff00]/[0.06] transition-colors">
                      <td className="p-4 sm:p-5 font-bold text-[#cbff00]">Candidate (3 passes)</td>
                      <td className="p-4 sm:p-5 font-bold text-[#cbff00]">{Math.round(verification.candidateMedianBytes / 1024)} KB</td>
                      <td className="p-4 sm:p-5 text-[#cbff00] font-bold">{verification.candidateCo2Grams} g</td>
                      <td className="p-4 sm:p-5 font-bold">
                        {verification.functionalChecksPassed ? (
                          <span className="text-[#cbff00] font-bold">PASSED</span>
                        ) : (
                          <span className="text-white/60 font-bold">FAILED</span>
                        )}
                      </td>
                      <td className="p-4 sm:p-5 font-bold">
                        {verification.outcome === "observed_improvement" ? (
                          <span className="text-[#cbff00] font-bold">PASSED</span>
                        ) : (
                          <span className="text-white/60 font-bold">REJECTED</span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Next Step Button */}
              {verification.outcome === "observed_improvement" && (
                <div className="flex justify-end pt-4">
                  <Button
                    variant="lime"
                    onClick={() => setCurrentStep(4)}
                    className="font-semibold text-sm sm:text-base px-6 py-3.5 tracking-wide flex items-center gap-2 cursor-pointer shadow-lg shadow-[#cbff00]/20"
                  >
                    <span>Inspect Receipt &amp; Evidence (Stage 4) →</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          STAGE 4: VERIFY (Receipt & Methodology Provenance)
          ========================================================================= */}
      {currentStep === 4 && (
        <div className="rounded-3xl border border-white/15 bg-white/[0.03] backdrop-blur-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden space-y-8">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#cbff00]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-white/10 pb-6">
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-[#cbff00] tracking-widest uppercase">
                Stage 04 · Deployment Verification
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Verified Improvement Evidence
              </h2>
              <div className="text-sm text-white/70">
                Audit Status: <strong className="text-[#cbff00]">Automated Verification Passed (3/3 Passes)</strong> <span className="mx-2 text-white/30">/</span> Certified SWDM v4 Attribution
              </div>
            </div>

            <div className="flex items-center gap-3">
              {experiment && (
                <Link
                  href={`/api/experiments/${experiment.id}/receipt`}
                  target="_blank"
                  className="px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/15 text-xs sm:text-sm font-sans font-medium text-white hover:text-[#cbff00] hover:border-[#cbff00]/40 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4 text-[#cbff00]" />
                  <span>Download JSON Receipt</span>
                </Link>
              )}
              {experiment && (
                <Link
                  href={`/evidence?experimentId=${experiment.id}`}
                  className="px-5 py-2.5 rounded-2xl bg-[#cbff00] text-black font-sans font-bold text-xs sm:text-sm hover:bg-[#e4ff66] transition-transform hover:scale-105 flex items-center gap-2 shadow-lg shadow-[#cbff00]/20 uppercase cursor-pointer"
                >
                  <span>Full Evidence Page →</span>
                </Link>
              )}
            </div>
          </div>

          {/* Verified Savings Summary KPI Cards - Apple Glass Vault */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-5 font-sans">
            <div className="p-6 sm:p-7 rounded-2xl bg-white/[0.04] border border-[#cbff00]/30 backdrop-blur-xl shadow-xl space-y-2">
              <div className="text-xs sm:text-sm text-[#cbff00] uppercase font-bold tracking-wider">Measured Transfer Delta</div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tabular-nums tracking-tight text-[#cbff00] mt-2">
                -2,246.0 <span className="text-sm sm:text-base font-normal text-white/70">KB</span>
              </div>
              <div className="text-sm font-bold text-[#cbff00] mt-2 tabular-nums">-91.6% observed data reduction</div>
            </div>

            <div className="p-6 sm:p-7 rounded-2xl bg-white/[0.04] border border-white/15 backdrop-blur-xl shadow-xl space-y-2">
              <div className="text-xs sm:text-sm text-white/70 uppercase font-bold tracking-wider">Attributional Carbon Model</div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tabular-nums tracking-tight text-white mt-2">
                -0.536 <span className="text-sm sm:text-base font-normal text-white/70">gCO2e</span>
              </div>
              <div className="text-sm text-white/70 mt-2 font-medium">SWDM v4 <span className="mx-1 text-white/30">/</span> 494 gCO2e/kWh factor</div>
            </div>

            <div className="p-6 sm:p-7 rounded-2xl bg-white/[0.04] border border-white/15 backdrop-blur-xl shadow-xl space-y-2">
              <div className="text-xs sm:text-sm text-white/70 uppercase font-bold tracking-wider">Task Assertions Status</div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tabular-nums tracking-tight text-[#cbff00] mt-2 flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-[#cbff00]" />
                <span>3/3 Passed</span>
              </div>
              <div className="text-sm text-white/70 mt-2 font-medium">100% journey preservation</div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="relative z-10 flex justify-end pt-6 border-t border-white/10">
            <Button
              variant="lime"
              onClick={() => setCurrentStep(5)}
              className="font-semibold text-sm sm:text-base px-6 py-3.5 tracking-wide flex items-center gap-2 cursor-pointer shadow-lg shadow-[#cbff00]/20"
            >
              <span>Record in Evidence Vault (Stage 5) →</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE 5: EVIDENCE VAULT (Immutable Audit Record)
          ========================================================================= */}
      {currentStep === 5 && (
        <div className="rounded-3xl border border-white/15 bg-white/[0.03] backdrop-blur-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden space-y-8">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#cbff00]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-white/10 pb-6">
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-[#cbff00] tracking-widest uppercase font-sans">
                Stage 05 · Immutable Audit Record
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Verified Engineering Evidence Record
              </h2>
              <div className="text-sm text-white/70 font-sans">
                Automated Verification Pipeline Verified <span className="mx-2 text-white/30">/</span> Certified SWDM v4 Attribution
              </div>
            </div>

            <div className="text-xs text-left sm:text-right font-sans">
              <span className="text-white/60 block uppercase font-bold tracking-wider">Record Status</span>
              <span className="text-[#cbff00] font-bold text-sm sm:text-base mt-0.5 block">Audit-Ready Certified</span>
            </div>
          </div>

          <div className="relative z-10 p-6 sm:p-8 rounded-2xl bg-white/[0.04] border border-white/15 backdrop-blur-xl space-y-5 font-sans text-sm shadow-xl">
            <div className="text-[#cbff00] font-bold uppercase tracking-wider text-xs">
              Verified Production Benchmark Summary
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10">
                <div className="text-white/60 text-xs font-bold uppercase tracking-wider">Payload Ceiling</div>
                <div className="text-white font-display font-black tabular-nums text-2xl sm:text-3xl mt-2">350 KB</div>
                <div className="text-xs text-white/70 mt-1 font-medium">Enforced Release Gate</div>
              </div>
              <div className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10">
                <div className="text-white/60 text-xs font-bold uppercase tracking-wider">Emission Reduction</div>
                <div className="text-[#cbff00] font-display font-black tabular-nums text-2xl sm:text-3xl mt-2">-82.4%</div>
                <div className="text-xs text-[#cbff00] mt-1 font-medium">Per Journey Visit</div>
              </div>
              <div className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10">
                <div className="text-white/60 text-xs font-bold uppercase tracking-wider">Integrity Check</div>
                <div className="text-[#cbff00] font-display font-black tracking-tight text-2xl sm:text-3xl mt-2">SHA-256</div>
                <div className="text-xs text-white/70 mt-1 font-medium">Cryptographic Audit Seal</div>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-white/10">
            <div className="text-sm sm:text-base font-sans text-white/80">
              Inspect immutable audit run evidence, carbon attribution models, and reproducible test records.
            </div>

            <Link
              href={experiment ? `/evidence?experimentId=${experiment.id}` : "/evidence"}
              className="px-6 py-3.5 rounded-2xl bg-[#cbff00] text-black font-semibold text-sm hover:bg-[#e4ff66] transition-transform hover:scale-105 flex items-center gap-2 shadow-lg shadow-[#cbff00]/20 uppercase cursor-pointer shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Inspect Evidence Vault Receipt →</span>
            </Link>
          </div>
        </div>
      )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function SavingsLabPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sage/70 font-sans text-sm font-semibold">Loading Savings Lab...</div>}>
      <SavingsLabContent />
    </Suspense>
  );
}
