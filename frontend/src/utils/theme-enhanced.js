import { createTheme } from '@mui/material/styles';

const themeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: 'rgba(0, 0, 0, 0.78)', // Light blue primary
      light: 'rgba(0, 0, 0, 0.65)',
      dark: 'rgba(0, 0, 0, 0.95)',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#000000ff', // Light green secondary for accent
      light: '#606a60ff',
      dark: '#66BB6A',
      contrastText: '#FFFFFF',
    },
    tertiary: {
      main: '#4FC3F7', // Light cyan for booking/services
      light: '#81D4FA',
      dark: '#29B6F6',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FAFBFC', // Very light blue-grey background
      paper: '#FFFFFF', // Pure white for paper
      grey: '#F8FAFC', // Light blue-grey tint
    },
    text: {
      primary: '#2D3748', // Dark blue-grey for readability
      secondary: '#4A5568', // Medium blue-grey
      hint: '#718096', // Light blue-grey hint text
    },
    success: {
      main: '#515451ff',
      light: '#81C784',
      dark: '#388E3C',
    },
    error: {
      main: '#F44336',
      light: '#EF5350',
      dark: '#C62828',
    },
    warning: {
      main: '#FF9800',
      light: '#FFB74D',
      dark: '#F57C00',
    },
    info: {
      main: '#2196F3',
      light: '#64B5F6',
      dark: '#1565C0',
    },
    divider: '#E0E0E0',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      '@media (max-width:600px)': {
        fontSize: '2rem',
      },
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
      '@media (max-width:600px)': {
        fontSize: '1.75rem',
      },
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.4,
      '@media (max-width:600px)': {
        fontSize: '1.5rem',
      },
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      '@media (max-width:600px)': {
        fontSize: '1.25rem',
      },
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.57,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.6,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.02em',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.6,
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  spacing: 8,
  shape: {
    borderRadius: 12,
  },
  components: {
    // Button component overrides
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
          },
        },
        sizeLarge: {
          padding: '14px 32px',
          fontSize: '1rem',
        },
        sizeSmall: {
          padding: '6px 16px',
          fontSize: '0.8125rem',
        },
      },
    },
    // Card component overrides
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.08)',
          border: '1px solid #F0F0F0',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    // Paper component overrides
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 1px 8px rgba(0, 0, 0, 0.06)',
        },
        elevation1: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
        },
        elevation2: {
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        },
        elevation3: {
          boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.12)',
        },
      },
    },
    // TextField component overrides
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: '#FAFAFA',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: '#F5F5F5',
            },
            '&.Mui-focused': {
              backgroundColor: '#FFFFFF',
              boxShadow: '0px 0px 0px 3px rgba(46, 125, 50, 0.1)',
            },
          },
        },
      },
    },
    // AppBar component overrides
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#212121',
          boxShadow: '0px 1px 8px rgba(0, 0, 0, 0.08)',
          borderBottom: '1px solid #F0F0F0',
        },
      },
    },
    // Chip component overrides
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          fontWeight: 500,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.02)',
          },
          '&.MuiChip-filled': {
            backgroundColor: '#F5F5F5',
            color: '#616161',
          },
        },
        colorPrimary: {
          backgroundColor: '#E8F5E8',
          color: '#2E7D32',
        },
        colorSecondary: {
          backgroundColor: '#FFF3E0',
          color: '#FF6B35',
        },
      },
    },
    // Tab component overrides
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.9375rem',
          minHeight: 48,
          '@media (max-width:600px)': {
            fontSize: '0.875rem',
            minHeight: 44,
          },
        },
      },
    },
    // Dialog component overrides
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          margin: '16px',
          '@media (max-width:600px)': {
            margin: '8px',
          },
        },
      },
    },
    // Drawer component overrides
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: '0px 16px 16px 0px',
          border: 'none',
          boxShadow: '8px 0px 24px rgba(0, 0, 0, 0.12)',
        },
      },
    },
    // List component overrides
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 8px',
          transition: 'all 0.2s ease-in-out',
          '&.Mui-selected': {
            backgroundColor: 'rgba(46, 125, 50, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(46, 125, 50, 0.15)',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
    // Rating component overrides
    MuiRating: {
      styleOverrides: {
        root: {
          color: '#FF9800',
        },
      },
    },
    // Avatar component overrides
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: '#2E7D32',
          fontWeight: 600,
        },
      },
    },
    // Fab component overrides
    MuiFab: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.15)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.2)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    // Container component overrides for better mobile spacing
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: '16px',
          paddingRight: '16px',
          '@media (max-width:600px)': {
            paddingLeft: '12px',
            paddingRight: '12px',
          },
        },
      },
    },
    // Toolbar component overrides
    MuiToolbar: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            paddingLeft: '8px',
            paddingRight: '8px',
          },
        },
      },
    },
  },
  // Custom mixins
  mixins: {
    toolbar: {
      minHeight: 64,
      '@media (max-width:600px)': {
        minHeight: 56,
      },
    },
  },
};

export const theme = createTheme(themeOptions);

export default theme;