import type { StreamEvent } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function* streamChat(
  message: string,
  history: Array<{ role: string; content: string }>
): AsyncGenerator<StreamEvent> {
  const response = await fetch(`${API_BASE}/api/chat/test-stream`, {
    method: "GET",
  });
  if (!response.ok || !response.body) throw new Error("Chat request failed");
  const reader2 = response.body.getReader();
  const decoder2 = new TextDecoder();
  let buf2 = "";
  while (true) {
    const { done, value } = await reader2.read();
    if (done) break;
    buf2 += decoder2.decode(value, { stream: true });
    const lines2 = buf2.split("\n").map((l) => l.replace(/\r$/, ""));
    buf2 = lines2.pop() ?? "";
    for (const line of lines2) {
      if (line.startsWith("data: ")) {
        try { yield JSON.parse(line.slice(6)) as StreamEvent; } catch { /* skip */ }
      }
    }
  }
  return;
  // eslint-disable-next-line no-unreachable
  const response2 = await fetch(`${API_BASE}/api/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });

  if (!response.ok || !response.body) {
    throw new Error("Chat request failed");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n").map((l) => l.replace(/\r$/, ""));
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          yield JSON.parse(line.slice(6)) as StreamEvent;
        } catch {
          // malformed SSE line — skip
        }
      }
    }
  }
}

export async function uploadDocument(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/api/documents/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function listDocuments() {
  const res = await fetch(`${API_BASE}/api/documents/list`);
  return res.json();
}

export async function listLeads() {
  const res = await fetch(`${API_BASE}/api/leads/`);
  return res.json();
}
