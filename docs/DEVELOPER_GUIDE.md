# ImgCrush Developer Guide

**Version:** 2.0.0
**Last Updated:** 2025-10-01
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
- **Multiple Formats:** JPEG, PNG, WebP, AVIF output support
- **Smart Resizing:** Three resize modes (percentage, max-dimensions, exact)
- **Batch Processing:** Handle multiple images simultaneously with drag-to-reorder
- **ZIP Download:** Bundle all processed images into a single archive
- **Interactive Comparison:** Before/after slider with 3 viewing modes
- **Responsive Design:** Works on desktop, tablet, and mobile
- **Dark Mode:** Full dark mode support with persistent preference
- **View Modes:** Grid and table views for different workflows
- **Bulk Rename:** Multiple naming formats with live preview
- **Per-Image Settings:** Override global settings for individual images
- **HEIC Support:** Auto-converts iOS photos to compatible formats
- **Settings Persistence:** Saves preferences to localStorage

---

## Tech Stack

### Frontend Framework

- **React 19.1.1**: Modern React with Hooks (no class components)
- **TypeScript 5.5**: Type-safe development with strict mode
- **JSX/TSX**: Component syntax

### Build Tool

- **Vite 5.4**: Lightning-fast development server and builds
  - HMR (Hot Module Replacement) for instant updates
  - Optimized production bundles
  - TypeScript support out of the box

### UI Libraries

- **Mantine UI v8** (`@mantine/core`): Primary component library
  - Pre-built accessible components
  - Theming system (customized to red color scheme)
  - Dark mode support with color scheme toggle
  - Form components, modals, buttons, etc.
- **Tailwind CSS v4**: Utility-first CSS framework
  - CSS-first configuration in `src/index.css`
  - Used alongside Mantine for layout and spacing
  - Responsive grid system
  - Custom CSS variables for theming

### Icons

- **Lucide React 0.544**: Beautiful, consistent icon library
  - Tree-shakeable (only imports what you use)
  - ISC License (open source friendly)
  - Modern design aesthetic

### Animation

- **Framer Motion 12**: Production-ready motion library
  - Declarative animations
  - Layout animations
  - Gesture support
  - Used for sidebar transitions and micro-interactions

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
  - Lazy-loaded via dynamic import for performance

### Drag and Drop

- **@dnd-kit/core**: Modern drag and drop toolkit
  - Accessible by default
  - Touch and keyboard support
- **@dnd-kit/sortable**: Sortable preset for @dnd-kit
  - Used for image reordering
  - Smooth animations

### Image Cropping

- **react-easy-crop**: Touch-friendly image cropper
  - Gesture support
  - Aspect ratio presets
  - Used in CropModal component

### HEIC Conversion

- **heic2any 0.0.4**: Client-side HEIC to JPEG conversion
  - Auto-converts iOS photos
  - 30-second timeout protection
  - Comprehensive error handling

### EXIF Handling

- **piexifjs 1.0.6**: EXIF data manipulation
  - Read and write EXIF metadata
  - Privacy-focused metadata stripping
  - Orientation correction

### Dependencies Summary

```json
{
  "dependencies": {
    "@dnd-kit/core": "^6.3.1",           // Drag and drop core
    "@dnd-kit/sortable": "^10.0.0",      // Sortable preset
    "@mantine/core": "^8.3.2",           // UI components
    "@mantine/dropzone": "^8.3.2",       // File upload drag-drop
    "@mantine/hooks": "^8.3.2",          // Utility hooks
    "@mantine/notifications": "^8.3.2",  // Toast notifications
    "framer-motion": "^12.23.22",        // Animation library
    "heic2any": "^0.0.4",                // HEIC conversion
    "jszip": "^3.10.1",                  // ZIP file generation
    "lucide-react": "^0.544.0",          // Icons
    "piexifjs": "^1.0.6",                // EXIF handling
    "react": "^19.1.1",                  // UI library
    "react-dom": "^19.1.1",              // DOM rendering
    "react-easy-crop": "^5.5.2"          // Image cropping
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
│   ├── logo-darkmode.svg           # Dark mode logo variant
│   └── favicon.svg                 # Browser tab icon
│
├── src/
│   ├── components/
│   │   ├── ui/                     # UI Components
│   │   │   ├── Header.tsx          # App header (legacy)
│   │   │   ├── Sidebar.tsx         # Main navigation sidebar with stats
│   │   │   ├── ResultsHeader.tsx   # Deprecated (replaced by Sidebar)
│   │   │   ├── ResultsAreaHeader.tsx # Header in results area
│   │   │   └── BulkRenameCallout.tsx # Banner prompting bulk rename
│   │   │
│   │   ├── features/               # Feature Components
│   │   │   ├── ImageUpload.tsx     # Drag-drop file upload + preset selector
│   │   │   ├── ImageCard.tsx       # Individual image card with stats and actions
│   │   │   ├── ImageTableView.tsx  # Table view for images
│   │   │   ├── ImageProcessor.tsx  # Orchestrates processing for all images
│   │   │   ├── ProcessingControls.tsx # Settings panel (legacy)
│   │   │   ├── DownloadAll.tsx     # Batch download with ZIP generation
│   │   │   ├── PresetSelector.tsx  # Preset selection UI
│   │   │   ├── ImageSettingsModal.tsx # Per-image settings editor
│   │   │   ├── BulkRenameModal.tsx # Bulk rename with naming formats
│   │   │   └── CropModal.tsx       # Image cropping tool (in progress)
│   │   │
│   │   ├── modals/                 # Modal Components
│   │   │   ├── AddImagesModal.tsx  # Modal for adding more images
│   │   │   └── GlobalSettingsModal.tsx # Global settings editor
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
│   ├── hooks/                      # React Hooks
│   │   └── useKeyboardShortcuts.tsx # Keyboard shortcut handler
│   │
│   ├── utils/                      # Utilities
│   │   ├── imageProcessor.ts       # Main processing entry point
│   │   ├── fileUtils.ts            # File size formatting, etc.
│   │   ├── heicConverter.ts        # HEIC to JPEG conversion
│   │   ├── exifHandler.ts          # EXIF metadata handling
│   │   ├── settingsStorage.ts      # localStorage persistence
│   │   └── namingFormats.ts        # Bulk rename naming patterns
│   │
│   ├── types/                      # TypeScript Types
│   │   ├── index.ts                # Global type definitions
│   │   └── piexifjs.d.ts           # Type definitions for piexifjs
│   │
│   ├── App.tsx                     # Root component
│   ├── main.tsx                    # Application entry point
│   ├── ErrorBoundary.tsx           # Error boundary component
│   ├── index.css                   # Global styles with Tailwind v4 CSS-first config
│   └── vite-env.d.ts               # Vite type definitions
│
├── docs/                           # Documentation
│   ├── CONTRIBUTING.md             # Contribution guidelines
│   ├── SECURITY.md                 # Security policy
│   └── DEVELOPER_GUIDE.md          # This file
│
├── index.html                      # HTML entry point
├── package.json                    # Dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
├── tsconfig.app.json               # App-specific TS config
├── tsconfig.node.json              # Node-specific TS config
├── vite.config.ts                  # Vite configuration
├── eslint.config.js                # ESLint configuration
├── .gitignore                      # Git ignore rules
├── LICENSE                         # MIT License
├── CLAUDE.md                       # AI assistant guidelines
└── README.md                       # Project README
```

### Directory Purpose

| Directory | Purpose | Key Files |
|-----------|---------|-----------|
| `src/components/ui/` | Presentational UI components | Sidebar, ResultsAreaHeader, BulkRenameCallout |
| `src/components/features/` | Business logic components | ImageUpload, ImageProcessor, ImageCard, ImageTableView |
| `src/components/modals/` | Modal dialogs | GlobalSettingsModal, AddImagesModal |
| `src/components/comparison/` | Specialized comparison tools | ImageComparison |
| `src/processing/` | Modular processing pipeline | ProcessingPipeline, Processors |
| `src/presets/` | Compression preset definitions | compressionPresets.ts |
| `src/hooks/` | Custom React hooks | useKeyboardShortcuts.tsx |
| `src/utils/` | Helper functions | imageProcessor.ts, heicConverter.ts, namingFormats.ts |
| `src/types/` | TypeScript type definitions | index.ts, piexifjs.d.ts |
| `docs/` | Project documentation | CONTRIBUTING.md, SECURITY.md, DEVELOPER_GUIDE.md |

---

## Core Concepts

### 1. ProcessingSettings Interface

The central configuration object for all image processing:

```typescript
interface ProcessingSettings {
  quality: number;              // 0-1 (0.60 = 60%)
  maxWidth: number;             // Max width in pixels
  maxHeight: number;            // Max height in pixels
  format: 'jpeg' | 'png' | 'webp' | 'avif';  // Output format
  resizeMode: 'max-dimensions' | 'exact' | 'percentage';
  percentage: number;           // For percentage resize (0-100)
  exactWidth: number;           // For exact resize
  exactHeight: number;          // For exact resize
  preserveAspectRatio?: boolean;  // Lock aspect ratio for exact resize
  sharpen?: boolean;            // Future use
  removeMetadata?: boolean;     // Future use
  stripExif?: boolean;          // Strip EXIF data (privacy)
}
```

**Special Values:**
- `maxWidth/maxHeight = 99999`: Means "no resize"
- `percentage = 100`: Means "no resize" (keep original size)
- `quality = 1.0`: Maximum quality (lossless for PNG)

### 2. ProcessedImage Lifecycle

```typescript
interface ProcessedImage {
  id: string;                   // Unique identifier (crypto.randomUUID())
  originalFile: File;           // Original uploaded file
  originalSize: number;         // Original file size in bytes
  processedBlob: Blob | null;   // Processed image blob
  processedSize: number;        // Processed size in bytes
  processing: boolean;          // Currently being processed
  processed: boolean;           // Processing complete
  settings?: ProcessingSettings; // Per-image settings (overrides global)
  customFileName?: string;      // User's custom filename (without extension)
  outputFormat?: 'jpeg' | 'png' | 'webp' | 'avif'; // Actual output format
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
const [selectedPreset, setSelectedPreset] = useState<string>(() => loadSelectedPreset() || 'compression-only');
const [viewMode, setViewMode] = useState<ViewMode>(() => loadViewMode() || 'grid');
const [processingSettings, setProcessingSettings] = useState<ProcessingSettings>(() => loadProcessingSettings() || DEFAULT_PROCESSING_SETTINGS);
const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
const [settingsModalOpen, setSettingsModalOpen] = useState(false);
const [bulkRenameModalOpen, setBulkRenameModalOpen] = useState(false);
const [addImagesModalOpen, setAddImagesModalOpen] = useState(false);
```

**Key Functions:**
- `handleFilesSelected`: Add new files to processing queue
- `handleRemoveFile`: Remove image from results
- `handleClearAll`: Reset entire application (with confirmation)
- `handlePresetChange`: Switch compression preset and trigger reprocessing
- `handleReorderImages`: Update image order (for drag-to-reorder)
- `handleUpdateFileName`: Update custom filename for single image
- `handleBulkRename`: Apply bulk rename with naming format
- `updateProcessedImage`: Update single image state
- `regenerateAllImages`: Reprocess all images with current settings
- `handleUpdateImageSettings`: Update per-image settings
- `handleApplySettingsToAll`: Apply settings to all images
- `handleDownloadAll`: Create and download ZIP of all processed images
- `handlePasteShortcut`: Handle Ctrl/Cmd+V paste from clipboard
- `handleSaveShortcut`: Handle Ctrl/Cmd+S save/download

**Layout Logic:**
```typescript
<div className="min-h-screen">
  {/* Sidebar - Always visible */}
  <Sidebar
    hasImages={hasImages}
    onReset={handleClearAll}
    onOpenSettings={() => setSettingsModalOpen(true)}
    onOpenBulkRename={() => setBulkRenameModalOpen(true)}
    onDownloadZip={handleDownloadAll}
    images={processedImages}
  />

  {/* Main content area */}
  <main style={{ marginLeft: sidebarCollapsed ? '80px' : '240px' }}>
    {!hasImages ? (
      // Initial upload view (centered)
      <ImageUpload minimal={true} />
    ) : (
      // Results view
      <>
        <ResultsAreaHeader />
        <BulkRenameCallout />
        <ImageProcessor viewMode={viewMode} />
      </>
    )}
  </main>

  {/* Modals */}
  <GlobalSettingsModal />
  <BulkRenameModal />
  <AddImagesModal />
</div>
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

### Sidebar.tsx

**Location:** `src/components/ui/Sidebar.tsx`
**Purpose:** Main navigation sidebar with actions and stats

**Props:**
```typescript
interface SidebarProps {
  onReset?: () => void;
  hasImages?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  onOpenSettings?: () => void;
  onOpenBulkRename?: () => void;
  onDownloadZip?: () => void;
  images?: ProcessedImage[];
}
```

**Features:**
- **Logo & branding:** Displays ImgCrush logo with dark mode variant
- **Navigation items:**
  - Home (resets application)
  - Add Images (opens AddImagesModal)
  - Settings (opens GlobalSettingsModal)
  - Bulk Rename (opens BulkRenameModal)
  - Download ZIP (batch download)
- **Dark mode toggle:** Switches between light and dark themes
- **Export stats:** Shows compression ratio and space saved
- **Collapse/expand:** Minimizes to icon-only view
- **Animations:** Framer Motion for smooth transitions
- **Persistent state:** Remembers collapse state

**Stats Display:**
```typescript
const stats = useMemo(() => {
  const processedImages = images.filter(img => img.processed);
  const totalOriginal = processedImages.reduce((sum, img) => sum + img.originalSize, 0);
  const totalProcessed = processedImages.reduce((sum, img) => sum + img.processedSize, 0);
  const compressionRatio = ((totalOriginal - totalProcessed) / totalOriginal) * 100;
  return { processedCount, totalOriginal, totalProcessed, compressionRatio };
}, [images]);
```

---

### ImageTableView.tsx

**Location:** `src/components/features/ImageTableView.tsx`
**Purpose:** Table view for compact image display

**Props:**
```typescript
interface ImageTableViewProps {
  images: ProcessedImage[];
  onRemove: (id: string) => void;
  globalSettings: ProcessingSettings;
  onUpdateSettings?: (imageId: string, settings: ProcessingSettings) => void;
  onApplyToAll?: (settings: ProcessingSettings) => void;
}
```

**Features:**
- Compact table layout with columns:
  - Thumbnail (small preview)
  - Filename (editable inline)
  - Original Size
  - Processed Size
  - Compression Ratio (with colored badge)
  - Format (badge)
  - Actions (Download, Settings, Compare, Remove)
- Inline filename editing (click to edit)
- Per-row settings modal
- Efficient rendering with memoization

---

### BulkRenameModal.tsx

**Location:** `src/components/features/BulkRenameModal.tsx`
**Purpose:** Bulk rename files with naming patterns

**Props:**
```typescript
interface BulkRenameModalProps {
  opened: boolean;
  onClose: () => void;
  images: ProcessedImage[];
  onApply: (renamedFiles: Map<string, string>) => void;
}
```

**Naming Formats:**
| Format | Pattern | Example |
|--------|---------|---------|
| `sequential` | image-001, image-002 | image-001.jpg, image-002.jpg |
| `custom-prefix` | {prefix}-001 | vacation-001.jpg, vacation-002.jpg |
| `date-sequential` | 2025-10-01-001 | 2025-10-01-001.jpg, 2025-10-01-002.jpg |
| `preserve-suffix` | {original}-compressed-001 | photo-compressed-001.jpg |

**Features:**
- Live preview of first 3 filenames
- Custom prefix input
- Start number configuration
- Smart padding (3 digits for <1000 images, 4 for >=1000)
- Reserved name detection (Windows: CON, PRN, AUX, etc.)
- Debounced input for performance
- Shows total count before applying

**Implementation:** Uses `src/utils/namingFormats.ts`

---

### GlobalSettingsModal.tsx

**Location:** `src/components/modals/GlobalSettingsModal.tsx`
**Purpose:** Edit global compression settings

**Features:**
- Premium modal design with glassmorphism
- All processing settings in one place:
  - Preset selector
  - Format selector (JPEG, PNG, WebP, AVIF)
  - Quality slider
  - Resize mode (percentage, max-dimensions, exact)
  - Dimension inputs
  - Aspect ratio lock
- "Apply & Regenerate" button to reprocess all images
- Settings persistence to localStorage

---

### ImageSettingsModal.tsx

**Location:** `src/components/features/ImageSettingsModal.tsx`
**Purpose:** Edit per-image compression settings

**Features:**
- Same controls as GlobalSettingsModal
- "Apply to All" button to copy settings to all images
- Overrides global settings for individual image
- Shows original image preview
- Reset to global settings option

---

### UI Components

#### ResultsAreaHeader.tsx

**Location:** `src/components/ui/ResultsAreaHeader.tsx`
**Purpose:** Header in results area with view switcher

**Features:**
- Image count display
- View mode toggle (Grid/Table)
- Download All button
- Add More Images button
- Compression preset badge
- Settings button

#### BulkRenameCallout.tsx

**Location:** `src/components/ui/BulkRenameCallout.tsx`
**Purpose:** Banner prompting bulk rename action

**Features:**
- Displays when 2+ images are processed
- Shows image count
- "Rename All Files" button
- Dismissable (auto-hides after interaction)
- Smooth animations

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
isEnabled(settings: ProcessingSettings): boolean {
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
      id: crypto.randomUUID(), // Guaranteed unique UUID v4
      originalFile: file,
      originalSize: file.size,
      processedBlob: null,
      processedSize: 0,
      processing: false,
      processed: false,
      settings: { ...processingSettings }, // Attach current global settings
    })),
  ]);
}, [processingSettings]);
```

> **Note:** Using `crypto.randomUUID()` generates RFC4122 version 4 UUIDs, providing guaranteed uniqueness even in concurrent scenarios. This is a browser standard API available in all modern browsers.

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

**Current Implementation:** Uses localStorage for persistent preferences

**Persisted State:**
- `selectedPreset`: Current compression preset ID
- `processingSettings`: Global processing settings
- `viewMode`: Grid or table view preference
- `darkMode`: Color scheme preference (light/dark)

**Implementation:** `src/utils/settingsStorage.ts`

```typescript
// Load on mount
const [selectedPreset, setSelectedPreset] = useState(
  () => loadSelectedPreset() || 'compression-only'
);

// Save on change
useEffect(() => {
  saveSelectedPreset(selectedPreset);
}, [selectedPreset]);
```

**NOT Persisted:**
- Uploaded files (intentional - privacy)
- Processed images (would be too large)
- Modal open states

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

  isEnabled(settings: ProcessingSettings): boolean {
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
- **Tailwind CSS v4** with CSS-first configuration in `index.css`
- **CSS Variables** for theming (light/dark mode)
- **Mantine components** for UI elements (buttons, inputs, modals)
- **Minimal custom CSS** for specific components

### Dark Mode

**Implementation:** Mantine's color scheme system + CSS variables

**Toggle:** Located in Sidebar component

**Persistence:** Saved to localStorage via `settingsStorage.ts`

**CSS Variables:** All colors defined in `:root` and `[data-mantine-color-scheme="dark"]`

```css
/* Light mode */
:root {
  --color-primary: #dc2626;
  --color-bg-primary: #f8fafc;
  --color-text-primary: #0f172a;
}

/* Dark mode */
[data-mantine-color-scheme="dark"] {
  --color-primary: #ef4444;
  --color-bg-primary: #0a0a0f;
  --color-text-primary: #e2e8f0;
}
```

**Loading:** Loaded on app initialization in `main.tsx`

```typescript
<MantineProvider
  theme={theme}
  defaultColorScheme={loadDarkMode() ? 'dark' : 'light'}
>
```

### Mantine Theme

```typescript
const theme = createTheme({
  primaryColor: 'red',
  colors: {
    red: [
      '#fef2f2',  // 0 - lightest
      '#fee2e2',  // 1
      '#fecaca',  // 2
      '#fca5a5',  // 3
      '#f87171',  // 4
      '#ef4444',  // 5 - base (vibrant red)
      '#dc2626',  // 6 - primary (brand red)
      '#b91c1c',  // 7
      '#991b1b',  // 8
      '#7f1d1d'   // 9 - darkest
    ],
    dark: [
      '#e2e8f0',  // 0 - lightest (for text)
      '#cbd5e1',  // 1
      '#94a3b8',  // 2
      '#64748b',  // 3
      '#475569',  // 4
      '#334155',  // 5
      '#1e1e2e',  // 6 - elevated surfaces
      '#15151f',  // 7 - secondary bg
      '#0f0f19',  // 8
      '#0a0a0f',  // 9 - primary bg (deep dark)
    ]
  },
  defaultRadius: 'md',
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
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
| `src/App.tsx` | Root component, state management | ~540 | ⭐⭐⭐⭐ |
| `src/components/ui/Sidebar.tsx` | Main navigation sidebar | ~300 | ⭐⭐⭐ |
| `src/components/features/ImageProcessor.tsx` | Processing orchestration | ~150 | ⭐⭐⭐ |
| `src/components/features/ImageCard.tsx` | Image display and stats | ~350 | ⭐⭐⭐ |
| `src/components/features/ImageTableView.tsx` | Table view for images | ~250 | ⭐⭐⭐ |
| `src/components/features/BulkRenameModal.tsx` | Bulk rename with patterns | ~200 | ⭐⭐⭐ |
| `src/components/modals/GlobalSettingsModal.tsx` | Settings editor modal | ~400 | ⭐⭐⭐⭐ |
| `src/processing/ProcessingPipeline.ts` | Processing pipeline | 85 | ⭐⭐⭐ |
| `src/processing/processors/ResizeProcessor.ts` | Resize logic | 100 | ⭐⭐⭐ |
| `src/utils/heicConverter.ts` | HEIC to JPEG conversion | 130 | ⭐⭐⭐ |
| `src/utils/namingFormats.ts` | Bulk rename patterns | ~200 | ⭐⭐⭐ |
| `src/utils/exifHandler.ts` | EXIF detection and stripping | 220 | ⭐⭐⭐⭐ |
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
2. Verify file is valid image format (try HEIC detection)
3. Check if `processImage` function is resolving
4. Inspect `ProcessedImage.processing` and `ProcessedImage.processed` states
5. Check if per-image settings are causing issues

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

### Completed Features ✅

1. **AVIF Format Support** - Full support in format selector and processing
2. **HEIC Input Support** - Auto-converts iOS HEIC photos to JPEG
3. **Dark Mode** - Complete dark mode with Sidebar toggle and localStorage persistence
4. **Keyboard Shortcuts** - Ctrl/Cmd+V paste, Ctrl/Cmd+S save, Space comparison toggle
5. **Bulk Rename** - Multiple naming formats with live preview
6. **Drag-to-Reorder** - Reorder images with @dnd-kit
7. **Per-Image Settings** - Override global settings for individual images
8. **View Modes** - Grid and table views for different workflows
9. **Settings Persistence** - localStorage for preferences
10. **EXIF Privacy** - Automatic EXIF stripping with detection
11. **Performance Optimizations** - Extracted inline styles, fixed dependency arrays, lazy-loaded JSZip

### In Progress 🚧

1. **Crop Tool**
   - CropModal component exists
   - Uses react-easy-crop
   - Integration pending
   - Location: `src/components/features/CropModal.tsx`

### Planned Features 📋

1. **PWA Support**
   - Service worker for offline use
   - Install prompt
   - Caching strategy

2. **EXIF Data Preservation Option**
   - Toggle to preserve/strip EXIF
   - Currently only strips (privacy-first)
   - piexifjs already imported

3. **Advanced Editing Tools**
   - Rotate/flip
   - Filters (brightness, contrast, saturation)
   - Sharpening

4. **Watermark Support**
   - Text or image watermark
   - Position and opacity controls

5. **Additional Keyboard Shortcuts**
   - Ctrl+Z: Undo last action
   - Delete: Remove selected image
   - Arrow keys: Navigate images

6. **Further Performance Optimizations**
   - Web Workers for processing (offload from main thread)
   - Streaming for large batches
   - Progressive JPEG encoding
   - Virtual scrolling for large batches

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

This guide provides a comprehensive overview of the ImgCrush project architecture, codebase structure, and development practices. The project has evolved significantly with the addition of dark mode, bulk rename, view modes, per-image settings, and numerous performance optimizations.

**Key Takeaways:**
- Modern React 19 with TypeScript for type safety
- Modular processing pipeline using Strategy pattern
- Privacy-first client-side processing with HEIC and EXIF support
- Comprehensive dark mode with CSS variables
- Extensible preset system for common use cases
- Settings persistence for better UX

For questions or clarifications, refer to inline code comments, the CLAUDE.md file for AI assistants, or consult the project README.

**Happy Coding! 🚀**

---

**Document Version:** 2.0.0
**Last Updated:** 2025-10-01
**Maintained By:** ImgCrush Development Team

### Changelog

**v2.0.0 (2025-10-01)**
- Updated to React 19.1.1 and Tailwind CSS v4
- Added comprehensive dark mode documentation
- Documented Sidebar, BulkRename, and view modes
- Added HEIC conversion and EXIF handling details
- Updated all component sections with new features
- Documented settings persistence
- Updated state management examples
- Added completed features checklist
- Corrected unique ID generation (crypto.randomUUID())

**v1.0.0 (2025-09-30)**
- Initial comprehensive developer guide