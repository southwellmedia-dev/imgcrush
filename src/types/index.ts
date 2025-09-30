export interface ProcessedImage {
  id: string;
  originalFile: File;
  originalSize: number;
  processedBlob: Blob | null;
  processedSize: number;
  processing: boolean;
  processed: boolean;
  settings?: ProcessingSettings; // Per-image settings (overrides global if present)
}

export interface ProcessingSettings {
  quality: number;
  maxWidth: number;
  maxHeight: number;
  format: 'jpeg' | 'png' | 'webp';
  resizeMode: 'max-dimensions' | 'exact' | 'percentage';
  percentage: number;
  exactWidth: number;
  exactHeight: number;
  preserveAspectRatio?: boolean;
  sharpen?: boolean;
  removeMetadata?: boolean;
}