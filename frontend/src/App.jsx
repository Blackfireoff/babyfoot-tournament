import { useState } from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">BabyFoot Tournament</h1>
          <p className="text-blue-100">Organisez et participez à des tournois de babyfoot</p>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
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
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                Commencer
              </button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Rejoindre une équipe</h3>
              <p className="text-gray-600 mb-4">Trouvez des partenaires et formez votre équipe</p>
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
                Explorer
              </button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Classement</h3>
              <p className="text-gray-600 mb-4">Consultez le classement des meilleurs joueurs</p>
              <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition">
                Voir le classement
              </button>
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
                    <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition">
                      S'inscrire
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Championnat d'été</td>
                  <td className="py-3 px-4">10/06/2024</td>
                  <td className="py-3 px-4">Association FootBall</td>
                  <td className="py-3 px-4">12 équipes / 24 joueurs</td>
                  <td className="py-3 px-4">
                    <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition">
                      S'inscrire
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
      
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold mb-2">BabyFoot Tournament</h3>
              <p className="text-gray-400">La référence pour les tournois de babyfoot</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Liens rapides</h4>
              <ul className="text-gray-400">
                <li className="mb-1"><a href="#" className="hover:text-white transition">Accueil</a></li>
                <li className="mb-1"><a href="#" className="hover:text-white transition">Tournois</a></li>
                <li className="mb-1"><a href="#" className="hover:text-white transition">Équipes</a></li>
                <li className="mb-1"><a href="#" className="hover:text-white transition">Classement</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-gray-400 text-sm text-center">
            &copy; 2024 BabyFoot Tournament. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
