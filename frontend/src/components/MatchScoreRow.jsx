import React, { useState } from 'react';

const MatchScoreRow = ({ match, team1, team2, onUpdateScore }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [team1Score, setTeam1Score] = useState(match.team1_score !== null ? match.team1_score.toString() : '');
  const [team2Score, setTeam2Score] = useState(match.team2_score !== null ? match.team2_score.toString() : '');

  const handleSaveScore = () => {
    onUpdateScore(match.id, parseInt(team1Score) || 0, parseInt(team2Score) || 0);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setTeam1Score(match.team1_score !== null ? match.team1_score.toString() : '');
    setTeam2Score(match.team2_score !== null ? match.team2_score.toString() : '');
    setIsEditing(false);
  };

  return (
    <tr>
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
          <span className="text-sm text-gray-900">{match.team1_score !== null ? match.team1_score : '-'}</span>
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
          <span className="text-sm text-gray-900">{match.team2_score !== null ? match.team2_score : '-'}</span>
        )}
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
            className="text-blue-600 hover:text-blue-900 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md text-sm"
          >
            Modifier
          </button>
        )}
      </td>
    </tr>
  );
};

export default MatchScoreRow; 