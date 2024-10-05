// utils/Theme.js
import { createTheme } from '@mui/material/styles';

// Create your custom theme here
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Customize your primary color
    },
    secondary: {
      main: '#dc004e', // Customize your secondary color
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  // Add other customizations here
});

export default theme;
