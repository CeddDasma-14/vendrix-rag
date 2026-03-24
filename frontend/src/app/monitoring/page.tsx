"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCw,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
  Wrench,
} from "lucide-react";
import { getMonitoringStats } from "@/lib/api";

interface LogEntry {
  timestamp: string;
  user_message: string;
  agent_response: string;
  tool_calls: string;
  response_time_ms: number;
  success: number;
  relevance: number | null;
  accuracy: number | null;
  hallucination: number | null;
  completeness: number | null;
}

interface Stats {
  total_queries: number;
  success_rate: number;
  avg_latency_ms: number;
  avg_relevance: number | null;
  avg_accuracy: number | null;
  avg_completeness: number | null;
  hallucination_rate: number;
  recent_logs: LogEntry[];
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color = "indigo",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color?: "indigo" | "emerald" | "amber" | "red";
}) {
  const colors = {
    indigo: "bg-indigo-500/10 text-indigo-400",
    emerald: "bg-emerald-500/10 text-emerald-400",
    amber: "bg-amber-500/10 text-amber-400",
    red: "bg-red-500/10 text-red-400",
  };
  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-100">{value}</p>
      <p className="text-sm text-slate-400 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-600 mt-1">{sub}</p>}
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number | null }) {
  const pct = value ? (value / 5) * 100 : 0;
  const color =
    !value ? "bg-slate-700" :
    pct >= 80 ? "bg-emerald-500" :
    pct >= 60 ? "bg-amber-500" : "bg-red-500";

  return (
    <div>
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        <span>{label}</span>
        <span>{value ? `${value}/5` : "—"}</span>
      </div>
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function MonitoringPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load(showRefresh = false) {
    if (showRefresh) setRefreshing(true);
    try {
      const data = await getMonitoringStats();
      setStats(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(() => load(), 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[100dvh] bg-[#0f172a] text-slate-100 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 mb-3 transition-colors"
            >
              <ArrowLeft size={14} /> Back to chat
            </Link>
            <h1 className="text-2xl font-bold">LLMOps Dashboard</h1>
            <p className="text-slate-400 text-sm mt-0.5">Real-time monitoring for Vendrix AI</p>
          </div>
          <button
            onClick={() => load(true)}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg transition-all hover:border-slate-600"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48 text-slate-500">
            Loading stats…
          </div>
        ) : !stats ? (
          <div className="text-slate-500 text-sm">Could not load stats. Is the backend running?</div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <StatCard
                icon={<MessageSquare size={18} />}
                label="Total Queries"
                value={stats.total_queries}
                color="indigo"
              />
              <StatCard
                icon={<CheckCircle size={18} />}
                label="Success Rate"
                value={`${stats.success_rate ?? 0}%`}
                color="emerald"
              />
              <StatCard
                icon={<Clock size={18} />}
                label="Avg Latency"
                value={`${((stats.avg_latency_ms ?? 0) / 1000).toFixed(1)}s`}
                color="amber"
              />
              <StatCard
                icon={<AlertTriangle size={18} />}
                label="Hallucination Rate"
                value={`${stats.hallucination_rate ?? 0}%`}
                color={stats.hallucination_rate > 10 ? "red" : "emerald"}
              />
            </div>

            {/* Quality scores */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Star size={15} className="text-indigo-400" />
                <h2 className="text-sm font-semibold">Avg Quality Scores</h2>
                <span className="text-xs text-slate-500 ml-auto">Claude-evaluated · 1–5 scale</span>
              </div>
              <div className="space-y-3">
                <ScoreBar label="Relevance" value={stats.avg_relevance} />
                <ScoreBar label="Accuracy" value={stats.avg_accuracy} />
                <ScoreBar label="Completeness" value={stats.avg_completeness} />
              </div>
            </div>

            {/* Recent logs */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-700 flex items-center gap-2">
                <Wrench size={14} className="text-slate-400" />
                <h2 className="text-sm font-semibold">Recent Conversations</h2>
                <span className="text-xs text-slate-500 ml-auto">Last 20</span>
              </div>

              {stats.recent_logs.length === 0 ? (
                <p className="text-slate-500 text-sm p-5">No logs yet. Send a chat message to start tracking.</p>
              ) : (
                <div className="divide-y divide-slate-700/50">
                  {stats.recent_logs.map((log, i) => {
                    const tools = (() => {
                      try { return JSON.parse(log.tool_calls) as string[]; }
                      catch { return []; }
                    })();
                    return (
                      <div key={i} className="px-5 py-4">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <p className="text-sm font-medium text-slate-200 truncate flex-1">
                            {log.user_message}
                          </p>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {log.response_time_ms && (
                              <span className="text-[11px] text-slate-500">
                                {(log.response_time_ms / 1000).toFixed(1)}s
                              </span>
                            )}
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                              log.success
                                ? "bg-emerald-900/40 text-emerald-400"
                                : "bg-red-900/40 text-red-400"
                            }`}>
                              {log.success ? "ok" : "error"}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 mb-2">{log.agent_response}</p>
                        <div className="flex items-center gap-3 flex-wrap">
                          {tools.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              {tools.map((t) => (
                                <span key={t} className="text-[10px] bg-indigo-900/30 text-indigo-400 border border-indigo-800/30 px-1.5 py-0.5 rounded-full">
                                  {t.replace(/_/g, " ")}
                                </span>
                              ))}
                            </div>
                          )}
                          {log.relevance !== null && (
                            <div className="flex gap-2 text-[11px] text-slate-500 ml-auto">
                              <span>R:{log.relevance}</span>
                              <span>A:{log.accuracy}</span>
                              <span>C:{log.completeness}</span>
                              {log.hallucination ? (
                                <span className="text-red-400">halluc!</span>
                              ) : null}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
