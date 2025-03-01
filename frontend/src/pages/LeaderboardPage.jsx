import React, { useState } from 'react';

const LeaderboardPage = () => {
  const [activeTab, setActiveTab] = useState('players');
  
  // Données fictives pour les joueurs
  const players = [
    { id: 1, name: 'Thomas Dupont', wins: 42, losses: 12, winRate: '77.8%', points: 126 },
    { id: 2, name: 'Sophie Martin', wins: 38, losses: 15, winRate: '71.7%', points: 114 },
    { id: 3, name: 'Lucas Bernard', wins: 35, losses: 18, winRate: '66.0%', points: 105 },
    { id: 4, name: 'Emma Petit', wins: 33, losses: 19, winRate: '63.5%', points: 99 },
    { id: 5, name: 'Nicolas Dubois', wins: 30, losses: 20, winRate: '60.0%', points: 90 },
    { id: 6, name: 'Julie Leroy', wins: 28, losses: 22, winRate: '56.0%', points: 84 },
    { id: 7, name: 'Maxime Moreau', wins: 25, losses: 25, winRate: '50.0%', points: 75 },
    { id: 8, name: 'Camille Roux', wins: 22, losses: 28, winRate: '44.0%', points: 66 },
    { id: 9, name: 'Antoine Fournier', wins: 20, losses: 30, winRate: '40.0%', points: 60 },
    { id: 10, name: 'Léa Girard', wins: 18, losses: 32, winRate: '36.0%', points: 54 },
  ];
  
  // Données fictives pour les équipes
  const teams = [
    { id: 1, name: 'Les Invincibles', members: 'Thomas D. & Sophie M.', wins: 28, losses: 7, winRate: '80.0%', points: 84 },
    { id: 2, name: 'Duo Dynamique', members: 'Lucas B. & Emma P.', wins: 25, losses: 10, winRate: '71.4%', points: 75 },
    { id: 3, name: 'Les Furies', members: 'Nicolas D. & Julie L.', wins: 22, losses: 13, winRate: '62.9%', points: 66 },
    { id: 4, name: 'Team Rocket', members: 'Maxime M. & Camille R.', wins: 20, losses: 15, winRate: '57.1%', points: 60 },
    { id: 5, name: 'Les Challengers', members: 'Antoine F. & Léa G.', wins: 18, losses: 17, winRate: '51.4%', points: 54 },
    { id: 6, name: 'Babyfoot Masters', members: 'Paul V. & Marie C.', wins: 15, losses: 20, winRate: '42.9%', points: 45 },
    { id: 7, name: 'Les Stratèges', members: 'Hugo L. & Sarah B.', wins: 12, losses: 23, winRate: '34.3%', points: 36 },
    { id: 8, name: 'Duo de Choc', members: 'Julien M. & Laura D.', wins: 10, losses: 25, winRate: '28.6%', points: 30 },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Classement</h1>
      
      {/* Onglets */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'players'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('players')}
        >
          Joueurs
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'teams'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('teams')}
        >
          Équipes
        </button>
      </div>
      
      {/* Tableau des joueurs */}
      {activeTab === 'players' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">Rang</th>
                <th className="py-3 px-4 text-left">Joueur</th>
                <th className="py-3 px-4 text-center">Victoires</th>
                <th className="py-3 px-4 text-center">Défaites</th>
                <th className="py-3 px-4 text-center">Ratio</th>
                <th className="py-3 px-4 text-center">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {players.map((player, index) => (
                <tr key={player.id} className={index < 3 ? 'bg-blue-50' : ''}>
                  <td className="py-3 px-4 font-medium">
                    {index === 0 && <span className="text-yellow-500">🥇</span>}
                    {index === 1 && <span className="text-gray-400">🥈</span>}
                    {index === 2 && <span className="text-amber-600">🥉</span>}
                    {index > 2 && `${index + 1}`}
                  </td>
                  <td className="py-3 px-4 font-medium">{player.name}</td>
                  <td className="py-3 px-4 text-center">{player.wins}</td>
                  <td className="py-3 px-4 text-center">{player.losses}</td>
                  <td className="py-3 px-4 text-center">{player.winRate}</td>
                  <td className="py-3 px-4 text-center font-medium">{player.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Tableau des équipes */}
      {activeTab === 'teams' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">Rang</th>
                <th className="py-3 px-4 text-left">Équipe</th>
                <th className="py-3 px-4 text-left">Membres</th>
                <th className="py-3 px-4 text-center">Victoires</th>
                <th className="py-3 px-4 text-center">Défaites</th>
                <th className="py-3 px-4 text-center">Ratio</th>
                <th className="py-3 px-4 text-center">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {teams.map((team, index) => (
                <tr key={team.id} className={index < 3 ? 'bg-blue-50' : ''}>
                  <td className="py-3 px-4 font-medium">
                    {index === 0 && <span className="text-yellow-500">🥇</span>}
                    {index === 1 && <span className="text-gray-400">🥈</span>}
                    {index === 2 && <span className="text-amber-600">🥉</span>}
                    {index > 2 && `${index + 1}`}
                  </td>
                  <td className="py-3 px-4 font-medium">{team.name}</td>
                  <td className="py-3 px-4">{team.members}</td>
                  <td className="py-3 px-4 text-center">{team.wins}</td>
                  <td className="py-3 px-4 text-center">{team.losses}</td>
                  <td className="py-3 px-4 text-center">{team.winRate}</td>
                  <td className="py-3 px-4 text-center font-medium">{team.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage; 