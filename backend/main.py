import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

# LangSmith tracing — enabled when LANGCHAIN_API_KEY is set
if os.getenv("LANGCHAIN_API_KEY"):
    os.environ.setdefault("LANGCHAIN_TRACING_V2", "true")
    os.environ.setdefault("LANGCHAIN_PROJECT", "vendrix-rag")
    print(f"[LangSmith] Tracing ON — project: {os.getenv('LANGCHAIN_PROJECT')}, key: {os.getenv('LANGCHAIN_API_KEY')[:12]}...")
else:
    print("[LangSmith] LANGCHAIN_API_KEY not set — tracing disabled")

from routers import chat, documents, leads
from rag.vectorstore import initialize_vectorstore


@asynccontextmanager
async def lifespan(app: FastAPI):
    await initialize_vectorstore()
    # Test LangSmith connectivity
    if os.getenv("LANGCHAIN_API_KEY"):
        try:
            import httpx
            r = httpx.get(
                "https://api.smith.langchain.com/api/v1/workspaces",
                headers={"x-api-key": os.getenv("LANGCHAIN_API_KEY")},
                timeout=10,
            )
            print(f"[LangSmith] Workspaces API: {r.status_code} — {r.text[:300]}")
        except Exception as e:
            print(f"[LangSmith] Connection failed: {e}")
    yield


app = FastAPI(
    title="AI Sales Agent API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(leads.router, prefix="/api/leads", tags=["leads"])


@app.get("/health")
def health():
    return {"status": "ok"}
