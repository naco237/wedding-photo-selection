import React from 'react';
import { Camera, Image } from 'lucide-react';
import { usePhotoStore } from '../store/photoStore';

export const CategorySelector: React.FC = () => {
  const { currentCategory, setCategory, selectedCountAlbum, selectedCountClassique, maxSelectionAlbum, maxSelectionClassique } = usePhotoStore();

  return (
    <div className="flex space-x-4 mb-6">
      <button
        onClick={() => setCategory('album')}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
          currentCategory === 'album'
            ? 'bg-purple-600 text-white'
            : 'bg-white text-gray-700 hover:bg-purple-50'
        }`}
      >
        <Camera className="w-5 h-5" />
        <span>Album ({selectedCountAlbum}/{maxSelectionAlbum})</span>
      </button>
      
      <button
        onClick={() => setCategory('classique')}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
          currentCategory === 'classique'
            ? 'bg-purple-600 text-white'
            : 'bg-white text-gray-700 hover:bg-purple-50'
        }`}
      >
        <Image className="w-5 h-5" />
        <span>Classiques ({selectedCountClassique}/{maxSelectionClassique})</span>
      </button>
    </div>
  );
};