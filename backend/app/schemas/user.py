from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# Schéma de base pour les utilisateurs
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None

# Schéma pour la création d'un utilisateur
class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

# Schéma pour la mise à jour d'un utilisateur
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    password: Optional[str] = Field(None, min_length=8)
    is_active: Optional[bool] = None

# Schéma pour l'affichage d'un utilisateur
class User(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Schéma pour l'authentification
class Token(BaseModel):
    access_token: str
    token_type: str

# Schéma pour les données du token
class TokenData(BaseModel):
    username: Optional[str] = None 