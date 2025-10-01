// React import not required with new JSX transform
import { useState } from "react";
import { Download, Package, TrendingDown, Check, Trash2, Sparkles, Archive, CheckCircle2, Edit2 } from "lucide-react";
import {
  Paper,
  Group,
  Stack,
  Text,
  Button,
  Badge,
  Progress,
} from "@mantine/core";
import JSZip from "jszip";
import { ProcessedImage } from "../../types";
import { formatFileSize } from "../../utils/fileUtils";
import { BulkRenameModal } from "./BulkRenameModal";

// Static styles extracted outside component to prevent re-creation on every render
const CONTAINER_STYLES = {
  padding: '24px',
  borderRadius: '12px',
  border: '1px solid var(--color-border-glass)',
};

const STATS_BOX_STYLES = {
  padding: '16px',
  borderRadius: '12px',
  border: '1px solid var(--color-border-glass)',
};

const SPACE_SAVED_BOX_STYLES = {
  padding: '16px',
  borderRadius: '12px',
  background: 'var(--color-success)',
};

const BUTTON_STYLES = {
  borderRadius: '10px',
  fontWeight: 600,
};

interface DownloadAllProps {
  images: ProcessedImage[];
  onBulkRename?: (renamedFiles: Map<string, string>) => void;
}

export function DownloadAll({ images, onBulkRename }: DownloadAllProps) {
  const [showRenameModal, setShowRenameModal] = useState(false);
  const handleDownloadAll = async () => {
    const zip = new JSZip();

    images.forEach((image) => {
      if (image.processedBlob) {
        // Get the correct extension based on output format
        const getExtension = (format: string | undefined): string => {
          switch (format) {
            case 'jpeg': return '.jpg';
            case 'png': return '.png';
            case 'webp': return '.webp';
            case 'avif': return '.avif';
            default: {
              // Fallback to original extension
              const originalName = image.originalFile.name;
              const lastDotIndex = originalName.lastIndexOf(".");
              return lastDotIndex > 0 ? originalName.substring(lastDotIndex) : ".jpg";
            }
          }
        };

        const extension = getExtension(image.outputFormat);
        const baseName = image.customFileName ||
          image.originalFile.name.replace(/\.[^/.]+$/, '') || 'image';
        const filename = image.customFileName
          ? `${image.customFileName}${extension}`
          : `compressed_${baseName}${extension}`;
        zip.file(filename, image.processedBlob);
      }
    });

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "compressed_images.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const processedImages = images.filter((img) => img.processed);
  const totalOriginalSize = images.reduce(
    (sum, img) => sum + img.originalSize,
    0
  );
  const totalProcessedSize = images.reduce(
    (sum, img) => sum + img.processedSize,
    0
  );
  const totalSaved = totalOriginalSize - totalProcessedSize;
  const compressionRatio =
    totalOriginalSize > 0 ? (totalSaved / totalOriginalSize) * 100 : 0;
  const formattedSaved = `${totalSaved >= 0 ? '' : '+'}${formatFileSize(Math.abs(totalSaved))}`;

  // Only show batch download for multiple images
  if (processedImages.length <= 1) return null;

  return (
    <div
      className="glass-strong elevation-lg"
      style={CONTAINER_STYLES}
      data-tour="batch-download"
    >
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <Stack gap={4}>
            <Group gap="xs">
              <Archive size={24} color="var(--color-primary)" strokeWidth={2.5} />
              <Text size="xl" fw={700} style={{ color: "var(--color-text-primary)" }}>
                Export Center
              </Text>
            </Group>
            <Text size="sm" style={{ color: 'var(--color-text-tertiary)' }}>
              {processedImages.length} {processedImages.length === 1 ? "image" : "images"} ready to download
            </Text>
          </Stack>
          <Badge
            size="lg"
            leftSection={<CheckCircle2 size={16} color="var(--color-success)" />}
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--color-success)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              fontWeight: 600,
            }}
          >
            {processedImages.length} {processedImages.length === 1 ? "file" : "files"}
          </Badge>
        </Group>

        {/* Stats Grid */}
        <Group gap="lg" grow>
          <div className="glass elevation-sm" style={STATS_BOX_STYLES}>
            <Stack gap="xs">
              <Text size="xs" fw={600} tt="uppercase" style={{ letterSpacing: "0.5px", color: 'var(--color-text-tertiary)' }}>
                Original Size
              </Text>
              <Text size="xl" fw={700} style={{ color: "var(--color-text-primary)" }}>
                {formatFileSize(totalOriginalSize)}
              </Text>
            </Stack>
          </div>

          <div className="glass elevation-sm" style={STATS_BOX_STYLES}>
            <Stack gap="xs">
              <Text size="xs" fw={600} tt="uppercase" style={{ letterSpacing: "0.5px", color: 'var(--color-text-tertiary)' }}>
                Optimized Size
              </Text>
              <Text size="xl" fw={700} style={{ color: "var(--color-success)" }}>
                {formatFileSize(totalProcessedSize)}
              </Text>
            </Stack>
          </div>

          <div className="elevation-md" style={SPACE_SAVED_BOX_STYLES}>
            <Stack gap="xs">
              <Text size="xs" fw={600} tt="uppercase" style={{ color: "rgba(255, 255, 255, 0.9)", letterSpacing: "0.5px" }}>
                Space Saved
              </Text>
              <Group gap="xs" align="baseline">
                <Text size="xl" fw={700} style={{ color: "white" }}>
                  {compressionRatio.toFixed(1)}%
                </Text>
                <Text size="sm" fw={600} style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                  ({formattedSaved})
                </Text>
              </Group>
            </Stack>
          </div>
        </Group>

        {/* Progress Bar */}
        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="xs" fw={600} style={{ color: 'var(--color-text-tertiary)' }}>
              Overall Compression
            </Text>
            <Text size="xs" fw={600} style={{ color: "var(--color-success)" }}>
              {compressionRatio.toFixed(1)}% reduction
            </Text>
          </Group>
          <Progress
            value={compressionRatio}
            size="lg"
            radius="xl"
            style={{
              backgroundColor: 'var(--color-bg-tertiary)',
            }}
            styles={{
              section: {
                background: 'var(--color-success)',
              },
            }}
          />
        </Stack>

        {/* Action Buttons */}
        <Group justify="space-between" wrap="wrap" gap="md">
          {/* Left: Rename All button */}
          {onBulkRename && (
            <Button
              size="md"
              leftSection={<Edit2 size={18} />}
              onClick={() => setShowRenameModal(true)}
              variant="light"
              className="transition-smooth"
              style={{
                borderRadius: '10px',
              }}
            >
              Rename All
            </Button>
          )}
          {/* Right: Download button */}
          <Button
            size="md"
            leftSection={<Download size={20} />}
            rightSection={<Package size={16} />}
            onClick={handleDownloadAll}
            variant="filled"
            className="elevation-md btn-primary-hover"
            style={{ ...BUTTON_STYLES, marginLeft: "auto" }}
          >
            Download All as ZIP
          </Button>
        </Group>
      </Stack>

      {/* Bulk Rename Modal */}
      {onBulkRename && (
        <BulkRenameModal
          opened={showRenameModal}
          onClose={() => setShowRenameModal(false)}
          images={processedImages}
          onApply={onBulkRename}
        />
      )}
    </div>
  );
}
