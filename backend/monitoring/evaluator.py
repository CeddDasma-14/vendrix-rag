import os
import json
import asyncio
from anthropic import Anthropic

_client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

EVAL_PROMPT = """You are an evaluator for an AI sales assistant called Cedd (Vendrix).
Score the following response on a scale of 1-5 for each metric.

User message: {user_message}
Agent response: {agent_response}

Return ONLY valid JSON with these exact keys:
{{
  "relevance": <1-5>,
  "accuracy": <1-5>,
  "hallucination": <true or false>,
  "completeness": <1-5>
}}

Scoring guide:
- relevance: Does the response directly address the user's question?
- accuracy: Is the information factually correct and grounded?
- hallucination: Did the agent invent facts, numbers, or features not in context?
- completeness: Does the response fully answer the question?"""


async def evaluate_response(user_message: str, agent_response: str) -> dict | None:
    try:
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            lambda: _client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=200,
                messages=[{
                    "role": "user",
                    "content": EVAL_PROMPT.format(
                        user_message=user_message,
                        agent_response=agent_response[:1500],
                    ),
                }],
            ),
        )
        text = result.content[0].text.strip()
        # Extract JSON if wrapped in markdown code block
        if "```" in text:
            text = text.split("```")[1].replace("json", "").strip()
        scores = json.loads(text)
        return scores
    except Exception as e:
        print(f"[Evaluator] Failed: {e}")
        return None
