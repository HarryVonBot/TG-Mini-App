# User model definitions
from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime

class User(BaseModel):
    user_id: str
    email: Optional[str] = None
    name: Optional[str] = None
    phone: Optional[str] = None
    type: Optional[Literal['bank', 'crypto', 'login', 'signup']] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class UserPreferences(BaseModel):
    user_id: str
    theme: str = "dark"
    onboarding_complete: bool = False
    notifications_enabled: bool = True
    updated_at: Optional[datetime] = None