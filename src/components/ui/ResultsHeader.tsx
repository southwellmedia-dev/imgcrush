import React from 'react';
import { Container, Group, ActionIcon, Tooltip } from '@mantine/core';
import { Github, Home } from 'lucide-react';

interface ResultsHeaderProps {
  onReset?: () => void;
}

export function ResultsHeader({ onReset }: ResultsHeaderProps) {
  return (
    <header style={{ borderBottom: '1px solid #e9ecef', backgroundColor: 'white' }}>
      <Container size="xl" py="md">
        <Group justify="space-between" align="center">
          {/* Logo */}
          <img
            src="/logo.svg"
            alt="ImgCrush"
            style={{ height: '32px', cursor: onReset ? 'pointer' : 'default' }}
            onClick={onReset}
          />

          {/* Actions */}
          <Group gap="xs">
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