// React import not required with new JSX transform
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

    images.forEach((image) => {
      if (image.processedBlob) {
        // Use custom filename if set, otherwise use original with 'compressed_' prefix
        const originalName = image.originalFile.name;
        const extension = originalName.substring(originalName.lastIndexOf('.'));
        const filename = image.customFileName
          ? `${image.customFileName}${extension}`
          : `compressed_${originalName}`;

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
        background: 'var(--color-bg-tertiary)',
        border: '1px solid var(--color-border-primary)'
      }}
      data-tour="batch-download"
    >
      <Group justify="space-between" align="center" wrap="wrap" gap="xl">
        <Stack gap="md" style={{ flex: 1 }}>
          <div>
            <Group gap="sm" mb={4}>
              <Package size={24} color="var(--color-primary)" />
              <Text size="xl" fw={700} style={{ color: 'var(--color-text-primary)' }}>
                {processedImages.length} {processedImages.length === 1 ? 'Image' : 'Images'} Ready
              </Text>
            </Group>
            <Text size="sm" style={{ color: 'var(--color-text-tertiary)' }}>
              All images optimized and ready to download
            </Text>
          </div>

          <Group gap="xl" wrap="wrap">
            <Paper
              p="lg"
              radius="md"
              withBorder
              style={{
                backgroundColor: 'var(--color-bg-elevated)',
                borderColor: '#ef4444',
                borderWidth: '2px',
                minWidth: '180px'
              }}
            >
              <Group gap="xs" mb={8}>
                <Package size={18} color="#ef4444" />
                <Text size="sm" style={{ color: 'var(--color-text-secondary)' }} fw={600}>Original Size</Text>
              </Group>
              <Text size="xl" fw={700} style={{ color: '#ef4444' }}>{formatFileSize(totalOriginalSize)}</Text>
            </Paper>

            <Paper
              p="lg"
              radius="md"
              withBorder
              style={{
                backgroundColor: 'var(--color-bg-elevated)',
                borderColor: '#10b981',
                borderWidth: '2px',
                minWidth: '180px'
              }}
            >
              <Group gap="xs" mb={8}>
                <Check size={18} color="#10b981" />
                <Text size="sm" style={{ color: 'var(--color-text-secondary)' }} fw={600}>Compressed</Text>
              </Group>
              <Text size="xl" fw={700} style={{ color: '#10b981' }}>{formatFileSize(totalProcessedSize)}</Text>
            </Paper>

            <Paper
              p="lg"
              radius="md"
              withBorder
              style={{
                backgroundColor: 'var(--color-bg-elevated)',
                borderColor: '#10b981',
                borderWidth: '2px',
                minWidth: '180px'
              }}
            >
              <Group gap="xs" mb={8}>
                <TrendingDown size={18} color="#10b981" />
                <Text size="sm" style={{ color: 'var(--color-text-secondary)' }} fw={600}>Space Saved</Text>
              </Group>
              <Group gap="sm" align="center">
                <Text size="xl" fw={700} style={{ color: '#10b981' }}>{compressionRatio.toFixed(0)}%</Text>
                <Badge
                  variant="filled"
                  style={{ backgroundColor: '#10b981', color: 'white' }}
                  size="lg"
                >
                  {formatFileSize(totalSaved)}
                </Badge>
              </Group>
            </Paper>
          </Group>

          <Progress
            value={compressionRatio}
            size="lg"
            radius="xl"
            color="green"
            style={{
              maxWidth: 500,
            }}
          />
        </Stack>

        <Group gap="md">
          {onClearAll && (
            <Button
              size="xl"
              leftSection={<Trash2 size={20} />}
              onClick={onClearAll}
              variant="outline"
              color="gray"
              styles={{
                root: {
                  fontSize: '15px',
                  fontWeight: 600,
                  paddingLeft: '28px',
                  paddingRight: '28px',
                  height: '56px',
                  borderWidth: '2px',
                  color: 'var(--color-text-primary)',
                  borderColor: 'var(--color-border-primary)',
                  '&:hover': {
                    backgroundColor: 'var(--color-hover-bg)',
                    borderColor: 'var(--color-text-secondary)'
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