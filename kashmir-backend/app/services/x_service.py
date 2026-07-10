import tweepy
from app.config import get_settings


def is_configured() -> bool:
    s = get_settings()
    return bool(s.x_api_key and s.x_api_secret and s.x_access_token and s.x_access_token_secret)


def _client() -> tweepy.Client:
    s = get_settings()
    return tweepy.Client(
        consumer_key=s.x_api_key,
        consumer_secret=s.x_api_secret,
        access_token=s.x_access_token,
        access_token_secret=s.x_access_token_secret,
    )


def _api_v1():
    s = get_settings()
    auth = tweepy.OAuth1UserHandler(s.x_api_key, s.x_api_secret, s.x_access_token, s.x_access_token_secret)
    return tweepy.API(auth)


def publish_to_x(media_url: str | None, caption: str) -> dict:
    """
    Posts a tweet. If media_url is provided, downloads and attaches it.
    Returns {"x_tweet_id": str} on success, raises ValueError on failure.
    """
    import httpx

    client = _client()

    media_id = None
    if media_url:
        api_v1 = _api_v1()
        import tempfile, os
        resp = httpx.get(media_url, timeout=30, follow_redirects=True)
        suffix = ".mp4" if any(media_url.lower().endswith(e) for e in (".mp4", ".mov", ".m4v")) else ".jpg"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(resp.content)
            tmp_path = tmp.name
        try:
            media = api_v1.media_upload(tmp_path)
            media_id = media.media_id
        finally:
            os.unlink(tmp_path)

    try:
        resp = client.create_tweet(
            text=(caption or "")[:280],
            media_ids=[media_id] if media_id else None,
        )
        tweet_id = str(resp.data["id"])
        return {"x_tweet_id": tweet_id}
    except tweepy.TweepyException as e:
        raise ValueError(str(e))
