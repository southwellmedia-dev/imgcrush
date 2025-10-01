import React, { useState, useEffect } from 'react';
import { Modal, Button, Stack } from '@mantine/core';
import { ProcessingControls } from '../features/ProcessingControls';
import { ProcessingSettings } from '../../types';

interface GlobalSettingsModalProps {
  opened: boolean;
  onClose: () => void;
  settings: ProcessingSettings;
  onSettingsChange: (settings: ProcessingSettings) => void;
  selectedPreset?: string;
  onPresetChange?: (presetId: string) => void;
  onRegenerateAll?: () => void;
}

export function GlobalSettingsModal({
  opened,
  onClose,
  settings,
  onSettingsChange,
  selectedPreset,
  onPresetChange,
  onRegenerateAll,
}: GlobalSettingsModalProps) {
  const [localSettings, setLocalSettings] = useState(settings);

  // Sync local state when modal opens or when settings prop changes
  useEffect(() => {
    if (opened) {
      setLocalSettings(settings);
    }
  }, [opened, settings]);

  const handleSave = () => {
    onSettingsChange(localSettings);
    if (onRegenerateAll) {
      onRegenerateAll();
    }
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Global Processing Settings"
      size="xl"
      centered
      styles={{
        header: {
          backgroundColor: 'var(--color-bg-elevated)',
        },
        body: {
          backgroundColor: 'var(--color-bg-elevated)',
          maxHeight: '70vh',
          overflowY: 'auto',
        },
      }}
    >
      <Stack gap="lg">
        <ProcessingControls
          settings={localSettings}
          onSettingsChange={setLocalSettings}
          onClear={() => {}}
          selectedPreset={selectedPreset}
          onPresetChange={onPresetChange}
          onRegenerateAll={onRegenerateAll}
          isModal={true}
        />

        <Button
          variant="filled"
          size="md"
          fullWidth
          onClick={handleSave}
          className="elevation-md transition-smooth"
          style={{
            backgroundColor: 'var(--color-primary)',
            borderRadius: '10px',
            fontWeight: 600,
            height: '44px',
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
          Apply Settings & Regenerate All
        </Button>
      </Stack>
    </Modal>
  );
}
