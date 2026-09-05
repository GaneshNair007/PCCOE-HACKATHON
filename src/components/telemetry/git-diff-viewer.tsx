import React from "react";
import { GitCommit, AlertTriangle } from "lucide-react";

interface GitDiffViewerProps {
  commitId: string;
  author: string;
  filePath: string;
  diffLines: { type: "remove" | "add" | "context"; text: string }[];
}

export function GitDiffViewer({
  commitId,
  author,
  filePath,
  diffLines,
}: GitDiffViewerProps) {
  return (
    <div className="rounded-2xl overflow-hidden border border-surface-border bg-forest-950 font-mono text-xs">
      <div className="bg-surface-elevated/80 px-4 py-2.5 border-b border-surface-border flex items-center justify-between text-sage">
        <div className="flex items-center gap-2">
          <GitCommit className="w-3.5 h-3.5 text-lime" />
          <span className="text-cream font-bold">{filePath}</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-lime">{commitId}</span>
          <span className="text-sage/60">by {author}</span>
        </div>
      </div>

      <div className="p-3 overflow-x-auto space-y-1">
        {diffLines.map((line, idx) => (
          <div
            key={idx}
            className={`px-3 py-1 rounded flex items-center gap-3 ${
              line.type === "remove"
                ? "bg-red-950/40 text-red-400 border-l-2 border-red-500"
                : line.type === "add"
                ? "bg-emerald-950/40 text-emerald-400 border-l-2 border-emerald-500"
                : "text-sage/70"
            }`}
          >
            <span className="select-none text-sage/40 w-4">
              {line.type === "remove" ? "-" : line.type === "add" ? "+" : " "}
            </span>
            <span className="whitespace-pre">{line.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
