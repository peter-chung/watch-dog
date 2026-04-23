from app.database.supabase import close_supabase
from app.services.scheduler import exit_code_from_summary, run_all_tracker_checks


def main() -> int:
    try:
        summary = run_all_tracker_checks()
        return exit_code_from_summary(summary)
    finally:
        close_supabase()


if __name__ == "__main__":
    raise SystemExit(main())
