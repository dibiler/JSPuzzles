import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';
import type { StoredImage } from '../types';
import { loadAllImages, saveImage, deleteImage } from '../services/storageService';
import { resizeImageToBlob } from '../services/imageService';

interface ImageState {
  images: StoredImage[];
  loading: boolean;
}

type ImageAction =
  | { type: 'LOADED'; images: StoredImage[] }
  | { type: 'ADDED'; image: StoredImage }
  | { type: 'DELETED'; id: string };

function reducer(state: ImageState, action: ImageAction): ImageState {
  switch (action.type) {
    case 'LOADED':
      return { ...state, images: action.images, loading: false };
    case 'ADDED':
      return { ...state, images: [...state.images, action.image] };
    case 'DELETED':
      return { ...state, images: state.images.filter((img) => img.id !== action.id) };
  }
}

interface ImageContextValue {
  images: StoredImage[];
  loading: boolean;
  uploadImage: (file: File) => Promise<void>;
  removeImage: (id: string) => Promise<void>;
}

const ImageContext = createContext<ImageContextValue | null>(null);

export function ImageProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { images: [], loading: true });

  useEffect(() => {
    loadAllImages().then((images) => dispatch({ type: 'LOADED', images }));
  }, []);

  async function uploadImage(file: File) {
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
  }

  async function removeImage(id: string) {
    await deleteImage(id);
    dispatch({ type: 'DELETED', id });
  }

  return (
    <ImageContext.Provider value={{ ...state, uploadImage, removeImage }}>
      {children}
    </ImageContext.Provider>
  );
}

export function useImages() {
  const ctx = useContext(ImageContext);
  if (!ctx) throw new Error('useImages must be used within ImageProvider');
  return ctx;
}
