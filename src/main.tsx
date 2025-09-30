import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import App from './App.tsx';
import './index.css';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dropzone/styles.css';

const theme = createTheme({
  primaryColor: 'red',
  colors: {
    red: [
      '#fef2f2',  // 0 - lightest
      '#fee2e2',  // 1
      '#fecaca',  // 2
      '#fca5a5',  // 3
      '#f87171',  // 4
      '#ef4444',  // 5 - base (true red)
      '#dc2626',  // 6 - primary (darker red)
      '#b91c1c',  // 7
      '#991b1b',  // 8
      '#7f1d1d'   // 9 - darkest
    ]
  },
  defaultRadius: 'md',
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <Notifications position="top-right" />
      <App />
    </MantineProvider>
  </StrictMode>
);
