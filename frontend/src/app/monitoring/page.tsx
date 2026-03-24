"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, RefreshCw, MessageSquare, Clock, CheckCircle,
  AlertTriangle, Star, Wrench, FlaskConical, TrendingUp,
} from "lucide-react";
import { getMonitoringStats } from "@/lib/api";

interface LogEntry {
  timestamp: string;
  user_message: string;
  agent_response: string;
  tool_calls: string;
  response_time_ms: number;
  success: number;
  prompt_version: string;
  relevance: number | null;
  accuracy: number | null;
  hallucination: number | null;
  completeness: number | null;
}

interface ABStat {
  prompt_version: string;
  count: number;
  avg_relevance: number | null;
  avg_accuracy: number | null;
  avg_completeness: number | null;
  avg_latency_ms: number | null;
  hallucination_rate: number | null;
}

interface TopTool { tool: string; count: number; }
interface TopQuery { user_message: string; count: number; }

interface Stats {
  total_queries: number;
  success_rate: number;
  avg_latency_ms: number;
  avg_relevance: number | null;
  avg_accuracy: number | null;
  avg_completeness: number | null;
  hallucination_rate: number;
  ab_stats: ABStat[];
  top_tools: TopTool[];
  top_queries: TopQuery[];
  recent_logs: LogEntry[];
}

function StatCard({ icon, label, value, color = "indigo" }: {
  icon: React.ReactNode; label: string; value: string | number;
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
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number | null }) {
  const pct = value ? (value / 5) * 100 : 0;
  const color = !value ? "bg-slate-700" : pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-500" : "bg-red-500";
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

function ABCard({ stat }: { stat: ABStat }) {
  const isA = stat.prompt_version === "A";
  const avg = stat.avg_relevance && stat.avg_accuracy && stat.avg_completeness
    ? ((stat.avg_relevance + stat.avg_accuracy + stat.avg_completeness) / 3).toFixed(2)
    : null;
  return (
    <div className={`rounded-xl border p-4 ${isA ? "border-indigo-700/50 bg-indigo-900/10" : "border-violet-700/50 bg-violet-900/10"}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isA ? "bg-indigo-600 text-white" : "bg-violet-600 text-white"}`}>
            Prompt {stat.prompt_version}
          </span>
          <span className="text-xs text-slate-500">{stat.count} queries</span>
        </div>
        {avg && <span className="text-sm font-bold text-slate-200">{avg}<span className="text-xs text-slate-500">/5</span></span>}
      </div>
      <p className="text-[11px] text-slate-500 mb-3">
        {isA ? "Consultative & warm — builds rapport" : "Direct & data-first — leads with ROI"}
      </p>
      <div className="space-y-2">
        <ScoreBar label="Relevance" value={stat.avg_relevance} />
        <ScoreBar label="Accuracy" value={stat.avg_accuracy} />
        <ScoreBar label="Completeness" value={stat.avg_completeness} />
      </div>
      <div className="flex justify-between mt-3 text-[11px] text-slate-500">
        <span>Latency: {stat.avg_latency_ms ? `${(stat.avg_latency_ms / 1000).toFixed(1)}s` : "—"}</span>
        <span>Hallucination: {stat.hallucination_rate ?? 0}%</span>
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
    } catch { /* silent */ }
    finally { setLoading(false); setRefreshing(false); }
  }

  useEffect(() => {
    load();
    const interval = setInterval(() => load(), 30000);
    return () => clearInterval(interval);
  }, []);

  const maxToolCount = stats?.top_tools[0]?.count ?? 1;

  return (
    <div className="min-h-[100dvh] bg-[#0f172a] text-slate-100 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 mb-3 transition-colors">
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
          <div className="flex items-center justify-center h-48 text-slate-500">Loading stats…</div>
        ) : !stats ? (
          <div className="text-slate-500 text-sm">Could not load stats. Is the backend running?</div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <StatCard icon={<MessageSquare size={18} />} label="Total Queries" value={stats.total_queries} color="indigo" />
              <StatCard icon={<CheckCircle size={18} />} label="Success Rate" value={`${stats.success_rate ?? 0}%`} color="emerald" />
              <StatCard icon={<Clock size={18} />} label="Avg Latency" value={`${((stats.avg_latency_ms ?? 0) / 1000).toFixed(1)}s`} color="amber" />
              <StatCard icon={<AlertTriangle size={18} />} label="Hallucination Rate" value={`${stats.hallucination_rate ?? 0}%`} color={stats.hallucination_rate > 10 ? "red" : "emerald"} />
            </div>

            {/* Quality + A/B row */}
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {/* Quality scores */}
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Star size={15} className="text-indigo-400" />
                  <h2 className="text-sm font-semibold">Avg Quality Scores</h2>
                  <span className="text-xs text-slate-500 ml-auto">Claude-evaluated · 1–5</span>
                </div>
                <div className="space-y-3">
                  <ScoreBar label="Relevance" value={stats.avg_relevance} />
                  <ScoreBar label="Accuracy" value={stats.avg_accuracy} />
                  <ScoreBar label="Completeness" value={stats.avg_completeness} />
                </div>
              </div>

              {/* A/B test */}
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <FlaskConical size={15} className="text-violet-400" />
                  <h2 className="text-sm font-semibold">A/B Prompt Test</h2>
                  <span className="text-xs text-slate-500 ml-auto">50/50 random split</span>
                </div>
                {stats.ab_stats.length === 0 ? (
                  <p className="text-slate-500 text-sm">No data yet — send more messages.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {["A", "B"].map((v) => {
                      const s = stats.ab_stats.find((x) => x.prompt_version === v);
                      return s ? <ABCard key={v} stat={s} /> : (
                        <div key={v} className="rounded-xl border border-slate-700 p-4 text-slate-500 text-xs">
                          Prompt {v} — no data yet
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Top tools + Top queries row */}
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {/* Top tools */}
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Wrench size={15} className="text-amber-400" />
                  <h2 className="text-sm font-semibold">Tool Usage</h2>
                </div>
                {stats.top_tools.length === 0 ? (
                  <p className="text-slate-500 text-sm">No tool calls yet.</p>
                ) : (
                  <div className="space-y-3">
                    {stats.top_tools.map(({ tool, count }) => (
                      <div key={tool}>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>{tool.replace(/_/g, " ")}</span>
                          <span>{count}×</span>
                        </div>
                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${(count / maxToolCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top queries */}
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={15} className="text-emerald-400" />
                  <h2 className="text-sm font-semibold">Top Queries</h2>
                </div>
                {stats.top_queries.length === 0 ? (
                  <p className="text-slate-500 text-sm">No queries yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {stats.top_queries.map(({ user_message, count }, i) => (
                      <li key={i} className="flex items-start justify-between gap-3">
                        <span className="text-xs text-slate-300 truncate flex-1">{user_message}</span>
                        {count > 1 && (
                          <span className="text-[10px] bg-emerald-900/40 text-emerald-400 px-1.5 py-0.5 rounded-full flex-shrink-0">
                            {count}×
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Recent logs */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-700 flex items-center gap-2">
                <MessageSquare size={14} className="text-slate-400" />
                <h2 className="text-sm font-semibold">Recent Conversations</h2>
                <span className="text-xs text-slate-500 ml-auto">Last 20</span>
              </div>
              {stats.recent_logs.length === 0 ? (
                <p className="text-slate-500 text-sm p-5">No logs yet.</p>
              ) : (
                <div className="divide-y divide-slate-700/50">
                  {stats.recent_logs.map((log, i) => {
                    const tools = (() => { try { return JSON.parse(log.tool_calls) as string[]; } catch { return []; } })();
                    return (
                      <div key={i} className="px-5 py-4">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <p className="text-sm font-medium text-slate-200 truncate flex-1">{log.user_message}</p>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${log.prompt_version === "A" ? "bg-indigo-900/50 text-indigo-400" : "bg-violet-900/50 text-violet-400"}`}>
                              {log.prompt_version}
                            </span>
                            {log.response_time_ms && <span className="text-[11px] text-slate-500">{(log.response_time_ms / 1000).toFixed(1)}s</span>}
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${log.success ? "bg-emerald-900/40 text-emerald-400" : "bg-red-900/40 text-red-400"}`}>
                              {log.success ? "ok" : "err"}
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
                              {log.hallucination ? <span className="text-red-400">halluc!</span> : null}
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
