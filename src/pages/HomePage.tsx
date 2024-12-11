import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Shield, Camera } from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Camera className="w-12 h-12 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Sélection Photos de Mariage
          </h1>
          <p className="text-gray-600">
            Choisissez votre type d'accès pour continuer
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 px-4">
          <Link
            to="/client"
            className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-purple-100 p-4 rounded-full mb-6 group-hover:bg-purple-200 transition-colors">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Accès Mariés
              </h2>
              <p className="text-gray-600">
                Connectez-vous avec votre code d'accès unique pour sélectionner vos photos de mariage
              </p>
            </div>
          </Link>

          <Link
            to="/admin"
            className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-purple-100 p-4 rounded-full mb-6 group-hover:bg-purple-200 transition-colors">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Accès Marvel
              </h2>
              <p className="text-gray-600">
                Espace administrateur pour gérer les clients et les paramètres de l'application
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};