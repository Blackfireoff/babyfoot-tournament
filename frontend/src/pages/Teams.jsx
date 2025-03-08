import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { teamService, userService } from '../services/api';
import { Link } from 'react-router-dom';

function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [viewMode, setViewMode] = useState('all'); // 'all' ou 'mine'
  const [usernameError, setUsernameError] = useState('');
  const [invitationSuccess, setInvitationSuccess] = useState('');

  useEffect(() => {
    fetchTeams();
  }, [viewMode]);

  const fetchTeams = async () => {
    setLoading(true);
    setError(null);
    try {
      let fetchedTeams;
      if (viewMode === 'mine' && user) {
        fetchedTeams = await userService.getUserTeams(user.id);
      } else {
        fetchedTeams = await teamService.getTeams();
      }
      setTeams(fetchedTeams);
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError('Impossible de charger les équipes. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les équipes selon le mode d'affichage
  const filteredTeams = teams;

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName) return;

    try {
      const newTeam = await teamService.createTeam({
        name: newTeamName
      });
      
      setTeams([...teams, newTeam]);
      setNewTeamName('');
      setShowCreateTeam(false);
    } catch (err) {
      console.error('Error creating team:', err);
      alert('Impossible de créer l\'équipe. Veuillez réessayer plus tard.');
    }
  };

  const handleAddPlayer = async (teamId) => {
    if (!newPlayerName) return;
    
    setUsernameError('');
    setInvitationSuccess('');

    try {
      // Vérifier si le joueur est déjà dans l'équipe
      const team = teams.find(t => t.id === teamId);
      const playerExists = team.players.some(
        player => player.name.toLowerCase() === newPlayerName.toLowerCase()
      );
      
      if (playerExists) {
        setUsernameError('Ce joueur est déjà dans l\'équipe');
        return;
      }
      
      // Vérifier si l'utilisateur existe
      const checkResult = await teamService.checkUserExists(newPlayerName);
      
      if (!checkResult.exists) {
        setUsernameError('Joueur inconnu');
        return;
      }
      
      // Inviter le joueur à rejoindre l'équipe
      const newPlayer = await teamService.invitePlayer(teamId, newPlayerName);

      setTeams(teams.map(team => {
        if (team.id === teamId) {
          return {
            ...team,
            players: [...team.players, newPlayer],
          };
        }
        return team;
      }));

      setInvitationSuccess(`Invitation envoyée à ${newPlayerName}`);
      setNewPlayerName('');
    } catch (err) {
      console.error('Error inviting player:', err);
      setUsernameError('Impossible d\'inviter le joueur. Veuillez réessayer plus tard.');
    }
  };

  const togglePlayerStarter = async (teamId, playerId) => {
    try {
      const team = teams.find(t => t.id === teamId);
      if (!team) return;
      
      const player = team.players.find(p => p.id === playerId);
      if (!player) return;
      
      const starters = team.players.filter(p => p.is_starter);
      
      // Ne pas permettre plus de 2 titulaires
      if (starters.length >= 2 && !player.is_starter) {
        alert("Une équipe ne peut pas avoir plus de 2 titulaires.");
        return;
      }

      const updatedPlayer = await teamService.updatePlayer(teamId, playerId, {
        ...player,
        is_starter: !player.is_starter
      });

      setTeams(teams.map(team => {
        if (team.id === teamId) {
          return {
            ...team,
            players: team.players.map(p => {
              if (p.id === playerId) {
                return updatedPlayer;
              }
              return p;
            }),
          };
        }
        return team;
      }));
    } catch (err) {
      console.error('Error updating player:', err);
      alert('Impossible de modifier le statut du joueur. Veuillez réessayer plus tard.');
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette équipe ?")) {
      return;
    }
    
    try {
      await teamService.deleteTeam(teamId);
      setTeams(teams.filter(t => t.id !== teamId));
    } catch (err) {
      console.error('Error deleting team:', err);
      alert('Impossible de supprimer l\'équipe. Veuillez réessayer plus tard.');
    }
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'all' ? 'mine' : 'all');
  };

  if (loading && teams.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-md rounded-lg overflow-hidden p-8 text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 w-32 bg-gray-200 rounded mb-8"></div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-100 h-48 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-indigo-600">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl font-bold text-white">Équipes</h1>
              <p className="mt-1 text-sm text-blue-100">
                Gérez vos équipes et leurs membres
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={toggleViewMode}
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-2 text-sm font-medium text-blue-600 shadow-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {viewMode === 'all' ? 'Voir mes équipes' : 'Voir toutes les équipes'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateTeam(true)}
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 shadow-sm hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Créer une équipe
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="px-6 py-4 bg-red-50 border-b border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {showCreateTeam && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Créer une nouvelle équipe
            </h3>
            <form onSubmit={handleCreateTeam} className="mt-4">
              <div className="flex items-center">
                <input
                  type="text"
                  name="team-name"
                  id="team-name"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Nom de l'équipe"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                />
                <div className="ml-3 flex">
                  <button
                    type="submit"
                    className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Créer
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateTeam(false)}
                    className="ml-2 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {filteredTeams.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune équipe trouvée</h3>
            <p className="mt-1 text-sm text-gray-500">
              {viewMode === 'mine' ? "Vous n'avez pas encore créé d'équipe." : "Aucune équipe n'a été créée."}
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowCreateTeam(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Créer une équipe
              </button>
            </div>
          </div>
        ) : (
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTeams.map((team) => (
                <div key={team.id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        <Link 
                          to={`/teams/${team.id}`}
                          className="hover:text-blue-600 hover:underline"
                        >
                          {team.name}
                        </Link>
                      </h3>
                      <div className="flex space-x-2">
                        {user && team.owner_id === user.id && (
                          <>
                            <button
                              onClick={() => handleDeleteTeam(team.id)}
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
                            >
                              Supprimer
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      {user && team.owner_id === user.id ? 'Votre équipe' : 'Équipe d\'un autre utilisateur'}
                    </p>
                  </div>
                  <div className="px-4 py-5 sm:p-6">
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Joueurs</h4>
                    <div className="space-y-3">
                      {team.players.map((player) => (
                        <div key={player.id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              player.status === "pending" 
                                ? 'bg-yellow-500' 
                                : player.is_starter 
                                  ? 'bg-green-500' 
                                  : 'bg-gray-300'
                            }`}></div>
                            <span className={player.is_starter ? 'font-medium text-gray-900' : 'text-gray-600'}>
                              <Link 
                                to={`/players/${player.id}`}
                                className="hover:text-blue-600 hover:underline"
                              >
                                {player.name}
                              </Link>
                              {player.is_starter && ' (Titulaire)'}
                              {player.status === "pending" && ' (En attente)'}
                            </span>
                          </div>
                          {user && team.owner_id === user.id && player.status === "active" && (
                            <button
                              onClick={() => togglePlayerStarter(team.id, player.id)}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                              {player.is_starter ? 'Rétrograder' : 'Promouvoir'}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {user && team.owner_id === user.id && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleAddPlayer(team.id);
                        }}
                        className="mt-4"
                      >
                        <div className="flex">
                          <input
                            type="text"
                            value={newPlayerName}
                            onChange={(e) => setNewPlayerName(e.target.value)}
                            placeholder="Inviter un joueur par son pseudo"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                          <button
                            type="submit"
                            className="ml-2 inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            Inviter
                          </button>
                        </div>
                        {usernameError && (
                          <p className="mt-2 text-sm text-red-600">{usernameError}</p>
                        )}
                        {invitationSuccess && (
                          <p className="mt-2 text-sm text-green-600">{invitationSuccess}</p>
                        )}
                      </form>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Teams; 