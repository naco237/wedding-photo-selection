export interface Photo {
  id: string;
  url: string;
  thumbnail: string;
  selected: boolean;
  category: 'album' | 'classique';
  title?: string;
}

export interface Client {
  id: string;
  couple: string;
  accessCode: string;
  driveLink: string;
  expiryDate: string;
  maxPhotos: {
    album: number;
    classique: number;
  };
}

export interface AdminSettings {
  defaultMaxPhotosAlbum: number;
  defaultMaxPhotosClassique: number;
  accessCodeLength: number;
  accessCodeExpiration: number;
}

export interface AuthState {
  isClientAuthenticated: boolean;
  isAdminAuthenticated: boolean;
  accessCode: string | null;
  adminToken: string | null;
  expiryDate: Date | null;
}