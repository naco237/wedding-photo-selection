import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { useAdminSettings } from '../../hooks/useAdminSettings';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings, loading } = useAdminSettings();
  const [formData, setFormData] = useState({
    defaultMaxPhotosAlbum: settings?.defaultMaxPhotosAlbum || 1000,
    defaultMaxPhotosClassique: settings?.defaultMaxPhotosClassique || 200,
    accessCodeLength: settings?.accessCodeLength || 8,
    accessCodeExpiration: settings?.accessCodeExpiration || 90,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(formData);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Paramètres Généraux</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Limite Photos Album par défaut
            </label>
            <input
              type="number"
              value={formData.defaultMaxPhotosAlbum}
              onChange={(e) => setFormData({
                ...formData,
                defaultMaxPhotosAlbum: parseInt(e.target.value)
              })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Limite Photos Classiques par défaut
            </label>
            <input
              type="number"
              value={formData.defaultMaxPhotosClassique}
              onChange={(e) => setFormData({
                ...formData,
                defaultMaxPhotosClassique: parseInt(e.target.value)
              })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Longueur du code d'accès
            </label>
            <input
              type="number"
              value={formData.accessCodeLength}
              onChange={(e) => setFormData({
                ...formData,
                accessCodeLength: parseInt(e.target.value)
              })}
              min="6"
              max="12"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiration du code (jours)
            </label>
            <input
              type="number"
              value={formData.accessCodeExpiration}
              onChange={(e) => setFormData({
                ...formData,
                accessCodeExpiration: parseInt(e.target.value)
              })}
              min="1"
              max="365"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer les paramètres</span>
          </button>
        </div>
      </form>
    </div>
  );
};