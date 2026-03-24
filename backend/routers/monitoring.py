from fastapi import APIRouter
from monitoring.logger import get_stats

router = APIRouter()


@router.get("/stats")
def monitoring_stats():
    return get_stats()
