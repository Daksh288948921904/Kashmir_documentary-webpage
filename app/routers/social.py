from fastapi import APIRouter,Query
from app.models.schemas import SocialFeedResponse
from app.services.social_scraper import fetch_social_feed
router = APIRouter(prefix="/social", tags=["Social Media"])
 
 
@router.get("/feed", response_model=SocialFeedResponse)
async def social_feed(
    platform: str | None = Query(None, description="Filter by platform: 'instagram' or 'twitter'"),
):
    return await fetch_social_feed(platform=platform)