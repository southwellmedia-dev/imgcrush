# ImgCrush Developer Guide

**Version:** 1.0.0
**Last Updated:** 2025-09-30
**For:** Developers, Contributors, and AI Agents

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Architecture & Design Patterns](#architecture--design-patterns)
4. [Project Structure](#project-structure)
5. [Core Concepts](#core-concepts)
6. [Component Guide](#component-guide)
7. [Processing Pipeline](#processing-pipeline)
8. [Compression Presets](#compression-presets)
9. [State Management](#state-management)
10. [Development Workflow](#development-workflow)
11. [Common Tasks](#common-tasks)
12. [Styling Guide](#styling-guide)
13. [Key Files Reference](#key-files-reference)
14. [Debugging & Troubleshooting](#debugging--troubleshooting)
15. [Future Enhancements](#future-enhancements)

---

## Project Overview

### What is ImgCrush?

ImgCrush is a **privacy-first, client-side image compression and optimization tool** built as a React Single Page Application (SPA). The entire image processing pipeline runs in the browser using the HTML5 Canvas API—no server uploads, no data collection, complete privacy.

### Core Mission

- **Privacy:** Zero server uploads, all processing happens locally
- **Performance:** Instant results with no network latency
- **Simplicity:** Intuitive preset-based workflow with advanced customization
- **Quality:** Professional-grade compression with multiple output formats

### Key Features

- **Client-Side Processing:** Uses Canvas API for all image manipulation
- **Compression Presets:** 9 pre-configured presets for common use cases
- **Multiple Formats:** JPEG, PNG, WebP output support
- **Smart Resizing:** Three resize modes (percentage, max-dimensions, exact)
- **Batch Processing:** Handle multiple images simultaneously
- **ZIP Download:** Bundle all processed images into a single archive
- **Interactive Comparison:** Before/after slider with 3 viewing modes
- **Responsive Design:** Works on desktop, tablet, and mobile

---

## Tech Stack

### Frontend Framework

- **React 18.3**: Modern React with Hooks (no class components)
- **TypeScript 5.5**: Type-safe development with strict mode
- **JSX/TSX**: Component syntax

### Build Tool

- **Vite 5.4**: Lightning-fast development server and builds
  - HMR (Hot Module Replacement) for instant updates
  - Optimized production bundles
  - TypeScript support out of the box

### UI Libraries

- **Mantine UI v7** (`@mantine/core`): Primary component library
  - Pre-built accessible components
  - Theming system (customized to red color scheme)
  - Form components, modals, buttons, etc.
- **Tailwind CSS 3.4**: Utility-first CSS framework
  - Used alongside Mantine for layout and spacing
  - Responsive grid system
  - Custom utility classes

### Icons

- **Lucide React 0.344**: Beautiful, consistent icon library
  - Tree-shakeable (only imports what you use)
  - ISC License (open source friendly)
  - Modern design aesthetic

### Image Processing

- **HTML5 Canvas API**: Core image manipulation
  - Drawing and resizing images
  - Format conversion
  - Quality adjustment
- **Canvas.toBlob()**: Convert canvas to downloadable Blob

### Archive Creation

- **JSZip 3.10**: Generate ZIP files in-browser
  - Batch download functionality
  - Pure JavaScript implementation

### Dependencies Summary

```json
{
  "dependencies": {
    "@mantine/core": "^8.3.2",           // UI components
    "@mantine/dropzone": "^8.3.2",       // File upload drag-drop
    "@mantine/hooks": "^8.3.2",          // Utility hooks
    "@mantine/notifications": "^8.3.2",  // Toast notifications
    "jszip": "^3.10.1",                  // ZIP file generation
    "lucide-react": "^0.344.0",          // Icons
    "react": "^18.3.1",                  // UI library
    "react-dom": "^18.3.1"               // DOM rendering
  }
}
```

---

## Architecture & Design Patterns

### Overall Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Browser (Client)                   │
│                                                       │
│  ┌───────────────────────────────────────────────┐  │
│  │              React Application                 │  │
│  │                                                │  │
│  │  ┌──────────────────────────────────────┐    │  │
│  │  │         App.tsx (Root)               │    │  │
│  │  │    • Centralized State               │    │  │
│  │  │    • Files Array                     │    │  │
│  │  │    • ProcessedImages Array           │    │  │
│  │  │    • ProcessingSettings              │    │  │
│  │  └──────────────────────────────────────┘    │  │
│  │                    │                          │  │
│  │          ┌─────────┴─────────┐               │  │
│  │          │                   │               │  │
│  │    ┌─────▼────┐      ┌──────▼──────┐        │  │
│  │    │ImageUpload│      │ImageProcessor│       │  │
│  │    └──────────┘      └─────────────┘        │  │
│  │                              │               │  │
│  │              ┌───────────────┴────────┐     │  │
│  │              │                        │     │  │
│  │        ┌─────▼─────┐         ┌───────▼─────┐│  │
│  │        │Processing │         │   Display   ││  │
│  │        │  Pipeline │         │  Components ││  │
│  │        └───────────┘         └─────────────┘│  │
│  └────────────────────────────────────────────┘  │
│                                                   │
│  ┌───────────────────────────────────────────┐  │
│  │          HTML5 Canvas API                  │  │
│  │      • Image Loading                       │  │
│  │      • Resizing & Drawing                  │  │
│  │      • Format Conversion                   │  │
│  │      • Blob Generation                     │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### Design Patterns

#### 1. **Strategy Pattern** (Processing Pipeline)

The image processing system uses the Strategy pattern to allow different processors to be swapped or added without changing the core pipeline logic.

```typescript
interface Processor {
  name: string;
  process(context: ProcessingContext): Promise<ProcessingContext>;
  isEnabled(settings: ProcessingSettings): boolean;
}
```

Each processor (Resize, Quality, Format) implements this interface and can be enabled/disabled based on settings.

#### 2. **Centralized State Management**

All application state is managed in `App.tsx` using React hooks:
- `useState` for state values
- `useCallback` for memoized functions
- Props drilling for component communication

**Why not Redux/Context?**
- Simple, predictable data flow
- No global state complexity
- Easy to understand and debug
- Performance is not an issue with current scale

#### 3. **Component Composition**

Components are organized by responsibility:
- **UI Components** (`components/ui/`): Presentational, reusable
- **Feature Components** (`components/features/`): Business logic, stateful
- **Comparison Components** (`components/comparison/`): Specialized tools

#### 4. **Unidirectional Data Flow**

```
App.tsx (State)
    ↓ (props)
Components (Read State)
    ↑ (callbacks)
App.tsx (Update State)
```

### Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **Client-side only** | Privacy-first, no infrastructure costs, instant processing |
| **React + TypeScript** | Type safety, modern development, large ecosystem |
| **Vite** | Fastest build tool, excellent DX, native ESM |
| **Mantine + Tailwind** | Mantine for components, Tailwind for layouts |
| **Canvas API** | Native browser support, no dependencies, fast |
| **Props drilling** | Simple enough for current scale, no need for complex state management |
| **Modular processors** | Easy to extend, test, and maintain |

---

## Project Structure

### Complete File Tree

```
imgcrush/
├── public/
│   ├── logo.svg                    # Main logo
│   └── favicon.svg                 # Browser tab icon
│
├── src/
│   ├── components/
│   │   ├── ui/                     # UI Components
│   │   │   ├── Header.tsx          # App header (unused in main flow)
│   │   │   ├── Footer.tsx          # Footer with copyright and GitHub link
│   │   │   └── ResultsHeader.tsx   # Header shown on results page
│   │   │
│   │   ├── features/               # Feature Components
│   │   │   ├── ImageUpload.tsx     # Drag-drop file upload + preset selector
│   │   │   ├── ImageCard.tsx       # Individual image display with stats
│   │   │   ├── ImageProcessor.tsx  # Orchestrates processing for all images
│   │   │   ├── ProcessingControls.tsx # Settings panel with advanced options
│   │   │   ├── DownloadAll.tsx     # Batch download with ZIP generation
│   │   │   └── PresetSelector.tsx  # Preset selection UI
│   │   │
│   │   └── comparison/             # Comparison Tools
│   │       └── ImageComparison.tsx # Before/after comparison modal
│   │
│   ├── processing/                 # Processing Pipeline
│   │   ├── ProcessingPipeline.ts   # Main pipeline orchestrator
│   │   ├── types.ts                # Processing-specific types
│   │   └── processors/             # Individual Processors
│   │       ├── ResizeProcessor.ts  # Handles image resizing
│   │       ├── QualityProcessor.ts # Placeholder for quality adjustments
│   │       └── FormatProcessor.ts  # Format validation
│   │
│   ├── presets/                    # Compression Presets
│   │   └── compressionPresets.ts   # Preset definitions and logic
│   │
│   ├── utils/                      # Utilities
│   │   ├── imageProcessor.ts       # Main processing entry point
│   │   └── fileUtils.ts            # File size formatting, etc.
│   │
│   ├── types/                      # TypeScript Types
│   │   └── index.ts                # Global type definitions
│   │
│   ├── App.tsx                     # Root component
│   ├── main.tsx                    # Application entry point
│   ├── index.css                   # Global styles
│   └── vite-env.d.ts               # Vite type definitions
│
├── docs/                           # Documentation
│   ├── CONTRIBUTING.md             # Contribution guidelines
│   ├── SECURITY.md                 # Security policy
│   └── DEVELOPER_GUIDE.md          # This file (not committed)
│
├── index.html                      # HTML entry point
├── package.json                    # Dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
├── vite.config.ts                  # Vite configuration
├── tailwind.config.js              # Tailwind configuration
├── postcss.config.js               # PostCSS configuration
├── eslint.config.js                # ESLint configuration
├── .gitignore                      # Git ignore rules
├── LICENSE                         # MIT License
└── README.md                       # Project README
```

### Directory Purpose

| Directory | Purpose | Key Files |
|-----------|---------|-----------|
| `src/components/ui/` | Presentational UI components | Header, Footer, ResultsHeader |
| `src/components/features/` | Business logic components | ImageUpload, ImageProcessor, ProcessingControls |
| `src/components/comparison/` | Specialized comparison tools | ImageComparison |
| `src/processing/` | Modular processing pipeline | ProcessingPipeline, Processors |
| `src/presets/` | Compression preset definitions | compressionPresets.ts |
| `src/utils/` | Helper functions | imageProcessor.ts, fileUtils.ts |
| `src/types/` | TypeScript type definitions | index.ts |
| `docs/` | Project documentation | CONTRIBUTING.md, SECURITY.md |

---

## Core Concepts

### 1. ProcessingSettings Interface

The central configuration object for all image processing:

```typescript
interface ProcessingSettings {
  quality: number;              // 0-1 (0.60 = 60%)
  maxWidth: number;             // Max width in pixels
  maxHeight: number;            // Max height in pixels
  format: 'jpeg' | 'png' | 'webp';  // Output format
  resizeMode: 'max-dimensions' | 'exact' | 'percentage';
  percentage: number;           // For percentage resize (0-100)
  exactWidth: number;           // For exact resize
  exactHeight: number;          // For exact resize
  preserveAspectRatio?: boolean;  // Future use
  sharpen?: boolean;            // Future use
  removeMetadata?: boolean;     // Future use (EXIF removal)
}
```

**Special Values:**
- `maxWidth/maxHeight = 99999`: Means "no resize"
- `percentage = 100`: Means "no resize" (keep original size)
- `quality = 1.0`: Maximum quality (lossless for PNG)

### 2. ProcessedImage Lifecycle

```typescript
interface ProcessedImage {
  id: string;                   // Unique identifier
  originalFile: File;           // Original uploaded file
  originalSize: number;         // Original file size in bytes
  processedBlob: Blob | null;   // Processed image blob
  processedSize: number;        // Processed size in bytes
  processing: boolean;          // Currently being processed
  processed: boolean;           // Processing complete
}
```

**Lifecycle States:**
1. **Created**: `processed: false, processing: false, processedBlob: null`
2. **Processing**: `processing: true`
3. **Complete**: `processed: true, processing: false, processedBlob: Blob`

### 3. Resize Modes

| Mode | Behavior | Use Case |
|------|----------|----------|
| **percentage** | Scale by percentage (50% = half size) | Proportional scaling |
| **max-dimensions** | Constrain to max width/height, preserve aspect ratio | Fit within bounds |
| **exact** | Force exact dimensions (may distort) | Specific size requirements |

**Key Logic:**
- Percentage is capped at 100% (no enlarging)
- Max-dimensions preserves aspect ratio
- Exact can distort if aspect ratio doesn't match

### 4. Processing Context

The context object passed through the processing pipeline:

```typescript
interface ProcessingContext {
  canvas: HTMLCanvasElement;        // Canvas element
  ctx: CanvasRenderingContext2D;    // Canvas 2D context
  originalImage: HTMLImageElement;  // Original loaded image
  currentWidth: number;             // Current canvas width
  currentHeight: number;            // Current canvas height
  settings: ProcessingSettings;     // Processing settings
}
```

Each processor receives this context, modifies it, and returns updated context for the next processor.

---

## Component Guide

### App.tsx (Root Component)

**Location:** `src/App.tsx`
**Purpose:** Root component managing all application state

**State:**
```typescript
const [files, setFiles] = useState<File[]>([]);
const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
const [selectedPreset, setSelectedPreset] = useState<string>('compression-only');
const [processingSettings, setProcessingSettings] = useState({...});
```

**Key Functions:**
- `handleFilesSelected`: Add new files to processing queue
- `handleRemoveFile`: Remove image from results
- `handleClearAll`: Reset entire application
- `handlePresetChange`: Switch compression preset
- `updateProcessedImage`: Update single image state
- `regenerateAllImages`: Reprocess all images with current settings
- `handleScrollToCustomize`: Smooth scroll to settings section

**Layout Logic:**
```typescript
{!hasImages ? (
  // Initial upload view (centered)
  <ImageUpload minimal={true} />
) : (
  // Results view
  <>
    <ResultsHeader />
    <ImageProcessor />
    <ProcessingControls />
  </>
)}
```

---

### ImageUpload.tsx

**Location:** `src/components/features/ImageUpload.tsx`
**Purpose:** File upload interface with drag-drop and clipboard paste

**Props:**
```typescript
interface ImageUploadProps {
  onFilesSelected: (files: File[]) => void;
  minimal?: boolean;           // Minimal mode (initial screen)
  selectedPreset?: string;     // Current preset
  onPresetChange?: (id: string) => void;
  settings?: ProcessingSettings;
  onSettingsChange?: (settings: ProcessingSettings) => void;
}
```

**Features:**
- Drag-and-drop file upload
- Click to browse files
- Clipboard paste support (Ctrl/Cmd + V)
- Preset selector (minimal mode only)
- Two display modes: minimal (initial) and compact (results)

**Key Handlers:**
```typescript
const handleDrop = (e: React.DragEvent) => {...}
const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {...}
const handlePasteFromClipboard = async () => {...}
```

---

### ImageProcessor.tsx

**Location:** `src/components/features/ImageProcessor.tsx`
**Purpose:** Orchestrates processing for all uploaded images

**Props:**
```typescript
interface ImageProcessorProps {
  images: ProcessedImage[];
  settings: ProcessingSettings;
  onRemoveImage: (id: string) => void;
  onUpdateImage: (id: string, update: Partial<ProcessedImage>) => void;
  onFilesSelected?: (files: File[]) => void;
  onCustomize?: () => void;     // Scroll to settings
}
```

**Processing Logic:**
```typescript
useEffect(() => {
  images.forEach(async (image) => {
    if (!image.processed && !image.processing) {
      onUpdateImage(image.id, { processing: true });

      const processedBlob = await processImage(image.originalFile, settings);

      onUpdateImage(image.id, {
        processedBlob,
        processedSize: processedBlob.size,
        processing: false,
        processed: true,
      });
    }
  });
}, [images, settings]);
```

**Auto-processing:** Watches `images` and `settings`, automatically processes any unprocessed images.

**Layout:**
- DownloadAll component (batch download)
- Responsive grid (1/2/3/4 columns based on screen size)
- ImageCard for each image
- ImageUpload drop zone (fills remaining grid columns)

**Grid Logic:**
```typescript
// Calculate remaining columns for drop zone
const imageCount = images.length;
const remainingXl = imageCount % 4 === 0 ? 4 : 4 - (imageCount % 4);
// Drop zone spans remaining columns
```

---

### ImageCard.tsx

**Location:** `src/components/features/ImageCard.tsx`
**Purpose:** Display individual image with stats and actions

**Props:**
```typescript
interface ImageCardProps {
  image: ProcessedImage;
  onRemove: () => void;
  onRegenerate?: () => void;
}
```

**Features:**
- Thumbnail display (250px height, cover fit)
- Processing state indicator
- Compression ratio badge (green for savings, red for increase)
- File size comparison (before → after)
- Dimensions comparison
- Download button
- Compare button (opens comparison modal)
- Remove button

**Key Calculations:**
```typescript
const compressionRatio = ((originalSize - processedSize) / originalSize) * 100;
const fileSizeIncreased = compressionRatio < 0;
const spaceSaved = originalSize - processedSize;
```

**Warning:** Shows alert if file size increased (negative compression).

---

### ProcessingControls.tsx

**Location:** `src/components/features/ProcessingControls.tsx`
**Purpose:** Settings panel with advanced customization options

**Props:**
```typescript
interface ProcessingControlsProps {
  settings: ProcessingSettings;
  onSettingsChange: (settings: ProcessingSettings) => void;
  onClear: () => void;
  selectedPreset?: string;
  onPresetChange?: (presetId: string) => void;
  onRegenerateAll?: () => void;
}
```

**UI Sections:**
1. **Preset Display:**
   - Shows current preset name and badge
   - Settings summary (format, quality, resize mode)
   - Regenerate All button

2. **Advanced Settings** (collapsible):
   - Format selector (JPEG, PNG, WebP)
   - Quality slider (0-100%)
   - Resize mode selector
   - Percentage slider (for percentage mode)
   - Max dimensions inputs (for max-dimensions mode)
   - Exact dimensions inputs with aspect ratio lock (for exact mode)

**Aspect Ratio Lock:**
```typescript
const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
const [aspectRatio, setAspectRatio] = useState(16 / 9);

// Auto-calculate height when width changes
if (maintainAspectRatio && settings.resizeMode === 'exact') {
  if (key === 'exactWidth') {
    updatedSettings.exactHeight = Math.round(value / aspectRatio);
  }
}
```

**Auto-open:** Advanced settings auto-open when "Custom" preset is selected.

---

### DownloadAll.tsx

**Location:** `src/components/features/DownloadAll.tsx`
**Purpose:** Batch download all processed images as ZIP

**Props:**
```typescript
interface DownloadAllProps {
  images: ProcessedImage[];
  onCustomize?: () => void;
}
```

**Display Conditions:**
- Only shows if 2 or more images are processed
- Shows compression stats for all images combined

**ZIP Generation:**
```typescript
const handleDownloadAll = async () => {
  const zip = new JSZip();

  images.forEach((image) => {
    if (image.processedBlob) {
      const filename = `compressed_${image.originalFile.name}`;
      zip.file(filename, image.processedBlob);
    }
  });

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  // Trigger download...
}
```

**Stats Display:**
- Total original size
- Total compressed size
- Total space saved (percentage)
- Progress bar visualization

---

### PresetSelector.tsx

**Location:** `src/components/features/PresetSelector.tsx`
**Purpose:** Display and select compression presets

**Props:**
```typescript
interface PresetSelectorProps {
  selectedPreset: string;
  onPresetChange: (presetId: string) => void;
}
```

**Features:**
- Shows 4 primary presets initially
- "Show More" button reveals all 9 presets
- Visual feedback for selected preset (red border, "Selected" badge)
- Displays preset icon, name, description, and badge

**Primary Presets:** Compress Only, Web Optimized, High Quality, Custom

**All Presets:** + Email Friendly, Instagram, Twitter/X, Maximum Compression, Lossless PNG

---

### ImageComparison.tsx

**Location:** `src/components/comparison/ImageComparison.tsx`
**Purpose:** Interactive before/after comparison modal

**Props:**
```typescript
interface ImageComparisonProps {
  image: ProcessedImage;
  onClose: () => void;
}
```

**Comparison Modes:**
1. **Slider:** Interactive slider to reveal original/compressed
2. **Side-by-Side:** Both images displayed side-by-side
3. **Toggle:** Click to switch between original and compressed

**Interactive Slider:**
```typescript
const handleMouseDown = () => setIsDragging(true);
const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging) return;
  const rect = containerRef.current.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const percentage = (x / rect.width) * 100;
  setSliderPosition(Math.min(100, Math.max(0, percentage)));
};
```

**Labels:**
- "ORIGINAL" label on left side
- "COMPRESSED" label on right side
- Color-coded borders (gray for original, red for compressed)

---

### UI Components

#### ResultsHeader.tsx

**Location:** `src/components/ui/ResultsHeader.tsx`
**Purpose:** Header shown on results page

**Features:**
- Logo (clickable to reset)
- Home button (resets to upload screen)
- GitHub link icon

#### Footer.tsx

**Location:** `src/components/ui/Footer.tsx`
**Purpose:** Footer with copyright and links

**Content:**
- Copyright notice: "© 2025 ImgCrush · 100% client-side processing"
- GitHub repository link

#### Header.tsx

**Location:** `src/components/ui/Header.tsx`
**Purpose:** Full header component (currently unused)

**Note:** This component exists but is not used in the current main flow. May be used in future branches or alternative layouts.

---

## Processing Pipeline

### Architecture

The processing pipeline uses a modular, extensible design based on the Strategy pattern.

```
File Input
    ↓
ProcessingPipeline.process()
    ↓
Load Image → Canvas
    ↓
┌─────────────────────┐
│  ResizeProcessor    │ → Resize if needed
└─────────────────────┘
    ↓
┌─────────────────────┐
│ FormatProcessor     │ → Validate format
└─────────────────────┘
    ↓
┌─────────────────────┐
│ QualityProcessor    │ → (placeholder)
└─────────────────────┘
    ↓
Canvas.toBlob(quality)
    ↓
Blob Output
```

### ProcessingPipeline.ts

**Location:** `src/processing/ProcessingPipeline.ts`

**Main Class:**
```typescript
export class ProcessingPipeline {
  private processors: Processor[] = [];

  constructor() {
    this.registerProcessor(new ResizeProcessor());
    this.registerProcessor(new FormatProcessor());
    this.registerProcessor(new QualityProcessor());
  }

  async process(file: File, settings: ProcessingSettings): Promise<Blob> {
    // 1. Load image
    // 2. Create canvas
    // 3. Run through processors
    // 4. Generate blob
  }
}
```

**Key Methods:**
- `registerProcessor(processor)`: Add processor to pipeline
- `process(file, settings)`: Execute full pipeline
- `getProcessors()`: Get all registered processors
- `clearProcessors()`: Remove all processors

**Singleton Usage:**
```typescript
// In imageProcessor.ts
const pipeline = new ProcessingPipeline();
export async function processImage(file: File, settings: ProcessingSettings) {
  return pipeline.process(file, settings);
}
```

### Processor Interface

```typescript
interface Processor {
  name: string;
  process(context: ProcessingContext): Promise<ProcessingContext>;
  isEnabled(settings: ProcessingSettings): boolean;
}
```

**Contract:**
1. **name:** Unique identifier for the processor
2. **isEnabled:** Check if processor should run for given settings
3. **process:** Transform context and return updated context

### ResizeProcessor

**Location:** `src/processing/processors/ResizeProcessor.ts`

**Purpose:** Handle all image resizing operations

**isEnabled Logic:**
```typescript
isEnabled(settings: any): boolean {
  // Skip if percentage is 100%
  if (settings.resizeMode === 'percentage' && settings.percentage === 100) {
    return false;
  }
  // Skip if max dimensions are 99999 (no resize)
  if (settings.resizeMode === 'max-dimensions' &&
      (settings.maxWidth >= 99999 || settings.maxHeight >= 99999)) {
    return false;
  }
  return true;
}
```

**Resize Logic:**
- **exact:** Use exactWidth/exactHeight directly
- **percentage:** Scale by percentage (capped at 100%)
- **max-dimensions:** Fit within bounds, preserve aspect ratio

**Quality Settings:**
```typescript
newCtx.imageSmoothingEnabled = true;
newCtx.imageSmoothingQuality = 'high';
```

### QualityProcessor

**Location:** `src/processing/processors/QualityProcessor.ts`

**Status:** Placeholder (quality is applied in final toBlob call)

**Future Use:** Could handle sharpening, noise reduction, etc.

### FormatProcessor

**Location:** `src/processing/processors/FormatProcessor.ts`

**Purpose:** Validate output format

**Current Implementation:** Minimal validation, ensures format is valid

---

## Compression Presets

### Preset Structure

```typescript
interface CompressionPreset {
  id: string;                       // Unique identifier
  name: string;                     // Display name
  description: string;              // User-friendly description
  icon: string;                     // Emoji icon
  settings: Partial<ProcessingSettings>;  // Settings to apply
  recommended?: string[];           // Recommended use cases
  badge?: string;                   // Optional badge text
}
```

### Available Presets

| ID | Name | Quality | Resize | Use Case |
|----|------|---------|--------|----------|
| `compression-only` | Compress Only | 80% | None | Preserve dimensions |
| `web-optimized` | Web Optimized | 85% | 1920px | Websites, blogs |
| `high-quality` | High Quality | 95% | None | Portfolio, print |
| `email-friendly` | Email Friendly | 75% | 1280px | Email attachments |
| `social-instagram` | Instagram | 90% | 1080×1080 | Instagram posts |
| `social-twitter` | Twitter/X | 85% | 1200×675 | Twitter/X |
| `maximum-compression` | Maximum Compression | 60% | 1024px | Thumbnails |
| `lossless` | Lossless PNG | 100% | None | Graphics, logos |
| `custom` | Custom Settings | 80% | 100% | Full control |

### Preset Application

```typescript
export function applyPreset(
  presetId: string,
  currentSettings: ProcessingSettings
): ProcessingSettings {
  const preset = getPresetById(presetId);
  if (!preset) return currentSettings;

  // Merge preset settings with current settings
  return {
    ...currentSettings,
    ...preset.settings,
  };
}
```

**Important:** When preset changes, all images are marked as `processed: false` to trigger reprocessing.

### Adding a New Preset

1. Add to `COMPRESSION_PRESETS` array in `src/presets/compressionPresets.ts`
2. Define id, name, description, icon, settings
3. Optionally add to primary presets in `PresetSelector.tsx`

Example:
```typescript
{
  id: 'facebook-optimized',
  name: 'Facebook',
  description: 'Optimized for Facebook posts (1200×630px)',
  icon: '📘',
  badge: 'Social',
  settings: {
    quality: 0.85,
    format: 'jpeg',
    resizeMode: 'max-dimensions',
    maxWidth: 1200,
    maxHeight: 630,
  },
  recommended: ['Facebook posts', 'Social media']
}
```

---

## State Management

### State Flow

```
┌────────────────────────────────────────────────────┐
│                   App.tsx State                     │
│  • files: File[]                                   │
│  • processedImages: ProcessedImage[]               │
│  • selectedPreset: string                          │
│  • processingSettings: ProcessingSettings          │
└───────────────────┬────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼ (props)               ▼ (props)
┌───────────────┐       ┌──────────────────┐
│ ImageUpload   │       │ ImageProcessor   │
│               │       │                  │
│ • onFiles     │       │ • images         │
│   Selected    │       │ • settings       │
│ • selectedPreset│     │ • onUpdateImage  │
└───────────────┘       └──────────────────┘
        │                       │
        │ (callback)            │ (processes)
        │                       │
        ▼                       ▼
┌────────────────────────────────────┐
│   App.tsx Event Handlers           │
│   • handleFilesSelected            │
│   • handlePresetChange             │
│   • updateProcessedImage           │
│   • regenerateAllImages            │
└────────────────────────────────────┘
```

### Key State Updates

#### Adding Files
```typescript
const handleFilesSelected = useCallback((newFiles: File[]) => {
  setFiles((prev) => [...prev, ...newFiles]);
  setProcessedImages((prev) => [
    ...prev,
    ...newFiles.map((file) => ({
      id: Math.random().toString(36),
      originalFile: file,
      originalSize: file.size,
      processedBlob: null,
      processedSize: 0,
      processing: false,
      processed: false,
    })),
  ]);
}, []);
```

#### Changing Preset
```typescript
const handlePresetChange = useCallback((presetId: string) => {
  setSelectedPreset(presetId);
  const newSettings = applyPreset(presetId, processingSettings);
  setProcessingSettings(newSettings);

  // Trigger reprocessing
  setProcessedImages((prev) =>
    prev.map((img) => ({
      ...img,
      processed: false,
      processing: false,
      processedBlob: null,
      processedSize: 0
    }))
  );
}, [processingSettings]);
```

#### Processing Image
```typescript
// In ImageProcessor.tsx
useEffect(() => {
  images.forEach(async (image) => {
    if (!image.processed && !image.processing) {
      onUpdateImage(image.id, { processing: true });

      try {
        const processedBlob = await processImage(image.originalFile, settings);
        onUpdateImage(image.id, {
          processedBlob,
          processedSize: processedBlob.size,
          processing: false,
          processed: true,
        });
      } catch (error) {
        console.error('Error processing image:', error);
        onUpdateImage(image.id, { processing: false });
      }
    }
  });
}, [images, settings, onUpdateImage]);
```

### State Persistence

**Current:** No persistence - state is lost on page refresh

**Future:** Could add localStorage persistence for:
- Selected preset
- Custom settings
- Recently used settings

---

## Development Workflow

### Setup

```bash
# Clone repository
git clone https://github.com/southwellmedia-dev/imgcrush.git
cd imgcrush

# Install dependencies
npm install

# Start development server
npm run dev
# Opens at http://localhost:5173
```

### Development Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build to `/dist` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint checks |

### Project Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

### Hot Module Replacement (HMR)

Vite provides instant HMR:
- Component changes reflect immediately
- State is preserved during updates
- CSS changes apply without refresh

### TypeScript Configuration

**tsconfig.json:** Main TypeScript config
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true
  }
}
```

**Strict mode enabled:** All type checks enforced

### ESLint

**Configuration:** `eslint.config.js`

**Rules:**
- React Hooks rules
- React Refresh rules
- TypeScript ESLint rules

**Run linter:**
```bash
npm run lint
```

---

## Common Tasks

### Adding a New Compression Preset

1. **Open:** `src/presets/compressionPresets.ts`
2. **Add to COMPRESSION_PRESETS array:**
```typescript
{
  id: 'my-preset',
  name: 'My Preset',
  description: 'Description here',
  icon: '🎨',
  settings: {
    quality: 0.85,
    format: 'webp',
    resizeMode: 'max-dimensions',
    maxWidth: 1920,
    maxHeight: 1080,
  },
  recommended: ['Use case 1', 'Use case 2']
}
```
3. **(Optional) Add to primary presets:** Edit `PresetSelector.tsx` `primaryPresets` array

### Creating a New Processor

1. **Create file:** `src/processing/processors/MyProcessor.ts`
2. **Implement Processor interface:**
```typescript
import { Processor, ProcessingContext } from '../types';

export class MyProcessor implements Processor {
  name = 'MyProcessor';

  isEnabled(settings: any): boolean {
    // Return true if this processor should run
    return settings.myFeature === true;
  }

  async process(context: ProcessingContext): Promise<ProcessingContext> {
    // Modify context.canvas
    // Return updated context
    return context;
  }
}
```
3. **Register in pipeline:** Edit `ProcessingPipeline.ts`
```typescript
import { MyProcessor } from './processors/MyProcessor';

constructor() {
  this.registerProcessor(new ResizeProcessor());
  this.registerProcessor(new MyProcessor()); // Add here
  this.registerProcessor(new FormatProcessor());
}
```

### Adding a New Image Format

1. **Update types:** Add format to `ProcessingSettings` type union
```typescript
format: 'jpeg' | 'png' | 'webp' | 'avif';  // Add 'avif'
```
2. **Update format selector:** Edit `ProcessingControls.tsx`
```typescript
<Select
  data={[
    { value: 'jpeg', label: 'JPEG' },
    { value: 'png', label: 'PNG' },
    { value: 'webp', label: 'WebP' },
    { value: 'avif', label: 'AVIF' },  // Add this
  ]}
  value={settings.format}
  onChange={(value) => updateSetting('format', value)}
/>
```
3. **Update MIME type:** Ensure `ProcessingPipeline.ts` handles new format
```typescript
const mimeType = `image/${settings.format}`;  // Should work automatically
```

### Modifying the Layout

**Responsive Grid:**
- Current: 1 column (mobile), 2 (tablet), 3 (laptop), 4 (desktop)
- Location: `ImageProcessor.tsx`
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
```

**Drop Zone Column Spanning:**
```typescript
// Calculate remaining columns
const remainingXl = imageCount % 4 === 0 ? 4 : 4 - (imageCount % 4);

// Apply with inline style
<div style={{ gridColumn: `span ${remainingXl}` }}>
  <ImageUpload />
</div>
```

### Customizing the Theme

**Primary Color:** Edit `src/main.tsx`
```typescript
const theme = createTheme({
  primaryColor: 'red',  // Change to 'blue', 'green', etc.
  colors: {
    red: [...],  // Define custom color shades
  }
});
```

**Tailwind Classes:** Use Tailwind utilities for spacing, layouts, etc.

---

## Styling Guide

### Styling Approach

**Hybrid System:**
- **Mantine components** for UI elements (buttons, inputs, modals)
- **Tailwind CSS** for layouts, spacing, and utilities
- **Minimal custom CSS** in `index.css`

### Mantine Theme

```typescript
const theme = createTheme({
  primaryColor: 'red',
  colors: {
    red: [
      '#fff1f2',  // 0 - lightest
      '#ffe4e6',  // 1
      '#fecdd3',  // 2
      '#fda4af',  // 3
      '#fb7185',  // 4
      '#f43f5e',  // 5 - base
      '#e11d48',  // 6 - primary
      '#be123c',  // 7
      '#9f1239',  // 8
      '#881337'   // 9 - darkest
    ]
  },
  defaultRadius: 'md',
});
```

**Usage:**
```tsx
<Button color="red" variant="filled">
  Download
</Button>
```

### Tailwind Utilities

**Common Classes:**
- `space-y-6`: Vertical spacing between elements
- `grid grid-cols-4`: Grid layout
- `flex flex-col`: Flexbox column
- `gap-6`: Gap between grid/flex items
- `p-4`, `px-4`, `py-8`: Padding
- `max-w-7xl mx-auto`: Max width and center
- `border-t border-gray-200`: Top border

**Responsive:**
- `md:grid-cols-2`: Medium screens
- `lg:grid-cols-3`: Large screens
- `xl:grid-cols-4`: Extra large screens

### Component Styling Patterns

**Card Component:**
```tsx
<Card shadow="sm" padding="lg" radius="md" withBorder>
  <Card.Section>
    {/* Content */}
  </Card.Section>
</Card>
```

**Consistent Heights:**
```tsx
// Thumbnail images
<MantineImage height={250} fit="cover" />
```

**Color Coding:**
- **Red:** Primary actions, compressed indicators
- **Green:** Success, space saved
- **Gray:** Secondary actions, original state

### Icons

**Lucide React:**
```tsx
import { Download, Settings, X } from 'lucide-react';

<Download size={20} />
<Settings size={16} />
```

**Common sizes:** 16px (small), 18px (medium), 20px (large)

---

## Key Files Reference

### Most Important Files

| File | Purpose | Lines | Complexity |
|------|---------|-------|------------|
| `src/App.tsx` | Root component, state management | 166 | ⭐⭐⭐ |
| `src/components/features/ImageProcessor.tsx` | Processing orchestration | 102 | ⭐⭐⭐ |
| `src/components/features/ProcessingControls.tsx` | Settings UI | ~300 | ⭐⭐⭐⭐ |
| `src/components/features/ImageCard.tsx` | Image display and stats | ~250 | ⭐⭐⭐ |
| `src/processing/ProcessingPipeline.ts` | Processing pipeline | 85 | ⭐⭐⭐ |
| `src/processing/processors/ResizeProcessor.ts` | Resize logic | 100 | ⭐⭐⭐ |
| `src/presets/compressionPresets.ts` | Preset definitions | 160 | ⭐⭐ |

### Configuration Files

| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite build configuration |
| `tsconfig.json` | TypeScript configuration |
| `tailwind.config.js` | Tailwind CSS configuration |
| `eslint.config.js` | ESLint rules |
| `postcss.config.js` | PostCSS plugins |
| `package.json` | Dependencies and scripts |

---

## Debugging & Troubleshooting

### Common Issues

#### Issue: Images not processing

**Symptoms:** Images stuck in "processing" state

**Debug:**
1. Check browser console for errors
2. Verify file is valid image format
3. Check if `processImage` function is resolving
4. Inspect `ProcessedImage.processing` and `ProcessedImage.processed` states

**Solution:**
```typescript
// Add error handling in ImageProcessor.tsx
try {
  const processedBlob = await processImage(image.originalFile, settings);
} catch (error) {
  console.error('Processing error:', error);
  onUpdateImage(image.id, { processing: false, processed: false });
}
```

#### Issue: File size increased after compression

**Symptoms:** Negative compression ratio, red badge

**Cause:** Settings may be increasing quality or changing format inefficiently

**Solution:**
- Lower quality setting
- Try WebP format (better compression)
- Check if resize is actually reducing dimensions

#### Issue: Memory errors with large images

**Symptoms:** Browser crashes or freezes

**Cause:** Canvas size too large (width * height * 4 bytes)

**Solution:**
- Add max resolution check before processing
- Limit canvas size to 10000x10000 pixels
- Consider warning user for very large files

```typescript
if (img.width * img.height > 100000000) {
  throw new Error('Image resolution too large');
}
```

#### Issue: Grid layout broken

**Symptoms:** Drop zone not filling remaining columns

**Cause:** CSS grid column span not calculated correctly

**Debug:**
```typescript
console.log('Image count:', imageCount);
console.log('Remaining XL:', remainingXl);
console.log('Drop zone style:', dropZoneStyle);
```

**Solution:** Verify `gridColumn: span N` is applied correctly

### Browser Console

**Useful Logs:**
- Component renders: Add `console.log` in useEffect
- State changes: Log state in useEffect dependencies
- Processing errors: Try-catch in async functions

### React DevTools

**Install:** React DevTools browser extension

**Features:**
- Inspect component tree
- View props and state
- Profile renders
- Identify performance issues

### Performance Profiling

**Vite Build Analysis:**
```bash
npm run build -- --mode analyze
```

**Chrome DevTools:**
- Performance tab
- Memory tab (for memory leaks)
- Network tab (for bundle size)

---

## Future Enhancements

### Planned Features

1. **PWA Support**
   - Service worker for offline use
   - Install prompt
   - Caching strategy

2. **AVIF Format Support**
   - Add AVIF to format options
   - Update ProcessingPipeline to handle AVIF
   - Browser compatibility checks

3. **HEIC Input Support**
   - Convert HEIC (iOS photos) to processable format
   - May require library (heic2any)

4. **Dark Mode**
   - Mantine theme switching
   - localStorage persistence
   - Toggle in header

5. **EXIF Data Preservation**
   - Option to preserve/strip EXIF data
   - Requires EXIF library (exif-js or piexifjs)

6. **Basic Editing Tools**
   - Crop (before compression)
   - Rotate/flip
   - Filters (brightness, contrast, saturation)

7. **Watermark Support**
   - Text or image watermark
   - Position and opacity controls

8. **Keyboard Shortcuts**
   - Ctrl+V: Paste image
   - Ctrl+Z: Undo
   - Ctrl+S: Download current image
   - Space: Toggle comparison

9. **Performance Optimizations**
   - Web Workers for processing (offload from main thread)
   - Streaming for large batches
   - Progressive JPEG encoding

### Architecture Considerations

**For Large-Scale Features:**

1. **State Management:**
   - Consider Context API or Zustand if state complexity grows
   - Keep props drilling for now (works well)

2. **Routing:**
   - React Router if multi-page needed
   - Current SPA approach is fine for single-flow

3. **Testing:**
   - Add Jest + React Testing Library
   - Test processing pipeline with fixtures
   - Snapshot tests for components

4. **Code Splitting:**
   - Dynamic imports for comparison modal
   - Lazy load preset selector
   - Reduce initial bundle size

---

## Conclusion

This guide provides a comprehensive overview of the ImgCrush project architecture, codebase structure, and development practices. For questions or clarifications, refer to inline code comments or consult the project README.

**Happy Coding! 🚀**

---

**Document Version:** 1.0.0
**Last Updated:** 2025-09-30
**Maintained By:** ImgCrush Development Team