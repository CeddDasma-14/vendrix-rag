export interface Source {
  title: string;
  source: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  toolCalls?: string[];
  timestamp: Date;
}

export interface Lead {
  name: string;
  company: string;
  use_case: string;
  budget: string;
  timeline: string;
  status: string;
}

export interface Document {
  name: string;
  type: "demo" | "uploaded";
  size_kb: number;
}

export interface StreamEvent {
  type: "tool_call" | "token" | "sources" | "done" | "error";
  tool?: string;
  content?: string;
  sources?: Source[];
}
