import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.supabase import close_supabase
from app.routes.internal import router as internal_router
from app.routes.trackers import router as trackers_router


DEFAULT_CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:8080",
]


def get_cors_origins() -> list[str]:
    configured_origins = os.getenv("CORS_ORIGINS")

    if not configured_origins:
        return DEFAULT_CORS_ORIGINS

    return [
        origin.strip()
        for origin in configured_origins.split(",")
        if origin.strip()
    ]


def get_cors_origin_regex() -> str | None:
    configured_regex = os.getenv("CORS_ORIGIN_REGEX", "").strip()
    return configured_regex or None


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    close_supabase()


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_origin_regex=get_cors_origin_regex(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(internal_router)
app.include_router(trackers_router)


@app.get("/")
def read_root():
    return {"message": "Watchdog backend is running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}
