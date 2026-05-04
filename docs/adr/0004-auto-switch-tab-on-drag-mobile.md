# Auto-switch to Blueprint tab on drag start (mobile)

On mobile, the game uses a tabbed layout with the Piece Tray and Blueprint on separate tabs. A user cannot drag a Piece from one tab and drop it on another — the drop target is not visible.

When a drag starts (`pointerdown`) on the Tray tab, we immediately switch to the Blueprint tab while keeping the floating piece clone visible and tracking the pointer. This preserves the single drag-and-drop interaction model across both desktop and mobile without introducing a separate "select then tap" flow.

## Considered options

- **Two-step select + tap** — rejected: different interaction model from desktop, breaks consistency
- **Mini Blueprint in Tray tab** — rejected: too small to be usable, duplicates layout complexity
- **Auto-switch on drag start (chosen)** — single interaction model, works naturally with Pointer Events
