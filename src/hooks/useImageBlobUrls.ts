import { useState, useEffect, useRef } from 'react';

interface UseImageBlobUrlsResult {
  originalUrl: string | null;
  processedUrl: string | null;
  originalDimensions: { width: number; height: number } | null;
  processedDimensions: { width: number; height: number } | null;
}

/**
 * Custom hook to manage blob URLs and image dimensions
 * Handles URL creation, revocation, and dimension loading
 */
export function useImageBlobUrls(
  originalFile: File,
  processedBlob: Blob | null
): UseImageBlobUrlsResult {
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [processedDimensions, setProcessedDimensions] = useState<{ width: number; height: number } | null>(null);

  // Use refs to track blob URLs and prevent double-revocation in StrictMode
  const originalUrlRef = useRef<string | null>(null);
  const processedUrlRef = useRef<string | null>(null);

  // Load original image
  useEffect(() => {
    if (!originalFile || !(originalFile instanceof Blob)) {
      console.error('Invalid originalFile:', originalFile);
      return;
    }

    const loadOriginal = () => {
      if (originalUrlRef.current) {
        URL.revokeObjectURL(originalUrlRef.current);
      }
      const url = URL.createObjectURL(originalFile);
      originalUrlRef.current = url;
      setOriginalUrl(url);

      const img = new Image();
      img.onload = () => {
        setOriginalDimensions({ width: img.width, height: img.height });
      };
      img.onerror = (e) => {
        console.error('Failed to load original image dimensions:', {
          url,
          fileName: originalFile.name,
          fileSize: originalFile.size,
          fileType: originalFile.type,
          error: e,
        });
      };
      img.src = url;
    };

    loadOriginal();

    return () => {
      if (originalUrlRef.current) {
        URL.revokeObjectURL(originalUrlRef.current);
        originalUrlRef.current = null;
      }
    };
  }, [originalFile]);

  // Load processed image
  useEffect(() => {
    if (!processedBlob) {
      if (processedUrlRef.current) {
        URL.revokeObjectURL(processedUrlRef.current);
        processedUrlRef.current = null;
      }
      setProcessedUrl(null);
      setProcessedDimensions(null);
      return;
    }

    const loadProcessed = () => {
      if (processedUrlRef.current) {
        URL.revokeObjectURL(processedUrlRef.current);
      }
      const url = URL.createObjectURL(processedBlob);
      processedUrlRef.current = url;
      setProcessedUrl(url);

      const img = new Image();
      img.onload = () => {
        setProcessedDimensions({ width: img.width, height: img.height });
      };
      img.onerror = (e) => {
        console.error('Failed to load processed image dimensions:', e);
      };
      img.src = url;
    };

    loadProcessed();

    return () => {
      if (processedUrlRef.current) {
        URL.revokeObjectURL(processedUrlRef.current);
        processedUrlRef.current = null;
      }
    };
  }, [processedBlob]);

  return {
    originalUrl,
    processedUrl,
    originalDimensions,
    processedDimensions,
  };
}
