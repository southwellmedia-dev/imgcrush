export interface ProcessedImage {
  id: string;
  originalFile: File;
  originalSize: number;
  processedBlob: Blob | null;
  processedSize: number;
  processing: boolean;
  processed: boolean;
  settings?: ProcessingSettings; // Per-image settings (overrides global if present)
  customFileName?: string; // User's custom filename (without extension)
}

export interface ProcessingSettings {
  quality: number;
  maxWidth: number;
  maxHeight: number;
  format: 'jpeg' | 'png' | 'webp' | 'avif';
  resizeMode: 'max-dimensions' | 'exact' | 'percentage';
  percentage: number;
  exactWidth: number;
  exactHeight: number;
  preserveAspectRatio?: boolean;
  sharpen?: boolean;
  removeMetadata?: boolean;
  stripExif?: boolean; // Strip EXIF data from images
}