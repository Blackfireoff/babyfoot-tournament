import React, { useState } from 'react';
import { SingleEliminationBracket, SVGViewer } from 'react-tournament-brackets';

// Composant personnalisé pour afficher un match avec logos
const CustomMatch = ({ match, onMatchClick, onPartyClick, currentMatchId, style, onUpdateScore, ...props }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [team1Score, setTeam1Score] = useState(match.participants[0].resultText || '');
  const [team2Score, setTeam2Score] = useState(match.participants[1].resultText || '');

  const getTeamLogo = (teamName) => {
    if (!teamName || teamName === 'À déterminer') return null;
    
    // Rechercher l'équipe dans les données du tournoi
    const team = match.participants.find(p => p.name === teamName);
    return team && team.logo ? team.logo : 'https://via.placeholder.com/24';
  };

  const handleSaveScore = () => {
    if (onUpdateScore) {
      onUpdateScore(match.id, team1Score, team2Score);
    }
    setIsEditing(false);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setTeam1Score(match.participants[0].resultText || '');
    setTeam2Score(match.participants[1].resultText || '');
    setIsEditing(false);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        width: '200px',
        height: isEditing ? '140px' : '100px',
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
        ...style
      }}
      onClick={() => !isEditing && onMatchClick(match.id)}
    >
      {match.participants.map((participant, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px',
            backgroundColor: participant.isWinner ? '#f0f9ff' : 'transparent',
            borderBottom: index === 0 ? '1px solid #eee' : 'none'
          }}
          onClick={(e) => {
            if (!isEditing) {
              e.stopPropagation();
              onPartyClick(participant, match);
            }
          }}
        >
          <div style={{ marginRight: '8px', width: '24px', height: '24px' }}>
            {getTeamLogo(participant.name) && (
              <img 
                src={getTeamLogo(participant.name)} 
                alt={participant.name} 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            )}
          </div>
          <div style={{ flex: 1 }}>{participant.name}</div>
          {isEditing ? (
            <input
              type="number"
              min="0"
              value={index === 0 ? team1Score : team2Score}
              onChange={(e) => index === 0 ? setTeam1Score(e.target.value) : setTeam2Score(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              style={{ width: '40px', textAlign: 'center' }}
            />
          ) : (
            <div style={{ fontWeight: 'bold' }}>{participant.resultText || '-'}</div>
          )}
        </div>
      ))}
      
      {onUpdateScore && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px' }}>
          {isEditing ? (
            <>
              <button
                onClick={handleSaveScore}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  marginRight: '4px',
                  fontSize: '12px'
                }}
              >
                Enregistrer
              </button>
              <button
                onClick={handleCancelEdit}
                style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '12px'
                }}
              >
                Annuler
              </button>
            </>
          ) : (
            <button
              onClick={handleEditClick}
              style={{
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '12px'
              }}
            >
              Modifier le score
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const TournamentBracket = ({ tournament, onUpdateScore }) => {
  // Fonction pour convertir les données du tournoi au format attendu par la bibliothèque
  const convertToLibraryFormat = (tournamentData) => {
    if (!tournamentData || !tournamentData.teams || tournamentData.teams.length === 0) {
      return [];
    }

    const maxTeams = tournamentData.maxTeams || tournamentData.teams.length;
    const rounds = Math.ceil(Math.log2(maxTeams));
    
    // Créer les matchs du premier tour
    const firstRoundMatches = [];
    const totalMatches = Math.floor(maxTeams / 2);
    
    for (let i = 0; i < totalMatches; i++) {
      const team1Index = i * 2;
      const team2Index = i * 2 + 1;
      
      const team1 = team1Index < tournamentData.teams.length ? tournamentData.teams[team1Index] : null;
      const team2 = team2Index < tournamentData.teams.length ? tournamentData.teams[team2Index] : null;
      
      firstRoundMatches.push({
        id: `round1-match${i+1}`,
        name: `Match ${i+1}`,
        nextMatchId: i % 2 === 0 ? `round2-match${Math.floor(i/2) + 1}` : `round2-match${Math.floor(i/2) + 1}`,
        tournamentRoundText: '1',
        startTime: '',
        state: 'SCHEDULED',
        participants: [
          {
            id: team1 ? team1.id : `empty-${i*2}`,
            name: team1 ? team1.name : 'À déterminer',
            isWinner: false,
            status: team1 ? null : 'NO_SHOW',
            resultText: null,
            logo: team1 ? team1.logo : null
          },
          {
            id: team2 ? team2.id : `empty-${i*2+1}`,
            name: team2 ? team2.name : 'À déterminer',
            isWinner: false,
            status: team2 ? null : 'NO_SHOW',
            resultText: null,
            logo: team2 ? team2.logo : null
          }
        ]
      });
    }
    
    // Créer les matchs des tours suivants
    const allMatches = [...firstRoundMatches];
    
    for (let round = 2; round <= rounds; round++) {
      const matchesInRound = Math.pow(2, rounds - round);
      
      for (let match = 1; match <= matchesInRound; match++) {
        const nextMatchId = round < rounds ? `round${round+1}-match${Math.ceil(match/2)}` : null;
        
        allMatches.push({
          id: `round${round}-match${match}`,
          name: `Match ${match}`,
          nextMatchId: nextMatchId,
          tournamentRoundText: round.toString(),
          startTime: '',
          state: 'SCHEDULED',
          participants: [
            {
              id: `tbd-${round}-${match}-1`,
              name: 'À déterminer',
              isWinner: false,
              status: 'NO_SHOW',
              resultText: null,
              logo: null
            },
            {
              id: `tbd-${round}-${match}-2`,
              name: 'À déterminer',
              isWinner: false,
              status: 'NO_SHOW',
              resultText: null,
              logo: null
            }
          ]
        });
      }
    }
    
    // Si nous avons des données de bracket existantes, mettons à jour les participants
    if (tournamentData.bracket) {
      // Parcourir chaque tour du bracket
      tournamentData.bracket.forEach((round, roundIndex) => {
        // Parcourir chaque match du tour
        round.forEach((match, matchIndex) => {
          const matchId = `round${roundIndex+1}-match${matchIndex+1}`;
          const existingMatch = allMatches.find(m => m.id === matchId);
          
          if (existingMatch) {
            // Mettre à jour les participants
            if (match.team1) {
              existingMatch.participants[0].name = match.team1;
              existingMatch.participants[0].status = null;
              existingMatch.participants[0].logo = match.team1Logo;
              if (match.team1Score !== null) {
                existingMatch.participants[0].resultText = match.team1Score.toString();
                existingMatch.participants[0].isWinner = match.team1Score > match.team2Score;
              }
            }
            
            if (match.team2) {
              existingMatch.participants[1].name = match.team2;
              existingMatch.participants[1].status = null;
              existingMatch.participants[1].logo = match.team2Logo;
              if (match.team2Score !== null) {
                existingMatch.participants[1].resultText = match.team2Score.toString();
                existingMatch.participants[1].isWinner = match.team2Score > match.team1Score;
              }
            }
            
            // Mettre à jour l'état du match
            if (match.team1Score !== null && match.team2Score !== null) {
              existingMatch.state = 'DONE';
            }
          }
        });
      });
    }
    
    return allMatches;
  };

  const matches = convertToLibraryFormat(tournament);
  
  const handleMatchClick = (matchId) => {
    console.log(`Match clicked: ${matchId}`);
  };
  
  const handlePartyClick = (participant, match) => {
    console.log(`Participant clicked: ${participant.name} in match ${match.name}`);
  };

  return (
    <div className="tournament-bracket">
      {matches.length > 0 && (
        <SingleEliminationBracket
          matches={matches}
          matchComponent={({ match, ...props }) => (
            <CustomMatch 
              match={match} 
              onMatchClick={handleMatchClick}
              onPartyClick={handlePartyClick}
              onUpdateScore={onUpdateScore}
              {...props} 
            />
          )}
          svgWrapper={({ children, ...props }) => (
            <SVGViewer 
              width={1200} 
              height={800} 
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
      )}
    </div>
  );
};

export default TournamentBracket; 