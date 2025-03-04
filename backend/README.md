# Babyfoot Tournament - Backend

Ce dossier contient le backend de l'application Babyfoot Tournament, développé avec FastAPI et SQLAlchemy.

## Installation

1. Assurez-vous d'avoir Python 3.8+ installé
2. Installez les dépendances :
   ```
   pip install -r requirements.txt
   ```

## Initialisation de la base de données

Pour initialiser la base de données avec des données de test, exécutez :

```
python dev.py
```

Ce script va :
- Supprimer la base de données existante si elle existe
- Créer une nouvelle base de données avec toutes les tables nécessaires
- Remplir la base de données avec des données de test :
  - 4 utilisateurs (admin, user1, user2, user3)
  - 4 équipes
  - 8 joueurs
  - 3 tournois (dont un en cours)
  - Des matchs pour le tournoi en cours
  - Des notifications

## Lancement de l'application

Pour lancer l'application, exécutez :

```
python main.py
```

L'API sera accessible à l'adresse http://localhost:8000

## Comptes utilisateurs de test

Après avoir exécuté `dev.py`, vous pouvez vous connecter avec les comptes suivants :

- Admin : `admin` / `password`
- Utilisateur 1 : `user1` / `password`
- Utilisateur 2 : `user2` / `password`
- Utilisateur 3 : `user3` / `password`

## Structure du projet

- `main.py` : Point d'entrée de l'application, contient les routes API
- `models.py` : Définition des modèles SQLAlchemy
- `schemas.py` : Définition des schémas Pydantic pour la validation des données
- `crud.py` : Fonctions CRUD pour interagir avec la base de données
- `auth.py` : Fonctions d'authentification et de sécurité
- `database.py` : Configuration de la base de données
- `dev.py` : Script pour initialiser la base de données avec des données de test 