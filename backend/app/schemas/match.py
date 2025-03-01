from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

from app.schemas.team import Team
from app.schemas.user import User

# Enum pour le statut du match
class MatchStatusEnum(str, Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

# Schéma de base pour les matchs
class MatchBase(BaseModel):
    tournament_id: int
    team1_id: int
    team2_id: int
    scheduled_time: Optional[datetime] = None

# Schéma pour la création d'un match
class MatchCreate(MatchBase):
    pass

# Schéma pour la mise à jour d'un match
class MatchUpdate(BaseModel):
    team1_score: Optional[int] = None
    team2_score: Optional[int] = None
    status: Optional[MatchStatusEnum] = None
    scheduled_time: Optional[datetime] = None
    completed_time: Optional[datetime] = None

# Schéma pour l'ajout d'un joueur à un match
class MatchPlayerCreate(BaseModel):
    user_id: int

# Schéma pour l'affichage d'un joueur de match
class MatchPlayer(BaseModel):
    match_id: int
    user_id: int
    user: User

    class Config:
        from_attributes = True

# Schéma pour l'affichage d'un match
class Match(MatchBase):
    id: int
    team1_score: Optional[int] = None
    team2_score: Optional[int] = None
    status: MatchStatusEnum
    completed_time: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    team1: Team
    team2: Team
    players: List[MatchPlayer] = []

    class Config:
        from_attributes = True 