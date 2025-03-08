// URL de base de l'API
const API_URL = 'http://localhost:8000/api';

// Fonction utilitaire pour gérer les erreurs de fetch
const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = `Erreur HTTP: ${response.status}`;
    
    try {
      const errorData = await response.json();
      
      // Formater le message d'erreur pour qu'il soit plus lisible
      if (errorData.detail) {
        errorMessage = typeof errorData.detail === 'string' 
          ? errorData.detail 
          : JSON.stringify(errorData.detail);
      }
    } catch (e) {
      // Si la réponse n'est pas du JSON, utiliser le texte brut
      try {
        errorMessage = await response.text();
      } catch (textError) {
        // Si on ne peut pas lire le texte, utiliser le message par défaut
        console.error('Erreur lors de la lecture de la réponse d\'erreur:', textError);
      }
    }
    
    throw new Error(errorMessage);
  }
  
  // Pour les réponses 204 No Content, retourner un objet vide
  if (response.status === 204) {
    return {};
  }
  
  return response.json();
};

// Fonction pour obtenir les headers avec le token d'authentification
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// Fonction pour décoder le token JWT et obtenir les informations de l'utilisateur
const decodeToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    // Décoder le token JWT (format: header.payload.signature)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Erreur lors du décodage du token:', error);
    return null;
  }
};

// Fonction pour vérifier si le token est expiré
const isTokenExpired = () => {
  const decoded = decodeToken();
  if (!decoded || !decoded.exp) return true;
  
  // La date d'expiration est en secondes, convertir en millisecondes
  const expirationTime = decoded.exp * 1000;
  const currentTime = Date.now();
  
  return currentTime >= expirationTime;
};

// Service d'authentification
export const authService = {
  // Inscription d'un nouvel utilisateur
  register: async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  // Connexion d'un utilisateur
  login: async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData
    });

    const data = await handleResponse(response);
    if (data.access_token) {
      localStorage.setItem('token', data.access_token);
    }
    return data;
  },

  // Déconnexion
  logout: () => {
    localStorage.removeItem('token');
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: () => {
    const hasToken = !!localStorage.getItem('token');
    if (!hasToken) return false;
    
    // Vérifier si le token est expiré
    if (isTokenExpired()) {
      // Si le token est expiré, déconnecter l'utilisateur
      localStorage.removeItem('token');
      return false;
    }
    
    return true;
  },
  
  // Obtenir le nom d'utilisateur à partir du token
  getUsername: () => {
    // Vérifier d'abord si le token est expiré
    if (isTokenExpired()) {
      localStorage.removeItem('token');
      return null;
    }
    
    const decoded = decodeToken();
    return decoded ? decoded.sub : null;
  }
};

// Service pour les équipes
export const teamService = {
  // Récupérer toutes les équipes
  getTeams: async () => {
    const response = await fetch(`${API_URL}/teams`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Récupérer une équipe spécifique
  getTeam: async (teamId) => {
    const response = await fetch(`${API_URL}/teams/${teamId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Créer une nouvelle équipe
  createTeam: async (teamData) => {
    const response = await fetch(`${API_URL}/teams`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(teamData)
    });
    return handleResponse(response);
  },

  // Mettre à jour une équipe
  updateTeam: async (teamId, teamData) => {
    const response = await fetch(`${API_URL}/teams/${teamId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(teamData)
    });
    return handleResponse(response);
  },

  // Supprimer une équipe
  deleteTeam: async (teamId) => {
    const response = await fetch(`${API_URL}/teams/${teamId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Erreur lors de la suppression de l\'équipe');
    }
    return true;
  },

  // Ajouter un joueur à une équipe
  addPlayer: async (teamId, playerData) => {
    const response = await fetch(`${API_URL}/teams/${teamId}/players`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(playerData)
    });
    return handleResponse(response);
  },

  // Mettre à jour un joueur
  updatePlayer: async (teamId, playerId, playerData) => {
    const response = await fetch(`${API_URL}/teams/${teamId}/players/${playerId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(playerData)
    });
    return handleResponse(response);
  },

  // Supprimer un joueur
  deletePlayer: async (teamId, playerId) => {
    const response = await fetch(`${API_URL}/teams/${teamId}/players/${playerId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Erreur lors de la suppression du joueur');
    }
    return true;
  },

  // Vérifier si un utilisateur existe
  checkUserExists: async (username) => {
    const response = await fetch(`${API_URL}/users/check/${username}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Inviter un joueur à rejoindre une équipe
  invitePlayer: async (teamId, username) => {
    const response = await fetch(`${API_URL}/teams/${teamId}/invite`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ username })
    });
    return handleResponse(response);
  },
  
  // Répondre à une invitation d'équipe
  respondToInvitation: async (playerId, accept) => {
    const response = await fetch(`${API_URL}/players/${playerId}/respond`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ accept })
    });
    return handleResponse(response);
  },

  // Récupérer un joueur par son ID
  getPlayerById: async (playerId) => {
    const response = await fetch(`${API_URL}/players/${playerId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Récupérer les équipes d'un joueur
  getPlayerTeams: async (playerId) => {
    const response = await fetch(`${API_URL}/players/${playerId}/teams`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Récupérer le propriétaire d'une équipe
  getTeamOwner: async (userId) => {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Récupérer les tournois d'une équipe
  getTeamTournaments: async (teamId) => {
    const response = await fetch(`${API_URL}/teams/${teamId}/tournaments`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Récupérer les matchs d'une équipe
  getTeamMatches: async (teamId) => {
    const response = await fetch(`${API_URL}/teams/${teamId}/matches`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Service pour les tournois
export const tournamentService = {
  // Récupérer tous les tournois
  getTournaments: async () => {
    const response = await fetch(`${API_URL}/tournaments`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Récupérer un tournoi spécifique
  getTournament: async (tournamentId) => {
    const response = await fetch(`${API_URL}/tournaments/${tournamentId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Créer un nouveau tournoi
  createTournament: async (tournamentData) => {
    const response = await fetch(`${API_URL}/tournaments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(tournamentData)
    });
    return handleResponse(response);
  },

  // Mettre à jour un tournoi
  updateTournament: async (tournamentId, tournamentData) => {
    const response = await fetch(`${API_URL}/tournaments/${tournamentId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(tournamentData)
    });
    return handleResponse(response);
  },

  // Supprimer un tournoi
  deleteTournament: async (tournamentId) => {
    const response = await fetch(`${API_URL}/tournaments/${tournamentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Erreur lors de la suppression du tournoi');
    }
    return true;
  },

  // Rejoindre un tournoi avec une équipe
  joinTournament: async (tournamentId, teamId) => {
    const response = await fetch(`${API_URL}/tournaments/${tournamentId}/teams/${teamId}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Quitter un tournoi
  leaveTournament: async (tournamentId, teamId) => {
    const response = await fetch(`${API_URL}/tournaments/${tournamentId}/teams/${teamId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Erreur lors du retrait de l\'équipe du tournoi');
    }
    return true;
  },

  // Démarrer un tournoi
  startTournament: async (tournamentId) => {
    const response = await fetch(`${API_URL}/tournaments/${tournamentId}/start`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Vérifier si un tournoi est terminé
  checkTournamentCompleted: async (tournamentId) => {
    const response = await fetch(`${API_URL}/tournaments/${tournamentId}/check-completed`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Récupérer les matchs d'un tournoi
  getTournamentMatches: async (tournamentId) => {
    const response = await fetch(`${API_URL}/tournaments/${tournamentId}/matches`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Mettre à jour le score d'un match
  updateMatchScore: async (matchId, team1Score, team2Score) => {
    const response = await fetch(`${API_URL}/matches/${matchId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ team1_score: parseInt(team1Score), team2_score: parseInt(team2Score) })
    });
    return handleResponse(response);
  }
};

// Service pour le classement
export const scoreboardService = {
  // Récupérer le classement des équipes
  getTeamRankings: async () => {
    const response = await fetch(`${API_URL}/scoreboard/teams`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Récupérer le classement des joueurs
  getPlayerRankings: async () => {
    const response = await fetch(`${API_URL}/scoreboard/players`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Service pour les utilisateurs
export const userService = {
  // Récupérer le profil d'un utilisateur
  getUserProfile: async (userId) => {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Récupérer tous les utilisateurs
  getUsers: async () => {
    const response = await fetch(`${API_URL}/users`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Récupérer les matchs d'un utilisateur
  getUserMatches: async (userId) => {
    const response = await fetch(`${API_URL}/users/${userId}/matches`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Récupérer les équipes d'un utilisateur
  getUserTeams: async (userId) => {
    const response = await fetch(`${API_URL}/users/${userId}/teams`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Mettre à jour le profil d'un utilisateur
  updateUserProfile: async (userId, userData) => {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  }
};

// Service pour les notifications
export const notificationService = {
  // Récupérer les notifications d'un utilisateur
  getUserNotifications: async (userId) => {
    const response = await fetch(`${API_URL}/users/${userId}/notifications`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Marquer une notification comme lue
  markNotificationAsRead: async (notificationId) => {
    const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Répondre à une invitation d'équipe
  respondToInvitation: async (playerId, accept) => {
    const response = await fetch(`${API_URL}/players/${playerId}/respond`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ accept })
    });
    return handleResponse(response);
  }
}; 