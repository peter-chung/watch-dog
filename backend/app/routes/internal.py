import logging

from fastapi import APIRouter, Depends, HTTPException

from app.dependencies.internal import verify_internal_request
from app.services.scheduler import run_all_tracker_checks

router = APIRouter(prefix="/internal", tags=["internal"])
logger = logging.getLogger(__name__)


@router.api_route("/run-checks", methods=["GET", "POST"])
def run_scheduled_checks(_: None = Depends(verify_internal_request)):
    try:
        summary = run_all_tracker_checks()
        return {
            "ok": summary["failed"] == 0,
            "summary": summary,
        }
    except HTTPException:
        raise
    except Exception:
        logger.exception("Internal scheduled check trigger failed.")
        raise HTTPException(
            status_code=500,
            detail="Unexpected error while running scheduled checks.",
        )
