import { useState } from 'react';

function Teams() {
  const [teams, setTeams] = useState([
    {
      id: 1,
      name: 'Les Champions',
      players: [
        { id: 1, name: 'John Doe', isStarter: true },
        { id: 2, name: 'Jane Smith', isStarter: true },
        { id: 3, name: 'Mike Johnson', isStarter: false },
      ],
    },
  ]);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newPlayerName, setNewPlayerName] = useState('');

  const handleCreateTeam = (e) => {
    e.preventDefault();
    if (!newTeamName) return;

    const newTeam = {
      id: teams.length + 1,
      name: newTeamName,
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Équipes</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gérez vos équipes et leurs membres
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowCreateTeam(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            Créer une équipe
          </button>
        </div>
      </div>

      {showCreateTeam && (
        <div className="mt-8 bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Créer une nouvelle équipe
            </h3>
            <form onSubmit={handleCreateTeam} className="mt-5">
              <div>
                <label htmlFor="team-name" className="sr-only">
                  Nom de l'équipe
                </label>
                <input
                  type="text"
                  name="team-name"
                  id="team-name"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Nom de l'équipe"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                />
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Créer
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateTeam(false)}
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Équipe
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Joueurs
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {teams.map((team) => (
                    <tr key={team.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {team.name}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        <div className="space-y-2">
                          {team.players.map((player) => (
                            <div key={player.id} className="flex items-center space-x-2">
                              <span className={player.isStarter ? 'font-semibold text-blue-600' : ''}>
                                {player.name}
                                {player.isStarter && ' (Titulaire)'}
                              </span>
                              <button
                                onClick={() => togglePlayerStarter(team.id, player.id)}
                                className="text-sm text-gray-500 hover:text-gray-700"
                              >
                                {player.isStarter ? 'Rétrograder' : 'Promouvoir'}
                              </button>
                            </div>
                          ))}
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleAddPlayer(team.id);
                            }}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="text"
                              value={newPlayerName}
                              onChange={(e) => setNewPlayerName(e.target.value)}
                              placeholder="Ajouter un joueur"
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                            <button
                              type="submit"
                              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                              Ajouter
                            </button>
                          </form>
                        </div>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button className="text-red-600 hover:text-red-900">
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Teams; 