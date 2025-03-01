from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date
from enum import Enum

from app.models.tournament import TournamentStatus
from app.schemas.team import Team

# Enum pour le statut du tournoi
class TournamentStatusEnum(str, Enum):
    DRAFT = "draft"
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

# Schéma de base pour les tournois
class TournamentBase(BaseModel):
    name: str
    description: Optional[str] = None
    date: date
    location: str
    max_teams: int
    rules: Optional[str] = None

# Schéma pour la création d'un tournoi
class TournamentCreate(TournamentBase):
    pass

# Schéma pour la mise à jour d'un tournoi
class TournamentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    date: Optional[date] = None
    location: Optional[str] = None
    max_teams: Optional[int] = None
    status: Optional[TournamentStatusEnum] = None
    rules: Optional[str] = None

# Schéma pour l'inscription d'une équipe à un tournoi
class TournamentTeamCreate(BaseModel):
    team_id: int

# Schéma pour l'affichage d'une équipe inscrite à un tournoi
class TournamentTeam(BaseModel):
    id: int
    tournament_id: int
    team_id: int
    registered_at: datetime
    is_confirmed: bool
    team: Team

    class Config:
        from_attributes = True

# Schéma pour l'affichage d'un tournoi
class Tournament(TournamentBase):
    id: int
    organizer_id: int
    status: TournamentStatusEnum
    created_at: datetime
    updated_at: Optional[datetime] = None
    teams: List[TournamentTeam] = []

    class Config:
        from_attributes = True 