# Use CSS background clipping for puzzle piece rendering

Each Piece needs to display a rectangular crop of the original image. The spec proposed pre-generating cropped data URIs via Canvas for each piece at puzzle start.

We instead render each Piece using the full Stored Image as `background-image`, with `background-size` and `background-position` computed from the piece's `(row, col)` and the current Grid dimensions. This works identically for any grid size chosen at runtime:

```
background-size:     imageWidth * gridCols  ×  imageHeight * gridRows
background-position: -(col × imageWidth)  ×  -(row × imageHeight)
```

No Canvas work, no pre-generated crops, no extra storage. Grid size changes require no re-processing.

The `imageData` field on `PuzzlePiece` (pre-cropped data URI) is removed from the data model.
