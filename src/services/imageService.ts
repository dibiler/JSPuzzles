const MAX_SIDE = 1920;
const MAX_SIZE_BYTES = 500 * 1024;
const QUALITY_INITIAL = 0.85;
const QUALITY_FLOOR = 0.5;
const QUALITY_STEP = 0.05;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' };
  }
  if (file.size > MAX_SIZE_BYTES * 2) {
    return { valid: false, error: 'File is too large. Please upload an image smaller than 1 MB.' };
  }
  return { valid: true };
}

export async function resizeImageToBlob(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const validation = validateImageFile(file);
  if (!validation.valid) throw new Error(validation.error);
  
  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = scaleDimensions(bitmap.width, bitmap.height);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    let quality = QUALITY_INITIAL;
    let blob = await canvasToBlob(canvas, quality);

    while (blob.size > MAX_SIZE_BYTES && quality > QUALITY_FLOOR) {
      quality = Math.max(quality - QUALITY_STEP, QUALITY_FLOOR);
      blob = await canvasToBlob(canvas, quality);
    }

    return { blob, width, height };
  } catch (err) {
    if (err instanceof Error && err.message.includes('Invalid')) throw err;
    throw new Error('Failed to process image. Please try a different file.');
  }
}

function scaleDimensions(w: number, h: number): { width: number; height: number } {
  const longest = Math.max(w, h);
  if (longest <= MAX_SIDE) return { width: w, height: h };
  const ratio = MAX_SIDE / longest;
  return { width: Math.round(w * ratio), height: Math.round(h * ratio) };
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to encode image'));
      },
      'image/jpeg',
      quality,
    );
  });
}

export function createObjectURL(blob: Blob): string {
  return URL.createObjectURL(blob);
}

export function revokeObjectURL(url: string): void {
  URL.revokeObjectURL(url);
}
