import { Processor, ProcessingContext } from '../types';

export class ResizeProcessor implements Processor {
  name = 'Resize';

  isEnabled(settings: any): boolean {
    // Skip if percentage is 100% (no resize)
    if (settings.resizeMode === 'percentage' && settings.percentage === 100) {
      return false;
    }
    // Skip if dimensions are set to "no resize" values
    if (settings.resizeMode === 'max-dimensions' &&
        (settings.maxWidth >= 99999 || settings.maxHeight >= 99999)) {
      return false;
    }
    return true;
  }

  async process(context: ProcessingContext): Promise<ProcessingContext> {
    if (!this.isEnabled(context.settings)) {
      return context;
    }

    const { settings, originalImage } = context;
    const dimensions = this.calculateDimensions(
      originalImage.width,
      originalImage.height,
      settings
    );

    // Create new canvas with calculated dimensions
    const newCanvas = document.createElement('canvas');
    const newCtx = newCanvas.getContext('2d');

    if (!newCtx) {
      throw new Error('Could not get canvas context');
    }

    newCanvas.width = dimensions.width;
    newCanvas.height = dimensions.height;

    // High quality image rendering
    newCtx.imageSmoothingEnabled = true;
    newCtx.imageSmoothingQuality = 'high';

    // Draw resized image
    newCtx.drawImage(originalImage, 0, 0, dimensions.width, dimensions.height);

    return {
      ...context,
      canvas: newCanvas,
      ctx: newCtx,
      currentWidth: dimensions.width,
      currentHeight: dimensions.height
    };
  }

  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    settings: any
  ): { width: number; height: number } {
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
}