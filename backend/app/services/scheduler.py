from app.services.checker import check_tracker
from app.services.trackers import get_active_trackers


def run_all_tracker_checks() -> dict[str, int]:
    trackers = get_active_trackers()
    summary = {
        "total": len(trackers),
        "succeeded": 0,
        "failed": 0,
        "baseline_saved": 0,
        "no_change": 0,
        "changed": 0,
    }

    print(f"Running scheduled checks for {len(trackers)} active tracker(s).")

    for tracker in trackers:
        tracker_id = tracker["id"]

        if not tracker.get("is_active", False):
            print(f"[{tracker_id}] scheduled check skipped: tracker is inactive")
            continue

        try:
            result = check_tracker(tracker_id)
            status = result.get("status", "unknown")
            summary["succeeded"] += 1

            if status in summary:
                summary[status] += 1

            print(
                f"[{tracker_id}] status={status} message={result.get('message')}"
            )
        except Exception as exc:
            summary["failed"] += 1
            print(f"[{tracker_id}] scheduled check failed: {str(exc)}")

    print(
        "Scheduled check summary: "
        f"total={summary['total']} "
        f"succeeded={summary['succeeded']} "
        f"failed={summary['failed']} "
        f"baseline_saved={summary['baseline_saved']} "
        f"no_change={summary['no_change']} "
        f"changed={summary['changed']}"
    )

    return summary


def exit_code_from_summary(summary: dict[str, int]) -> int:
    return 1 if summary["failed"] else 0
