import os

import httpx
from dotenv import load_dotenv
from supabase import Client, ClientOptions, create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError(
        "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables."
    )

SUPABASE_HTTP_TIMEOUT = httpx.Timeout(10.0, connect=5.0, read=10.0, write=10.0)

supabase_http_client = httpx.Client(
    follow_redirects=True,
    http2=False,
    timeout=SUPABASE_HTTP_TIMEOUT,
)

supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    options=ClientOptions(
        auto_refresh_token=False,
        persist_session=False,
        httpx_client=supabase_http_client,
    ),
)


def close_supabase() -> None:
    supabase_http_client.close()
