/**
 * Material-UI Theme Configuration
 */

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#25D366', // WhatsApp green
      light: '#4FE083',
      dark: '#1DA851',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#128C7E', // WhatsApp teal
      light: '#34A896',
      dark: '#075E54',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#DC3545',
      light: '#E35D6A',
      dark: '#C82333',
    },
    warning: {
      main: '#FFC107',
      light: '#FFD54F',
      dark: '#FFA000',
    },
    info: {
      main: '#17A2B8',
      light: '#58B8C5',
      dark: '#117A8B',
    },
    success: {
      main: '#28A745',
      light: '#5CB85C',
      dark: '#218838',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
      chat: '#ECE5DD', // WhatsApp chat background
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
      disabled: '#BDBDBD',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0,0,0,0.1)',
    '0px 4px 8px rgba(0,0,0,0.1)',
    '0px 8px 16px rgba(0,0,0,0.1)',
    '0px 12px 24px rgba(0,0,0,0.1)',
    '0px 16px 32px rgba(0,0,0,0.1)',
    '0px 20px 40px rgba(0,0,0,0.1)',
    '0px 24px 48px rgba(0,0,0,0.1)',
    '0px 28px 56px rgba(0,0,0,0.1)',
    '0px 32px 64px rgba(0,0,0,0.1)',
    '0px 36px 72px rgba(0,0,0,0.1)',
    '0px 40px 80px rgba(0,0,0,0.1)',
    '0px 44px 88px rgba(0,0,0,0.1)',
    '0px 48px 96px rgba(0,0,0,0.1)',
    '0px 52px 104px rgba(0,0,0,0.1)',
    '0px 56px 112px rgba(0,0,0,0.1)',
    '0px 60px 120px rgba(0,0,0,0.1)',
    '0px 64px 128px rgba(0,0,0,0.1)',
    '0px 68px 136px rgba(0,0,0,0.1)',
    '0px 72px 144px rgba(0,0,0,0.1)',
    '0px 76px 152px rgba(0,0,0,0.1)',
    '0px 80px 160px rgba(0,0,0,0.1)',
    '0px 84px 168px rgba(0,0,0,0.1)',
    '0px 88px 176px rgba(0,0,0,0.1)',
    '0px 92px 184px rgba(0,0,0,0.1)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          fontSize: '0.875rem',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

// Dark theme variant
export const darkTheme = createTheme({
  ...theme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#25D366',
      light: '#4FE083',
      dark: '#1DA851',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#128C7E',
      light: '#34A896',
      dark: '#075E54',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
      chat: '#0D1418',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
      disabled: '#6C6C6C',
    },
  },
});

export default theme;

