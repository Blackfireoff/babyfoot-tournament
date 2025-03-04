import { createContext, useState, useEffect, useContext } from 'react';
import { authService, userService } from '../services/api';

// Création du contexte d'authentification
const AuthContext = createContext();

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  return useContext(AuthContext);
};

// Fournisseur du contexte d'authentification
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fonction pour charger les informations de l'utilisateur
  const loadUserInfo = async () => {
    try {
      // Récupérer le nom d'utilisateur à partir du token
      const username = authService.getUsername();
      if (!username) {
        throw new Error('Token invalide ou expiré');
      }
      
      // Récupérer l'utilisateur par son nom d'utilisateur
      const users = await userService.getUsers();
      const userProfile = users.find(u => u.username === username);
      
      if (!userProfile) {
        throw new Error('Utilisateur non trouvé');
      }
      
      // Récupérer les détails complets de l'utilisateur
      const fullProfile = await userService.getUserProfile(userProfile.id);
      setUser(fullProfile);
    } catch (error) {
      console.error('Erreur lors du chargement du profil utilisateur:', error);
      // Si l'erreur est due à un token invalide, déconnecter l'utilisateur
      authService.logout();
      setUser(null);
      setError('Session expirée ou invalide. Veuillez vous reconnecter.');
    } finally {
      setLoading(false);
    }
  };

  // Vérifier si l'utilisateur est connecté au chargement de l'application
  useEffect(() => {
    if (authService.isAuthenticated()) {
      loadUserInfo();
    } else {
      setLoading(false);
    }
  }, []);

  // Fonction de connexion
  const login = async (username, password) => {
    setError(null);
    try {
      await authService.login(username, password);
      await loadUserInfo();
      return true;
    } catch (error) {
      setError(error.message);
      return false;
    }
  };

  // Fonction d'inscription
  const register = async (userData) => {
    setError(null);
    try {
      await authService.register(userData);
      return true;
    } catch (error) {
      setError(error.message);
      return false;
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // Valeur du contexte
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: authService.isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 