import httpx
from datetime import datetime, timezone, timedelta
from cachetools import TTLCache
from app.config import get_settings
from app.models.schemas import SocialPost,SocialFeedResponse
_cache:TTLCache=TTLCache(maxsize=2,ttl=1800)
APIFY_BASE = "https://api.apify.com/v2"
INSTAGRAM_ACTOR = "apify~instagram-hashtag-scraper"
TWITTER_ACTOR = "apify~tweet-scraper"

KASHMIR_HASHTAGS = ["kashmir", "kashmirdocumentary", "kashmirvalley", "freeKashmir"]
KASHMIR_SEARCH_TERMS = ["Kashmir", "Kashmir documentary", "Kashmir conflict"]

_now = datetime.now(timezone.utc)
_TW = "https://x.com/search?q=%23Kashmir&src=typed_query&f=live"
_IG = "https://www.instagram.com/explore/tags/kashmir/"

MOCK_POSTS: list[SocialPost] = [
    SocialPost(
        platform="instagram",
        author="Kashmir Valley Journal",
        author_handle="@kashmirvalleyjournal",
        content="The shikaras on Dal Lake at golden hour are simply unmatched. No photograph does justice to the light here — it has to be lived. 🏔️ #Kashmir #DalLake #Paradise #KashmirValley",
        post_url=_IG,
        likes=4821,
        comments=234,
        posted_at=_now - timedelta(hours=2),
    ),
    SocialPost(
        platform="twitter",
        author="Tariq Mir",
        author_handle="@tariqmir_jk",
        content="Watching the new Kashmir documentary trailer. It's rare to see our stories told with this much care and nuance. The voices of ordinary Kashmiris finally getting the space they deserve. #KashmirUntoldEchoes",
        post_url=_TW,
        likes=1293,
        comments=87,
        shares=412,
        posted_at=_now - timedelta(hours=5),
    ),
    SocialPost(
        platform="instagram",
        author="Saffron Fields",
        author_handle="@saffronfields_kashmir",
        content="Harvest season in Pampore — the world's most prized saffron comes from these fields. Generations of Kashmiri farmers have tended this land through everything. 🌸 #KashmirSaffron #Pampore #Agriculture",
        post_url=_IG,
        likes=3107,
        comments=156,
        posted_at=_now - timedelta(hours=8),
    ),
    SocialPost(
        platform="twitter",
        author="Rafia Akhter",
        author_handle="@rafiaakhter",
        content="The documentary raises uncomfortable questions about how the international media covers Kashmir. We're so used to conflict framing — seeing the culture, the art, the daily life is a powerful reframe. Must watch.",
        post_url=_TW,
        likes=876,
        comments=43,
        shares=231,
        posted_at=_now - timedelta(hours=11),
    ),
    SocialPost(
        platform="instagram",
        author="Kashmir Through a Lens",
        author_handle="@kashmir_lens",
        content="Early morning mist over Wular Lake. The largest freshwater lake in the subcontinent, and one of the most serene places I've ever stood. Kashmir holds its beauty quietly. 📷 #WularLake #KashmirPhotography",
        post_url=_IG,
        likes=6540,
        comments=312,
        posted_at=_now - timedelta(hours=14),
    ),
    SocialPost(
        platform="twitter",
        author="South Asia Monitor",
        author_handle="@southasiamonitor",
        content="New documentary 'Kashmir: Untold Echoes' brings to screen testimonies that have been largely absent from mainstream discourse. A significant contribution to the historical record. #Kashmir #Documentary #SouthAsia",
        post_url=_TW,
        likes=2341,
        comments=189,
        shares=654,
        posted_at=_now - timedelta(hours=18),
    ),
    SocialPost(
        platform="instagram",
        author="Himalayan Heritage",
        author_handle="@himalayan.heritage",
        content="The Shankaracharya Temple, perched 1,000 feet above Srinagar. One of the oldest Hindu shrines in Kashmir, a reminder of the region's layered spiritual history. 🕌 #Kashmir #History #Srinagar",
        post_url=_IG,
        likes=5212,
        comments=278,
        posted_at=_now - timedelta(hours=22),
    ),
    SocialPost(
        platform="twitter",
        author="Noor Hussain",
        author_handle="@noorhussain_k",
        content="People often ask me what Kashmir is like. I tell them: it's the most beautiful place I've ever been, and the most complicated. Both things are completely true at the same time. #Kashmir",
        post_url=_TW,
        likes=3892,
        comments=204,
        shares=987,
        posted_at=_now - timedelta(days=1),
    ),
]
 
async def _run_actor(actor_id: str, run_input: dict) -> list[dict]:
    """Run an Apify actor synchronously (waits for finish) and return dataset items."""
    settings = get_settings()
    async with httpx.AsyncClient(timeout=120) as client:
        # Start actor run and wait
        resp = await client.post(
            f"{APIFY_BASE}/acts/{actor_id}/runs",
            params={"token": settings.apify_api_token, "waitForFinish": 60},
            json=run_input,
        )
        resp.raise_for_status()
        run_data = resp.json()["data"]
        dataset_id = run_data.get("defaultDatasetId")
 
        if not dataset_id:
            return []
 
        # Fetch dataset items
        items_resp = await client.get(
            f"{APIFY_BASE}/datasets/{dataset_id}/items",
            params={"token": settings.apify_api_token, "limit": 30},
        )
        items_resp.raise_for_status()
        return items_resp.json()
def _parse_instagram_item(item: dict) -> SocialPost:
    return SocialPost(
        platform="instagram",
        author=item.get("ownerFullName", "Unknown"),
        author_handle=item.get("ownerUsername", ""),
        author_avatar=item.get("profilePicUrl"),
        content=(item.get("caption", "") or "")[:500],
        media_url=item.get("displayUrl") or item.get("url"),
        post_url=item.get("url", ""),
        likes=item.get("likesCount", 0),
        comments=item.get("commentsCount", 0),
        posted_at=item.get("timestamp"),
    )
def _parse_twitter_item(item: dict) -> SocialPost:
    return SocialPost(
        platform="twitter",
        author=item.get("author", {}).get("name", "Unknown"),
        author_handle=item.get("author", {}).get("userName", ""),
        author_avatar=item.get("author", {}).get("profilePicture"),
        content=(item.get("text", "") or "")[:500],
        media_url=(item.get("media", [{}]) or [{}])[0].get("url") if item.get("media") else None,
        post_url=item.get("url", ""),
        likes=item.get("likeCount", 0),
        comments=item.get("replyCount", 0),
        shares=item.get("retweetCount", 0),
        posted_at=item.get("createdAt"),
    )
async def fetch_social_feed(platform: str | None = None) -> SocialFeedResponse:
    """Fetch Kashmir-related social media posts. Falls back to curated posts when Apify is unavailable."""
    cache_key = f"social_{platform or 'all'}"
    if cache_key in _cache:
        return _cache[cache_key]

    posts: list[SocialPost] = []
    settings = get_settings()
    use_mock = not settings.apify_api_token

    if not use_mock:
        if platform in (None, "instagram"):
            try:
                ig_items = await _run_actor(INSTAGRAM_ACTOR, {
                    "hashtags": KASHMIR_HASHTAGS,
                    "resultsLimit": 20,
                })
                posts.extend(_parse_instagram_item(item) for item in ig_items)
            except Exception as e:
                print(f"[Apify] Instagram fetch failed: {e}")

        if platform in (None, "twitter"):
            try:
                tw_items = await _run_actor(TWITTER_ACTOR, {
                    "searchTerms": KASHMIR_SEARCH_TERMS,
                    "maxTweets": 20,
                    "sort": "Latest",
                })
                posts.extend(_parse_twitter_item(item) for item in tw_items)
            except Exception as e:
                print(f"[Apify] Twitter fetch failed: {e}")

    if use_mock or not posts:
        mock = MOCK_POSTS if platform is None else [p for p in MOCK_POSTS if p.platform == platform]
        posts = mock

    posts.sort(key=lambda p: p.posted_at or datetime.min.replace(tzinfo=timezone.utc), reverse=True)

    result = SocialFeedResponse(
        posts=posts,
        last_updated=datetime.now(timezone.utc),
        total=len(posts),
    )
    _cache[cache_key] = result
    return result
 