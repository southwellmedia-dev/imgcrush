import React, { useState, useEffect, useRef } from 'react';
import { Download, X, Loader, Check, ArrowRight, Maximize2, FileType, Percent, AlertTriangle, RefreshCw, Eye, Settings2, Crop, Edit2, Save, XCircle, GripVertical } from 'lucide-react';
import { Card, Image as MantineImage, Text, Button, Group, Stack, Badge, Paper, Progress, Tooltip, ActionIcon, Alert, Modal, TextInput } from '@mantine/core';
import { motion } from 'framer-motion';
import { ProcessedImage, ProcessingSettings } from '../../types';
import { formatFileSize } from '../../utils/fileUtils';
import { ImageComparison } from '../comparison/ImageComparison';
import { ImageSettingsModal } from './ImageSettingsModal';
import { CropModal } from './CropModal';

// Static styles extracted outside component to prevent re-creation on every render
const CARD_STYLES = {
  borderWidth: '1px',
  borderColor: 'var(--color-border-glass)',
};

const IMAGE_CONTAINER_STYLES = {
  position: 'relative' as const,
  backgroundColor: 'var(--color-bg-secondary)',
  height: 300,
  overflow: 'hidden' as const,
};

const PROCESSING_CONTAINER_STYLES = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  backgroundColor: 'var(--color-bg-tertiary)',
};

const LOADER_STYLES = { color: 'var(--color-primary)' };
const TEXT_SECONDARY_STYLES = { color: 'var(--color-text-secondary)' };

const DRAG_HANDLE_STYLES = {
  position: 'absolute' as const,
  top: 12,
  right: 60,
  borderRadius: '10px',
};

const REMOVE_BTN_STYLES = {
  position: 'absolute' as const,
  top: 12,
  right: 12,
  borderRadius: '10px',
};

const ACTION_BTN_STYLES = {
  borderRadius: '10px',
  height: '44px',
};

interface ImageCardProps {
  image: ProcessedImage;
  onRemove: () => void;
  onRegenerate?: () => void;
  onCrop?: (croppedBlob: Blob, croppedFileName: string) => void;
  globalSettings: ProcessingSettings;
  onUpdateSettings?: (imageId: string, settings: ProcessingSettings) => void;
  onApplyToAll?: (settings: ProcessingSettings) => void;
  onUpdateFileName?: (imageId: string, fileName: string) => void;
  dragHandleProps?: any;
  isDragging?: boolean;
}

export function ImageCard({ image, onRemove, onRegenerate, onCrop, globalSettings, onUpdateSettings, onApplyToAll, onUpdateFileName, dragHandleProps, isDragging }: ImageCardProps) {
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
    } else {
      // Clean up when processedBlob becomes null (reprocessing, reset, etc.)
      if (processedUrlRef.current) {
        URL.revokeObjectURL(processedUrlRef.current);
        processedUrlRef.current = null;
      }
      setProcessedUrl(null);
      setProcessedDimensions(null);
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
      const { base, ext } = splitFileName(originalName);
      const fileName = image.customFileName
        ? `${image.customFileName}${ext}`
        : ext
          ? `compressed_${base}${ext}`
          : `compressed_${base}`;

      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const splitFileName = (fileName: string) => {
    const lastDot = fileName.lastIndexOf('.');
    if (lastDot <= 0 || lastDot === fileName.length - 1) {
      return { base: fileName, ext: '' };
    }
    return {
      base: fileName.substring(0, lastDot),
      ext: fileName.substring(lastDot),
    };
  };

  const handleEditFileName = () => {
    // Get filename without extension
    const originalName = image.originalFile.name;
    const { base } = splitFileName(originalName);
    setEditedFileName(image.customFileName || base);
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

  const handleCropComplete = (croppedBlob: Blob, croppedFileName: string) => {
    if (onCrop) {
      onCrop(croppedBlob, croppedFileName);
    }
    setShowCrop(false);
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
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <Card
        shadow="none"
        padding="0"
        radius="lg"
        className="glass elevation-xl transition-smooth animate-scale-in overflow-hidden"
        style={CARD_STYLES}
      >
      {/* Colored Top Accent Bar - Status Indicator */}
      {image.processed && (
        <div
          style={{
            height: '4px',
            background: fileSizeIncreased
              ? 'linear-gradient(90deg, var(--color-error) 0%, var(--color-warning) 100%)'
              : 'linear-gradient(90deg, var(--color-success) 0%, var(--color-info) 100%)',
            boxShadow: fileSizeIncreased ? 'var(--shadow-glow-red)' : 'var(--shadow-glow-green)',
          }}
        />
      )}

      <Card.Section>
        <div style={IMAGE_CONTAINER_STYLES}>
          {image.processing ? (
            <div className="shimmer" style={PROCESSING_CONTAINER_STYLES}>
              <Stack align="center" gap="md">
                <Loader size={40} style={LOADER_STYLES} />
                <Text size="sm" fw={500} style={TEXT_SECONDARY_STYLES}>
                  Processing...
                </Text>
              </Stack>
            </div>
          ) : processedUrl ? (
            <MantineImage
              src={processedUrl}
              alt="Processed"
              fit="cover"
              style={{ height: '100%', width: '100%' }}
            />
          ) : originalUrl ? (
            <MantineImage
              src={originalUrl}
              alt="Original"
              fit="cover"
              style={{ opacity: 0.4, height: '100%', width: '100%', filter: 'grayscale(50%)' }}
            />
          ) : null}

          {/* Status Badge - Larger and more prominent */}
          {image.processed && (
            <Badge
              size="lg"
              variant="filled"
              radius="md"
              className="elevation-lg animate-count-up"
              style={{
                position: 'absolute',
                top: 12,
                left: 12,
                fontSize: '14px',
                fontWeight: 700,
                padding: '6px 12px',
                backgroundColor: fileSizeIncreased ? 'var(--color-error)' : 'var(--color-success)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
              }}
              leftSection={fileSizeIncreased ? <AlertTriangle size={16} /> : <Check size={16} />}
            >
              {fileSizeIncreased ? '+' : '-'}{Math.abs(compressionRatio).toFixed(0)}%
            </Badge>
          )}

          {/* Drag handle - Enhanced */}
          {dragHandleProps && (
            <ActionIcon
              {...dragHandleProps}
              variant="filled"
              size="lg"
              className="elevation-md drag-handle"
              style={{ ...DRAG_HANDLE_STYLES, cursor: 'grab' }}
            >
              <GripVertical size={18} style={{ color: 'white' }} />
            </ActionIcon>
          )}

          {/* Remove button - Enhanced */}
          <ActionIcon
            variant="filled"
            size="lg"
            className="elevation-md remove-btn-hover"
            style={REMOVE_BTN_STYLES}
            onClick={onRemove}
          >
            <X size={18} style={{ color: 'white' }} />
          </ActionIcon>
        </div>
      </Card.Section>

      <Stack gap="lg" style={{ padding: '20px' }}>
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
          <Group gap="xs" align="center" wrap="nowrap">
            <Text size="sm" fw={500} style={{ wordBreak: 'break-word', flex: 1 }}>
              {image.customFileName
                ? image.customFileName
                : splitFileName(image.originalFile.name).base}
            </Text>
            {image.outputFormat && (
              <Tooltip
                label={
                  <>
                    <Text size="xs" fw={600}>Export Format</Text>
                    <Text size="xs" c="dimmed">
                      Converted from: {splitFileName(image.originalFile.name).ext.replace('.', '').toUpperCase() || 'Unknown'}
                    </Text>
                  </>
                }
                withArrow
                position="top"
              >
                <Badge size="sm" variant="light" color="blue" style={{ textTransform: 'uppercase', cursor: 'help' }}>
                  {image.outputFormat === 'jpeg' ? 'JPG' : image.outputFormat}
                </Badge>
              </Tooltip>
            )}
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

        {/* Optimization Details - Enhanced */}
        {image.processed && (
          <div
            className="glass-strong elevation-sm"
            style={{
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid var(--color-border-glass)',
            }}
          >
            <Stack gap="md">
              {/* File Size - Larger text */}
              <Group justify="space-between">
                <Group gap={6}>
                  <FileType size={16} style={{ color: 'var(--color-text-tertiary)' }} />
                  <Text size="sm" style={{ color: 'var(--color-text-secondary)' }}>File Size</Text>
                </Group>
                <Group gap="sm">
                  <Text size="sm" style={{ color: 'var(--color-text-tertiary)' }}>
                    {formatFileSize(image.originalSize)}
                  </Text>
                  <ArrowRight size={14} style={{ color: 'var(--color-text-muted)' }} />
                  <Text
                    size="sm"
                    fw={700}
                    className="animate-count-up"
                    style={{
                      color: fileSizeIncreased ? 'var(--color-error)' : 'var(--color-success)',
                    }}
                  >
                    {formatFileSize(image.processedSize)}
                  </Text>
                </Group>
              </Group>

              {/* Dimensions - Always show when available */}
              {originalDimensions && processedDimensions && (
                <Group justify="space-between">
                  <Group gap={6}>
                    <Maximize2 size={16} style={{ color: 'var(--color-text-tertiary)' }} />
                    <Text size="sm" style={{ color: 'var(--color-text-secondary)' }}>Dimensions</Text>
                  </Group>
                  {dimensionsChanged ? (
                    <Tooltip
                      label={`Original: ${originalDimensions.width}×${originalDimensions.height}`}
                      withArrow
                      position="top"
                    >
                      <Group gap="xs" style={{ cursor: 'help' }}>
                        <Text size="sm" fw={600} style={{ color: 'var(--color-text-primary)' }}>
                          {processedDimensions.width}×{processedDimensions.height}
                        </Text>
                        <Badge
                          size="sm"
                          style={{
                            backgroundColor: 'rgba(59, 130, 246, 0.15)',
                            color: 'var(--color-info)',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            fontWeight: 600,
                          }}
                        >
                          {Math.round((processedDimensions.width / originalDimensions.width) * 100)}%
                        </Badge>
                      </Group>
                    </Tooltip>
                  ) : (
                    <Text size="sm" fw={600} style={{ color: 'var(--color-text-primary)' }}>
                      {processedDimensions.width}×{processedDimensions.height}
                    </Text>
                  )}
                </Group>
              )}

              {/* Compression */}
              <Group justify="space-between">
                <Group gap={6}>
                  <Percent size={16} style={{ color: 'var(--color-text-tertiary)' }} />
                  <Text size="sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {fileSizeIncreased ? 'Size Change' : 'Compression'}
                  </Text>
                </Group>
                <Text
                  size="sm"
                  fw={700}
                  className="animate-count-up"
                  style={{
                    color: fileSizeIncreased ? 'var(--color-error)' : 'var(--color-success)',
                  }}
                >
                  {fileSizeIncreased ? 'Increased ' : ''}{Math.abs(compressionRatio).toFixed(1)}%
                </Text>
              </Group>

              {/* Progress bar - enhanced */}
              {!fileSizeIncreased && (
                <Progress
                  value={compressionRatio}
                  size="sm"
                  radius="xl"
                  style={{
                    backgroundColor: 'var(--color-bg-tertiary)',
                  }}
                  styles={{
                    section: {
                      background: 'linear-gradient(90deg, var(--color-success) 0%, var(--color-info) 100%)',
                    },
                  }}
                />
              )}

              {/* Space saved/added */}
              <Group justify="space-between" pt="xs" style={{ borderTop: '1px solid var(--color-border-secondary)' }}>
                <Text size="sm" fw={500} style={{ color: 'var(--color-text-secondary)' }}>
                  {fileSizeIncreased ? 'Space added' : 'Space saved'}
                </Text>
                <Text
                  size="md"
                  fw={700}
                  className="animate-count-up"
                  style={{
                    color: fileSizeIncreased ? 'var(--color-error)' : 'var(--color-success)',
                  }}
                >
                  {formatFileSize(absoluteSpaceDiff)}
                </Text>
              </Group>
            </Stack>
          </div>
        )}

        <Stack gap="sm">
          {image.processed ? (
            <>
              {/* Secondary Actions */}
              <Group grow>
                {onCrop && (
                  <Tooltip label="Crop image" position="top">
                    <ActionIcon
                      variant="subtle"
                      size="xl"
                      onClick={() => setShowCrop(true)}
                      className="elevation-sm btn-elevated-hover"
                      style={ACTION_BTN_STYLES}
                    >
                      <Crop size={20} />
                    </ActionIcon>
                  </Tooltip>
                )}
                <Tooltip label="Adjust settings" position="top">
                  <ActionIcon
                    variant="subtle"
                    size="xl"
                    onClick={() => setShowSettings(true)}
                    className="elevation-sm btn-elevated-hover"
                    style={ACTION_BTN_STYLES}
                  >
                    <Settings2 size={20} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Compare before/after" position="top">
                  <ActionIcon
                    variant="subtle"
                    size="xl"
                    onClick={() => setShowComparison(!showComparison)}
                    className={showComparison ? "elevation-sm" : "elevation-sm btn-elevated-hover"}
                    style={{
                      ...ACTION_BTN_STYLES,
                      backgroundColor: showComparison ? 'var(--color-primary-light)' : 'var(--color-bg-elevated)',
                      color: showComparison ? 'var(--color-primary)' : 'inherit',
                    }}
                  >
                    <Eye size={20} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </>
          ) : (
            <Button
              variant="subtle"
              size="md"
              fullWidth
              leftSection={<Loader size={18} />}
              disabled
              className="shimmer"
              style={{
                borderRadius: '10px',
                height: '44px',
                backgroundColor: 'var(--color-bg-tertiary)',
              }}
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

        {/* Crop Modal */}
        {onCrop && processedUrl && (
          <CropModal
            opened={showCrop}
            onClose={() => setShowCrop(false)}
            imageUrl={processedUrl}
            imageName={image.customFileName || image.originalFile.name}
            imageFormat={image.outputFormat}
            onCropComplete={handleCropComplete}
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
    </motion.div>
  );
}