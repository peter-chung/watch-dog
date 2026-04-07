from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.database.supabase import supabase

security = HTTPBearer()


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    token = credentials.credentials

    try:
        user_response = supabase.auth.get_user(token)
        user = user_response.user if hasattr(user_response, "user") else user_response
        user_id = getattr(user, "id", None)

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token.")

        return user_id
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Unauthorized.")
