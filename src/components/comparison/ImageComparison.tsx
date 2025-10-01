import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Slider, Stack, Group, Text, Badge, Paper, Button, ActionIcon, Loader } from '@mantine/core';
import { ArrowLeftRight, Layers, ToggleLeft, Move } from 'lucide-react';
import { ProcessedImage } from '../../types';
import { formatFileSize } from '../../utils/fileUtils';

interface ImageComparisonProps {
  image: ProcessedImage;
  onClose: () => void;
}

export function ImageComparison({ image, onClose }: ImageComparisonProps) {
  const [compareMode, setCompareMode] = useState<'slider' | 'side-by-side' | 'toggle'>('slider');
  const [sliderPosition, setSliderPosition] = useState(50);
  const [showOriginal, setShowOriginal] = useState(false);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Use refs to track blob URLs and prevent double-revocation in StrictMode
  const originalUrlRef = useRef<string | null>(null);
  const processedUrlRef = useRef<string | null>(null);

  useEffect(() => {
    // Revoke old URL if it exists (only when dependency changes)
    if (originalUrlRef.current) {
      URL.revokeObjectURL(originalUrlRef.current);
    }

    const url = URL.createObjectURL(image.originalFile);
    originalUrlRef.current = url;
    setOriginalUrl(url);

    // Don't revoke in cleanup - let it persist for StrictMode compatibility
  }, [image.originalFile]);

  useEffect(() => {
    if (image.processedBlob) {
      // Revoke old URL if it exists (only when dependency changes)
      if (processedUrlRef.current) {
        URL.revokeObjectURL(processedUrlRef.current);
      }

      const url = URL.createObjectURL(image.processedBlob);
      processedUrlRef.current = url;
      setProcessedUrl(url);

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

  const compressionRatio = image.processedSize > 0
    ? ((image.originalSize - image.processedSize) / image.originalSize * 100)
    : 0;

  // Handle mouse drag for slider
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.min(100, Math.max(0, percentage)));
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Don't render comparison until both URLs are loaded
  if (!originalUrl || !processedUrl) {
    return (
      <Stack gap="md" align="center" style={{ padding: '40px' }}>
        <Loader size={32} className="animate-spin" />
        <Text size="sm" c="dimmed">Loading images...</Text>
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Button.Group>
          <Button
            variant={compareMode === 'slider' ? 'filled' : 'light'}
            size="sm"
            onClick={() => setCompareMode('slider')}
            leftSection={<ArrowLeftRight size={16} />}
            color="red"
          >
            Slider
          </Button>
          <Button
            variant={compareMode === 'side-by-side' ? 'filled' : 'light'}
            size="sm"
            onClick={() => setCompareMode('side-by-side')}
            leftSection={<Layers size={16} />}
            color="red"
          >
            Side by Side
          </Button>
          <Button
            variant={compareMode === 'toggle' ? 'filled' : 'light'}
            size="sm"
            onClick={() => setCompareMode('toggle')}
            leftSection={<ToggleLeft size={16} />}
            color="red"
          >
            Toggle
          </Button>
        </Button.Group>

        {/* Statistics */}
        <Group gap="sm">
          <Badge variant="light" color="gray" size="lg">
            Original: {formatFileSize(image.originalSize)}
          </Badge>
          <Badge variant="light" color="green" size="lg">
            Compressed: {formatFileSize(image.processedSize)}
          </Badge>
          <Badge variant="filled" color="red" size="lg">
            {compressionRatio < 0 ? '+' : '-'}{Math.abs(compressionRatio).toFixed(1)}%
          </Badge>
        </Group>

      </Group>

      {/* Comparison View */}
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '8px' }}>
        {compareMode === 'slider' && (
          <>
            <div
              ref={containerRef}
              style={{
                position: 'relative',
                width: '100%',
                height: '600px',
                cursor: isDragging ? 'ew-resize' : 'default',
                userSelect: 'none'
              }}
              onMouseDown={(e) => {
                const rect = containerRef.current?.getBoundingClientRect();
                if (rect) {
                  const x = e.clientX - rect.left;
                  const percentage = (x / rect.width) * 100;
                  setSliderPosition(Math.min(100, Math.max(0, percentage)));
                  handleMouseDown(e);
                }
              }}
            >
              {/* Labels */}
              <div style={{
                position: 'absolute',
                top: 20,
                left: 20,
                zIndex: 10,
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 600
              }}>
                ORIGINAL
              </div>
              <div style={{
                position: 'absolute',
                top: 20,
                right: 20,
                zIndex: 10,
                backgroundColor: '#e11d48',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 600
              }}>
                COMPRESSED
              </div>

              {/* Original Image (Left/Bottom Layer) */}
              <img
                src={originalUrl}
                alt="Original"
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  pointerEvents: 'none'
                }}
              />

              {/* Processed Image (Right/Top Layer with clip) */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: `${100 - sliderPosition}%`,
                  height: '100%',
                  overflow: 'hidden',
                  pointerEvents: 'none'
                }}
              >
                <img
                  src={processedUrl}
                  alt="Processed"
                  style={{
                    position: 'absolute',
                    right: 0,
                    width: containerRef.current ? `${(containerRef.current.offsetWidth * 100) / (100 - sliderPosition)}px` : '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              </div>

              {/* Slider Line */}
              <div
                style={{
                  position: 'absolute',
                  left: `${sliderPosition}%`,
                  top: 0,
                  bottom: 0,
                  width: '4px',
                  backgroundColor: '#e11d48',
                  cursor: 'ew-resize',
                  zIndex: 5,
                  transition: isDragging ? 'none' : 'left 0.1s ease',
                }}
                onMouseDown={handleMouseDown}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: '#e11d48',
                    border: '3px solid white',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'ew-resize',
                  }}
                >
                  <ArrowLeftRight size={18} color="white" />
                </div>
              </div>
            </div>

            {/* Helper text */}
            <Text size="xs" c="dimmed" ta="center" mt="sm">
              Drag the slider or click anywhere on the image to compare
            </Text>
          </>
        )}

        {compareMode === 'side-by-side' && (
          <Group gap="md" style={{ width: '100%' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Badge
                size="lg"
                color="gray"
                variant="filled"
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  zIndex: 1
                }}
              >
                ORIGINAL
              </Badge>
              <img
                src={originalUrl}
                alt="Original"
                style={{
                  width: '100%',
                  height: '550px',
                  objectFit: 'contain',
                  borderRadius: '4px',
                  border: '2px solid #e5e7eb',
                  backgroundColor: '#f9fafb'
                }}
              />
              <Text size="xs" c="dimmed" ta="center" mt="xs">
                Size: {formatFileSize(image.originalSize)}
              </Text>
            </div>
            <div style={{ flex: 1, position: 'relative' }}>
              <Badge
                size="lg"
                color="red"
                variant="filled"
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  zIndex: 1
                }}
              >
                COMPRESSED
              </Badge>
              <img
                src={processedUrl}
                alt="Processed"
                style={{
                  width: '100%',
                  height: '550px',
                  objectFit: 'contain',
                  borderRadius: '4px',
                  border: '2px solid #e11d48',
                  backgroundColor: '#fff1f2'
                }}
              />
              <Text size="xs" c="dimmed" ta="center" mt="xs">
                Size: {formatFileSize(image.processedSize)} ({compressionRatio > 0 ? '-' : '+'}{Math.abs(compressionRatio).toFixed(0)}%)
              </Text>
            </div>
          </Group>
        )}

        {compareMode === 'toggle' && (
          <div style={{ textAlign: 'center', position: 'relative' }}>
            <Badge
              size="xl"
              color={showOriginal ? 'gray' : 'red'}
              variant="filled"
              style={{
                position: 'absolute',
                top: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1
              }}
            >
              {showOriginal ? 'ORIGINAL' : 'COMPRESSED'}
            </Badge>
            <img
              src={showOriginal ? originalUrl : processedUrl}
              alt={showOriginal ? 'Original' : 'Processed'}
              style={{
                width: '100%',
                height: '600px',
                objectFit: 'contain',
                borderRadius: '4px',
                border: showOriginal ? '2px solid #e5e7eb' : '2px solid #e11d48',
                backgroundColor: showOriginal ? '#f9fafb' : '#fff1f2',
                transition: 'all 0.3s ease'
              }}
            />
            <Stack gap="sm" mt="md" align="center">
              <Button
                variant={showOriginal ? 'light' : 'filled'}
                size="md"
                color="red"
                onClick={() => setShowOriginal(!showOriginal)}
                leftSection={<ToggleLeft size={20} />}
                fullWidth={false}
                style={{ minWidth: '200px' }}
              >
                {showOriginal ? 'Show Compressed' : 'Show Original'}
              </Button>
              <Text size="sm" c="dimmed">
                {showOriginal
                  ? `Original: ${formatFileSize(image.originalSize)}`
                  : `Compressed: ${formatFileSize(image.processedSize)} (${compressionRatio > 0 ? '-' : '+'}${Math.abs(compressionRatio).toFixed(0)}%)`}
              </Text>
            </Stack>
          </div>
        )}
      </div>
    </Stack>
  );
}