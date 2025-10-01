import React, { useState } from 'react';
import { Card, Text, Group, Stack, Badge, SimpleGrid, Button } from '@mantine/core';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { COMPRESSION_PRESETS, CompressionPreset } from '../../presets/compressionPresets';

interface PresetSelectorProps {
  selectedPreset: string;
  onPresetChange: (presetId: string) => void;
}

export function PresetSelector({ selectedPreset, onPresetChange }: PresetSelectorProps) {
  const [showAll, setShowAll] = useState(false);

  // Define which presets to show initially
  const primaryPresets = ['compression-only', 'web-optimized', 'high-quality', 'custom'];
  const primaryPresetObjects = COMPRESSION_PRESETS.filter(p => primaryPresets.includes(p.id));
  const additionalPresets = COMPRESSION_PRESETS.filter(p => !primaryPresets.includes(p.id));

  const presetsToShow = showAll ? COMPRESSION_PRESETS : primaryPresetObjects;

  return (
    <Stack gap="md">
      <Text size="sm" fw={600} c="gray.7">Choose a compression preset</Text>

      <SimpleGrid cols={{ base: 1, sm: 2, md: showAll ? 3 : 2, lg: 4 }} spacing="sm">
        {presetsToShow.map((preset) => (
          <Card
            key={preset.id}
            padding="md"
            radius="md"
            withBorder
            className="hover:shadow-md cursor-pointer transition-all"
            style={{
              borderColor: selectedPreset === preset.id ? 'var(--color-primary)' : 'var(--color-border-primary)',
              backgroundColor: selectedPreset === preset.id ? 'var(--color-primary-light)' : 'var(--color-bg-elevated)',
              borderWidth: selectedPreset === preset.id ? '2px' : '1px',
              transform: selectedPreset === preset.id ? 'scale(1.02)' : 'scale(1)',
            }}
            onClick={() => onPresetChange(preset.id)}
          >
            <Stack gap="xs">
              <Group justify="space-between" align="start">
                <Text size="xl">{preset.icon}</Text>
                {selectedPreset === preset.id ? (
                  <Badge size="sm" color="red" variant="filled" leftSection={<Check size={12} />}>
                    Selected
                  </Badge>
                ) : preset.badge ? (
                  <Badge size="xs" className="badge-primary-subtle">
                    {preset.badge}
                  </Badge>
                ) : null}
              </Group>

              <Text size="sm" fw={600}>{preset.name}</Text>
              <Text size="xs" c="dimmed" lineClamp={2}>
                {preset.description}
              </Text>

              {preset.recommended && preset.recommended.length > 0 && (
                <div>
                  <Text size="xs" c="dimmed" mb={6}>Best for:</Text>
                  <Group gap={6}>
                    {preset.recommended.slice(0, 2).map((item, index) => (
                      <Badge key={index} size="sm" variant="light" className="badge-gray-subtle">
                        {item}
                      </Badge>
                    ))}
                  </Group>
                </div>
              )}
            </Stack>
          </Card>
        ))}
      </SimpleGrid>

      {/* Load More Button - only show if there are additional presets and not showing all */}
      {additionalPresets.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: '8px' }}>
          <Button
            variant="subtle"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            leftSection={showAll ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            style={{ transition: 'all 0.2s ease' }}
          >
            {showAll ? 'Show Less' : `Show ${additionalPresets.length} More Options`}
          </Button>
        </div>
      )}
    </Stack>
  );
}