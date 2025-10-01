import React from 'react';
import { Modal } from '@mantine/core';
import { ImageUpload } from '../features/ImageUpload';
import { ProcessingSettings } from '../../types';

interface AddImagesModalProps {
  opened: boolean;
  onClose: () => void;
  onFilesSelected: (files: File[]) => void;
  selectedPreset?: string;
  onPresetChange?: (presetId: string) => void;
  settings?: ProcessingSettings;
  onSettingsChange?: (settings: ProcessingSettings) => void;
}

export function AddImagesModal({
  opened,
  onClose,
  onFilesSelected,
  selectedPreset,
  onPresetChange,
  settings,
  onSettingsChange,
}: AddImagesModalProps) {
  const handleFilesSelected = (files: File[]) => {
    onFilesSelected(files);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Add More Images"
      size="lg"
      centered
      styles={{
        header: {
          backgroundColor: 'var(--color-bg-elevated)',
        },
        body: {
          backgroundColor: 'var(--color-bg-elevated)',
        },
      }}
    >
      <ImageUpload
        onFilesSelected={handleFilesSelected}
        minimal={false}
      />
    </Modal>
  );
}
