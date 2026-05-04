// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the imageService module's Canvas dependency at the system boundary.
// We own imageService; we mock only the browser APIs it calls (Canvas, createImageBitmap).
vi.stubGlobal('createImageBitmap', vi.fn());

// Helper: build a fake canvas that returns a Blob of a given size
function makeCanvas(blobSize: number) {
  return {
    width: 0,
    height: 0,
    getContext: () => ({ drawImage: vi.fn() }),
    toBlob: (_cb: (b: Blob | null) => void, _type: string, _quality: number) => {
      // Return a blob of the requested size
      _cb(new Blob([new Uint8Array(blobSize)]));
    },
  };
}

// We re-import after stubbing globals
const { resizeImageToBlob } = await import('../services/imageService');

describe('resizeImageToBlob', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Spy on document.createElement to inject our fake canvas
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'canvas') return makeCanvas(100 * 1024) as unknown as HTMLCanvasElement;
      return document.createElement(tag);
    });

    // Stub createImageBitmap to return a bitmap with known dimensions
    vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue({
      width: 800,
      height: 600,
      close: vi.fn(),
    }));
  });

  it('returns a Blob', async () => {
    const file = new File([new Uint8Array(10)], 'test.jpg', { type: 'image/jpeg' });
    const { blob } = await resizeImageToBlob(file);
    expect(blob).toBeInstanceOf(Blob);
  });

  it('returns a Blob under 500 KB when canvas cooperates', async () => {
    const file = new File([new Uint8Array(10)], 'test.jpg', { type: 'image/jpeg' });
    const { blob } = await resizeImageToBlob(file);
    expect(blob.size).toBeLessThanOrEqual(500 * 1024);
  });

  it('scales down images wider than 1920px', async () => {
    vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue({
      width: 4000,
      height: 3000,
      close: vi.fn(),
    }));

    let capturedWidth = 0;
    let capturedHeight = 0;
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'canvas') {
        const canvas = makeCanvas(100 * 1024) as unknown as HTMLCanvasElement;
        Object.defineProperty(canvas, 'width', {
          set(v) { capturedWidth = v; },
          get() { return capturedWidth; },
        });
        Object.defineProperty(canvas, 'height', {
          set(v) { capturedHeight = v; },
          get() { return capturedHeight; },
        });
        return canvas;
      }
      return document.createElement(tag);
    });

    const file = new File([new Uint8Array(10)], 'big.jpg', { type: 'image/jpeg' });
    await resizeImageToBlob(file);
    expect(capturedWidth).toBeLessThanOrEqual(1920);;
    expect(capturedHeight).toBeLessThanOrEqual(1920);
  });
});
