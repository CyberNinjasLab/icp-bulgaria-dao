// ui/ThemeRegistry.js
import * as React from 'react';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './Theme'; // Import your custom theme

// Create an Emotion cache to improve performance
const cache = createCache({ key: 'css', prepend: true });

export default function ThemeRegistry({ children }) {
  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline /> {/* Resets and normalizes browser styles */}
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
