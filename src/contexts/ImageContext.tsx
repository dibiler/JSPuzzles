import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';
import type { StoredImage } from '../types';
import { loadAllImages, saveImage, deleteImage } from '../services/storageService';
import { resizeImageToBlob } from '../services/imageService';

interface ImageState {
  images: StoredImage[];
  loading: boolean;
  error: string | null;
}

type ImageAction =
  | { type: 'LOADED'; images: StoredImage[] }
  | { type: 'ADDED'; image: StoredImage }
  | { type: 'DELETED'; id: string }
  | { type: 'ERROR'; message: string }
  | { type: 'CLEAR_ERROR' };

function reducer(state: ImageState, action: ImageAction): ImageState {
  switch (action.type) {
    case 'LOADED':
      return { ...state, images: action.images, loading: false, error: null };
    case 'ADDED':
      return { ...state, images: [...state.images, action.image], error: null };
    case 'DELETED':
      return { ...state, images: state.images.filter((img) => img.id !== action.id), error: null };
    case 'ERROR':
      return { ...state, error: action.message };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
  }
}

interface ImageContextValue {
  images: StoredImage[];
  loading: boolean;
  error: string | null;
  uploadImage: (file: File) => Promise<void>;
  removeImage: (id: string) => Promise<void>;
  clearError: () => void;
}

const ImageContext = createContext<ImageContextValue | null>(null);

export function ImageProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { images: [], loading: true, error: null });

  useEffect(() => {
    loadAllImages().then((images) => dispatch({ type: 'LOADED', images }));
  }, []);

  async function uploadImage(file: File) {
    try {
      const { blob, width, height } = await resizeImageToBlob(file);
      const image: StoredImage = {
        id: crypto.randomUUID(),
        name: file.name.replace(/\.[^.]+$/, ''),
        blob,
        width,
        height,
        createdAt: Date.now(),
      };
      await saveImage(image);
      dispatch({ type: 'ADDED', image });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload image. Please try again.';
      dispatch({ type: 'ERROR', message });
      throw err;
    }
  }

  async function removeImage(id: string) {
    try {
      await deleteImage(id);
      dispatch({ type: 'DELETED', id });
    } catch (err) {
      const message = 'Failed to delete image. Please try again.';
      dispatch({ type: 'ERROR', message });
      throw err;
    }
  }

  function clearError() {
    dispatch({ type: 'CLEAR_ERROR' });
  }

  return (
    <ImageContext.Provider value={{ ...state, uploadImage, removeImage, clearError }}>
      {children}
    </ImageContext.Provider>
  );
}

export function useImages() {
  const ctx = useContext(ImageContext);
  if (!ctx) throw new Error('useImages must be used within ImageProvider');
  return ctx;
}
