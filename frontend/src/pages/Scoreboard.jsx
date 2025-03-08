import { useState, useEffect } from 'react';
import { scoreboardService } from '../services/api';
import { Link } from 'react-router-dom';

function Scoreboard() {
  const [activeTab, setActiveTab] = useState('teams');
  const [teamRankings, setTeamRankings] = useState([]);
  const [playerRankings, setPlayerRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    setLoading(true);
    setError(null);
    try {
      const [teamsData, playersData] = await Promise.all([
        scoreboardService.getTeamRankings(),
        scoreboardService.getPlayerRankings()
      ]);
      
      setTeamRankings(teamsData);
      setPlayerRankings(playersData);
    } catch (err) {
      console.error('Error fetching rankings:', err);
      setError('Impossible de charger les classements. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour rendre le podium
  const renderPodium = (rankings, type) => {
    if (rankings.length < 3) return null;
    
    const top3 = rankings.slice(0, 3);
    
    return (
      <div className="mb-10 mt-6">
        <h3 className="text-xl font-semibold text-center mb-10">🏆 Podium 🏆</h3>
        <div className="flex justify-center items-end h-64 gap-4">
          {/* 2ème place */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-300 bg-white shadow-lg mb-2">
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <span className="text-3xl">{type === 'teams' ? '👥' : '👤'}</span>
              </div>
            </div>
            <div className="w-32 h-32 bg-gradient-to-t from-gray-300 to-gray-200 flex flex-col items-center justify-center rounded-t-lg shadow-md">
              <span className="text-xl font-bold text-gray-700">2</span>
              <span className="font-semibold text-sm text-center px-1 truncate w-full">{top3[1].name}</span>
              <span className="text-xs">{top3[1].wins} victoires</span>
            </div>
          </div>
          
          {/* 1ère place */}
          <div className="flex flex-col items-center">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-yellow-400 bg-white shadow-lg mb-2 z-10">
              <div className="w-full h-full flex items-center justify-center bg-yellow-50">
                <span className="text-4xl">{type === 'teams' ? '👥' : '👤'}</span>
              </div>
            </div>
            <div className="w-36 h-44 bg-gradient-to-t from-yellow-400 to-yellow-300 flex flex-col items-center justify-center rounded-t-lg shadow-md">
              <span className="text-2xl font-bold text-yellow-800">1</span>
              <span className="font-semibold text-center px-1 truncate w-full">{top3[0].name}</span>
              <span className="text-sm">{top3[0].wins} victoires</span>
              {type === 'teams' && top3[0].tournaments_won > 0 && (
                <span className="text-xs mt-1">{top3[0].tournaments_won} tournois gagnés</span>
              )}
            </div>
          </div>
          
          {/* 3ème place */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-amber-700 bg-white shadow-lg mb-2">
              <div className="w-full h-full flex items-center justify-center bg-amber-50">
                <span className="text-2xl">{type === 'teams' ? '👥' : '👤'}</span>
              </div>
            </div>
            <div className="w-28 h-24 bg-gradient-to-t from-amber-700 to-amber-600 flex flex-col items-center justify-center rounded-t-lg shadow-md">
              <span className="text-lg font-bold text-amber-100">3</span>
              <span className="font-semibold text-sm text-center text-amber-100 px-1 truncate w-full">{top3[2].name}</span>
              <span className="text-xs text-amber-100">{top3[2].wins} victoires</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Fonction pour déterminer la classe de style en fonction du rang
  const getRankStyle = (index) => {
    switch(index) {
      case 0: return "bg-yellow-100 font-bold";
      case 1: return "bg-gray-100 font-semibold";
      case 2: return "bg-amber-50 font-semibold";
      default: return "";
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/4 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erreur!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

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
            <>
              {teamRankings.length >= 3 && renderPodium(teamRankings, 'teams')}
              
              <div className="overflow-hidden shadow-lg ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                {teamRankings.length === 0 ? (
                  <div className="bg-white px-6 py-12 text-center">
                    <p className="text-sm text-gray-500">Aucune donnée de classement disponible pour le moment.</p>
                  </div>
                ) : (
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
                          Matchs joués
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Victoires
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Défaites
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Tournois gagnés
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {teamRankings.map((team, index) => (
                        <tr key={team.id} className={getRankStyle(index)}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {index < 3 ? (
                              <span className="inline-flex items-center justify-center">
                                {index === 0 && <span className="text-yellow-500 text-lg mr-1">🥇</span>}
                                {index === 1 && <span className="text-gray-400 text-lg mr-1">🥈</span>}
                                {index === 2 && <span className="text-amber-700 text-lg mr-1">🥉</span>}
                                {index + 1}
                              </span>
                            ) : (
                              index + 1
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <Link 
                              to={`/teams/${team.id}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {team.name}
                            </Link>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            {team.wins + team.losses}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-green-600">
                            {team.wins}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-red-600">
                            {team.losses}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            {team.tournaments_won > 0 ? (
                              <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                                {team.tournaments_won} {team.tournaments_won > 1 ? 'tournois' : 'tournoi'}
                              </span>
                            ) : (
                              team.tournaments_won
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          ) : (
            <>
              {playerRankings.length >= 3 && renderPodium(playerRankings, 'players')}
              
              <div className="overflow-hidden shadow-lg ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                {playerRankings.length === 0 ? (
                  <div className="bg-white px-6 py-12 text-center">
                    <p className="text-sm text-gray-500">Aucune donnée de classement disponible pour le moment.</p>
                  </div>
                ) : (
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
                          Victoires
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {playerRankings.map((player, index) => (
                        <tr key={player.id} className={getRankStyle(index)}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {index < 3 ? (
                              <span className="inline-flex items-center justify-center">
                                {index === 0 && <span className="text-yellow-500 text-lg mr-1">🥇</span>}
                                {index === 1 && <span className="text-gray-400 text-lg mr-1">🥈</span>}
                                {index === 2 && <span className="text-amber-700 text-lg mr-1">🥉</span>}
                                {index + 1}
                              </span>
                            ) : (
                              index + 1
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <Link 
                              to={`/players/${player.id}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {player.name}
                            </Link>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-green-600">
                            {player.wins}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Scoreboard; 