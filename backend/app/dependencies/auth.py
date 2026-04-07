from typing import TypedDict

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.database.supabase import supabase

security = HTTPBearer()


class AuthenticatedUser(TypedDict):
    id: str
    email: str


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> AuthenticatedUser:
    token = credentials.credentials

    try:
        user_response = supabase.auth.get_user(token)
        user = user_response.user if hasattr(user_response, "user") else user_response
        user_id = getattr(user, "id", None)
        user_email = getattr(user, "email", None)

        if not user_id or not user_email:
            raise HTTPException(status_code=401, detail="Invalid token.")

        return {"id": user_id, "email": user_email}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Unauthorized.")


def get_current_user_id(
    user: AuthenticatedUser = Depends(get_current_user),
) -> str:
    return user["id"]
