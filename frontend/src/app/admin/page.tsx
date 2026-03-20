"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, FileText, Users, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { listDocuments, listLeads, uploadDocument } from "@/lib/api";
import type { Document, Lead } from "@/types";

type UploadState = "idle" | "uploading" | "success" | "error";

export default function AdminPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activeTab, setActiveTab] = useState<"docs" | "leads">("docs");
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadMsg, setUploadMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listDocuments().then((d) => setDocuments(d.documents ?? []));
    listLeads().then((d) => setLeads(d.leads ?? []));
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadState("uploading");
    setUploadMsg("");

    try {
      const result = await uploadDocument(file);
      setUploadMsg(`Indexed "${file.name}" — ${result.chunks} chunks added`);
      setUploadState("success");
      listDocuments().then((d) => setDocuments(d.documents ?? []));
    } catch (err: unknown) {
      setUploadMsg(err instanceof Error ? err.message : "Upload failed");
      setUploadState("error");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f172a] text-slate-100 p-4 sm:p-8 pb-[env(safe-area-inset-bottom,16px)]">
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 mb-6 transition-colors"
        >
          <ArrowLeft size={14} /> Back to chat
        </Link>

        <h1 className="text-2xl font-bold mb-1">Admin Panel</h1>
        <p className="text-slate-400 text-sm mb-6">
          Upload documents and view captured leads.
        </p>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-800/60 rounded-xl p-1 mb-6 w-fit">
          {(["docs", "leads"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab === "docs" ? (
                <span className="flex items-center gap-2"><FileText size={14} /> Documents</span>
              ) : (
                <span className="flex items-center gap-2"><Users size={14} /> Leads ({leads.length})</span>
              )}
            </button>
          ))}
        </div>

        {/* Documents Tab */}
        {activeTab === "docs" && (
          <div className="space-y-4">
            {/* Upload */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
              <h2 className="text-sm font-semibold mb-3">Upload Document</h2>
              <p className="text-xs text-slate-400 mb-4">
                Add a PDF, TXT, or MD file. The agent will use it immediately.
              </p>

              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-600 rounded-xl p-6 cursor-pointer hover:border-indigo-500 transition-colors">
                <Upload size={20} className="text-slate-500" />
                <span className="text-sm text-slate-400">Click to select a file</span>
                <span className="text-xs text-slate-600">PDF · TXT · MD</span>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.txt,.md"
                  className="hidden"
                  onChange={handleUpload}
                />
              </label>

              {uploadState !== "idle" && (
                <div className={`flex items-center gap-2 mt-3 text-sm rounded-lg px-3 py-2 ${
                  uploadState === "uploading" ? "bg-slate-700/50 text-slate-300" :
                  uploadState === "success" ? "bg-emerald-900/30 text-emerald-400 border border-emerald-800/40" :
                  "bg-red-900/30 text-red-400 border border-red-800/40"
                }`}>
                  {uploadState === "uploading" && <Loader2 size={14} className="animate-spin" />}
                  {uploadState === "success" && <CheckCircle size={14} />}
                  {uploadState === "error" && <AlertCircle size={14} />}
                  {uploadState === "uploading" ? "Uploading and indexing…" : uploadMsg}
                </div>
              )}
            </div>

            {/* Document list */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-700">
                <h2 className="text-sm font-semibold">Indexed Documents ({documents.length})</h2>
              </div>
              {documents.length === 0 ? (
                <p className="text-slate-500 text-sm p-5">No documents found.</p>
              ) : (
                <ul className="divide-y divide-slate-700/50">
                  {documents.map((doc) => (
                    <li key={doc.name} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <FileText size={14} className="text-indigo-400 flex-shrink-0" />
                        <span className="text-sm text-slate-200">{doc.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          doc.type === "demo"
                            ? "bg-indigo-900/50 text-indigo-400"
                            : "bg-emerald-900/50 text-emerald-400"
                        }`}>
                          {doc.type}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">{doc.size_kb} KB</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Leads Tab */}
        {activeTab === "leads" && (
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-700">
              <h2 className="text-sm font-semibold">Captured Leads ({leads.length})</h2>
            </div>
            {leads.length === 0 ? (
              <p className="text-slate-500 text-sm p-5">
                No leads yet. Start a conversation to capture leads.
              </p>
            ) : (
              <ul className="divide-y divide-slate-700/50">
                {leads.map((lead, i) => (
                  <li key={i} className="px-5 py-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-100">{lead.name}</p>
                      <span className="text-[10px] bg-emerald-900/40 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                        {lead.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{lead.company}</p>
                    <p className="text-xs text-slate-500">Use case: {lead.use_case}</p>
                    <div className="flex flex-wrap gap-2 sm:gap-4 text-xs text-slate-600 pt-1">
                      <span>Budget: {lead.budget}</span>
                      <span>Timeline: {lead.timeline}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
