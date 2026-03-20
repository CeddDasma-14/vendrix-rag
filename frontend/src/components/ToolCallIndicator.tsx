"use client";

import { Search, UserCheck, ShieldCheck, CalendarCheck, UserCog } from "lucide-react";

const TOOL_CONFIG: Record<string, { label: string; Icon: React.ElementType; color: string }> = {
  search_knowledge_base: { label: "Searching knowledge base", Icon: Search, color: "text-indigo-400" },
  qualify_lead:          { label: "Saving lead",              Icon: UserCheck, color: "text-emerald-400" },
  handle_objection:      { label: "Loading objection data",   Icon: ShieldCheck, color: "text-amber-400" },
  book_demo:             { label: "Booking demo",             Icon: CalendarCheck, color: "text-sky-400" },
  escalate_to_human:     { label: "Escalating to specialist", Icon: UserCog, color: "text-violet-400" },
};

export default function ToolCallIndicator({ tool }: { tool: string }) {
  const config = TOOL_CONFIG[tool];
  const label = config?.label ?? tool.replace(/_/g, " ");
  const Icon = config?.Icon ?? Search;
  const color = config?.color ?? "text-indigo-400";

  return (
    <div className="flex items-center gap-2 text-xs bg-[#131929] border border-indigo-900/40 rounded-lg px-3 py-1.5 w-fit my-0.5 cursor-default">
      <Icon size={12} className={color} />
      <span className="text-slate-400">{label}</span>
      <span className="flex gap-0.5">
        <span className="dot-1 w-1 h-1 rounded-full bg-indigo-500 inline-block" />
        <span className="dot-2 w-1 h-1 rounded-full bg-indigo-500 inline-block" />
        <span className="dot-3 w-1 h-1 rounded-full bg-indigo-500 inline-block" />
      </span>
    </div>
  );
}
