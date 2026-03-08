import { createTheme } from '@mui/material/styles';

export const blocklyTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563EB', // Blockly Primary Blue
      dark: '#1D4ED8', // Blockly Accent Blue
      light: '#93C5FD', // Blockly Light Blue
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#6B7280', // Secondary Text
      light: '#9CA3AF',
      dark: '#4B5563',
    },
    error: {
      main: '#EF4444',
    },
    warning: {
      main: '#F59E0B',
    },
    success: {
      main: '#10B981',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#6B7280',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontFamily: 'Outfit, Inter, sans-serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: 'Outfit, Inter, sans-serif',
      fontWeight: 600,
    },
    h3: {
      fontFamily: 'Outfit, Inter, sans-serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: 'Outfit, Inter, sans-serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: 'Outfit, Inter, sans-serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: 'Outfit, Inter, sans-serif',
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          padding: '10px 20px',
          fontSize: '0.9375rem',
          fontWeight: 500,
        },
        contained: {
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(229, 231, 235, 0.5)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
        },
        elevation1: {
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
        },
        elevation2: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        },
        elevation3: {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 500,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
        },
      },
    },
  },
});

export const blocklyDarkTheme = createTheme({
  ...blocklyTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#93C5FD', // Lighter for dark mode
      dark: '#60A5FA',
      light: '#BFDBFE',
      contrastText: '#0F172A',
    },
    secondary: {
      main: '#9CA3AF',
      light: '#D1D5DB',
      dark: '#6B7280',
    },
    error: {
      main: '#F87171',
    },
    warning: {
      main: '#FBBF24',
    },
    success: {
      main: '#34D399',
    },
    background: {
      default: '#0F172A',
      paper: '#1E293B',
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#CBD5E1',
    },
  },
});
