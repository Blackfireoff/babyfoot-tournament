import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const MatchScoreRow = ({ match, teams, onUpdateScore, canShowScores, isMatchComplete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [team1Score, setTeam1Score] = useState(match.team1_score !== null ? match.team1_score.toString() : '');
  const [team2Score, setTeam2Score] = useState(match.team2_score !== null ? match.team2_score.toString() : '');
  
  const team1 = teams.find(t => t.id === match.team1_id) || { name: "Équipe à déterminer" };
  const team2 = teams.find(t => t.id === match.team2_id) || { name: "Équipe à déterminer" };
  
  const hasTeam1 = match.team1_id !== null;
  const hasTeam2 = match.team2_id !== null;
  const hasNoTeams = !hasTeam1 && !hasTeam2;
  const hasOneTeam = (hasTeam1 && !hasTeam2) || (!hasTeam1 && hasTeam2);
  const hasBothTeams = hasTeam1 && hasTeam2;
  
  // Vérifier si le match peut être joué (a les deux équipes et les matchs précédents sont terminés)
  const canPlay = hasBothTeams && canShowScores && !isMatchComplete;
  
  const getMatchStatus = () => {
    if (isMatchComplete) {
      return "Terminé";
    }
    
    if (hasNoTeams) {
      return "En attente des équipes";
    }
    
    if (hasOneTeam) {
      return hasTeam1 ? `${team1.name} gagne par forfait` : `${team2.name} gagne par forfait`;
    }
    
    if (!canShowScores && match.round > 1) {
      return "En attente des matchs précédents";
    }
    
    return "À jouer";
  };

  const handleSaveScore = () => {
    // Si aucune équipe n'est présente ou une seule équipe est présente,
    // utiliser des scores par défaut (1-0 ou 0-0)
    if (hasNoTeams) {
      onUpdateScore(match.id, 0, 0);
    } else if (hasTeam1 && !hasTeam2) {
      onUpdateScore(match.id, 1, 0);
    } else if (!hasTeam1 && hasTeam2) {
      onUpdateScore(match.id, 0, 1);
    } else {
      // Les deux équipes sont présentes, utiliser les scores saisis
      onUpdateScore(match.id, parseInt(team1Score) || 0, parseInt(team2Score) || 0);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setTeam1Score(match.team1_score !== null ? match.team1_score.toString() : '');
    setTeam2Score(match.team2_score !== null ? match.team2_score.toString() : '');
    setIsEditing(false);
  };

  // Déterminer la classe CSS en fonction de l'état du match
  const getRowClass = () => {
    if (!hasTeam1 && !hasTeam2) return "bg-gray-50";
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
          {hasTeam1 && team1.logo && (
            <img src={team1.logo} alt={team1.name} className="w-8 h-8 mr-3" />
          )}
          <div className="text-sm font-medium text-gray-900">
            {team1 ? (
              <Link 
                to={`/teams/${team1.id}`}
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                {team1.name}
              </Link>
            ) : 'À déterminer'}
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
          {hasTeam2 && team2.logo && (
            <img src={team2.logo} alt={team2.name} className="w-8 h-8 mr-3" />
          )}
          <div className="text-sm font-medium text-gray-900">
            {team2 ? (
              <Link 
                to={`/teams/${team2.id}`}
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                {team2.name}
              </Link>
            ) : 'À déterminer'}
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
          !hasTeam1 && !hasTeam2 ? "bg-gray-100 text-gray-800" : 
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
          <>
            {canPlay ? (
              <button
                onClick={() => setIsEditing(true)}
                className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-sm"
              >
                À jouer
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className={`${
                  hasBothTeams && canShowScores
                    ? "text-blue-600 hover:text-blue-900 bg-gray-100 hover:bg-gray-200" 
                    : "text-gray-400 bg-gray-100 cursor-not-allowed"
                } px-3 py-1 rounded-md text-sm`}
                disabled={!hasBothTeams || !canShowScores}
                title={
                  !hasBothTeams 
                    ? "Les équipes ne sont pas encore déterminées" 
                    : !canShowScores 
                      ? "Les matchs précédents ne sont pas terminés"
                      : ""
                }
              >
                Modifier
              </button>
            )}
          </>
        )}
      </td>
    </tr>
  );
};

export default MatchScoreRow; 