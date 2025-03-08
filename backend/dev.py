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
    # Équipe 1: Les Invincibles
    {"name": "KingFoot", "team_id": created_teams[0].id, "is_starter": True, "user_id": created_users[0].id},
    {"name": "StrikerPro", "team_id": created_teams[0].id, "is_starter": True},
    {"name": "DefenderX", "team_id": created_teams[0].id, "is_starter": False},
    
    # Équipe 2: Dream Team
    {"name": "FootballWizard", "team_id": created_teams[1].id, "is_starter": True, "user_id": created_users[1].id},
    {"name": "GoalMachine", "team_id": created_teams[1].id, "is_starter": True},
    {"name": "MidFieldMaster", "team_id": created_teams[1].id, "is_starter": False},
    
    # Équipe 3: Les Challengers
    {"name": "BabyFootKing", "team_id": created_teams[2].id, "is_starter": True, "user_id": created_users[2].id},
    {"name": "TableTitan", "team_id": created_teams[2].id, "is_starter": True},
    {"name": "SpinMaster", "team_id": created_teams[2].id, "is_starter": False},
    
    # Équipe 4: Les Pros
    {"name": "LegendFoot", "team_id": created_teams[3].id, "is_starter": True, "user_id": created_users[3].id},
    {"name": "ProSpinner", "team_id": created_teams[3].id, "is_starter": True},
    {"name": "RodControl", "team_id": created_teams[3].id, "is_starter": False},
]

created_players = []
for player_data in players:
    team_id = player_data.pop("team_id")
    player = schemas.PlayerCreate(**player_data)
    db_player = crud.create_player(db, player, team_id)
    created_players.append(db_player)
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
        "status": "open"
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

# Mettre à jour le statut du tournoi à "in_progress" après avoir inscrit les équipes
db_tournament = db.query(models.Tournament).filter(models.Tournament.id == tournament_in_progress.id).first()
db_tournament.status = "in_progress"
db.commit()
db.refresh(db_tournament)
print(f"Statut du tournoi {tournament_in_progress.name} mis à jour à 'in_progress'")

# Créer manuellement des matchs pour le tournoi en cours
# Nous ne pouvons pas utiliser start_tournament car le tournoi est déjà en cours
match1_id = f"T{tournament_in_progress.id}_R1_M1"
match1 = models.Match(
    id=match1_id,
    tournament_id=tournament_in_progress.id,
    team1_id=created_teams[0].id,
    team2_id=created_teams[1].id,
    round=1,
    match_number=1
)
db.add(match1)

match2_id = f"T{tournament_in_progress.id}_R1_M2"
match2 = models.Match(
    id=match2_id,
    tournament_id=tournament_in_progress.id,
    team1_id=created_teams[2].id,
    team2_id=created_teams[3].id,
    round=1,
    match_number=2
)
db.add(match2)
db.commit()
print(f"Matchs créés manuellement pour le tournoi {tournament_in_progress.name}")

# Ajouter quelques scores pour les matchs du premier tour
crud.update_match_score(db, match1_id, 5, 3)
print(f"Score mis à jour pour le match {match1_id}: 5-3")

crud.update_match_score(db, match2_id, 2, 4)
print(f"Score mis à jour pour le match {match2_id}: 2-4")

# Ajouter manuellement des victoires pour simuler des matchs passés
# Équipe 1: 3 victoires
conn = sqlite3.connect(DB_NAME)
cursor = conn.cursor()
cursor.execute("UPDATE teams SET wins = 3 WHERE id = ?", (created_teams[0].id,))
conn.commit()

# Équipe 2: 2 victoires
cursor.execute("UPDATE teams SET wins = 2 WHERE id = ?", (created_teams[1].id,))
conn.commit()

# Équipe 3: 1 victoire
cursor.execute("UPDATE teams SET wins = 1 WHERE id = ?", (created_teams[2].id,))
conn.commit()

# Équipe 4: 1 victoire
cursor.execute("UPDATE teams SET wins = 1 WHERE id = ?", (created_teams[3].id,))
conn.commit()

# Mettre à jour les victoires des joueurs avec des scores variés
# Joueur 1: 10 victoires
cursor.execute("UPDATE players SET wins = 10 WHERE id = ?", (created_players[0].id,))
conn.commit()

# Joueur 2: 8 victoires
cursor.execute("UPDATE players SET wins = 8 WHERE id = ?", (created_players[1].id,))
conn.commit()

# Joueur 3: 7 victoires
cursor.execute("UPDATE players SET wins = 7 WHERE id = ?", (created_players[2].id,))
conn.commit()

# Joueur 4: 6 victoires
cursor.execute("UPDATE players SET wins = 6 WHERE id = ?", (created_players[3].id,))
conn.commit()

# Joueur 5: 5 victoires
cursor.execute("UPDATE players SET wins = 5 WHERE id = ?", (created_players[4].id,))
conn.commit()

# Joueur 6: 5 victoires
cursor.execute("UPDATE players SET wins = 5 WHERE id = ?", (created_players[5].id,))
conn.commit()

# Joueur 7: 4 victoires
cursor.execute("UPDATE players SET wins = 4 WHERE id = ?", (created_players[6].id,))
conn.commit()

# Joueur 8: 3 victoires
cursor.execute("UPDATE players SET wins = 3 WHERE id = ?", (created_players[7].id,))
conn.commit()

# Joueur 9: 2 victoires
cursor.execute("UPDATE players SET wins = 2 WHERE id = ?", (created_players[8].id,))
conn.commit()

# Joueur 10: 2 victoires
cursor.execute("UPDATE players SET wins = 2 WHERE id = ?", (created_players[9].id,))
conn.commit()

# Joueur 11: 1 victoire
cursor.execute("UPDATE players SET wins = 1 WHERE id = ?", (created_players[10].id,))
conn.commit()

# Joueur 12: 0 victoire (débutant)
cursor.execute("UPDATE players SET wins = 0 WHERE id = ?", (created_players[11].id,))
conn.commit()

conn.close()
print("Victoires ajoutées aux équipes et aux joueurs")

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