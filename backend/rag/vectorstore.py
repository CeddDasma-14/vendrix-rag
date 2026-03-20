import os
from pathlib import Path
from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from rag.embedder import get_embedder

FAISS_PATH = "./faiss_db"
DEMO_DOCS_PATH = "./data/demo_docs"

_vectorstore: FAISS | None = None


async def initialize_vectorstore() -> None:
    global _vectorstore
    embedder = get_embedder()

    # Reuse existing index if already built
    if os.path.exists(FAISS_PATH):
        _vectorstore = FAISS.load_local(
            FAISS_PATH,
            embedder,
            allow_dangerous_deserialization=True,
        )
        print(f"[VectorStore] Loaded existing FAISS index")
        return

    # Build from demo docs
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    all_chunks = []

    demo_path = Path(DEMO_DOCS_PATH)
    for file in sorted(demo_path.glob("*.md")):
        loader = TextLoader(str(file), encoding="utf-8")
        docs = loader.load()
        for doc in docs:
            doc.metadata["source"] = file.name
            doc.metadata["title"] = file.stem.replace("_", " ").title()
        chunks = splitter.split_documents(docs)
        all_chunks.extend(chunks)
        print(f"[VectorStore] Indexed {file.name} → {len(chunks)} chunks")

    _vectorstore = FAISS.from_documents(all_chunks, embedder)
    _vectorstore.save_local(FAISS_PATH)
    print(f"[VectorStore] Created FAISS index — {len(all_chunks)} total chunks")


def get_vectorstore() -> FAISS:
    if _vectorstore is None:
        raise RuntimeError("VectorStore not initialized. Did startup run?")
    return _vectorstore
