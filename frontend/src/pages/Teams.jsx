import { useState, useEffect } from 'react';

function Teams() {
  const [teams, setTeams] = useState([
    {
      id: 1,
      name: 'Les Champions',
      ownerId: 1, // ID de l'utilisateur propriétaire
      players: [
        { id: 1, name: 'John Doe', isStarter: true },
        { id: 2, name: 'Jane Smith', isStarter: true },
        { id: 3, name: 'Mike Johnson', isStarter: false },
      ],
    },
    {
      id: 2,
      name: 'ss',
      ownerId: 2, // Équipe d'un autre utilisateur
      players: [
        { id: 4, name: 'ss', isStarter: true },
      ],
    },
  ]);
  
  // Simuler l'utilisateur connecté
  const currentUserId = 1; // Dans une vraie application, cela viendrait du contexte d'authentification
  
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [viewMode, setViewMode] = useState('all'); // 'all' ou 'mine'

  // Filtrer les équipes selon le mode d'affichage
  const filteredTeams = viewMode === 'mine' 
    ? teams.filter(team => team.ownerId === currentUserId)
    : teams;

  const handleCreateTeam = (e) => {
    e.preventDefault();
    if (!newTeamName) return;

    const newTeam = {
      id: teams.length + 1,
      name: newTeamName,
      ownerId: currentUserId, // Assigner l'équipe à l'utilisateur actuel
      players: [],
    };

    setTeams([...teams, newTeam]);
    setNewTeamName('');
    setShowCreateTeam(false);
  };

  const handleAddPlayer = (teamId) => {
    if (!newPlayerName) return;

    const newPlayer = {
      id: Math.max(...teams.flatMap(team => team.players.map(p => p.id)), 0) + 1,
      name: newPlayerName,
      isStarter: false,
    };

    setTeams(teams.map(team => {
      if (team.id === teamId) {
        return {
          ...team,
          players: [...team.players, newPlayer],
        };
      }
      return team;
    }));

    setNewPlayerName('');
  };

  const togglePlayerStarter = (teamId, playerId) => {
    setTeams(teams.map(team => {
      if (team.id === teamId) {
        const starters = team.players.filter(p => p.isStarter);
        const player = team.players.find(p => p.id === playerId);
        
        if (starters.length >= 2 && !player.isStarter) {
          return team; // Ne pas permettre plus de 2 titulaires
        }

        return {
          ...team,
          players: team.players.map(p => {
            if (p.id === playerId) {
              return { ...p, isStarter: !p.isStarter };
            }
            return p;
          }),
        };
      }
      return team;
    }));
  };

  const handleDeleteTeam = (teamId) => {
    // Vérifier si l'utilisateur est le propriétaire de l'équipe
    const team = teams.find(t => t.id === teamId);
    if (team && team.ownerId === currentUserId) {
      setTeams(teams.filter(t => t.id !== teamId));
    } else {
      alert("Vous ne pouvez pas supprimer une équipe qui ne vous appartient pas.");
    }
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'all' ? 'mine' : 'all');
  };

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
                <div key={team.id} className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-300">
                  <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">{team.name}</h3>
                      {team.ownerId === currentUserId && (
                        <button
                          onClick={() => handleDeleteTeam(team.id)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      {team.ownerId === currentUserId ? 'Votre équipe' : 'Équipe d\'un autre utilisateur'}
                    </p>
                  </div>
                  <div className="px-4 py-5 sm:p-6">
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Joueurs</h4>
                    <div className="space-y-3">
                      {team.players.map((player) => (
                        <div key={player.id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${player.isStarter ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <span className={player.isStarter ? 'font-medium text-gray-900' : 'text-gray-600'}>
                              {player.name}
                              {player.isStarter && ' (Titulaire)'}
                            </span>
                          </div>
                          {team.ownerId === currentUserId && (
                            <button
                              onClick={() => togglePlayerStarter(team.id, player.id)}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                              {player.isStarter ? 'Rétrograder' : 'Promouvoir'}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {team.ownerId === currentUserId && (
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
                            placeholder="Ajouter un joueur"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                          <button
                            type="submit"
                            className="ml-2 inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            Ajouter
                          </button>
                        </div>
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