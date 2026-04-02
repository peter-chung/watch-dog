from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.supabase import supabase

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


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/supabase-test")
def supabase_test():
    return {
        "message": "Supabase client loaded successfully",
        "has_client": supabase is not None,
    }


@app.get("/trackers-test")
def trackers_test():
    response = supabase.table("trackers").select("*").execute()
    return {
        "data": response.data,
        "count": len(response.data),
    }


@app.get("/change-logs-test")
def change_logs_test():
    response = supabase.table("change_logs").select("*").execute()
    return {
        "data": response.data,
        "count": len(response.data),
    }
