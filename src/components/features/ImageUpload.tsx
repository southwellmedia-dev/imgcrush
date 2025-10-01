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
      // Validation constants
      const MAX_FILE_SIZE = 75 * 1024 * 1024; // 75MB per file
      const MAX_TOTAL_SIZE = 500 * 1024 * 1024; // 500MB total
      const MAX_FILE_COUNT = 100; // Maximum 100 files
      const MAX_FILENAME_LENGTH = 255;

      // File count validation
      if (files.length > MAX_FILE_COUNT) {
        notifications.show({
          title: 'Too many files',
          message: `Maximum ${MAX_FILE_COUNT} files allowed. Please select fewer files.`,
          color: 'red',
        });
        return;
      }

      // Filter for image files (including HEIC)
      const imageFiles = files.filter((file) =>
        file.type.startsWith("image/") ||
        file.name.toLowerCase().endsWith('.heic') ||
        file.name.toLowerCase().endsWith('.heif')
      );

      if (imageFiles.length === 0) {
        notifications.show({
          title: 'No valid images',
          message: 'Please select valid image files (JPG, PNG, WebP, HEIC, AVIF, etc.)',
          color: 'yellow',
        });
        return;
      }

      // Validate individual file sizes and filenames
      const invalidFiles = [];
      const invalidFilenames = [];
      let totalSize = 0;

      for (const file of imageFiles) {
        // File size validation
        if (file.size > MAX_FILE_SIZE) {
          invalidFiles.push(`${file.name} (${Math.round(file.size / 1024 / 1024)}MB)`);
        }

        // Filename length validation
        if (file.name.length > MAX_FILENAME_LENGTH) {
          invalidFilenames.push(file.name.substring(0, 50) + '...');
        }

        totalSize += file.size;
      }

      // Show errors for invalid files
      if (invalidFiles.length > 0) {
        notifications.show({
          title: 'Files too large',
          message: `Maximum 75MB per file. Invalid: ${invalidFiles.join(', ')}`,
          color: 'red',
        });
        return;
      }

      if (invalidFilenames.length > 0) {
        notifications.show({
          title: 'Filenames too long',
          message: `Maximum 255 characters per filename. Please rename: ${invalidFilenames.join(', ')}`,
          color: 'red',
        });
        return;
      }

      // Total size validation
      if (totalSize > MAX_TOTAL_SIZE) {
        notifications.show({
          title: 'Total size too large',
          message: `Maximum 500MB total. Current: ${Math.round(totalSize / 1024 / 1024)}MB. Please select fewer files.`,
          color: 'red',
        });
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
      <div className="w-full max-w-4xl mx-auto animate-fade-in">
        <Stack gap="xl">
          {/* Logo */}
          <div className="text-center animate-scale-in">
            <img
              src={isDark ? '/logo-darkmode.svg' : '/logo.svg'}
              alt="ImgCrush"
              style={{ height: '90px', margin: '0 auto' }}
            />
          </div>

          {/* Drop Zone - Enhanced */}
          <label
            htmlFor="file-input"
            className={`block border-2 border-dashed p-16 transition-all duration-300 cursor-pointer elevation-lg hover-lift ${
              isDragging ? 'animate-pulse-glow' : ''
            }`}
            style={{
              borderColor: isDragging ? 'var(--color-dropzone-active-border)' : 'var(--color-dropzone-border)',
              backgroundColor: isDragging ? 'var(--color-dropzone-active-bg)' : 'var(--color-dropzone-bg)',
              borderRadius: '16px',
              borderWidth: '3px',
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

            <Upload
              className="w-14 h-14 mx-auto mb-4 transition-transform duration-300"
              style={{
                color: isDragging ? 'var(--color-primary)' : 'var(--color-text-tertiary)',
                transform: isDragging ? 'scale(1.1)' : 'scale(1)'
              }}
            />
            <p
              className="text-center mb-2 font-semibold text-xl"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Drop images here or click to browse
            </p>
            <p className="text-center text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              JPG, PNG, WebP, HEIC, AVIF • Multiple files • Ctrl+V to paste
            </p>
          </label>

          {/* Preset Selector - Glassmorphic */}
          <div className="glass-strong elevation-md" style={{ padding: '24px', borderRadius: '16px' }}>
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
          </div>

          {/* Feature Badges - Enhanced */}
          <div className="flex items-center justify-center gap-10 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
            <div className="flex items-center gap-2 animate-fade-in animate-delay-100">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-success)', opacity: 0.2 }}>
                <svg className="w-4 h-4" style={{ color: 'var(--color-success)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-medium">100% Private</span>
            </div>
            <div className="flex items-center gap-2 animate-fade-in animate-delay-200">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-warning)', opacity: 0.2 }}>
                <svg className="w-4 h-4" style={{ color: 'var(--color-warning)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-medium">Instant Processing</span>
            </div>
            <div className="flex items-center gap-2 animate-fade-in animate-delay-300">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.2 }}>
                <svg className="w-4 h-4" style={{ color: 'var(--color-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="font-medium">No Upload</span>
            </div>
          </div>
        </Stack>
      </div>
    );
  }

  // Compact version for results page
  return (
    <div className="glass elevation-md hover-lift p-4 h-full flex flex-col transition-smooth" style={{ borderRadius: '12px' }}>
      <div
        className="border-2 border-dashed p-8 text-center transition-all duration-300 flex-1 flex flex-col items-center justify-center"
        style={{
          borderColor: isDragging ? 'var(--color-dropzone-active-border)' : 'var(--color-dropzone-border)',
          backgroundColor: isDragging ? 'var(--color-dropzone-active-bg)' : 'var(--color-dropzone-bg)',
          borderRadius: '12px',
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <FileImage
          className="w-10 h-10 mx-auto mb-3 transition-transform duration-300"
          style={{
            color: isDragging ? 'var(--color-primary)' : 'var(--color-text-muted)',
            transform: isDragging ? 'scale(1.1)' : 'scale(1)'
          }}
        />
        <p className="mb-1 font-medium" style={{ color: 'var(--color-text-primary)' }}>
          Drop more images here
        </p>

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          id="file-input-compact"
        />

        <div className="flex gap-2 justify-center mt-4">
          <label
            htmlFor="file-input-compact"
            className="inline-flex items-center px-5 py-2.5 text-white text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer elevation-sm hover:elevation-md"
            style={{
              backgroundColor: 'var(--color-primary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Add Files
          </label>

          {clipboardSupported && (
            <button
              onClick={handlePasteFromClipboard}
              className="inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 elevation-sm hover:elevation-md"
              style={{
                backgroundColor: 'var(--color-bg-elevated)',
                borderWidth: '1px',
                borderColor: 'var(--color-border-primary)',
                color: 'var(--color-text-primary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-hover-bg)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-elevated)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Clipboard className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}