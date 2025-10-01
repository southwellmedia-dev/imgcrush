import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dropzone/styles.css';
import './index.css';
import { loadDarkMode } from './utils/settingsStorage';

const theme = createTheme({
  primaryColor: 'red',
  colors: {
    red: [
      '#fef2f2',  // 0 - lightest
      '#fee2e2',  // 1
      '#fecaca',  // 2
      '#fca5a5',  // 3
      '#f87171',  // 4
      '#ef4444',  // 5 - base (vibrant red)
      '#dc2626',  // 6 - primary (brand red)
      '#b91c1c',  // 7
      '#991b1b',  // 8
      '#7f1d1d'   // 9 - darkest
    ],
    dark: [
      '#e2e8f0',  // 0 - lightest (for text)
      '#cbd5e1',  // 1
      '#94a3b8',  // 2
      '#64748b',  // 3
      '#475569',  // 4
      '#334155',  // 5
      '#1e1e2e',  // 6 - elevated surfaces
      '#15151f',  // 7 - secondary bg
      '#0f0f19',  // 8
      '#0a0a0f',  // 9 - primary bg (deep dark)
    ]
  },
  defaultRadius: 'md',
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  radius: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary
      fallbackTitle="Application Error"
      fallbackMessage="The application encountered an unexpected error. Please try reloading the page."
    >
      <MantineProvider theme={theme} defaultColorScheme={loadDarkMode() ? 'dark' : 'light'}>
        <Notifications
          position="bottom-right"
          styles={{
            notification: {
              '&[data-color="green"]': {
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                '& .mantine-Notification-title': { color: 'white' },
                '& .mantine-Notification-description': { color: 'white' },
              },
              '&[data-color="red"]': {
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                '& .mantine-Notification-title': { color: 'white' },
                '& .mantine-Notification-description': { color: 'white' },
              },
              '&[data-color="yellow"]': {
                backgroundColor: '#f59e0b',
                color: 'white',
                border: 'none',
                '& .mantine-Notification-title': { color: 'white' },
                '& .mantine-Notification-description': { color: 'white' },
              },
              '&[data-color="blue"]': {
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                '& .mantine-Notification-title': { color: 'white' },
                '& .mantine-Notification-description': { color: 'white' },
              },
            },
          }}
        />
        <App />
      </MantineProvider>
    </ErrorBoundary>
  </StrictMode>
);
