import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { tournamentService } from '../services/api';
import TournamentBracket from '../components/TournamentBracket';
import SimpleTournamentBracket from '../components/SimpleTournamentBracket';
import MatchScoreRow from '../components/MatchScoreRow';
import '../components/TournamentBracket.css';
import '../components/TournamentBracketEdit.css';

function TournamentDetails() {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchTournament();
  }, [id]);

  const fetchTournament = async () => {
    if (!refreshing) setLoading(true);
    else setRefreshing(true);
    
    setError(null);
    try {
      const tournamentData = await tournamentService.getTournament(parseInt(id));
      
      // Si le tournoi est en cours, récupérer également les matchs
      if (tournamentData.status === 'in_progress' || tournamentData.status === 'closed') {
        try {
          const matches = await tournamentService.getTournamentMatches(tournamentData.id);
          tournamentData.matches = matches;
        } catch (matchErr) {
          console.error('Error fetching tournament matches:', matchErr);
          // Ne pas bloquer l'affichage du tournoi si les matchs ne peuvent pas être récupérés
          tournamentData.matches = [];
        }
      } else {
        tournamentData.matches = [];
      }
      
      setTournament(tournamentData);
    } catch (err) {
      console.error('Error fetching tournament:', err);
      setError('Erreur lors du chargement des données du tournoi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fonction pour rafraîchir uniquement les données sans afficher le loader principal
  const refreshTournament = () => {
    setRefreshing(true);
    fetchTournament();
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
        return 'Tournoi terminé';
      default:
        return status;
    }
  };

  const handleStartTournament = async () => {
    if (!confirm("Êtes-vous sûr de vouloir démarrer le tournoi ? Cette action ne peut pas être annulée.")) {
      return;
    }
    
    try {
      setError(null);
      const result = await tournamentService.startTournament(tournament.id);
      console.log("Tournoi démarré avec succès:", result);
      
      // Attendre un court instant pour permettre au backend de traiter les données
      setTimeout(() => {
        fetchTournament(); // Recharger les données du tournoi
      }, 1000);
    } catch (err) {
      console.error('Error starting tournament:', err);
      setError(`Erreur lors du démarrage du tournoi: ${err.message || 'Erreur inconnue'}`);
    }
  };

  const handleCheckTournamentCompleted = async () => {
    try {
      setError(null);
      setRefreshing(true);
      const result = await tournamentService.checkTournamentCompleted(tournament.id);
      console.log("Vérification du statut du tournoi:", result);
      
      // Recharger les données du tournoi
      fetchTournament();
    } catch (err) {
      console.error('Error checking tournament status:', err);
      setError(`Erreur lors de la vérification du statut du tournoi: ${err.message || 'Erreur inconnue'}`);
      setRefreshing(false);
    }
  };

  const handleUpdateScore = async (matchId, team1Score, team2Score) => {
    try {
      setError(null);
      await tournamentService.updateMatchScore(matchId, team1Score, team2Score);
      // Recharger les données complètes du tournoi, y compris les matchs mis à jour
      await fetchTournament();
      // Afficher un message de succès temporaire
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50';
      successMessage.innerHTML = '<strong>Succès!</strong> Score mis à jour avec succès.';
      document.body.appendChild(successMessage);
      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 3000);
    } catch (err) {
      console.error('Error updating match score:', err);
      
      // Afficher un message d'erreur plus précis
      let errorMessage = 'Impossible de mettre à jour le score.';
      
      if (err.message) {
        if (err.message.includes('match précédent')) {
          errorMessage = err.message;
        } else if (err.message.includes('équipes manquantes')) {
          errorMessage = 'Impossible de mettre à jour le score : une ou plusieurs équipes manquantes.';
        } else if (err.message.includes('permissions')) {
          errorMessage = 'Vous n\'avez pas les permissions nécessaires pour mettre à jour ce match.';
        } else if (err.message.includes('not in progress')) {
          errorMessage = 'Le tournoi n\'est pas en cours. Impossible de mettre à jour les scores.';
        } else {
          errorMessage = `Erreur: ${err.message}`;
        }
      }
      
      setError(errorMessage);
      
      // Faire défiler jusqu'au message d'erreur
      setTimeout(() => {
        const errorElement = document.querySelector('[role="alert"]');
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  const canShowMatchScores = (match) => {
    if (match.round === 1) return true; // Premier tour, pas de matchs précédents
    
    // Calculer les numéros des matchs précédents
    const prevRound = match.round - 1;
    const matchNum = match.match_number;
    const prevMatchNum1 = matchNum * 2 - 1;
    const prevMatchNum2 = matchNum * 2;
    
    // Vérifier que ces matchs existent et sont terminés
    const prevMatches = tournament.matches.filter(m => 
      m.round === prevRound && 
      (m.match_number === prevMatchNum1 || m.match_number === prevMatchNum2)
    );
    
    // Si on ne trouve pas les matchs précédents, on considère qu'ils ne sont pas terminés
    if (prevMatches.length === 0) return false;
    
    // Vérifier que tous les matchs précédents ont des scores
    return prevMatches.every(m => m.team1_score !== null && m.team2_score !== null);
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
            <div className="flex space-x-2">
              {user && tournament.owner_id === user.id && tournament.status === 'open' && tournament.teams.length >= 1 && (
                <button
                  onClick={handleStartTournament}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Démarrer le tournoi
                </button>
              )}
              {user && tournament.status === 'in_progress' && (tournament.owner_id === user.id || user.isAdmin) && (
                <button
                  onClick={handleCheckTournamentCompleted}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Vérifier si terminé
                </button>
              )}
            </div>
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
                {tournament.teams.length} / {tournament.max_teams}
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

      {tournament.status !== 'open' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Bracket du tournoi</h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Visualisation de l'avancement des matchs
            </p>
          </div>
          <div className="px-4 py-6">
            <div className="w-full" style={{ minHeight: '800px' }}>
              {tournament && tournament.matches && tournament.matches.length > 0 ? (
                <TournamentBracket 
                  tournament={tournament} 
                />
              ) : (
                <div className="flex justify-center items-center h-64">
                  <p className="text-gray-500">Aucun match disponible pour afficher le bracket.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tournament.status === 'in_progress' && user && (tournament.owner_id === user.id || user.isAdmin) && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-8">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Gestion des scores</h2>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Mettez à jour les scores des matchs du tournoi
              </p>
            </div>
            <button 
              onClick={refreshTournament}
              disabled={refreshing}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
            >
              {refreshing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Chargement...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Rafraîchir
                </>
              )}
            </button>
          </div>
          <div className="px-4 py-6">
            {tournament.matches && tournament.matches.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tour
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Match
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Équipe 1
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Équipe 2
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tournament.matches.map((match) => (
                      <MatchScoreRow
                        key={match.id}
                        match={match}
                        teams={tournament.teams}
                        onUpdateScore={handleUpdateScore}
                        canShowScores={canShowMatchScores(match)}
                        isMatchComplete={match.team1_score !== null && match.team2_score !== null}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Aucun match disponible pour le moment. {tournament.status === 'in_progress' ? "Veuillez rafraîchir la page si le tournoi vient d'être démarré." : ""}</p>
            )}
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
                    <Link 
                      to={`/teams/${team.id}`}
                      className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {team.name}
                    </Link>
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