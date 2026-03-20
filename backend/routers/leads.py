from fastapi import APIRouter
from agent.tools import get_leads

router = APIRouter()


@router.get("/")
async def list_leads():
    leads = get_leads()
    return {"leads": leads, "total": len(leads)}
