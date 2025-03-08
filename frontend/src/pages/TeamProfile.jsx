import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { teamService, tournamentService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function TeamProfile() {
  const { teamId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [owner, setOwner] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [matches, setMatches] = useState([]);
  const [stats, setStats] = useState({
    matchesPlayed: 0,
    wins: 0,
    losses: 0,
    winRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeamData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Récupérer les informations de l'équipe
        const teamData = await teamService.getTeam(teamId);
        setTeam(teamData);

        // Récupérer les informations du propriétaire
        if (teamData.owner_id) {
          try {
            const ownerData = await teamService.getTeamOwner(teamData.owner_id);
            setOwner(ownerData);
          } catch (err) {
            console.error('Error fetching team owner:', err);
            // Ne pas bloquer le reste du chargement si on ne peut pas récupérer le propriétaire
          }
        }

        // Récupérer les tournois de l'équipe
        try {
          const tournamentsData = await teamService.getTeamTournaments(teamId);
          setTournaments(tournamentsData);
        } catch (err) {
          console.error('Error fetching team tournaments:', err);
          setTournaments([]);
        }

        // Récupérer les matchs de l'équipe
        try {
          const matchesData = await teamService.getTeamMatches(teamId);
          setMatches(matchesData);

          // Utiliser directement les statistiques de l'équipe pour garantir la cohérence
          const tournamentsWon = teamData.tournaments_won || 0;
          let wins = teamData.wins || 0;
          let losses = teamData.losses || 0;
          
          // S'assurer que le nombre de victoires est au moins égal au nombre de tournois gagnés
          if (tournamentsWon > 0 && wins < tournamentsWon) {
            wins = tournamentsWon; // Au minimum, une équipe a autant de victoires que de tournois gagnés
          }
          
          // Calculer le nombre total de matchs joués (victoires + défaites)
          const matchesPlayed = wins + losses;
          
          setStats({
            matchesPlayed,
            wins: wins,
            losses: losses,
            winRate: matchesPlayed > 0 ? Math.round((wins / matchesPlayed) * 100) : 0
          });
        } catch (err) {
          console.error('Error fetching team matches:', err);
          setMatches([]);
          
          // En cas d'erreur, utiliser quand même les statistiques de base de l'équipe
          if (teamData) {
            const tournamentsWon = teamData.tournaments_won || 0;
            let wins = teamData.wins || 0;
            let losses = teamData.losses || 0;
            
            // S'assurer que le nombre de victoires est au moins égal au nombre de tournois gagnés
            if (tournamentsWon > 0 && wins < tournamentsWon) {
              wins = tournamentsWon;
            }
            
            // Calculer le nombre total de matchs joués
            const matchesPlayed = wins + losses;
            
            setStats({
              matchesPlayed,
              wins: wins,
              losses: losses,
              winRate: matchesPlayed > 0 ? Math.round((wins / matchesPlayed) * 100) : 0
            });
          }
        }
      } catch (err) {
        console.error('Error fetching team data:', err);
        setError('Impossible de charger les données de l\'équipe. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    if (teamId) {
      fetchTeamData();
    }
  }, [teamId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erreur!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Attention!</strong>
          <span className="block sm:inline"> Équipe non trouvée.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {/* En-tête du profil */}
        <div className="bg-white shadow sm:rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-5 sm:px-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-white">
                Profil de l'équipe
              </h3>
              {user && team.owner_id === user.id && (
                <Link
                  to={`/teams?edit=${team.id}`}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-700 hover:bg-blue-800"
                >
                  Modifier l'équipe
                </Link>
              )}
            </div>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="flex items-center space-x-5">
              <div className="flex-shrink-0">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl text-blue-600">
                  {team.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
                <p className="text-sm font-medium text-gray-500">
                  {owner ? (
                    <>
                      Propriétaire: 
                      <Link 
                        to={`/profile`} 
                        className="ml-1 text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {owner.username}
                      </Link>
                    </>
                  ) : 'Propriétaire inconnu'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Statistiques
            </h3>
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Matchs joués
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.matchesPlayed}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Victoires
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.wins}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Tournois gagnés
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {team ? team.tournaments_won : 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Défaites
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.losses}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Taux de victoire
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.winRate}%
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Joueurs */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Joueurs
            </h3>
            <div className="mt-5">
              {team.players && team.players.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {team.players.map((player) => (
                    <li key={player.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white ${
                            player.is_starter ? 'bg-green-500' : 'bg-gray-400'
                          }`}>
                            {player.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            <Link 
                              to={`/players/${player.id}`}
                              className="hover:text-blue-600 hover:underline"
                            >
                              {player.name}
                            </Link>
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {player.is_starter ? 'Titulaire' : 'Remplaçant'}
                            {player.status === 'pending' && ' • En attente de confirmation'}
                          </p>
                        </div>
                        <div>
                          <Link
                            to={`/players/${player.id}`}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                          >
                            Voir le profil
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">Cette équipe n'a pas encore de joueurs.</p>
              )}
            </div>
          </div>
        </div>

        {/* Tournois */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Tournois
            </h3>
            <div className="mt-5">
              {tournaments.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {tournaments.map((tournament) => (
                    <li key={tournament.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white ${
                            tournament.status === 'open' ? 'bg-blue-500' : 
                            tournament.status === 'in_progress' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}>
                            {tournament.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {tournament.name}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {tournament.status === 'open' ? 'Inscriptions ouvertes' : 
                             tournament.status === 'in_progress' ? 'En cours' : 'Terminé'}
                          </p>
                        </div>
                        <div>
                          <Link
                            to={`/tournaments/${tournament.id}`}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                          >
                            Voir le tournoi
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">Cette équipe n'a participé à aucun tournoi.</p>
              )}
            </div>
          </div>
        </div>

        {/* Derniers matchs */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Derniers matchs
            </h3>
            <div className="mt-5">
              {matches.length > 0 ? (
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                          Tournoi
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Adversaire
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Score
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Résultat
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {matches.slice(0, 5).map((match) => {
                        const isTeam1 = match.team1_id === parseInt(teamId);
                        const opponentName = isTeam1 ? match.team2_name : match.team1_name;
                        const teamScore = isTeam1 ? match.team1_score : match.team2_score;
                        const opponentScore = isTeam1 ? match.team2_score : match.team1_score;
                        const isWin = teamScore > opponentScore;
                        const isDraw = teamScore === opponentScore;
                        
                        return (
                          <tr key={match.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                              {match.tournament_name || 'Tournoi inconnu'}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {opponentName || 'Équipe inconnue'}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {teamScore} - {opponentScore}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                isWin ? 'bg-green-100 text-green-800' : 
                                isDraw ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {isWin ? 'Victoire' : isDraw ? 'Égalité' : 'Défaite'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">Cette équipe n'a pas encore joué de match.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeamProfile; 