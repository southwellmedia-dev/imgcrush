import React, { useState, useCallback } from "react";
import { ImageUpload } from "./components/features/ImageUpload";
import { ImageProcessor } from "./components/features/ImageProcessor";
import { ProcessingControls } from "./components/features/ProcessingControls";
import { ResultsHeader } from "./components/ui/ResultsHeader";
import { Footer } from "./components/ui/Footer";
import { ProcessedImage } from "./types";
import { applyPreset } from "./presets/compressionPresets";

function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>('compression-only');
  const [processingSettings, setProcessingSettings] = useState({
    quality: 0.80,
    maxWidth: 99999,
    maxHeight: 99999,
    format: "jpeg" as "jpeg" | "png" | "webp",
    resizeMode: "percentage" as "max-dimensions" | "exact" | "percentage",
    percentage: 100,
    exactWidth: 800,
    exactHeight: 600,
  });

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setProcessedImages((prev) => [
      ...prev,
      ...newFiles.map((file) => ({
        id: Math.random().toString(36),
        originalFile: file,
        originalSize: file.size,
        processedBlob: null,
        processedSize: 0,
        processing: false,
        processed: false,
      })),
    ]);
  }, []);

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
    setFiles([]);
    setProcessedImages([]);
  }, []);

  const handlePresetChange = useCallback((presetId: string) => {
    setSelectedPreset(presetId);

    // Apply preset settings
    const newSettings = applyPreset(presetId, processingSettings);
    setProcessingSettings(newSettings);

    // Reset all images to unprocessed state to trigger reprocessing with new preset
    setProcessedImages((prev) =>
      prev.map((img) => ({
        ...img,
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

  const hasImages = processedImages.length > 0;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1">
        {!hasImages ? (
          <>
            {/* Initial centered upload state */}
            <div className="container mx-auto px-4">
              <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] py-12">
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
          // Processing view with images
          <>
            <ResultsHeader onReset={handleClearAll} />
            <div className="container mx-auto px-4 py-8">
              <div className="max-w-7xl mx-auto space-y-8">
                <ImageProcessor
                  images={processedImages}
                  settings={processingSettings}
                  onRemoveImage={handleRemoveFile}
                  onUpdateImage={updateProcessedImage}
                  onFilesSelected={handleFilesSelected}
                  onCustomize={handleScrollToCustomize}
                />

                <div id="settings-section" className="pt-8 border-t border-gray-200">
                  <ProcessingControls
                    settings={processingSettings}
                    onSettingsChange={setProcessingSettings}
                    onClear={handleClearAll}
                    selectedPreset={selectedPreset}
                    onPresetChange={handlePresetChange}
                    onRegenerateAll={regenerateAllImages}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
