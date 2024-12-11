import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Camera } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { logoutClient, accessCode } = useAuthStore();

  const handleLogout = () => {
    logoutClient();
    navigate('/client');
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Camera className="w-6 h-6 text-purple-600" />
            <h1 className="text-xl font-semibold text-gray-800">
              Sélection Photos de Mariage
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Code: {accessCode}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-gray-600 hover:text-purple-600"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};