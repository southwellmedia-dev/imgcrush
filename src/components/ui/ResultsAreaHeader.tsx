import React, { useMemo, useEffect, useRef } from 'react';
import { Group, Text, ActionIcon, Tooltip, Badge, Button } from '@mantine/core';
import { Grid3x3, List, Download, Plus } from 'lucide-react';
import { motion, useMotionValue, useTransform, animate, useReducedMotion } from 'framer-motion';
import { ViewMode } from './ResultsHeader';
import { ProcessedImage } from '../../types';
import { formatFileSize } from '../../utils/fileUtils';

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
}

export function ResultsAreaHeader({
  images,
  viewMode,
  onViewModeChange,
  onDownloadAll,
  onAddImages,
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
      style={{
        padding: '20px 24px',
        borderRadius: '12px',
      }}
    >
      <Group justify="space-between" align="center">
        {/* Left: Compression Stats */}
        <Group gap="xl">
          <div style={{ minWidth: '120px' }}>
            <Text size="xs" c="dimmed" mb={4}>
              Images
            </Text>
            <Group gap="xs">
              <Text size="xl" fw={700} style={{ color: 'var(--color-text-primary)' }}>
                <AnimatedNumber value={stats.processedImages} />
              </Text>
              <Text size="sm" c="dimmed">
                / <AnimatedNumber value={stats.totalImages} />
              </Text>
              {isProcessing && (
                <Badge
                  size="sm"
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    color: 'var(--color-info)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                  }}
                >
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
                    style={{
                      backgroundColor: stats.compressionRatio < 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: stats.compressionRatio < 0 ? 'var(--color-error)' : 'var(--color-success)',
                      border: stats.compressionRatio < 0 ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                      fontWeight: 600,
                    }}
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
              className="transition-smooth elevation-sm"
              style={{
                backgroundColor: viewMode === 'grid' ? 'var(--color-primary-light)' : 'var(--color-bg-elevated)',
                color: viewMode === 'grid' ? 'var(--color-primary)' : 'var(--color-text-primary)',
                borderRadius: '10px',
              }}
              onMouseEnter={(e) => {
                if (viewMode !== 'grid') e.currentTarget.style.backgroundColor = 'var(--color-hover-bg)';
              }}
              onMouseLeave={(e) => {
                if (viewMode !== 'grid') e.currentTarget.style.backgroundColor = 'var(--color-bg-elevated)';
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
              className="transition-smooth elevation-sm"
              style={{
                backgroundColor: viewMode === 'list' ? 'var(--color-primary-light)' : 'var(--color-bg-elevated)',
                color: viewMode === 'list' ? 'var(--color-primary)' : 'var(--color-text-primary)',
                borderRadius: '10px',
              }}
              onMouseEnter={(e) => {
                if (viewMode !== 'list') e.currentTarget.style.backgroundColor = 'var(--color-hover-bg)';
              }}
              onMouseLeave={(e) => {
                if (viewMode !== 'list') e.currentTarget.style.backgroundColor = 'var(--color-bg-elevated)';
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
                  className="transition-smooth elevation-md"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    borderRadius: '10px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <Download size={20} />
                </ActionIcon>
              </Tooltip>
            </>
          )}
        </Group>
      </Group>
    </motion.header>
  );
}
