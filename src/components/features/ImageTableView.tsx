import React, { useState, useEffect } from 'react';
import { Table, Text, Badge, ActionIcon, Group, Tooltip, Image as MantineImage } from '@mantine/core';
import { Download, Settings2, Eye, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { ProcessedImage, ProcessingSettings } from '../../types';
import { formatFileSize } from '../../utils/fileUtils';
import { ImageSettingsModal } from '../modals/ImageSettingsModal';
import { ImageComparison } from '../comparison/ImageComparison';

interface ImageTableViewProps {
  images: ProcessedImage[];
  onRemove: (id: string) => void;
  globalSettings: ProcessingSettings;
  onUpdateSettings?: (imageId: string, settings: ProcessingSettings) => void;
  onApplyToAll?: (settings: ProcessingSettings) => void;
}

export function ImageTableView({
  images,
  onRemove,
  globalSettings,
  onUpdateSettings,
  onApplyToAll
}: ImageTableViewProps) {
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  // Create object URLs for thumbnails
  useEffect(() => {
    const urls: Record<string, string> = {};
    images.forEach(image => {
      if (image.processedBlob) {
        urls[image.id] = URL.createObjectURL(image.processedBlob);
      } else {
        urls[image.id] = URL.createObjectURL(image.originalFile);
      }
    });
    setImageUrls(urls);

    return () => {
      Object.values(urls).forEach(url => URL.revokeObjectURL(url));
    };
  }, [images]);

  const handleDownload = (image: ProcessedImage) => {
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

  const handleOpenSettings = (imageId: string) => {
    setSelectedImageId(imageId);
    setShowSettings(true);
  };

  const handleOpenComparison = (imageId: string) => {
    setSelectedImageId(imageId);
    setShowComparison(true);
  };

  const selectedImage = images.find(img => img.id === selectedImageId);

  const rows = images.map((image) => {
    const compressionRatio = image.processedSize > 0
      ? ((image.originalSize - image.processedSize) / image.originalSize * 100)
      : 0;
    const fileSizeIncreased = compressionRatio < 0;

    return (
      <Table.Tr key={image.id}>
        {/* Thumbnail */}
        <Table.Td>
          <MantineImage
            src={imageUrls[image.id]}
            alt={image.originalFile.name}
            width={60}
            height={60}
            fit="cover"
            radius="md"
          />
        </Table.Td>

        {/* Filename */}
        <Table.Td>
          <Text size="sm" fw={500} style={{ maxWidth: 250 }} truncate="end">
            {image.originalFile.name}
          </Text>
        </Table.Td>

        {/* Original Size */}
        <Table.Td>
          <Text size="sm" c="dimmed">
            {formatFileSize(image.originalSize)}
          </Text>
        </Table.Td>

        {/* Compressed Size */}
        <Table.Td>
          {image.processed ? (
            <Text size="sm" fw={500} c="green.7">
              {formatFileSize(image.processedSize)}
            </Text>
          ) : (
            <Text size="sm" c="dimmed">Processing...</Text>
          )}
        </Table.Td>

        {/* Savings */}
        <Table.Td>
          {image.processed && (
            <Group gap="xs">
              <Badge
                color={fileSizeIncreased ? 'red' : 'green'}
                variant="light"
                leftSection={fileSizeIncreased ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              >
                {fileSizeIncreased ? '+' : '-'}{Math.abs(compressionRatio).toFixed(1)}%
              </Badge>
            </Group>
          )}
        </Table.Td>

        {/* Actions */}
        <Table.Td>
          <Group gap="xs" wrap="nowrap">
            {image.processed && (
              <>
                <Tooltip label="Download">
                  <ActionIcon
                    variant="light"
                    color="red"
                    size="md"
                    onClick={() => handleDownload(image)}
                  >
                    <Download size={16} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Settings">
                  <ActionIcon
                    variant="light"
                    color="gray"
                    size="md"
                    onClick={() => handleOpenSettings(image.id)}
                  >
                    <Settings2 size={16} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Compare">
                  <ActionIcon
                    variant="light"
                    color="red"
                    size="md"
                    onClick={() => handleOpenComparison(image.id)}
                  >
                    <Eye size={16} />
                  </ActionIcon>
                </Tooltip>
              </>
            )}
            <Tooltip label="Remove">
              <ActionIcon
                variant="light"
                color="gray"
                size="md"
                onClick={() => onRemove(image.id)}
              >
                <Trash2 size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <>
      <div style={{
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #e9ecef'
      }}>
        <Table
          highlightOnHover
          withTableBorder={false}
          withColumnBorders
          styles={{
            th: {
              backgroundColor: '#f8f9fa',
              fontWeight: 700,
              fontSize: '13px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: '#495057',
              padding: '16px 12px',
              borderBottom: '2px solid #dee2e6'
            },
            td: {
              padding: '16px 12px'
            },
            tr: {
              '&:hover': {
                backgroundColor: '#f8f9fa'
              }
            }
          }}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: 80 }}>Preview</Table.Th>
              <Table.Th>Filename</Table.Th>
              <Table.Th style={{ width: 120 }}>Original</Table.Th>
              <Table.Th style={{ width: 120 }}>Compressed</Table.Th>
              <Table.Th style={{ width: 120 }}>Savings</Table.Th>
              <Table.Th style={{ width: 160 }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </div>

      {/* Settings Modal */}
      {selectedImage && onUpdateSettings && (
        <ImageSettingsModal
          opened={showSettings}
          onClose={() => setShowSettings(false)}
          image={selectedImage}
          globalSettings={globalSettings}
          onSave={onUpdateSettings}
          onApplyToAll={onApplyToAll}
        />
      )}

      {/* Comparison Modal */}
      {selectedImage && showComparison && (
        <ImageComparison
          image={selectedImage}
          onClose={() => setShowComparison(false)}
        />
      )}
    </>
  );
}
