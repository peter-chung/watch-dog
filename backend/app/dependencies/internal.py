import hmac
import os

from fastapi import Depends, Header, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

cron_bearer = HTTPBearer(auto_error=False)


def get_cron_secret() -> str:
    cron_secret = os.getenv("CRON_SECRET", "").strip()

    if not cron_secret:
        raise HTTPException(
            status_code=500,
            detail="CRON_SECRET is not configured.",
        )

    return cron_secret


def verify_internal_request(
    credentials: HTTPAuthorizationCredentials | None = Depends(cron_bearer),
    x_cron_secret: str | None = Header(default=None),
) -> None:
    expected_secret = get_cron_secret()
    candidate_secrets: list[str] = []

    if credentials and credentials.scheme.lower() == "bearer":
        candidate_secrets.append(credentials.credentials)

    if x_cron_secret:
        candidate_secrets.append(x_cron_secret)

    if any(hmac.compare_digest(secret, expected_secret) for secret in candidate_secrets):
        return

    raise HTTPException(status_code=401, detail="Unauthorized.")
