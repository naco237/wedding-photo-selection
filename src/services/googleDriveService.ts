import { Photo } from '../types';

class GoogleDriveService {
  private static instance: GoogleDriveService;
  private demoPhotos: Photo[] = [
    ...Array.from({ length: 20 }, (_, i) => ({
      id: `album-${i + 1}`,
      url: `https://source.unsplash.com/800x600/?wedding&sig=${i}`,
      thumbnail: `https://source.unsplash.com/400x300/?wedding&sig=${i}`,
      selected: false,
      category: 'album' as const,
      title: `Photo de mariage ${i + 1}`
    })),
    ...Array.from({ length: 20 }, (_, i) => ({
      id: `classique-${i + 1}`,
      url: `https://source.unsplash.com/800x600/?wedding,portrait&sig=${i + 20}`,
      thumbnail: `https://source.unsplash.com/400x300/?wedding,portrait&sig=${i + 20}`,
      selected: false,
      category: 'classique' as const,
      title: `Photo classique ${i + 1}`
    }))
  ];

  private constructor() {}

  public static getInstance(): GoogleDriveService {
    if (!GoogleDriveService.instance) {
      GoogleDriveService.instance = new GoogleDriveService();
    }
    return GoogleDriveService.instance;
  }

  async getPhotos(category: 'album' | 'classique'): Promise<Photo[]> {
    // Simuler un délai de chargement
    await new Promise(resolve => setTimeout(resolve, 1000));
    return this.demoPhotos.filter(photo => photo.category === category);
  }

  async saveSelection(selectedPhotos: Photo[]): Promise<void> {
    // Simuler un délai de sauvegarde
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Photos sélectionnées sauvegardées:', selectedPhotos);
  }
}

export const googleDriveService = GoogleDriveService.getInstance();