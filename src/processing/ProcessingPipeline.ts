import { Processor, ProcessingContext, ProcessingResult, ProcessingSettings } from './types';
import { ResizeProcessor } from './processors/ResizeProcessor';
import { QualityProcessor } from './processors/QualityProcessor';
import { FormatProcessor } from './processors/FormatProcessor';

export class ProcessingPipeline {
  private processors: Processor[] = [];

  constructor() {
    // Default pipeline
    this.registerProcessor(new ResizeProcessor());
    this.registerProcessor(new FormatProcessor());
    this.registerProcessor(new QualityProcessor());
  }

  registerProcessor(processor: Processor): void {
    this.processors.push(processor);
  }

  async process(file: File, settings: ProcessingSettings): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const initialCanvas = document.createElement('canvas');
      const initialCtx = initialCanvas.getContext('2d');

      if (!initialCtx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      img.onload = async () => {
        try {
          // Initialize context
          initialCanvas.width = img.width;
          initialCanvas.height = img.height;
          initialCtx.drawImage(img, 0, 0);

          let context: ProcessingContext = {
            canvas: initialCanvas,
            ctx: initialCtx,
            originalImage: img,
            currentWidth: img.width,
            currentHeight: img.height,
            settings
          };

          // Run through processing pipeline
          for (const processor of this.processors) {
            if (processor.isEnabled(settings)) {
              context = await processor.process(context);
            }
          }

          // Generate final blob
          const mimeType = `image/${settings.format}`;

          context.canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to create blob'));
              }
            },
            mimeType,
            settings.quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  getProcessors(): Processor[] {
    return this.processors;
  }

  clearProcessors(): void {
    this.processors = [];
  }
}