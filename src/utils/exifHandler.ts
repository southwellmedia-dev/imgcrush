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
      // Revoke object URL if used
      try {
        if (img.src && img.src.startsWith('blob:')) URL.revokeObjectURL(img.src);
      } catch {
        // ignore
      }
      reject(new Error('Failed to load image'));
    };

    // Create and set object URL, ensure it's revoked on load/error using listeners
    const objectUrl = URL.createObjectURL(blob);
    img.src = objectUrl;
    const revoke = () => {
      try { URL.revokeObjectURL(objectUrl); } catch { /* ignore */ }
    };
    // Use event listeners so we don't interfere with existing onload/onerror handlers
    img.addEventListener('load', revoke, { once: true });
    img.addEventListener('error', revoke, { once: true });
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
  _originalBlob: Blob,
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

    // Detect JPEG
    const isJpeg = view.byteLength >= 2 && view.getUint16(0, false) === 0xffd8;
    // Detect PNG (signature 0x89504E47)
    const isPng = view.byteLength >= 8 && view.getUint32(0, false) === 0x89504e47;
    // Detect WebP RIFF/WEBP (ASCII 'RIFF' and 'WEBP' at offset 8)
    const isWebP = view.byteLength >= 12 && view.getUint32(0, false) === 0x52494646 && view.getUint32(8, false) === 0x57454250;

    if (isJpeg) {
      // Look for EXIF APP1 marker (0xFFE1) followed by "Exif\0\0"
      let offset = 2;
      const maxSegments = 1024;
      let segments = 0;

      while (offset + 4 < view.byteLength && segments < maxSegments) {
        segments++;
        const marker = view.getUint16(offset, false);

        if (marker === 0xffe1) {
          // Ensure we can read 4 bytes at offset+4..+7 safely
          if (offset + 7 < view.byteLength) {
            const exifString =
              String.fromCharCode(view.getUint8(offset + 4)) +
              String.fromCharCode(view.getUint8(offset + 5)) +
              String.fromCharCode(view.getUint8(offset + 6)) +
              String.fromCharCode(view.getUint8(offset + 7));

            if (exifString === 'Exif') {
              return true;
            }
          } else {
            // Truncated APP1 marker - skip safely
            console.warn('Truncated APP1 marker while checking EXIF');
            return false;
          }
        }

        // Validate segment length
        if (offset + 2 >= view.byteLength) break;
        const segmentLength = view.getUint16(offset + 2, false);
        // JPEG segment length includes the length field and must be >= 2
        if (segmentLength < 2) {
          console.warn('Invalid JPEG segment length', segmentLength);
          return false;
        }
        if (offset + 2 + segmentLength > view.byteLength) {
          console.warn('JPEG segment length extends past buffer');
          return false;
        }

        offset += 2 + segmentLength;
      }

      return false;
    }

    if (isPng) {
      // PNG: scan chunks for eXIf (chunk type ASCII 'eXIf')
      let offset = 8; // skip signature
      while (offset + 8 <= view.byteLength) {
        const length = view.getUint32(offset, false);
        const type = String.fromCharCode(
          view.getUint8(offset + 4),
          view.getUint8(offset + 5),
          view.getUint8(offset + 6),
          view.getUint8(offset + 7)
        );

        if (type === 'eXIf') {
          return true;
        }

        // Move to next chunk: length(4) + type(4) + data(length) + crc(4)
        const next = offset + 8 + length + 4;
        if (next <= offset || next > view.byteLength) break;
        offset = next;
      }

      return false;
    }

    if (isWebP) {
      // WebP: RIFF chunks - scan for 'EXIF' chunk type
      // RIFF header at 0..11, then chunks at offset 12
      let offset = 12;
      while (offset + 8 <= view.byteLength) {
        const chunkId = String.fromCharCode(
          view.getUint8(offset),
          view.getUint8(offset + 1),
          view.getUint8(offset + 2),
          view.getUint8(offset + 3)
        );
        const chunkSize = view.getUint32(offset + 4, true);

        if (chunkId === 'EXIF') {
          return true;
        }

        const next = offset + 8 + chunkSize + (chunkSize % 2);
        if (next <= offset || next > view.byteLength) break;
        offset = next;
      }

      return false;
    }

    // HEIF/AVIF detection: look for 'ftyp' and unsupported boxes
    // If unable to parse format, return false but log debug
    console.debug('Unknown image format when checking for EXIF');
    return false;
  } catch (error) {
    console.error('Error checking for EXIF data:', error);
    return false;
  }
}
