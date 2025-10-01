import React, { useEffect } from "react";
import { ImageCard } from "./ImageCard";
import { ImageTableView } from "./ImageTableView";
import { ImageUpload } from "./ImageUpload";
import { ProcessedImage, ProcessingSettings } from "../../types";
import { processImage } from "../../utils/imageProcessor";
import { ViewMode } from "../ui/ResultsHeader";

interface ImageProcessorProps {
  images: ProcessedImage[];
  settings: ProcessingSettings;
  onRemoveImage: (id: string) => void;
  onUpdateImage: (id: string, update: Partial<ProcessedImage>) => void;
  onFilesSelected?: (files: File[]) => void;
  onUpdateImageSettings?: (
    imageId: string,
    settings: ProcessingSettings
  ) => void;
  onApplyToAll?: (settings: ProcessingSettings) => void;
  onClearAll?: () => void;
  onReorderImages?: (images: ProcessedImage[]) => void;
  onUpdateFileName?: (imageId: string, fileName: string) => void;
  onBulkRename?: (renamedFiles: Map<string, string>) => void;
  onCrop?: (imageId: string, croppedBlob: Blob, croppedFileName: string) => void;
  onResetCrop?: (imageId: string) => void;
  viewMode?: ViewMode;
}

export function ImageProcessor({
  images,
  settings,
  onRemoveImage,
  onUpdateImage,
  onFilesSelected,
  onUpdateImageSettings,
  onApplyToAll,
  onClearAll,
  onUpdateFileName,
  onBulkRename,
  onCrop,
  onResetCrop,
  viewMode = "grid",
}: ImageProcessorProps) {
  const regenerateImage = async (imageId: string) => {
    const image = images.find((img) => img.id === imageId);
    if (!image) return;

    // Reset and reprocess this specific image
    onUpdateImage(imageId, {
      processed: false,
      processing: false,
      processedBlob: null,
      processedSize: 0,
    });
  };

  const handleCrop = (imageId: string) => (croppedBlob: Blob, croppedFileName: string) => {
    if (onCrop) {
      onCrop(imageId, croppedBlob, croppedFileName);
    }
  };

  const handleResetCrop = (imageId: string) => () => {
    if (onResetCrop) {
      onResetCrop(imageId);
    }
  };

  useEffect(() => {
    images.forEach(async (image) => {
      if (!image.processed && !image.processing) {
        onUpdateImage(image.id, { processing: true });

        try {
          // Use per-image settings if available, otherwise fall back to global settings
          const imageSettings = image.settings || settings;
          const processedBlob = await processImage(
            image.originalFile,
            imageSettings
          );
          onUpdateImage(image.id, {
            processedBlob,
            processedSize: processedBlob.size,
            processing: false,
            processed: true,
            outputFormat: imageSettings.format,
          });
        } catch (error) {
          console.error("Error processing image:", error);
          onUpdateImage(image.id, { processing: false });
        }
      }
    });
  }, [images, settings, onUpdateImage]);

  if (images.length === 0) {
    return null;
  }

  const dropZoneStyle = {
    minHeight: '250px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      {/* Conditional rendering based on view mode */}
      {viewMode === "grid" ? (
        <>
          {/* Grid View - Enhanced spacing */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                onRemove={() => onRemoveImage(image.id)}
                onRegenerate={() => regenerateImage(image.id)}
                onCrop={onCrop ? handleCrop(image.id) : undefined}
                onResetCrop={onResetCrop ? handleResetCrop(image.id) : undefined}
                globalSettings={settings}
                onUpdateSettings={onUpdateImageSettings}
                onApplyToAll={onApplyToAll}
                onUpdateFileName={onUpdateFileName}
              />
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Table/List View */}
          <ImageTableView
            images={images}
            onRemove={onRemoveImage}
            globalSettings={settings}
            onUpdateSettings={onUpdateImageSettings}
            onApplyToAll={onApplyToAll}
          />

          {/* Add more images button for table view */}
          {onFilesSelected && (
            <div style={{ minHeight: "200px" }}>
              <ImageUpload onFilesSelected={onFilesSelected} minimal={false} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
