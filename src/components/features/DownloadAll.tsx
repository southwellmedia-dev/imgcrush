import React from 'react';
import { Download, Package, Settings } from 'lucide-react';
import { Paper, Group, Stack, Text, Button, Badge, Progress } from '@mantine/core';
import JSZip from 'jszip';
import { ProcessedImage } from '../../types';
import { formatFileSize } from '../../utils/fileUtils';

interface DownloadAllProps {
  images: ProcessedImage[];
  onCustomize?: () => void;
}

export function DownloadAll({ images, onCustomize }: DownloadAllProps) {
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
    <Paper p="lg" radius="md" withBorder bg="red.0">
      <Group justify="space-between" align="center" wrap="wrap">
        <Stack gap="xs">
          <Group gap="xs">
            <Package size={20} color="#e11d48" />
            <Text size="lg" fw={600}>Batch Download Ready</Text>
          </Group>
          <Text size="sm" c="dimmed">
            {processedImages.length} images processed successfully
          </Text>
          <Group gap="md">
            <Badge variant="light" color="gray" size="lg">
              Original: {formatFileSize(totalOriginalSize)}
            </Badge>
            <Badge variant="light" color="green" size="lg">
              Compressed: {formatFileSize(totalProcessedSize)}
            </Badge>
            <Badge variant="filled" color="red" size="lg">
              Saved {compressionRatio.toFixed(0)}%
            </Badge>
          </Group>
          <Progress value={compressionRatio} color="red" size="sm" radius="xl" />
        </Stack>

        <Group gap="sm">
          {onCustomize && (
            <Button
              size="lg"
              leftSection={<Settings size={20} />}
              onClick={onCustomize}
              variant="light"
              color="red"
            >
              Customize
            </Button>
          )}
          <Button
            size="lg"
            leftSection={<Download size={20} />}
            onClick={handleDownloadAll}
            gradient={{ from: 'red', to: 'pink' }}
            variant="gradient"
          >
            Download ZIP
          </Button>
        </Group>
      </Group>
    </Paper>
  );
}