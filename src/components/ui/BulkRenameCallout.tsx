import React, { useRef, useEffect } from 'react';
import { Group, Text, Button, Badge } from '@mantine/core';
import { Edit2, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

// Static styles extracted outside component to prevent re-creation on every render
const CALLOUT_STYLES = {
  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(16, 185, 129, 0.08) 100%)',
  border: '1px solid rgba(16, 185, 129, 0.3)',
  borderRadius: '12px',
  padding: '16px 20px',
};

const ICON_CONTAINER_STYLES = {
  width: '40px',
  height: '40px',
  borderRadius: '10px',
  backgroundColor: 'var(--color-success)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const BUTTON_STYLES = {
  borderRadius: '8px',
  fontWeight: 600,
};

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
      style={CALLOUT_STYLES}
    >
      <Group justify="space-between" align="center">
        <Group gap="md">
          <div style={ICON_CONTAINER_STYLES}>
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
          className="btn-success-hover"
          style={BUTTON_STYLES}
        >
          Bulk Rename
        </Button>
      </Group>
    </motion.div>
  );
}
