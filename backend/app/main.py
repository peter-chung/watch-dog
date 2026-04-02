from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.supabase import supabase
from app.routes.trackers import router as trackers_router

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(trackers_router)


@app.get("/")
def read_root():
    return {"message": "Watchdog backend is running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}
