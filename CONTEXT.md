# JSPuzzles

A browser-based puzzle game where players upload images, slice them into a grid, and drag pieces into their correct positions.

## Language

**Puzzle**:
A single playable instance: one image, one grid size, one set of pieces.
_Avoid_: Game, session

**Piece**:
A rectangular crop of the original image occupying one cell in the grid. Has a known correct position.
_Avoid_: Tile, fragment, card

**Blueprint**:
The full image displayed at ~25% opacity on the board, with grid lines showing where each Piece belongs.
_Avoid_: Board, canvas, background

**Grid**:
The rows × columns division applied to the image to produce Pieces.

**Placement**:
The act of dropping a Piece onto its correct cell in the Blueprint. Incorrect drops are rejected.
_Avoid_: Drop, snap

**Piece Tray**:
The scrollable column listing all unplaced Pieces available to drag.
_Avoid_: Piece list, sidebar

**Stored Image**:
An uploaded image persisted in IndexedDB as a Blob, resized client-side to stay under 500 KB before storage.
_Avoid_: Asset, file, photo

## Relationships

- A **Puzzle** has exactly one **Blueprint** and one **Grid**
- A **Grid** produces `rows × columns` **Pieces**
- A **Piece** has exactly one correct cell in the **Blueprint**
- A **Placement** is only valid when the Piece matches the target cell

## Layout

The game uses a **top bar + 2-column layout** on desktop:

- **Top Bar**: back button, puzzle name, progress indicator (piece count + bar), reset button.
- **Left column**: Blueprint.
- **Right column**: Piece Tray.

On mobile, the top bar persists; Blueprint and Tray become tabs.

The Puzzle Selection screen uses a single centered column.

## Design System

- **Style**: minimalist — ample whitespace, no decorative chrome.
- **Corners**: rounded (e.g. `rounded-xl` in Tailwind) on cards, pieces, buttons.
- **Typography**: clean sans-serif (e.g. Inter). No decorative fonts.
- **Colors**: neutral palette with one accent color. Clear contrast ratios (WCAG AA minimum).
- **Theme**: supports light and dark mode with a toggle. Dark mode uses dark-neutral backgrounds, not pure black.

## Example dialogue

> **Dev:** "When the user drops a Piece on the wrong cell, do we animate it back?"
> **Domain expert:** "Yes — a rejected Placement returns the Piece to the Tray."
