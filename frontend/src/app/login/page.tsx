"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Lock, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/chat");
      router.refresh();
    } else {
      setError("Incorrect password.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#0A0E1A] flex items-center justify-center px-4">
      {/* Subtle background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo mark */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-indigo-500/25">
            <Zap size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Vendrix</h1>
          <p className="text-sm text-slate-400 mt-1.5">AI Sales Agent · Demo Access</p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#131929] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl"
        >
          {/* Input */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-2">
              <Lock size={12} className="text-indigo-400" />
              Demo password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoFocus
              className={clsx(
                "w-full bg-[#0A0E1A] border rounded-xl px-4 py-3 text-sm text-slate-100",
                "placeholder-slate-600 outline-none transition-all duration-200",
                error
                  ? "border-red-500/60 focus:border-red-500"
                  : "border-slate-700 focus:border-indigo-500/70"
              )}
            />
            {error && (
              <p className="text-xs text-red-400 pt-0.5">{error}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!password || loading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-sm font-semibold py-3 rounded-xl transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 size={15} className="animate-spin" /> Verifying…</>
            ) : (
              <>Access Demo <ArrowRight size={15} /></>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-700 mt-5">
          Built with Claude + RAG · Portfolio Demo
        </p>
      </div>
    </div>
  );
}

function clsx(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
