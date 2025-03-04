import os
import json
import sqlite3
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from database import engine, SessionLocal
import models
import schemas
import crud
import auth

# Nom de la base de données
DB_NAME = "./babyfoot_tournament.db"

# Supprimer la base de données existante si elle existe
if os.path.exists(DB_NAME):
    os.remove(DB_NAME)
    print("Base de données existante supprimée.")

# Recréer les tables
models.Base.metadata.create_all(bind=engine)
print("Tables créées avec succès.")

# Ajouter manuellement la colonne is_admin à la table users
conn = sqlite3.connect(DB_NAME)
cursor = conn.cursor()
try:
    cursor.execute("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0")
    conn.commit()
    print("Colonne is_admin ajoutée à la table users.")
except sqlite3.OperationalError:
    print("La colonne is_admin existe déjà.")
conn.close()

# Créer une session
db = SessionLocal()

# Créer des utilisateurs de test
users = [
    {"username": "admin", "email": "admin@example.com", "password": "password", "is_admin": True},
    {"username": "user1", "email": "user1@example.com", "password": "password"},
    {"username": "user2", "email": "user2@example.com", "password": "password"},
    {"username": "user3", "email": "user3@example.com", "password": "password"},
]

created_users = []
for user_data in users:
    is_admin = user_data.pop("is_admin", False)
    user = schemas.UserCreate(**user_data)
    db_user = crud.create_user(db, user)
    
    # Mettre à jour manuellement le champ is_admin
    if is_admin:
        # Utiliser une requête SQL directe pour mettre à jour is_admin
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET is_admin = 1 WHERE id = ?", (db_user.id,))
        conn.commit()
        conn.close()
        db.refresh(db_user)
    
    created_users.append(db_user)
    print(f"Utilisateur créé: {db_user.username}")

# Créer des équipes de test
teams = [
    {"name": "Les Invincibles", "owner_id": created_users[0].id},
    {"name": "Dream Team", "owner_id": created_users[1].id},
    {"name": "Les Challengers", "owner_id": created_users[2].id},
    {"name": "Les Pros", "owner_id": created_users[3].id},
]

created_teams = []
for team_data in teams:
    team = schemas.TeamCreate(name=team_data["name"])
    db_team = crud.create_team(db, team, team_data["owner_id"])
    created_teams.append(db_team)
    print(f"Équipe créée: {db_team.name}")

# Ajouter des joueurs aux équipes
players = [
    {"name": "Joueur 1", "team_id": created_teams[0].id, "is_starter": True, "user_id": created_users[0].id},
    {"name": "Joueur 2", "team_id": created_teams[0].id, "is_starter": True},
    {"name": "Joueur 3", "team_id": created_teams[1].id, "is_starter": True, "user_id": created_users[1].id},
    {"name": "Joueur 4", "team_id": created_teams[1].id, "is_starter": True},
    {"name": "Joueur 5", "team_id": created_teams[2].id, "is_starter": True, "user_id": created_users[2].id},
    {"name": "Joueur 6", "team_id": created_teams[2].id, "is_starter": True},
    {"name": "Joueur 7", "team_id": created_teams[3].id, "is_starter": True, "user_id": created_users[3].id},
    {"name": "Joueur 8", "team_id": created_teams[3].id, "is_starter": True},
]

for player_data in players:
    team_id = player_data.pop("team_id")
    player = schemas.PlayerCreate(**player_data)
    db_player = crud.create_player(db, player, team_id)
    print(f"Joueur créé: {db_player.name} pour l'équipe {team_id}")

# Créer des tournois de test
tournaments = [
    {
        "name": "Tournoi de printemps", 
        "date": (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d"),
        "max_teams": 8,
        "owner_id": created_users[0].id
    },
    {
        "name": "Tournoi d'été", 
        "date": (datetime.now() + timedelta(days=60)).strftime("%Y-%m-%d"),
        "max_teams": 16,
        "owner_id": created_users[1].id
    },
    {
        "name": "Tournoi en cours", 
        "date": datetime.now().strftime("%Y-%m-%d"),
        "max_teams": 4,
        "owner_id": created_users[0].id,
        "status": "in_progress"
    },
]

created_tournaments = []
for tournament_data in tournaments:
    status = tournament_data.pop("status", "open")
    owner_id = tournament_data.pop("owner_id")
    tournament = schemas.TournamentCreate(**tournament_data)
    db_tournament = crud.create_tournament(db, tournament, owner_id)
    
    if status != "open":
        db_tournament.status = status
        db.commit()
        db.refresh(db_tournament)
    
    created_tournaments.append(db_tournament)
    print(f"Tournoi créé: {db_tournament.name}")

# Inscrire des équipes aux tournois
# Tournoi 1: toutes les équipes
for team in created_teams:
    crud.join_tournament(db, created_tournaments[0].id, team.id)
    print(f"Équipe {team.name} inscrite au tournoi {created_tournaments[0].name}")

# Tournoi 2: deux premières équipes
for team in created_teams[:2]:
    crud.join_tournament(db, created_tournaments[1].id, team.id)
    print(f"Équipe {team.name} inscrite au tournoi {created_tournaments[1].name}")

# Tournoi 3 (en cours): toutes les équipes
for team in created_teams:
    crud.join_tournament(db, created_tournaments[2].id, team.id)
    print(f"Équipe {team.name} inscrite au tournoi {created_tournaments[2].name}")

# Générer des matchs pour le tournoi en cours
tournament_in_progress = created_tournaments[2]
matches = crud.start_tournament(db, tournament_in_progress.id)
print(f"Matchs générés pour le tournoi {tournament_in_progress.name}")

# Ajouter quelques scores pour les matchs du premier tour
if matches:
    # Premier match: équipe 1 vs équipe 2
    first_match = matches[0]
    crud.update_match_score(db, first_match.id, 5, 3)
    print(f"Score mis à jour pour le match {first_match.id}: 5-3")

# Créer des notifications
notifications = [
    {
        "user_id": created_users[1].id,
        "type": "team_invitation",
        "content": "Vous avez été invité à rejoindre l'équipe Les Invincibles",
        "created_at": datetime.now().isoformat(),
        "data": json.dumps({"team_id": created_teams[0].id, "player_id": None})
    },
    {
        "user_id": created_users[2].id,
        "type": "tournament_update",
        "content": "Le tournoi de printemps va bientôt commencer",
        "created_at": datetime.now().isoformat(),
        "data": json.dumps({"tournament_id": created_tournaments[0].id})
    }
]

for notif_data in notifications:
    notification = schemas.NotificationCreate(**notif_data)
    db_notification = crud.create_notification(db, notification)
    print(f"Notification créée pour l'utilisateur {notif_data['user_id']}")

# Fermer la session
db.close()

print("\nInitialisation de la base de données terminée avec succès!")
print("Vous pouvez maintenant lancer l'application avec 'python main.py'")
print("\nComptes utilisateurs créés:")
for user in users:
    print(f"  - {user['username']} / {user['password']}") 