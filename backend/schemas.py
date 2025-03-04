from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Schémas pour Player
class PlayerBase(BaseModel):
    name: str
    is_starter: bool = False

class PlayerCreate(PlayerBase):
    pass

class Player(PlayerBase):
    id: int
    team_id: int
    goals: int = 0
    assists: int = 0

    class Config:
        orm_mode = True

# Schémas pour Team
class TeamBase(BaseModel):
    name: str

class TeamCreate(TeamBase):
    pass

class Team(TeamBase):
    id: int
    owner_id: int
    players: List[Player] = []

    class Config:
        orm_mode = True

# Schémas pour User
class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None

class User(UserBase):
    id: int
    teams: List[int] = []

    class Config:
        orm_mode = True

# Schémas pour Tournament
class TournamentTeam(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True

class TournamentBase(BaseModel):
    name: str
    date: str
    max_teams: int

class TournamentCreate(TournamentBase):
    pass

class Tournament(TournamentBase):
    id: int
    status: str
    teams: List[TournamentTeam] = []

    class Config:
        orm_mode = True

# Schémas pour Match
class MatchBase(BaseModel):
    tournament_id: int
    team1_id: int
    team2_id: int
    round: int
    match_number: int

class MatchCreate(MatchBase):
    pass

class Match(MatchBase):
    id: str
    team1_score: Optional[int] = None
    team2_score: Optional[int] = None

    class Config:
        orm_mode = True

# Schémas pour Scoreboard
class ScoreboardTeam(BaseModel):
    id: int
    name: str
    wins: int
    losses: int
    points: int

class ScoreboardPlayer(BaseModel):
    id: int
    name: str
    team: str
    goals: int
    assists: int

# Schéma pour Token
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None 