# JSPuzzles - Puzzle Game Application

## Project Overview
A web-based puzzle game where users can create custom puzzles from images stored locally in their browser or uploaded images. Players can customize the difficulty by selecting the number of puzzle pieces (grid rows and columns) and drag-and-drop pieces into their correct positions.

## Technology Stack
- **Frontend Framework**: React
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Storage**: Browser Local Storage (for storing puzzle images)
- **Package Manager**: npm

## Application Architecture

### UI Layout (3-Column Design)
```
┌─────────────────────────────────────────────────────┐
│                                                       │
│  ┌──────────┬──────────────────┬──────────────────┐ │
│  │          │                  │                  │ │
│  │  Column  │     Column 2     │     Column 3     │ │
│  │    1     │   (Blueprint)    │    (Pieces)      │ │
│  │  (Menu)  │                  │                  │ │
│  │          │                  │                  │ │
│  └──────────┴──────────────────┴──────────────────┘ │
│                                                       │
└─────────────────────────────────────────────────────┘
```

### Column Descriptions

**Column 1 - Menu**
- Current game state display
- Back button (when in game state)
- Game controls and settings
- Progress indicator (optional)
- New Game button to start puzzle selection

**Column 2 - Puzzle Blueprint**
- Transparent overlay of the selected image
- Grid lines showing individual puzzle piece boundaries
- Visual feedback for valid drop zones
- Highlight when a piece is hovering over correct position
- Shows completed pieces (opaque) vs empty areas (transparent with grid)

**Column 3 - Puzzle Pieces**
- Scrollable list of puzzle pieces
- Each piece displays a preview of its image
- Pieces are draggable
- Piece count display
- Visual indication of placed vs unplaced pieces

## Game States

### State 1: Puzzle Selection
**Purpose**: Allow user to select or create a new puzzle

**Features**:
- Display list of previously uploaded images (loaded from Browser Local Storage)
- Button to upload a new image
- File input acceptance: Image files (JPG, PNG, GIF, WebP)
- Image preview thumbnail (small size)
- Piece count selector:
  - Dropdown or slider to select grid size (rows × columns)
  - Range: 2x2 (4 pieces) to 10x10 (100 pieces)
  - Display total piece count (rows × columns)
  - Common presets: 2x2, 3x3, 4x4, 5x5, 6x6
- Confirm button to proceed to game state
- Delete button for each stored image

**Interactions**:
- Click image to select it
- Click upload button to add new image
- Set desired piece count
- Click "Start Puzzle" to begin game

### State 2: Puzzle Game
**Purpose**: Allow user to complete the puzzle by dragging pieces

**Features**:
- Display complete image (transparent) in column 2 with grid overlay
- Grid lines clearly show each piece boundary
- All puzzle pieces listed in column 3
- Drag-and-drop functionality
- Piece validation (only correct pieces can be placed in correct spots)
- Visual feedback:
  - Highlight valid drop zone when dragging piece over it
  - Show success/completion state when piece is placed correctly
  - Disable or gray out placed pieces
- Completion detection:
  - Track placed pieces count
  - Display completion percentage
  - Show completion message/animation when all pieces placed
- Reset button to start puzzle over
- Back to selection button

**Interactions**:
- Drag piece from column 3 to correct position in column 2
- System validates if piece placement is correct (specific grid cell)
- Piece stays in place if correct, returns to column 3 if incorrect
- Scroll through pieces if they exceed column 3 height

## Data Models & Storage

### Image Data Structure
```typescript
interface StoredImage {
  id: string;              // Unique identifier
  name: string;            // Original filename
  imageData: string;       // Base64 encoded image
  width: number;           // Original width
  height: number;          // Original height
  uploadedAt: number;      // Timestamp
}
```

### Puzzle Session Data
```typescript
interface PuzzleSession {
  imageId: string;         // Reference to image
  gridRows: number;        // Number of rows
  gridCols: number;        // Number of columns
  pieces: PuzzlePiece[];
  placedPieces: Set<string>;  // IDs of correctly placed pieces
}

interface PuzzlePiece {
  id: string;             // Unique piece identifier
  row: number;            // Expected row position (0-indexed)
  col: number;            // Expected column position (0-indexed)
  imageData: string;      // Cropped image Data URI
  correctPosition: {row: number, col: number};
}
```

## Component Structure

### Root Component
- `App.tsx` - Main application wrapper, state management

### Page/Screen Components
- `PuzzleSelector.tsx` - Handles puzzle selection state
- `PuzzleGame.tsx` - Main puzzle game state

### Sub-Components
- `ImageUploader.tsx` - File upload functionality
- `ImageGallery.tsx` - Display stored images
- `GridSizeSelector.tsx` - Piece count selection
- `PuzzleBoard.tsx` - Blueprint display with grid overlay
- `PiecesList.tsx` - Scrollable list of pieces
- `PuzzlePiece.tsx` - Individual draggable piece component
- `GameMenu.tsx` - Menu/control panel

### Standalone Components
- `DropZone.tsx` - Drop target validation indicator
- `ProgressIndicator.tsx` - Completion progress display

## Key Features

### Drag and Drop
- Use HTML5 Drag and Drop API or React-compatible library (e.g., react-dnd, react-beautiful-dnd)
- Support both mouse and touch events for full device compatibility
- Dragging pieces from column 3 to column 2
- Visual feedback during drag (cursor changes, drop zone highlights)
- Touch-specific feedback (visual indicators for touch interactions)
- Piece snaps to grid if correct position, returns if wrong
- Multi-device support: mouse, trackpad, touch gestures on tablets/mobile

### Image Processing
- File upload validation (image type and size)
- Convert image to Base64 for browser storage
- Generate puzzle pieces by cropping image based on grid
- Handle image aspect ratio and resizing to fit available space

### Local Storage
- Store images as Base64 in Browser Local Storage
- Store puzzle metadata (image list, piece counts)
- Handle storage quota limits gracefully
- Delete images when user removes them

### Validation & Error Handling
- Image file format validation
- Storage capacity monitoring
- Piece placement validation (only correct pieces in correct spots)
- User feedback for errors and invalid actions

## Technical Requirements

### Prerequisites
- Modern browser with:
  - HTML5 Drag and Drop API support
  - Touch Events API support (for touch device compatibility)
  - Pointer Events API support (for unified mouse/touch handling)
  - LocalStorage API support (5-10MB minimum)
  - Canvas API or Image manipulation (for piece generation)
  - ES2020+ support

### Build & Development
- Vite configuration for hot module replacement (HMR)
- TypeScript strict mode enabled
- Tailwind CSS configured with React components
- Development server on localhost (default 5173)

### Performance Considerations
- Lazy load images
- Optimize image storage (compress Base64 data)
- Efficient piece rendering (virtual scrolling if needed for large piece counts)
- Debounce drag events

### Accessibility
- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- Color contrast compliance

## Data Flow

### Puzzle Selection Flow
1. User opens application → Puzzle Selection state
2. View stored images from Local Storage
3. Select image and piece count
4. Click "Start Puzzle" → Generate puzzle pieces → Game state

### Puzzle Game Flow
1. Display image blueprint with grid
2. Display all pieces in scrollable list
3. User drags piece from list to board
4. System validates if position is correct:
   - ✓ Correct: Piece stays, update progress
   - ✗ Wrong: Piece returns to list
5. Repeat until all pieces placed
6. Show completion message
7. Options: Play again, Back to selection

## File Structure
```
JSPuzzle/
├── src/
│   ├── components/
│   │   ├── PuzzleSelector.tsx
│   │   ├── PuzzleGame.tsx
│   │   ├── ImageUploader.tsx
│   │   ├── ImageGallery.tsx
│   │   ├── GridSizeSelector.tsx
│   │   ├── PuzzleBoard.tsx
│   │   ├── PiecesList.tsx
│   │   ├── PuzzlePiece.tsx
│   │   ├── GameMenu.tsx
│   │   ├── DropZone.tsx
│   │   └── ProgressIndicator.tsx
│   ├── context/
│   │   ├── PuzzleContext.ts      (State management)
│   │   └── ImageContext.ts       (Image storage management)
│   ├── services/
│   │   ├── imageService.ts      (Image processing)
│   │   ├── storageService.ts    (LocalStorage operations)
│   │   └── puzzleService.ts     (Puzzle logic)
│   ├── types/
│   │   └── index.ts             (TypeScript interfaces)
│   ├── styles/
│   │   └── globals.css          (Tailwind imports)
│   ├── App.tsx
│   └── main.tsx
├── public/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── package.json
├── AGENTS.md
└── README.md
```

## Development Phases

### Phase 1: Foundation
- Set up Vite + React + TypeScript + Tailwind
- Create basic component structure
- Implement state management (Context API or Zustand)

### Phase 2: Puzzle Selection
- Image upload functionality
- Local Storage integration
- Image gallery display
- Piece count selector

### Phase 3: Puzzle Generation
- Image processing service
- Puzzle piece extraction logic
- Grid line rendering

### Phase 4: Game State
- Drag and drop implementation
- Drop validation logic
- Progress tracking
- Game completion detection

### Phase 5: Polish & Testing
- Error handling
- UI/UX refinement
- Performance optimization
- Testing and bug fixes

## Success Criteria

- ✓ Users can upload images successfully
- ✓ Uploaded images persist in browser storage
- ✓ Users can select piece count (2x2 through 10x10)
- ✓ Puzzle board displays with accurate grid lines
- ✓ Pieces can be dragged and dropped
- ✓ Only correct pieces can be placed in correct positions
- ✓ Game completes and shows completion message
- ✓ UI is responsive in 3-column layout
- ✓ All text is styled with Tailwind CSS
- ✓ Application works without external API calls

## Notes
- All data is stored locally in browser (no backend required)
- Images are stored as Base64 to keep everything client-side
- Perfect for offline gameplay after initial load
- No external assets or CDN dependencies required
