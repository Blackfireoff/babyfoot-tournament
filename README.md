# Babyfoot Tournament Application

Une application web pour la gestion de tournois de babyfoot, d'équipes, de matchs et d'utilisateurs.

## Structure du Projet

Le projet est organisé en deux parties principales :
- `backend` : Application FastAPI fournissant l'API
- `frontend` : Interface web React pour l'application

## Configuration du Backend

### Prérequis

- Python 3.8+
- PostgreSQL (optionnel - SQLite disponible en alternative)

### Installation

1. Clonez le dépôt :
```bash
git clone https://github.com/yourusername/babyfoot-tournament.git
cd babyfoot-tournament
```

2. Configurez un environnement virtuel :
```bash
python -m venv venv
source venv/bin/activate  # Sur Windows : venv\Scripts\activate
```

3. Installez les dépendances :
```bash
cd backend
pip install -r requirements.txt
```

4. Créez un fichier `.env` dans le répertoire backend avec les variables suivantes :
```
DATABASE_URL=postgresql://postgres:postgres@localhost/babyfoot
USE_SQLITE_FALLBACK=True  # Mettre à True pour utiliser SQLite au lieu de PostgreSQL
SQLITE_URL=sqlite:///babyfoot.db
SECRET_KEY=09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Configuration de la Base de Données

#### Utilisation de SQLite (Recommandé pour le Développement)

1. Assurez-vous que `USE_SQLITE_FALLBACK=True` est défini dans votre fichier `.env`.

2. Configurez la base de données SQLite :
```bash
cd backend
python setup_sqlite.py
```

3. Initialisez la base de données avec un utilisateur administrateur :
```bash
python init_db.py
```

#### Utilisation de PostgreSQL (Pour la Production)

1. Créez une base de données PostgreSQL nommée `babyfoot` :
```bash
createdb babyfoot
```

2. Définissez `USE_SQLITE_FALLBACK=False` dans votre fichier `.env`.

3. Exécutez les migrations :
```bash
cd backend
alembic upgrade head
```

4. Initialisez la base de données avec un utilisateur administrateur :
```bash
python init_db.py
```

### Exécution de l'Application

Démarrez le serveur FastAPI :
```bash
cd backend
python run.py
```

L'API sera disponible à l'adresse http://localhost:8000

La documentation de l'API est disponible à :
- http://localhost:8000/api/docs (Swagger UI)
- http://localhost:8000/api/redoc (ReDoc)

### Utilisateur Administrateur par Défaut

Après avoir initialisé la base de données, vous pouvez vous connecter avec les identifiants suivants :
- Nom d'utilisateur : admin
- Mot de passe : admin123

## Fonctionnalités Principales

- **Gestion des Utilisateurs**
  - Inscription et connexion des utilisateurs
  - Profils utilisateurs avec rôles (admin, joueur)
  - Authentification sécurisée avec JWT

- **Gestion des Équipes**
  - Création et gestion d'équipes
  - Ajout/suppression de membres d'équipe
  - Désignation de capitaines d'équipe

- **Gestion des Tournois**
  - Création et configuration de tournois
  - Inscription d'équipes aux tournois
  - Suivi de l'état des tournois (brouillon, ouvert, en cours, terminé)

- **Gestion des Matchs**
  - Planification de matchs entre équipes
  - Enregistrement des scores
  - Suivi de l'état des matchs (planifié, en cours, terminé)

## Points d'API

L'API fournit les points d'accès suivants :

- **Authentification**
  - POST `/api/auth/login` : Connexion utilisateur
  - POST `/api/auth/register` : Inscription utilisateur

- **Utilisateurs**
  - GET `/api/users/me` : Obtenir l'utilisateur actuel
  - PUT `/api/users/me` : Mettre à jour l'utilisateur actuel
  - GET `/api/users/` : Obtenir tous les utilisateurs (admin uniquement)
  - GET `/api/users/{user_id}` : Obtenir un utilisateur par ID
  - PUT `/api/users/{user_id}` : Mettre à jour un utilisateur (admin uniquement)
  - DELETE `/api/users/{user_id}` : Supprimer un utilisateur (admin uniquement)

- **Équipes**
  - GET `/api/teams/` : Obtenir toutes les équipes
  - POST `/api/teams/` : Créer une nouvelle équipe
  - GET `/api/teams/{team_id}` : Obtenir une équipe par ID
  - PUT `/api/teams/{team_id}` : Mettre à jour une équipe (capitaine uniquement)
  - DELETE `/api/teams/{team_id}` : Supprimer une équipe (capitaine uniquement)
  - GET `/api/teams/{team_id}/members` : Obtenir les membres d'une équipe
  - POST `/api/teams/{team_id}/members` : Ajouter un membre à une équipe (capitaine uniquement)
  - DELETE `/api/teams/{team_id}/members/{user_id}` : Retirer un membre d'une équipe (capitaine uniquement)

- **Tournois**
  - GET `/api/tournaments/` : Obtenir tous les tournois
  - POST `/api/tournaments/` : Créer un nouveau tournoi
  - GET `/api/tournaments/{tournament_id}` : Obtenir un tournoi par ID
  - PUT `/api/tournaments/{tournament_id}` : Mettre à jour un tournoi (organisateur uniquement)
  - DELETE `/api/tournaments/{tournament_id}` : Supprimer un tournoi (organisateur uniquement)
  - GET `/api/tournaments/{tournament_id}/teams` : Obtenir les équipes d'un tournoi
  - POST `/api/tournaments/{tournament_id}/teams` : Inscrire une équipe à un tournoi (capitaine uniquement)
  - PUT `/api/tournaments/{tournament_id}/teams/{team_id}/confirm` : Confirmer l'inscription d'une équipe (organisateur uniquement)
  - DELETE `/api/tournaments/{tournament_id}/teams/{team_id}` : Désinscrire une équipe d'un tournoi (capitaine ou organisateur uniquement)

- **Matchs**
  - GET `/api/matches/` : Obtenir tous les matchs
  - POST `/api/matches/` : Créer un nouveau match (organisateur uniquement)
  - GET `/api/matches/{match_id}` : Obtenir un match par ID
  - PUT `/api/matches/{match_id}` : Mettre à jour un match (organisateur uniquement)
  - DELETE `/api/matches/{match_id}` : Supprimer un match (organisateur uniquement)
  - GET `/api/matches/{match_id}/players` : Obtenir les joueurs d'un match
  - POST `/api/matches/{match_id}/players` : Ajouter un joueur à un match (capitaine ou organisateur uniquement)
  - DELETE `/api/matches/{match_id}/players/{user_id}` : Retirer un joueur d'un match (capitaine ou organisateur uniquement)

## Dépannage

### Problèmes de Connexion à la Base de Données

Si vous rencontrez des problèmes de connexion à la base de données :

1. **Pour les utilisateurs de PostgreSQL** :
   - Assurez-vous que PostgreSQL est installé et en cours d'exécution sur votre système.
   - Vérifiez que la base de données existe et est accessible.
   - Vérifiez que les détails de connexion dans votre fichier `.env` sont corrects.
   - Exécutez `python check_db.py` pour tester la connexion à la base de données.

2. **Pour les utilisateurs de SQLite** :
   - Assurez-vous que `USE_SQLITE_FALLBACK=True` est défini dans votre fichier `.env`.
   - Exécutez `python setup_sqlite.py` pour configurer la base de données SQLite.
   - Vérifiez que l'application a les permissions d'écriture dans le répertoire où le fichier SQLite sera créé.

3. **Passage à SQLite** :
   - Si vous avez des problèmes avec PostgreSQL, vous pouvez passer à SQLite en définissant `USE_SQLITE_FALLBACK=True` dans votre fichier `.env`.
   - Exécutez `python setup_sqlite.py` pour configurer la base de données SQLite.
   - Exécutez `python init_db.py` pour initialiser la base de données avec un utilisateur administrateur.

## Développement

### Structure des Fichiers

```
backend/
├── alembic/                  # Migrations de base de données
├── app/
│   ├── api/                  # Points d'API
│   │   ├── endpoints/        # Endpoints par ressource
│   │   └── api.py            # Configuration du routeur API
│   ├── core/                 # Fonctionnalités principales
│   │   ├── config.py         # Configuration de l'application
│   │   └── security.py       # Fonctions de sécurité
│   ├── crud/                 # Opérations CRUD
│   ├── db/                   # Configuration de la base de données
│   ├── models/               # Modèles SQLAlchemy
│   ├── schemas/              # Schémas Pydantic
│   └── main.py               # Point d'entrée de l'application
├── tests/                    # Tests
├── .env                      # Variables d'environnement
├── requirements.txt          # Dépendances Python
└── run.py                    # Script pour exécuter l'application

frontend/
├── public/                   # Fichiers statiques
├── src/
│   ├── assets/               # Images et ressources
│   ├── components/           # Composants React réutilisables
│   ├── contexts/             # Contextes React (authentification, etc.)
│   ├── hooks/                # Hooks personnalisés
│   ├── pages/                # Pages de l'application
│   ├── services/             # Services API
│   ├── utils/                # Fonctions utilitaires
│   ├── App.jsx               # Composant principal
│   └── main.jsx              # Point d'entrée
├── .env                      # Variables d'environnement
├── package.json              # Dépendances npm
└── vite.config.js            # Configuration de Vite
```

### Commandes Utiles

- **Exécuter l'application complète** : `./start.sh` ou `start.bat`
- **Exécuter le backend** : `cd backend && python run.py`
- **Exécuter le frontend** : `cd frontend && npm run dev`
- **Vérifier la connexion à la base de données** : `cd backend && python check_db.py`
- **Configurer SQLite** : `cd backend && python setup_sqlite.py`
- **Initialiser la base de données** : `cd backend && python init_db.py`
- **Créer une migration** : `cd backend && alembic revision --autogenerate -m "description"`
- **Appliquer les migrations** : `cd backend && alembic upgrade head`
- **Construire le frontend pour la production** : `cd frontend && npm run build`

## Configuration du Frontend

### Prérequis

- Node.js 18+
- npm 9+

### Installation

1. Installez les dépendances :
```bash
cd frontend
npm install
```

2. Créez un fichier `.env` dans le répertoire frontend avec les variables suivantes :
```
VITE_API_BASE_URL=http://localhost:8000/api
```

### Exécution de l'Application Frontend

Démarrez le serveur de développement :
```bash
cd frontend
npm run dev
```

L'interface web sera disponible à l'adresse http://localhost:5173

## Démarrage de l'Application Complète

### Sous Linux/macOS

Utilisez le script de démarrage fourni :
```bash
chmod +x start.sh
./start.sh
```

### Sous Windows

Utilisez le script batch fourni :
```
start.bat
```

Ces scripts démarrent à la fois le backend et le frontend.

## Licence

MIT 