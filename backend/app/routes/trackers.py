from fastapi import APIRouter, Depends, HTTPException

from app.dependencies.auth import get_current_user_id
from app.schemas.tracker import TrackerCreate, TrackerUpdate, TrackerTestRequest
from app.services.fetcher import fetch_html
from app.services.parser import extract_content
from app.services.trackers import (
    create_tracker_record,
    get_all_trackers_for_user,
    get_tracker_by_id_record_for_user,
    update_tracker_record_for_user,
)
from app.services.checker import check_tracker

router = APIRouter(prefix="/trackers", tags=["trackers"])


@router.post("")
def create_tracker(tracker: TrackerCreate, user_id: str = Depends(get_current_user_id)):
    payload = {
        "url": str(tracker.url),
        "selector": tracker.selector,
        "email": tracker.email,
        "is_active": True,
        "user_id": user_id,
    }

    data = create_tracker_record(payload)

    if not data:
        raise HTTPException(status_code=500, detail="Failed to create tracker")

    return data[0]


@router.get("")
def get_trackers(user_id: str = Depends(get_current_user_id)):
    return get_all_trackers_for_user(user_id)


@router.get("/{tracker_id}")
def get_tracker_by_id(tracker_id: str, user_id: str = Depends(get_current_user_id)):
    data = get_tracker_by_id_record_for_user(tracker_id, user_id)

    if not data:
        raise HTTPException(status_code=404, detail="Tracker not found")

    return data[0]


@router.patch("/{tracker_id}")
def update_tracker(
    tracker_id: str,
    tracker_update: TrackerUpdate,
    user_id: str = Depends(get_current_user_id),
):
    update_data = tracker_update.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update")

    data = update_tracker_record_for_user(tracker_id, user_id, update_data)

    if not data:
        raise HTTPException(status_code=404, detail="Tracker not found")

    return data[0]


@router.post("/test")
def test_tracker(tracker_test: TrackerTestRequest):
    try:
        html = fetch_html(str(tracker_test.url))
        preview = extract_content(html, tracker_test.selector)
        return {"preview": preview}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    # except Exception:
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            # detail="Failed to fetch or parse the webpage.",
            detail=f"Failed to fetch or parse the webpage: {str(exc)}",
        )


@router.post("/{tracker_id}/check")
def run_tracker_check(tracker_id: str, user_id: str = Depends(get_current_user_id)):
    try:
        tracker = get_tracker_by_id_record_for_user(tracker_id, user_id)

        if not tracker:
            raise HTTPException(status_code=404, detail="Tracker not found")

        return check_tracker(tracker_id)
    except HTTPException:
        raise
    except ValueError as exc:
        message = str(exc)

        if message == "Tracker not found.":
            raise HTTPException(status_code=404, detail=message)

        raise HTTPException(status_code=400, detail=message)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error while checking tracker: {str(exc)}",
        )
