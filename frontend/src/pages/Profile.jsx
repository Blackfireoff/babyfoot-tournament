import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/api';

function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [userTeams, setUserTeams] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    victories: 0,
    matchesPlayed: 0,
    pointsScored: 0
  });

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Charger le profil utilisateur
      const profileData = await userService.getUserProfile(user.id);
      setProfile(profileData);

      // Charger les équipes de l'utilisateur
      const teamsData = await userService.getUserTeams(user.id);
      setUserTeams(teamsData);

      // Charger les matchs de l'utilisateur
      const matchesData = await userService.getUserMatches(user.id);
      
      // Filtrer les matchs à venir (date future) et non terminés (sans score)
      const now = new Date();
      const upcoming = matchesData.filter(match => {
        // Vérifier si la date est dans le futur
        const isFutureDate = new Date(match.date) > now;
        
        // Vérifier si le match n'est pas terminé (pas de score)
        const isNotCompleted = match.team1_score === null && match.team2_score === null;
        
        // Retourner uniquement les matchs à venir et non terminés
        return isFutureDate && isNotCompleted;
      });
      setUpcomingMatches(upcoming);

      // Calculer les statistiques
      const victories = matchesData.filter(match => {
        if (match.user_is_team1) {
          return match.team1_score > match.team2_score;
        } else {
          return match.team2_score > match.team1_score;
        }
      }).length;

      const pointsScored = matchesData.reduce((total, match) => {
        if (match.user_is_team1) {
          return total + (match.team1_score || 0);
        } else {
          return total + (match.team2_score || 0);
        }
      }, 0);

      setStats({
        victories,
        matchesPlayed: matchesData.length,
        pointsScored
      });

    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Impossible de charger les données utilisateur. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
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

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Attention!</strong>
          <span className="block sm:inline"> Profil non trouvé.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Profil utilisateur */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Informations du profil
            </h3>
            <div className="mt-5 border-t border-gray-200">
              <dl className="divide-y divide-gray-200">
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Nom d'utilisateur</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {profile.username}
                  </dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {profile.email}
                  </dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Équipes</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {userTeams.length === 0 ? (
                      <p className="text-gray-500">Vous n'avez pas encore d'équipe.</p>
                    ) : (
                      <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                        {userTeams.map((team) => (
                          <li key={team.id} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                            <div className="w-0 flex-1 flex items-center">
                              <span className="ml-2 flex-1 w-0 truncate">{team.name}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Matchs à venir */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Matchs à venir
            </h3>
            <div className="mt-5">
              <div className="flow-root">
                {upcomingMatches.length === 0 ? (
                  <p className="text-gray-500">Vous n'avez pas de matchs à venir.</p>
                ) : (
                  <ul role="list" className="-my-5 divide-y divide-gray-200">
                    {upcomingMatches.map((match) => (
                      <li key={match.id} className="py-5">
                        <div className="relative focus-within:ring-2 focus-within:ring-blue-500">
                          <h3 className="text-sm font-semibold text-gray-800">
                            <span className="absolute inset-0" aria-hidden="true" />
                            {match.tournament}
                          </h3>
                          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                            {match.team} vs {match.opponent}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            {new Date(match.date).toLocaleString('fr-FR', {
                              dateStyle: 'long',
                              timeStyle: 'short',
                            })}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
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
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Victoires
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.victories}
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
                      <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                      <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Points marqués
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.pointsScored}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile; 