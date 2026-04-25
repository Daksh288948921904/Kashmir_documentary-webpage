import httpx
import feedparser
from datetime import datetime, timezone
from bs4 import BeautifulSoup
from cachetools import TTLCache
from app.config import get_settings
from app.models.schemas import NewsItem,NewsFeedResponse
#Cache tools for 15 secs
_cache:TTLCache =TTLCache(maxsize=1, ttl=900)
RSS_FEEDS = [
    {
        "name": "Greater Kashmir",
        "url": "https://www.greaterkashmir.com/feed",
        "category": "local",
    },
    {
        "name": "Kashmir Observer",
        "url": "https://kashmirobserver.net/feed",
        "category": "local",
    },
    {
        "name": "The Wire - Kashmir",
        "url": "https://thewire.in/category/security/feed",
        "category": "security",
    },
    {
        "name": "NDTV - Kashmir",
        "url": "https://feeds.feedburner.com/ndtvnews-india-news",
        "category": "national",
    },
    {
        "name": "Al Jazeera - India",
        "url": "https://www.aljazeera.com/xml/rss/all.xml",
        "category": "international",
    },
]
KASHMIR_KEYWORDS = {
    # Core geography
    "kashmir", "jammu", "srinagar", "ladakh", "kupwara", "baramulla",
    "anantnag", "pulwama", "shopian", "bandipora", "ganderbal",
    "kargil", "leh", "poonch", "rajouri", "doda", "kishtwar", "udhampur",

    # Regions / alternate naming
    "jammu and kashmir", "jk", "j&k", "kashmir valley",

    # Political / legal
    "article 370", "article 35a", "delimitation", "statehood",
    "assembly elections", "lg administration", "lieutenant governor",
    "home ministry", "governor rule",

    # Security / conflict
    "loc", "line of control", "cross border", "ceasefire",
    "militancy", "militant", "terror attack", "encounter",
    "gunfight", "infiltration", "insurgency", "operation all out",
    "army", "crpf", "bsf", "paramilitary", "security forces",
    "ied blast", "grenade attack",

    # Major incidents / context
    "pulwama attack", "amarnath yatra attack", "shopian encounter",

    # International / geopolitics
    "india pakistan", "pakistan occupied kashmir", "pok",
    "china ladakh", "galwan", "lacc", "border dispute",

    # Society / protests
    "protest", "shutdown", "curfew", "stone pelting",
    "internet shutdown", "restrictions",

    # Tourism & economy
    "tourism", "gulmarg", "pahalgam", "sonmarg", "houseboat",
    "dal lake", "shikara", "apple harvest", "saffron", "handicrafts",

    # Weather / environment
    "snowfall", "avalanche", "cold wave", "floods", "rainfall",

    # Misc
    "kashmiri pandits", "migration", "return policy"
}
def _is_kashmir_related(title: str, summary: str) -> bool:
    """Check if an article is Kashmir-related based on keywords."""
    text = f"{title} {summary}".lower()
    return any(kw in text for kw in KASHMIR_KEYWORDS)
 
 
def _truncate_brief(text: str, max_words: int = 35) -> str:
    """Create a brief summary from description text."""
    # Strip HTML tags
    clean = BeautifulSoup(text, "html.parser").get_text(separator=" ").strip()
    words = clean.split()
    if len(words) <= max_words:
        return clean
    return " ".join(words[:max_words]) + "..."
 
 
def _parse_rss_date(entry: dict) -> datetime | None:
    """Parse published date from RSS entry."""
    published = entry.get("published_parsed") or entry.get("updated_parsed")
    if published:
        try:
            from time import mktime
            return datetime.fromtimestamp(mktime(published), tz=timezone.utc)
        except Exception:
            pass
    return None
 
 
async def _fetch_rss_feed(feed_config: dict) -> list[NewsItem]:
    """Fetch and parse a single RSS feed."""
    items = []
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(feed_config["url"], follow_redirects=True)
            resp.raise_for_status()
 
        parsed = feedparser.parse(resp.text)
        for entry in parsed.entries[:20]:
            title = entry.get("title", "")
            summary = entry.get("summary", "") or entry.get("description", "")
 
            # Filter for Kashmir content (skip for local Kashmir outlets)
            if feed_config["category"] not in ("local",) and not _is_kashmir_related(title, summary):
                continue
 
            # Extract image
            image_url = None
            if entry.get("media_content"):
                image_url = entry["media_content"][0].get("url")
            elif entry.get("media_thumbnail"):
                image_url = entry["media_thumbnail"][0].get("url")
 
            items.append(NewsItem(
                headline=title,
                brief=_truncate_brief(summary),
                source_name=feed_config["name"],
                source_url=entry.get("link", ""),
                image_url=image_url,
                published_at=_parse_rss_date(entry),
                category=feed_config.get("category"),
            ))
    except Exception as e:
        print(f"[News] Failed to fetch {feed_config['name']}: {e}")
 
    return items
 
 
async def _fetch_newsapi_fallback() -> list[NewsItem]:
    """Fallback: fetch from NewsAPI if RSS feeds are sparse."""
    settings = get_settings()
    if not settings.news_api_key:
        return []
 
    items = []
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                "https://newsapi.org/v2/everything",
                params={
                    "q": "Kashmir",
                    "sortBy": "publishedAt",
                    "pageSize": 15,
                    "apiKey": settings.news_api_key,
                },
            )
            resp.raise_for_status()
            data = resp.json()
 
        for article in data.get("articles", []):
            items.append(NewsItem(
                headline=article.get("title", ""),
                brief=_truncate_brief(article.get("description", "") or ""),
                source_name=article.get("source", {}).get("name", "Unknown"),
                source_url=article.get("url", ""),
                image_url=article.get("urlToImage"),
                published_at=article.get("publishedAt"),
                category="general",
            ))
    except Exception as e:
        print(f"[NewsAPI] Fallback failed: {e}")
 
    return items
 
 
async def fetch_kashmir_news() -> NewsFeedResponse:
    """Aggregate Kashmir news from multiple sources."""
    cache_key = "kashmir_news"
    if cache_key in _cache:
        return _cache[cache_key]
 
    all_articles: list[NewsItem] = []
 
    # Fetch all RSS feeds concurrently
    import asyncio
    rss_results = await asyncio.gather(
        *[_fetch_rss_feed(feed) for feed in RSS_FEEDS],
        return_exceptions=True,
    )
    for result in rss_results:
        if isinstance(result, list):
            all_articles.extend(result)
 
    # If we got fewer than 5 articles, try NewsAPI
    if len(all_articles) < 5:
        fallback = await _fetch_newsapi_fallback()
        all_articles.extend(fallback)
 
    # Deduplicate by headline similarity (simple)
    seen_titles = set()
    unique_articles = []
    for article in all_articles:
        title_key = article.headline.lower().strip()[:60]
        if title_key not in seen_titles:
            seen_titles.add(title_key)
            unique_articles.append(article)
 
    # Sort by recency
    unique_articles.sort(
        key=lambda a: a.published_at or datetime.min.replace(tzinfo=timezone.utc),
        reverse=True,
    )
 
    result = NewsFeedResponse(
        articles=unique_articles[:30],
        last_updated=datetime.now(timezone.utc),
    )
    _cache[cache_key] = result
    return result
 