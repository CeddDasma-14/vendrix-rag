import os
from langchain_core.tools import tool
from rag.retriever import retrieve

# In-memory lead store — swap for a DB in production
_leads: list[dict] = []


def _send_prospect_confirmation(name: str, email: str, preferred_time: str) -> None:
    api_key = os.getenv("RESEND_API_KEY")
    if not api_key:
        return
    try:
        import resend
        resend.api_key = api_key
        body = (
            f"Hi {name},\n\n"
            f"Thanks for your interest in Vendrix! Your demo has been booked.\n\n"
            f"Here's what happens next:\n"
            f"- Our team will confirm your preferred time: {preferred_time}\n"
            f"- You'll receive a personalised agenda before the call\n"
            f"- Come prepared with any questions about your workflow needs\n\n"
            f"In the meantime, feel free to explore more at vendrix-rag.vercel.app\n\n"
            f"Talk soon,\n"
            f"Cedy Dasmarinas\n"
            f"CEO, Vendrix"
        )
        resend.Emails.send({
            "from": "Vendrix <onboarding@resend.dev>",
            "to": email,
            "subject": "Your Vendrix demo is confirmed!",
            "text": body,
        })
        print(f"[Leads] Confirmation email sent to {email}")
    except Exception as e:
        print(f"[Leads] Confirmation email failed: {e}")


def _send_lead_email(lead: dict) -> None:
    api_key = os.getenv("RESEND_API_KEY")
    notify_email = os.getenv("NOTIFY_EMAIL")
    if not api_key or not notify_email:
        return

    try:
        import resend
        resend.api_key = api_key
        body = (
            f"New qualified lead captured by the Vendrix AI agent.\n\n"
            f"Name:      {lead['name']}\n"
            f"Company:   {lead['company']}\n"
            f"Use case:  {lead['use_case']}\n"
            f"Budget:    {lead['budget']}\n"
            f"Timeline:  {lead['timeline']}\n"
        )
        resend.Emails.send({
            "from": "Vendrix Leads <onboarding@resend.dev>",
            "to": notify_email,
            "subject": f"New Lead: {lead['name']} — {lead['company']}",
            "text": body,
        })
        print(f"[Leads] Email sent for {lead['name']} at {lead['company']}")
    except Exception as e:
        print(f"[Leads] Email failed: {e}")


@tool
def search_knowledge_base(query: str) -> str:
    """Search the product knowledge base for information about features, pricing,
    integrations, security, case studies, and competitive comparisons."""
    results = retrieve(query, k=4)
    if not results:
        return "No relevant information found in the knowledge base."
    sections = [f"[Source: {r['title']}]\n{r['content']}" for r in results]
    return "\n\n---\n\n".join(sections)


@tool
def qualify_lead(
    name: str,
    company: str,
    use_case: str,
    budget: str = "not specified",
    timeline: str = "not specified",
) -> str:
    """Save a qualified lead after collecting the prospect's information.
    Call this once you know their name, company, and primary use case."""
    lead = {
        "name": name,
        "company": company,
        "use_case": use_case,
        "budget": budget,
        "timeline": timeline,
        "status": "qualified",
    }
    _leads.append(lead)
    _send_lead_email(lead)
    return (
        f"Lead saved: {name} from {company}. "
        f"Use case: {use_case}. Budget: {budget}. Timeline: {timeline}."
    )


@tool
def handle_objection(objection_type: str) -> str:
    """Retrieve data to address a sales objection.
    objection_type options: 'price', 'competitor', 'timing', 'features', 'security', 'roi'
    """
    query_map = {
        "price": "pricing value ROI cost justification savings",
        "competitor": "competitor comparison why choose Vendrix vs Zapier Make",
        "timing": "implementation time onboarding setup quick start",
        "features": "features capabilities integrations workflow builder",
        "security": "security compliance SOC2 encryption data protection",
        "roi": "ROI results case studies outcomes savings hours saved",
    }
    query = query_map.get(objection_type.lower(), objection_type)
    results = retrieve(query, k=3)
    if not results:
        return "I couldn't find specific data on that — I'll address it based on general product knowledge."
    return "\n\n".join(r["content"] for r in results)


@tool
def book_demo(name: str, email: str, preferred_time: str = "any time") -> str:
    """Book a product demo for an interested prospect.
    Call this when a prospect explicitly asks for a demo or says they want to see the product."""
    _send_prospect_confirmation(name, email, preferred_time)
    return (
        f"Demo booked!\n"
        f"Name: {name}\n"
        f"Email: {email}\n"
        f"Preferred time: {preferred_time}\n\n"
        f"A confirmation email has been sent to {email}. "
        f"Our team will confirm the exact time and send a personalised agenda."
    )


@tool
def escalate_to_human(reason: str, conversation_summary: str) -> str:
    """Escalate to a human sales specialist for complex requirements or high-value deals.
    Call this when the prospect has needs beyond standard Q&A or is ready to negotiate."""
    return (
        f"Connecting you with a senior sales specialist now.\n"
        f"Reason: {reason}\n\n"
        f"I've shared a full summary of your needs so you won't need to repeat yourself:\n"
        f"{conversation_summary}\n\n"
        f"Expect a response within 2 business hours."
    )


def get_tools():
    return [
        search_knowledge_base,
        qualify_lead,
        handle_objection,
        book_demo,
        escalate_to_human,
    ]


def get_leads() -> list[dict]:
    return _leads
