from datetime import datetime, timezone
from typing import Any

from app.database.supabase import supabase


def create_tracker_record(payload: dict[str, Any]):
    response = supabase.table("trackers").insert(payload).execute()
    return response.data


def get_all_trackers():
    response = supabase.table("trackers").select("*").order("created_at", desc=True).execute()
    return response.data


def get_all_trackers_for_user(user_id: str):
    response = (
        supabase.table("trackers")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return response.data


def get_tracker_by_id_record(tracker_id: str):
    response = (
        supabase.table("trackers")
        .select("*")
        .eq("id", tracker_id)
        .limit(1)
        .execute()
    )
    return response.data


def get_tracker_by_id_record_for_user(tracker_id: str, user_id: str):
    response = (
        supabase.table("trackers")
        .select("*")
        .eq("id", tracker_id)
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )
    return response.data


def delete_tracker_record_for_user(tracker_id: str, user_id: str):
    response = (
        supabase.table("trackers")
        .delete()
        .eq("id", tracker_id)
        .eq("user_id", user_id)
        .execute()
    )
    return response.data


def update_tracker_record(tracker_id: str, update_data: dict):
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()

    response = (
        supabase.table("trackers")
        .update(update_data)
        .eq("id", tracker_id)
        .execute()
    )
    return response.data


def update_tracker_record_for_user(tracker_id: str, user_id: str, update_data: dict):
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()

    response = (
        supabase.table("trackers")
        .update(update_data)
        .eq("id", tracker_id)
        .eq("user_id", user_id)
        .execute()
    )
    return response.data


def create_change_log(payload: dict[str, Any]):
    response = supabase.table("change_logs").insert(payload).execute()
    return response.data


def get_change_logs_for_tracker(tracker_id: str):
    response = (
        supabase.table("change_logs")
        .select("*")
        .eq("tracker_id", tracker_id)
        .order("changed_at", desc=True)
        .execute()
    )
    return response.data


def get_change_logs_for_tracker_for_user(tracker_id: str, user_id: str):
    tracker = get_tracker_by_id_record_for_user(tracker_id, user_id)

    if not tracker:
        return []

    return get_change_logs_for_tracker(tracker_id)


def get_active_trackers():
    response = (
        supabase.table("trackers")
        .select("*")
        .eq("is_active", True)
        .order("created_at", desc=True)
        .execute()
    )
    return response.data
