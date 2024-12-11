import React, { useState, useEffect } from 'react';
import { Download, Eye, Loader, X } from 'lucide-react';
import { Client, Photo } from '../../types';
import { clientService } from '../../services/clientService';

interface ClientSelectionsProps {
  client: Client;
  onClose: () => void;
}

export const ClientSelections: React.FC<ClientSelectionsProps> = ({ client, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [selections, setSelections] = useState<{
    album: Photo[];
    classique: Photo[];
  }>({ album: [], classique: [] });

  useEffect(() => {
    loadSelections();
  }, [client.id]);

  const loadSelections = async () => {
    try {
      setLoading(true);
      const data = await clientService.getClientSelections(client.id);
      setSelections(data);
    } catch (error) {
      console.error('Erreur lors du chargement des sélections:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadSelections = async (type: 'album' | 'classique') => {
    const photos = type === 'album' ? selections.album : selections.classique;
    const content = photos.map(photo => photo.url).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `selection-${type}-${client.couple.replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const copyToClipboard = async (type: 'album' | 'classique') => {
    const photos = type === 'album' ? selections.album : selections.classique;
    const content = photos.map(photo => photo.url).join('\n');
    await navigator.clipboard.writeText(content);
    alert(`Liste des photos ${type} copiée dans le presse-papiers`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">
            Sélections de {client.couple}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {loading ? (
          <div className="p-6 flex justify-center">
            <Loader className="w-8 h-8 text-purple-600 animate-spin" />
          </div>
        ) : (
          <div className="p-6 space-y-8 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Sélection Album */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium text-gray-800">
                  Sélection Album ({selections.album.length} photos)
                </h4>
                <div className="flex space-x-2">
                  <button
                    onClick={() => copyToClipboard('album')}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Copier les liens
                  </button>
                  <button
                    onClick={() => downloadSelections('album')}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                  >
                    <Download className="w-4 h-4" />
                    <span>Télécharger</span>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {selections.album.map((photo) => (
                  <div key={photo.id} className="aspect-square rounded-lg overflow-hidden">
                    <img
                      src={photo.thumbnail}
                      alt={`Photo ${photo.id}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Sélection Classique */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium text-gray-800">
                  Sélection Classique ({selections.classique.length} photos)
                </h4>
                <div className="flex space-x-2">
                  <button
                    onClick={() => copyToClipboard('classique')}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Copier les liens
                  </button>
                  <button
                    onClick={() => downloadSelections('classique')}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                  >
                    <Download className="w-4 h-4" />
                    <span>Télécharger</span>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {selections.classique.map((photo) => (
                  <div key={photo.id} className="aspect-square rounded-lg overflow-hidden">
                    <img
                      src={photo.thumbnail}
                      alt={`Photo ${photo.id}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};