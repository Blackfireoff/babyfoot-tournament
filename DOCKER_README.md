# Déploiement avec Docker Compose

Ce document explique comment déployer l'application Babyfoot Tournament en utilisant Docker Compose.

## Prérequis

- Docker installé sur votre machine
- Docker Compose installé sur votre machine
- Répertoire `/deploy/babyfoot-backend-data` créé sur la machine hôte avec les permissions appropriées

## Structure

Le projet contient les fichiers Docker suivants :

1. `docker-compose.yml` : Configure les services, réseaux et volumes
2. `backend/Dockerfile` : Instructions pour construire l'image du backend
3. `frontend/Dockerfile` : Instructions pour construire l'image du frontend
4. `.env` : Variables d'environnement pour la configuration des services
5. `frontend/.env` : Variables d'environnement spécifiques au frontend

### Services

1. **Backend** : Service FastAPI avec une base de données SQLite
   - Port exposé : 8000
   - Utilise un Dockerfile personnalisé basé sur python:latest
   - Volume persistant pour les données de la base de données, monté depuis `/deploy/babyfoot-backend-data`

2. **Frontend** : Service React/Vite
   - Port exposé : 80
   - Utilise un Dockerfile multi-étapes basé sur node:latest pour la construction et nginx:latest pour servir l'application
   - Configuré pour utiliser l'URL de l'API via une variable d'environnement

## Configuration des volumes

Le projet utilise des volumes bind-mount pour la persistance des données :

- `backend_data` : Volume pour les données du backend
  - Monté depuis : `/deploy/babyfoot-backend-data`
  - Monté vers : `/app/data` dans le conteneur backend
  - Type : bind (montage direct du système de fichiers hôte)

Assurez-vous que le répertoire `/deploy/babyfoot-backend-data` existe sur la machine hôte avant de démarrer les services.

## Configuration des variables d'environnement

Le projet utilise des fichiers `.env` pour configurer les variables d'environnement :

- `.env` à la racine du projet : Variables d'environnement pour Docker Compose
  - `API_URL` : URL de l'API pour le frontend (par défaut : http://backend:8000/api)
  - `DATABASE_URL` : URL de la base de données pour le backend

- `frontend/.env` : Variables d'environnement pour le frontend en développement local
  - `VITE_API_URL` : URL de l'API pour le frontend en développement

## Déploiement

Pour déployer l'application, suivez ces étapes :

1. Créez le répertoire pour le volume de données :
   ```bash
   sudo mkdir -p /deploy/babyfoot-backend-data
   sudo chmod 777 /deploy/babyfoot-backend-data
   ```

2. Assurez-vous d'être dans le répertoire racine du projet (où se trouve le fichier `docker-compose.yml`)

3. Construisez et lancez les services avec la commande :
   ```bash
   docker compose up -d --build
   ```

4. Pour vérifier l'état des services :
   ```bash
   docker compose ps
   ```

5. Pour consulter les logs :
   ```bash
   docker compose logs -f
   ```

## Accès à l'application

- Frontend : http://localhost
- Backend API : http://localhost:8000
- Documentation API : http://localhost:8000/docs

## Arrêt des services

Pour arrêter les services :
```bash
docker compose down
```

## Remarques importantes

- Les services sont configurés pour redémarrer automatiquement en cas de panne (`restart: always`)
- Les données de la base de données sont persistantes grâce au volume bind-mount `backend_data`
- Les Dockerfiles sont optimisés pour la production :
  - Le backend utilise une image Python officielle
  - Le frontend utilise une approche multi-étapes avec Node.js pour la construction et Nginx pour servir les fichiers statiques
- Les variables d'environnement permettent de configurer facilement l'URL de l'API sans modifier le code source 