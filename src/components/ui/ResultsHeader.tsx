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
    <header style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
      <Container size="xl" py="md">
        <Group justify="space-between" align="center">
          {/* Logo */}
          <img
            src={isDark ? '/logo-darkmode.svg' : '/logo.svg'}
            alt="ImgCrush"
            style={{ height: '40px', cursor: onReset ? 'pointer' : 'default' }}
            onClick={onReset}
            data-tour="welcome"
          />

          {/* Actions */}
          <Group gap="xs">
            {/* Dark Mode Toggle */}
            <Tooltip label={isDark ? 'Light mode' : 'Dark mode'}>
              <ActionIcon
                variant="light"
                color="gray"
                size="lg"
                onClick={() => toggleColorScheme()}
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </ActionIcon>
            </Tooltip>

            {/* View Mode Toggle */}
            {onViewModeChange && (
              <>
                <Tooltip label="Grid view">
                  <ActionIcon
                    variant={viewMode === 'grid' ? 'filled' : 'light'}
                    color={viewMode === 'grid' ? 'red' : 'gray'}
                    size="lg"
                    onClick={() => onViewModeChange('grid')}
                  >
                    <Grid3x3 size={18} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="List view">
                  <ActionIcon
                    variant={viewMode === 'list' ? 'filled' : 'light'}
                    color={viewMode === 'list' ? 'red' : 'gray'}
                    size="lg"
                    onClick={() => onViewModeChange('list')}
                  >
                    <List size={18} />
                  </ActionIcon>
                </Tooltip>
              </>
            )}

            {onReset && (
              <Tooltip label="Start over">
                <ActionIcon
                  variant="light"
                  color="gray"
                  size="lg"
                  onClick={onReset}
                >
                  <Home size={18} />
                </ActionIcon>
              </Tooltip>
            )}
            <Tooltip label="View on GitHub">
              <ActionIcon
                component="a"
                href="https://github.com/southwellmedia-dev/imgcrush"
                target="_blank"
                rel="noopener noreferrer"
                variant="subtle"
                color="gray"
                size="lg"
              >
                <Github size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </Container>
    </header>
  );
}