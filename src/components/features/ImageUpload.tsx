import React, { useCallback, useState, useEffect } from "react";
import { Upload, FileImage, Clipboard } from "lucide-react";
import { SegmentedControl, Text, Paper, Slider, Select, Stack, Group } from '@mantine/core';
import { ProcessingSettings } from '../../types';
import { PresetSelector } from './PresetSelector';
import { getPresetById, applyPreset } from '../../presets/compressionPresets';

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

  useEffect(() => {
    // Check if clipboard API is available
    setClipboardSupported(
      typeof navigator !== 'undefined' &&
      'clipboard' in navigator &&
      'read' in navigator.clipboard
    );
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/")
      );

      if (files.length > 0) {
        onFilesSelected(files);
      }
    },
    [onFilesSelected]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        onFilesSelected(files);
      }
      e.target.value = "";
    },
    [onFilesSelected]
  );

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
        onFilesSelected(imageFiles);
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err);
      // Try fallback paste event method
      handlePasteEvent();
    }
  }, [onFilesSelected]);

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
        onFilesSelected(imageFiles);
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [onFilesSelected]);

  useEffect(() => {
    // Set up paste event listener
    const cleanup = handlePasteEvent();
    return cleanup;
  }, [handlePasteEvent]);

  const updateSetting = <K extends keyof ProcessingSettings>(
    key: K,
    value: ProcessingSettings[K]
  ) => {
    if (settings && onSettingsChange) {
      onSettingsChange({ ...settings, [key]: value });
    }
  };

  if (minimal) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <Stack gap="lg">
          {/* Logo */}
          <div className="text-center">
            <img
              src="/logo.svg"
              alt="ImgCrush"
              style={{ height: '80px', margin: '0 auto' }}
            />
          </div>

          {/* Drop Zone */}
          <label
            htmlFor="file-input"
            className={`block border-2 border-dashed rounded-xl p-12 transition-all duration-200 cursor-pointer ${
              isDragging
                ? "border-red-500 bg-red-50"
                : "border-gray-300 hover:border-red-400 bg-gray-50 hover:bg-gray-100/50"
            }`}
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

            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-700 text-center mb-1">Drop images here or click to browse</p>
            <p className="text-gray-500 text-sm text-center">
              JPG, PNG, WebP • Multiple files • Ctrl+V to paste
            </p>
          </label>

          {/* Preset Selector */}
          <Paper p="lg" radius="md" withBorder>
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

          <div className="flex items-center justify-center gap-8 text-xs text-gray-500">
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
    <div className="bg-white border border-gray-200 rounded-lg p-4 h-full flex flex-col">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 flex-1 flex flex-col items-center justify-center ${
          isDragging
            ? "border-red-500 bg-red-50"
            : "border-gray-300 hover:border-red-400 bg-gray-50"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <FileImage className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-700 mb-1">Drop more images here</p>

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
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
            >
              <Clipboard className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}