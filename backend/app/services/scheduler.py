from apscheduler.schedulers.background import BackgroundScheduler

from app.services.checker import check_tracker
from app.services.trackers import get_active_trackers


scheduler = BackgroundScheduler()


def run_all_tracker_checks():
    trackers = get_active_trackers()

    print(f"Running scheduled checks for {len(trackers)} active tracker(s).")

    for tracker in trackers:
        tracker_id = tracker["id"]

        if not tracker.get("is_active", False):
            print(f"[{tracker_id}] scheduled check skipped: tracker is inactive")
            continue

        try:
            result = check_tracker(tracker_id)
            print(
                f"[{tracker_id}] status={result.get('status')} message={result.get('message')}"
            )
        except Exception as exc:
            print(f"[{tracker_id}] scheduled check failed: {str(exc)}")


def start_scheduler():
    if scheduler.running:
        return

    scheduler.add_job(
        run_all_tracker_checks,
        trigger="interval",
        hours=1,
        # seconds=30,  # For testing, run every 30 seconds. Change to hours=1 for production.
        id="tracker_check_job",
        replace_existing=True,
    )

    scheduler.start()
    print("Scheduler started. Running tracker checks every hour.")
