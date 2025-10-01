import React, { useState, useCallback, useEffect } from "react";
import { ImageUpload } from "./components/features/ImageUpload";
import { ImageProcessor } from "./components/features/ImageProcessor";
import { Sidebar } from "./components/ui/Sidebar";
import { ResultsAreaHeader } from "./components/ui/ResultsAreaHeader";
import { BulkRenameCallout } from "./components/ui/BulkRenameCallout";
import { BulkRenameModal } from "./components/features/BulkRenameModal";
import { AddImagesModal } from "./components/modals/AddImagesModal";
import { GlobalSettingsModal } from "./components/modals/GlobalSettingsModal";
import { ViewMode } from "./components/ui/ResultsHeader";
import { ProcessedImage, ProcessingSettings } from "./types";
import { applyPreset } from "./presets/compressionPresets";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { notifications } from "@mantine/notifications";
// Lazy-load JSZip to reduce initial bundle size
const loadJSZip = () => import('jszip');
import {
  loadSelectedPreset,
  loadProcessingSettings,
  loadViewMode,
  saveSelectedPreset,
  saveProcessingSettings,
  saveViewMode,
  DEFAULT_PROCESSING_SETTINGS,
} from "./utils/settingsStorage";

function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>(
    () => loadSelectedPreset() || 'compression-only'
  );
  const [viewMode, setViewMode] = useState<ViewMode>(
    () => loadViewMode() || 'grid'
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [addImagesModalOpen, setAddImagesModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [bulkRenameModalOpen, setBulkRenameModalOpen] = useState(false);
  const [processingSettings, setProcessingSettings] = useState<ProcessingSettings>(
    () => loadProcessingSettings() || DEFAULT_PROCESSING_SETTINGS
  );

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setProcessedImages((prev) => [
      ...prev,
      ...newFiles.map((file) => ({
        id: crypto.randomUUID(),
        originalFile: file,
        originalSize: file.size,
        processedBlob: null,
        processedSize: 0,
        processing: false,
        processed: false,
        settings: { ...processingSettings }, // Attach current global settings to new images
      })),
    ]);
  }, [processingSettings]);

  const handleRemoveFile = useCallback(
    (id: string) => {
      setProcessedImages((prev) => prev.filter((img) => img.id !== id));
      setFiles((prev) => {
        const imageToRemove = processedImages.find((img) => img.id === id);
        if (imageToRemove) {
          return prev.filter((file) => file !== imageToRemove.originalFile);
        }
        return prev;
      });
    },
    [processedImages]
  );

  const handleClearAll = useCallback(() => {
    if (window.confirm('Remove all images and start over?')) {
      setFiles([]);
      setProcessedImages([]);
    }
  }, []);

  const handleReorderImages = useCallback((reorderedImages: ProcessedImage[]) => {
    setProcessedImages(reorderedImages);
  }, []);

  const handlePresetChange = useCallback((presetId: string) => {
    setSelectedPreset(presetId);

    // Apply preset settings
    const newSettings = applyPreset(presetId, processingSettings);
    setProcessingSettings(newSettings);

    // Reset all images to unprocessed state and update their settings to trigger reprocessing with new preset
    setProcessedImages((prev) =>
      prev.map((img) => ({
        ...img,
        settings: { ...newSettings }, // Update each image's settings
        processed: false,
        processing: false,
        processedBlob: null,
        processedSize: 0
      }))
    );
  }, [processingSettings]);

  const updateProcessedImage = useCallback(
    (id: string, update: Partial<ProcessedImage>) => {
      setProcessedImages((prev) =>
        prev.map((img) => (img.id === id ? { ...img, ...update } : img))
      );
    },
    []
  );

  const handleUpdateFileName = useCallback((imageId: string, fileName: string) => {
    setProcessedImages((prev) =>
      prev.map((img) => (img.id === imageId ? { ...img, customFileName: fileName } : img))
    );
  }, []);

  const handleBulkRename = useCallback((renamedFiles: Map<string, string>) => {
    setProcessedImages((prev) =>
      prev.map((img) => {
        const newFileName = renamedFiles.get(img.id);
        return newFileName ? { ...img, customFileName: newFileName } : img;
      })
    );

    notifications.show({
      title: 'Files Renamed',
      message: `Successfully renamed ${renamedFiles.size} ${renamedFiles.size === 1 ? 'file' : 'files'}`,
      color: 'green',
    });
  }, []);

  const regenerateAllImages = useCallback(() => {
    // Reset all images to unprocessed state to trigger reprocessing
    setProcessedImages((prev) =>
      prev.map((img) => ({
        ...img,
        processed: false,
        processing: false,
        processedBlob: null,
        processedSize: 0
      }))
    );
  }, []);

  const handleScrollToCustomize = useCallback(() => {
    const settingsElement = document.getElementById('settings-section');
    if (settingsElement) {
      settingsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleDownloadAll = useCallback(async () => {
    const processedImagesOnly = processedImages.filter(
      (img) => img.processed && img.processedBlob
    );

    if (processedImagesOnly.length === 0) {
      notifications.show({
        title: 'No images ready',
        message: 'Please wait for images to finish processing',
        color: 'yellow',
      });
      return;
    }

    try {
      // Lazy-load JSZip
      const JSZipModule = await loadJSZip();
      const JSZip = JSZipModule.default;
      const zip = new JSZip();
      const usedFilenames = new Set<string>();

      // Helper function to get correct file extension based on output format
      const getExtension = (outputFormat: string | undefined, originalName: string): string => {
        if (outputFormat) {
          // Map output format to extension
          const formatMap: Record<string, string> = {
            'jpeg': '.jpg',
            'jpg': '.jpg',
            'png': '.png',
            'webp': '.webp',
            'avif': '.avif',
          };
          return formatMap[outputFormat.toLowerCase()] || `.${outputFormat}`;
        }

        // Fallback to original extension
        const lastDot = originalName.lastIndexOf('.');
        return lastDot > 0 ? originalName.substring(lastDot) : '';
      };

      // Helper function to sanitize filename - removes path components and invalid characters
      const sanitizeFilename = (filename: string): string => {
        // Remove or replace path separators and traversal attempts
        let sanitized = filename
          .replace(/[\/\\]/g, '_')           // Replace path separators with underscore
          .replace(/\.\./g, '_')             // Replace .. with underscore
          .trim();                           // Remove leading/trailing whitespace

        // Remove leading dots
        sanitized = sanitized.replace(/^\.+/, '');

        // Remove invalid filename characters (OS-specific but being conservative)
        // Keep: alphanumeric, spaces, hyphens, underscores, parentheses, periods
        sanitized = sanitized.replace(/[<>:"|?*\x00-\x1F]/g, '_');

        // Collapse multiple underscores/spaces
        sanitized = sanitized.replace(/_{2,}/g, '_').replace(/\s{2,}/g, ' ');

        // Final trim and fallback to safe default if empty
        sanitized = sanitized.trim();
        return sanitized || 'image';
      };

      // Helper function to generate unique filename (prevents silent overwrites)
      const getUniqueFilename = (baseName: string, extension: string): string => {
        let filename = `${baseName}${extension}`;
        let counter = 1;

        // If filename already used, append (1), (2), etc.
        while (usedFilenames.has(filename)) {
          filename = `${baseName} (${counter})${extension}`;
          counter++;
        }

        usedFilenames.add(filename);
        return filename;
      };

      processedImagesOnly.forEach((image) => {
        if (image.processedBlob) {
          const originalName = image.originalFile.name;

          // Extract base name from original (without extension)
          const lastDot = originalName.lastIndexOf('.');
          const baseName = lastDot > 0 ? originalName.substring(0, lastDot) : originalName;

          // Get correct extension based on output format (not original extension!)
          const extension = getExtension(image.outputFormat, originalName);

          // Sanitize the base filename (custom or compressed original)
          const rawBaseFileName = image.customFileName || `compressed_${baseName}`;
          const sanitizedBaseFileName = sanitizeFilename(rawBaseFileName);

          // Generate unique filename to prevent overwrites
          const uniqueFilename = getUniqueFilename(sanitizedBaseFileName, extension);

          zip.file(uniqueFilename, image.processedBlob);
        }
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `imgcrush_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      notifications.show({
        title: 'Download started',
        message: `Downloading ${processedImagesOnly.length} compressed images`,
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Download failed',
        message: 'Failed to create ZIP file',
        color: 'red',
      });
    }
  }, [processedImages]);

  const handleUpdateImageSettings = useCallback((imageId: string, settings: ProcessingSettings) => {
    setProcessedImages((prev) =>
      prev.map((img) =>
        img.id === imageId
          ? {
              ...img,
              settings,
              processed: false, // Trigger reprocessing
              processing: false,
              processedBlob: null,
              processedSize: 0
            }
          : img
      )
    );
  }, []);

  const handleApplySettingsToAll = useCallback((settings: ProcessingSettings) => {
    // Apply settings to all images and trigger reprocessing
    setProcessedImages((prev) =>
      prev.map((img) => ({
        ...img,
        settings: { ...settings },
        processed: false,
        processing: false,
        processedBlob: null,
        processedSize: 0
      }))
    );

    // Also update global settings
    setProcessingSettings(settings);
  }, []);

  // Keyboard shortcuts handlers
  const handlePasteShortcut = useCallback(async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      const imageFiles: File[] = [];

      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type);
            const file = new File([blob], `pasted-image-${Date.now()}.${type.split('/')[1]}`, { type });
            imageFiles.push(file);
          }
        }
      }

      if (imageFiles.length > 0) {
        handleFilesSelected(imageFiles);
        notifications.show({
          title: 'Images pasted',
          message: `Added ${imageFiles.length} image${imageFiles.length > 1 ? 's' : ''} from clipboard`,
          color: 'green',
        });
      } else {
        notifications.show({
          title: 'No images found',
          message: 'No images found in clipboard. Try copying an image first.',
          color: 'yellow',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Paste failed',
        message: 'Could not access clipboard. Please use drag & drop instead.',
        color: 'red',
      });
    }
  }, [handleFilesSelected]);

  const handleSaveShortcut = useCallback(() => {
    if (processedImages.length > 1) {
      notifications.show({
        title: 'Multiple Images Found',
        message: 'Use the "Download All as ZIP" button to save multiple images.',
        color: 'blue',
      });
      return;
    }

    const imageToSave = processedImages.find(img => img.processed && img.processedBlob);

    if (imageToSave && imageToSave.processedBlob) {
      const url = URL.createObjectURL(imageToSave.processedBlob);
      const link = document.createElement('a');
      link.href = url;

      // Get correct extension based on output format
      const getExtension = (format: string | undefined): string => {
        switch (format) {
          case 'jpeg': return '.jpg';
          case 'png': return '.png';
          case 'webp': return '.webp';
          case 'avif': return '.avif';
          default: {
            // Fallback to original extension
            const originalName = imageToSave.originalFile.name;
            const lastDotIndex = originalName.lastIndexOf('.');
            return lastDotIndex > 0 ? originalName.substring(lastDotIndex) : '.jpg';
          }
        }
      };

      const extension = getExtension(imageToSave.outputFormat);
      const baseName = imageToSave.originalFile.name.replace(/\.[^/.]+$/, '') || 'image';
      link.download = imageToSave.customFileName
        ? `${imageToSave.customFileName}${extension}`
        : `compressed_${baseName}${extension}`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      notifications.show({
        title: 'Download Started',
        message: `Downloading ${link.download}`,
        color: 'green',
      });
    } else {
      notifications.show({
        title: 'No Images Ready',
        message: 'Please wait for images to finish processing, or upload some images first.',
        color: 'yellow',
      });
    }
  }, [processedImages]);

  // Setup keyboard shortcuts
  useKeyboardShortcuts({
    onPaste: handlePasteShortcut,
    onSave: handleSaveShortcut,
  });

  // Persist settings to localStorage
  useEffect(() => {
    saveSelectedPreset(selectedPreset);
  }, [selectedPreset]);

  useEffect(() => {
    saveProcessingSettings(processingSettings);
  }, [processingSettings]);

  useEffect(() => {
    saveViewMode(viewMode);
  }, [viewMode]);

  const hasImages = processedImages.length > 0;

  return (
    <div className="min-h-screen bg-gradient-mesh-animated" style={{ display: 'flex' }}>
      {/* Sidebar Navigation - Always visible */}
      <Sidebar
        onReset={handleClearAll}
        hasImages={hasImages}
        onCollapsedChange={setSidebarCollapsed}
        onOpenSettings={() => setSettingsModalOpen(true)}
        onOpenBulkRename={() => setBulkRenameModalOpen(true)}
        onDownloadZip={handleDownloadAll}
        images={processedImages}
      />

      {/* Modals */}
      <AddImagesModal
        opened={addImagesModalOpen}
        onClose={() => setAddImagesModalOpen(false)}
        onFilesSelected={handleFilesSelected}
        selectedPreset={selectedPreset}
        onPresetChange={handlePresetChange}
        settings={processingSettings}
        onSettingsChange={setProcessingSettings}
      />

      <GlobalSettingsModal
        opened={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        settings={processingSettings}
        onSettingsChange={setProcessingSettings}
        selectedPreset={selectedPreset}
        onPresetChange={handlePresetChange}
        onRegenerateAll={regenerateAllImages}
      />

      <BulkRenameModal
        opened={bulkRenameModalOpen}
        onClose={() => setBulkRenameModalOpen(false)}
        images={processedImages.filter(img => img.processed)}
        onApply={handleBulkRename}
      />

      {/* Main Content Area - Responsive to sidebar state */}
      <main style={{
        marginLeft: sidebarCollapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width)',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        transition: 'margin-left 0.3s ease'
      }}>
        {!hasImages ? (
          <>
            {/* Initial centered upload state - Full width */}
            <div className="container mx-auto px-8" style={{ maxWidth: '1400px', flex: 1 }}>
              <div className="flex flex-col items-center justify-center" style={{ minHeight: 'calc(100vh - 120px)', paddingTop: '48px', paddingBottom: '48px' }}>
                <ImageUpload
                  onFilesSelected={handleFilesSelected}
                  minimal={true}
                  selectedPreset={selectedPreset}
                  onPresetChange={handlePresetChange}
                  settings={processingSettings}
                  onSettingsChange={setProcessingSettings}
                />
              </div>
            </div>
          </>
        ) : (
          // Processing view with images - With sidebar
          <div className="container mx-auto px-8 py-8" style={{ maxWidth: '1600px', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Results Area Header */}
              <ResultsAreaHeader
                images={processedImages}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onDownloadAll={handleDownloadAll}
                onAddImages={() => setAddImagesModalOpen(true)}
                selectedPreset={selectedPreset}
                onOpenSettings={() => setSettingsModalOpen(true)}
              />

              {/* Bulk Rename Callout Banner */}
              <BulkRenameCallout
                imageCount={processedImages.length}
                onOpenRename={() => setBulkRenameModalOpen(true)}
              />

              <ImageProcessor
                images={processedImages}
                settings={processingSettings}
                onRemoveImage={handleRemoveFile}
                onUpdateImage={updateProcessedImage}
                onCustomize={handleScrollToCustomize}
                onUpdateImageSettings={handleUpdateImageSettings}
                onApplyToAll={handleApplySettingsToAll}
                onClearAll={handleClearAll}
                onReorderImages={handleReorderImages}
                onUpdateFileName={handleUpdateFileName}
                onBulkRename={handleBulkRename}
                viewMode={viewMode}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
