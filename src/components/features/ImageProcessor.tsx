import React, { useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { ImageCard } from "./ImageCard";
import { ImageTableView } from "./ImageTableView";
import { DownloadAll } from "./DownloadAll";
import { ImageUpload } from "./ImageUpload";
import { ProcessedImage, ProcessingSettings } from "../../types";
import { processImage } from "../../utils/imageProcessor";
import { ViewMode } from "../ui/ResultsHeader";

// Sortable wrapper for ImageCard
interface SortableImageCardProps {
  image: ProcessedImage;
  onRemove: () => void;
  onRegenerate?: () => void;
  onCrop?: (croppedBlob: Blob, croppedFileName: string) => void;
  globalSettings: ProcessingSettings;
  onUpdateSettings?: (imageId: string, settings: ProcessingSettings) => void;
  onApplyToAll?: (settings: ProcessingSettings) => void;
  onUpdateFileName?: (imageId: string, fileName: string) => void;
}

function SortableImageCard(props: SortableImageCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, position: "relative" }}
      {...attributes}
    >
      {/* Drag Handle - positioned next to delete button */}
      <div
        {...listeners}
        role="button"
        tabIndex={0}
        aria-label="Drag to reorder image"
        aria-roledescription="draggable"
        style={{
          position: "absolute",
          top: "8px",
          right: "48px", // Position to the left of the delete button
          zIndex: 10,
          cursor: isDragging ? "grabbing" : "grab",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          borderRadius: "4px",
          padding: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background-color 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        }}
      >
        <GripVertical size={16} color="white" aria-hidden="true" />
      </div>

      <ImageCard {...props} />
    </div>
  );
}

interface ImageProcessorProps {
  images: ProcessedImage[];
  settings: ProcessingSettings;
  onRemoveImage: (id: string) => void;
  onUpdateImage: (id: string, update: Partial<ProcessedImage>) => void;
  onFilesSelected?: (files: File[]) => void;
  onCustomize?: () => void;
  onUpdateImageSettings?: (
    imageId: string,
    settings: ProcessingSettings
  ) => void;
  onApplyToAll?: (settings: ProcessingSettings) => void;
  onClearAll?: () => void;
  onReorderImages?: (images: ProcessedImage[]) => void;
  onUpdateFileName?: (imageId: string, fileName: string) => void;
  onBulkRename?: (renamedFiles: Map<string, string>) => void;
  viewMode?: ViewMode;
}

export function ImageProcessor({
  images,
  settings,
  onRemoveImage,
  onUpdateImage,
  onFilesSelected,
  onCustomize,
  onUpdateImageSettings,
  onApplyToAll,
  onClearAll,
  onReorderImages,
  onUpdateFileName,
  onBulkRename,
  viewMode = "grid",
}: ImageProcessorProps) {
  // Setup drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && onReorderImages) {
      const oldIndex = images.findIndex((img) => img.id === active.id);
      const newIndex = images.findIndex((img) => img.id === over.id);

      const reorderedImages = arrayMove(images, oldIndex, newIndex);
      onReorderImages(reorderedImages);
    }
  };
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
    // Update the image with the cropped version
    onUpdateImage(imageId, {
      processedBlob: croppedBlob,
      processedSize: croppedBlob.size,
      customFileName: croppedFileName.replace(/\.[^/.]+$/, ''), // Remove extension
    });
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Conditional rendering based on view mode */}
      {viewMode === "grid" ? (
        <>
          {/* Grid View with Drag and Drop */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={images.map((img) => img.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" style={{ gap: '16px' }}>
                {images.map((image) => (
                  <SortableImageCard
                    key={image.id}
                    image={image}
                    onRemove={() => onRemoveImage(image.id)}
                    onRegenerate={() => regenerateImage(image.id)}
                    onCrop={handleCrop(image.id)}
                    globalSettings={settings}
                    onUpdateSettings={onUpdateImageSettings}
                    onApplyToAll={onApplyToAll}
                    onUpdateFileName={onUpdateFileName}
                  />
                ))}

                {/* Add more images - fills remaining columns with full height */}
                {onFilesSelected && (
                  <div style={dropZoneStyle} className="h-full">
                    <ImageUpload
                      onFilesSelected={onFilesSelected}
                      minimal={false}
                    />
                  </div>
                )}
              </div>
            </SortableContext>
          </DndContext>
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

      {/* Batch download */}
      <DownloadAll images={images} onBulkRename={onBulkRename} />
    </div>
  );
}
