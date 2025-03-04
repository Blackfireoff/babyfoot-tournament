from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid

app = FastAPI(title="BabyFoot Tournament API")

# Configuration CORS pour permettre les requêtes du frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En production, spécifiez l'origine exacte
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modèles de données
class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    teams: List[int] = []
    
    class Config:
        orm_mode = True

class PlayerBase(BaseModel):
    name: str
    is_starter: bool = False

class Player(PlayerBase):
    id: int
    
    class Config:
        orm_mode = True

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

class TournamentBase(BaseModel):
    name: str
    date: str
    max_teams: int

class TournamentCreate(TournamentBase):
    pass

class TournamentTeam(BaseModel):
    id: int
    name: str

class Tournament(TournamentBase):
    id: int
    status: str  # 'open', 'upcoming', 'in_progress', 'closed'
    teams: List[TournamentTeam] = []
    
    class Config:
        orm_mode = True

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

# Routes pour l'authentification
@app.post("/api/auth/register", response_model=User, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
    # Ici, vous implémenteriez la logique pour créer un utilisateur
    # Pour l'instant, nous retournons un utilisateur fictif
    return {
        "id": 1,
        "username": user.username,
        "email": user.email,
        "teams": []
    }

@app.post("/api/auth/login")
async def login(username: str, password: str):
    # Ici, vous implémenteriez la logique d'authentification
    # Pour l'instant, nous retournons un token fictif
    return {
        "access_token": "fake_token",
        "token_type": "bearer"
    }

# Routes pour les équipes
@app.get("/api/teams", response_model=List[Team])
async def get_teams():
    # Retourne toutes les équipes
    return [
        {
            "id": 1,
            "name": "Les Champions",
            "owner_id": 1,
            "players": [
                {"id": 1, "name": "John Doe", "is_starter": True},
                {"id": 2, "name": "Jane Smith", "is_starter": True},
                {"id": 3, "name": "Mike Johnson", "is_starter": False},
            ]
        },
        {
            "id": 2,
            "name": "Les Invincibles",
            "owner_id": 2,
            "players": [
                {"id": 4, "name": "Sarah Wilson", "is_starter": True},
            ]
        }
    ]

@app.get("/api/teams/{team_id}", response_model=Team)
async def get_team(team_id: int):
    # Retourne une équipe spécifique
    return {
        "id": team_id,
        "name": "Les Champions",
        "owner_id": 1,
        "players": [
            {"id": 1, "name": "John Doe", "is_starter": True},
            {"id": 2, "name": "Jane Smith", "is_starter": True},
            {"id": 3, "name": "Mike Johnson", "is_starter": False},
        ]
    }

@app.post("/api/teams", response_model=Team, status_code=status.HTTP_201_CREATED)
async def create_team(team: TeamCreate, user_id: int = 1):
    # Crée une nouvelle équipe
    return {
        "id": 3,
        "name": team.name,
        "owner_id": user_id,
        "players": []
    }

@app.put("/api/teams/{team_id}", response_model=Team)
async def update_team(team_id: int, team: TeamBase):
    # Met à jour une équipe
    return {
        "id": team_id,
        "name": team.name,
        "owner_id": 1,
        "players": [
            {"id": 1, "name": "John Doe", "is_starter": True},
            {"id": 2, "name": "Jane Smith", "is_starter": True},
            {"id": 3, "name": "Mike Johnson", "is_starter": False},
        ]
    }

@app.delete("/api/teams/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_team(team_id: int):
    # Supprime une équipe
    return None

@app.post("/api/teams/{team_id}/players", response_model=Player)
async def add_player(team_id: int, player: PlayerBase):
    # Ajoute un joueur à une équipe
    return {
        "id": 5,
        "name": player.name,
        "is_starter": player.is_starter
    }

@app.put("/api/teams/{team_id}/players/{player_id}", response_model=Player)
async def update_player(team_id: int, player_id: int, player: PlayerBase):
    # Met à jour un joueur
    return {
        "id": player_id,
        "name": player.name,
        "is_starter": player.is_starter
    }

@app.delete("/api/teams/{team_id}/players/{player_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_player(team_id: int, player_id: int):
    # Supprime un joueur
    return None

# Routes pour les tournois
@app.get("/api/tournaments", response_model=List[Tournament])
async def get_tournaments():
    # Retourne tous les tournois
    return [
        {
            "id": 1,
            "name": "Tournoi du Printemps",
            "date": "2024-04-15",
            "status": "open",
            "teams": [
                {"id": 1, "name": "Les Champions"},
                {"id": 2, "name": "Les Invincibles"},
            ],
            "max_teams": 8
        },
        {
            "id": 2,
            "name": "Coupe d'Été",
            "date": "2024-07-01",
            "status": "upcoming",
            "teams": [],
            "max_teams": 16
        }
    ]

@app.get("/api/tournaments/{tournament_id}", response_model=Tournament)
async def get_tournament(tournament_id: int):
    # Retourne un tournoi spécifique
    return {
        "id": tournament_id,
        "name": "Tournoi du Printemps",
        "date": "2024-04-15",
        "status": "open",
        "teams": [
            {"id": 1, "name": "Les Champions"},
            {"id": 2, "name": "Les Invincibles"},
        ],
        "max_teams": 8
    }

@app.post("/api/tournaments", response_model=Tournament, status_code=status.HTTP_201_CREATED)
async def create_tournament(tournament: TournamentCreate):
    # Crée un nouveau tournoi
    return {
        "id": 3,
        "name": tournament.name,
        "date": tournament.date,
        "status": "open",
        "teams": [],
        "max_teams": tournament.max_teams
    }

@app.put("/api/tournaments/{tournament_id}", response_model=Tournament)
async def update_tournament(tournament_id: int, tournament: TournamentBase):
    # Met à jour un tournoi
    return {
        "id": tournament_id,
        "name": tournament.name,
        "date": tournament.date,
        "status": "open",
        "teams": [
            {"id": 1, "name": "Les Champions"},
            {"id": 2, "name": "Les Invincibles"},
        ],
        "max_teams": tournament.max_teams
    }

@app.delete("/api/tournaments/{tournament_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tournament(tournament_id: int):
    # Supprime un tournoi
    return None

@app.post("/api/tournaments/{tournament_id}/teams/{team_id}", status_code=status.HTTP_200_OK)
async def join_tournament(tournament_id: int, team_id: int):
    # Ajoute une équipe à un tournoi
    return {"message": "Team added to tournament successfully"}

@app.delete("/api/tournaments/{tournament_id}/teams/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
async def leave_tournament(tournament_id: int, team_id: int):
    # Retire une équipe d'un tournoi
    return None

@app.post("/api/tournaments/{tournament_id}/start", status_code=status.HTTP_200_OK)
async def start_tournament(tournament_id: int):
    # Démarre un tournoi
    return {"message": "Tournament started successfully"}

# Routes pour les matchs
@app.get("/api/tournaments/{tournament_id}/matches", response_model=List[Match])
async def get_tournament_matches(tournament_id: int):
    # Retourne tous les matchs d'un tournoi
    return [
        {
            "id": "round1-match1",
            "tournament_id": tournament_id,
            "team1_id": 1,
            "team2_id": 2,
            "team1_score": 3,
            "team2_score": 4,
            "round": 1,
            "match_number": 1
        },
        {
            "id": "round1-match2",
            "tournament_id": tournament_id,
            "team1_id": 3,
            "team2_id": 4,
            "team1_score": 1,
            "team2_score": 4,
            "round": 1,
            "match_number": 2
        }
    ]

@app.put("/api/matches/{match_id}", response_model=Match)
async def update_match_score(match_id: str, team1_score: int, team2_score: int):
    # Met à jour le score d'un match
    return {
        "id": match_id,
        "tournament_id": 1,
        "team1_id": 1,
        "team2_id": 2,
        "team1_score": team1_score,
        "team2_score": team2_score,
        "round": 1,
        "match_number": 1
    }

# Routes pour le classement
@app.get("/api/scoreboard/teams", response_model=List[ScoreboardTeam])
async def get_team_rankings():
    # Retourne le classement des équipes
    return [
        {"id": 1, "name": "Les Champions", "wins": 15, "losses": 2, "points": 45},
        {"id": 2, "name": "Les Invincibles", "wins": 12, "losses": 5, "points": 36},
        {"id": 3, "name": "Les Titans", "wins": 10, "losses": 7, "points": 30},
        {"id": 4, "name": "Les Gladiateurs", "wins": 8, "losses": 9, "points": 24},
        {"id": 5, "name": "Les Warriors", "wins": 6, "losses": 11, "points": 18},
    ]

@app.get("/api/scoreboard/players", response_model=List[ScoreboardPlayer])
async def get_player_rankings():
    # Retourne le classement des joueurs
    return [
        {"id": 1, "name": "John Doe", "team": "Les Champions", "goals": 45, "assists": 30},
        {"id": 2, "name": "Jane Smith", "team": "Les Invincibles", "goals": 42, "assists": 28},
        {"id": 3, "name": "Mike Johnson", "team": "Les Titans", "goals": 38, "assists": 25},
        {"id": 4, "name": "Sarah Wilson", "team": "Les Gladiateurs", "goals": 35, "assists": 22},
        {"id": 5, "name": "Tom Brown", "team": "Les Warriors", "goals": 32, "assists": 20},
    ]

# Route pour le profil utilisateur
@app.get("/api/users/{user_id}", response_model=User)
async def get_user_profile(user_id: int):
    # Retourne le profil d'un utilisateur
    return {
        "id": user_id,
        "username": "John Doe",
        "email": "john.doe@example.com",
        "teams": [1, 3]
    }

@app.get("/api/users/{user_id}/matches")
async def get_user_matches(user_id: int):
    # Retourne les matchs à venir d'un utilisateur
    return [
        {
            "id": 1,
            "tournament": "Tournoi du Printemps",
            "opponent": "Les Invincibles",
            "date": "2024-04-15T14:00:00",
            "team": "Les Champions",
        },
        {
            "id": 2,
            "tournament": "Coupe d'Été",
            "opponent": "Les Warriors",
            "date": "2024-07-01T16:00:00",
            "team": "Les Titans",
        },
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)