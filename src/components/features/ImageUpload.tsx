import { useCallback, useState, useEffect } from "react";
import { Upload, FileImage, Clipboard } from "lucide-react";
import { Paper, Stack, useMantineColorScheme } from '@mantine/core';
import { ProcessingSettings } from '../../types';
import { PresetSelector } from './PresetSelector';
import { getPresetById, applyPreset } from '../../presets/compressionPresets';
import { convertHeicFiles } from '../../utils/heicConverter';
import { notifications } from '@mantine/notifications';

interface ImageUploadProps {
  onFilesSelected: (files: File[]) => void;
  minimal?: boolean;
  selectedPreset?: string;
  onPresetChange?: (presetId: string) => void;
  settings?: ProcessingSettings;
  onSettingsChange?: (settings: ProcessingSettings) => void;
}

export function ImageUpload({
  onFilesSelected,
  minimal = false,
  selectedPreset = 'compression-only',
  onPresetChange,
  settings,
  onSettingsChange
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [clipboardSupported, setClipboardSupported] = useState(false);
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark'; // Only for logo switching

  useEffect(() => {
    // Check if clipboard API is available
    setClipboardSupported(
      typeof navigator !== 'undefined' &&
      'clipboard' in navigator &&
      'read' in navigator.clipboard
    );
  }, []);

  // Wrapper to handle HEIC conversion before passing files
  const processAndSelectFiles = useCallback(
    async (files: File[]) => {
      // Filter for image files (including HEIC)
      const imageFiles = files.filter((file) =>
        file.type.startsWith("image/") ||
        file.name.toLowerCase().endsWith('.heic') ||
        file.name.toLowerCase().endsWith('.heif')
      );

      if (imageFiles.length === 0) {
        return;
      }

      // Convert HEIC files if any (protected)
      let convertedFiles: File[] = [];
      let conversionCount = 0;
      try {
        const result = await convertHeicFiles(imageFiles);
        convertedFiles = result.convertedFiles || [];
        conversionCount = result.conversionCount || 0;

        // Show notification if HEIC files were converted
        if (conversionCount > 0) {
          notifications.show({
            title: 'HEIC conversion complete',
            message: `Converted ${conversionCount} HEIC image${conversionCount > 1 ? 's' : ''} to JPEG`,
            color: 'green',
          });
        }

        if (convertedFiles.length > 0) {
          onFilesSelected(convertedFiles);
        }
      } catch (err) {
        // Conversion failed - log, notify user, and fall back to original files
        console.error('HEIC conversion failed:', err);
        try {
          notifications.show({
            title: 'HEIC conversion failed',
            message: 'Could not convert HEIC files. Uploading original files instead.',
            color: 'red',
          });
        } catch (notifyErr) {
          // ignore notification errors
          console.warn('Failed to show notification:', notifyErr);
        }

        // Fall back to original image files so user flow continues
        onFilesSelected(imageFiles);
      }
    },
    [onFilesSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      processAndSelectFiles(files);
    },
    [processAndSelectFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        processAndSelectFiles(files);
      }
      e.target.value = "";
    },
    [processAndSelectFiles]
  );

  const handlePasteEvent = useCallback(() => {
    // Listen for paste events as a fallback
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            imageFiles.push(file);
          }
        }
      }

      if (imageFiles.length > 0) {
        processAndSelectFiles(imageFiles);
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [processAndSelectFiles]);

  const handlePasteFromClipboard = useCallback(async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      const imageFiles: File[] = [];

      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type);
            const file = new File([blob], `clipboard-image-${Date.now()}.${type.split('/')[1]}`, { type });
            imageFiles.push(file);
          }
        }
      }

      if (imageFiles.length > 0) {
        processAndSelectFiles(imageFiles);
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err);
      // Try fallback paste event method
      handlePasteEvent();
    }
  }, [processAndSelectFiles, handlePasteEvent]);

  useEffect(() => {
    // Set up paste event listener
    const cleanup = handlePasteEvent();
    return cleanup;
  }, [handlePasteEvent]);

  // updateSetting is implemented in other components where needed

  if (minimal) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <Stack gap="lg">
          {/* Logo */}
          <div className="text-center">
            <img
              src={isDark ? '/logo-darkmode.svg' : '/logo.svg'}
              alt="ImgCrush"
              style={{ height: '80px', margin: '0 auto' }}
            />
          </div>

          {/* Drop Zone */}
          <label
            htmlFor="file-input"
            className="block border-2 border-dashed p-12 transition-all duration-200 cursor-pointer"
            style={{
              borderColor: isDragging ? 'var(--color-dropzone-active-border)' : 'var(--color-dropzone-border)',
              backgroundColor: isDragging ? 'var(--color-dropzone-active-bg)' : 'var(--color-dropzone-bg)',
              borderRadius: '8px',
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
              id="file-input"
            />

            <Upload className="w-10 h-10 text-muted mx-auto mb-3" />
            <p className="text-primary text-center mb-1">Drop images here or click to browse</p>
            <p className="text-tertiary text-sm text-center">
              JPG, PNG, WebP, HEIC, AVIF • Multiple files • Ctrl+V to paste
            </p>
          </label>

          {/* Preset Selector */}
          <Paper p="lg" radius="md" withBorder style={{ borderColor: 'var(--color-border-primary)' }}>
            <PresetSelector
              selectedPreset={selectedPreset}
              onPresetChange={(presetId) => {
                if (onPresetChange) {
                  onPresetChange(presetId);
                }
                // Apply preset to settings
                if (settings && onSettingsChange) {
                  const preset = getPresetById(presetId);
                  if (preset) {
                    const newSettings = applyPreset(presetId, settings);
                    onSettingsChange(newSettings);
                  }
                }
              }}
            />
          </Paper>

          <div className="flex items-center justify-center gap-8 text-xs text-tertiary">
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>100% Private</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Instant Processing</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>No Upload</span>
            </div>
          </div>
        </Stack>
      </div>
    );
  }

  // Original non-minimal version for when images are loaded
  return (
    <div className="bg-elevated border border-primary p-4 h-full flex flex-col" style={{ borderRadius: '8px', borderWidth: '1px', borderColor: 'var(--color-border-primary)' }}>
      <div
        className="border-2 border-dashed p-6 text-center transition-all duration-200 flex-1 flex flex-col items-center justify-center"
        style={{
          borderColor: isDragging ? 'var(--color-dropzone-active-border)' : 'var(--color-dropzone-border)',
          backgroundColor: isDragging ? 'var(--color-dropzone-active-bg)' : 'var(--color-dropzone-bg)',
          borderRadius: '8px',
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <FileImage className="w-8 h-8 text-muted mx-auto mb-2" />
        <p className="text-primary mb-1">Drop more images here</p>

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          id="file-input-compact"
        />

        <div className="flex gap-2 justify-center mt-3">
          <label
            htmlFor="file-input-compact"
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors cursor-pointer"
          >
            Add Files
          </label>

          {clipboardSupported && (
            <button
              onClick={handlePasteFromClipboard}
              className="inline-flex items-center px-4 py-2 bg-elevated border border-primary text-primary text-sm font-medium rounded-md transition-colors"
              style={{
                backgroundColor: 'var(--color-bg-elevated)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-hover-bg)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-elevated)'}
            >
              <Clipboard className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}