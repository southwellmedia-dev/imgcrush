import React from 'react';
import { Download, Package, TrendingDown, Check, Trash2 } from 'lucide-react';
import { Paper, Group, Stack, Text, Button, Badge, Progress } from '@mantine/core';
import JSZip from 'jszip';
import { ProcessedImage } from '../../types';
import { formatFileSize } from '../../utils/fileUtils';

interface DownloadAllProps {
  images: ProcessedImage[];
  onClearAll?: () => void;
}

export function DownloadAll({ images, onClearAll }: DownloadAllProps) {
  const handleDownloadAll = async () => {
    const zip = new JSZip();

    images.forEach((image, index) => {
      if (image.processedBlob) {
        const filename = `compressed_${image.originalFile.name}`;
        zip.file(filename, image.processedBlob);
      }
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'compressed_images.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const processedImages = images.filter(img => img.processed);
  const totalOriginalSize = images.reduce((sum, img) => sum + img.originalSize, 0);
  const totalProcessedSize = images.reduce((sum, img) => sum + img.processedSize, 0);
  const totalSaved = totalOriginalSize - totalProcessedSize;
  const compressionRatio = totalOriginalSize > 0 ? (totalSaved / totalOriginalSize * 100) : 0;

  // Only show batch download for multiple images
  if (processedImages.length <= 1) return null;

  return (
    <Paper
      p="xl"
      radius="md"
      style={{
        background: 'radial-gradient(circle at bottom right, #374151 0%, #1f2937 60%)',
        border: '1px solid #374151'
      }}
      data-tour="batch-download"
    >
      <Group justify="space-between" align="center" wrap="wrap" gap="xl">
        <Stack gap="md" style={{ flex: 1 }}>
          <div>
            <Group gap="sm" mb={4}>
              <Package size={24} color="#ef4444" />
              <Text size="xl" fw={700} c="white">
                {processedImages.length} {processedImages.length === 1 ? 'Image' : 'Images'} Ready
              </Text>
            </Group>
            <Text size="sm" c="gray.4">
              All images optimized and ready to download
            </Text>
          </div>

          <Group gap="xl" wrap="wrap">
            <Paper p="md" radius="md" style={{ backgroundColor: '#374151', border: '1px solid #4b5563' }}>
              <Group gap="xs" mb={6}>
                <Package size={16} color="#9ca3af" />
                <Text size="xs" c="gray.4" fw={500}>Original Size</Text>
              </Group>
              <Text size="xl" fw={700} c="white">{formatFileSize(totalOriginalSize)}</Text>
            </Paper>

            <Paper p="md" radius="md" style={{ backgroundColor: '#374151', border: '1px solid #4b5563' }}>
              <Group gap="xs" mb={6}>
                <Check size={16} color="#10b981" />
                <Text size="xs" c="gray.4" fw={500}>Compressed Size</Text>
              </Group>
              <Text size="xl" fw={700} c="green.4">{formatFileSize(totalProcessedSize)}</Text>
            </Paper>

            <Paper p="md" radius="md" style={{ backgroundColor: '#065f46', border: '1px solid #047857' }}>
              <Group gap="xs" mb={6}>
                <TrendingDown size={16} color="#6ee7b7" />
                <Text size="xs" c="green.2" fw={500}>Space Saved</Text>
              </Group>
              <Group gap="sm" align="center">
                <Text size="xl" fw={700} c="green.3">{compressionRatio.toFixed(0)}%</Text>
                <Badge
                  variant="filled"
                  color="green"
                  size="lg"
                  style={{ backgroundColor: '#10b981' }}
                >
                  {formatFileSize(totalSaved)}
                </Badge>
              </Group>
            </Paper>
          </Group>

          <Progress
            value={compressionRatio}
            color="green"
            size="lg"
            radius="xl"
            style={{ maxWidth: 500 }}
          />
        </Stack>

        <Group gap="md">
          {onClearAll && (
            <Button
              size="xl"
              leftSection={<Trash2 size={20} />}
              onClick={onClearAll}
              variant="outline"
              styles={{
                root: {
                  fontSize: '15px',
                  fontWeight: 600,
                  paddingLeft: '28px',
                  paddingRight: '28px',
                  height: '56px',
                  borderColor: '#6b7280',
                  color: '#e5e7eb',
                  '&:hover': {
                    backgroundColor: '#374151',
                    borderColor: '#9ca3af'
                  }
                }
              }}
            >
              Clear All
            </Button>
          )}
          <Button
            size="xl"
            leftSection={<Download size={24} />}
            onClick={handleDownloadAll}
            color="red"
            variant="filled"
            styles={{
              root: {
                fontSize: '17px',
                fontWeight: 700,
                paddingLeft: '40px',
                paddingRight: '40px',
                height: '56px'
              }
            }}
          >
            Download All as ZIP
          </Button>
        </Group>
      </Group>
    </Paper>
  );
}