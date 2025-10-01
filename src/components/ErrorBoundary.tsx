import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Stack, Text, Button, Paper } from '@mantine/core';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error info:', errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      const { fallbackTitle = 'Something went wrong', fallbackMessage = 'An unexpected error occurred. Please try again.' } = this.props;

      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          padding: '20px',
        }}>
          <Paper
            shadow="md"
            radius="lg"
            className="glass elevation-lg"
            style={{
              maxWidth: '600px',
              width: '100%',
              padding: '32px',
              border: '1px solid var(--color-border-glass)',
            }}
          >
            <Stack gap="lg" align="center">
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AlertTriangle size={32} style={{ color: 'var(--color-error)' }} />
              </div>

              <Stack gap="sm" align="center">
                <Text size="xl" fw={700} style={{ color: 'var(--color-text-primary)' }}>
                  {fallbackTitle}
                </Text>
                <Text size="sm" ta="center" style={{ color: 'var(--color-text-secondary)' }}>
                  {fallbackMessage}
                </Text>
              </Stack>

              {/* Error details for development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Paper
                  p="md"
                  radius="md"
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--color-bg-tertiary)',
                    border: '1px solid var(--color-border-secondary)',
                  }}
                >
                  <Stack gap="xs">
                    <Text size="xs" fw={600} style={{ color: 'var(--color-error)' }}>
                      Error Details (Development Only):
                    </Text>
                    <Text size="xs" ff="monospace" style={{ color: 'var(--color-text-tertiary)', wordBreak: 'break-word' }}>
                      {this.state.error.toString()}
                    </Text>
                    {this.state.errorInfo && (
                      <Text size="xs" ff="monospace" style={{ color: 'var(--color-text-muted)', wordBreak: 'break-word', maxHeight: '150px', overflow: 'auto' }}>
                        {this.state.errorInfo.componentStack}
                      </Text>
                    )}
                  </Stack>
                </Paper>
              )}

              <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                <Button
                  variant="filled"
                  size="md"
                  fullWidth
                  onClick={this.handleReset}
                  leftSection={<RefreshCw size={18} />}
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    borderRadius: '10px',
                  }}
                >
                  Try Again
                </Button>
                <Button
                  variant="light"
                  size="md"
                  fullWidth
                  onClick={this.handleReload}
                  style={{
                    borderRadius: '10px',
                  }}
                >
                  Reload Page
                </Button>
              </div>
            </Stack>
          </Paper>
        </div>
      );
    }

    return this.props.children;
  }
}
