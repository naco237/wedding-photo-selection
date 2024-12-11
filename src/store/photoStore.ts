import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Photo } from '../types';
import { googleDriveService } from '../services/googleDriveService';

interface PhotoState {
  photos: Photo[];
  currentCategory: 'album' | 'classique';
  selectedCountAlbum: number;
  selectedCountClassique: number;
  maxSelectionAlbum: number;
  maxSelectionClassique: number;
  setPhotos: (photos: Photo[]) => void;
  toggleSelection: (photoId: string) => void;
  setCategory: (category: 'album' | 'classique') => void;
  saveSelections: () => Promise<void>;
  loadSavedSelections: () => Promise<void>;
}

export const usePhotoStore = create<PhotoState>()(
  persist(
    (set, get) => ({
      photos: [],
      currentCategory: 'album',
      selectedCountAlbum: 0,
      selectedCountClassique: 0,
      maxSelectionAlbum: 1000,
      maxSelectionClassique: 200,

      setPhotos: (photos) => set({ photos }),

      toggleSelection: (photoId) => {
        const { photos, selectedCountAlbum, selectedCountClassique, maxSelectionAlbum, maxSelectionClassique } = get();
        const updatedPhotos = photos.map(photo => {
          if (photo.id === photoId) {
            const isCurrentCategory = photo.category === get().currentCategory;
            const currentCount = photo.category === 'album' ? selectedCountAlbum : selectedCountClassique;
            const maxCount = photo.category === 'album' ? maxSelectionAlbum : maxSelectionClassique;

            if (!photo.selected && currentCount >= maxCount) {
              return photo;
            }

            if (isCurrentCategory) {
              return { ...photo, selected: !photo.selected };
            }
          }
          return photo;
        });

        const newSelectedCountAlbum = updatedPhotos.filter(p => p.category === 'album' && p.selected).length;
        const newSelectedCountClassique = updatedPhotos.filter(p => p.category === 'classique' && p.selected).length;

        set({
          photos: updatedPhotos,
          selectedCountAlbum: newSelectedCountAlbum,
          selectedCountClassique: newSelectedCountClassique
        });
      },

      setCategory: (category) => set({ currentCategory: category }),

      saveSelections: async () => {
        const { photos } = get();
        const selectedPhotos = photos.filter(p => p.selected);
        await googleDriveService.saveSelection(selectedPhotos);
      },

      loadSavedSelections: async () => {
        const { photos } = get();
        // Ici, vous pouvez implémenter la logique pour charger les sélections sauvegardées
        // Pour l'instant, nous utilisons les photos déjà chargées
        const newSelectedCountAlbum = photos.filter(p => p.category === 'album' && p.selected).length;
        const newSelectedCountClassique = photos.filter(p => p.category === 'classique' && p.selected).length;

        set({
          selectedCountAlbum: newSelectedCountAlbum,
          selectedCountClassique: newSelectedCountClassique
        });
      }
    }),
    {
      name: 'photo-selections',
      partialize: (state) => ({
        photos: state.photos.map(photo => ({
          id: photo.id,
          selected: photo.selected,
          category: photo.category
        }))
      })
    }
  )
);