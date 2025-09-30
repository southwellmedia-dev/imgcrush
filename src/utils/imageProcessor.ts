import { ProcessingSettings } from '../types';
import { ProcessingPipeline } from '../processing/ProcessingPipeline';

// Create a singleton pipeline instance
const pipeline = new ProcessingPipeline();

export async function processImage(file: File, settings: ProcessingSettings): Promise<Blob> {
  // Use the new modular pipeline
  return pipeline.process(file, settings);
}

// Legacy function for backwards compatibility
export function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  settings: ProcessingSettings
): { width: number; height: number } {
  // Check if resizing should be skipped entirely
  if (settings.resizeMode === 'max-dimensions' &&
      (settings.maxWidth >= 99999 || settings.maxHeight >= 99999)) {
    // No resize - return original dimensions
    return {
      width: originalWidth,
      height: originalHeight,
    };
  }

  switch (settings.resizeMode) {
    case 'exact':
      return {
        width: settings.exactWidth,
        height: settings.exactHeight,
      };

    case 'percentage':
      const scale = Math.min(settings.percentage, 100) / 100; // Cap at 100%
      return {
        width: Math.round(originalWidth * scale),
        height: Math.round(originalHeight * scale),
      };

    case 'max-dimensions':
    default:
      const aspectRatio = originalWidth / originalHeight;
      let width = originalWidth;
      let height = originalHeight;

      // Scale down if larger than max dimensions
      if (width > settings.maxWidth) {
        width = settings.maxWidth;
        height = width / aspectRatio;
      }

      if (height > settings.maxHeight) {
        height = settings.maxHeight;
        width = height * aspectRatio;
      }

      return {
        width: Math.round(width),
        height: Math.round(height),
      };
  }
}