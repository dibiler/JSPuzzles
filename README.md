# JSPuzzles

A browser-based puzzle game built with **React**, **TypeScript**, **Vite**, and **Tailwind CSS**. Players can upload or reuse images stored in the browser, choose the puzzle difficulty by selecting the number of rows and columns, and complete the puzzle by dragging each piece into its correct position.

## 📖 Project Description

`JSPuzzles` is a client-side image puzzle application with a **3-column interface**:

1. **Menu column** – game controls, navigation, and progress information.
2. **Blueprint column** – a transparent version of the selected image with visible grid lines showing where pieces belong.
3. **Pieces column** – a scrollable list of draggable puzzle pieces.

The app has **two main states**:

- **Puzzle selection**: choose an image from browser storage or upload a new one, then set the puzzle size.
- **Puzzle gameplay**: drag and drop pieces onto the board, where each piece only fits in its correct position.

## 🖼️ Interface Preview

### Puzzle Selection Screen
- Browse previously saved images from browser storage
- Upload a new image from your device
- Choose the grid size to control puzzle difficulty
- Start the puzzle with the selected image and piece count

### Puzzle Gameplay Screen
- **Column 1:** menu, controls, and progress information
- **Column 2:** transparent puzzle blueprint with visible grid lines
- **Column 3:** scrollable list of draggable puzzle pieces
- Pieces can be placed only in their correct position using **mouse** or **touch** controls

## ✨ Planned Features

- Upload image files (`JPG`, `PNG`, `GIF`, `WebP`)
- Save uploaded images in browser local storage
- Select puzzle sizes from small to challenging grids
- Drag-and-drop puzzle gameplay
- Correct-position validation for each piece
- Support for **mouse**, **trackpad**, and **touch** interactions
- Scrollable puzzle piece tray for larger puzzles
- Progress tracking and completion feedback

## 🛠️ Tech Stack

- **React**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **Local Storage API**

## 🚀 Installation

> This project is intended to run locally in the browser with no backend required.

### 1. Clone the repository

```bash
git clone git@github.com-personal:dibiler/JSPuzzles.git
cd JSPuzzles
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Then open the local URL shown by Vite, typically:

```text
http://localhost:5173
```

### 4. Build for production

```bash
npm run build
```

### 5. Preview the production build

```bash
npm run preview
```

## ℹ️ Important Information

- The app is designed to work entirely on the **client side**.
- Uploaded images are stored in the browser, so they are **local to the current device/browser**.
- No external API or backend is required.
- The puzzle must support both **mouse** and **touch** controls.
- Larger images and bigger grid sizes may require more browser storage and processing time.
- A modern browser with support for `LocalStorage`, `Canvas`, `Pointer Events`, and drag-and-drop interactions is recommended.

## 📌 Project Status

This repository is currently in the **planning/setup phase**. The requirements and development checklist are documented in `AGENTS.md` before implementation begins.
