import React from "react";
import { Group, Button, Text, Container, ActionIcon } from '@mantine/core';
import { Github } from 'lucide-react';

export function Header() {
  return (
    <header style={{ borderBottom: '1px solid #e9ecef', backgroundColor: '#fff' }}>
      <Container size="xl" py="md">
        <Group justify="space-between">
          <Group gap="xs">
            <svg
              width="32"
              height="32"
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#6366f1', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              <rect width="100" height="100" rx="20" fill="url(#logo-gradient)"/>
              <rect x="25" y="30" width="50" height="40" rx="4" fill="white" opacity="0.9"/>
              <circle cx="60" cy="40" r="5" fill="#fbbf24"/>
            </svg>
            <div>
              <Text size="lg" fw={600}>ImgCrush</Text>
              <Text size="xs" c="dimmed">Compress & optimize images instantly</Text>
            </div>
          </Group>

          <Group gap="md">
            <Button variant="subtle" color="gray" component="a" href="#features">
              Features
            </Button>
            <Button variant="subtle" color="gray" component="a" href="#about">
              About
            </Button>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="lg"
              component="a"
              href="https://github.com/southwellmedia-dev/imgcrush"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub repository"
            >
              <Github size={20} />
            </ActionIcon>
          </Group>
        </Group>
      </Container>
    </header>
  );
}