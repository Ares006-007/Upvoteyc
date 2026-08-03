"""
Supabase client module for OpenVC.

Provides two pre-configured Supabase clients:
  - supabase_public : uses the anon/publishable key (safe for client-facing ops)
  - supabase_admin  : uses the service_role key (server-side only, bypasses RLS)
"""

import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")


def get_public_client() -> Client:
    """Returns a Supabase client using the anon (publishable) key."""
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env")
    return create_client(SUPABASE_URL, SUPABASE_ANON_KEY)


def get_admin_client() -> Client:
    """Returns a Supabase client using the service_role (secret) key. Server-side only."""
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env")
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


# Lazy-initialized singletons (created on first import if env vars are set)
supabase_public: Client | None = None
supabase_admin: Client | None = None

try:
    if SUPABASE_URL and SUPABASE_ANON_KEY:
        supabase_public = get_public_client()
    if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY:
        supabase_admin = get_admin_client()
except Exception as e:
    print(f"[SupabaseClient] Warning: Could not initialize clients: {e}")
