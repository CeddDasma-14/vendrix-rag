"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2 } from "lucide-react";
import clsx from "clsx";
import type { Message } from "@/types";
import { streamChat } from "@/lib/api";
import MessageBubble from "./MessageBubble";

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I'm Cedd, your Vendrix sales specialist. I'm here to help you find out if Vendrix is the right fit for your team.\n\nTo start — what does your company do, and what kind of processes are you currently handling manually?",
  timestamp: new Date(),
};

const SUGGESTIONS = [
  "What does Vendrix do?",
  "How much does it cost?",
  "Compare to Zapier",
  "Show me a case study",
  "Book a demo",
];

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isOnlyWelcome = messages.length === 1;
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [input]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const assistantId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        role: "assistant",
        content: "",
        toolCalls: [],
        sources: [],
        timestamp: new Date(),
      },
    ]);

    try {
      const history = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      for await (const event of streamChat(text, history)) {
        if (event.type === "tool_call" && event.tool) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, toolCalls: [...(m.toolCalls ?? []), event.tool!] }
                : m
            )
          );
        } else if (event.type === "token" && event.content) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: m.content + event.content }
                : m
            )
          );
        } else if (event.type === "sources" && event.sources) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, sources: event.sources } : m
            )
          );
        } else if (event.type === "error") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: "Sorry, something went wrong. Please try again." }
                : m
            )
          );
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Connection error. Is the backend running?" }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const streamingId = isLoading ? messages[messages.length - 1]?.id : null;

  return (
    <div className="flex flex-col h-full">
      {/* Messages — scrollable, centered */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isStreaming={msg.id === streamingId && msg.role === "assistant"}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Bottom bar — centered, floating style */}
      <div className="flex-shrink-0 px-4 pb-4 pt-2">
        <div className="max-w-2xl mx-auto space-y-2">
          {/* Suggestion chips */}
          {isOnlyWelcome && !isLoading && (
            <div className="flex flex-wrap gap-1.5 justify-center">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => { setInput(s); inputRef.current?.focus(); }}
                  className="text-xs px-3 py-1.5 rounded-full border border-slate-700 bg-slate-800/80 text-slate-300 hover:border-indigo-500 hover:text-indigo-300 transition-all active:scale-95"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input box */}
          <div className="flex items-end gap-2 bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 focus-within:border-indigo-500/70 focus-within:bg-slate-800 transition-all shadow-lg shadow-black/20">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about pricing, features, or book a demo…"
              rows={1}
              disabled={isLoading}
              className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 resize-none outline-none leading-relaxed"
              style={{ minHeight: "20px", maxHeight: "120px" }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || isLoading}
              className={clsx(
                "p-1.5 rounded-xl transition-all flex-shrink-0 touch-manipulation",
                input.trim() && !isLoading
                  ? "bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95"
                  : "text-slate-600 cursor-not-allowed"
              )}
            >
              {isLoading
                ? <Loader2 size={16} className="animate-spin" />
                : <Send size={16} />
              }
            </button>
          </div>

          <p className="text-center text-[10px] text-slate-600">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
