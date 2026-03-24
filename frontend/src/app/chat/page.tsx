"use client";

import Link from "next/link";
import { Settings, Zap, ArrowLeft, BarChart2 } from "lucide-react";
import ChatWindow from "@/components/ChatWindow";

export default function HomePage() {
  return (
    <div className="flex flex-col h-[100dvh] bg-[#0A0E1A]">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-[#0A0E1A]/90 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Zap size={13} className="text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white tracking-tight">Vendrix</span>
            <span className="text-slate-700 text-xs">·</span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
              <span className="text-xs text-slate-400 font-medium">Cedd</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-200 transition-colors duration-200 px-2.5 py-1.5 rounded-lg hover:bg-slate-800/60 cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <Link
            href="/monitoring"
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-200 transition-colors duration-200 px-2.5 py-1.5 rounded-lg hover:bg-slate-800/60 cursor-pointer"
          >
            <BarChart2 size={13} />
            Monitoring
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-200 transition-colors duration-200 px-2.5 py-1.5 rounded-lg hover:bg-slate-800/60 cursor-pointer"
          >
            <Settings size={13} />
            Admin
          </Link>
        </div>
      </header>

      {/* Chat */}
      <main className="flex-1 overflow-hidden min-h-0">
        <ChatWindow />
      </main>
    </div>
  );
}
