# Use Pointer Events API for drag and drop

The puzzle requires drag-and-drop across mouse, trackpad, and touch (tablet/mobile). The HTML5 Drag and Drop API does not fire on touch devices, which means it cannot satisfy the touch requirement without a second input path. `react-dnd` supports both surfaces but requires two separate backends and a third-party dependency that wraps the entire interaction model.

We use the Pointer Events API (`pointerdown`, `pointermove`, `pointerup`) directly. A single unified event path covers all input types, and we retain full control over the "snap back on wrong Placement" behavior without fighting a library's opinion on drop resolution.

## Considered options

- **HTML5 DnD API** — rejected: no touch support
- **react-dnd (HTML5 + Touch backends)** — rejected: heavy dependency, dual backend config, limited control over rejection animation
- **Pointer Events (chosen)** — unified mouse/touch path, no dependency, full control
