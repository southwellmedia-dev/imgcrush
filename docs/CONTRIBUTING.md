# Contributing to ImageCrush

First off, thank you for considering contributing to ImageCrush! It's people like you that make ImageCrush such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by the [ImageCrush Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

**Use the following template:**

```
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. Upload image '...'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. Windows 11, macOS 14]
 - Browser: [e.g. Chrome 120, Firefox 121]
 - Version: [e.g. 1.0.0]

**Additional context**
Add any other context about the problem here.
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **A clear and descriptive title**
- **A detailed description of the proposed feature**
- **Why this enhancement would be useful** to most ImageCrush users
- **Examples of how this feature would be used**
- **Mockups or examples** from other tools (if applicable)

### Your First Code Contribution

Unsure where to begin? You can start by looking through these issues:

- `good-first-issue` - Issues which should only require a few lines of code
- `help-wanted` - Issues which might be a bit more involved

### Pull Requests

1. Fork the repository and create your branch from `main`
2. If you've added code that should be tested, add tests (when testing is set up)
3. Ensure your code follows the existing code style
4. Make sure your code lints (`npm run lint`)
5. Write a clear commit message

**Pull Request Template:**

```
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
How has this been tested?
- [ ] Manual testing
- [ ] Unit tests added/updated
- [ ] Tested in multiple browsers

## Screenshots (if applicable)
Add screenshots to demonstrate the changes

## Checklist
- [ ] My code follows the project's code style
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] Any dependent changes have been merged and published
```

## Development Setup

### Prerequisites

- Node.js 18.0+
- npm 9.0+

### Local Development

1. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR-USERNAME/imagecrush.git
   cd imagecrush
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   Open http://localhost:5173 in your browser

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

6. **Run linter**
   ```bash
   npm run lint
   ```

## Project Structure

```
imagecrush/
├── src/
│   ├── components/         # React components
│   │   ├── Header.tsx
│   │   ├── ImageUpload.tsx
│   │   ├── ImageProcessor.tsx
│   │   └── ...
│   ├── processing/        # Image processing pipeline
│   │   ├── ProcessingPipeline.ts
│   │   ├── processors/    # Individual processors
│   │   └── types.ts
│   ├── presets/          # Compression presets
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Root component
│   └── main.tsx          # Entry point
├── public/               # Static assets
└── docs/                 # Documentation
```

## Coding Guidelines

### TypeScript

- Use TypeScript for all new code
- Define proper interfaces for all props and complex objects
- Avoid `any` type - use `unknown` if type is truly unknown
- Use proper type annotations for function parameters and returns

**Example:**
```typescript
interface ImageCardProps {
  image: ProcessedImage;
  onRemove: () => void;
  onRegenerate?: () => void;
}

export function ImageCard({ image, onRemove, onRegenerate }: ImageCardProps) {
  // Implementation
}
```

### React

- Use functional components with hooks
- Prefer `useCallback` and `useMemo` for optimization
- Clean up effects properly (return cleanup functions)
- Keep components focused and single-purpose

**Example:**
```typescript
useEffect(() => {
  const url = URL.createObjectURL(blob);
  // Use url...

  // Cleanup
  return () => URL.revokeObjectURL(url);
}, [blob]);
```

### Styling

- Use Tailwind CSS utility classes for styling
- Use Mantine components for UI elements
- Keep styles consistent with existing design system
- Ensure responsive design (mobile-first)

### Code Style

- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings (unless interpolating)
- Add trailing commas in multi-line arrays/objects
- Keep lines under 100 characters when possible

### Git Commit Messages

Follow semantic commit message format:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `perf:` Performance improvements
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

**Examples:**
```
feat: add AVIF format support
fix: resolve memory leak in image processing
docs: update README with new features
refactor: simplify preset selector component
```

## Adding New Features

### Adding a New Image Format

1. Update the format type in `src/types/index.ts`:
   ```typescript
   format: 'jpeg' | 'png' | 'webp' | 'avif'
   ```

2. Update format validation in `src/processing/processors/FormatProcessor.ts`

3. Test thoroughly across browsers

4. Update documentation

### Adding a New Compression Preset

1. Edit `src/presets/compressionPresets.ts`
2. Add new preset to `COMPRESSION_PRESETS` array:
   ```typescript
   {
     id: 'my-preset',
     name: 'My Preset',
     description: 'Description of what this preset does',
     icon: '🎯',
     settings: {
       quality: 0.85,
       format: 'webp',
       // ... other settings
     },
     recommended: ['Use case 1', 'Use case 2']
   }
   ```

3. Test the preset with various images

### Adding a New Processor

1. Create new processor file in `src/processing/processors/`
2. Implement the `Processor` interface:
   ```typescript
   import { Processor, ProcessingContext } from '../types';

   export class MyProcessor implements Processor {
     name = 'MyProcessor';

     isEnabled(settings: ProcessingSettings): boolean {
       // Return true if this processor should run
     }

     async process(context: ProcessingContext): Promise<ProcessingContext> {
       // Process the image
       return context;
     }
   }
   ```

3. Register in `ProcessingPipeline.ts` constructor

4. Add relevant settings to `ProcessingSettings` interface

## Testing

> **Note:** Testing framework is being set up. This section will be updated when Vitest is configured.

When tests are available:
- Write unit tests for utility functions
- Write integration tests for processing pipeline
- Test edge cases (very large images, invalid inputs, etc.)
- Aim for good coverage of critical paths

## Documentation

- Update README.md if you change functionality
- Add JSDoc comments to exported functions
- Update CHANGELOG.md with your changes
- Include code comments for complex logic

**JSDoc Example:**
```typescript
/**
 * Calculates target dimensions based on resize mode and settings
 * @param originalWidth - Original image width in pixels
 * @param originalHeight - Original image height in pixels
 * @param settings - Processing settings including resize mode
 * @returns Object containing calculated width and height
 */
export function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  settings: ProcessingSettings
): { width: number; height: number }
```

## Performance Considerations

- Test with large images (10MB+)
- Test batch processing with many images (50+)
- Monitor memory usage (use browser dev tools)
- Ensure Canvas objects are properly cleaned up
- Use Web Workers for heavy processing (future enhancement)

## Browser Testing

Before submitting a PR with UI changes, test in:
- Chrome (latest)
- Firefox (latest)
- Safari (latest) - especially for WebP support
- Edge (latest)

## Accessibility

- Ensure keyboard navigation works
- Add proper ARIA labels to buttons and interactive elements
- Test with screen readers when possible
- Maintain good color contrast ratios
- Ensure focus states are visible

## Questions?

Feel free to:
- Open a GitHub Discussion
- Comment on relevant issues
- Reach out to maintainers

## Recognition

Contributors will be recognized in:
- GitHub contributors page
- CHANGELOG.md for significant contributions
- Special thanks section in README (for major features)

## License

By contributing to ImageCrush, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to ImageCrush! 🎉