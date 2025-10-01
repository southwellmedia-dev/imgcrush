import React, { useState, useCallback } from 'react';
import { Modal, Button, Group, Stack, Text, SegmentedControl } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import Cropper from 'react-easy-crop';
import { Crop, X } from 'lucide-react';
import { Area, Point } from 'react-easy-crop/types';

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

      // Get correct extension based on format
      const getExtension = (format: string | undefined): string => {
        switch (format) {
          case 'png': return '.png';
          case 'webp': return '.webp';
          case 'avif': return '.avif';
          case 'jpeg':
          default: return '.jpg';
        }
      };

      const extension = getExtension(imageFormat);
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
      title="Crop Image"
      size="xl"
      styles={{
        body: { padding: 0 },
        header: { backgroundColor: 'var(--color-bg-secondary)' },
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
        <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg-secondary)' }}>
          <Stack gap="md">
            {/* Aspect Ratio Selector */}
            <div>
              <Text size="sm" fw={500} mb="xs">Aspect Ratio</Text>
              <SegmentedControl
                value={aspect?.toString() || '0'}
                onChange={(value) => {
                  const numValue = parseFloat(value);
                  setAspect(numValue === 0 ? undefined : numValue);
                }}
                data={aspectRatios}
                fullWidth
              />
            </div>

            {/* Zoom Slider */}
            <div>
              <Text size="sm" fw={500} mb="xs">Zoom: {zoom.toFixed(1)}x</Text>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            {/* Action Buttons */}
            <Group justify="space-between" mt="md">
              <Button
                variant="subtle"
                color="gray"
                leftSection={<X size={16} />}
                onClick={onClose}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                leftSection={<Crop size={16} />}
                onClick={handleCrop}
                loading={isProcessing}
                color="red"
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
