import heic2any from 'heic2any';

/**
 * Convert HEIC/HEIF image to JPEG
 * @param file - The HEIC file to convert
 * @returns Converted JPEG file
 */
export async function convertHeicToJpeg(file: File): Promise<File> {
  try {
    // Validate input
    if (!file || !(file instanceof Blob)) {
      throw new Error('Invalid file input');
    }

    if (file.size === 0) {
      throw new Error('File is empty');
    }

    // Attempt conversion with timeout protection
    const conversionPromise = heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.95, // High quality for initial conversion
    });

    // Add 30-second timeout for large files
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Conversion timeout exceeded')), 30000);
    });

    const convertedBlob = await Promise.race([conversionPromise, timeoutPromise]);

    // heic2any can return Blob or Blob[], we always request single conversion
    const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;

    if (!blob || blob.size === 0) {
      throw new Error('Conversion produced empty result');
    }

    // Create a new File object from the converted blob
    const originalName = file.name.replace(/\.heic$/i, '').replace(/\.heif$/i, '');
    const convertedFile = new File([blob], `${originalName}.jpg`, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });

    return convertedFile;
  } catch (error) {
    // Enhanced error logging with context
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('HEIC conversion failed:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    });

    // Provide user-friendly error message
    if (errorMessage.includes('timeout')) {
      throw new Error(`HEIC conversion timeout: ${file.name} is too large or complex`);
    } else if (errorMessage.includes('empty')) {
      throw new Error(`HEIC conversion failed: ${file.name} appears to be empty or corrupted`);
    } else {
      throw new Error(`HEIC conversion failed: ${file.name} may be corrupted or in an unsupported format`);
    }
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
        // Keep the original file so the caller can still handle it
        convertedFiles.push(file);
      }
    } else {
      // Keep non-HEIC files as-is
      convertedFiles.push(file);
    }
  }

  return { convertedFiles, conversionCount };
}
