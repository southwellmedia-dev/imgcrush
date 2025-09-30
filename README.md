# ImgCrush

<div align="center">

<img src="public/logo.svg" alt="ImgCrush Logo" height="100" />

**A powerful, privacy-first image compression and optimization tool**

[![License: MIT](https://img.shields.io/badge/License-MIT-red.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg)](https://vitejs.dev/)

[Report Bug](https://github.com/southwellmedia-dev/imgcrush/issues) | [Request Feature](https://github.com/southwellmedia-dev/imgcrush/issues)

</div>

---

## 🎯 Overview

ImgCrush is a modern, client-side image compression tool that processes images entirely in your browser. No uploads, no servers, no privacy concerns—just fast, efficient image optimization with complete control over quality and dimensions.

Perfect for web developers, designers, content creators, and anyone who needs to optimize images for the web, email, or social media.

## ✨ Features

### Core Functionality
- 🖼️ **Multi-Format Support** - Output to JPEG, PNG, or WebP formats
- 🎨 **Compression Presets** - Pre-configured settings for common use cases (Web, Email, Social Media)
- 🔄 **Real-Time Processing** - See results instantly as you upload
- 📐 **Smart Resizing** - Three resize modes with aspect ratio preservation
- 🔍 **Visual Comparison** - Interactive slider to compare original vs. compressed images
- 📦 **Batch Download** - Export all processed images as a ZIP file

### Privacy & Performance
- 🔒 **100% Client-Side** - All processing happens in your browser—zero uploads
- 💨 **Lightning Fast** - No server delays, instant results
- 🚫 **No Data Collection** - Your images never leave your device
- 📱 **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile

### User Experience
- ✨ **Drag & Drop** - Simple file upload with drag-and-drop support
- 📋 **Clipboard Paste** - Paste images directly from clipboard
- 🎛️ **Advanced Controls** - Fine-tune quality, dimensions, and format
- 📊 **Detailed Stats** - See file size savings and dimension changes
- ⚡ **Live Regeneration** - Adjust settings and regenerate on the fly

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm

### Development

```bash
# Clone the repository
git clone https://github.com/southwellmedia-dev/imgcrush.git
cd imgcrush

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🎮 How to Use

### Basic Workflow

1. **Upload Images**
   - Drag and drop images onto the drop zone
   - Click to browse and select files
   - Paste from clipboard (Ctrl/Cmd + V)

2. **Choose a Preset** (optional)
   - Compress Only - Reduce file size without resizing
   - Web Optimized - Balanced quality for websites
   - High Quality - Minimal compression
   - Email Friendly - Small files for email attachments
   - Social Media Presets - Instagram, Twitter/X optimized sizes
   - Custom - Advanced settings for full control

3. **Automatic Processing**
   - Images are processed instantly upon upload
   - See real-time compression stats and file size savings

4. **Compare Results**
   - Click "Compare" on any image to see before/after
   - Use interactive slider, side-by-side, or toggle views

5. **Download**
   - Download individual compressed images
   - Use "Download ZIP" for batch download of all images

### Compression Presets

| Preset | Use Case | Quality | Resize |
|--------|----------|---------|--------|
| **Compress Only** | Reduce file size without resizing | 80% | None |
| **Web Optimized** | General website use | 85% | Max 1920px |
| **High Quality** | Print or large displays | 92% | Max 2500px |
| **Email Friendly** | Email attachments | 75% | Max 1200px |
| **Instagram** | Instagram posts | 85% | 1080×1080 |
| **Twitter/X** | Twitter images | 85% | 1200×675 |
| **Maximum Compression** | Smallest file size | 60% | Max 1024px |
| **Lossless PNG** | No quality loss | 100% | None |
| **Custom** | Full manual control | Custom | Custom |

### Resize Modes

- **Percentage**: Scale image by percentage (e.g., 50% = half size)
- **Max Dimensions**: Constrain to maximum width/height while preserving aspect ratio
- **Exact Size**: Resize to specific dimensions with optional aspect ratio lock

## 🛠️ Tech Stack

### Core Technologies
- **Frontend Framework**: [React 18](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 5.4](https://vitejs.dev/) - Lightning-fast builds and HMR
- **Component Library**: [Mantine UI v7](https://mantine.dev/) - Modern React components
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + Mantine theming

### Processing & Utilities
- **Image Processing**: HTML5 Canvas API - Client-side image manipulation
- **Archive Creation**: [JSZip](https://stuk.github.io/jszip/) - ZIP file generation
- **Icons**: [Lucide React](https://lucide.dev/) - Beautiful, consistent icons
- **File Utilities**: Custom utility functions for file handling

### Development Tools
- **Language**: TypeScript 5.5 - Type-safe development
- **Linter**: ESLint - Code quality enforcement
- **Package Manager**: npm

### Architecture Patterns
- **Modular Processing Pipeline** - Strategy pattern for extensible image processing
- **Preset System** - Configuration-based compression presets
- **Component-Based UI** - Organized into ui, features, and comparison modules

## 📁 Project Structure

```
imgcrush/
├── src/
│   ├── components/              # React components
│   │   ├── ui/                  # UI components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── ResultsHeader.tsx
│   │   ├── features/            # Feature components
│   │   │   ├── ImageUpload.tsx  # Drag & drop upload
│   │   │   ├── ImageCard.tsx    # Image thumbnail display
│   │   │   ├── ImageProcessor.tsx # Processing orchestration
│   │   │   ├── ProcessingControls.tsx # Settings panel
│   │   │   ├── DownloadAll.tsx  # Batch download
│   │   │   └── PresetSelector.tsx # Compression presets
│   │   └── comparison/          # Comparison tools
│   │       └── ImageComparison.tsx # Before/after slider
│   ├── processing/              # Processing pipeline
│   │   ├── ProcessingPipeline.ts # Main pipeline orchestrator
│   │   ├── types.ts             # Processing interfaces
│   │   └── processors/          # Individual processors
│   │       ├── ResizeProcessor.ts
│   │       ├── QualityProcessor.ts
│   │       └── FormatProcessor.ts
│   ├── presets/                 # Compression presets
│   │   └── compressionPresets.ts
│   ├── utils/                   # Utility functions
│   │   ├── imageProcessor.ts    # Canvas-based processing
│   │   └── fileUtils.ts         # File utilities
│   ├── types/                   # TypeScript definitions
│   │   └── index.ts
│   ├── App.tsx                  # Root component
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles
├── docs/                        # Documentation
│   ├── CLAUDE.md                # AI assistant guidelines
│   ├── CONTRIBUTING.md          # Contribution guide
│   └── SECURITY.md              # Security policy
├── public/                      # Static assets
│   ├── logo.svg
│   └── favicon.svg
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── vite.config.ts               # Vite configuration
└── tailwind.config.js           # Tailwind config
```

## 🎯 Roadmap

### Completed ✅
- [x] Compression presets for common use cases
- [x] Image comparison slider (slider, side-by-side, toggle modes)
- [x] Paste from clipboard support
- [x] Batch download as ZIP
- [x] Real-time processing with instant feedback
- [x] Aspect ratio lock for exact dimensions
- [x] Responsive grid layout with adaptive drop zone

### In Progress 🚧
- [ ] PWA support for offline use
- [ ] Performance optimizations for large batches

### Planned 📋
- [ ] AVIF format support
- [ ] HEIC input format support (iOS photos)
- [ ] Dark/Light theme toggle
- [ ] EXIF data preservation option
- [ ] Basic editing tools (crop, rotate, flip)
- [ ] Watermark support
- [ ] Image filters and adjustments
- [ ] Keyboard shortcuts
- [ ] Multi-language support (i18n)

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please see our [Contributing Guide](docs/CONTRIBUTING.md) for detailed information on how to contribute to ImgCrush.

### Quick Contribution Steps

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/) and [TypeScript](https://www.typescriptlang.org/)
- UI components by [Mantine](https://mantine.dev/)
- Icons by [Lucide](https://lucide.dev/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
- Powered by [Vite](https://vitejs.dev/)

## 📊 Browser Support

ImgCrush works in all modern browsers that support:
- HTML5 Canvas API
- ES6+ JavaScript
- CSS Grid and Flexbox

| Chrome | Firefox | Safari | Edge | Opera |
|--------|---------|--------|------|-------|
| ✅ 90+ | ✅ 88+ | ✅ 14+ | ✅ 90+ | ✅ 76+ |

## 🔗 Links

- [GitHub Repository](https://github.com/southwellmedia-dev/imgcrush)
- [Issue Tracker](https://github.com/southwellmedia-dev/imgcrush/issues)
- [Documentation](docs/)

## 🔒 Security

For security concerns or vulnerability reports, please see our [Security Policy](docs/SECURITY.md).

---

<div align="center">
Made with ❤️ for the open source community
</div>