// URL de base de l'API
const API_URL = 'http://localhost:8000/api';

// Fonction utilitaire pour gérer les erreurs de fetch
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      detail: `Erreur HTTP: ${response.status}`
    }));
    
    // Formater le message d'erreur pour qu'il soit plus lisible
    let errorMessage = errorData.detail || 'Une erreur est survenue';
    
    // Si c'est une erreur de validation (422), essayer d'extraire les détails
    if (response.status === 422 && errorData.detail) {
      if (typeof errorData.detail === 'object') {
        // Si detail est un objet, essayer de le formater
        try {
          errorMessage = Object.entries(errorData.detail)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('; ');
        } catch (e) {
          console.error('Erreur lors du formatage des détails d\'erreur:', e);
        }
      }
    }
    
    throw new Error(errorMessage);
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
    return !!localStorage.getItem('token');
  },
  
  // Obtenir le nom d'utilisateur à partir du token
  getUsername: () => {
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
      body: JSON.stringify({ team1_score: team1Score, team2_score: team2Score })
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