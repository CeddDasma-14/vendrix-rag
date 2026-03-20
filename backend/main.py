import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from routers import chat, documents, leads
from rag.vectorstore import initialize_vectorstore


@asynccontextmanager
async def lifespan(app: FastAPI):
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


@app.get("/health")
def health():
    return {"status": "ok"}
