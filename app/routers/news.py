from fastapi import APIRouter
from app.models.schemas import NewsFeedResponse
from app.services.news_aggregator import fetch_kashmir_news

router = APIRouter(prefix="/news", tags=["News"])
@router.get("/feed", response_model=NewsFeedResponse)
async def news_feed():
    return await fetch_kashmir_news()