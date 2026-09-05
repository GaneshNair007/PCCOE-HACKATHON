"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Cpu,
  Sparkles,
  Copy,
  Check,
  Code,
  ArrowRight,
  Zap,
  CheckCircle2,
  FileCode,
  Layers,
  Info,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface RemediationPattern {
  id: string;
  category: "Images" | "JavaScript" | "Fonts" | "Compression & Cache";
  title: string;
  description: string;
  targetFramework: string;
  whereToApply: string;
  code: string;
}

const PATTERNS: RemediationPattern[] = [
  {
    id: "avif-image",
    category: "Images",
    title: "Next-Gen Image Component with AVIF/WebP Encoding",
    description:
      "Replaces uncompressed raster PNG/JPEG images with an adaptive <picture> container or Next.js Image component, cutting transfer weight by 45–70%.",
    targetFramework: "Next.js / HTML5",
    whereToApply: "Hero banners, marketing product shots, and above-the-fold content",
    code: `// Option A: Next.js Optimized Image Component
import Image from 'next/image';

export function HeroBanner() {
  return (
    <div className="relative w-full aspect-[16/9] overflow-hidden rounded-2xl">
      <Image
        src="/assets/hero.jpg"
        alt="Sustainability Telemetry"
        fill
        priority
        sizes="(max-width: 768px) 100vw, 1200px"
        className="object-cover"
        placeholder="blur"
        blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmci..."
      />
    </div>
  );
}

// Option B: Vanilla HTML5 Responsive Picture
<picture>
  <source srcset="/assets/hero.avif" type="image/avif" />
  <source srcset="/assets/hero.webp" type="image/webp" />
  <img
    src="/assets/hero.jpg"
    alt="Hero"
    width="1200"
    height="675"
    loading="lazy"
    decoding="async"
    fetchpriority="high"
  />
</picture>`,
  },
  {
    id: "script-defer",
    category: "JavaScript",
    title: "Third-Party Tag Deferral & Dynamic Script Loading",
    description:
      "Defers Google Tag Manager, analytics trackers, and chat widgets until after main DOM hydration, preventing render-blocking CPU energy waste.",
    targetFramework: "JavaScript / Next.js Script",
    whereToApply: "Analytics snippets, customer support widgets, tracking pixels",
    code: `// Next.js: Defer non-critical analytics with next/script
import Script from 'next/script';

export function AnalyticsScripts() {
  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-XXXXX"
        strategy="lazyOnload"
      />
      <Script id="analytics-init" strategy="lazyOnload">
        {\`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-XXXXX');
        \`}
      </Script>
    </>
  );
}

// Vanilla JS: Defer after window load event
window.addEventListener('load', () => {
  const tag = document.createElement('script');
  tag.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-XXXX';
  tag.defer = true;
  document.body.appendChild(tag);
});`,
  },
  {
    id: "font-subset",
    category: "Fonts",
    title: "Web Font Subsetting & WOFF2 Preloading",
    description:
      "Eliminates external font round-trips to third-party CDNs by self-hosting compressed WOFF2 fonts with unicode character subsetting.",
    targetFramework: "CSS / Web Fonts",
    whereToApply: "Global typography stylesheets (@font-face declarations)",
    code: `/* Self-hosted WOFF2 with Latin glyph subsetting */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400 700;
  font-display: swap;
  src: url('/fonts/inter-latin-sub.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6;
}

/* Preload primary critical font weight */
<link
  rel="preload"
  href="/fonts/inter-latin-sub.woff2"
  as="font"
  type="font/woff2"
  crossorigin="anonymous"
/>`,
  },
  {
    id: "cache-compression",
    category: "Compression & Cache",
    title: "Immutable Asset Caching & Brotli Compression",
    description:
      "Configures CDN edge servers to serve static assets with 1-year immutable cache headers and modern Brotli (br) compression.",
    targetFramework: "Nginx / Cloudflare / Apache",
    whereToApply: "Edge reverse proxy or cloud hosting header configuration",
    code: `# Nginx: Brotli Compression & Immutable Static Cache Directives
brotli on;
brotli_comp_level 6;
brotli_types text/plain text/css text/xml application/javascript image/svg+xml;

location ~* \\.(?:ico|css|js|gif|jpe?g|png|avif|webp|woff2?)$ {
  expires 1y;
  add_header Cache-Control "public, max-age=31536000, immutable";
  add_header X-Content-Type-Options "nosniff";
  access_log off;
}`,
  },
];

export default function FixHubPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setNotification("Remediation pattern copied to clipboard!");
    setTimeout(() => {
      setCopiedId(null);
      setNotification(null);
    }, 2500);
  };

  const filteredPatterns = PATTERNS.filter(
    (p) => selectedCategory === "ALL" || p.category === selectedCategory
  );

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-8">
        <div>
          <span className="text-xs font-mono text-lime uppercase font-bold tracking-widest">
            ENGINEERING WORKBENCH • GUIDANCE MODE
          </span>
          <h1 className="font-display text-4xl sm:text-6xl text-cream uppercase tracking-wide mt-1">
            FIX HUB
          </h1>
          <p className="text-xs sm:text-sm text-sage/80 mt-2 max-w-2xl">
            Verified, production-ready engineering patterns to eliminate the four most common digital carbon offenders: uncompressed images, heavy scripts, font bloat, and cache misses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="px-4 py-2 rounded-xl bg-lime text-black font-mono font-bold text-xs hover:bg-lime/90 transition-transform hover:scale-105"
          >
            Audit Your Target →
          </Link>
        </div>
      </div>

      {notification && (
        <div className="p-3 rounded-xl bg-lime/10 border border-lime/30 text-lime text-xs font-mono">
          {notification}
        </div>
      )}

      {/* Guidance Mode Notice */}
      <div className="p-4 rounded-xl glass-panel border border-surface-border text-xs font-mono text-sage/80 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-lime shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-cream">Guidance Mode Policy:</span> Carbonerra audits public websites externally without private source repository access. The code patterns below are framework-tested reference snippets. Copy and paste them into your application codebase to capture measured carbon savings.
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
        <span className="text-sage/60 mr-2 uppercase">Filter by Category:</span>
        {["ALL", "Images", "JavaScript", "Fonts", "Compression & Cache"].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full font-bold transition-all ${
              selectedCategory === cat
                ? "bg-lime text-black"
                : "bg-surface-elevated border border-surface-border text-sage hover:text-cream"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Pattern Cards List */}
      <div className="space-y-8">
        {filteredPatterns.map((pattern) => (
          <Card key={pattern.id} className="p-6 glass-panel-elevated border border-surface-border space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="lime" className="font-mono text-[10px] uppercase">
                    {pattern.category}
                  </Badge>
                  <span className="text-xs font-mono text-sage/70">Framework: {pattern.targetFramework}</span>
                </div>
                <h3 className="font-display text-2xl text-cream uppercase mt-1.5">{pattern.title}</h3>
                <p className="text-xs text-sage/80 mt-1 max-w-3xl leading-relaxed">{pattern.description}</p>
                <div className="text-[11px] font-mono text-lime/80 mt-1.5">
                  <span className="text-sage/60">Where to Apply:</span> {pattern.whereToApply}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(pattern.id, pattern.code)}
                className="shrink-0 font-mono text-xs flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                {copiedId === pattern.id ? "COPIED PATTERN" : "COPY CODE PATTERN"}
              </Button>
            </div>

            {/* Code Display */}
            <pre className="p-4 rounded-xl bg-black/80 border border-surface-border overflow-x-auto text-xs font-mono text-lime/90 leading-relaxed max-h-72">
              {pattern.code}
            </pre>
          </Card>
        ))}
      </div>
    </div>
  );
}
