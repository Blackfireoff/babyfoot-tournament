import React, { useState, useEffect, Component } from 'react';
import { SingleEliminationBracket, SVGViewer } from 'react-tournament-brackets';
import './TournamentBracketEdit.css';

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
    console.error("Erreur dans le composant TournamentBracket:", error, errorInfo);
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

// Composant personnalisé pour afficher un match avec logos
const CustomMatch = ({ match, onMatchClick, onPartyClick, currentMatchId, style, ...props }) => {
  const getTeamLogo = (teamName) => {
    if (!teamName || teamName === 'À déterminer') return null;
    
    // Rechercher l'équipe dans les données du tournoi
    const team = match.participants.find(p => p.name === teamName);
    return team && team.logo ? team.logo : null;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        ...style,
      }}
      onClick={() => onMatchClick(match.id)}
    >
      <div style={{ textAlign: 'center', padding: '0 0 5px' }}>
        {match.name}
      </div>
      {match.participants.map((participant, index) => (
        <div
          key={participant.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '5px 10px',
            backgroundColor: participant.isWinner ? 'rgba(16, 185, 129, 0.1)' : 'white',
            border: '1px solid #000',
            borderTop: index === 0 ? '1px solid #000' : 'none',
          }}
          onClick={(e) => {
            e.stopPropagation();
            onPartyClick(participant, match);
          }}
        >
          {getTeamLogo(participant.name) && (
            <div style={{ 
              width: '24px', 
              height: '24px', 
              marginRight: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#fff',
              borderRadius: '50%',
              overflow: 'hidden'
            }}>
              <img 
                src={getTeamLogo(participant.name)} 
                alt={participant.name} 
                style={{ maxWidth: '100%', maxHeight: '100%' }} 
              />
            </div>
          )}
          <div style={{ flex: 1 }}>{participant.name}</div>
          <div style={{ marginLeft: '10px', fontWeight: 'bold' }}>
            {participant.resultText}
          </div>
        </div>
      ))}
    </div>
  );
};

const TournamentBracket = ({ tournament }) => {
  // Fonction pour normaliser l'ID d'un match
  const normalizeMatchId = (originalId, round, matchNumber) => {
    // Vérifier si l'ID est déjà au format attendu (round{X}-match{Y})
    if (/^round\d+-match\d+$/.test(originalId)) {
      return originalId;
    }
    
    // Sinon, créer un nouvel ID au format attendu
    return `round${round}-match${matchNumber}`;
  };

  // Fonction pour convertir les données du tournoi au format attendu par la bibliothèque
  const convertToLibraryFormat = (tournamentData) => {
    if (!tournamentData || !tournamentData.teams || tournamentData.teams.length === 0) {
      return [];
    }

    // Vérifier si le tournoi a des matchs
    const hasMatches = tournamentData.matches && tournamentData.matches.length > 0;
    
    const maxTeams = tournamentData.max_teams || tournamentData.teams.length;
    const rounds = Math.ceil(Math.log2(maxTeams));
    
    // Calculer le nombre total de matchs pour le premier tour
    const totalMatches = Math.floor(maxTeams / 2);
    
    // Initialiser allMatches en dehors du bloc if
    const allMatches = [];
    
    // Si le tournoi a des matchs, utiliser ces données
    if (hasMatches) {
      console.log("Utilisation des matchs existants:", tournamentData.matches);
      
      // Organiser les matchs par tour
      const matchesByRound = {};
      tournamentData.matches.forEach(match => {
        if (!matchesByRound[match.round]) {
          matchesByRound[match.round] = [];
        }
        matchesByRound[match.round].push(match);
      });
      
      // Fonction pour vérifier si tous les matchs précédents d'un match sont terminés
      const arePreviousMatchesComplete = (match) => {
        if (match.round === 1) return true; // Premier tour, pas de matchs précédents
        
        // Calculer les numéros des matchs précédents
        const prevRound = match.round - 1;
        const matchNum = match.match_number;
        const prevMatchNum1 = matchNum * 2 - 1;
        const prevMatchNum2 = matchNum * 2;
        
        // Vérifier que ces matchs existent et sont terminés
        const prevMatches = tournamentData.matches.filter(m => 
          m.round === prevRound && 
          (m.match_number === prevMatchNum1 || m.match_number === prevMatchNum2)
        );
        
        // Si on ne trouve pas les matchs précédents, on considère qu'ils ne sont pas terminés
        if (prevMatches.length === 0) return false;
        
        // Vérifier que tous les matchs précédents ont des scores
        return prevMatches.every(m => m.team1_score !== null && m.team2_score !== null);
      };
      
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
            tournament_id: tournamentData.id,
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
      
      // Auto-valider les matchs avec une seule équipe
      for (const round in matchesByRound) {
        matchesByRound[round].forEach(match => {
          // Si un match a une équipe mais pas l'autre, auto-valider
          if ((match.team1_id && !match.team2_id) || (!match.team1_id && match.team2_id)) {
            // Déterminer quelle équipe est présente
            const winningTeamId = match.team1_id || match.team2_id;
            const isTeam1 = !!match.team1_id;
            
            // Définir les scores pour auto-valider (1-0 ou 0-1)
            match.team1_score = isTeam1 ? 1 : 0;
            match.team2_score = isTeam1 ? 0 : 1;
            
            // Propager le gagnant au tour suivant si ce n'est pas déjà fait
            const nextRound = parseInt(round) + 1;
            const nextMatchNumber = Math.ceil(match.match_number / 2);
            
            // Vérifier si le tour suivant existe
            if (matchesByRound[nextRound]) {
              const nextMatch = matchesByRound[nextRound].find(m => m.match_number === nextMatchNumber);
              if (nextMatch) {
                // Déterminer si l'équipe gagnante doit être placée en team1 ou team2
                if (match.match_number % 2 === 1) {
                  // Match impair, placer en team1
                  if (!nextMatch.team1_id) {
                    nextMatch.team1_id = winningTeamId;
                  }
                } else {
                  // Match pair, placer en team2
                  if (!nextMatch.team2_id) {
                    nextMatch.team2_id = winningTeamId;
                  }
                }
              }
            }
          }
        });
      }
      
      // Traiter chaque tour
      for (let round = 1; round <= rounds; round++) {
        const roundMatches = matchesByRound[round] || [];
        // Calculer le nombre de matchs attendus pour ce tour
        const expectedMatchesInRound = round === 1 ? totalMatches : Math.pow(2, rounds - round);
        const matchesInRound = roundMatches.length > 0 ? roundMatches : 
                              Array(expectedMatchesInRound).fill(null);
        
        console.log(`Tour ${round}: ${matchesInRound.length} matchs (attendus: ${expectedMatchesInRound})`);
        
        matchesInRound.forEach((match, index) => {
          if (match) {
            // Utiliser les données du match existant
            const team1 = tournamentData.teams.find(t => t.id === match.team1_id);
            const team2 = tournamentData.teams.find(t => t.id === match.team2_id);
            
            const nextRound = round + 1;
            const nextMatchIndex = Math.floor(index / 2);
            const nextMatchId = round < rounds ? `round${nextRound}-match${nextMatchIndex + 1}` : null;
            
            // Normaliser l'ID du match pour s'assurer qu'il est compatible avec la bibliothèque
            const normalizedMatchId = normalizeMatchId(match.id, round, match.match_number);
            
            // Vérifier si on peut afficher les scores (matchs précédents terminés)
            const canShowScores = match.round === 1 || arePreviousMatchesComplete(match);
            
            allMatches.push({
              id: normalizedMatchId,
              originalId: match.id, // Conserver l'ID original pour les références
              name: `Match ${match.match_number}`,
              nextMatchId: nextMatchId,
              tournamentRoundText: `${round}`,
              startTime: '',
              state: canShowScores && match.team1_score !== null ? 'DONE' : 'SCHEDULED',
              participants: [
                {
                  id: team1 ? team1.id : `empty-${index*2}`,
                  name: team1 ? team1.name : 'À déterminer',
                  isWinner: canShowScores && match.team1_score !== null && match.team2_score !== null && match.team1_score > match.team2_score,
                  status: team1 ? null : 'NO_SHOW',
                  resultText: canShowScores && match.team1_score !== null ? `${match.team1_score}` : '',
                  logo: team1 ? team1.logo : null,
                },
                {
                  id: team2 ? team2.id : `empty-${index*2+1}`,
                  name: team2 ? team2.name : 'À déterminer',
                  isWinner: canShowScores && match.team1_score !== null && match.team2_score !== null && match.team2_score > match.team1_score,
                  status: team2 ? null : 'NO_SHOW',
                  resultText: canShowScores && match.team2_score !== null ? `${match.team2_score}` : '',
                  logo: team2 ? team2.logo : null,
                },
              ],
            });
          } else {
            // Ajouter un match vide si nécessaire pour compléter le bracket
            allMatches.push({
              id: `round${round}-match${index+1}`,
              name: `Match ${index+1}`,
              nextMatchId: round < rounds ? `round${round+1}-match${Math.floor(index/2) + 1}` : null,
              tournamentRoundText: `${round}`,
              startTime: '',
              state: 'SCHEDULED',
              participants: [
                {
                  id: `empty-${index*2}`,
                  name: 'À déterminer',
                  status: 'NO_SHOW',
                  resultText: '',
                },
                {
                  id: `empty-${index*2+1}`,
                  name: 'À déterminer',
                  status: 'NO_SHOW',
                  resultText: '',
                },
              ],
            });
          }
        });
      }
    } else {
      // Si le tournoi n'a pas de matchs, créer un bracket vide
      console.log("Création d'un bracket vide");
      
      // Créer les matchs pour chaque tour
      for (let round = 1; round <= rounds; round++) {
        const matchesInRound = round === 1 ? totalMatches : Math.pow(2, rounds - round);
        
        for (let i = 0; i < matchesInRound; i++) {
          allMatches.push({
            id: `round${round}-match${i+1}`,
            name: `Match ${i+1}`,
            nextMatchId: round < rounds ? `round${round+1}-match${Math.floor(i/2) + 1}` : null,
            tournamentRoundText: `${round}`,
            startTime: '',
            state: 'SCHEDULED',
            participants: [
              {
                id: `empty-${i*2}`,
                name: 'À déterminer',
                status: 'NO_SHOW',
                resultText: '',
              },
              {
                id: `empty-${i*2+1}`,
                name: 'À déterminer',
                status: 'NO_SHOW',
                resultText: '',
              },
            ],
          });
        }
      }
    }
    
    return allMatches;
  };

  // Convertir les données du tournoi au format attendu par la bibliothèque
  const matches = convertToLibraryFormat(tournament);
  
  // Vérifier si le bracket est valide
  const isValidBracket = matches.length > 0 && matches.every(match => 
    match.participants && 
    match.participants.length === 2
  );

  if (!isValidBracket) {
    return (
      <div className="tournament-bracket w-full flex justify-center items-center" style={{ minHeight: '400px' }}>
        <p className="text-red-500">Format de données incorrect pour l'affichage du bracket.</p>
      </div>
    );
  }

  const handleMatchClick = (matchId) => {
    // Trouver le match correspondant pour obtenir l'ID original si disponible
    const match = matches.find(m => m.id === matchId);
    const originalId = match && match.originalId ? match.originalId : matchId;
    
    console.log(`Match clicked: ${originalId}`);
  };
  
  const handlePartyClick = (participant, match) => {
    console.log(`Participant clicked: ${participant.name} in match ${match.name}`);
  };

  // Calculer la largeur et la hauteur en fonction du nombre de tours
  const maxRound = Math.max(...matches.map(m => parseInt(m.tournamentRoundText)));
  const width = Math.max(1000, maxRound * 300); // Au moins 1000px, ou 300px par tour
  const height = Math.max(600, Math.pow(2, maxRound - 1) * 150); // Hauteur adaptée au nombre de matchs

  return (
    <ErrorBoundary>
      <div className="tournament-bracket w-full overflow-x-auto">
        {matches.length > 0 && (
          <div style={{ minWidth: `${width}px` }}>
            <SingleEliminationBracket
              matches={matches}
              matchComponent={({ match, ...props }) => (
                <CustomMatch 
                  match={match} 
                  onMatchClick={handleMatchClick}
                  onPartyClick={handlePartyClick}
                  {...props} 
                />
              )}
              svgWrapper={({ children, ...props }) => (
                <SVGViewer 
                  width={width} 
                  height={height} 
                  background="#FFFFFF"
                  SVGBackground="#FFFFFF"
                  {...props}
                >
                  {children}
                </SVGViewer>
              )}
              options={{
                style: {
                  roundHeader: {
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: '#374151'
                  },
                  connectorColor: '#000000',
                  connectorColorHighlight: '#000000',
                  boxHeight: 100
                }
              }}
            />
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default TournamentBracket;