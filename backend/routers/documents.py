import shutil
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException
from langchain_community.document_loaders import TextLoader, PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from rag.vectorstore import get_vectorstore

router = APIRouter()

UPLOAD_DIR = Path("./data/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
ALLOWED_EXTENSIONS = {".pdf", ".txt", ".md"}


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    suffix = Path(file.filename).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{suffix}'. Use PDF, TXT, or MD.",
        )

    dest = UPLOAD_DIR / file.filename
    with open(dest, "wb") as f:
        shutil.copyfileobj(file.file, f)

    loader = PyPDFLoader(str(dest)) if suffix == ".pdf" else TextLoader(str(dest), encoding="utf-8")
    docs = loader.load()

    for doc in docs:
        doc.metadata["source"] = file.filename
        doc.metadata["title"] = Path(file.filename).stem.replace("_", " ").title()

    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_documents(docs)

    get_vectorstore().add_documents(chunks)

    return {"message": f"Indexed '{file.filename}'", "chunks": len(chunks)}


@router.get("/list")
async def list_documents():
    demo = [
        {"name": f.name, "type": "demo", "size_kb": round(f.stat().st_size / 1024, 1)}
        for f in sorted(Path("./data/demo_docs").glob("*.md"))
    ]
    uploaded = [
        {"name": f.name, "type": "uploaded", "size_kb": round(f.stat().st_size / 1024, 1)}
        for f in sorted(UPLOAD_DIR.glob("*")) if f.is_file()
    ]
    return {"documents": demo + uploaded}
