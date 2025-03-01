import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <Link to="/" className="text-3xl font-bold">BabyFoot Tournament</Link>
              <p className="text-blue-100">Organisez et participez à des tournois de babyfoot</p>
            </div>
            <nav className="hidden md:block">
              <ul className="flex space-x-6">
                <li>
                  <Link to="/" className="text-white hover:text-blue-200 transition">Accueil</Link>
                </li>
                <li>
                  <Link to="/tournaments" className="text-white hover:text-blue-200 transition">Tournois</Link>
                </li>
                <li>
                  <Link to="/teams" className="text-white hover:text-blue-200 transition">Équipes</Link>
                </li>
                <li>
                  <Link to="/leaderboard" className="text-white hover:text-blue-200 transition">Classement</Link>
                </li>
              </ul>
            </nav>
            <div className="flex space-x-4">
              <Link to="/login" className="text-white hover:text-blue-200 transition">Connexion</Link>
              <Link to="/register" className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-50 transition">Inscription</Link>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <Outlet />
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
                <li className="mb-1"><Link to="/" className="hover:text-white transition">Accueil</Link></li>
                <li className="mb-1"><Link to="/tournaments" className="hover:text-white transition">Tournois</Link></li>
                <li className="mb-1"><Link to="/teams" className="hover:text-white transition">Équipes</Link></li>
                <li className="mb-1"><Link to="/leaderboard" className="hover:text-white transition">Classement</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-gray-400 text-sm text-center">
            &copy; 2024 BabyFoot Tournament. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 