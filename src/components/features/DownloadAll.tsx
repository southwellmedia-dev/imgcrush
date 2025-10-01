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
    <Paper
      p="xl"
      radius="md"
      withBorder
      style={{
        background: "var(--color-bg-elevated)",
        borderColor: "var(--color-border-primary)",
        borderWidth: "2px",
      }}
      data-tour="batch-download"
    >
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <Stack gap={4}>
            <Group gap="xs">
              <Archive size={22} color="var(--mantine-color-red-6)" strokeWidth={2.5} />
              <Text size="xl" fw={700} style={{ color: "var(--color-text-primary)" }}>
                Export Center
              </Text>
            </Group>
            <Text size="sm" c="dimmed">
              {processedImages.length} {processedImages.length === 1 ? "image" : "images"} ready to download
            </Text>
          </Stack>
          <Badge
            size="lg"
            variant="light"
            color="green"
            leftSection={<CheckCircle2 size={16} />}
          >
            {processedImages.length} {processedImages.length === 1 ? "file" : "files"}
          </Badge>
        </Group>

        {/* Stats Grid */}
        <Group gap="lg" grow>
          <Paper
            p="md"
            radius="md"
            withBorder
            style={{
              borderColor: "var(--color-border-primary)",
              background: "var(--color-bg-secondary)",
            }}
          >
            <Stack gap="xs">
              <Text size="xs" c="dimmed" fw={600} tt="uppercase" style={{ letterSpacing: "0.5px" }}>
                Original Size
              </Text>
              <Text size="xl" fw={700} style={{ color: "var(--color-text-primary)" }}>
                {formatFileSize(totalOriginalSize)}
              </Text>
            </Stack>
          </Paper>

          <Paper
            p="md"
            radius="md"
            withBorder
            style={{
              borderColor: "var(--color-border-primary)",
              background: "var(--color-bg-secondary)",
            }}
          >
            <Stack gap="xs">
              <Text size="xs" c="dimmed" fw={600} tt="uppercase" style={{ letterSpacing: "0.5px" }}>
                Optimized Size
              </Text>
              <Text size="xl" fw={700} style={{ color: "#10b981" }}>
                {formatFileSize(totalProcessedSize)}
              </Text>
            </Stack>
          </Paper>

          <Paper
            p="md"
            radius="md"
            style={{
              background: "#10b981",
              border: "none",
            }}
          >
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
          </Paper>
        </Group>

        {/* Progress Bar */}
        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="xs" fw={600} c="dimmed">
              Overall Compression
            </Text>
            <Text size="xs" fw={600} style={{ color: "#10b981" }}>
              {compressionRatio.toFixed(1)}% reduction
            </Text>
          </Group>
          <Progress
            value={compressionRatio}
            size="lg"
            radius="xl"
            color="green"
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
              color="blue"
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
            color="red"
            variant="filled"
            style={{ marginLeft: "auto" }}
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
    </Paper>
  );
}
