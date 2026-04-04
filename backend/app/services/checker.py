from datetime import datetime, timezone

from app.services.emailer import send_change_email
from app.services.fetcher import fetch_html
from app.services.parser import extract_content
from app.services.trackers import (
    create_change_log,
    get_tracker_by_id_record,
    update_tracker_record,
)


def check_tracker(tracker_id: str):
    tracker_data = get_tracker_by_id_record(tracker_id)

    if not tracker_data:
        raise ValueError("Tracker not found.")

    tracker = tracker_data[0]

    if not tracker["is_active"]:
        raise ValueError("Tracker is inactive.")

    html = fetch_html(tracker["url"])
    current_content = extract_content(html, tracker["selector"])

    now = datetime.now(timezone.utc).isoformat()
    last_content = tracker.get("last_content")

    # First run: save baseline only
    if not last_content:
        updated = update_tracker_record(
            tracker_id,
            {
                "last_content": current_content,
                "last_checked_at": now,
            },
        )
        return {
            "status": "baseline_saved",
            "message": "Initial content saved. No change notification triggered.",
            "tracker": updated[0] if updated else tracker,
        }

    # No change
    if current_content == last_content:
        updated = update_tracker_record(
            tracker_id,
            {
                "last_checked_at": now,
            },
        )
        return {
            "status": "no_change",
            "message": "No change detected.",
            "tracker": updated[0] if updated else tracker,
        }

    # Change detected
    create_change_log(
        {
            "tracker_id": tracker_id,
            "old_content": last_content,
            "new_content": current_content,
        }
    )

    updated = update_tracker_record(
        tracker_id,
        {
            "last_content": current_content,
            "last_checked_at": now,
            "last_changed_at": now,
        },
    )
    email_result = None
    email_error = None

    try:
        email_result = send_change_email(
            to_email=tracker["email"],
            tracker_url=tracker["url"],
            selector=tracker["selector"],
            old_content=last_content,
            new_content=current_content,
        )
    except Exception as exc:
        email_error = str(exc)

    return {
        "status": "changed",
        "message": "Change detected.",
        "old_content": last_content,
        "new_content": current_content,
        "tracker": updated[0] if updated else tracker,
        "email_sent": email_error is None,
        "email_error": email_error,
        "email_result": email_result,
    }
