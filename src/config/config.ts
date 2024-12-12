interface Config {
  apiUrl: string;
  appName: string;
  maxSelections: number;
  imageTypes: string[];
  maxFileSize: number;
  thumbnailSize: {
    width: number;
    height: number;
  };
  gridConfig: {
    columns: {
      sm: number;
      md: number;
      lg: number;
    };
    spacing: number;
  };
}

const developmentConfig: Config = {
  apiUrl: 'http://localhost:3000/api',
  appName: 'Wedding Photo Selection',
  maxSelections: 50,
  imageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  thumbnailSize: {
    width: 300,
    height: 200
  },
  gridConfig: {
    columns: {
      sm: 2,
      md: 3,
      lg: 4
    },
    spacing: 16
  }
};

const productionConfig: Config = {
  apiUrl: 'https://tri-photos.happywd.com/wp-json/wedding-photo-selection/v1',
  appName: 'Wedding Photo Selection',
  maxSelections: 50,
  imageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  thumbnailSize: {
    width: 300,
    height: 200
  },
  gridConfig: {
    columns: {
      sm: 2,
      md: 3,
      lg: 4
    },
    spacing: 16
  }
};

export const config = process.env.NODE_ENV === 'production' ? productionConfig : developmentConfig;
