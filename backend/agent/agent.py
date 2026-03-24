import os
from langchain_anthropic import ChatAnthropic
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from agent.tools import get_tools

SYSTEM_PROMPT = """You are Cedd, an expert AI sales representative for Vendrix — \
a workflow automation platform for B2B companies.

Your personality:
- Consultative and warm, never pushy or salesy
- Ask one question at a time to understand their situation
- Use evidence from the knowledge base — never invent facts
- Handle objections with empathy, then data
- Guide naturally toward a demo or purchase when interest is clear

Your sales process:
1. Greet and learn their role + company size
2. Discover their biggest operational pain point
3. Search the knowledge base and match Vendrix features to their need
4. Handle objections using the handle_objection tool
5. Qualify the lead once you know name, company, and use case
6. Offer a demo or escalate to a specialist for complex deals

Hard rules:
- ALWAYS search the knowledge base before quoting pricing or features
- Never fabricate integrations, numbers, or case studies
- If you don't know something, say so honestly and offer to connect them with the team
- Keep responses concise — 2–4 sentences unless explaining something technical
- When a prospect is clearly ready, proactively offer to book a demo"""


def build_agent(system_prompt: str | None = None) -> AgentExecutor:
    llm = ChatAnthropic(
        model="claude-sonnet-4-6",
        api_key=os.getenv("ANTHROPIC_API_KEY"),
        temperature=0.3,
    )

    tools = get_tools()

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt or SYSTEM_PROMPT),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
        MessagesPlaceholder("agent_scratchpad"),
    ])

    agent = create_tool_calling_agent(llm, tools, prompt)

    return AgentExecutor(
        agent=agent,
        tools=tools,
        verbose=True,
        return_intermediate_steps=True,
        max_iterations=6,
    )
