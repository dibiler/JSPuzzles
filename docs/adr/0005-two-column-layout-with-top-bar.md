# Use 2-column layout with top bar instead of 3 columns

The original spec defined a 3-column layout: Menu | Blueprint | Tray. The Menu column (back button, progress bar, reset) doesn't carry enough content to justify a full column — it creates visual noise and reduces space for the Blueprint.

We use a top bar + 2-column layout:

```
┌─────────────────────────────────────────────────┐
│  ← Back   [image name]  12/25 ████░░░  Reset    │
├────────────────────────────┬────────────────────┤
│                            │                    │
│         Blueprint          │     Piece Tray     │
│                            │                    │
└────────────────────────────┴────────────────────┘
```

- **Top bar**: back button, puzzle name, progress bar, reset button
- **Left column**: Blueprint (gets more real estate for large grids)
- **Right column**: Piece Tray

On mobile, the top bar persists; Blueprint and Tray become the two tabs.

This layout pairs better with a minimalist aesthetic and keeps focus on the two interactive surfaces.
