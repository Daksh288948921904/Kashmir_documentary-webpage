from functools import lru_cache

from supabase import create_client, Client
from app.config import get_settings


@lru_cache()
def get_supabase() -> Client:
    """Single reused Supabase client. Cached so we don't open a fresh
    connection on every request. Cleared automatically on server restart."""
    s = get_settings()
    return create_client(s.supabase_url, s.supabase_service_role_key)
