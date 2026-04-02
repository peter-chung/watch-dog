from fastapi import APIRouter, HTTPException

from app.schemas.tracker import TrackerCreate, TrackerUpdate
from app.services.trackers import (
    create_tracker_record,
    get_all_trackers,
    get_tracker_by_id_record,
    update_tracker_record,
)

router = APIRouter(prefix="/trackers", tags=["trackers"])


@router.post("")
def create_tracker(tracker: TrackerCreate):
    payload = {
        "url": str(tracker.url),
        "selector": tracker.selector,
        "email": tracker.email,
        "is_active": True,
    }

    data = create_tracker_record(payload)

    if not data:
        raise HTTPException(status_code=500, detail="Failed to create tracker")

    return data[0]


@router.get("")
def get_trackers():
    return get_all_trackers()


@router.get("/{tracker_id}")
def get_tracker_by_id(tracker_id: str):
    data = get_tracker_by_id_record(tracker_id)

    if not data:
        raise HTTPException(status_code=404, detail="Tracker not found")

    return data[0]


@router.patch("/{tracker_id}")
def update_tracker(tracker_id: str, tracker_update: TrackerUpdate):
    update_data = tracker_update.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update")

    data = update_tracker_record(tracker_id, update_data)

    if not data:
        raise HTTPException(status_code=404, detail="Tracker not found")

    return data[0]
