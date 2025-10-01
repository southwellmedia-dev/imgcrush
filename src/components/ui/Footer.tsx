import React from "react";
import { Container, Group, Text, ActionIcon } from "@mantine/core";
import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer
      className="glass-strong elevation-sm"
      style={{
        borderTop: "1px solid var(--color-border-glass)",
        marginTop: "auto",
        padding: "20px 24px",
        borderRadius: "12px",
      }}
    >
      <Group justify="space-between" align="center">
        <Text size="sm" fw={500} style={{ color: 'var(--color-text-tertiary)' }}>
          © 2025 ImgCrush · 100% client-side processing
        </Text>

        <ActionIcon
          component="a"
          href="https://github.com/southwellmedia-dev/imgcrush"
          target="_blank"
          rel="noopener noreferrer"
          variant="subtle"
          size="lg"
          className="transition-smooth elevation-sm hover:elevation-md"
          style={{
            backgroundColor: 'var(--color-bg-elevated)',
            borderRadius: '10px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-hover-bg)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-bg-elevated)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <Github size={18} />
        </ActionIcon>
      </Group>
    </footer>
  );
}
