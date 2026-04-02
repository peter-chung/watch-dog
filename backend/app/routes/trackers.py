from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException

from app.database.supabase import supabase
from app.schemas.tracker import TrackerCreate, TrackerUpdate

router = APIRouter(prefix="/trackers", tags=["trackers"])


@router.post("")
def create_tracker(tracker: TrackerCreate):
    payload = {
        "url": str(tracker.url),
        "selector": tracker.selector,
        "email": tracker.email,
        "is_active": True,
    }

    response = supabase.table("trackers").insert(payload).execute()

    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to create tracker")

    return response.data[0]


@router.get("")
def get_trackers():
    response = (
        supabase.table("trackers").select("*").order("created_at", desc=True).execute()
    )
    return response.data


@router.get("/{tracker_id}")
def get_tracker_by_id(tracker_id: str):
    response = (
        supabase.table("trackers").select("*").eq("id", tracker_id).limit(1).execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="Tracker not found")

    return response.data[0]


@router.patch("/{tracker_id}")
def update_tracker(tracker_id: str, tracker_update: TrackerUpdate):
    update_data = tracker_update.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update")

    response = (
        supabase.table("trackers").update(update_data).eq("id", tracker_id).execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="Tracker not found")

    return response.data[0]
