/**
 * EXIF data handling utilities
 * Note: For full EXIF support, we would use piexifjs library, but for now
 * we'll use canvas-based approach which naturally strips EXIF data.
 * Future enhancement: Implement piexifjs for full EXIF preservation.
 */

/**
 * Strip EXIF data from an image by re-encoding it
 * @param blob - The image blob
 * @returns New blob without EXIF data
 */
export async function stripExif(blob: Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (newBlob) => {
          if (newBlob) {
            resolve(newBlob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        blob.type,
        1.0
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(blob);
  });
}

/**
 * Preserve EXIF data when processing image
 * Note: This is a placeholder for future piexifjs implementation
 * For now, EXIF data is automatically stripped during canvas processing
 * @param originalBlob - Original image with EXIF
 * @param processedBlob - Processed image without EXIF
 * @returns Processed image with EXIF data restored
 */
export async function preserveExif(
  originalBlob: Blob,
  processedBlob: Blob
): Promise<Blob> {
  // TODO: Implement with piexifjs
  // For now, return processedBlob as-is (EXIF will be stripped)
  console.warn(
    'EXIF preservation not yet implemented. Use piexifjs for full support.'
  );
  return processedBlob;
}

/**
 * Check if a blob contains EXIF data
 * @param blob - The image blob to check
 * @returns True if EXIF data is detected
 */
export async function hasExifData(blob: Blob): Promise<boolean> {
  try {
    const arrayBuffer = await blob.arrayBuffer();
    const view = new DataView(arrayBuffer);

    // Check for JPEG SOI marker (0xFFD8)
    if (view.getUint16(0, false) !== 0xffd8) {
      return false;
    }

    // Look for EXIF marker (0xFFE1) followed by "Exif\0\0"
    let offset = 2;
    while (offset < view.byteLength) {
      const marker = view.getUint16(offset, false);

      if (marker === 0xffe1) {
        // Check for "Exif\0\0" string
        const exifString =
          String.fromCharCode(view.getUint8(offset + 4)) +
          String.fromCharCode(view.getUint8(offset + 5)) +
          String.fromCharCode(view.getUint8(offset + 6)) +
          String.fromCharCode(view.getUint8(offset + 7));

        if (exifString === 'Exif') {
          return true;
        }
      }

      // Move to next marker
      const segmentLength = view.getUint16(offset + 2, false);
      offset += 2 + segmentLength;
    }

    return false;
  } catch (error) {
    console.error('Error checking for EXIF data:', error);
    return false;
  }
}
