import React, { useState, useEffect } from 'react';
import { Settings, X, ChevronDown, RefreshCw, Lock, Unlock, ChevronUp } from 'lucide-react';
import { Slider, Select, NumberInput, Button, Group, Text, Stack, Paper, Grid, Badge, ActionIcon, Switch, Tooltip } from '@mantine/core';
import { ProcessingSettings } from '../../types';
import { COMPRESSION_PRESETS, getPresetById } from '../../presets/compressionPresets';

interface ProcessingControlsProps {
  settings: ProcessingSettings;
  onSettingsChange: (settings: ProcessingSettings) => void;
  onClear: () => void;
  selectedPreset?: string;
  onPresetChange?: (presetId: string) => void;
  onRegenerateAll?: () => void;
}

export function ProcessingControls({
  settings,
  onSettingsChange,
  onClear,
  selectedPreset = 'custom',
  onPresetChange,
  onRegenerateAll
}: ProcessingControlsProps) {
  const [collapsed, setCollapsed] = useState(true); // Start collapsed by default
  const [showAdvanced, setShowAdvanced] = useState(selectedPreset === 'custom');
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(16 / 9); // Default aspect ratio
  const [maxDimensionMode, setMaxDimensionMode] = useState<'width' | 'height' | 'both'>('width');

  // Auto-open advanced settings when custom preset is selected
  useEffect(() => {
    if (selectedPreset === 'custom') {
      setShowAdvanced(true);
    } else {
      setShowAdvanced(false);
    }
  }, [selectedPreset]);

  // Calculate initial aspect ratio from current dimensions
  useEffect(() => {
    if (settings.resizeMode === 'exact' && settings.exactWidth > 0 && settings.exactHeight > 0) {
      setAspectRatio(settings.exactWidth / settings.exactHeight);
    }
  }, [settings.resizeMode]);

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

    onSettingsChange(updatedSettings);
    // Switch to custom preset when manually changing settings
    if (selectedPreset !== 'custom' && onPresetChange) {
      onPresetChange('custom');
    }
  };

  const currentPreset = getPresetById(selectedPreset);
  const isCustomPreset = selectedPreset === 'custom';

  // Collapsed view - just summary
  if (collapsed) {
    return (
      <Stack gap="md" mb="xl">
        <Paper p="lg" withBorder radius="md" bg="gray.0" data-tour="global-settings">
          <Stack gap="sm">
            <Group justify="space-between" align="start">
              <div>
                <Group gap="xs" mb={4}>
                  <Settings size={18} />
                  <Text size="lg" fw={700}>
                    Global Settings
                  </Text>
                  <Badge variant="light" color="blue" size="sm">
                    All Images
                  </Badge>
                </Group>
                <Text size="xs" c="dimmed" mb="md">
                  These settings apply to all images by default. Customize individual images using the ⚙️ button on each card above.
                </Text>
                <Group gap="md">
                  <div>
                    <Text size="xs" c="dimmed" mb={2}>Preset</Text>
                    <Text size="sm" fw={600}>
                      {currentPreset?.icon} {currentPreset?.name}
                    </Text>
                  </div>
                  <div>
                    <Text size="xs" c="dimmed" mb={2}>Format</Text>
                    <Text size="sm" fw={600}>{settings.format.toUpperCase()}</Text>
                  </div>
                  <div>
                    <Text size="xs" c="dimmed" mb={2}>Quality</Text>
                    <Text size="sm" fw={600}>{Math.round(settings.quality * 100)}%</Text>
                  </div>
                  <div>
                    <Text size="xs" c="dimmed" mb={2}>Resize</Text>
                    <Text size="sm" fw={600}>
                      {settings.resizeMode === 'percentage'
                        ? settings.percentage === 100 ? 'None' : `${settings.percentage}%`
                        : settings.resizeMode === 'max-dimensions' && (settings.maxWidth >= 99999 || settings.maxHeight >= 99999)
                        ? 'None'
                        : settings.resizeMode === 'max-dimensions'
                        ? `${settings.maxWidth}×${settings.maxHeight}px`
                        : `${settings.exactWidth}×${settings.exactHeight}px`}
                    </Text>
                  </div>
                </Group>
              </div>
              <Group gap="xs">
                {onRegenerateAll && (
                  <Button
                    variant="light"
                    color="red"
                    size="sm"
                    leftSection={<RefreshCw size={14} />}
                    onClick={onRegenerateAll}
                  >
                    Regenerate All
                  </Button>
                )}
                <Button
                  variant="filled"
                  color="red"
                  size="sm"
                  leftSection={<ChevronDown size={16} />}
                  onClick={() => setCollapsed(false)}
                >
                  Customize Global
                </Button>
              </Group>
            </Group>
          </Stack>
        </Paper>
      </Stack>
    );
  }

  // Expanded view - full settings
  return (
    <Stack gap="md" mb="xl">
      <Paper p="lg" withBorder radius="md" bg="gray.0">
        <Stack gap="sm">
          <Group justify="space-between" align="start">
            <div>
              <Group gap="xs" mb={4}>
                <Settings size={18} />
                <Text size="lg" fw={700}>
                  Global Settings
                </Text>
                <Badge variant="light" color="blue" size="sm">
                  All Images
                </Badge>
              </Group>
              <Text size="xs" c="dimmed" mb="md">
                These settings apply to all images by default. Customize individual images using the ⚙️ button on each card above.
              </Text>
            </div>
            <Group gap="xs">
              {onRegenerateAll && (
                <Button
                  variant="light"
                  color="red"
                  size="sm"
                  leftSection={<RefreshCw size={14} />}
                  onClick={onRegenerateAll}
                >
                  Regenerate All
                </Button>
              )}
              <Button
                variant="filled"
                color="gray"
                size="sm"
                leftSection={<ChevronUp size={16} />}
                onClick={() => setCollapsed(true)}
              >
                Collapse
              </Button>
            </Group>
          </Group>
        </Stack>

        {/* Current Preset & Settings Display */}
        <Paper p="md" radius="md" withBorder bg="white" mb="md" mt="md">
          <Stack gap="sm">
            <Group justify="space-between" align="start">
              <div style={{ flex: 1 }}>
                <Group gap="xs" mb="xs">
                  <Text size="sm" fw={600} c="gray.8">
                    {currentPreset?.icon} {currentPreset?.name}
                  </Text>
                  <Badge variant="light" color="red" size="sm">
                    Active
                  </Badge>
                </Group>
                {currentPreset?.description && (
                  <Text size="xs" c="dimmed">
                    {currentPreset.description}
                  </Text>
                )}
              </div>
            </Group>

            {/* Settings Summary */}
            <Group gap="lg" wrap="wrap">
              <Group gap={4}>
                <Text size="xs" c="dimmed" fw={500}>Format:</Text>
                <Badge variant="dot" color="gray" size="sm">{settings.format.toUpperCase()}</Badge>
              </Group>
              <Group gap={4}>
                <Text size="xs" c="dimmed" fw={500}>Quality:</Text>
                <Badge variant="dot" color="gray" size="sm">{Math.round(settings.quality * 100)}%</Badge>
              </Group>
              <Group gap={4}>
                <Text size="xs" c="dimmed" fw={500}>Resize:</Text>
                <Badge variant="dot" color="gray" size="sm">
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
        <Stack gap="xs" mb="md">
          <Text size="xs" fw={500} c="gray.7">Change Preset:</Text>
          <Select
            size="sm"
            value={selectedPreset}
            onChange={(value) => value && onPresetChange?.(value)}
            data={COMPRESSION_PRESETS.map(preset => ({
              value: preset.id,
              label: `${preset.icon} ${preset.name}`
            }))}
          />
        </Stack>

        {/* Only show detailed controls for custom preset */}
        {isCustomPreset && (
          <>
            <Button
              variant="subtle"
              size="xs"
              leftSection={<ChevronDown size={14} style={{ transform: showAdvanced ? 'rotate(180deg)' : 'none' }} />}
              onClick={() => setShowAdvanced(!showAdvanced)}
              mt="md"
              mb="sm"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
            </Button>

            {showAdvanced && (
              <>
                <Grid>
                  {/* Quality Controls */}
                  <Grid.Col span={{ base: 12, md: 4 }}>
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
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <Select
                      label="Format"
                      size="xs"
                      value={settings.format}
                      onChange={(value) => updateSetting('format', value as any)}
                      data={[
                        { value: 'jpeg', label: 'JPEG' },
                        { value: 'png', label: 'PNG' },
                        { value: 'webp', label: 'WebP' },
                      ]}
                    />
                  </Grid.Col>

                  {/* Resize Mode */}
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <Select
                      label="Resize Mode"
                      size="xs"
                      value={settings.resizeMode}
                      onChange={(value) => updateSetting('resizeMode', value as any)}
                      data={[
                        { value: 'percentage', label: 'Scale (%)' },
                        { value: 'max-dimensions', label: 'Fit to Size' },
                        { value: 'exact', label: 'Exact Dimensions' },
                      ]}
                    />
                  </Grid.Col>
                </Grid>

                {/* Resize Options Based on Mode */}
                <Stack gap="sm" mt="md">
                  {settings.resizeMode === 'max-dimensions' && (
                    <Stack gap="sm">
                      <Group grow>
                        <NumberInput
                          label="Max Width"
                          size="xs"
                          value={settings.maxWidth === 99999 ? '' : settings.maxWidth}
                          onChange={(value) => {
                            const newWidth = Number(value) || 99999;
                            updateSetting('maxWidth', newWidth);
                            // Auto-update height to maintain common aspect ratios
                            if (newWidth < 99999) {
                              updateSetting('maxHeight', 99999); // Allow height to be unlimited when width is set
                            }
                          }}
                          min={1}
                          max={99999}
                          placeholder="No limit"
                          description="Leave empty for no limit"
                        />
                        <NumberInput
                          label="Max Height"
                          size="xs"
                          value={settings.maxHeight === 99999 ? '' : settings.maxHeight}
                          onChange={(value) => {
                            const newHeight = Number(value) || 99999;
                            updateSetting('maxHeight', newHeight);
                            // Auto-update width to maintain common aspect ratios
                            if (newHeight < 99999) {
                              updateSetting('maxWidth', 99999); // Allow width to be unlimited when height is set
                            }
                          }}
                          min={1}
                          max={99999}
                          placeholder="No limit"
                          description="Leave empty for no limit"
                        />
                      </Group>
                      <Paper p="xs" radius="md" withBorder bg="yellow.0">
                        <Text size="xs" c="dimmed">
                          💡 <Text span fw={500}>Tip:</Text> Set either width OR height for best results. The image will scale to your specified dimension while maintaining aspect ratio. Setting both may result in unexpected sizes.
                        </Text>
                      </Paper>
                    </Stack>
                  )}

                  {settings.resizeMode === 'exact' && (
                    <Stack gap="sm">
                      <Group justify="space-between" align="center">
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
                            {maintainAspectRatio ? 'Ratio locked' : 'Free resize'}
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
                          description={maintainAspectRatio ? "Auto-calculated" : undefined}
                        />
                      </Group>
                      {maintainAspectRatio && (
                        <>
                          <Select
                            size="xs"
                            label="Quick Aspect Ratios"
                            value=""
                            placeholder="Select preset ratio"
                            onChange={(value) => {
                              if (value) {
                                const [w, h] = value.split(':').map(Number);
                                const newRatio = w / h;
                                setAspectRatio(newRatio);
                                const newHeight = Math.round(settings.exactWidth / newRatio);
                                updateSetting('exactHeight', newHeight);
                              }
                            }}
                            data={[
                              { value: '1:1', label: '1:1 (Square)' },
                              { value: '4:3', label: '4:3 (Standard)' },
                              { value: '16:9', label: '16:9 (Widescreen)' },
                              { value: '21:9', label: '21:9 (Ultra-wide)' },
                              { value: '9:16', label: '9:16 (Portrait)' },
                              { value: '3:2', label: '3:2 (Classic)' },
                              { value: '2:3', label: '2:3 (Portrait Classic)' },
                            ]}
                            clearable
                          />
                          <Text size="xs" c="dimmed" ta="center">
                            Current ratio: {aspectRatio > 1
                              ? `${aspectRatio.toFixed(2)}:1`
                              : `1:${(1/aspectRatio).toFixed(2)}`}
                          </Text>
                        </>
                      )}
                    </Stack>
                  )}

                  {settings.resizeMode === 'percentage' && (
                    <Stack gap="md">
                      <Paper p="md" radius="md" withBorder>
                        <Stack gap="sm">
                          <Group justify="space-between">
                            <Text size="sm" fw={500}>
                              Scale: {settings.percentage}%
                            </Text>
                            <Badge
                              color={settings.percentage < 100 ? "green" : "gray"}
                              variant="light"
                            >
                              {settings.percentage < 100 ? `${100 - settings.percentage}% smaller` : 'Original size'}
                            </Badge>
                          </Group>
                          <Slider
                            value={settings.percentage}
                            onChange={(value) => updateSetting('percentage', value)}
                            min={10}
                            max={100}
                            step={5}
                            marks={[
                              { value: 10, label: '10%' },
                              { value: 25, label: '25%' },
                              { value: 50, label: '50%' },
                              { value: 75, label: '75%' },
                              { value: 100, label: 'Original' },
                            ]}
                            styles={{
                              track: { height: 8 },
                              thumb: { width: 20, height: 20 },
                              mark: { width: 2, height: 6 },
                            }}
                          />
                          <Text size="xs" c="dimmed" ta="center" mt="xs">
                            {settings.percentage === 100
                              ? "No resizing - image will maintain original dimensions"
                              : `Images will be scaled to ${settings.percentage}% of original size`}
                          </Text>
                        </Stack>
                      </Paper>
                    </Stack>
                  )}
                </Stack>
              </>
            )}
          </>
        )}
      </Paper>
    </Stack>
  );
}