import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import TournamentBracket from '../components/TournamentBracket';
import '../components/TournamentBracket.css';

function TournamentDetails() {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Dans un environnement réel, vous feriez un appel API ici
    // Simulation de données pour l'exemple
    const fetchTournament = () => {
      setLoading(true);
      try {
        // Simuler un délai de chargement
        setTimeout(() => {
          // Données de démonstration
          const mockTournament = {
            id: parseInt(id),
            name: 'Tournoi de Babyfoot 2024',
            status: 'in_progress',
            startDate: '2024-03-01',
            endDate: '2024-03-15',
            teams: [
              { id: 1, name: 'G2 Stride', logo: 'https://via.placeholder.com/24' },
              { id: 2, name: 'Team BDS', logo: 'https://via.placeholder.com/24' },
              { id: 3, name: 'Team Falcons', logo: 'https://via.placeholder.com/24' },
              { id: 4, name: 'Karmine Corp', logo: 'https://via.placeholder.com/24' },
              { id: 5, name: 'FURIA', logo: 'https://via.placeholder.com/24' },
              { id: 6, name: 'Spacestation', logo: 'https://via.placeholder.com/24' },
              { id: 7, name: 'Gentle Mates Alpine', logo: 'https://via.placeholder.com/24' },
              { id: 8, name: 'Oxygen Esports', logo: 'https://via.placeholder.com/24' }
            ],
            maxTeams: 8,
            // Exemple de bracket avec des résultats déjà remplis
            bracket: [
              // Premier tour (quarts de finale)
              [
                {
                  id: 'round1-match1',
                  team1: 'G2 Stride',
                  team1Id: 1,
                  team1Logo: 'https://via.placeholder.com/24',
                  team1Score: 3,
                  team2: 'Team BDS',
                  team2Id: 2,
                  team2Logo: 'https://via.placeholder.com/24',
                  team2Score: 4,
                  round: 1,
                  matchNumber: 1
                },
                {
                  id: 'round1-match2',
                  team1: 'Team Falcons',
                  team1Id: 3,
                  team1Logo: 'https://via.placeholder.com/24',
                  team1Score: 1,
                  team2: 'Karmine Corp',
                  team2Id: 4,
                  team2Logo: 'https://via.placeholder.com/24',
                  team2Score: 4,
                  round: 1,
                  matchNumber: 2
                },
                {
                  id: 'round1-match3',
                  team1: 'FURIA',
                  team1Id: 5,
                  team1Logo: 'https://via.placeholder.com/24',
                  team1Score: 4,
                  team2: 'Spacestation',
                  team2Id: 6,
                  team2Logo: 'https://via.placeholder.com/24',
                  team2Score: 3,
                  round: 1,
                  matchNumber: 3
                },
                {
                  id: 'round1-match4',
                  team1: 'Gentle Mates Alpine',
                  team1Id: 7,
                  team1Logo: 'https://via.placeholder.com/24',
                  team1Score: 2,
                  team2: 'Oxygen Esports',
                  team2Id: 8,
                  team2Logo: 'https://via.placeholder.com/24',
                  team2Score: 4,
                  round: 1,
                  matchNumber: 4
                }
              ],
              // Demi-finales
              [
                {
                  id: 'round2-match1',
                  team1: 'Team BDS',
                  team1Id: 2,
                  team1Logo: 'https://via.placeholder.com/24',
                  team1Score: 4,
                  team2: 'Karmine Corp',
                  team2Id: 4,
                  team2Logo: 'https://via.placeholder.com/24',
                  team2Score: 3,
                  round: 2,
                  matchNumber: 1
                },
                {
                  id: 'round2-match2',
                  team1: 'FURIA',
                  team1Id: 5,
                  team1Logo: 'https://via.placeholder.com/24',
                  team1Score: 2,
                  team2: 'Oxygen Esports',
                  team2Id: 8,
                  team2Logo: 'https://via.placeholder.com/24',
                  team2Score: 4,
                  round: 2,
                  matchNumber: 2
                }
              ],
              // Finale
              [
                {
                  id: 'round3-match1',
                  team1: 'Team BDS',
                  team1Id: 2,
                  team1Logo: 'https://via.placeholder.com/24',
                  team1Score: 4,
                  team2: 'Oxygen Esports',
                  team2Id: 8,
                  team2Logo: 'https://via.placeholder.com/24',
                  team2Score: 2,
                  round: 3,
                  matchNumber: 1
                }
              ]
            ]
          };
          
          // Exemple de tournoi avec un nombre impair d'équipes (7)
          if (id === '2') {
            mockTournament.name = 'Tournoi de Babyfoot - Édition Spéciale';
            mockTournament.teams = mockTournament.teams.slice(0, 7); // Prendre seulement 7 équipes
            mockTournament.maxTeams = 8;
            delete mockTournament.bracket; // Supprimer le bracket prédéfini pour qu'il soit généré automatiquement
          }
          
          // Exemple de tournoi avec seulement 4 équipes
          if (id === '1') {
            mockTournament.name = 'Tournoi du Printemps';
            mockTournament.teams = mockTournament.teams.slice(0, 4); // Prendre seulement 4 équipes
            mockTournament.maxTeams = 8;
            delete mockTournament.bracket; // Supprimer le bracket prédéfini pour qu'il soit généré automatiquement
          }
          
          // Exemple de tournoi avec 16 équipes possibles mais seulement 5 inscrites
          if (id === '4') {
            mockTournament.name = 'Grand Tournoi de Babyfoot - 16 équipes';
            mockTournament.maxTeams = 16;
            mockTournament.status = 'open';
            mockTournament.startDate = '2024-05-15';
            mockTournament.endDate = '2024-05-30';
            
            // Seulement 5 équipes ont rejoint
            mockTournament.teams = [
              { id: 1, name: 'Les Invincibles', logo: 'https://via.placeholder.com/24' },
              { id: 2, name: 'Foot Masters', logo: 'https://via.placeholder.com/24' },
              { id: 3, name: 'Table Titans', logo: 'https://via.placeholder.com/24' },
              { id: 4, name: 'Goal Getters', logo: 'https://via.placeholder.com/24' },
              { id: 5, name: 'Spin Doctors', logo: 'https://via.placeholder.com/24' }
            ];
            
            delete mockTournament.bracket; // Supprimer le bracket prédéfini pour qu'il soit généré automatiquement
          }
          
          setTournament(mockTournament);
          setLoading(false);
        }, 800);
      } catch (err) {
        setError('Erreur lors du chargement des données du tournoi');
        setLoading(false);
      }
    };

    fetchTournament();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Erreur!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Attention!</strong>
        <span className="block sm:inline"> Tournoi non trouvé.</span>
      </div>
    );
  }

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link to="/tournaments" className="text-blue-600 hover:text-blue-800">
          &larr; Retour aux tournois
        </Link>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6">
          <h1 className="text-2xl font-bold text-gray-900">{tournament.name}</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {new Date(tournament.startDate).toLocaleDateString('fr-FR')} - {new Date(tournament.endDate).toLocaleDateString('fr-FR')}
          </p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Statut</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(tournament.status)}`}>
                  {getStatusText(tournament.status)}
                </span>
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Nombre d'équipes</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {tournament.teams.length} / {tournament.maxTeams}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Bracket du tournoi</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Visualisation de l'avancement des matchs
          </p>
        </div>
        <div className="px-4 py-6 overflow-x-auto">
          <div className="mx-auto" style={{ width: '100%', minHeight: '800px' }}>
            <TournamentBracket tournament={tournament} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TournamentDetails; 