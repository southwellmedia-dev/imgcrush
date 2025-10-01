import React, { useState, useCallback } from 'react';
import { Modal, Button, Group, Stack, Text, SegmentedControl } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import Cropper from 'react-easy-crop';
import { Crop, X } from 'lucide-react';
import { Area, Point } from 'react-easy-crop/types';

// Static styles for consistent theming
const MODAL_STYLES = {
  body: { padding: 0 },
  header: {
    backgroundColor: 'var(--color-bg-elevated)',
    borderBottom: '1px solid var(--color-border-primary)',
  },
};

const CONTROLS_CONTAINER_STYLES = {
  padding: '24px',
  background: 'var(--color-bg-elevated)',
  borderTop: '1px solid var(--color-border-primary)',
};

const BUTTON_STYLES = {
  borderRadius: '10px',
  fontWeight: 600,
  height: '44px',
};

interface CropModalProps {
  opened: boolean;
  onClose: () => void;
  imageUrl: string;
  imageName: string;
  imageFormat?: 'jpeg' | 'png' | 'webp' | 'avif';
  onCropComplete: (croppedImage: Blob, croppedFileName: string) => void;
}

export function CropModal({ opened, onClose, imageUrl, imageName, imageFormat, onCropComplete }: CropModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState<number | undefined>(16 / 9);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = (location: Point) => {
    setCrop(location);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onCropAreaChange = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = async (): Promise<Blob> => {
    if (!croppedAreaPixels) {
      throw new Error('No crop area defined');
    }

    return new Promise((resolve, reject) => {
      const image = new Image();

      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Set canvas size to cropped dimensions
        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;

        // Draw the cropped portion
        ctx.drawImage(
          image,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          croppedAreaPixels.width,
          croppedAreaPixels.height
        );

        // Determine MIME type based on format, preserving transparency for PNG/WebP
        const getMimeType = (format: string | undefined): string => {
          switch (format) {
            case 'png': return 'image/png';
            case 'webp': return 'image/webp';
            case 'avif': return 'image/avif';
            case 'jpeg':
            default: return 'image/jpeg';
          }
        };

        const mimeType = getMimeType(imageFormat);
        const quality = mimeType === 'image/png' ? undefined : 0.95;

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          mimeType,
          quality
        );
      };

      image.onerror = () => reject(new Error('Failed to load image'));

      // Set src after handlers are registered to avoid race condition
      image.src = imageUrl;
    });
  };

  const handleCrop = async () => {
    if (!croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      const croppedBlob = await createCroppedImage();

      // Get correct extension based on actual blob type (handles browser fallbacks)
      const getExtension = (format: string | undefined): string => {
        switch (format) {
          case 'png': return '.png';
          case 'webp': return '.webp';
          case 'avif': return '.avif';
          case 'jpeg':
          default: return '.jpg';
        }
      };

      // Derive extension from actual blob type to handle browser fallbacks
      const extension = (() => {
        switch (croppedBlob.type) {
          case 'image/png':
            return '.png';
          case 'image/webp':
            return '.webp';
          case 'image/avif':
            return '.avif';
          case 'image/jpeg':
          case 'image/jpg':
            return '.jpg';
          default:
            return getExtension(imageFormat);
        }
      })();

      const baseName = imageName.replace(/\.[^/.]+$/, '') || 'image';
      const croppedFileName = `${baseName}_cropped${extension}`;
      onCropComplete(croppedBlob, croppedFileName);
      onClose();
    } catch (error) {
      console.error('Crop error:', error);
      notifications.show({
        title: 'Crop Failed',
        message: 'Could not crop the image. Please try again.',
        color: 'red',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const aspectRatios = [
    { label: 'Free', value: '0' },
    { label: '1:1', value: '1' },
    { label: '4:3', value: '1.333' },
    { label: '16:9', value: '1.778' },
    { label: '9:16', value: '0.563' },
  ];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <Crop size={20} />
          <Text fw={700} style={{ color: 'var(--color-text-primary)' }}>Crop Image</Text>
        </Group>
      }
      size="xl"
      centered
      styles={MODAL_STYLES}
      classNames={{
        content: 'glass-strong elevation-xl'
      }}
    >
      <Stack gap="md">
        {/* Crop Area */}
        <div style={{ position: 'relative', width: '100%', height: 500, backgroundColor: '#000' }}>
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropAreaChange}
          />
        </div>

        {/* Controls */}
        <div style={CONTROLS_CONTAINER_STYLES}>
          <Stack gap="lg">
            {/* Aspect Ratio Selector */}
            <div>
              <Text size="sm" fw={600} mb="xs" style={{ color: 'var(--color-text-primary)' }}>
                Aspect Ratio
              </Text>
              <SegmentedControl
                value={aspect?.toString() || '0'}
                onChange={(value) => {
                  const numValue = parseFloat(value);
                  setAspect(numValue === 0 ? undefined : numValue);
                }}
                data={aspectRatios}
                fullWidth
                color="red"
                size="md"
                styles={{
                  root: {
                    backgroundColor: 'var(--color-bg-tertiary)',
                    borderRadius: '10px',
                  },
                }}
              />
            </div>

            {/* Zoom Slider */}
            <div>
              <Group justify="space-between" mb="xs">
                <Text size="sm" fw={600} style={{ color: 'var(--color-text-primary)' }}>
                  Zoom
                </Text>
                <Text size="sm" fw={500} style={{ color: 'var(--color-primary)' }}>
                  {zoom.toFixed(1)}x
                </Text>
              </Group>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="crop-zoom-slider"
              />
            </div>

            {/* Action Buttons */}
            <Group justify="space-between" mt="md">
              <Button
                variant="light"
                color="gray"
                leftSection={<X size={18} />}
                onClick={onClose}
                disabled={isProcessing}
                className="transition-smooth"
                style={{ ...BUTTON_STYLES, minWidth: '140px' }}
              >
                Cancel
              </Button>
              <Button
                leftSection={<Crop size={18} />}
                onClick={handleCrop}
                loading={isProcessing}
                className="btn-primary-hover elevation-md"
                style={{ ...BUTTON_STYLES, minWidth: '160px' }}
              >
                Apply Crop
              </Button>
            </Group>
          </Stack>
        </div>
      </Stack>
    </Modal>
  );
}
