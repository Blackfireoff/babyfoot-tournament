import React, { Component } from 'react';
import './TournamentBracket.css';

// Composant ErrorBoundary pour capturer les erreurs
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Erreur dans le composant SimpleTournamentBracket:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="tournament-bracket w-full flex justify-center items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <p className="text-red-500 font-semibold">Une erreur s'est produite lors de l'affichage du bracket.</p>
            <p className="text-gray-500 mt-2">Veuillez réessayer plus tard ou contacter l'administrateur.</p>
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-blue-500">Détails techniques</summary>
              <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
                {this.state.error && this.state.error.toString()}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Composant Match pour afficher un match individuel
const Match = ({ match, teams }) => {
  const team1 = teams.find(t => t.id === match.team1_id);
  const team2 = teams.find(t => t.id === match.team2_id);
  
  const isCompleted = match.team1_score !== null && match.team2_score !== null;
  const team1Winner = isCompleted && match.team1_score > match.team2_score;
  const team2Winner = isCompleted && match.team2_score > match.team1_score;
  
  return (
    <div className="match">
      <div className="text-xs text-gray-500 mb-1 text-center">
        {match.round === 1 ? '1er tour' : match.round === 2 ? '2ème tour' : match.round === 3 ? '3ème tour' : `${match.round}ème tour`} - Match {match.match_number}
      </div>
      <div className={`team ${team1Winner ? 'winner' : ''}`}>
        <div className="team-logo">
          {team1 && team1.logo && (
            <img src={team1.logo} alt={team1.name} />
          )}
        </div>
        <div className="team-name">{team1 ? team1.name : 'À déterminer'}</div>
        <div className="team-score">{match.team1_score !== null ? match.team1_score : '-'}</div>
      </div>
      <div className={`team ${team2Winner ? 'winner' : ''}`}>
        <div className="team-logo">
          {team2 && team2.logo && (
            <img src={team2.logo} alt={team2.name} />
          )}
        </div>
        <div className="team-name">{team2 ? team2.name : 'À déterminer'}</div>
        <div className="team-score">{match.team2_score !== null ? match.team2_score : '-'}</div>
      </div>
      {isCompleted && (
        <div className="text-xs text-center mt-1 text-gray-500">
          {team1Winner ? `${team1.name} remporte le match` : team2Winner ? `${team2.name} remporte le match` : 'Match nul'}
        </div>
      )}
    </div>
  );
};

// Composant principal SimpleTournamentBracket
const SimpleTournamentBracket = ({ tournament }) => {
  if (!tournament || !tournament.matches || tournament.matches.length === 0) {
    return (
      <div className="tournament-bracket w-full flex justify-center items-center" style={{ minHeight: '400px' }}>
        <p className="text-gray-500">Aucun match disponible pour afficher le bracket.</p>
      </div>
    );
  }
  
  // Organiser les matchs par tour
  const matchesByRound = {};
  tournament.matches.forEach(match => {
    if (!matchesByRound[match.round]) {
      matchesByRound[match.round] = [];
    }
    matchesByRound[match.round].push(match);
  });
  
  // Trier les matchs par numéro de match dans chaque tour
  Object.keys(matchesByRound).forEach(round => {
    matchesByRound[round].sort((a, b) => a.match_number - b.match_number);
  });
  
  // Vérifier si tous les matchs du premier tour sont terminés
  const round1Matches = matchesByRound[1] || [];
  const allRound1MatchesCompleted = round1Matches.length > 0 && 
    round1Matches.every(match => match.team1_score !== null && match.team2_score !== null);
  
  // Générer le match final s'il n'existe pas encore mais que les matchs du premier tour sont terminés
  if (allRound1MatchesCompleted && (!matchesByRound[2] || matchesByRound[2].length === 0)) {
    // Trouver les gagnants des matchs du premier tour
    const winners = round1Matches.map(match => {
      if (match.team1_score > match.team2_score) {
        return match.team1_id;
      } else if (match.team2_score > match.team1_score) {
        return match.team2_id;
      }
      return null; // En cas de match nul
    }).filter(Boolean);
    
    // S'il y a au moins deux gagnants, créer un match final
    if (winners.length >= 2) {
      const finalMatch = {
        id: "round2-match1",
        tournament_id: tournament.id,
        team1_id: winners[0],
        team2_id: winners[1],
        round: 2,
        match_number: 1,
        team1_score: null,
        team2_score: null
      };
      
      // Ajouter le match final au deuxième tour
      matchesByRound[2] = [finalMatch];
    }
  }
  
  // Déterminer le nombre de tours
  const rounds = Math.max(...Object.keys(matchesByRound).map(Number));
  
  // Créer les classes pour les rounds
  const roundClasses = Array.from({ length: rounds }, (_, i) => `round-${i + 1}`);
  
  return (
    <ErrorBoundary>
      <div className="tournament-bracket w-full overflow-x-auto py-8">
        <div className="bracket-container">
          {Array.from({ length: rounds }, (_, i) => i + 1).map(round => {
            const roundIndex = rounds - round;
            return (
              <div key={round} className={`round ${roundClasses[roundIndex]}`}>
                <div className="round-header">
                  {round === rounds ? 'Finale' : round === rounds - 1 ? 'Demi-finales' : round === rounds - 2 ? 'Quarts de finale' : `Tour ${round}`}
                </div>
                <div className="matches">
                  {(matchesByRound[round] || []).map(match => (
                    <div key={match.id} className="match-wrapper">
                      <Match 
                        match={match} 
                        teams={tournament.teams} 
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default SimpleTournamentBracket; 