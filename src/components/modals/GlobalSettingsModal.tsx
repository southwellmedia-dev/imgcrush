import React, { useState, useEffect } from 'react';
import { Modal, Button, Stack, Group, Text } from '@mantine/core';
import { Settings2 } from 'lucide-react';
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
    borderBottom: '1px solid var(--color-border-primary)',
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
      title={
        <Group gap="xs">
          <Settings2 size={20} />
          <Text fw={700} style={{ color: 'var(--color-text-primary)' }}>
            Global Processing Settings
          </Text>
        </Group>
      }
      size="xl"
      centered
      styles={MODAL_STYLES}
      classNames={{
        content: 'glass-strong elevation-xl'
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
          className="elevation-md btn-primary-hover"
          style={BUTTON_STYLES}
        >
          Apply Settings & Regenerate All
        </Button>
      </Stack>
    </Modal>
  );
}
