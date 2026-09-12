"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageIntro } from "@/components/ui/page";
import { Copy, Info } from "lucide-react";
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
    title: "Next-generation images with AVIF/WebP encoding",
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
    title: "Third-party tag deferral & dynamic script loading",
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
    title: "Web font subsetting & WOFF2 preloading",
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
    title: "Immutable asset caching & Brotli compression",
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

  const handleCopy = async (id: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setNotification("Code pattern copied to clipboard.");
    } catch {
      setCopiedId(null);
      setNotification("Could not copy automatically. Select and copy the code below.");
    }
    setTimeout(() => {
      setCopiedId(null);
      setNotification(null);
    }, 2500);
  };

  const filteredPatterns = PATTERNS.filter(
    (p) => selectedCategory === "ALL" || p.category === selectedCategory
  );

  return (
    <div className="min-w-0 space-y-8 pb-12">
      <PageIntro
        eyebrow="Reference guidance"
        title="Small changes. Lighter pages."
        description="Illustrative engineering patterns and reference snippets for common web transfer categories. These are generic guidance examples and do not guarantee specific savings or prove assets are uncompressed or scripts are unused. For verified fixes with task checks, use Savings Lab."
        actions={
          <Link
            href="/savings-lab"
            className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-lime text-black font-medium text-sm hover:bg-lime/90 transition-colors"
          >
            Open Savings Lab →
          </Link>
        }
      />

      {notification && (
        <div role="status" className="p-3 rounded-xl bg-surface border border-lime/30 text-lime text-sm">
          {notification}
        </div>
      )}

      {/* Reference Guidance Notice */}
      <div className="p-4 rounded-xl glass-panel border border-surface-border text-xs font-mono text-sage/80 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-lime shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-cream">Reference guidance disclaimer:</span> These patterns are general educational examples. Heavy JavaScript transfer does not prove code is unused, and high image bytes alone do not prove images lack modern compression. Real optimization requires source-level inspection and functional verification in <Link href="/savings-lab" className="text-lime underline">Savings Lab</Link>.
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 font-mono text-xs" role="group" aria-label="Filter reference patterns by category">
        <span className="text-sage/60 mr-2">Category:</span>
        {["ALL", "Images", "JavaScript", "Fonts", "Compression & Cache"].map((cat) => (
          <button
            key={cat}
            type="button"
            aria-pressed={selectedCategory === cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full font-bold transition-all ${
              selectedCategory === cat
                ? "bg-lime text-black"
                : "bg-surface-elevated border border-surface-border text-sage hover:text-cream"
            }`}
          >
            {cat === "ALL" ? "All patterns" : cat}
          </button>
        ))}
      </div>

      {/* Pattern Cards List */}
      <div className="space-y-8">
        {filteredPatterns.map((pattern, index) => (
          <Card key={pattern.id} className="min-w-0 p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border pb-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span className="font-mono text-xs text-sage/50" aria-hidden="true">
                    0{index + 1}
                  </span>
                  <Badge variant="lime" className="font-mono text-xs">
                    {pattern.category}
                  </Badge>
                  <span className="text-xs font-mono text-sage/70">Framework: {pattern.targetFramework}</span>
                </div>
                <h2 className="font-display text-2xl text-cream mt-3">{pattern.title}</h2>
                <p className="text-sm text-sage/80 mt-2 max-w-3xl leading-relaxed">{pattern.description}</p>
                <div className="text-[11px] font-mono text-lime/80 mt-1.5">
                  <span className="text-sage/60">Where to apply:</span> {pattern.whereToApply}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(pattern.id, pattern.code)}
                className="shrink-0 font-mono text-xs flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                {copiedId === pattern.id ? "Copied" : "Copy code"}
              </Button>
            </div>

            {/* Code Display */}
            <pre tabIndex={0} aria-label={`${pattern.title} code example`} className="max-w-full p-4 rounded-xl bg-black/80 border border-surface-border overflow-auto text-xs font-mono text-lime/90 leading-relaxed max-h-72">
              {pattern.code}
            </pre>
          </Card>
        ))}
      </div>
    </div>
  );
}
