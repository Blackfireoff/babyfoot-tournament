import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'

import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import TeamsPage from './pages/TeamsPage'
import LeaderboardPage from './pages/LeaderboardPage'
import CreateTournamentPage from './pages/CreateTournamentPage'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="teams" element={<TeamsPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="create-tournament" element={<CreateTournamentPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
