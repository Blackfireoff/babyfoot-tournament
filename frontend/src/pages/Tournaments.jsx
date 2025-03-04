import { useState } from 'react';
import { Link } from 'react-router-dom';

function Tournaments() {
  const [tournaments, setTournaments] = useState([
    {
      id: 1,
      name: 'Tournoi du Printemps',
      date: '2024-04-15',
      status: 'open',
      teams: [
        { id: 1, name: 'Les Champions' },
        { id: 2, name: 'Les Invincibles' },
      ],
      maxTeams: 8,
    },
    {
      id: 2,
      name: 'Coupe d\'Été',
      date: '2024-07-01',
      status: 'upcoming',
      teams: [],
      maxTeams: 16,
    },
    {
      id: 3,
      name: 'Tournoi de Babyfoot 2024',
      date: '2024-03-01',
      status: 'in_progress',
      teams: [
        { id: 1, name: 'G2 Stride' },
        { id: 2, name: 'Team BDS' },
        { id: 3, name: 'Team Falcons' },
        { id: 4, name: 'Karmine Corp' },
        { id: 5, name: 'FURIA' },
        { id: 6, name: 'Spacestation' },
        { id: 7, name: 'Gentle Mates Alpine' },
        { id: 8, name: 'Oxygen Esports' },
      ],
      maxTeams: 8,
    },
    {
      id: 4,
      name: 'Grand Tournoi de Babyfoot - 16 équipes',
      date: '2024-05-15',
      status: 'open',
      teams: [
        { id: 1, name: 'Les Invincibles' },
        { id: 2, name: 'Foot Masters' },
        { id: 3, name: 'Table Titans' },
        { id: 4, name: 'Goal Getters' },
        { id: 5, name: 'Spin Doctors' },
      ],
      maxTeams: 16,
    },
  ]);

  const [selectedTeam, setSelectedTeam] = useState('');

  const handleJoinTournament = (tournamentId) => {
    if (!selectedTeam) return;

    setTournaments(tournaments.map(tournament => {
      if (tournament.id === tournamentId) {
        return {
          ...tournament,
          teams: [...tournament.teams, { id: selectedTeam, name: 'Mon Équipe' }],
        };
      }
      return tournament;
    }));
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

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
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
                        {tournament.status === 'open' && (
                          <div className="flex items-center space-x-4">
                            <select
                              value={selectedTeam}
                              onChange={(e) => setSelectedTeam(e.target.value)}
                              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            >
                              <option value="">Sélectionner une équipe</option>
                              <option value="1">Mon Équipe</option>
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

export default Tournaments; 