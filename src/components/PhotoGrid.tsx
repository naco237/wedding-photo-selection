import React, { Suspense, lazy, useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { Loader, Check, Save, Eye } from 'lucide-react';
import { Header } from './Header';
import { CategorySelector } from './CategorySelector';
import { usePhotoStore } from '../store/photoStore';
import { SelectionModal } from './SelectionModal';
import { Photo } from '../types';
import { googleDriveService } from '../services/googleDriveService';

const LazyImage = lazy(() => import('./LazyImage'));

export const PhotoGrid: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { 
    photos, 
    setPhotos,
    currentCategory,
    toggleSelection,
    selectedCountAlbum,
    selectedCountClassique,
    maxSelectionAlbum,
    maxSelectionClassique,
    saveSelections,
    loadSavedSelections
  } = usePhotoStore();

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  useEffect(() => {
    loadPhotos();
  }, [currentCategory]);

  useEffect(() => {
    loadSavedSelections();
  }, []);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const loadedPhotos = await googleDriveService.getPhotos(currentCategory);
      setPhotos(loadedPhotos);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des photos');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSelections = async () => {
    try {
      setSaving(true);
      await saveSelections();
      alert('Sélections sauvegardées avec succès !');
    } catch (err) {
      setError('Erreur lors de la sauvegarde des sélections');
      console.error('Erreur:', err);
    } finally {
      setSaving(false);
    }
  };

  const currentCount = currentCategory === 'album' ? selectedCountAlbum : selectedCountClassique;
  const maxCount = currentCategory === 'album' ? maxSelectionAlbum : maxSelectionClassique;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <CategorySelector />
        
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10 p-4 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Sélection {currentCategory === 'album' ? 'Album' : 'Classiques'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Photos sélectionnées: {currentCount}/{maxCount}
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                <Eye className="w-4 h-4" />
                <span>Voir la sélection</span>
              </button>
              <button
                onClick={handleSaveSelections}
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
              >
                {saving ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Sauvegarder la sélection</span>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="w-8 h-8 text-purple-600 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.filter(photo => photo.category === currentCategory).map((photo) => (
              <div
                key={photo.id}
                ref={ref}
                className="relative group aspect-square overflow-hidden rounded-lg"
              >
                <Suspense 
                  fallback={
                    <div className="aspect-square bg-gray-100 animate-pulse flex items-center justify-center">
                      <Loader className="w-8 h-8 text-gray-300 animate-spin" />
                    </div>
                  }
                >
                  {inView && <LazyImage src={photo.url} alt={`Photo ${photo.id}`} />}
                </Suspense>
                <button
                  onClick={() => toggleSelection(photo.id)}
                  disabled={!photo.selected && currentCount >= maxCount}
                  className={`absolute inset-0 flex items-center justify-center bg-black/40 transition ${
                    photo.selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  } ${!photo.selected && currentCount >= maxCount ? 'cursor-not-allowed' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition ${
                      photo.selected
                        ? 'bg-purple-600 border-purple-600'
                        : 'border-white'
                    }`}
                  >
                    {photo.selected && <Check className="w-5 h-5 text-white" />}
                  </div>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <SelectionModal
          onClose={() => setShowModal(false)}
          photos={photos.filter(p => p.selected)}
        />
      )}
    </div>
  );
};