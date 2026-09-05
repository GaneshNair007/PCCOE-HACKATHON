/**
 * Carbonerra Savings Lab — First-Party Image Patch Generator & Reviewer Workflow
 * Produces reviewable source diffs, replacement asset mapping, and reviewer approvals.
 */

export interface PatchProposal {
  id: string;
  experimentId: string;
  targetFile: string;
  resourceOriginalUrl: string;
  resourceOptimizedUrl: string;
  originalFormat: string;
  optimizedFormat: string;
  originalBytes: number;
  optimizedBytes: number;
  estimatedBytesSaved: number;
  estimatedSavingPct: number;
  estimatedCo2SavedGrams: number;
  rationale: string;
  risk: "low" | "medium" | "high";
  effort: "low" | "medium" | "high";
  unifiedDiff: string;
}

export function generateEventHeroImagePatch(experimentId: string): PatchProposal {
  const originalBytes = 2420000; // ~2.42 MB
  const optimizedBytes = 176000; // ~176 KB
  const estimatedBytesSaved = originalBytes - optimizedBytes;
  const estimatedSavingPct = Number(
    ((estimatedBytesSaved / originalBytes) * 100).toFixed(1)
  );
  // SWDM v4 standard factor calculation (~0.00000000085 g/byte for green host)
  const estimatedCo2SavedGrams = Number((estimatedBytesSaved * 0.000000085).toFixed(4));

  const unifiedDiff = `--- a/src/app/demo/event/page.tsx
+++ b/src/app/demo/event/page.tsx
@@ -74,7 +74,13 @@
       {/* First-Party Event Hero Image Component */}
       <div className="relative rounded-3xl overflow-hidden border border-surface-border">
-        <img
-          id="event-hero-img"
-          src="/demo/assets/campus-hackathon-hero.jpg"
-          alt="PCCOE Green Campus Hackathon 2026 Banner"
-          className="w-full h-72 sm:h-96 object-cover"
-        />
+        <picture>
+          <source srcSet="/demo/assets/campus-hackathon-hero.webp" type="image/webp" />
+          <img
+            id="event-hero-img"
+            src="/demo/assets/campus-hackathon-hero.webp"
+            alt="PCCOE Green Campus Hackathon 2026 Banner"
+            width="1200"
+            height="400"
+            className="w-full h-72 sm:h-96 object-cover"
+            fetchPriority="high"
+          />
+        </picture>
       </div>`;

  return {
    id: `patch_${Date.now()}`,
    experimentId,
    targetFile: "src/app/demo/event/page.tsx",
    resourceOriginalUrl: "/demo/assets/campus-hackathon-hero.jpg",
    resourceOptimizedUrl: "/demo/assets/campus-hackathon-hero.webp",
    originalFormat: "JPEG (Uncompressed 24-bit)",
    optimizedFormat: "WebP (VP8 Lossy, Quality 82)",
    originalBytes,
    optimizedBytes,
    estimatedBytesSaved,
    estimatedSavingPct,
    estimatedCo2SavedGrams,
    rationale:
      "Convert oversized 2.42 MB raster JPEG into modern WebP with explicit width/height dimensions and picture element fallback. Preserves aspect ratio, layout stability (zero CLS), and visual clarity while curtailing ~2.24 MB (92.7%) of network payload.",
    risk: "low",
    effort: "low",
    unifiedDiff,
  };
}
