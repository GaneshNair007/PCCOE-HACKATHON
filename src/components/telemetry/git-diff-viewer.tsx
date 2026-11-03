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
        <div className="flex items-center gap-2 text-xs">
          <span className="text-lime">{commitId}</span>
          <span className="text-sage/80">by {author}</span>
        </div>
      </div>

      <div className="p-3 overflow-x-auto space-y-1">
        {diffLines.map((line, idx) => (
          <div
            key={idx}
            className={`px-3 py-1 rounded flex items-center gap-3 ${
              line.type === "remove"
                ? "bg-white/5 text-white/50 border-l-2 border-white/20"
                : line.type === "add"
                ? "bg-[#cbff00]/10 text-[#cbff00] border-l-2 border-[#cbff00]"
                : "text-white/70"
            }`}
          >
            <span className="select-none text-sage/75 w-4">
              {line.type === "remove" ? "-" : line.type === "add" ? "+" : " "}
            </span>
            <span className="whitespace-pre">{line.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
