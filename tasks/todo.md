# AI Sales Rep Agent — Build Plan

## Phase 3: Building

### Backend
- [ ] requirements.txt + .env.example
- [ ] main.py (FastAPI app + CORS + startup)
- [ ] rag/embedder.py (sentence-transformers all-MiniLM-L6-v2)
- [ ] rag/vectorstore.py (ChromaDB init + document loading)
- [ ] rag/retriever.py (similarity search)
- [ ] agent/tools.py (5 LangChain tools)
- [ ] agent/agent.py (LangChain tool-calling agent with Claude)
- [ ] routers/chat.py (SSE streaming endpoint)
- [ ] routers/documents.py (upload + list)
- [ ] routers/leads.py (lead capture list)

### Demo Documents (NexaFlow — B2B Workflow Automation SaaS)
- [ ] product_overview.md
- [ ] pricing.md
- [ ] faq.md
- [ ] competitor_comparison.md
- [ ] case_studies.md
- [ ] demo_booking.md

### Frontend (Next.js 14)
- [ ] package.json + config files
- [ ] src/types/index.ts
- [ ] src/lib/api.ts (SSE streaming + upload + leads)
- [ ] src/app/layout.tsx + globals.css
- [ ] src/app/page.tsx (main chat interface)
- [ ] src/components/ChatWindow.tsx
- [ ] src/components/MessageBubble.tsx
- [ ] src/components/ToolCallIndicator.tsx
- [ ] src/components/SourceCitations.tsx
- [ ] src/app/admin/page.tsx (doc upload + lead viewer)

## Phase 4: Polish
- [ ] Error handling + edge cases
- [ ] Mobile responsive check
- [ ] Loading states + streaming UX

## Phase 5: Handoff
- [ ] README with full setup + run instructions

---

## Review
_Added after completion_
