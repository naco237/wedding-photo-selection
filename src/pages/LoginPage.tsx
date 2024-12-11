import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const LoginPage: React.FC = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const loginClient = useAuthStore((state) => state.loginClient);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) {
      setError('Le code doit contenir au moins 6 caractères');
      return;
    }

    try {
      await loginClient(code);
      navigate('/gallery');
    } catch (error) {
      setError('Code d\'accès invalide');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-purple-100 p-3 rounded-full mb-4">
            <KeyRound className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-800">Accès Galerie de Mariage</h1>
          <p className="text-gray-600 text-center mt-2">
            Entrez votre code d'accès unique pour voir vos photos de mariage
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Entrez votre code d'accès"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition duration-200 font-medium"
          >
            Accéder à la Galerie
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Codes de démonstration :</p>
          <p className="font-mono mt-1">MARIAGE2024, AMOUR2024, WEDDING24</p>
        </div>
      </div>
    </div>
  );
};