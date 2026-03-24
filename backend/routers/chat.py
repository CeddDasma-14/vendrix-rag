import json
import asyncio
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from langchain_core.messages import HumanMessage, AIMessage
from langsmith import traceable
from agent.agent import build_agent
from rag.retriever import retrieve

router = APIRouter()


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[Message] = []


def _format_history(history: list[Message]) -> list:
    result = []
    for msg in history:
        if msg.role == "user":
            result.append(HumanMessage(content=msg.content))
        else:
            result.append(AIMessage(content=msg.content))
    return result


async def _stream_response(message: str, history: list[Message]):
    chat_history = _format_history(history)

    try:
        agent = build_agent()

        @traceable(run_type="chain", name="vendrix-agent")
        def run_agent(input_text, history):
            return agent.invoke({"input": input_text, "chat_history": history})

        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            lambda: run_agent(message, chat_history),
        )

        # Emit each tool call used
        intermediate_steps = result.get("intermediate_steps", [])
        for action, _ in intermediate_steps:
            event = {"type": "tool_call", "tool": action.tool}
            yield f"data: {json.dumps(event)}\n\n"
            await asyncio.sleep(0)

        # Stream output word by word for a typing effect
        raw_output = result.get("output", "")
        # Newer LangChain returns a list of content blocks — extract text
        if isinstance(raw_output, list):
            output = " ".join(
                block.get("text", "") for block in raw_output if isinstance(block, dict)
            )
        else:
            output: str = raw_output
        words = output.split(" ")
        for i, word in enumerate(words):
            token = word if i == 0 else f" {word}"
            yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"
            await asyncio.sleep(0.018)

        # Collect unique sources from knowledge base searches
        sources: list[dict] = []
        seen_titles: set[str] = set()
        for action, _ in intermediate_steps:
            if action.tool == "search_knowledge_base":
                query = action.tool_input.get("query", message)
                for r in retrieve(query, k=3):
                    if r["title"] not in seen_titles:
                        sources.append({"title": r["title"], "source": r["source"]})
                        seen_titles.add(r["title"])

        if sources:
            yield f"data: {json.dumps({'type': 'sources', 'sources': sources})}\n\n"

        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    except Exception as e:
        yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"


@router.get("/test-stream")
async def test_stream():
    async def _test():
        import json
        for word in ["Hello", " this", " is", " a", " test", " response"]:
            yield f"data: {json.dumps({'type': 'token', 'content': word})}\n\n"
            await asyncio.sleep(0.05)
        yield f"data: {json.dumps({'type': 'done'})}\n\n"
    return StreamingResponse(_test(), media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no", "Access-Control-Allow-Origin": "*"})


@router.post("/stream")
async def chat_stream(request: ChatRequest):
    return StreamingResponse(
        _stream_response(request.message, request.history),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Access-Control-Allow-Origin": "*",
        },
    )
