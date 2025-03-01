import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateTournamentPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    location: '',
    maxTeams: 8,
    description: '',
    rules: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ici, nous enverrions les données à l'API
    console.log('Données du tournoi:', formData);
    
    // Rediriger vers la page du tournoi (à implémenter)
    alert('Tournoi créé avec succès !');
    navigate('/tournaments');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Créer un nouveau tournoi</h1>
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
            Nom du tournoi *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Tournoi de printemps"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="date" className="block text-gray-700 font-medium mb-2">
              Date du tournoi *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="location" className="block text-gray-700 font-medium mb-2">
              Lieu *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Salle des fêtes"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="maxTeams" className="block text-gray-700 font-medium mb-2">
            Nombre maximum d'équipes *
          </label>
          <select
            id="maxTeams"
            name="maxTeams"
            value={formData.maxTeams}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="4">4 équipes (8 joueurs)</option>
            <option value="8">8 équipes (16 joueurs)</option>
            <option value="16">16 équipes (32 joueurs)</option>
            <option value="32">32 équipes (64 joueurs)</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
            Description du tournoi
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Décrivez votre tournoi..."
          ></textarea>
        </div>
        
        <div className="mb-6">
          <label htmlFor="rules" className="block text-gray-700 font-medium mb-2">
            Règles spécifiques
          </label>
          <textarea
            id="rules"
            name="rules"
            value={formData.rules}
            onChange={handleChange}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Règles spécifiques à votre tournoi..."
          ></textarea>
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Créer le tournoi
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTournamentPage; 