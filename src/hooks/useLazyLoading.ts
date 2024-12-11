import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';

interface LazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  skip?: boolean;
}

export const useLazyLoading = <T>(
  loadFn: () => Promise<T>,
  options: LazyLoadOptions = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const loadedRef = useRef(false);

  const { ref, inView } = useInView({
    threshold: options.threshold || 0,
    rootMargin: options.rootMargin || '50px',
    triggerOnce: true,
  });

  useEffect(() => {
    if (options.skip || !inView || loadedRef.current) return;

    const loadData = async () => {
      try {
        setIsLoading(true);
        const result = await loadFn();
        setData(result);
        loadedRef.current = true;
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [inView, loadFn, options.skip]);

  return { ref, data, error, isLoading };
};

// Hook personnalisé pour le lazy loading des images
export const useLazyImage = (
  src: string,
  options: LazyLoadOptions = {}
) => {
  const [loaded, setLoaded] = useState(false);
  const { ref, inView } = useInView({
    threshold: options.threshold || 0,
    rootMargin: options.rootMargin || '50px',
    triggerOnce: true,
  });

  useEffect(() => {
    if (!inView || loaded) return;

    const img = new Image();
    img.src = src;
    img.onload = () => {
      setLoaded(true);
    };
  }, [inView, src, loaded]);

  return {
    ref,
    loaded,
    shouldLoad: inView || loaded,
  };
};

// Hook pour le prefetch des images
export const useImagePrefetch = (
  srcs: string[],
  options: { priority?: boolean } = {}
) => {
  useEffect(() => {
    const prefetchImage = (src: string) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.as = 'image';
      link.href = src;
      if (options.priority) {
        link.setAttribute('importance', 'high');
      }
      document.head.appendChild(link);
    };

    srcs.forEach(src => {
      if (options.priority) {
        prefetchImage(src);
      } else {
        // Utiliser requestIdleCallback pour les images non prioritaires
        if ('requestIdleCallback' in window) {
          (window as any).requestIdleCallback(() => prefetchImage(src));
        } else {
          setTimeout(() => prefetchImage(src), 0);
        }
      }
    });
  }, [srcs, options.priority]);
};

// Hook pour la gestion du viewport
export const useViewport = () => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, []);

  return { elementRef, isVisible };
};
