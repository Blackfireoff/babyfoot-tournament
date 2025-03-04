from fastapi import FastAPI, HTTPException, Depends, status, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

import models
import schemas
import crud
import auth
from database import engine, get_db

# Création des tables dans la base de données
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="BabyFoot Tournament API")

# Configuration CORS pour permettre les requêtes du frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En production, spécifiez l'origine exacte
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes pour l'authentification
@app.post("/api/auth/register", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
async def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    return crud.create_user(db=db, user=user)

@app.post("/api/auth/login", response_model=schemas.Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

# Routes pour les équipes
@app.get("/api/teams", response_model=List[schemas.Team])
async def get_teams(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    teams = crud.get_teams(db, skip=skip, limit=limit)
    return teams

@app.get("/api/teams/{team_id}", response_model=schemas.Team)
async def get_team(team_id: int, db: Session = Depends(get_db)):
    db_team = crud.get_team(db, team_id=team_id)
    if db_team is None:
        raise HTTPException(status_code=404, detail="Team not found")
    return db_team

@app.post("/api/teams", response_model=schemas.Team, status_code=status.HTTP_201_CREATED)
async def create_team(
    team: schemas.TeamCreate, 
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    return crud.create_team(db=db, team=team, user_id=current_user.id)

@app.put("/api/teams/{team_id}", response_model=schemas.Team)
async def update_team(
    team_id: int, 
    team: schemas.TeamBase, 
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    db_team = crud.get_team(db, team_id=team_id)
    if db_team is None:
        raise HTTPException(status_code=404, detail="Team not found")
    
    if db_team.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return crud.update_team(db=db, team_id=team_id, team=team)

@app.delete("/api/teams/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_team(
    team_id: int, 
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    db_team = crud.get_team(db, team_id=team_id)
    if db_team is None:
        raise HTTPException(status_code=404, detail="Team not found")
    
    if db_team.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    crud.delete_team(db=db, team_id=team_id)
    return None

@app.post("/api/teams/{team_id}/players", response_model=schemas.Player)
async def add_player(
    team_id: int, 
    player: schemas.PlayerCreate, 
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    db_team = crud.get_team(db, team_id=team_id)
    if db_team is None:
        raise HTTPException(status_code=404, detail="Team not found")
    
    if db_team.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return crud.create_player(db=db, player=player, team_id=team_id)

@app.put("/api/teams/{team_id}/players/{player_id}", response_model=schemas.Player)
async def update_player(
    team_id: int, 
    player_id: int, 
    player: schemas.PlayerBase, 
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    db_team = crud.get_team(db, team_id=team_id)
    if db_team is None:
        raise HTTPException(status_code=404, detail="Team not found")
    
    if db_team.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    db_player = crud.get_player(db, player_id=player_id)
    if db_player is None:
        raise HTTPException(status_code=404, detail="Player not found")
    
    if db_player.team_id != team_id:
        raise HTTPException(status_code=400, detail="Player does not belong to this team")
    
    return crud.update_player(db=db, player_id=player_id, player=player)

@app.delete("/api/teams/{team_id}/players/{player_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_player(
    team_id: int, 
    player_id: int, 
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    db_team = crud.get_team(db, team_id=team_id)
    if db_team is None:
        raise HTTPException(status_code=404, detail="Team not found")
    
    if db_team.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    db_player = crud.get_player(db, player_id=player_id)
    if db_player is None:
        raise HTTPException(status_code=404, detail="Player not found")
    
    if db_player.team_id != team_id:
        raise HTTPException(status_code=400, detail="Player does not belong to this team")
    
    crud.delete_player(db=db, player_id=player_id)
    return None

# Routes pour les tournois
@app.get("/api/tournaments", response_model=List[schemas.Tournament])
async def get_tournaments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    tournaments = crud.get_tournaments(db, skip=skip, limit=limit)
    return tournaments

@app.get("/api/tournaments/{tournament_id}", response_model=schemas.Tournament)
async def get_tournament(tournament_id: int, db: Session = Depends(get_db)):
    db_tournament = crud.get_tournament(db, tournament_id=tournament_id)
    if db_tournament is None:
        raise HTTPException(status_code=404, detail="Tournament not found")
    return db_tournament

@app.post("/api/tournaments", response_model=schemas.Tournament, status_code=status.HTTP_201_CREATED)
async def create_tournament(
    tournament: schemas.TournamentCreate, 
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    return crud.create_tournament(db=db, tournament=tournament, user_id=current_user.id)

@app.put("/api/tournaments/{tournament_id}", response_model=schemas.Tournament)
async def update_tournament(
    tournament_id: int, 
    tournament: schemas.TournamentBase, 
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    db_tournament = crud.get_tournament(db, tournament_id=tournament_id)
    if db_tournament is None:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    return crud.update_tournament(db=db, tournament_id=tournament_id, tournament=tournament)

@app.delete("/api/tournaments/{tournament_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tournament(
    tournament_id: int, 
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    db_tournament = crud.get_tournament(db, tournament_id=tournament_id)
    if db_tournament is None:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    crud.delete_tournament(db=db, tournament_id=tournament_id)
    return None

@app.post("/api/tournaments/{tournament_id}/teams/{team_id}", status_code=status.HTTP_200_OK)
async def join_tournament(
    tournament_id: int, 
    team_id: int, 
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    db_team = crud.get_team(db, team_id=team_id)
    if db_team is None:
        raise HTTPException(status_code=404, detail="Team not found")
    
    if db_team.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    db_tournament = crud.get_tournament(db, tournament_id=tournament_id)
    if db_tournament is None:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    if db_tournament.status != "open":
        raise HTTPException(status_code=400, detail="Tournament is not open for registration")
    
    success = crud.join_tournament(db=db, tournament_id=tournament_id, team_id=team_id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to join tournament")
    
    return {"message": "Team added to tournament successfully"}

@app.delete("/api/tournaments/{tournament_id}/teams/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
async def leave_tournament(
    tournament_id: int, 
    team_id: int, 
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    db_team = crud.get_team(db, team_id=team_id)
    if db_team is None:
        raise HTTPException(status_code=404, detail="Team not found")
    
    if db_team.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    db_tournament = crud.get_tournament(db, tournament_id=tournament_id)
    if db_tournament is None:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    if db_tournament.status != "open":
        raise HTTPException(status_code=400, detail="Tournament is not open for registration")
    
    crud.leave_tournament(db=db, tournament_id=tournament_id, team_id=team_id)
    return None

@app.post("/api/tournaments/{tournament_id}/start", status_code=status.HTTP_200_OK)
async def start_tournament(
    tournament_id: int, 
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    db_tournament = crud.get_tournament(db, tournament_id=tournament_id)
    if db_tournament is None:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    # Vérifier que l'utilisateur est le propriétaire du tournoi
    if db_tournament.owner_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    matches = crud.start_tournament(db=db, tournament_id=tournament_id)
    if not matches:
        raise HTTPException(status_code=400, detail="Failed to start tournament")
    
    return {"message": "Tournament started successfully", "matches": matches}

# Routes pour les matchs
@app.get("/api/tournaments/{tournament_id}/matches", response_model=List[schemas.Match])
async def get_tournament_matches(tournament_id: int, db: Session = Depends(get_db)):
    db_tournament = crud.get_tournament(db, tournament_id=tournament_id)
    if db_tournament is None:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    return crud.get_tournament_matches(db=db, tournament_id=tournament_id)

@app.put("/api/matches/{match_id}", response_model=schemas.Match)
async def update_match_score(
    match_id: str, 
    team1_score: int = Body(...), 
    team2_score: int = Body(...), 
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    db_match = crud.get_match(db, match_id=match_id)
    if db_match is None:
        raise HTTPException(status_code=404, detail="Match not found")
    
    return crud.update_match_score(db=db, match_id=match_id, team1_score=team1_score, team2_score=team2_score)

# Routes pour le classement
@app.get("/api/scoreboard/teams", response_model=List[schemas.ScoreboardTeam])
async def get_team_rankings(db: Session = Depends(get_db)):
    return crud.get_team_rankings(db=db)

@app.get("/api/scoreboard/players", response_model=List[schemas.ScoreboardPlayer])
async def get_player_rankings(db: Session = Depends(get_db)):
    return crud.get_player_rankings(db=db)

# Routes pour le profil utilisateur
@app.get("/api/users", response_model=List[schemas.User])
async def get_users(db: Session = Depends(get_db)):
    return crud.get_users(db)

@app.get("/api/users/{user_id}", response_model=schemas.User)
async def get_user_profile(
    user_id: int, 
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    return db_user

@app.get("/api/users/{user_id}/matches")
async def get_user_matches(
    user_id: int, 
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return crud.get_user_matches(db=db, user_id=user_id)

@app.get("/api/users/{user_id}/teams", response_model=List[schemas.Team])
async def get_user_teams(
    user_id: int, 
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return crud.get_user_teams(db=db, user_id=user_id)

@app.put("/api/users/{user_id}", response_model=schemas.User)
async def update_user(
    user_id: int, 
    user_update: schemas.UserUpdate, 
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    db_user = crud.update_user(db=db, user_id=user_id, user=user_update)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    return db_user

# Route pour vérifier si un utilisateur existe
@app.get("/api/users/check/{username}")
async def check_username(username: str, db: Session = Depends(get_db)):
    user = crud.check_user_exists(db, username=username)
    return {"exists": user is not None}

# Routes pour les invitations de joueurs
@app.post("/api/teams/{team_id}/invite", response_model=schemas.Player)
async def invite_player(
    team_id: int, 
    username: str = Body(..., embed=True), 
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Vérifier que l'utilisateur est le propriétaire de l'équipe
    team = crud.get_team(db, team_id=team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    if team.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Inviter le joueur
    player = crud.invite_player_to_team(db, team_id=team_id, username=username)
    if not player:
        raise HTTPException(status_code=404, detail="User not found")
    
    return player

# Routes pour les notifications
@app.get("/api/users/{user_id}/notifications", response_model=List[schemas.Notification])
async def get_notifications(
    user_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return crud.get_user_notifications(db, user_id=user_id)

@app.put("/api/notifications/{notification_id}/read", response_model=schemas.Notification)
async def mark_notification_read(
    notification_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    notification = crud.mark_notification_as_read(db, notification_id=notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    if notification.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return notification

# Route pour répondre à une invitation d'équipe
@app.put("/api/players/{player_id}/respond", response_model=schemas.Player)
async def respond_to_invitation(
    player_id: int,
    accept: bool = Body(..., embed=True),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    player = db.query(models.Player).filter(models.Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    if player.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return crud.respond_to_team_invitation(db, player_id=player_id, accept=accept)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)