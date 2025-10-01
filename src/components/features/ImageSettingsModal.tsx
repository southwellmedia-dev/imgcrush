import React, { useState, useEffect } from 'react';
import { Modal, Stack, Select, Slider, NumberInput, Button, Group, Text, Paper, Grid, Badge, ActionIcon, Tooltip, Divider } from '@mantine/core';
import { Settings2, Lock, Unlock, Save, X } from 'lucide-react';
import { ProcessedImage, ProcessingSettings } from '../../types';
import { COMPRESSION_PRESETS, getPresetById, applyPreset } from '../../presets/compressionPresets';

// Static styles for consistent theming
const MODAL_STYLES = {
  header: {
    backgroundColor: 'var(--color-bg-elevated)',
    borderBottom: '1px solid var(--color-border-primary)',
  },
  body: {
    backgroundColor: 'var(--color-bg-elevated)',
  },
};

const SUMMARY_PAPER_STYLES = {
  padding: '20px',
  borderRadius: '12px',
  border: '1px solid var(--color-border-primary)',
  background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.08) 0%, rgba(220, 38, 38, 0.04) 100%)',
};

const BUTTON_STYLES = {
  borderRadius: '10px',
  fontWeight: 600,
  height: '44px',
};

interface ImageSettingsModalProps {
  opened: boolean;
  onClose: () => void;
  image: ProcessedImage;
  globalSettings: ProcessingSettings;
  onSave: (imageId: string, settings: ProcessingSettings) => void;
  onApplyToAll?: (settings: ProcessingSettings) => void;
}

export function ImageSettingsModal({
  opened,
  onClose,
  image,
  globalSettings,
  onSave,
  onApplyToAll
}: ImageSettingsModalProps) {
  // Use image's settings if available, otherwise use global
  const initialSettings = image.settings || globalSettings;
  const [settings, setSettings] = useState<ProcessingSettings>(initialSettings);
  const [selectedPreset, setSelectedPreset] = useState<string>('custom');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(16 / 9);

  // Reset settings when modal opens or image changes
  useEffect(() => {
    if (opened) {
      const currentSettings = image.settings || globalSettings;
      setSettings(currentSettings);

      // Try to detect which preset is active
      const matchingPreset = COMPRESSION_PRESETS.find(preset => {
        const presetSettings = preset.settings;
        return (
          presetSettings.quality === currentSettings.quality &&
          presetSettings.format === currentSettings.format &&
          presetSettings.resizeMode === currentSettings.resizeMode
        );
      });
      setSelectedPreset(matchingPreset?.id || 'custom');
    }
  }, [opened, image, globalSettings]);

  // Calculate aspect ratio from exact dimensions
  useEffect(() => {
    if (settings.resizeMode === 'exact' && settings.exactWidth > 0 && settings.exactHeight > 0) {
      setAspectRatio(settings.exactWidth / settings.exactHeight);
    }
  }, [settings.resizeMode, settings.exactWidth, settings.exactHeight]);

  const updateSetting = <K extends keyof ProcessingSettings>(
    key: K,
    value: ProcessingSettings[K]
  ) => {
    let updatedSettings = { ...settings, [key]: value };

    // Handle aspect ratio maintenance for exact dimensions
    if (maintainAspectRatio && settings.resizeMode === 'exact') {
      if (key === 'exactWidth' && typeof value === 'number' && value > 0) {
        updatedSettings.exactHeight = Math.round(value / aspectRatio);
      } else if (key === 'exactHeight' && typeof value === 'number' && value > 0) {
        updatedSettings.exactWidth = Math.round(value * aspectRatio);
      }
    }

    setSettings(updatedSettings);
    // Switch to custom preset when manually changing settings
    if (selectedPreset !== 'custom') {
      setSelectedPreset('custom');
    }
  };

  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId);
    const newSettings = applyPreset(presetId, settings);
    setSettings(newSettings);
    setShowAdvanced(presetId === 'custom');
  };

  const handleSave = () => {
    onSave(image.id, settings);
    onClose();
  };

  const handleApplyToAll = () => {
    if (onApplyToAll) {
      onApplyToAll(settings);
      onClose();
    }
  };

  const currentPreset = getPresetById(selectedPreset);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <Settings2 size={20} />
          <Text fw={700} style={{ color: 'var(--color-text-primary)' }}>
            Settings: {image.customFileName || image.originalFile.name}
          </Text>
        </Group>
      }
      size="lg"
      centered
      styles={MODAL_STYLES}
      classNames={{
        content: 'glass-strong elevation-xl'
      }}
    >
      <Stack gap="lg">
        {/* Current Settings Summary */}
        <Paper className="elevation-md" style={SUMMARY_PAPER_STYLES}>
          <Stack gap="sm">
            <Group gap="xs">
              <Text size="sm" fw={700} style={{ color: 'var(--color-text-primary)' }}>
                {currentPreset?.icon} {currentPreset?.name}
              </Text>
              <Badge variant="light" color="red" size="sm" className="badge-primary-subtle">
                Active
              </Badge>
            </Group>
            {currentPreset?.description && (
              <Text size="xs" style={{ color: 'var(--color-text-tertiary)' }}>
                {currentPreset.description}
              </Text>
            )}
            {/* Settings Summary */}
            <Group gap="lg" wrap="wrap" mt="xs">
              <Group gap={4}>
                <Text size="xs" style={{ color: 'var(--color-text-secondary)' }} fw={500}>Format:</Text>
                <Badge variant="dot" color="gray" size="sm" className="badge-gray-subtle">{settings.format.toUpperCase()}</Badge>
              </Group>
              <Group gap={4}>
                <Text size="xs" style={{ color: 'var(--color-text-secondary)' }} fw={500}>Quality:</Text>
                <Badge variant="dot" color="gray" size="sm" className="badge-gray-subtle">{Math.round(settings.quality * 100)}%</Badge>
              </Group>
              <Group gap={4}>
                <Text size="xs" style={{ color: 'var(--color-text-secondary)' }} fw={500}>Resize:</Text>
                <Badge variant="dot" color="gray" size="sm" className="badge-gray-subtle">
                  {settings.resizeMode === 'percentage'
                    ? settings.percentage === 100 ? 'No resize' : `${settings.percentage}% scale`
                    : settings.resizeMode === 'max-dimensions' && (settings.maxWidth >= 99999 || settings.maxHeight >= 99999)
                    ? 'No resize'
                    : settings.resizeMode === 'max-dimensions'
                    ? `Max ${settings.maxWidth}×${settings.maxHeight}px`
                    : `Exact ${settings.exactWidth}×${settings.exactHeight}px`}
                </Badge>
              </Group>
            </Group>
          </Stack>
        </Paper>

        {/* Preset Selector */}
        <Select
          label="Preset"
          size="sm"
          value={selectedPreset}
          onChange={(value) => value && handlePresetChange(value)}
          data={COMPRESSION_PRESETS.map(preset => ({
            value: preset.id,
            label: `${preset.icon} ${preset.name}`
          }))}
        />

        {/* Advanced Settings Toggle */}
        {selectedPreset === 'custom' && (
          <Button
            variant="subtle"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
          </Button>
        )}

        {/* Advanced Settings */}
        {showAdvanced && selectedPreset === 'custom' && (
          <>
            <Divider />
            <Grid>
              {/* Quality Controls */}
              <Grid.Col span={12}>
                <Stack gap="xs">
                  <Text size="xs" fw={500} c="gray.7">
                    Quality: {Math.round(settings.quality * 100)}%
                  </Text>
                  <Slider
                    value={settings.quality}
                    onChange={(value) => updateSetting('quality', value)}
                    min={0.1}
                    max={1}
                    step={0.05}
                    marks={[
                      { value: 0.3, label: '30%' },
                      { value: 0.6, label: '60%' },
                      { value: 0.9, label: '90%' },
                    ]}
                  />
                </Stack>
              </Grid.Col>

              {/* Format Selector */}
              <Grid.Col span={6}>
                <Select
                  label="Format"
                  size="xs"
                  value={settings.format}
                  onChange={(value) => {
                    if (value === 'jpeg' || value === 'png' || value === 'webp' || value === 'avif') {
                      updateSetting('format', value);
                    }
                  }}
                  data={[
                    { value: 'jpeg', label: 'JPEG' },
                    { value: 'png', label: 'PNG' },
                    { value: 'webp', label: 'WebP' },
                    { value: 'avif', label: 'AVIF' },
                  ]}
                />
              </Grid.Col>

              {/* Resize Mode */}
              <Grid.Col span={6}>
                <Select
                  label="Resize Mode"
                  size="xs"
                  value={settings.resizeMode}
                  onChange={(value) => {
                    if (value === 'percentage' || value === 'max-dimensions' || value === 'exact') {
                      updateSetting('resizeMode', value);
                    }
                  }}
                  data={[
                    { value: 'percentage', label: 'Scale (%)' },
                    { value: 'max-dimensions', label: 'Fit to Size' },
                    { value: 'exact', label: 'Exact Dimensions' },
                  ]}
                />
              </Grid.Col>
            </Grid>

            {/* Resize Options Based on Mode */}
            <Stack gap="sm">
              {settings.resizeMode === 'percentage' && (
                <Stack gap="xs">
                  <Text size="xs" fw={500}>
                    Scale: {settings.percentage}%
                  </Text>
                  <Slider
                    value={settings.percentage}
                    onChange={(value) => updateSetting('percentage', value)}
                    min={10}
                    max={100}
                    step={5}
                    marks={[
                      { value: 25, label: '25%' },
                      { value: 50, label: '50%' },
                      { value: 75, label: '75%' },
                      { value: 100, label: '100%' },
                    ]}
                  />
                </Stack>
              )}

              {settings.resizeMode === 'max-dimensions' && (
                <Group grow>
                  <NumberInput
                    label="Max Width"
                    size="xs"
                    value={settings.maxWidth === 99999 ? '' : settings.maxWidth}
                    onChange={(value) => updateSetting('maxWidth', Number(value) || 99999)}
                    min={1}
                    max={99999}
                    placeholder="No limit"
                  />
                  <NumberInput
                    label="Max Height"
                    size="xs"
                    value={settings.maxHeight === 99999 ? '' : settings.maxHeight}
                    onChange={(value) => updateSetting('maxHeight', Number(value) || 99999)}
                    min={1}
                    max={99999}
                    placeholder="No limit"
                  />
                </Group>
              )}

              {settings.resizeMode === 'exact' && (
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text size="xs" fw={500} c="gray.7">Exact Dimensions</Text>
                    <Group gap="xs">
                      <Tooltip label={maintainAspectRatio ? "Aspect ratio locked" : "Aspect ratio unlocked"}>
                        <ActionIcon
                          size="sm"
                          variant={maintainAspectRatio ? "filled" : "light"}
                          onClick={() => {
                            setMaintainAspectRatio(!maintainAspectRatio);
                            if (!maintainAspectRatio && settings.exactWidth > 0 && settings.exactHeight > 0) {
                              setAspectRatio(settings.exactWidth / settings.exactHeight);
                            }
                          }}
                        >
                          {maintainAspectRatio ? <Lock size={14} /> : <Unlock size={14} />}
                        </ActionIcon>
                      </Tooltip>
                      <Text size="xs" c="dimmed">
                        {maintainAspectRatio ? 'Locked' : 'Free'}
                      </Text>
                    </Group>
                  </Group>
                  <Group grow>
                    <NumberInput
                      label="Width"
                      size="xs"
                      value={settings.exactWidth}
                      onChange={(value) => updateSetting('exactWidth', Number(value) || 800)}
                      min={1}
                      max={10000}
                    />
                    <NumberInput
                      label="Height"
                      size="xs"
                      value={settings.exactHeight}
                      onChange={(value) => updateSetting('exactHeight', Number(value) || 600)}
                      min={1}
                      max={10000}
                      disabled={maintainAspectRatio}
                    />
                  </Group>
                </Stack>
              )}
            </Stack>
          </>
        )}

        <Divider />

        {/* Action Buttons */}
        <Group justify="space-between" mt="md">
          <Button
            variant="light"
            color="gray"
            leftSection={<X size={18} />}
            onClick={onClose}
            className="transition-smooth"
            style={{ ...BUTTON_STYLES, minWidth: '120px' }}
          >
            Cancel
          </Button>
          <Group gap="xs">
            {onApplyToAll && (
              <Button
                variant="outline"
                color="red"
                onClick={handleApplyToAll}
                className="transition-smooth"
                style={{ ...BUTTON_STYLES, minWidth: '140px' }}
              >
                Apply to All
              </Button>
            )}
            <Button
              leftSection={<Save size={18} />}
              onClick={handleSave}
              className="btn-primary-hover elevation-md"
              style={{ ...BUTTON_STYLES, minWidth: '120px' }}
            >
              Save
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
}
