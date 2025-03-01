import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const TeamsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Données fictives pour les équipes
  const teams = [
    { 
      id: 1, 
      name: 'Les Invincibles', 
      members: ['Thomas Dupont', 'Sophie Martin'],
      wins: 28, 
      losses: 7, 
      tournaments: 5,
      description: 'Une équipe redoutable qui ne laisse aucune chance à ses adversaires.'
    },
    { 
      id: 2, 
      name: 'Duo Dynamique', 
      members: ['Lucas Bernard', 'Emma Petit'],
      wins: 25, 
      losses: 10, 
      tournaments: 4,
      description: 'Rapides et précis, ils forment un duo parfaitement synchronisé.'
    },
    { 
      id: 3, 
      name: 'Les Furies', 
      members: ['Nicolas Dubois', 'Julie Leroy'],
      wins: 22, 
      losses: 13, 
      tournaments: 5,
      description: 'Une équipe qui joue avec passion et détermination.'
    },
    { 
      id: 4, 
      name: 'Team Rocket', 
      members: ['Maxime Moreau', 'Camille Roux'],
      wins: 20, 
      losses: 15, 
      tournaments: 4,
      description: 'Toujours prêts à décoller vers la victoire !'
    },
    { 
      id: 5, 
      name: 'Les Challengers', 
      members: ['Antoine Fournier', 'Léa Girard'],
      wins: 18, 
      losses: 17, 
      tournaments: 4,
      description: 'Ils relèvent tous les défis avec enthousiasme.'
    },
    { 
      id: 6, 
      name: 'Babyfoot Masters', 
      members: ['Paul Vincent', 'Marie Clément'],
      wins: 15, 
      losses: 20, 
      tournaments: 3,
      description: 'Des joueurs techniques qui maîtrisent les subtilités du jeu.'
    },
  ];
  
  // Filtrer les équipes en fonction du terme de recherche
  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.members.some(member => member.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Équipes</h1>
        <Link 
          to="/create-team" 
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
        >
          Créer une équipe
        </Link>
      </div>
      
      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher une équipe ou un joueur..."
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Liste des équipes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.map(team => (
          <div key={team.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2">{team.name}</h2>
              <div className="mb-4">
                <p className="text-gray-600 mb-1">Membres:</p>
                <ul className="list-disc list-inside">
                  {team.members.map((member, index) => (
                    <li key={index} className="text-gray-800">{member}</li>
                  ))}
                </ul>
              </div>
              <p className="text-gray-700 mb-4">{team.description}</p>
              <div className="flex justify-between text-sm text-gray-600 mb-4">
                <span>Victoires: {team.wins}</span>
                <span>Défaites: {team.losses}</span>
                <span>Tournois: {team.tournaments}</span>
              </div>
              <div className="flex justify-between">
                <Link 
                  to={`/teams/${team.id}`} 
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Voir le profil
                </Link>
                <button className="text-green-600 hover:text-green-800 font-medium">
                  Inviter
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredTeams.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">Aucune équipe trouvée pour "{searchTerm}"</p>
          <p className="text-gray-400 mt-2">Essayez avec un autre terme ou créez une nouvelle équipe</p>
        </div>
      )}
    </div>
  );
};

export default TeamsPage; 