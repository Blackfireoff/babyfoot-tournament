import React, { useState, useEffect } from 'react';

const MatchScoreRow = ({ match, team1, team2, onUpdateScore, allMatches }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [team1Score, setTeam1Score] = useState(match.team1_score !== null ? match.team1_score.toString() : '');
  const [team2Score, setTeam2Score] = useState(match.team2_score !== null ? match.team2_score.toString() : '');

  // Vérifier si les deux équipes sont présentes
  const canEdit = team1 && team2;
  
  // Vérifier si le match est déjà terminé
  const isMatchComplete = match.team1_score !== null && match.team2_score !== null;
  
  // Vérifier si tous les matchs précédents sont terminés
  const arePreviousMatchesComplete = () => {
    if (match.round === 1) return true; // Premier tour, pas de matchs précédents
    
    // Calculer les numéros des matchs précédents
    const prevRound = match.round - 1;
    const matchNum = match.match_number;
    const prevMatchNum1 = matchNum * 2 - 1;
    const prevMatchNum2 = matchNum * 2;
    
    // Vérifier que ces matchs existent et sont terminés
    const prevMatches = allMatches.filter(m => 
      m.round === prevRound && 
      (m.match_number === prevMatchNum1 || m.match_number === prevMatchNum2)
    );
    
    // Si on ne trouve pas les matchs précédents, on considère qu'ils ne sont pas terminés
    if (prevMatches.length === 0) return false;
    
    // Vérifier que tous les matchs précédents ont des scores
    return prevMatches.every(m => m.team1_score !== null && m.team2_score !== null);
  };
  
  // Déterminer si on peut afficher les scores
  const canShowScores = match.round === 1 || arePreviousMatchesComplete();
  
  // Déterminer le statut du match
  const getMatchStatus = () => {
    if (!canEdit) {
      return "En attente des équipes";
    }
    if (!canShowScores && match.round > 1) {
      return "En attente des matchs précédents";
    }
    if (isMatchComplete) {
      return "Terminé";
    }
    return "À jouer";
  };

  const handleSaveScore = () => {
    onUpdateScore(match.id, parseInt(team1Score) || 0, parseInt(team2Score) || 0);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setTeam1Score(match.team1_score !== null ? match.team1_score.toString() : '');
    setTeam2Score(match.team2_score !== null ? match.team2_score.toString() : '');
    setIsEditing(false);
  };

  // Déterminer la classe CSS en fonction de l'état du match
  const getRowClass = () => {
    if (!canEdit) return "bg-gray-50";
    if (!canShowScores && match.round > 1) return "bg-yellow-50";
    if (isMatchComplete) return "bg-green-50";
    return "";
  };

  return (
    <tr className={getRowClass()}>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        Tour {match.round}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        Match {match.match_number}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {team1 && team1.logo && (
            <img src={team1.logo} alt={team1.name} className="w-8 h-8 mr-3" />
          )}
          <div className="text-sm font-medium text-gray-900">
            {team1 ? team1.name : 'À déterminer'}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {isEditing ? (
          <input
            type="number"
            min="0"
            value={team1Score}
            onChange={(e) => setTeam1Score(e.target.value)}
            className="w-16 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        ) : (
          <span className="text-sm text-gray-900">
            {canShowScores 
              ? (match.team1_score !== null ? match.team1_score : '-') 
              : '-'}
          </span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {team2 && team2.logo && (
            <img src={team2.logo} alt={team2.name} className="w-8 h-8 mr-3" />
          )}
          <div className="text-sm font-medium text-gray-900">
            {team2 ? team2.name : 'À déterminer'}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {isEditing ? (
          <input
            type="number"
            min="0"
            value={team2Score}
            onChange={(e) => setTeam2Score(e.target.value)}
            className="w-16 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        ) : (
          <span className="text-sm text-gray-900">
            {canShowScores 
              ? (match.team2_score !== null ? match.team2_score : '-') 
              : '-'}
          </span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          !canEdit ? "bg-gray-100 text-gray-800" : 
          !canShowScores && match.round > 1 ? "bg-yellow-100 text-yellow-800" :
          isMatchComplete ? "bg-green-100 text-green-800" : 
          "bg-blue-100 text-blue-800"
        }`}>
          {getMatchStatus()}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        {isEditing ? (
          <div className="flex space-x-2">
            <button
              onClick={handleSaveScore}
              className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-sm"
            >
              Enregistrer
            </button>
            <button
              onClick={handleCancelEdit}
              className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-sm"
            >
              Annuler
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className={`${
              canEdit && canShowScores
                ? "text-blue-600 hover:text-blue-900 bg-gray-100 hover:bg-gray-200" 
                : "text-gray-400 bg-gray-100 cursor-not-allowed"
            } px-3 py-1 rounded-md text-sm`}
            disabled={!canEdit || !canShowScores}
            title={
              !canEdit 
                ? "Les équipes ne sont pas encore déterminées" 
                : !canShowScores 
                  ? "Les matchs précédents ne sont pas terminés"
                  : ""
            }
          >
            Modifier
          </button>
        )}
      </td>
    </tr>
  );
};

export default MatchScoreRow; 