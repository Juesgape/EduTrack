// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light', 
    primary: {
      main: '#1976d2', // Azul MUI por defecto
    },
    secondary: {
      main: '#9c27b0', // Morado
    },
    background: {
      default: '#f5f5f5', // Fondo claro
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
});

export default theme;
