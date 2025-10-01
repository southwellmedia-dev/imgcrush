# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ImgCrush is a privacy-first, client-side image compression and optimization tool built with React 19, TypeScript, and Vite. All image processing happens entirely in the browser using the HTML5 Canvas API—no server uploads, complete privacy.

## Development Commands

```bash
# Development
npm run dev          # Start Vite dev server at http://localhost:5173
npm run build        # Production build to /dist
npm run preview      # Preview production build
npm run lint         # Run ESLint checks
npm run test:unit    # Run unit tests with Vitest
```

## Architecture

### Core Processing Pipeline (Strategy Pattern)

The image processing system uses a modular pipeline with swappable processors:

```
File Input → ProcessingPipeline → ResizeProcessor → FormatProcessor → QualityProcessor → Blob Output
```

- **ProcessingPipeline** (`src/processing/ProcessingPipeline.ts`): Main orchestrator that runs processors sequentially
- **Processors** (`src/processing/processors/`): Each implements the `Processor` interface with `isEnabled()` and `process()` methods
- **Entry point**: `processImage()` function in `src/utils/imageProcessor.ts` uses singleton pipeline instance

### State Management

All application state is managed in `App.tsx` using React hooks:
- `files: File[]` - Original uploaded files
- `processedImages: ProcessedImage[]` - Images with processing state and results
- `processingSettings: ProcessingSettings` - Global compression settings
- `selectedPreset: string` - Current compression preset ID

**State Flow**: App.tsx → Components (via props) → Callbacks update App.tsx state

**Per-image settings**: Each `ProcessedImage` can have its own `settings` object that overrides global settings.

### Component Organization

- **`src/components/ui/`**: Presentational components (Header, Sidebar, ResultsAreaHeader)
- **`src/components/features/`**: Business logic components (ImageUpload, ImageProcessor, ImageCard)
- **`src/components/comparison/`**: Specialized comparison tools (ImageComparison)
- **`src/components/modals/`**: Modal dialogs (GlobalSettingsModal, BulkRenameModal, etc.)

### Key Processing Concepts

**ProcessedImage Lifecycle States**:
1. Created: `processed: false, processing: false, processedBlob: null`
2. Processing: `processing: true`
3. Complete: `processed: true, processing: false, processedBlob: Blob`

**Resize Modes**:
- `percentage`: Scale by percentage (capped at 100%, no enlarging)
- `max-dimensions`: Constrain to max width/height, preserves aspect ratio
- `exact`: Force exact dimensions (may distort)

**Special Values**:
- `maxWidth/maxHeight = 99999`: No resize
- `percentage = 100`: No resize
- `quality = 1.0`: Maximum quality

## Compression Presets

Presets are defined in `src/presets/compressionPresets.ts`:

| ID | Quality | Resize | Use Case |
|----|---------|--------|----------|
| `compression-only` | 80% | None | Preserve dimensions |
| `web-optimized` | 85% | 1920px | Websites (Most Popular) |
| `high-quality` | 92% | 2500px | Professional photos |
| `email-friendly` | 75% | 1200px | Email attachments |
| `social-instagram` | 85% | 1080×1080 | Instagram posts |
| `social-twitter` | 85% | 1200×675 | Twitter/X |
| `maximum-compression` | 60% | 1024px | Smallest files |
| `lossless` | 100% | None | PNG, no quality loss |
| `custom` | 80% | 100% | Full manual control |

**Adding a preset**: Add to `COMPRESSION_PRESETS` array with id, name, description, icon, settings, and optional badge/recommended fields.

## Tech Stack & Dependencies

- **React 19.1** with TypeScript 5.5
- **Vite 5.4** for builds and HMR
- **Tailwind CSS v4** (CSS-first configuration in `src/index.css`)
- **Mantine UI v8** for components and theming
- **Drag & Drop**: @dnd-kit for reordering images
- **Image Processing**: HTML5 Canvas API (native)
- **HEIC Conversion**: heic2any for iOS photos
- **ZIP Creation**: JSZip for batch downloads
- **Icons**: Lucide React

## Important Implementation Details

### HEIC Support
- Auto-detects HEIC/HEIF files via extension or MIME type
- Converts to JPEG with 95% quality before processing
- Error handling with 30-second timeout for large files
- Location: `src/utils/heicConverter.ts`

### EXIF Metadata
- Canvas processing automatically strips EXIF data (privacy feature)
- `stripExif()` function in `src/utils/exifHandler.ts` re-encodes to remove metadata
- `hasExifData()` detects EXIF in JPEG, PNG, WebP formats
- Preservation is planned (currently placeholder)

### Settings Persistence
- Uses localStorage for: selectedPreset, processingSettings, viewMode
- Functions in `src/utils/settingsStorage.ts`
- Loaded on mount, saved on change via useEffect

### File Naming & ZIP Download
- Custom filenames supported (without extension)
- Sanitizes filenames (removes path separators, invalid chars)
- Prevents silent overwrites with unique filename generation
- Correct extension based on output format (not original)
- Location: `App.tsx` handleDownloadAll function

### Image Reordering
- Drag-to-reorder using @dnd-kit/sortable
- Grip handle in ImageCard/ImageTableView
- Updates processedImages array order
- Affects download ZIP order

## UI/UX Patterns

### Responsive Layout
- Grid: 1 col (mobile) → 2 (tablet) → 3 (laptop) → 4 (desktop)
- Sidebar collapses on narrow screens
- Drop zone spans remaining grid columns

### Theme & Styling
- Primary color: Red (#e11d48)
- Hybrid: Mantine components + Tailwind utilities
- Dark mode ready (uses CSS variables)
- Icons: 16px (small), 18px (medium), 20px (large)

### View Modes
- **Grid**: Card layout with thumbnails
- **Table**: Compact table view with inline rename

### Keyboard Shortcuts
- `Ctrl/Cmd + V`: Paste images from clipboard
- `Ctrl/Cmd + S`: Download single image (or prompt for ZIP)
- `Space`: Toggle comparison (in comparison modal)

## Common Development Patterns

### Adding a Processor
1. Create `src/processing/processors/MyProcessor.ts` implementing `Processor` interface
2. Register in `ProcessingPipeline` constructor
3. Implement `isEnabled(settings)` and `process(context)` methods

### Adding an Output Format
1. Add to type union in `src/types/index.ts`: `format: 'jpeg' | 'png' | 'webp' | 'avif' | 'myformat'`
2. Update format selector in `GlobalSettingsModal.tsx`
3. Ensure MIME type mapping in pipeline handles it

### Triggering Reprocessing
Set images to unprocessed state:
```typescript
setProcessedImages(prev =>
  prev.map(img => ({
    ...img,
    processed: false,
    processing: false,
    processedBlob: null,
    processedSize: 0
  }))
);
```
ImageProcessor's useEffect will auto-process.

### Performance Optimizations
- Images processed in parallel (forEach async)
- JSZip lazy-loaded (dynamic import)
- Lucide icons tree-shakeable
- Canvas reuse in pipeline (single canvas per image)

## Testing

- Unit tests: Vitest (run with `npm run test:unit`)
- No E2E tests currently
- Test files should be `.test.ts` or `.test.tsx`

## Migration Notes

From package.json:
- React 19 migration in progress (notes in `react-migration` field)
- Run react-codemod for ReactDOM.render updates
- Search for deprecated patterns: React.createFactory, defaultProps on functions

## Recent Architecture Changes

- Upgraded to React 19.1 and Tailwind CSS v4 (CSS-first config)
- Removed product tour feature
- Extracted inline styles and fixed stale dependency arrays for performance
- Premium UI design system implemented for modals
- Added bulk rename with pattern support and preview
- Implemented table view with inline filename editing
