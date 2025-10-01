import React, { useMemo, useEffect, useRef } from 'react';
import { Group, Text, ActionIcon, Tooltip, Badge, Button } from '@mantine/core';
import { Grid3x3, List, Download, Plus, Settings2 } from 'lucide-react';
import { motion, useMotionValue, useTransform, animate, useReducedMotion } from 'framer-motion';
import { ViewMode } from './ResultsHeader';
import { ProcessedImage } from '../../types';
import { formatFileSize } from '../../utils/fileUtils';
import { getPresetById } from '../../presets/compressionPresets';

// Static styles extracted outside component to prevent re-creation on every render
const HEADER_STYLES = {
  padding: '20px 24px',
  borderRadius: '12px',
};

const ACTION_ICON_STYLES = {
  borderRadius: '10px',
};

// Animated number component
function AnimatedNumber({ value }: { value: number }) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = React.useState(0);

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 0.5,
      ease: 'easeOut',
    });

    const unsubscribe = rounded.on('change', (latest) => setDisplayValue(latest));

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [value, motionValue, rounded]);

  return <>{displayValue}</>;
}

// Animated percentage component
function AnimatedPercentage({ value }: { value: number }) {
  const motionValue = useMotionValue(0);
  const [displayValue, setDisplayValue] = React.useState(0);

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 0.5,
      ease: 'easeOut',
    });

    const unsubscribe = motionValue.on('change', (latest) => setDisplayValue(latest));

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [value, motionValue]);

  return <>{Math.abs(displayValue).toFixed(1)}</>;
}

interface ResultsAreaHeaderProps {
  images: ProcessedImage[];
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onDownloadAll?: () => void;
  onAddImages?: () => void;
  selectedPreset?: string;
  onOpenSettings?: () => void;
}

export function ResultsAreaHeader({
  images,
  viewMode,
  onViewModeChange,
  onDownloadAll,
  onAddImages,
  selectedPreset,
  onOpenSettings,
}: ResultsAreaHeaderProps) {
  // Calculate compression stats
  const stats = useMemo(() => {
    const processedImages = images.filter(img => img.processed);
    const totalOriginal = processedImages.reduce((sum, img) => sum + img.originalSize, 0);
    const totalCompressed = processedImages.reduce((sum, img) => sum + img.processedSize, 0);
    const totalSaved = totalOriginal - totalCompressed;
    const compressionRatio = totalOriginal > 0 ? ((totalSaved / totalOriginal) * 100) : 0;

    return {
      totalImages: images.length,
      processedImages: processedImages.length,
      totalOriginal,
      totalCompressed,
      totalSaved,
      compressionRatio,
    };
  }, [images]);

  const isProcessing = stats.processedImages < stats.totalImages;
  const shouldReduceMotion = useReducedMotion();
  const isFirstRender = useRef(true);

  useEffect(() => {
    isFirstRender.current = false;
  }, []);

  // Skip animation on first render for better LCP
  const shouldAnimate = !isFirstRender.current && !shouldReduceMotion;

  return (
    <motion.header
      className="glass-strong elevation-md"
      initial={shouldAnimate ? { opacity: 0, y: -20 } : { opacity: 1, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldAnimate ? 0.3 : 0 }}
      style={HEADER_STYLES}
    >
      <Group justify="space-between" align="center">
        {/* Left: Compression Stats */}
        <Group gap="xl">
          <div style={{ minWidth: '120px' }}>
            {/* Preset Badge as Title */}
            {selectedPreset ? (
              <Tooltip
                label={`Using ${getPresetById(selectedPreset)?.name || selectedPreset} preset`}
                position="bottom"
                withArrow
              >
                <Badge
                  size="sm"
                  variant="light"
                  className="badge-gray-light"
                  style={{
                    marginBottom: '4px',
                    cursor: 'help',
                  }}
                >
                  {getPresetById(selectedPreset)?.name || selectedPreset}
                </Badge>
              </Tooltip>
            ) : (
              <Text size="xs" c="dimmed" mb={4}>
                Images
              </Text>
            )}
            <Group gap="xs">
              <Text size="xl" fw={700} style={{ color: 'var(--color-text-primary)' }}>
                <AnimatedNumber value={stats.processedImages} />
              </Text>
              <Text size="sm" c="dimmed">
                / <AnimatedNumber value={stats.totalImages} />
              </Text>
              {isProcessing && (
                <Badge size="sm" className="badge-info-subtle">
                  Processing...
                </Badge>
              )}
            </Group>
          </div>

          {stats.processedImages > 0 && (
            <>
              <div style={{ height: '40px', width: '1px', backgroundColor: 'var(--color-border-secondary)' }} />

              <div style={{ minWidth: '180px' }}>
                <Text size="xs" c="dimmed" mb={4}>
                  Total Saved
                </Text>
                <Group gap="xs" align="baseline">
                  <Text
                    size="xl"
                    fw={700}
                    style={{
                      color: stats.compressionRatio < 0 ? 'var(--color-error)' : 'var(--color-success)',
                    }}
                  >
                    {formatFileSize(Math.abs(stats.totalSaved))}
                  </Text>
                  <Badge
                    size="sm"
                    className={stats.compressionRatio < 0 ? 'badge-error-subtle' : 'badge-success-subtle'}
                  >
                    {stats.compressionRatio < 0 ? '+' : '-'}<AnimatedPercentage value={stats.compressionRatio} />%
                  </Badge>
                </Group>
              </div>

              <div style={{ height: '40px', width: '1px', backgroundColor: 'var(--color-border-secondary)' }} />

              <div style={{ minWidth: '160px' }}>
                <Text size="xs" c="dimmed" mb={4}>
                  Size
                </Text>
                <Group gap="xs" align="baseline">
                  <Text size="sm" c="dimmed">
                    {formatFileSize(stats.totalOriginal)}
                  </Text>
                  <Text size="sm" fw={500} style={{ color: 'var(--color-text-tertiary)' }}>
                    →
                  </Text>
                  <Text size="sm" fw={600} style={{ color: 'var(--color-text-primary)' }}>
                    {formatFileSize(stats.totalCompressed)}
                  </Text>
                </Group>
              </div>
            </>
          )}
        </Group>

        {/* Right: Action Icons */}
        <Group gap="xs">
          {onAddImages && (
            <>
              <Button
                variant="light"
                size="md"
                leftSection={<Plus size={18} />}
                onClick={onAddImages}
                className="transition-smooth"
                style={{
                  borderRadius: '10px',
                  fontWeight: 600,
                }}
              >
                Add Images
              </Button>

              <div style={{ height: '32px', width: '1px', backgroundColor: 'var(--color-border-secondary)', margin: '0 8px' }} />
            </>
          )}

          <Tooltip label="Grid view" position="bottom">
            <ActionIcon
              variant="subtle"
              size="lg"
              onClick={() => onViewModeChange('grid')}
              className={viewMode === 'grid' ? "elevation-sm" : "elevation-sm action-icon-hover"}
              style={{
                ...ACTION_ICON_STYLES,
                backgroundColor: viewMode === 'grid' ? 'var(--color-primary-light)' : 'var(--color-bg-elevated)',
                color: viewMode === 'grid' ? 'var(--color-primary)' : 'var(--color-text-primary)',
              }}
            >
              <Grid3x3 size={20} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="List view" position="bottom">
            <ActionIcon
              variant="subtle"
              size="lg"
              onClick={() => onViewModeChange('list')}
              className={viewMode === 'list' ? "elevation-sm" : "elevation-sm action-icon-hover"}
              style={{
                ...ACTION_ICON_STYLES,
                backgroundColor: viewMode === 'list' ? 'var(--color-primary-light)' : 'var(--color-bg-elevated)',
                color: viewMode === 'list' ? 'var(--color-primary)' : 'var(--color-text-primary)',
              }}
            >
              <List size={20} />
            </ActionIcon>
          </Tooltip>

          {stats.processedImages > 1 && onDownloadAll && (
            <>
              <div style={{ height: '32px', width: '1px', backgroundColor: 'var(--color-border-secondary)', margin: '0 4px' }} />

              <Tooltip label="Download all as ZIP" position="bottom">
                <ActionIcon
                  variant="filled"
                  size="lg"
                  onClick={onDownloadAll}
                  className="elevation-md action-icon-primary-hover"
                  style={ACTION_ICON_STYLES}
                >
                  <Download size={20} />
                </ActionIcon>
              </Tooltip>
            </>
          )}

          {/* Global Settings Button */}
          {onOpenSettings && (
            <Tooltip label="Global settings" position="bottom">
              <ActionIcon
                variant="light"
                size="lg"
                onClick={onOpenSettings}
                className="transition-smooth"
                style={{
                  borderRadius: '10px',
                }}
              >
                <Settings2 size={20} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      </Group>
    </motion.header>
  );
}
