import json
import asyncio
import time
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from langchain_core.messages import HumanMessage, AIMessage
from langsmith import traceable
from agent.agent import build_agent
from rag.retriever import retrieve
from monitoring.logger import log_chat, save_evaluation
from monitoring.evaluator import evaluate_response

router = APIRouter()


@traceable(run_type="chain", name="vendrix-agent")
def run_agent(agent, input_text: str, history: list) -> dict:
    return agent.invoke({"input": input_text, "chat_history": history})


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
    start_time = time.time()

    try:
        agent = build_agent()
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            lambda: run_agent(agent, message, chat_history),
        )

        # Emit each tool call used
        intermediate_steps = result.get("intermediate_steps", [])
        tool_calls_used = [action.tool for action, _ in intermediate_steps]
        for action, _ in intermediate_steps:
            event = {"type": "tool_call", "tool": action.tool}
            yield f"data: {json.dumps(event)}\n\n"
            await asyncio.sleep(0)

        # Stream output word by word for a typing effect
        raw_output = result.get("output", "")
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

        # Log and evaluate in background — don't block the response
        response_time_ms = int((time.time() - start_time) * 1000)
        asyncio.create_task(_log_and_evaluate(
            message, output, tool_calls_used, sources, response_time_ms
        ))

    except Exception as e:
        response_time_ms = int((time.time() - start_time) * 1000)
        asyncio.create_task(_log_and_evaluate(
            message, f"ERROR: {e}", [], [], response_time_ms, success=False
        ))
        yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"


async def _log_and_evaluate(
    user_message: str,
    agent_response: str,
    tool_calls: list,
    sources: list,
    response_time_ms: int,
    success: bool = True,
):
    try:
        log_id = log_chat(
            user_message=user_message,
            agent_response=agent_response,
            tool_calls=tool_calls,
            sources=sources,
            response_time_ms=response_time_ms,
            success=success,
        )
        if success and agent_response:
            scores = await evaluate_response(user_message, agent_response)
            if scores:
                save_evaluation(log_id, scores)
                print(f"[Monitoring] Logged #{log_id} | {response_time_ms}ms | scores: {scores}")
    except Exception as e:
        print(f"[Monitoring] Log failed: {e}")


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
