import React, { useState } from 'react';
import { X, Trash2, Save, Eye } from 'lucide-react';
import { Photo } from '../types';
import { usePhotoStore } from '../store/photoStore';

interface SelectionModalProps {
  photos: Photo[];
  onClose: () => void;
}

export const SelectionModal: React.FC<SelectionModalProps> = ({ photos, onClose }) => {
  const [activeTab, setActiveTab] = useState<'album' | 'classique'>('album');
  const { toggleSelection, saveSelections } = usePhotoStore();
  const [saving, setSaving] = useState(false);

  const albumPhotos = photos.filter(p => p.category === 'album');
  const classiquePhotos = photos.filter(p => p.category === 'classique');

  const handleRemovePhoto = (photoId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir retirer cette photo de votre sélection ?')) {
      toggleSelection(photoId);
    }
  };

  const handleSaveSelections = async () => {
    try {
      setSaving(true);
      await saveSelections();
      alert('Sélections sauvegardées avec succès !');
    } catch (error) {
      alert('Erreur lors de la sauvegarde des sélections');
    } finally {
      setSaving(false);
    }
  };

  const currentPhotos = activeTab === 'album' ? albumPhotos : classiquePhotos;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Vos Sélections
            </h3>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('album')}
                className={`px-4 py-2 rounded-lg transition ${
                  activeTab === 'album'
                    ? 'bg-white shadow text-purple-600'
                    : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                Album ({albumPhotos.length})
              </button>
              <button
                onClick={() => setActiveTab('classique')}
                className={`px-4 py-2 rounded-lg transition ${
                  activeTab === 'classique'
                    ? 'bg-white shadow text-purple-600'
                    : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                Classiques ({classiquePhotos.length})
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleSaveSelections}
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>Sauvegarder</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {currentPhotos.map((photo) => (
              <div
                key={photo.id}
                className="group relative aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-lg transition"
              >
                <img
                  src={photo.url}
                  alt={`Photo ${photo.id}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => handleRemovePhoto(photo.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                    title="Retirer de la sélection"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                  <p className="text-white text-sm truncate">
                    {photo.title || `Photo ${photo.id}`}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {currentPhotos.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Aucune photo sélectionnée dans cette catégorie
            </div>
          )}
        </div>
      </div>
    </div>
  );
};