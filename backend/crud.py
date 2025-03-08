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

def get_player_teams(db: Session, player_id: int):
    player = db.query(models.Player).filter(models.Player.id == player_id).first()
    if not player:
        return []
    
    # Récupérer l'équipe du joueur
    team = db.query(models.Team).filter(models.Team.id == player.team_id).first()
    if not team:
        return []
    
    return [team]

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

def create_tournament(db: Session, tournament: schemas.TournamentCreate, user_id: int):
    db_tournament = models.Tournament(**tournament.dict(), status="open", owner_id=user_id)
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
        raise ValueError(f"Tournament with ID {tournament_id} not found")
    
    if db_tournament.status != "open":
        raise ValueError(f"Tournament cannot be started because it is in '{db_tournament.status}' status")
    
    if len(db_tournament.teams) < 1:  # Permettre de démarrer avec au moins 1 équipe
        raise ValueError("Tournament cannot be started with less than 1 team")
    
    try:
        # Vérifier si des matchs existent déjà pour ce tournoi
        existing_matches = db.query(models.Match).filter(models.Match.tournament_id == tournament_id).all()
        if existing_matches:
            # Si des matchs existent déjà, supprimer tous les matchs existants
            for match in existing_matches:
                db.delete(match)
            
            # Commit pour s'assurer que les suppressions sont appliquées
            db.commit()
        
        # Mettre à jour le statut du tournoi
        db_tournament.status = "in_progress"
        db.commit()
        
        # Création des matchs du premier tour
        teams = db_tournament.teams
        created_matches = []
        
        # Déterminer le nombre de tours nécessaires
        max_teams = db_tournament.max_teams
        rounds = 1
        while 2**rounds < max_teams:
            rounds += 1
        
        # Calculer le nombre de matchs pour le premier tour
        first_round_matches = 2**(rounds-1)
        
        # Initialiser tous les matchs du premier tour
        for i in range(first_round_matches):
            match_id = f"round1-match{i+1}-tournament{tournament_id}"  # ID unique avec l'ID du tournoi
            
            # Vérifier si un match avec cet ID existe déjà
            existing_match = db.query(models.Match).filter(models.Match.id == match_id).first()
            if existing_match:
                raise ValueError(f"Match with ID {match_id} already exists. Cannot create duplicate match.")
            
            db_match = models.Match(
                id=match_id,
                tournament_id=tournament_id,
                team1_id=None,
                team2_id=None,
                round=1,
                match_number=i+1
            )
            db.add(db_match)
            created_matches.append(db_match)
        
        # Commit pour s'assurer que les matchs sont créés avant de les modifier
        db.commit()
        
        # Placer les équipes dans les matchs selon la logique décrite
        for i, team in enumerate(teams):
            position = i // 2  # Position dans la séquence (0, 1, 2, ...)
            is_team1 = (i % 2 == 0)  # Positions paires sont team1, impaires sont team2
            
            if position < len(created_matches):
                match = created_matches[position]
                if is_team1:
                    match.team1_id = team.id
                else:
                    match.team2_id = team.id
        
        # Commit pour s'assurer que les équipes sont placées
        db.commit()
        
        # Auto-valider les matchs avec une seule équipe
        for match in created_matches:
            if (match.team1_id and not match.team2_id) or (not match.team1_id and match.team2_id):
                # Si un match a une équipe mais pas l'autre, auto-valider
                if match.team1_id:
                    match.team1_score = 1
                    match.team2_score = 0
                else:
                    match.team1_score = 0
                    match.team2_score = 1
        
        # Commit pour s'assurer que les scores sont mis à jour
        db.commit()
        
        # Créer les matchs des tours suivants
        next_round_matches = []
        for round_num in range(2, rounds + 1):
            matches_in_round = 2**(rounds - round_num)
            round_matches = []
            
            for i in range(matches_in_round):
                match_id = f"round{round_num}-match{i+1}-tournament{tournament_id}"  # ID unique avec l'ID du tournoi
                
                # Vérifier si un match avec cet ID existe déjà
                existing_match = db.query(models.Match).filter(models.Match.id == match_id).first()
                if existing_match:
                    raise ValueError(f"Match with ID {match_id} already exists. Cannot create duplicate match.")
                
                db_match = models.Match(
                    id=match_id,
                    tournament_id=tournament_id,
                    team1_id=None,
                    team2_id=None,
                    round=round_num,
                    match_number=i+1
                )
                db.add(db_match)
                round_matches.append(db_match)
            
            next_round_matches.append(round_matches)
        
        # Commit pour s'assurer que tous les matchs sont créés
        db.commit()
        
        # Propager les gagnants des matchs auto-validés aux tours suivants
        matches_to_process = created_matches.copy()
        processed_matches = []
        
        while matches_to_process:
            current_match = matches_to_process.pop(0)
            
            # Si le match a déjà été traité, passer au suivant
            if current_match.id in processed_matches:
                continue
            
            processed_matches.append(current_match.id)
            
            # Si le match a un score, propager le gagnant
            if current_match.team1_score is not None and current_match.team2_score is not None:
                # Déterminer l'équipe gagnante
                winning_team_id = current_match.team1_id if current_match.team1_score > current_match.team2_score else current_match.team2_id
                
                # Trouver le match du tour suivant
                next_round = current_match.round + 1
                next_match_number = (current_match.match_number + 1) // 2
                
                # Rechercher le match suivant
                next_match = db.query(models.Match).filter(
                    models.Match.tournament_id == tournament_id,
                    models.Match.round == next_round,
                    models.Match.match_number == next_match_number
                ).first()
                
                if next_match:
                    # Déterminer si l'équipe gagnante doit être placée en team1 ou team2
                    if current_match.match_number % 2 == 1:
                        # Match impair, placer en team1
                        next_match.team1_id = winning_team_id
                    else:
                        # Match pair, placer en team2
                        next_match.team2_id = winning_team_id
                    
                    # Vérifier si le match suivant a maintenant une seule équipe (et pas l'autre)
                    if (next_match.team1_id and not next_match.team2_id) or (not next_match.team1_id and next_match.team2_id):
                        # Auto-valider ce match
                        if next_match.team1_id:
                            next_match.team1_score = 1
                            next_match.team2_score = 0
                        else:
                            next_match.team1_score = 0
                            next_match.team2_score = 1
                        
                        # Ajouter ce match à la liste des matchs à traiter
                        matches_to_process.append(next_match)
        
        # Commit final pour s'assurer que toutes les modifications sont enregistrées
        db.commit()
        
        # Auto-valider tous les matchs qui n'ont pas d'équipes ou une seule équipe
        auto_validate_empty_matches(db, tournament_id)
        
        # Vérifier si le tournoi est terminé après la création des matchs
        check_tournament_completed(db, tournament_id)
        
        # Récupérer tous les matchs créés pour les renvoyer
        all_matches = db.query(models.Match).filter(models.Match.tournament_id == tournament_id).all()
        return all_matches
    except Exception as e:
        # En cas d'erreur, annuler les modifications et relancer l'exception
        db.rollback()
        raise ValueError(f"Error starting tournament: {str(e)}")

def auto_validate_empty_matches(db: Session, tournament_id: int):
    """
    Auto-valide tous les matchs d'un tournoi qui n'ont pas d'équipes ou une seule équipe.
    """
    # Récupérer tous les matchs du tournoi
    all_matches = db.query(models.Match).filter(models.Match.tournament_id == tournament_id).all()
    
    for match in all_matches:
        # Si le match n'a pas de scores (n'est pas déjà validé)
        if match.team1_score is None or match.team2_score is None:
            # Cas 1: Match avec une seule équipe
            if (match.team1_id and not match.team2_id):
                match.team1_score = 1
                match.team2_score = 0
            elif (not match.team1_id and match.team2_id):
                match.team1_score = 0
                match.team2_score = 1
            # Cas 2: Match sans équipes
            elif not match.team1_id and not match.team2_id:
                match.team1_score = 0
                match.team2_score = 0
    
    # Commit pour s'assurer que les scores sont mis à jour
    db.commit()

# Opérations CRUD pour les matchs
def get_match(db: Session, match_id: str):
    return db.query(models.Match).filter(models.Match.id == match_id).first()

def get_tournament_matches(db: Session, tournament_id: int):
    return db.query(models.Match).filter(models.Match.tournament_id == tournament_id).all()

def update_match_score(db: Session, match_id: str, team1_score: int, team2_score: int):
    db_match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if db_match is None:
        return None
    
    # Vérifier si les équipes sont présentes
    has_team1 = db_match.team1_id is not None
    has_team2 = db_match.team2_id is not None
    
    # Si les deux équipes sont manquantes ou si une équipe est manquante,
    # vérifier si les matchs précédents sont terminés
    if not has_team1 or not has_team2:
        # Si ce n'est pas un match du premier tour, vérifier que les matchs précédents sont terminés
        if db_match.round > 1:
            # Calculer les numéros des matchs précédents
            prev_round = db_match.round - 1
            match_num = db_match.match_number
            tournament_id = db_match.tournament_id
            
            # Les deux matchs précédents qui alimentent ce match
            prev_match_num1 = match_num * 2 - 1
            prev_match_num2 = match_num * 2
            
            # Vérifier que ces matchs existent et sont terminés
            prev_matches = db.query(models.Match).filter(
                models.Match.tournament_id == tournament_id,
                models.Match.round == prev_round,
                models.Match.match_number.in_([prev_match_num1, prev_match_num2])
            ).all()
            
            # Vérifier si tous les matchs précédents sont terminés
            for prev_match in prev_matches:
                if prev_match.team1_score is None or prev_match.team2_score is None:
                    raise ValueError(f"Impossible de mettre à jour le score : le match précédent (Round {prev_match.round}, Match {prev_match.match_number}) n'est pas terminé")
    
    # Si les deux équipes sont présentes, mettre à jour normalement
    if has_team1 and has_team2:
        db_match.team1_score = team1_score
        db_match.team2_score = team2_score
        
        # Déterminer l'équipe gagnante
        winning_team_id = None
        if team1_score > team2_score:
            winning_team_id = db_match.team1_id
        elif team2_score > team1_score:
            winning_team_id = db_match.team2_id
    # Si une seule équipe est présente, elle est automatiquement gagnante
    elif has_team1 and not has_team2:
        db_match.team1_score = 1
        db_match.team2_score = 0
        winning_team_id = db_match.team1_id
    elif not has_team1 and has_team2:
        db_match.team1_score = 0
        db_match.team2_score = 1
        winning_team_id = db_match.team2_id
    # Si aucune équipe n'est présente, pas de gagnant
    else:
        db_match.team1_score = 0
        db_match.team2_score = 0
        winning_team_id = None
    
    # Mettre à jour les victoires de l'équipe gagnante et de ses joueurs
    if winning_team_id:
        # Mettre à jour les victoires de l'équipe
        winning_team = db.query(models.Team).filter(models.Team.id == winning_team_id).first()
        if winning_team:
            winning_team.wins += 1
            
            # Mettre à jour les victoires des joueurs de l'équipe
            for player in winning_team.players:
                player.wins += 1
        
        # Mettre à jour les défaites de l'équipe perdante
        losing_team_id = None
        if has_team1 and has_team2:
            if winning_team_id == db_match.team1_id:
                losing_team_id = db_match.team2_id
            else:
                losing_team_id = db_match.team1_id
            
            if losing_team_id:
                losing_team = db.query(models.Team).filter(models.Team.id == losing_team_id).first()
                if losing_team:
                    losing_team.losses += 1
    
    # Si un gagnant est déterminé, le propager au tour suivant
    if winning_team_id:
        # Extraire le numéro du tour et du match
        round_num = db_match.round
        match_num = db_match.match_number
        tournament_id = db_match.tournament_id
        
        # Calculer le numéro du match au tour suivant
        next_round = round_num + 1
        next_match_number = (match_num + 1) // 2
        
        # Trouver le match du tour suivant
        next_match = db.query(models.Match).filter(
            models.Match.tournament_id == tournament_id,
            models.Match.round == next_round,
            models.Match.match_number == next_match_number
        ).first()
        
        if next_match:
            # Déterminer si l'équipe gagnante doit être placée en team1 ou team2
            if match_num % 2 == 1:
                # Match impair, placer en team1
                next_match.team1_id = winning_team_id
            else:
                # Match pair, placer en team2
                next_match.team2_id = winning_team_id
            
            # Vérifier si le match suivant a maintenant ses deux équipes
            if next_match.team1_id and next_match.team2_id:
                # Réinitialiser les scores si les deux équipes sont présentes
                next_match.team1_score = None
                next_match.team2_score = None
            # Vérifier si le match suivant a maintenant une seule équipe (et pas l'autre)
            elif (next_match.team1_id and not next_match.team2_id) or (not next_match.team1_id and next_match.team2_id):
                # Auto-valider ce match
                if next_match.team1_id:
                    next_match.team1_score = 1
                    next_match.team2_score = 0
                else:
                    next_match.team1_score = 0
                    next_match.team2_score = 1
                
                # Propager récursivement ce gagnant au tour suivant
                update_match_score(
                    db, 
                    next_match.id, 
                    next_match.team1_score, 
                    next_match.team2_score
                )
    
    db.commit()
    db.refresh(db_match)
    
    return db_match

def check_tournament_completed(db: Session, tournament_id: int):
    """
    Vérifie si tous les matchs d'un tournoi sont terminés et met à jour le statut du tournoi en conséquence.
    Un tournoi est considéré comme terminé si tous les matchs ont des scores ou n'ont pas d'équipes assignées.
    """
    # Récupérer le tournoi
    db_tournament = db.query(models.Tournament).filter(models.Tournament.id == tournament_id).first()
    if db_tournament is None:
        return False
    
    # Si le tournoi n'est pas en cours ou n'est pas en train d'être démarré, ne rien faire
    if db_tournament.status != "in_progress":
        return False
    
    # Récupérer tous les matchs du tournoi
    all_matches = db.query(models.Match).filter(models.Match.tournament_id == tournament_id).all()
    
    # Si aucun match, le tournoi ne peut pas être terminé
    if not all_matches:
        return False
    
    # Vérifier si tous les matchs sont terminés ou n'ont pas d'équipes assignées
    for match in all_matches:
        # Un match est considéré comme terminé si:
        # 1. Il a des scores (match joué)
        # 2. OU il n'a pas d'équipes assignées (match qui ne sera jamais joué)
        # 3. OU il n'a qu'une seule équipe (match gagné par forfait)
        
        has_scores = match.team1_score is not None and match.team2_score is not None
        has_no_teams = match.team1_id is None and match.team2_id is None
        has_one_team_only = (match.team1_id is not None and match.team2_id is None) or (match.team1_id is None and match.team2_id is not None)
        
        # Si le match n'est ni terminé, ni vide, ni avec une seule équipe, alors le tournoi n'est pas terminé
        if not (has_scores or has_no_teams or has_one_team_only):
            return False
    
    # Si tous les matchs sont terminés ou n'ont pas d'équipes assignées, mettre à jour le statut du tournoi
    db_tournament.status = "closed"
    
    # Identifier le gagnant du tournoi (le gagnant du dernier match)
    # Trouver le match avec le round le plus élevé
    final_matches = sorted(all_matches, key=lambda m: (m.round, -m.match_number), reverse=True)
    
    if final_matches:
        final_match = final_matches[0]
        
        # Vérifier si le match final a des scores
        if final_match.team1_score is not None and final_match.team2_score is not None:
            # Déterminer l'équipe gagnante
            winning_team_id = None
            losing_team_id = None
            if final_match.team1_score > final_match.team2_score:
                winning_team_id = final_match.team1_id
                losing_team_id = final_match.team2_id
            elif final_match.team2_score > final_match.team1_score:
                winning_team_id = final_match.team2_id
                losing_team_id = final_match.team1_id
            
            # Mettre à jour les statistiques de l'équipe gagnante
            if winning_team_id:
                winning_team = db.query(models.Team).filter(models.Team.id == winning_team_id).first()
                if winning_team:
                    # Ajouter une victoire supplémentaire pour avoir gagné le tournoi
                    winning_team.wins += 1
                    # Incrémenter le compteur de tournois gagnés
                    winning_team.tournaments_won += 1
            
            # Mettre à jour les statistiques de l'équipe perdante (finaliste)
            if losing_team_id:
                losing_team = db.query(models.Team).filter(models.Team.id == losing_team_id).first()
                if losing_team:
                    # Ajouter une défaite supplémentaire pour avoir perdu la finale
                    losing_team.losses += 1
    
    db.commit()
    return True

# Opérations pour le classement
def get_team_rankings(db: Session):
    teams = db.query(models.Team).all()
    rankings = []
    
    for team in teams:
        rankings.append({
            "id": team.id,
            "name": team.name,
            "wins": team.wins,
            "losses": team.losses,
            "tournaments_won": team.tournaments_won
        })
    
    # Trier par victoires (décroissant)
    rankings.sort(key=lambda x: (x["wins"], x["tournaments_won"]), reverse=True)
    return rankings

def get_player_rankings(db: Session):
    players = db.query(models.Player).all()
    rankings = []
    
    for player in players:
        rankings.append({
            "id": player.id,
            "name": player.name,
            "wins": player.wins
        })
    
    # Trier par nombre de victoires (décroissant)
    rankings.sort(key=lambda x: x["wins"], reverse=True)
    
    # Limiter aux 10 meilleurs joueurs
    return rankings[:10]

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
        if not tournament:
            continue  # Skip if tournament doesn't exist
            
        team1 = db.query(models.Team).filter(models.Team.id == match.team1_id).first()
        team2 = db.query(models.Team).filter(models.Team.id == match.team2_id).first()
        
        # Skip if either team doesn't exist
        if not team1 or not team2:
            continue
            
        # Déterminer l'équipe de l'utilisateur et l'adversaire
        if match.team1_id in user_team_ids:
            user_team = team1
            opponent = team2
            user_is_team1 = True
        else:
            user_team = team2
            opponent = team1
            user_is_team1 = False
        
        result.append({
            "id": match.id,
            "tournament": tournament.name,
            "opponent": opponent.name,
            "date": tournament.date,
            "team": user_team.name,
            "team1_id": match.team1_id,
            "team2_id": match.team2_id,
            "team1_score": match.team1_score,
            "team2_score": match.team2_score,
            "user_is_team1": user_is_team1
        })
    
    return result

# Fonctions pour vérifier si un utilisateur existe par son nom d'utilisateur
def check_user_exists(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

# Fonctions pour les notifications
def create_notification(db: Session, notification: schemas.NotificationCreate):
    db_notification = models.Notification(**notification.dict())
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification

def get_user_notifications(db: Session, user_id: int):
    return db.query(models.Notification).filter(models.Notification.user_id == user_id).all()

def mark_notification_as_read(db: Session, notification_id: int):
    db_notification = db.query(models.Notification).filter(models.Notification.id == notification_id).first()
    if db_notification:
        db_notification.is_read = True
        db.commit()
        db.refresh(db_notification)
    return db_notification

# Fonctions pour les invitations de joueurs
def invite_player_to_team(db: Session, team_id: int, username: str):
    # Vérifier si l'utilisateur existe
    user = check_user_exists(db, username)
    if not user:
        return None
    
    # Vérifier si le joueur est déjà dans l'équipe
    existing_player = db.query(models.Player).filter(
        models.Player.team_id == team_id,
        models.Player.user_id == user.id
    ).first()
    
    if existing_player:
        return existing_player
    
    # Créer un nouveau joueur avec statut "pending"
    team = get_team(db, team_id=team_id)
    if not team:
        return None
    
    player = models.Player(
        name=username,
        team_id=team_id,
        user_id=user.id,
        status="pending"
    )
    db.add(player)
    db.commit()
    db.refresh(player)
    
    # Créer une notification pour l'utilisateur invité
    from datetime import datetime
    import json
    
    notification = models.Notification(
        user_id=user.id,
        type="team_invitation",
        content=f"Vous avez été invité à rejoindre l'équipe {team.name}",
        is_read=False,
        created_at=datetime.now().isoformat(),
        data=json.dumps({
            "team_id": team_id,
            "player_id": player.id
        })
    )
    db.add(notification)
    db.commit()
    
    return player

def respond_to_team_invitation(db: Session, player_id: int, accept: bool):
    player = db.query(models.Player).filter(models.Player.id == player_id).first()
    if not player:
        return None
    
    if accept:
        player.status = "active"
    else:
        player.status = "declined"
    
    db.commit()
    db.refresh(player)
    return player

def get_team_tournaments(db: Session, team_id: int):
    # Récupérer les tournois auxquels l'équipe participe
    team_tournaments = db.query(models.TournamentTeam).filter(models.TournamentTeam.team_id == team_id).all()
    tournament_ids = [tt.tournament_id for tt in team_tournaments]
    
    # Récupérer les détails des tournois
    tournaments = db.query(models.Tournament).filter(models.Tournament.id.in_(tournament_ids)).all()
    return tournaments

def get_team_matches(db: Session, team_id: int):
    # Récupérer tous les matchs où l'équipe est impliquée (équipe 1 ou équipe 2)
    matches = db.query(models.Match).filter(
        (models.Match.team1_id == team_id) | (models.Match.team2_id == team_id)
    ).all()
    
    result = []
    for match in matches:
        # Récupérer les noms des équipes
        team1 = db.query(models.Team).filter(models.Team.id == match.team1_id).first()
        team2 = db.query(models.Team).filter(models.Team.id == match.team2_id).first()
        
        # Récupérer le nom du tournoi
        tournament = db.query(models.Tournament).filter(models.Tournament.id == match.tournament_id).first()
        
        match_data = {
            "id": match.id,
            "tournament_id": match.tournament_id,
            "tournament_name": tournament.name if tournament else None,
            "team1_id": match.team1_id,
            "team1_name": team1.name if team1 else None,
            "team2_id": match.team2_id,
            "team2_name": team2.name if team2 else None,
            "team1_score": match.team1_score,
            "team2_score": match.team2_score,
            "round": match.round,
            "match_number": match.match_number,
            "date": match.date.isoformat() if match.date else None
        }
        result.append(match_data)
    
    return result 