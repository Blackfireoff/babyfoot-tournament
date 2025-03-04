import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { tournamentService } from '../services/api';
import TournamentBracket from '../components/TournamentBracket';
import '../components/TournamentBracket.css';

function TournamentDetails() {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchTournament();
  }, [id]);

  const fetchTournament = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tournamentService.getTournamentById(parseInt(id));
      setTournament(data);
    } catch (err) {
      console.error('Error fetching tournament:', err);
      setError('Erreur lors du chargement des données du tournoi');
    } finally {
      setLoading(false);
    }
  };

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

  const handleStartTournament = async () => {
    if (!confirm("Êtes-vous sûr de vouloir démarrer le tournoi ? Cette action ne peut pas être annulée.")) {
      return;
    }
    
    try {
      await tournamentService.startTournament(tournament.id);
      fetchTournament(); // Recharger les données du tournoi
    } catch (err) {
      console.error('Error starting tournament:', err);
      alert('Impossible de démarrer le tournoi. Veuillez réessayer plus tard.');
    }
  };

  const handleUpdateScore = async (matchId, team1Score, team2Score) => {
    try {
      await tournamentService.updateMatchScore(matchId, {
        team1Score: parseInt(team1Score),
        team2Score: parseInt(team2Score)
      });
      fetchTournament(); // Recharger les données du tournoi
    } catch (err) {
      console.error('Error updating match score:', err);
      alert('Impossible de mettre à jour le score. Veuillez réessayer plus tard.');
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{tournament.name}</h1>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {new Date(tournament.startDate).toLocaleDateString('fr-FR')} - {tournament.endDate && new Date(tournament.endDate).toLocaleDateString('fr-FR')}
              </p>
            </div>
            {user && tournament.ownerId === user.id && tournament.status === 'open' && tournament.teams.length >= 2 && (
              <button
                onClick={handleStartTournament}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Démarrer le tournoi
              </button>
            )}
          </div>
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
            {tournament.ownerId && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Organisateur</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {tournament.ownerName || `Utilisateur #${tournament.ownerId}`}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {tournament.status !== 'open' && tournament.bracket && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Bracket du tournoi</h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Visualisation de l'avancement des matchs
            </p>
          </div>
          <div className="px-4 py-6 overflow-x-auto">
            <div className="mx-auto" style={{ width: '100%', minHeight: '800px' }}>
              <TournamentBracket 
                tournament={tournament} 
                onUpdateScore={user && (tournament.ownerId === user.id || user.isAdmin) ? handleUpdateScore : null}
              />
            </div>
          </div>
        </div>
      )}

      {tournament.status === 'open' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Équipes inscrites</h2>
          </div>
          <div className="px-4 py-6">
            {tournament.teams.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucune équipe inscrite pour le moment.</p>
            ) : (
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tournament.teams.map(team => (
                  <li key={team.id} className="bg-gray-50 rounded-lg p-4 flex items-center">
                    {team.logo && (
                      <img src={team.logo} alt={team.name} className="w-8 h-8 mr-3" />
                    )}
                    <span className="font-medium">{team.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default TournamentDetails; 