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

from routers import chat, documents, leads, monitoring
from rag.vectorstore import initialize_vectorstore
from monitoring.logger import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    await initialize_vectorstore()
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
app.include_router(monitoring.router, prefix="/api/monitoring", tags=["monitoring"])


@app.get("/health")
def health():
    return {"status": "ok"}
