# Use IndexedDB with client-side image resizing

`localStorage` has a ~5MB per-origin cap and stores strings only. Images stored as Base64 add ~33% size overhead, meaning a single phone photo can exhaust the entire budget. Object URLs don't survive page reload.

We use IndexedDB to store images as binary `Blob` values. Before storing, uploaded images are resized client-side using a Canvas so the resulting JPEG Blob is under 500 KB. This keeps the library usable across many images while preserving acceptable visual quality for puzzle play.

Resize parameters: longest side capped at 1920px (proportional scale), encoded as JPEG at quality 0.85. If the resulting Blob still exceeds 500 KB, quality is lowered in a loop down to a floor of 0.5.

The resize and encode logic lives in `imageService.ts`; all IndexedDB access is encapsulated in `storageService.ts`.

## Considered options

- **localStorage (Base64)** — rejected: ~5MB cap, 33% size overhead, unsuitable for real photos
- **Object URLs (File input)** — rejected: ephemeral, lost on page reload
- **IndexedDB + Blob + resize (chosen)** — persistent, binary-native, no meaningful size ceiling for this use case
