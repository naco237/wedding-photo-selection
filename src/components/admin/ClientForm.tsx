import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { Client } from '../../types';
import { clientService } from '../../services/clientService';

export const ClientForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    couple: '',
    accessCode: '',
    driveLink: '',
    expiryDate: '',
    maxPhotos: {
      album: 1000,
      classique: 200
    }
  });

  useEffect(() => {
    if (id) {
      loadClient();
    }
  }, [id]);

  const loadClient = async () => {
    try {
      setLoading(true);
      const response = await clientService.getClients();
      const client = response.find(c => c.id === id);
      if (client) {
        setFormData({
          couple: client.couple,
          accessCode: client.accessCode,
          driveLink: client.driveLink,
          expiryDate: client.expiryDate,
          maxPhotos: client.maxPhotos
        });
      }
    } catch (err) {
      setError('Erreur lors du chargement du client');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (id) {
        await clientService.updateClient(id, formData);
      } else {
        await clientService.createClient(formData);
      }
      navigate('/admin/dashboard/clients');
    } catch (err) {
      setError('Erreur lors de la sauvegarde du client');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        {id ? 'Modifier le Client' : 'Nouveau Client'}
      </h2>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom du Couple
          </label>
          <input
            type="text"
            value={formData.couple}
            onChange={(e) => setFormData({ ...formData, couple: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Code d'accès
          </label>
          <input
            type="text"
            value={formData.accessCode}
            onChange={(e) => setFormData({ ...formData, accessCode: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lien Google Drive
          </label>
          <input
            type="url"
            value={formData.driveLink}
            onChange={(e) => setFormData({ ...formData, driveLink: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date d'expiration
          </label>
          <input
            type="date"
            value={formData.expiryDate}
            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Limite Photos Album
            </label>
            <input
              type="number"
              value={formData.maxPhotos.album}
              onChange={(e) => setFormData({
                ...formData,
                maxPhotos: { ...formData.maxPhotos, album: parseInt(e.target.value) }
              })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Limite Photos Classiques
            </label>
            <input
              type="number"
              value={formData.maxPhotos.classique}
              onChange={(e) => setFormData({
                ...formData,
                maxPhotos: { ...formData.maxPhotos, classique: parseInt(e.target.value) }
              })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard/clients')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {id ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  );
};