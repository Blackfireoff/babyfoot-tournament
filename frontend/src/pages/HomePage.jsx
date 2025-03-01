import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div>
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Bienvenue sur BabyFoot Tournament</h2>
        <p className="text-gray-700 mb-4">
          La plateforme idéale pour organiser et participer à des tournois de babyfoot.
          Créez votre équipe, rejoignez des tournois et suivez vos performances !
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Créer un tournoi</h3>
            <p className="text-gray-600 mb-4">Organisez votre propre tournoi de babyfoot</p>
            <Link to="/create-tournament" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition inline-block">
              Commencer
            </Link>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Rejoindre une équipe</h3>
            <p className="text-gray-600 mb-4">Trouvez des partenaires et formez votre équipe</p>
            <Link to="/teams" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition inline-block">
              Explorer
            </Link>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Classement</h3>
            <p className="text-gray-600 mb-4">Consultez le classement des meilleurs joueurs</p>
            <Link to="/leaderboard" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition inline-block">
              Voir le classement
            </Link>
          </div>
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Tournois à venir</h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">Nom du tournoi</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Organisateur</th>
                <th className="py-3 px-4 text-left">Places</th>
                <th className="py-3 px-4 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-3 px-4">Tournoi de printemps</td>
                <td className="py-3 px-4">15/04/2024</td>
                <td className="py-3 px-4">Club BabyFoot</td>
                <td className="py-3 px-4">8 équipes / 16 joueurs</td>
                <td className="py-3 px-4">
                  <Link to="/tournaments/1" className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition inline-block">
                    S'inscrire
                  </Link>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4">Championnat d'été</td>
                <td className="py-3 px-4">10/06/2024</td>
                <td className="py-3 px-4">Association FootBall</td>
                <td className="py-3 px-4">12 équipes / 24 joueurs</td>
                <td className="py-3 px-4">
                  <Link to="/tournaments/2" className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition inline-block">
                    S'inscrire
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 