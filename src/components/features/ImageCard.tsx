import React, { useState, useEffect } from 'react';
import { Download, X, Loader, Check, ArrowRight, Maximize2, FileType, Percent, AlertTriangle, RefreshCw, Eye, Settings2 } from 'lucide-react';
import { Card, Image as MantineImage, Text, Button, Group, Stack, Badge, Paper, Progress, Tooltip, ActionIcon, Alert, Modal } from '@mantine/core';
import { ProcessedImage, ProcessingSettings } from '../../types';
import { formatFileSize } from '../../utils/fileUtils';
import { ImageComparison } from '../comparison/ImageComparison';
import { ImageSettingsModal } from './ImageSettingsModal';

interface ImageCardProps {
  image: ProcessedImage;
  onRemove: () => void;
  onRegenerate?: () => void;
  globalSettings: ProcessingSettings;
  onUpdateSettings?: (imageId: string, settings: ProcessingSettings) => void;
  onApplyToAll?: (settings: ProcessingSettings) => void;
}

export function ImageCard({ image, onRemove, onRegenerate, globalSettings, onUpdateSettings, onApplyToAll }: ImageCardProps) {
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [processedUrl, setProcessedUrl] = useState<string>('');
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [processedDimensions, setProcessedDimensions] = useState<{ width: number; height: number } | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const url = URL.createObjectURL(image.originalFile);
    setOriginalUrl(url);

    // Get original image dimensions
    const img = new Image();
    img.onload = () => {
      setOriginalDimensions({ width: img.width, height: img.height });
    };
    img.src = url;

    return () => URL.revokeObjectURL(url);
  }, [image.originalFile]);

  useEffect(() => {
    if (image.processedBlob) {
      const url = URL.createObjectURL(image.processedBlob);
      setProcessedUrl(url);

      // Get processed image dimensions
      const img = new Image();
      img.onload = () => {
        setProcessedDimensions({ width: img.width, height: img.height });
      };
      img.src = url;

      return () => URL.revokeObjectURL(url);
    }
  }, [image.processedBlob]);

  const handleDownload = () => {
    if (image.processedBlob) {
      const url = URL.createObjectURL(image.processedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compressed_${image.originalFile.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const compressionRatio = image.processedSize > 0
    ? ((image.originalSize - image.processedSize) / image.originalSize * 100)
    : 0;

  const fileSizeIncreased = compressionRatio < 0;
  const spaceSaved = image.originalSize - image.processedSize;
  const absoluteSpaceDiff = Math.abs(spaceSaved);

  const dimensionsChanged = originalDimensions && processedDimensions &&
    (originalDimensions.width !== processedDimensions.width ||
     originalDimensions.height !== processedDimensions.height);

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder data-tour="image-card">
      <Card.Section>
        <div style={{ position: 'relative', backgroundColor: '#f8f9fa', height: 250, overflow: 'hidden' }}>
          {image.processing ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Stack align="center" gap="sm">
                <Loader size={32} className="animate-spin" />
                <Text size="sm" c="dimmed">Processing...</Text>
              </Stack>
            </div>
          ) : processedUrl ? (
            <MantineImage
              src={processedUrl}
              alt="Processed"
              height={250}
              fit="cover"
            />
          ) : (
            <MantineImage
              src={originalUrl}
              alt="Original"
              height={250}
              fit="cover"
              style={{ opacity: 0.5 }}
            />
          )}

          {/* Status badge */}
          {image.processed && (
            <Badge
              color={fileSizeIncreased ? "red" : "green"}
              variant="filled"
              style={{ position: 'absolute', top: 8, left: 8 }}
              leftSection={fileSizeIncreased ? <AlertTriangle size={14} /> : <Check size={14} />}
            >
              {fileSizeIncreased ? '+' : '-'}{Math.abs(compressionRatio).toFixed(0)}%
            </Badge>
          )}

          {/* Remove button */}
          <ActionIcon
            variant="filled"
            color="gray"
            size="sm"
            style={{ position: 'absolute', top: 8, right: 8 }}
            onClick={onRemove}
          >
            <X size={16} />
          </ActionIcon>
        </div>
      </Card.Section>

      <Stack gap="sm" mt="md">
        <Text size="sm" fw={500} style={{ wordBreak: 'break-word' }}>
          {image.originalFile.name}
        </Text>

        {/* Warning if file size increased */}
        {image.processed && fileSizeIncreased && (
          <Alert icon={<AlertTriangle size={16} />} color="red" radius="md">
            <Text size="xs">File size increased. Consider using different settings.</Text>
          </Alert>
        )}

        {/* Optimization Details */}
        {image.processed && (
          <Paper p="sm" bg="gray.0" radius="md">
            <Stack gap="xs">
              {/* File Size */}
              <Group justify="space-between">
                <Group gap={4}>
                  <FileType size={14} />
                  <Text size="xs" c="dimmed">File Size</Text>
                </Group>
                <Group gap="xs">
                  <Text size="xs">{formatFileSize(image.originalSize)}</Text>
                  <ArrowRight size={12} />
                  <Text size="xs" fw={600} c={fileSizeIncreased ? "red" : "green"}>
                    {formatFileSize(image.processedSize)}
                  </Text>
                </Group>
              </Group>

              {/* Dimensions - Always show when available */}
              {originalDimensions && processedDimensions && (
                <Group justify="space-between">
                  <Group gap={4}>
                    <Maximize2 size={14} />
                    <Text size="xs" c="dimmed">Dimensions</Text>
                  </Group>
                  {dimensionsChanged ? (
                    <Group gap="xs">
                      <Text size="xs">
                        {originalDimensions.width}×{originalDimensions.height}
                      </Text>
                      <ArrowRight size={12} />
                      <Text size="xs" fw={600} c="red">
                        {processedDimensions.width}×{processedDimensions.height}
                      </Text>
                    </Group>
                  ) : (
                    <Text size="xs" fw={600}>
                      {processedDimensions.width}×{processedDimensions.height}
                    </Text>
                  )}
                </Group>
              )}

              {/* Compression */}
              <Group justify="space-between">
                <Group gap={4}>
                  <Percent size={14} />
                  <Text size="xs" c="dimmed">{fileSizeIncreased ? 'Size Change' : 'Compression'}</Text>
                </Group>
                <Text size="xs" fw={600} c={fileSizeIncreased ? "red" : "green"}>
                  {fileSizeIncreased ? 'Increased ' : ''}{Math.abs(compressionRatio).toFixed(1)}%
                </Text>
              </Group>

              {/* Progress bar - only show for successful compression */}
              {!fileSizeIncreased && (
                <Progress
                  value={compressionRatio}
                  color="green"
                  size="xs"
                  radius="xl"
                />
              )}

              {/* Space saved/added */}
              <Group justify="space-between">
                <Text size="xs" c="dimmed">{fileSizeIncreased ? 'Space added' : 'Space saved'}</Text>
                <Text size="xs" fw={600} c={fileSizeIncreased ? "red" : "green"}>
                  {formatFileSize(absoluteSpaceDiff)}
                </Text>
              </Group>
            </Stack>
          </Paper>
        )}

        <Stack gap="sm">
          {image.processed ? (
            <Group grow>
              <Tooltip label="Download compressed image">
                <ActionIcon
                  variant="filled"
                  color="red"
                  size="lg"
                  onClick={handleDownload}
                  style={{ flex: 1 }}
                >
                  <Download size={18} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Adjust settings">
                <ActionIcon
                  variant="light"
                  color="gray"
                  size="lg"
                  onClick={() => setShowSettings(true)}
                  style={{ flex: 1 }}
                  data-tour="image-settings-button"
                >
                  <Settings2 size={18} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label={showComparison ? "Hide comparison" : "Show comparison"}>
                <ActionIcon
                  variant="light"
                  color="red"
                  size="lg"
                  onClick={() => setShowComparison(!showComparison)}
                  style={{ flex: 1 }}
                  data-tour="image-compare-button"
                >
                  <Eye size={18} />
                </ActionIcon>
              </Tooltip>
            </Group>
          ) : (
            <Button
              leftSection={<Loader size={16} className="animate-spin" />}
              disabled
              fullWidth
              size="sm"
            >
              Processing...
            </Button>
          )}
        </Stack>

        {/* Settings Modal */}
        {onUpdateSettings && (
          <ImageSettingsModal
            opened={showSettings}
            onClose={() => setShowSettings(false)}
            image={image}
            globalSettings={globalSettings}
            onSave={onUpdateSettings}
            onApplyToAll={onApplyToAll}
          />
        )}

        {/* Comparison Modal */}
        <Modal
          opened={showComparison}
          onClose={() => setShowComparison(false)}
          size="90%"
          title="Image Comparison"
          centered
        >
          <ImageComparison
            image={image}
            onClose={() => setShowComparison(false)}
          />
        </Modal>
      </Stack>
    </Card>
  );
}