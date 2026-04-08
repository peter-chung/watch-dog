from app.database.supabase import supabase


def get_user_email_by_id(user_id: str) -> str:
    response = supabase.auth.admin.get_user_by_id(user_id)
    user = response.user if hasattr(response, "user") else response
    email = getattr(user, "email", None)

    if not email:
        raise ValueError("User email not found.")

    return email
