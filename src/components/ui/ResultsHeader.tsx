import React from 'react';
import { Container, Group, ActionIcon, Tooltip } from '@mantine/core';
import { Github, Home, Grid3x3, List } from 'lucide-react';

export type ViewMode = 'grid' | 'list';

interface ResultsHeaderProps {
  onReset?: () => void;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
}

export function ResultsHeader({ onReset, viewMode = 'grid', onViewModeChange }: ResultsHeaderProps) {
  return (
    <header style={{ borderBottom: '1px solid #e9ecef', backgroundColor: 'white' }}>
      <Container size="xl" py="md">
        <Group justify="space-between" align="center">
          {/* Logo */}
          <img
            src="/logo.svg"
            alt="ImgCrush"
            style={{ height: '40px', cursor: onReset ? 'pointer' : 'default' }}
            onClick={onReset}
            data-tour="welcome"
          />

          {/* Actions */}
          <Group gap="xs">
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