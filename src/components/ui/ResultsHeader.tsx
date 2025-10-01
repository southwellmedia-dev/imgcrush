import React, { useEffect } from 'react';
import { Container, Group, ActionIcon, Tooltip, useMantineColorScheme } from '@mantine/core';
import { Github, Home, Grid3x3, List, Moon, Sun } from 'lucide-react';
import { saveDarkMode } from '../../utils/settingsStorage';

export type ViewMode = 'grid' | 'list';

interface ResultsHeaderProps {
  onReset?: () => void;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
}

export function ResultsHeader({ onReset, viewMode = 'grid', onViewModeChange }: ResultsHeaderProps) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  // Persist dark mode preference
  useEffect(() => {
    saveDarkMode(isDark);
  }, [isDark]);

  return (
    <header
      className="glass-strong elevation-md animate-fade-in"
      style={{
        borderBottom: '1px solid var(--color-border-glass)',
        padding: '20px 0',
        borderRadius: '12px',
        marginBottom: '8px',
      }}
    >
      <Group justify="space-between" align="center" px="lg">
        {/* Logo */}
        {onReset ? (
          <button
            onClick={onReset}
            aria-label="Return to home and start over"
            className="hover-lift logo-hover"
            style={{
              border: 'none',
              background: 'none',
              padding: 0,
              cursor: 'pointer',
            }}
          >
            <img
              src={isDark ? '/logo-darkmode.svg' : '/logo.svg'}
              alt="ImgCrush"
              style={{ height: '42px', display: 'block' }}
            />
          </button>
        ) : (
          <img
            src={isDark ? '/logo-darkmode.svg' : '/logo.svg'}
            alt="ImgCrush"
            style={{ height: '42px' }}
          />
        )}

        {/* Actions */}
        <Group gap="sm">
          {/* Dark Mode Toggle */}
          <Tooltip label={isDark ? 'Light mode' : 'Dark mode'} position="bottom">
            <ActionIcon
              variant="subtle"
              size="xl"
              onClick={() => toggleColorScheme()}
              className="transition-smooth elevation-sm hover:elevation-md"
              style={{
                backgroundColor: 'var(--color-bg-elevated)',
                borderRadius: '12px',
              }}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </ActionIcon>
          </Tooltip>

          {/* View Mode Toggle */}
          {onViewModeChange && (
            <>
              <Tooltip label="Grid view" position="bottom">
                <ActionIcon
                  variant={viewMode === 'grid' ? 'filled' : 'subtle'}
                  color={viewMode === 'grid' ? 'red' : 'gray'}
                  size="xl"
                  onClick={() => onViewModeChange('grid')}
                  className="transition-smooth elevation-sm hover:elevation-md"
                  style={{
                    backgroundColor: viewMode === 'grid' ? 'var(--color-primary)' : 'var(--color-bg-elevated)',
                    borderRadius: '12px',
                  }}
                >
                  <Grid3x3 size={20} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="List view" position="bottom">
                <ActionIcon
                  variant={viewMode === 'list' ? 'filled' : 'subtle'}
                  color={viewMode === 'list' ? 'red' : 'gray'}
                  size="xl"
                  onClick={() => onViewModeChange('list')}
                  className="transition-smooth elevation-sm hover:elevation-md"
                  style={{
                    backgroundColor: viewMode === 'list' ? 'var(--color-primary)' : 'var(--color-bg-elevated)',
                    borderRadius: '12px',
                  }}
                >
                  <List size={20} />
                </ActionIcon>
              </Tooltip>
            </>
          )}

          {onReset && (
            <Tooltip label="Start over" position="bottom">
              <ActionIcon
                variant="subtle"
                size="xl"
                onClick={onReset}
                className="transition-smooth elevation-sm hover:elevation-md"
                style={{
                  backgroundColor: 'var(--color-bg-elevated)',
                  borderRadius: '12px',
                }}
              >
                <Home size={20} />
              </ActionIcon>
            </Tooltip>
          )}
          <Tooltip label="View on GitHub" position="bottom">
            <ActionIcon
              component="a"
              href="https://github.com/southwellmedia-dev/imgcrush"
              target="_blank"
              rel="noopener noreferrer"
              variant="subtle"
              size="xl"
              className="transition-smooth elevation-sm hover:elevation-md"
              style={{
                backgroundColor: 'var(--color-bg-elevated)',
                borderRadius: '12px',
              }}
            >
              <Github size={20} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    </header>
  );
}