from fastapi import APIRouter
from app.models.schemas import DocumentaryOverview, TimelineResponse, DocumentaryTimestamps
from app.services.documentary_data import (
    get_documentary_overview,
    get_kashmir_timeline,
    get_documentary_timestamps,
)

router = APIRouter(prefix="/documentary", tags=["Documentary"])


@router.get("/overview", response_model=DocumentaryOverview)
async def overview():
   
    return get_documentary_overview()


@router.get("/timeline", response_model=TimelineResponse)
async def timeline():
    
    return get_kashmir_timeline()


@router.get("/timestamps", response_model=DocumentaryTimestamps)
async def timestamps():
    
    return get_documentary_timestamps()