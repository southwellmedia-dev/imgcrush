import React, { useState, useEffect, useRef } from 'react';
import { Download, X, Loader, Check, ArrowRight, Maximize2, FileType, Percent, AlertTriangle, RefreshCw, Eye, Settings2, Crop, Edit2, Save, XCircle } from 'lucide-react';
import { Card, Image as MantineImage, Text, Button, Group, Stack, Badge, Paper, Progress, Tooltip, ActionIcon, Alert, Modal, TextInput } from '@mantine/core';
import { ProcessedImage, ProcessingSettings } from '../../types';
import { formatFileSize } from '../../utils/fileUtils';
import { ImageComparison } from '../comparison/ImageComparison';
import { ImageSettingsModal } from './ImageSettingsModal';
import { CropModal } from './CropModal';

interface ImageCardProps {
  image: ProcessedImage;
  onRemove: () => void;
  onRegenerate?: () => void;
  onCrop?: (croppedBlob: Blob, croppedFileName: string) => void;
  globalSettings: ProcessingSettings;
  onUpdateSettings?: (imageId: string, settings: ProcessingSettings) => void;
  onApplyToAll?: (settings: ProcessingSettings) => void;
  onUpdateFileName?: (imageId: string, fileName: string) => void;
}

export function ImageCard({ image, onRemove, onRegenerate, onCrop, globalSettings, onUpdateSettings, onApplyToAll, onUpdateFileName }: ImageCardProps) {
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [processedDimensions, setProcessedDimensions] = useState<{ width: number; height: number } | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCrop, setShowCrop] = useState(false);

  // Filename editing state
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedFileName, setEditedFileName] = useState('');

  // Use refs to track blob URLs and prevent double-revocation in StrictMode
  const originalUrlRef = useRef<string | null>(null);
  const processedUrlRef = useRef<string | null>(null);

  useEffect(() => {
    // Validate the file before creating blob URL
    if (!image.originalFile || !(image.originalFile instanceof Blob)) {
      console.error('Invalid originalFile:', image.originalFile);
      return;
    }

    // Revoke old URL if it exists (only when dependency changes)
    if (originalUrlRef.current) {
      URL.revokeObjectURL(originalUrlRef.current);
    }

    const url = URL.createObjectURL(image.originalFile);
    originalUrlRef.current = url;
    setOriginalUrl(url);

    // Get original image dimensions
    const img = new Image();
    img.onload = () => {
      setOriginalDimensions({ width: img.width, height: img.height });
    };
    img.onerror = (e) => {
      console.error('Failed to load original image dimensions:', {
        url,
        fileName: image.originalFile.name,
        fileSize: image.originalFile.size,
        fileType: image.originalFile.type,
        error: e
      });
    };
    img.src = url;

    // Don't revoke in cleanup - let it persist for StrictMode compatibility
  }, [image.originalFile]);

  useEffect(() => {
    if (image.processedBlob) {
      // Validate the blob before creating URL
      if (!(image.processedBlob instanceof Blob)) {
        console.error('Invalid processedBlob:', image.processedBlob);
        return;
      }

      // Revoke old URL if it exists (only when dependency changes)
      if (processedUrlRef.current) {
        URL.revokeObjectURL(processedUrlRef.current);
      }

      const url = URL.createObjectURL(image.processedBlob);
      processedUrlRef.current = url;
      setProcessedUrl(url);

      // Get processed image dimensions
      const img = new Image();
      img.onload = () => {
        setProcessedDimensions({ width: img.width, height: img.height });
      };
      img.onerror = (e) => {
        console.error('Failed to load processed image dimensions:', {
          url,
          blobSize: image.processedBlob.size,
          blobType: image.processedBlob.type,
          error: e
        });
      };
      img.src = url;

      // Don't revoke in cleanup - let it persist for StrictMode compatibility
    }
  }, [image.processedBlob]);

  // Cleanup blob URLs only on component unmount
  useEffect(() => {
    return () => {
      if (originalUrlRef.current) {
        URL.revokeObjectURL(originalUrlRef.current);
      }
      if (processedUrlRef.current) {
        URL.revokeObjectURL(processedUrlRef.current);
      }
    };
  }, []); // Empty deps = only runs cleanup on unmount

  const handleDownload = () => {
    if (image.processedBlob) {
      const url = URL.createObjectURL(image.processedBlob);
      const a = document.createElement('a');
      a.href = url;

      // Use custom filename if set, otherwise use original
      const originalName = image.originalFile.name;
      const extension = originalName.substring(originalName.lastIndexOf('.'));
      const fileName = image.customFileName
        ? `${image.customFileName}${extension}`
        : `compressed_${originalName}`;

      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleEditFileName = () => {
    // Get filename without extension
    const originalName = image.originalFile.name;
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
    setEditedFileName(image.customFileName || nameWithoutExt);
    setIsEditingName(true);
  };

  const handleSaveFileName = () => {
    if (onUpdateFileName && editedFileName.trim()) {
      onUpdateFileName(image.id, editedFileName.trim());
    }
    setIsEditingName(false);
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditedFileName('');
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
        <div style={{ position: 'relative', backgroundColor: 'var(--color-bg-secondary)', height: 250, overflow: 'hidden' }}>
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
          ) : originalUrl ? (
            <MantineImage
              src={originalUrl}
              alt="Original"
              height={250}
              fit="cover"
              style={{ opacity: 0.5 }}
            />
          ) : null}

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
        {/* Filename with inline editing */}
        {isEditingName ? (
          <Group gap="xs" align="center">
            <TextInput
              value={editedFileName}
              onChange={(e) => setEditedFileName(e.target.value)}
              size="sm"
              style={{ flex: 1 }}
              placeholder="Enter filename"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveFileName();
                if (e.key === 'Escape') handleCancelEdit();
              }}
              autoFocus
            />
            <ActionIcon
              variant="filled"
              color="green"
              size="sm"
              onClick={handleSaveFileName}
            >
              <Save size={14} />
            </ActionIcon>
            <ActionIcon
              variant="filled"
              color="gray"
              size="sm"
              onClick={handleCancelEdit}
            >
              <XCircle size={14} />
            </ActionIcon>
          </Group>
        ) : (
          <Group gap="xs" align="center">
            <Text size="sm" fw={500} style={{ wordBreak: 'break-word', flex: 1 }}>
              {image.customFileName
                ? `${image.customFileName}${image.originalFile.name.substring(image.originalFile.name.lastIndexOf('.'))}`
                : image.originalFile.name}
            </Text>
            <Tooltip label="Edit filename">
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                onClick={handleEditFileName}
              >
                <Edit2 size={14} />
              </ActionIcon>
            </Tooltip>
          </Group>
        )}

        {/* Warning if file size increased */}
        {image.processed && fileSizeIncreased && (
          <Alert icon={<AlertTriangle size={16} />} color="red" radius="md">
            <Text size="xs">File size increased. Consider using different settings.</Text>
          </Alert>
        )}

        {/* Optimization Details */}
        {image.processed && (
          <Paper p="sm" radius="md" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
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