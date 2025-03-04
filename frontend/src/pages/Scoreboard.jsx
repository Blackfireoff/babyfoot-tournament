import { useState } from 'react';

function Scoreboard() {
  const [activeTab, setActiveTab] = useState('teams');

  const teamRankings = [
    { id: 1, name: 'Les Champions', wins: 15, losses: 2, points: 45 },
    { id: 2, name: 'Les Invincibles', wins: 12, losses: 5, points: 36 },
    { id: 3, name: 'Les Titans', wins: 10, losses: 7, points: 30 },
    { id: 4, name: 'Les Gladiateurs', wins: 8, losses: 9, points: 24 },
    { id: 5, name: 'Les Warriors', wins: 6, losses: 11, points: 18 },
  ];

  const playerRankings = [
    { id: 1, name: 'John Doe', team: 'Les Champions', goals: 45, assists: 30 },
    { id: 2, name: 'Jane Smith', team: 'Les Invincibles', goals: 42, assists: 28 },
    { id: 3, name: 'Mike Johnson', team: 'Les Titans', goals: 38, assists: 25 },
    { id: 4, name: 'Sarah Wilson', team: 'Les Gladiateurs', goals: 35, assists: 22 },
    { id: 5, name: 'Tom Brown', team: 'Les Warriors', goals: 32, assists: 20 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Classements</h1>
          <p className="mt-2 text-sm text-gray-700">
            Consultez les classements des équipes et des joueurs
          </p>
        </div>
      </div>

      <div className="mt-8">
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">
            Sélectionner une vue
          </label>
          <select
            id="tabs"
            name="tabs"
            className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
          >
            <option value="teams">Classement des équipes</option>
            <option value="players">Classement des joueurs</option>
          </select>
        </div>
        <div className="hidden sm:block">
          <nav className="flex space-x-4" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('teams')}
              className={`${
                activeTab === 'teams'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              } px-3 py-2 font-medium text-sm rounded-md`}
            >
              Classement des équipes
            </button>
            <button
              onClick={() => setActiveTab('players')}
              className={`${
                activeTab === 'players'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              } px-3 py-2 font-medium text-sm rounded-md`}
            >
              Classement des joueurs
            </button>
          </nav>
        </div>

        <div className="mt-8">
          {activeTab === 'teams' ? (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Rang
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Équipe
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Victoires
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Défaites
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Points
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {teamRankings.map((team, index) => (
                    <tr key={team.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {index + 1}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {team.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {team.wins}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {team.losses}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {team.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Rang
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Joueur
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Équipe
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Buts
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Passes
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {playerRankings.map((player, index) => (
                    <tr key={player.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {index + 1}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {player.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {player.team}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {player.goals}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {player.assists}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Scoreboard; 