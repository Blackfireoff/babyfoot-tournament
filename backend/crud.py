from sqlalchemy.orm import Session
import uuid
from typing import List, Optional

import models
import schemas
import auth

# Opérations CRUD pour les utilisateurs
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(username=user.username, email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user: schemas.UserUpdate):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user is None:
        return None
    
    update_data = user.dict(exclude_unset=True)
    if "password" in update_data:
        update_data["hashed_password"] = auth.get_password_hash(update_data.pop("password"))
    
    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

# Opérations CRUD pour les équipes
def get_team(db: Session, team_id: int):
    return db.query(models.Team).filter(models.Team.id == team_id).first()

def get_teams(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Team).offset(skip).limit(limit).all()

def get_user_teams(db: Session, user_id: int):
    return db.query(models.Team).filter(models.Team.owner_id == user_id).all()

def create_team(db: Session, team: schemas.TeamCreate, user_id: int):
    db_team = models.Team(name=team.name, owner_id=user_id)
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    return db_team

def update_team(db: Session, team_id: int, team: schemas.TeamBase):
    db_team = db.query(models.Team).filter(models.Team.id == team_id).first()
    if db_team is None:
        return None
    
    for key, value in team.dict().items():
        setattr(db_team, key, value)
    
    db.commit()
    db.refresh(db_team)
    return db_team

def delete_team(db: Session, team_id: int):
    db_team = db.query(models.Team).filter(models.Team.id == team_id).first()
    if db_team is None:
        return False
    
    db.delete(db_team)
    db.commit()
    return True

# Opérations CRUD pour les joueurs
def get_player(db: Session, player_id: int):
    return db.query(models.Player).filter(models.Player.id == player_id).first()

def get_team_players(db: Session, team_id: int):
    return db.query(models.Player).filter(models.Player.team_id == team_id).all()

def create_player(db: Session, player: schemas.PlayerCreate, team_id: int):
    db_player = models.Player(**player.dict(), team_id=team_id)
    db.add(db_player)
    db.commit()
    db.refresh(db_player)
    return db_player

def update_player(db: Session, player_id: int, player: schemas.PlayerBase):
    db_player = db.query(models.Player).filter(models.Player.id == player_id).first()
    if db_player is None:
        return None
    
    for key, value in player.dict().items():
        setattr(db_player, key, value)
    
    db.commit()
    db.refresh(db_player)
    return db_player

def delete_player(db: Session, player_id: int):
    db_player = db.query(models.Player).filter(models.Player.id == player_id).first()
    if db_player is None:
        return False
    
    db.delete(db_player)
    db.commit()
    return True

# Opérations CRUD pour les tournois
def get_tournament(db: Session, tournament_id: int):
    return db.query(models.Tournament).filter(models.Tournament.id == tournament_id).first()

def get_tournaments(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Tournament).offset(skip).limit(limit).all()

def create_tournament(db: Session, tournament: schemas.TournamentCreate):
    db_tournament = models.Tournament(**tournament.dict(), status="open")
    db.add(db_tournament)
    db.commit()
    db.refresh(db_tournament)
    return db_tournament

def update_tournament(db: Session, tournament_id: int, tournament: schemas.TournamentBase):
    db_tournament = db.query(models.Tournament).filter(models.Tournament.id == tournament_id).first()
    if db_tournament is None:
        return None
    
    for key, value in tournament.dict().items():
        setattr(db_tournament, key, value)
    
    db.commit()
    db.refresh(db_tournament)
    return db_tournament

def delete_tournament(db: Session, tournament_id: int):
    db_tournament = db.query(models.Tournament).filter(models.Tournament.id == tournament_id).first()
    if db_tournament is None:
        return False
    
    db.delete(db_tournament)
    db.commit()
    return True

def join_tournament(db: Session, tournament_id: int, team_id: int):
    db_tournament = db.query(models.Tournament).filter(models.Tournament.id == tournament_id).first()
    db_team = db.query(models.Team).filter(models.Team.id == team_id).first()
    
    if db_tournament is None or db_team is None:
        return False
    
    if db_team in db_tournament.teams:
        return True  # L'équipe est déjà dans le tournoi
    
    if len(db_tournament.teams) >= db_tournament.max_teams:
        return False  # Le tournoi est complet
    
    db_tournament.teams.append(db_team)
    db.commit()
    return True

def leave_tournament(db: Session, tournament_id: int, team_id: int):
    db_tournament = db.query(models.Tournament).filter(models.Tournament.id == tournament_id).first()
    db_team = db.query(models.Team).filter(models.Team.id == team_id).first()
    
    if db_tournament is None or db_team is None:
        return False
    
    if db_team not in db_tournament.teams:
        return True  # L'équipe n'est pas dans le tournoi
    
    db_tournament.teams.remove(db_team)
    db.commit()
    return True

def start_tournament(db: Session, tournament_id: int):
    db_tournament = db.query(models.Tournament).filter(models.Tournament.id == tournament_id).first()
    if db_tournament is None:
        return False
    
    if db_tournament.status != "open":
        return False  # Le tournoi n'est pas ouvert
    
    if len(db_tournament.teams) < 2:
        return False  # Pas assez d'équipes
    
    db_tournament.status = "in_progress"
    
    # Création des matchs du premier tour
    teams = db_tournament.teams
    for i in range(0, len(teams), 2):
        if i + 1 < len(teams):
            match_id = f"round1-match{i//2+1}"
            db_match = models.Match(
                id=match_id,
                tournament_id=tournament_id,
                team1_id=teams[i].id,
                team2_id=teams[i+1].id,
                round=1,
                match_number=i//2+1
            )
            db.add(db_match)
    
    db.commit()
    return True

# Opérations CRUD pour les matchs
def get_match(db: Session, match_id: str):
    return db.query(models.Match).filter(models.Match.id == match_id).first()

def get_tournament_matches(db: Session, tournament_id: int):
    return db.query(models.Match).filter(models.Match.tournament_id == tournament_id).all()

def update_match_score(db: Session, match_id: str, team1_score: int, team2_score: int):
    db_match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if db_match is None:
        return None
    
    db_match.team1_score = team1_score
    db_match.team2_score = team2_score
    db.commit()
    db.refresh(db_match)
    return db_match

# Opérations pour le classement
def get_team_rankings(db: Session):
    teams = db.query(models.Team).all()
    rankings = []
    
    for team in teams:
        wins = 0
        losses = 0
        
        # Compter les victoires et défaites en tant qu'équipe 1
        team1_matches = db.query(models.Match).filter(
            models.Match.team1_id == team.id,
            models.Match.team1_score != None,
            models.Match.team2_score != None
        ).all()
        
        for match in team1_matches:
            if match.team1_score > match.team2_score:
                wins += 1
            else:
                losses += 1
        
        # Compter les victoires et défaites en tant qu'équipe 2
        team2_matches = db.query(models.Match).filter(
            models.Match.team2_id == team.id,
            models.Match.team1_score != None,
            models.Match.team2_score != None
        ).all()
        
        for match in team2_matches:
            if match.team2_score > match.team1_score:
                wins += 1
            else:
                losses += 1
        
        # Calculer les points (3 points par victoire)
        points = wins * 3
        
        rankings.append({
            "id": team.id,
            "name": team.name,
            "wins": wins,
            "losses": losses,
            "points": points
        })
    
    # Trier par points (décroissant)
    rankings.sort(key=lambda x: x["points"], reverse=True)
    return rankings

def get_player_rankings(db: Session):
    players = db.query(models.Player).all()
    rankings = []
    
    for player in players:
        team_name = player.team.name if player.team else "Sans équipe"
        
        rankings.append({
            "id": player.id,
            "name": player.name,
            "team": team_name,
            "goals": player.goals,
            "assists": player.assists
        })
    
    # Trier par buts (décroissant)
    rankings.sort(key=lambda x: x["goals"], reverse=True)
    return rankings

# Opérations pour les matchs d'un utilisateur
def get_user_matches(db: Session, user_id: int):
    # Récupérer les équipes de l'utilisateur
    user_teams = db.query(models.Team).filter(models.Team.owner_id == user_id).all()
    user_team_ids = [team.id for team in user_teams]
    
    # Récupérer les matchs où l'utilisateur est impliqué
    matches = db.query(models.Match).filter(
        (models.Match.team1_id.in_(user_team_ids)) | 
        (models.Match.team2_id.in_(user_team_ids))
    ).all()
    
    result = []
    for match in matches:
        tournament = db.query(models.Tournament).filter(models.Tournament.id == match.tournament_id).first()
        team1 = db.query(models.Team).filter(models.Team.id == match.team1_id).first()
        team2 = db.query(models.Team).filter(models.Team.id == match.team2_id).first()
        
        # Déterminer l'équipe de l'utilisateur et l'adversaire
        if match.team1_id in user_team_ids:
            user_team = team1
            opponent = team2
        else:
            user_team = team2
            opponent = team1
        
        result.append({
            "id": match.id,
            "tournament": tournament.name,
            "opponent": opponent.name,
            "date": tournament.date,
            "team": user_team.name
        })
    
    return result 