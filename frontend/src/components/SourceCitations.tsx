"use client";

import { FileText } from "lucide-react";
import type { Source } from "@/types";

export default function SourceCitations({ sources }: { sources: Source[] }) {
  if (!sources.length) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {sources.map((s) => (
        <span
          key={s.source}
          className="inline-flex items-center gap-1.5 text-[11px] bg-slate-800/80 border border-slate-700/60 rounded-md px-2 py-1 text-slate-400 font-medium cursor-default hover:border-indigo-500/40 hover:text-slate-300 transition-colors duration-200"
        >
          <FileText size={10} className="text-indigo-400 flex-shrink-0" />
          {s.title}
        </span>
      ))}
    </div>
  );
}
