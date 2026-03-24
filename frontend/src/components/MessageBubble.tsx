"use client";

import clsx from "clsx";
import ReactMarkdownBase from "react-markdown";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReactMarkdown = ReactMarkdownBase as any;
import remarkGfm from "remark-gfm";
import { BookOpen } from "lucide-react";
import type { Message } from "@/types";
import ToolCallIndicator from "./ToolCallIndicator";
import SourceCitations from "./SourceCitations";

interface Props {
  message: Message;
  isStreaming?: boolean;
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 h-5 px-1">
      <span className="dot-1 w-2 h-2 rounded-full bg-indigo-500 inline-block" />
      <span className="dot-2 w-2 h-2 rounded-full bg-indigo-500 inline-block" />
      <span className="dot-3 w-2 h-2 rounded-full bg-indigo-500 inline-block" />
    </div>
  );
}

function AIAvatar() {
  return (
    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg shadow-indigo-500/20">
      <span className="text-[10px] font-bold text-white tracking-wide">C</span>
    </div>
  );
}

function UserAvatar() {
  return (
    <div className="w-8 h-8 rounded-xl bg-slate-700 border border-slate-600 flex items-center justify-center flex-shrink-0 mt-0.5">
      <span className="text-[10px] font-semibold text-slate-300">You</span>
    </div>
  );
}

export default function MessageBubble({ message, isStreaming }: Props) {
  const isUser = message.role === "user";
  const isEmpty = !message.content && isStreaming;

  return (
    <div className={clsx("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      {isUser ? <UserAvatar /> : <AIAvatar />}

      <div className={clsx(
        "max-w-[82%] sm:max-w-[75%] flex flex-col gap-1",
        isUser ? "items-end" : "items-start"
      )}>
        {/* Tool call indicators */}
        {!isUser && message.toolCalls?.map((tool) => (
          <ToolCallIndicator key={tool} tool={tool} />
        ))}

        {/* Message bubble */}
        {isUser ? (
          <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm leading-relaxed">
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          </div>
        ) : (
          /* AI message — context card style with left accent border */
          <div className={clsx(
            "rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed",
            "bg-[#131929] border border-slate-800/80 border-l-2 border-l-indigo-500/70",
            "shadow-sm"
          )}>
            {isEmpty ? (
              <TypingDots />
            ) : (
              <div className={clsx("chat-markdown break-words text-slate-200", isStreaming && "cursor-blink")}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
              </div>
            )}

            {message.sources && message.sources.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-slate-700/50">
                <div className="flex items-center gap-1.5 mb-2">
                  <BookOpen size={10} className="text-indigo-400" />
                  <span className="text-[10px] uppercase tracking-widest text-slate-500 font-medium">Sources</span>
                </div>
                <SourceCitations sources={message.sources} />
              </div>
            )}
          </div>
        )}

        <span className="text-[10px] text-slate-600 px-1">
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}
