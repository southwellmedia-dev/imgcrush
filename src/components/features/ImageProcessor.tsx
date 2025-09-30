import React, { useEffect } from 'react';
import { ImageCard } from './ImageCard';
import { DownloadAll } from './DownloadAll';
import { ImageUpload } from './ImageUpload';
import { ProcessedImage, ProcessingSettings } from '../../types';
import { processImage } from '../../utils/imageProcessor';

interface ImageProcessorProps {
  images: ProcessedImage[];
  settings: ProcessingSettings;
  onRemoveImage: (id: string) => void;
  onUpdateImage: (id: string, update: Partial<ProcessedImage>) => void;
  onFilesSelected?: (files: File[]) => void;
  onCustomize?: () => void;
}

export function ImageProcessor({
  images,
  settings,
  onRemoveImage,
  onUpdateImage,
  onFilesSelected,
  onCustomize
}: ImageProcessorProps) {
  const regenerateImage = async (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (!image) return;

    // Reset the image to unprocessed state to trigger reprocessing
    onUpdateImage(imageId, {
      processed: false,
      processing: false,
      processedBlob: null,
      processedSize: 0
    });
  };

  // Calculate remaining columns for drop zone to span
  const imageCount = images.length;
  const remainingXl = imageCount % 4 === 0 ? 4 : 4 - (imageCount % 4);
  const remainingLg = imageCount % 3 === 0 ? 3 : 3 - (imageCount % 3);
  const remainingMd = imageCount % 2 === 0 ? 2 : 2 - (imageCount % 2);

  // Use inline gridColumn for dynamic column spanning
  const dropZoneStyle = {
    gridColumn: `span ${remainingXl}`,
    minHeight: '400px',
  } as React.CSSProperties;

  useEffect(() => {
    images.forEach(async (image) => {
      if (!image.processed && !image.processing) {
        onUpdateImage(image.id, { processing: true });

        try {
          const processedBlob = await processImage(image.originalFile, settings);
          onUpdateImage(image.id, {
            processedBlob,
            processedSize: processedBlob.size,
            processing: false,
            processed: true,
          });
        } catch (error) {
          console.error('Error processing image:', error);
          onUpdateImage(image.id, { processing: false });
        }
      }
    });
  }, [images, settings, onUpdateImage]);

  const processedImages = images.filter(img => img.processed);

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Combined grid with images and upload zone */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {images.map((image) => (
          <ImageCard
            key={image.id}
            image={image}
            onRemove={() => onRemoveImage(image.id)}
            onRegenerate={() => regenerateImage(image.id)}
          />
        ))}

        {/* Add more images - fills remaining columns with full height */}
        {onFilesSelected && (
          <div style={dropZoneStyle} className="h-full">
            <ImageUpload onFilesSelected={onFilesSelected} minimal={false} />
          </div>
        )}
      </div>

      {/* Batch download */}
      <DownloadAll images={images} onCustomize={onCustomize} />
    </div>
  );
}