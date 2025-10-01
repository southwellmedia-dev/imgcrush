import heic2any from 'heic2any';

/**
 * Convert HEIC/HEIF image to JPEG
 * @param file - The HEIC file to convert
 * @returns Converted JPEG file
 */
export async function convertHeicToJpeg(file: File): Promise<File> {
  try {
    const convertedBlob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.95, // High quality for initial conversion
    });

    // heic2any can return Blob or Blob[], we always request single conversion
    const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;

    // Create a new File object from the converted blob
    const originalName = file.name.replace(/\.heic$/i, '').replace(/\.heif$/i, '');
    const convertedFile = new File([blob], `${originalName}.jpg`, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });

    return convertedFile;
  } catch (error) {
    console.error('HEIC conversion error:', error);
    throw new Error('Failed to convert HEIC image. The file may be corrupted or unsupported.');
  }
}

/**
 * Check if a file is a HEIC/HEIF image
 * @param file - The file to check
 * @returns True if file is HEIC/HEIF
 */
export function isHeicFile(file: File): boolean {
  const heicExtensions = ['.heic', '.heif'];
  const fileName = file.name.toLowerCase();

  // Check file extension
  const hasHeicExtension = heicExtensions.some(ext => fileName.endsWith(ext));

  // Check MIME type (some browsers may set it)
  const hasHeicMimeType = file.type === 'image/heic' || file.type === 'image/heif';

  return hasHeicExtension || hasHeicMimeType;
}

/**
 * Convert all HEIC files in an array to JPEG
 * @param files - Array of files to process
 * @returns Array with HEIC files converted to JPEG
 */
export async function convertHeicFiles(files: File[]): Promise<{
  convertedFiles: File[];
  conversionCount: number;
}> {
  const convertedFiles: File[] = [];
  let conversionCount = 0;

  for (const file of files) {
    if (isHeicFile(file)) {
      try {
        const convertedFile = await convertHeicToJpeg(file);
        convertedFiles.push(convertedFile);
        conversionCount++;
      } catch (error) {
        console.error(`Failed to convert ${file.name}:`, error);
        // Skip the file if conversion fails
      }
    } else {
      // Keep non-HEIC files as-is
      convertedFiles.push(file);
    }
  }

  return { convertedFiles, conversionCount };
}
