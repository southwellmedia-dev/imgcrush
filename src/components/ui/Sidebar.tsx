import React, { useState, useMemo } from 'react';
import { Stack, ActionIcon, Divider, Text, UnstyledButton, Group, Tooltip, Button } from '@mantine/core';
import { Github, Home, Image, Moon, Sun, ChevronLeft, ChevronRight, Settings, Edit2, Download, Package } from 'lucide-react';
import { useMantineColorScheme } from '@mantine/core';
import { motion, AnimatePresence } from 'framer-motion';
import { ProcessedImage } from '../../types';
import { formatFileSize } from '../../utils/fileUtils';

interface SidebarProps {
  onReset?: () => void;
  hasImages?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  onOpenSettings?: () => void;
  onOpenBulkRename?: () => void;
  onDownloadZip?: () => void;
  images?: ProcessedImage[];
}

export function Sidebar({ onReset, hasImages, onCollapsedChange, onOpenSettings, onOpenBulkRename, onDownloadZip, images = [] }: SidebarProps) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const [collapsed, setCollapsed] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Calculate export stats
  const stats = useMemo(() => {
    const processedImages = images.filter(img => img.processed);
    const totalOriginal = images.reduce((sum, img) => sum + img.originalSize, 0);
    const totalProcessed = images.reduce((sum, img) => sum + img.processedSize, 0);
    const totalSaved = totalOriginal - totalProcessed;
    const compressionRatio = totalOriginal > 0 ? ((totalSaved / totalOriginal) * 100) : 0;

    return {
      processedCount: processedImages.length,
      totalCount: images.length,
      totalOriginal,
      totalProcessed,
      totalSaved,
      compressionRatio,
    };
  }, [images]);

  const handleCollapse = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    setHasInteracted(true); // Enable animations after first interaction
    if (onCollapsedChange) {
      onCollapsedChange(newCollapsed);
    }
  };

  const NavItem = ({
    icon: Icon,
    label,
    onClick,
    active = false,
    disabled = false,
  }: {
    icon: any;
    label: string;
    onClick?: () => void;
    active?: boolean;
    disabled?: boolean;
  }) => (
    <motion.div
      whileHover={{ scale: active || disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      <UnstyledButton
        onClick={disabled ? undefined : onClick}
        className="transition-smooth"
        disabled={disabled}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: collapsed ? '0' : '12px',
          padding: collapsed ? '12px' : '12px 16px',
          borderRadius: '12px',
          backgroundColor: active ? 'var(--color-primary-light)' : 'transparent',
          color: disabled ? 'var(--color-text-disabled)' : (active ? 'var(--color-primary)' : 'var(--color-text-primary)'),
          width: '100%',
          justifyContent: collapsed ? 'center' : 'flex-start',
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
        onMouseEnter={(e) => {
          if (!active && !disabled) e.currentTarget.style.backgroundColor = 'var(--color-hover-bg)';
        }}
        onMouseLeave={(e) => {
          if (!active && !disabled) e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <Icon size={20} />
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              key="label"
              initial={hasInteracted ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={hasInteracted ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
              transition={{ duration: hasInteracted ? 0.2 : 0 }}
            >
              <Text size="sm" fw={500}>
                {label}
              </Text>
            </motion.div>
          )}
        </AnimatePresence>
      </UnstyledButton>
    </motion.div>
  );

  return (
    <motion.aside
      className="glass-strong elevation-lg"
      initial={{ width: 240 }}
      animate={{
        width: collapsed ? 80 : 240,
      }}
      transition={{
        duration: hasInteracted ? 0.3 : 0,
        ease: [0.4, 0, 0.2, 1],
      }}
      style={{
        minHeight: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        borderRight: '1px solid var(--color-border-glass)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        willChange: hasInteracted ? 'width' : 'auto',
      }}
    >
      {/* Logo & Collapse Toggle */}
      <motion.div
        style={{
          padding: collapsed ? '20px 12px' : '20px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between'
        }}
        animate={{ padding: collapsed ? '20px 12px' : '20px 16px' }}
        transition={{ duration: hasInteracted ? 0.3 : 0 }}
      >
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.img
              key="logo"
              src={isDark ? '/logo-darkmode.svg' : '/logo.svg'}
              alt="ImgCrush"
              initial={hasInteracted ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={hasInteracted ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
              transition={{ duration: hasInteracted ? 0.2 : 0 }}
              style={{ height: '40px', cursor: 'pointer' }}
              onClick={onReset}
              whileHover={{ scale: 1.05 }}
            />
          )}
        </AnimatePresence>
        <ActionIcon
          variant="subtle"
          size="md"
          onClick={handleCollapse}
          className="transition-smooth"
          style={{
            borderRadius: '8px',
          }}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </ActionIcon>
      </motion.div>

      <Divider style={{ borderColor: 'var(--color-border-glass)' }} />

      {/* Navigation */}
      <Stack gap="xs" style={{ padding: '16px', flex: 1 }}>
        <NavItem icon={Home} label="Home" onClick={onReset} active={!hasImages} />

        <Tooltip label="Choose images first" disabled={hasImages} position="right" withArrow>
          <div>
            <NavItem icon={Image} label="Compress" active={hasImages} disabled={!hasImages} />
          </div>
        </Tooltip>

        <Divider my="md" style={{ borderColor: 'var(--color-border-glass)' }} />

        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              key="tools-header"
              initial={hasInteracted ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={hasInteracted ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
              transition={{ duration: hasInteracted ? 0.2 : 0 }}
            >
              <Text
                size="xs"
                fw={600}
                tt="uppercase"
                style={{
                  color: 'var(--color-text-tertiary)',
                  letterSpacing: '0.5px',
                  padding: '8px 16px 4px 16px',
                }}
              >
                Tools
              </Text>
            </motion.div>
          )}
        </AnimatePresence>

        {onOpenSettings && (
          <Tooltip label="Choose images first" disabled={hasImages} position="right" withArrow>
            <div>
              <NavItem icon={Settings} label="Global Settings" onClick={onOpenSettings} disabled={!hasImages} />
            </div>
          </Tooltip>
        )}

        {onOpenBulkRename && (
          <Tooltip label="Choose images first" disabled={hasImages} position="right" withArrow>
            <div>
              <NavItem icon={Edit2} label="Bulk Rename" onClick={onOpenBulkRename} disabled={!hasImages} />
            </div>
          </Tooltip>
        )}

        {onDownloadZip && (
          <Tooltip label="Choose images first" disabled={hasImages} position="right" withArrow>
            <div>
              <NavItem icon={Download} label="Download ZIP" onClick={onDownloadZip} disabled={!hasImages} />
            </div>
          </Tooltip>
        )}
      </Stack>

      {/* Export Stats Box */}
      <AnimatePresence>
        {hasImages && stats.processedCount > 0 && !collapsed && (
          <motion.div
            key="export-stats"
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={hasInteracted ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
            transition={{ duration: hasInteracted ? 0.3 : 0 }}
            className="glass elevation-sm"
            style={{
              margin: '0 16px 16px 16px',
              padding: '12px',
              borderRadius: '10px',
              border: '1px solid var(--color-border-glass)',
            }}
          >
          <Stack gap="xs">
            <Text
              size="xs"
              fw={600}
              tt="uppercase"
              style={{
                color: 'var(--color-text-tertiary)',
                letterSpacing: '0.5px',
              }}
            >
              Export Ready
            </Text>

            <Tooltip
              label={`${stats.processedCount} of ${stats.totalCount} images processed and ready to download`}
              position="right"
              withArrow
            >
              <Group justify="space-between" style={{ cursor: 'help' }}>
                <Text size="xs" style={{ color: 'var(--color-text-secondary)' }}>
                  Files:
                </Text>
                <Text size="xs" fw={600} style={{ color: 'var(--color-text-primary)' }}>
                  {stats.processedCount} / {stats.totalCount}
                </Text>
              </Group>
            </Tooltip>

            <Tooltip
              label={`Original: ${formatFileSize(stats.totalOriginal)} → Compressed: ${formatFileSize(stats.totalProcessed)}`}
              position="right"
              withArrow
            >
              <Group justify="space-between" style={{ cursor: 'help' }}>
                <Text size="xs" style={{ color: 'var(--color-text-secondary)' }}>
                  Saved:
                </Text>
                <Text size="xs" fw={600} style={{ color: 'var(--color-success)' }}>
                  {stats.compressionRatio.toFixed(1)}%
                </Text>
              </Group>
            </Tooltip>

            <Tooltip
              label={`Original: ${formatFileSize(stats.totalOriginal)} → Saved: ${formatFileSize(Math.abs(stats.totalSaved))}`}
              position="right"
              withArrow
            >
              <Group justify="space-between" style={{ cursor: 'help' }}>
                <Text size="xs" style={{ color: 'var(--color-text-secondary)' }}>
                  Size:
                </Text>
                <Text size="xs" fw={600} style={{ color: 'var(--color-text-primary)' }}>
                  {formatFileSize(stats.totalProcessed)}
                </Text>
              </Group>
            </Tooltip>

            <Divider style={{ borderColor: 'var(--color-border-glass)', margin: '4px 0' }} />

            <Button
              size="xs"
              fullWidth
              leftSection={<Download size={14} />}
              rightSection={<Package size={12} />}
              onClick={onDownloadZip}
              className="transition-smooth"
              style={{
                backgroundColor: 'var(--color-primary)',
                borderRadius: '8px',
                fontWeight: 600,
                height: '32px',
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
              Download ZIP
            </Button>
          </Stack>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Actions */}
      <Stack gap="xs" style={{ padding: '16px', marginTop: 'auto' }}>
        <Divider style={{ borderColor: 'var(--color-border-glass)' }} />

        <NavItem
          icon={isDark ? Sun : Moon}
          label={isDark ? 'Light Mode' : 'Dark Mode'}
          onClick={() => toggleColorScheme()}
        />

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <UnstyledButton
            component="a"
            href="https://github.com/southwellmedia-dev/imgcrush"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-smooth"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: collapsed ? '0' : '12px',
              padding: collapsed ? '12px' : '12px 16px',
              borderRadius: '12px',
              backgroundColor: 'transparent',
              color: 'var(--color-text-primary)',
              width: '100%',
              justifyContent: collapsed ? 'center' : 'flex-start',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-hover-bg)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Github size={20} />
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.div
                  key="github-label"
                  initial={hasInteracted ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={hasInteracted ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
                  transition={{ duration: hasInteracted ? 0.2 : 0 }}
                >
                  <Text size="sm" fw={500}>
                    GitHub
                  </Text>
                </motion.div>
              )}
            </AnimatePresence>
          </UnstyledButton>
        </motion.div>

        {/* Copyright */}
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              key="copyright"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={hasInteracted ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: hasInteracted ? 0.2 : 0 }}
            >
              <Divider style={{ borderColor: 'var(--color-border-glass)' }} mt="xs" />
              <Text
                size="xs"
                style={{
                  color: 'var(--color-text-muted)',
                  textAlign: 'center',
                  padding: '8px 0',
                }}
              >
                © 2025 ImgCrush
              </Text>
            </motion.div>
          )}
        </AnimatePresence>
      </Stack>
    </motion.aside>
  );
}
