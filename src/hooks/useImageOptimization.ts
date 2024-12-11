import { useState, useCallback } from 'react';
import { config } from '../config/config';

interface OptimizationOptions {
  maxWidth?: number;
  quality?: number;
  format?: 'jpeg' | 'webp';
}

export const useImageOptimization = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const optimizeImage = useCallback(async (
    file: File,
    options: OptimizationOptions = {}
  ): Promise<File> => {
    setIsProcessing(true);

    try {
      // Vérifier le format
      if (!config.SUPPORTED_FORMATS.includes(file.type)) {
        throw new Error('Format de fichier non supporté');
      }

      // Vérifier la taille
      if (file.size > config.IMAGE_UPLOAD_MAX_SIZE) {
        throw new Error('Image trop volumineuse');
      }

      // Créer un canvas pour le redimensionnement
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });

      // Calculer les dimensions
      let width = img.width;
      let height = img.height;

      if (options.maxWidth && width > options.maxWidth) {
        height = (height * options.maxWidth) / width;
        width = options.maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);

      // Convertir en blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (blob) => resolve(blob as Blob),
          options.format === 'webp' ? 'image/webp' : 'image/jpeg',
          options.quality || 0.8
        );
      });

      return new File([blob], file.name, {
        type: blob.type,
      });
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return { optimizeImage, isProcessing };
};
