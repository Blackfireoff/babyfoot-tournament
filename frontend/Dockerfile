FROM node:latest as build

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json package-lock.json ./

# Installer les dépendances
RUN npm install

# Copier le fichier .env
COPY .env ./

# Copier le reste du code source
COPY . .

# Construire l'application
RUN npm run build

# Étape de production avec un serveur léger
FROM nginx:latest

# Copier les fichiers de build depuis l'étape précédente
COPY --from=build /app/dist /usr/share/nginx/html

# Copier une configuration nginx personnalisée si nécessaire
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port 80
EXPOSE 80

# Commande pour démarrer nginx
CMD ["nginx", "-g", "daemon off;"] 