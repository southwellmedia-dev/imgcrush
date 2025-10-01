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

// Static styles extracted outside component to prevent re-creation on every render
const MODAL_STYLES = {
  header: {
    backgroundColor: 'var(--color-bg-elevated)',
  },
  body: {
    backgroundColor: 'var(--color-bg-elevated)',
    maxHeight: '70vh',
    overflowY: 'auto' as const,
  },
};

const BUTTON_STYLES = {
  borderRadius: '10px',
  fontWeight: 600,
  height: '44px',
};

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
      styles={MODAL_STYLES}
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
          className="elevation-md btn-primary-hover"
          style={BUTTON_STYLES}
        >
          Apply Settings & Regenerate All
        </Button>
      </Stack>
    </Modal>
  );
}
