from pydantic import BaseModel, EmailStr, HttpUrl, field_validator
from typing import Optional


class TrackerCreate(BaseModel):
    url: HttpUrl
    selector: str
    email: EmailStr

    @field_validator("selector")
    @classmethod
    def selector_must_not_be_empty(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Selector cannot be empty")
        return value


class TrackerUpdate(BaseModel):
    is_active: Optional[bool] = None
    selector: Optional[str] = None
    email: Optional[EmailStr] = None

    @field_validator("selector")
    @classmethod
    def selector_must_not_be_empty(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        value = value.strip()
        if not value:
            raise ValueError("Selector cannot be empty")
        return value


class TrackerResponse(BaseModel):
    id: str
    url: str
    selector: str
    email: str
    last_content: Optional[str] = None
    last_checked_at: Optional[str] = None
    last_changed_at: Optional[str] = None
    is_active: bool
    created_at: str
    updated_at: Optional[str] = None
