import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useState } from 'react';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Teams from './pages/Teams';
import Tournaments from './pages/Tournaments';
import TournamentDetails from './pages/TournamentDetails';
import Scoreboard from './pages/Scoreboard';
import Profile from './pages/Profile';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-xl font-bold text-gray-800">
                  BabyFoot Tournaments
                </Link>
              </div>
              {isAuthenticated && (
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    to="/teams"
                    className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300"
                  >
                    Équipes
                  </Link>
                  <Link
                    to="/tournaments"
                    className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300"
                  >
                    Tournois
                  </Link>
                  <Link
                    to="/scoreboard"
                    className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300"
                  >
                    Classement
                  </Link>
                  <Link
                    to="/profile"
                    className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300"
                  >
                    Profil
                  </Link>
                </div>
              )}
            </div>
            <div className="flex items-center">
              {isAuthenticated ? (
                <button
                  onClick={() => setIsAuthenticated(false)}
                  className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  Déconnexion
                </button>
              ) : (
                <div className="space-x-4">
                  <Link
                    to="/login"
                    className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    Inscription
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/teams"
            element={isAuthenticated ? <Teams /> : <Navigate to="/login" />}
          />
          <Route
            path="/tournaments"
            element={isAuthenticated ? <Tournaments /> : <Navigate to="/login" />}
          />
          <Route
            path="/tournaments/:id"
            element={isAuthenticated ? <TournamentDetails /> : <Navigate to="/login" />}
          />
          <Route
            path="/scoreboard"
            element={isAuthenticated ? <Scoreboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile"
            element={isAuthenticated ? <Profile /> : <Navigate to="/login" />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
