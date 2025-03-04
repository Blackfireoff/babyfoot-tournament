import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { tournamentService, teamService } from '../services/api';

function Tournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [userTeams, setUserTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchTournaments();
    if (user) {
      fetchUserTeams();
    }
  }, [user]);

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const data = await tournamentService.getAllTournaments();
      setTournaments(data);
    } catch (err) {
      console.error('Error fetching tournaments:', err);
      setError('Impossible de charger les tournois. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTeams = async () => {
    if (!user) return;
    
    try {
      const teams = await teamService.getUserTeams(user.id);
      setUserTeams(teams);
    } catch (err) {
      console.error('Error fetching user teams:', err);
    }
  };

  const handleJoinTournament = async (tournamentId) => {
    if (!selectedTeam) return;

    try {
      await tournamentService.joinTournament(tournamentId, parseInt(selectedTeam));
      
      // Mettre à jour l'état local
      setTournaments(tournaments.map(tournament => {
        if (tournament.id === tournamentId) {
          const selectedTeamObj = userTeams.find(team => team.id === parseInt(selectedTeam));
          return {
            ...tournament,
            teams: [...tournament.teams, selectedTeamObj],
          };
        }
        return tournament;
      }));
      
      setSelectedTeam('');
    } catch (err) {
      console.error('Error joining tournament:', err);
      alert('Impossible de rejoindre le tournoi. Veuillez réessayer plus tard.');
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'open':
        return 'Inscriptions ouvertes';
      case 'upcoming':
        return 'À venir';
      case 'in_progress':
        return 'En cours';
      case 'closed':
        return 'Inscriptions closes';
      default:
        return status;
    }
  };

  if (loading && tournaments.length === 0) {
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Tournois</h1>
          <p className="mt-2 text-sm text-gray-700">
            Consultez et rejoignez les tournois en cours
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              {tournaments.length === 0 ? (
                <div className="bg-white px-6 py-12 text-center">
                  <p className="text-sm text-gray-500">Aucun tournoi disponible pour le moment.</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Nom du tournoi
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Date
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Statut
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Équipes
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {tournaments.map((tournament) => (
                      <tr key={tournament.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          <Link to={`/tournaments/${tournament.id}`} className="text-blue-600 hover:text-blue-900">
                            {tournament.name}
                          </Link>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Date(tournament.date).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusBadgeColor(tournament.status)}`}>
                            {getStatusText(tournament.status)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {tournament.teams.length} / {tournament.maxTeams} équipes
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          {tournament.status === 'open' && user && (
                            <div className="flex items-center space-x-4">
                              <select
                                value={selectedTeam}
                                onChange={(e) => setSelectedTeam(e.target.value)}
                                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                              >
                                <option value="">Sélectionner une équipe</option>
                                {userTeams.map(team => (
                                  <option key={team.id} value={team.id}>{team.name}</option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleJoinTournament(tournament.id)}
                                disabled={!selectedTeam}
                                className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Rejoindre
                              </button>
                            </div>
                          )}
                          {tournament.status === 'open' && !user && (
                            <Link to="/login" className="text-blue-600 hover:text-blue-900">
                              Connectez-vous pour rejoindre
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tournaments; 