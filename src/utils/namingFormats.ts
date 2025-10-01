/**
 * Naming format utilities for bulk file renaming
 */

export interface NamingFormatParams {
  index: number; // 0-based index
  totalCount: number;
  originalName: string;
  outputFormat: string; // 'jpeg', 'png', 'webp', 'avif'
  prefix?: string;
  startNumber?: number;
}

export type NamingFormatId = 'sequential' | 'custom-prefix' | 'date-sequential' | 'preserve-suffix';

export interface NamingFormat {
  id: NamingFormatId;
  name: string;
  description: string;
  requiresPrefix: boolean;
  generate: (params: NamingFormatParams) => string;
}

/**
 * Get file extension based on output format
 */
function getExtension(format: string): string {
  switch (format.toLowerCase()) {
    case 'jpeg':
      return '.jpg';
    case 'png':
      return '.png';
    case 'webp':
      return '.webp';
    case 'avif':
      return '.avif';
    default:
      return '.jpg';
  }
}

/**
 * Strip extension from filename (handles dot-files correctly)
 */
function stripExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  // Handle dot-files (e.g., .gitignore) - don't strip if dot is at start
  if (lastDot <= 0) return filename;
  // Handle files like .config.json - strip extension but keep leading dot
  return filename.substring(0, lastDot);
}

/**
 * Reserved Windows filenames that should be avoided
 */
const RESERVED_NAMES = new Set([
  'CON', 'PRN', 'AUX', 'NUL',
  'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
  'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
]);

/**
 * Check if filename is a reserved Windows name
 */
function isReservedName(filename: string): boolean {
  const nameWithoutExt = stripExtension(filename).toUpperCase();
  return RESERVED_NAMES.has(nameWithoutExt);
}

/**
 * Sanitize filename to avoid reserved names
 */
function sanitizeReservedName(filename: string): string {
  if (isReservedName(filename)) {
    const ext = filename.includes('.') ? filename.substring(filename.lastIndexOf('.')) : '';
    const base = stripExtension(filename);
    return `${base}_file${ext}`;
  }
  return filename;
}

/**
 * Smart padding - uses 3 digits for <1000 images, 4 digits for >=1000
 */
function padNumber(num: number, totalCount: number): string {
  const digits = totalCount >= 1000 ? 4 : 3;
  return num.toString().padStart(digits, '0');
}

/**
 * Get current date in YYYY-MM-DD format
 */
function getCurrentDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Available naming formats
 */
export const NAMING_FORMATS: NamingFormat[] = [
  {
    id: 'sequential',
    name: 'Sequential',
    description: 'Simple numbered sequence (image_001, image_002, ...)',
    requiresPrefix: false,
    generate: (params: NamingFormatParams): string => {
      const { index, totalCount, outputFormat, startNumber = 1 } = params;
      const number = startNumber + index;
      const paddedNumber = padNumber(number, totalCount + startNumber - 1);
      const ext = getExtension(outputFormat);
      const filename = `image_${paddedNumber}${ext}`;
      return sanitizeReservedName(filename);
    },
  },
  {
    id: 'custom-prefix',
    name: 'Custom Prefix',
    description: 'Your prefix + numbers (myprefix_001, myprefix_002, ...)',
    requiresPrefix: true,
    generate: (params: NamingFormatParams): string => {
      const { index, totalCount, outputFormat, prefix = 'image', startNumber = 1 } = params;
      const number = startNumber + index;
      const paddedNumber = padNumber(number, totalCount + startNumber - 1);
      const ext = getExtension(outputFormat);
      // Sanitize prefix (remove invalid characters, preserve Unicode letters/numbers)
      const sanitizedPrefix = prefix.replace(/[^\p{L}\p{N}_-]/gu, '_');
      const filename = `${sanitizedPrefix}_${paddedNumber}${ext}`;
      return sanitizeReservedName(filename);
    },
  },
  {
    id: 'date-sequential',
    name: 'Date + Sequential',
    description: 'Date prefix + numbers (img-2025-10-01_001, ...)',
    requiresPrefix: false,
    generate: (params: NamingFormatParams): string => {
      const { index, totalCount, outputFormat, startNumber = 1 } = params;
      const number = startNumber + index;
      const paddedNumber = padNumber(number, totalCount + startNumber - 1);
      const ext = getExtension(outputFormat);
      const date = getCurrentDate();
      const filename = `img-${date}_${paddedNumber}${ext}`;
      return sanitizeReservedName(filename);
    },
  },
  {
    id: 'preserve-suffix',
    name: 'Preserve Original + Suffix',
    description: 'Keep original name, add suffix (photo_optimized_001, vacation_optimized_002, ...)',
    requiresPrefix: false,
    generate: (params: NamingFormatParams): string => {
      const { originalName, outputFormat, index, totalCount, startNumber = 1 } = params;
      const baseName = stripExtension(originalName);
      const ext = getExtension(outputFormat);
      const number = startNumber + index;
      const paddedNumber = padNumber(number, totalCount + startNumber - 1);
      const filename = `${baseName}_optimized_${paddedNumber}${ext}`;
      return sanitizeReservedName(filename);
    },
  },
];

/**
 * Get naming format by ID
 */
export function getNamingFormatById(id: NamingFormatId): NamingFormat | undefined {
  return NAMING_FORMATS.find((format) => format.id === id);
}

/**
 * Generate preview of filenames (first N examples)
 */
export function generatePreview(
  formatId: string,
  images: Array<{ originalName: string; outputFormat: string }>,
  options: { prefix?: string; startNumber?: number; previewCount?: number } = {}
): string[] {
  const format = getNamingFormatById(formatId);
  if (!format) return [];

  const { prefix = '', startNumber = 1, previewCount = 3 } = options;
  const totalCount = images.length;
  const count = Math.min(previewCount, images.length);

  return images.slice(0, count).map((image, index) =>
    format.generate({
      index,
      totalCount,
      originalName: image.originalName,
      outputFormat: image.outputFormat,
      prefix,
      startNumber,
    })
  );
}

/**
 * Bulk rename - generate all filenames for all images
 */
export function bulkRename(
  formatId: string,
  images: Array<{ id: string; originalName: string; outputFormat: string }>,
  options: { prefix?: string; startNumber?: number } = {}
): Map<string, string> {
  const format = getNamingFormatById(formatId);
  if (!format) return new Map();

  const { prefix = '', startNumber = 1 } = options;
  const totalCount = images.length;
  const result = new Map<string, string>();

  images.forEach((image, index) => {
    const newName = format.generate({
      index,
      totalCount,
      originalName: image.originalName,
      outputFormat: image.outputFormat,
      prefix,
      startNumber,
    });
    // Store without extension (extension added during download)
    const nameWithoutExt = stripExtension(newName);
    result.set(image.id, nameWithoutExt);
  });

  return result;
}
