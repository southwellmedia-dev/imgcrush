import React from "react";
import { Container, Group, Text, ActionIcon } from "@mantine/core";
import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid #e9ecef", marginTop: "auto" }}>
      <Container size="xl" py="sm">
        <Group justify="space-between" align="center">
          <Text size="xs" c="dimmed">
            © 2025 ImgCrush · 100% client-side processing
          </Text>

          <ActionIcon
            component="a"
            href="https://github.com/southwellmedia-dev/imgcrush"
            target="_blank"
            rel="noopener noreferrer"
            variant="subtle"
            color="gray"
            size="sm"
          >
            <Github size={16} />
          </ActionIcon>
        </Group>
      </Container>
    </footer>
  );
}
