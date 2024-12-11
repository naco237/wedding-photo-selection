interface Config {
  API_BASE_URL: string;
  IMAGE_UPLOAD_MAX_SIZE: number;
  SUPPORTED_FORMATS: string[];
  CACHE_DURATION: number;
  VERSION: string;
}

const developmentConfig: Config = {
  API_BASE_URL: '/wp-json/wedding-photo-selection/v1',
  IMAGE_UPLOAD_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
  CACHE_DURATION: 3600, // 1 hour in seconds
  VERSION: '1.0.0',
};

const productionConfig: Config = {
  API_BASE_URL: 'https://tri-photos.happywd.com/wp-json/wedding-photo-selection/v1',
  IMAGE_UPLOAD_MAX_SIZE: 10 * 1024 * 1024,
  SUPPORTED_FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
  CACHE_DURATION: 86400, // 24 hours in seconds
  VERSION: '1.0.0',
};

export const config = process.env.NODE_ENV === 'production' ? productionConfig : developmentConfig;
