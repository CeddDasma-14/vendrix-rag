# AI Sales Rep Agent — NexaFlow Demo

A portfolio-grade RAG + AI Agent system. An AI sales representative that answers product
questions, handles objections, qualifies leads, and books demos — powered by Claude + LangChain + ChromaDB.

---

## Architecture

```
frontend/   → Next.js 14 chat UI (streaming SSE)
backend/    → FastAPI + LangChain agent + ChromaDB RAG
```

**Stack:**
- **LLM:** Claude claude-sonnet-4-6 (Anthropic)
- **Embeddings:** sentence-transformers `all-MiniLM-L6-v2` (free, local)
- **Vector DB:** ChromaDB (local, no account needed)
- **Agent:** LangChain tool-calling agent with 5 tools
- **Streaming:** Server-Sent Events (SSE)

**Agent Tools:**
| Tool | What it does |
|------|-------------|
| `search_knowledge_base` | RAG search across all indexed documents |
| `qualify_lead` | Captures and saves prospect information |
| `handle_objection` | Retrieves competitor/ROI data to address objections |
| `book_demo` | Simulates scheduling a product demo |
| `escalate_to_human` | Hands off complex deals to a specialist |

---

## Setup

### 1. Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set your API key
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Run the server
uvicorn main:app --reload --port 8000
```

The first run will download the sentence-transformers model (~80 MB) and build the ChromaDB
index from the 6 demo documents. This takes about 60–90 seconds. Subsequent starts are instant.

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Set environment (optional — defaults to localhost:8000)
cp .env.local.example .env.local

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Usage

### Chat (localhost:3000)
- Talk to Alex, the AI sales agent
- Ask about pricing, features, competitors, or use cases
- Watch tool calls appear in real time as the agent searches and reasons
- Sources are cited below each answer

### Admin Panel (localhost:3000/admin)
- **Documents tab:** Upload your own PDF/MD/TXT files to replace or extend the demo content
- **Leads tab:** View all leads the agent has captured during conversations

---

## Customising for a Real Company

1. Replace the files in `backend/data/demo_docs/` with your actual product documentation
2. Delete `backend/chroma_db/` so the index rebuilds from your new docs
3. Update `SYSTEM_PROMPT` in `backend/agent/agent.py` with your company name and tone
4. Restart the backend

---

## Switching to OpenAI Embeddings (optional)

When you're ready to upgrade from sentence-transformers:

1. Add `OPENAI_API_KEY` to `backend/.env`
2. Add `langchain-openai` to `requirements.txt` and `pip install` it
3. In `backend/rag/embedder.py`, replace:
   ```python
   from langchain_community.embeddings import HuggingFaceEmbeddings
   # ...model_name="all-MiniLM-L6-v2"...
   ```
   with:
   ```python
   from langchain_openai import OpenAIEmbeddings
   def get_embedder():
       return OpenAIEmbeddings(model="text-embedding-3-small")
   ```
4. Delete `backend/chroma_db/` and restart

---

## Project Structure

```
RAG SAMPLE SYSTEM/
├── CLAUDE.md
├── README.md
├── tasks/
│   ├── todo.md
│   ├── lessons.md
│   └── token-efficiency.md
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── rag/
│   │   ├── embedder.py       ← sentence-transformers
│   │   ├── vectorstore.py    ← ChromaDB init + doc loading
│   │   └── retriever.py      ← similarity search
│   ├── agent/
│   │   ├── tools.py          ← 5 LangChain tools
│   │   └── agent.py          ← Claude tool-calling agent
│   ├── routers/
│   │   ├── chat.py           ← SSE streaming endpoint
│   │   ├── documents.py      ← upload + list
│   │   └── leads.py          ← lead viewer
│   └── data/
│       └── demo_docs/        ← 6 NexaFlow B2B documents
└── frontend/
    ├── package.json
    └── src/
        ├── app/
        │   ├── page.tsx           ← main chat UI
        │   └── admin/page.tsx     ← admin panel
        ├── components/
        │   ├── ChatWindow.tsx
        │   ├── MessageBubble.tsx
        │   ├── ToolCallIndicator.tsx
        │   └── SourceCitations.tsx
        ├── lib/api.ts             ← SSE client + API calls
        └── types/index.ts
```

---

## Version 2 Ideas

- Persistent lead storage (PostgreSQL / Supabase)
- Auth for the admin panel (Clerk)
- Multi-company mode (separate vector namespaces per company)
- Real calendar booking (Calendly API)
- Conversation history persisted to DB
- Switch embeddings to OpenAI text-embedding-3-small
- Deploy: Railway (backend) + Vercel (frontend)
