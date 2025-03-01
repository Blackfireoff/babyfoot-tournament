from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from app.schemas.user import User

# Schéma de base pour les équipes
class TeamBase(BaseModel):
    name: str
    description: Optional[str] = None

# Schéma pour la création d'une équipe
class TeamCreate(TeamBase):
    pass

# Schéma pour la mise à jour d'une équipe
class TeamUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

# Schéma pour l'affichage d'un membre d'équipe
class TeamMemberBase(BaseModel):
    user_id: int
    is_captain: bool = False

# Schéma pour la création d'un membre d'équipe
class TeamMemberCreate(TeamMemberBase):
    pass

# Schéma pour l'affichage d'un membre d'équipe
class TeamMember(TeamMemberBase):
    id: int
    team_id: int
    joined_at: datetime
    user: User

    class Config:
        from_attributes = True

# Schéma pour l'affichage d'une équipe
class Team(TeamBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    members: List[TeamMember] = []

    class Config:
        from_attributes = True 