/**
 * Carbonerra Mission Control — Curated Knowledge Corpus
 * Local searchable corpus covering:
 * - SWDM v4 (Sustainable Web Design Model)
 * - Green Web Foundation (GWF) & CO2.js methodology
 * - Digital carbon boundaries, grid intensity, and embodied emissions
 * - Responsive images & modern formats (WebP, AVIF, picture tag)
 * - Script deferral, hydration cost, and execution energy
 * - Web font optimization & subsetting
 * - HTTP caching & CDN edge delivery
 * - Carbonerra platform capabilities & limits
 */

export interface KnowledgeDocument {
  id: string;
  title: string;
  topic: "methodology" | "images" | "scripts" | "fonts" | "caching" | "platform";
  sourceUrl: string;
  version: string;
  lastVerified: string;
  content: string;
  tags: string[];
}

export const KNOWLEDGE_CORPUS: KnowledgeDocument[] = [
  {
    id: "kb-swdm-v4",
    title: "Sustainable Web Design Model (SWDM) v4 Core Specifications",
    topic: "methodology",
    sourceUrl: "https://sustainablewebdesign.org/estimating-digital-emissions/",
    version: "4.0",
    lastVerified: "2026-09-05",
    tags: ["swdm", "methodology", "co2js", "segments", "uncertainty"],
    content: `The Sustainable Web Design Model (SWDM) v4 calculates greenhouse gas emissions associated with web transfer.
Energy intensity factor: 0.0577 kWh per GB transferred across the entire delivery chain.
System segment allocation:
- Data Center: 15% of total energy.
- Network Transmission: 14% of total energy.
- End-User Devices: 52% of total energy (largest driver).
- Hardware Manufacturing / Embodied Carbon: 19% of total energy.
Carbon intensity defaults:
- Operational grid intensity: 442 gCO2e/kWh (global annual weighted average).
- Embodied hardware intensity: 531 gCO2e/kWh.
Sensitivity & Uncertainty: Grid carbon intensities and end-user hardware types fluctuate by region. SWDM v4 standard guidelines recommend evaluating a ±20% sensitivity boundary around point estimates. Never treat single-run measurements as high-precision scientific certainty.`,
  },
  {
    id: "kb-gwf-green-hosting",
    title: "Green Web Foundation (GWF) Green Hosting Verification Methodology",
    topic: "methodology",
    sourceUrl: "https://developers.thegreenwebfoundation.org/co2js/overview/",
    version: "2026.1",
    lastVerified: "2026-09-05",
    tags: ["gwf", "green hosting", "renewables", "datacenter"],
    content: `Green Web Foundation verifies hosting providers based on verifiable renewable energy purchase agreements, Power Purchase Agreements (PPAs), and on-site generation.
Impact in SWDM v4:
Green hosting verification applies strictly to the Operational Data Center segment (15% of total system energy).
It does NOT eliminate emissions from Network transmission (14%), User devices (52%), or Hardware manufacturing (19%).
Therefore, switching to verified green hosting reduces total modeled emissions by up to ~15%, not 100%. Claims that green hosting creates 'zero carbon websites' violate digital accounting standards.`,
  },
  {
    id: "kb-responsive-images",
    title: "High-Impact Image Optimization: Modern Formats and Responsive Syntax",
    topic: "images",
    sourceUrl: "https://web.dev/learn/images/",
    version: "2026.2",
    lastVerified: "2026-09-05",
    tags: ["images", "webp", "avif", "picture", "srcset", "compression"],
    content: `Images typically represent 60-75% of total web page transfer bytes.
Key optimization principles:
1. Modern Codecs: Convert legacy uncompressed JPEG/PNG assets to WebP (typically 25-35% smaller at equivalent SSIM visual quality) or AVIF (up to 50% smaller).
2. Responsive Picture Elements: Never serve desktop 1920px hero images to mobile viewports. Use <picture> with srcset and sizes to deliver properly scaled dimensions.
3. Dimension constraints: Specify explicit width and height attributes to prevent Cumulative Layout Shift (CLS).
4. Native Lazy Loading: Apply loading="lazy" and decoding="async" to below-the-fold assets.
Crucial Task Preservation Guardrail: Image optimization must NEVER alter form input names, submit handlers, or interactive elements. Image optimization experiments must test the complete user journey to ensure functionality is fully preserved.`,
  },
  {
    id: "kb-script-deferral",
    title: "JavaScript Transfer Reduction and Execution Hydration Cost",
    topic: "scripts",
    sourceUrl: "https://web.dev/articles/optimizing-content-efficiency-javascript",
    version: "2026.1",
    lastVerified: "2026-09-05",
    tags: ["javascript", "defer", "bundle", "cpu", "hydration"],
    content: `JavaScript carries a dual carbon cost: byte transfer energy over the network, plus CPU processing and device battery depletion during parsing, compilation, and DOM hydration.
Deferral vs Reduction Invariant:
Marking a script with defer or async does NOT reduce total network transfer if that script still downloads during the user journey. It shifts execution timing to unblock the main thread.
True byte reduction requires:
- Removing unused libraries and dependencies.
- Code splitting dynamic routes.
- Replacing heavy client-side UI libraries with zero-runtime CSS or native HTML elements.`,
  },
  {
    id: "kb-fonts-caching",
    title: "Web Font Subsetting and HTTP Cache Control Best Practices",
    topic: "fonts",
    sourceUrl: "https://web.dev/learn/performance/font-performance",
    version: "2026.1",
    lastVerified: "2026-09-05",
    tags: ["fonts", "woff2", "subsetting", "caching", "cache-control"],
    content: `Font Optimization:
- Convert TTF/OTF to WOFF2 format (incorporates Brotli compression).
- Subset unicode glyph ranges (e.g. latin-only subsets save 60-80% compared to full international fonts).
- Use font-display: swap to prevent render blocking.
Caching Invariant:
HTTP caching (Cache-Control: public, max-age=31536000, immutable) reduces repeat-visit transfer to 0 bytes for static assets.
However, for first-time visitors or measured unprimed journeys, the full asset transfer is incurred. Single-journey measurements must document whether the cache was warm or cold.`,
  },
  {
    id: "kb-carbonerra-platform",
    title: "Carbonerra Architecture, Measurement Boundaries, and Savings Lab",
    topic: "platform",
    sourceUrl: "http://localhost:3001/api/methodology",
    version: "2.0.0",
    lastVerified: "2026-09-05",
    tags: ["carbonerra", "scanner", "savings lab", "receipt", "shield"],
    content: `Carbonerra platform features:
1. Public Scanner (POST /api/audit): Analyzes public URLs with SSRF protection, measuring resource breakdown and calculating SWDM v4 carbon score.
2. Savings Lab: Controlled engineering environment where candidate asset optimizations are tested against baselines across multiple physical browser journeys.
3. Task Preservation Guardrail: Savings Lab executes functional assertions (e.g., event registration form submission) on candidate pages. If a candidate breaks the core user task (HTTP 500 or form failure), it is strictly REJECTED, regardless of how many bytes it saves.
4. Release Shield Gate: Sets strict byte budgets (e.g. 350 KB ceiling). Commits breaching the ceiling are blocked.
5. Evidence Receipts: Cryptographically verifiable JSON and HTML artifacts recording exact run medians, deltas, and approval timestamps.`,
  },
];

/**
 * Local lexical keyword search over the curated knowledge corpus.
 * Returns relevant documents sorted by match score.
 */
export function searchKnowledge(
  query: string,
  limit: number = 3
): Array<KnowledgeDocument & { score: number; snippet: string }> {
  const terms = query
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);

  if (terms.length === 0) {
    return KNOWLEDGE_CORPUS.slice(0, limit).map((doc) => ({
      ...doc,
      score: 1,
      snippet: doc.content.slice(0, 200) + "...",
    }));
  }

  const scored = KNOWLEDGE_CORPUS.map((doc) => {
    let score = 0;
    const lowerTitle = doc.title.toLowerCase();
    const lowerContent = doc.content.toLowerCase();
    const lowerTags = doc.tags.join(" ").toLowerCase();

    for (const term of terms) {
      if (lowerTitle.includes(term)) score += 10;
      if (lowerTags.includes(term)) score += 6;
      const count = (lowerContent.match(new RegExp(term, "g")) || []).length;
      score += Math.min(count, 5) * 2;
    }

    // Extract best snippet
    let snippet = doc.content.slice(0, 220) + "...";
    for (const term of terms) {
      const idx = lowerContent.indexOf(term);
      if (idx !== -1) {
        const start = Math.max(0, idx - 40);
        const end = Math.min(doc.content.length, idx + 180);
        snippet = (start > 0 ? "..." : "") + doc.content.slice(start, end) + "...";
        break;
      }
    }

    return { ...doc, score, snippet };
  });

  return scored
    .filter((d) => d.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
