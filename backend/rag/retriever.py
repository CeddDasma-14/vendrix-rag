from rag.vectorstore import get_vectorstore


def retrieve(query: str, k: int = 4) -> list[dict]:
    vs = get_vectorstore()
    results = vs.similarity_search_with_score(query, k=k)
    return [
        {
            "content": doc.page_content,
            "source": doc.metadata.get("source", "unknown"),
            "title": doc.metadata.get("title", "Document"),
            "score": float(score),
        }
        for doc, score in results
    ]
