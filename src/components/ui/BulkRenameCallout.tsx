import React, { useRef, useEffect } from 'react';
import { Group, Text, Button, Badge } from '@mantine/core';
import { Edit2, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

interface BulkRenameCalloutProps {
  imageCount: number;
  onOpenRename: () => void;
}

export function BulkRenameCallout({ imageCount, onOpenRename }: BulkRenameCalloutProps) {
  // Hooks must be called before any early returns
  const shouldReduceMotion = useReducedMotion();
  const isFirstRender = useRef(true);

  useEffect(() => {
    isFirstRender.current = false;
  }, []);

  // Early return after all hooks
  if (imageCount < 2) return null;

  const shouldAnimate = !isFirstRender.current && !shouldReduceMotion;

  return (
    <motion.div
      className="elevation-sm"
      initial={shouldAnimate ? { opacity: 0, y: -10 } : { opacity: 1, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldAnimate ? 0.3 : 0, delay: shouldAnimate ? 0.1 : 0 }}
      style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(16, 185, 129, 0.08) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '12px',
        padding: '16px 20px',
      }}
    >
      <Group justify="space-between" align="center">
        <Group gap="md">
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Edit2 size={20} color="white" />
          </div>
          <div>
            <Group gap="xs" align="center">
              <Text size="sm" fw={600} style={{ color: 'var(--color-text-primary)' }}>
                Organize Your Files
              </Text>
              <Badge size="sm" leftSection={<Sparkles size={12} />} className="badge-success-subtle">
                Pro Tip
              </Badge>
            </Group>
            <Text size="xs" style={{ color: 'var(--color-text-secondary)' }}>
              Rename all {imageCount} images at once with custom patterns and numbering
            </Text>
          </div>
        </Group>

        <Button
          variant="filled"
          size="sm"
          leftSection={<Edit2 size={16} />}
          onClick={onOpenRename}
          className="transition-smooth"
          style={{
            backgroundColor: 'var(--color-success)',
            borderRadius: '8px',
            fontWeight: 600,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#0ea574';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-success)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Bulk Rename
        </Button>
      </Group>
    </motion.div>
  );
}
