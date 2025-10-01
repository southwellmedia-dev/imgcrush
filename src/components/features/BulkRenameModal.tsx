import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  Stack,
  Group,
  Text,
  Button,
  Paper,
  Badge,
  SegmentedControl,
  TextInput,
  NumberInput,
  Code,
} from '@mantine/core';
import { Edit2, Check, FileText } from 'lucide-react';
import { NAMING_FORMATS, generatePreview, bulkRename } from '../../utils/namingFormats';
import { ProcessedImage } from '../../types';

interface BulkRenameModalProps {
  opened: boolean;
  onClose: () => void;
  images: ProcessedImage[];
  onApply: (renamedFiles: Map<string, string>) => void;
}

export function BulkRenameModal({ opened, onClose, images, onApply }: BulkRenameModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<string>('sequential');
  const [customPrefix, setCustomPrefix] = useState<string>('');
  const [startNumber, setStartNumber] = useState<number>(1);
  const [preview, setPreview] = useState<string[]>([]);

  // Get current format
  const currentFormat = NAMING_FORMATS.find((f) => f.id === selectedFormat);

  // Memoize image data transformation to avoid recalculating on every render
  const imageData = useMemo(() =>
    images.map((img) => ({
      originalName: img.originalFile.name,
      outputFormat: img.outputFormat || 'jpeg',
    })),
    [images]
  );

  // Update preview whenever settings change
  useEffect(() => {
    if (!opened) return;

    const previewNames = generatePreview(selectedFormat, imageData, {
      prefix: customPrefix,
      startNumber,
      previewCount: 3,
    });

    setPreview(previewNames);
  }, [opened, selectedFormat, customPrefix, startNumber, imageData]);

  const handleApply = () => {
    const imageDataWithIds = images.map((img) => ({
      id: img.id,
      originalName: img.originalFile.name,
      outputFormat: img.outputFormat || 'jpeg',
    }));

    const renamedFiles = bulkRename(selectedFormat, imageDataWithIds, {
      prefix: customPrefix,
      startNumber,
    });

    onApply(renamedFiles);
    onClose();
  };

  const handleCancel = () => {
    // Reset to defaults
    setSelectedFormat('sequential');
    setCustomPrefix('');
    setStartNumber(1);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleCancel}
      title={
        <Group gap="xs">
          <Edit2 size={20} />
          <Text size="lg" fw={600}>
            Bulk Rename Files
          </Text>
        </Group>
      }
      size="lg"
      centered
    >
      <Stack gap="lg">
        {/* Info Banner */}
        <Paper p="md" radius="md" withBorder style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
          <Group gap="xs">
            <FileText size={18} color="var(--mantine-color-blue-6)" />
            <Text size="sm" c="dimmed">
              Rename all <strong>{images.length}</strong> processed {images.length === 1 ? 'image' : 'images'} at once
            </Text>
          </Group>
        </Paper>

        {/* Format Selector */}
        <Stack gap="xs">
          <Text size="sm" fw={600}>
            Naming Format
          </Text>
          <SegmentedControl
            value={selectedFormat}
            onChange={setSelectedFormat}
            data={NAMING_FORMATS.map((format) => ({
              value: format.id,
              label: format.name,
            }))}
            fullWidth
          />
          {currentFormat && (
            <Text size="xs" c="dimmed" style={{ marginTop: -4 }}>
              {currentFormat.description}
            </Text>
          )}
        </Stack>

        {/* Custom Prefix Input (conditional) */}
        {currentFormat?.requiresPrefix && (
          <TextInput
            label="Custom Prefix"
            placeholder="Enter prefix (e.g., vacation, portfolio)"
            value={customPrefix}
            onChange={(e) => setCustomPrefix(e.target.value)}
            description="Letters, numbers, hyphens, and underscores allowed"
            leftSection={<Edit2 size={16} />}
          />
        )}

        {/* Start Number Input */}
        <NumberInput
          label="Start Number"
          placeholder="1"
          value={startNumber}
          onChange={(value) => setStartNumber(typeof value === 'number' ? value : 1)}
          min={0}
          max={9999}
          description="First file will start with this number"
        />

        {/* Preview Section */}
        <Paper p="md" radius="md" withBorder style={{ backgroundColor: 'var(--color-bg-elevated)' }}>
          <Stack gap="sm">
            <Group justify="space-between">
              <Text size="sm" fw={600}>
                Preview
              </Text>
              <Badge size="sm" variant="light" color="blue">
                First {Math.min(3, images.length)} {images.length === 1 ? 'file' : 'files'}
              </Badge>
            </Group>

            {preview.length > 0 ? (
              <Stack gap="xs">
                {preview.map((filename, index) => (
                  <Group key={index} gap="xs">
                    <Text size="xs" c="dimmed" style={{ minWidth: 20 }}>
                      {startNumber + index}.
                    </Text>
                    <Code style={{ flex: 1, fontSize: '12px' }}>{filename}</Code>
                  </Group>
                ))}
                {images.length > 3 && (
                  <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }}>
                    ... and {images.length - 3} more {images.length - 3 === 1 ? 'file' : 'files'}
                  </Text>
                )}
              </Stack>
            ) : (
              <Text size="sm" c="dimmed">
                No preview available
              </Text>
            )}
          </Stack>
        </Paper>

        {/* Action Buttons */}
        <Group justify="space-between" mt="md">
          <Button variant="subtle" color="gray" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            leftSection={<Check size={18} />}
            color="red"
            onClick={handleApply}
            disabled={currentFormat?.requiresPrefix && !customPrefix.trim()}
          >
            Apply to All {images.length} {images.length === 1 ? 'Image' : 'Images'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
