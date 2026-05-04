import { useEffect, useRef, useState } from 'react';
import { useImages } from '../../contexts/ImageContext';
import type { StoredImage, Grid } from '../../types';
import { createObjectURL, revokeObjectURL } from '../../services/imageService';

const GRID_PRESETS: Grid[] = [
  { rows: 2, cols: 3 },
  { rows: 3, cols: 4 },
  { rows: 4, cols: 5 },
  { rows: 5, cols: 6 },
  { rows: 6, cols: 8 },
];

interface Props {
  onStart: (image: StoredImage, grid: Grid) => void;
  dark: boolean;
  onToggleTheme: () => void;
}

export function PuzzleSelector({ onStart, dark, onToggleTheme }: Props) {
  const { images, loading, uploadImage, removeImage } = useImages();
  const [selectedImage, setSelectedImage] = useState<StoredImage | null>(null);
  const [selectedGrid, setSelectedGrid] = useState<Grid>(GRID_PRESETS[1]);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadImage(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-brand-cream dark:bg-brand-purple text-brand-purple dark:text-brand-cream flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-3xl flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">JSPuzzles</h1>
        <button
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          className="w-8 h-8 flex items-center justify-center rounded-full text-brand-purple/50 hover:text-brand-purple dark:text-brand-cream/50 dark:hover:text-brand-cream transition-colors"
        >
          {dark ? '☀️' : '🌙'}
        </button>
      </div>

      {/* Upload */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="mb-8 px-5 py-2.5 rounded-full bg-brand-orange hover:bg-brand-orange/90 text-white font-medium transition-colors"
      >
        Upload image
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Image library */}
      {loading ? (
        <p className="text-brand-purple/40 dark:text-brand-cream/40 text-sm">Loading…</p>
      ) : images.length === 0 ? (
        <p className="text-brand-purple/40 dark:text-brand-cream/40 text-sm">No images yet. Upload one to start.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full max-w-3xl mb-8">
          {images.map((img) => (
            <ImageCard
              key={img.id}
              image={img}
              selected={selectedImage?.id === img.id}
              onSelect={() => setSelectedImage(img)}
              onDelete={() => setPendingDeleteId(img.id)}
            />
          ))}
        </div>
      )}

      {/* Grid size picker */}
      {selectedImage && (
        <>
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            {GRID_PRESETS.map((g) => (
              <button
                key={`${g.rows}x${g.cols}`}
                onClick={() => setSelectedGrid(g)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  selectedGrid.rows === g.rows && selectedGrid.cols === g.cols
                    ? 'bg-brand-orange text-white border-brand-orange'
                    : 'border-brand-purple/25 dark:border-brand-cream/25 hover:border-brand-orange dark:hover:border-brand-orange'
                }`}
              >
                {g.rows}×{g.cols}
              </button>
            ))}
          </div>

          <button
            onClick={() => onStart(selectedImage, selectedGrid)}
            className="px-6 py-3 rounded-full bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold transition-colors"
          >
            Start puzzle
          </button>
        </>
      )}

      {/* Delete confirmation modal */}
      {pendingDeleteId && (
        <ConfirmDeleteModal
          onConfirm={() => {
            removeImage(pendingDeleteId);
            if (selectedImage?.id === pendingDeleteId) setSelectedImage(null);
            setPendingDeleteId(null);
          }}
          onCancel={() => setPendingDeleteId(null)}
        />
      )}
    </div>
  );
}

function ConfirmDeleteModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-40">
      <div className="bg-brand-cream dark:bg-brand-purple rounded-3xl p-6 flex flex-col items-center gap-4 shadow-2xl">
        <p className="text-lg font-semibold text-brand-purple dark:text-brand-cream">Delete image?</p>
        <p className="text-sm text-brand-purple/70 dark:text-brand-cream/70 text-center">This will permanently remove the image and any associated puzzles.</p>
        <div className="flex gap-3 mt-2">
          <button
            onClick={onCancel}
            className="px-5 py-2 rounded-full border border-brand-purple/25 dark:border-brand-cream/25 hover:border-brand-purple dark:hover:border-brand-cream font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 rounded-full bg-brand-orange hover:bg-brand-orange/90 text-white font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function ImageCard({
  image,
  selected,
  onSelect,
  onDelete,
}: {
  image: StoredImage;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const objectUrl = createObjectURL(image.blob);
    setUrl(objectUrl);
    return () => revokeObjectURL(objectUrl);
  }, [image.blob]);

  return (
    <div
      onClick={onSelect}
      className={`relative rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${
        selected ? 'border-brand-orange' : 'border-transparent hover:border-brand-purple/30 dark:hover:border-brand-cream/30'
      }`}
    >
      {url && (
        <img src={url} alt={image.name} className="w-full aspect-square object-cover" />
      )}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/40 hover:bg-black/70 text-white text-xs flex items-center justify-center"
        aria-label="Delete image"
      >
        ×
      </button>
    </div>
  );
}
