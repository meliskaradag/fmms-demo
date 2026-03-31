import { createTheme, alpha } from '@mui/material/styles';

// ── Design Tokens ──
const navy = {
  900: '#0A1628',
  800: '#0F1F35',
  700: '#132A46',
  600: '#1A3A5C',
  500: '#1E4976',
  400: '#2D6AA0',
  300: '#4A90C4',
  200: '#7AB4E0',
  100: '#B8D8F0',
  50:  '#E8F2FC',
};

const accent = {
  main: '#3B82F6',   // vibrant blue
  light: '#60A5FA',
  dark: '#2563EB',
};

const teal = {
  main: '#0D9488',
  light: '#14B8A6',
  dark: '#0F766E',
};

const theme = createTheme({
  palette: {
    primary: {
      main: navy[600],
      light: navy[400],
      dark: navy[800],
      contrastText: '#fff',
    },
    secondary: {
      main: teal.main,
      light: teal.light,
      dark: teal.dark,
      contrastText: '#fff',
    },
    background: {
      default: '#F0F4F8',
      paper: '#FFFFFF',
    },
    error: {
      main: '#DC2626',
      light: '#FEE2E2',
    },
    warning: {
      main: '#D97706',
      light: '#FEF3C7',
    },
    success: {
      main: '#059669',
      light: '#D1FAE5',
    },
    info: {
      main: accent.main,
      light: '#DBEAFE',
    },
    text: {
      primary: navy[900],
      secondary: '#64748B',
    },
    divider: alpha(navy[200], 0.5),
  },
  typography: {
    fontFamily: '"Inter", -apple-system, "Segoe UI", "Roboto", sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600, letterSpacing: '-0.01em' },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600, letterSpacing: '0.01em' },
    body2: { fontSize: '0.8125rem' },
    caption: { fontSize: '0.75rem', letterSpacing: '0.02em' },
    overline: { fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em' },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#F0F4F8',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: `0 1px 3px ${alpha(navy[900], 0.06)}, 0 1px 2px ${alpha(navy[900], 0.04)}`,
          borderRadius: 12,
          border: `1px solid ${alpha(navy[200], 0.4)}`,
          transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
          '&:hover': {
            boxShadow: `0 4px 12px ${alpha(navy[900], 0.08)}, 0 2px 4px ${alpha(navy[900], 0.04)}`,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          fontSize: '0.8125rem',
          letterSpacing: '0.01em',
        },
        contained: {
          boxShadow: `0 1px 3px ${alpha(navy[900], 0.15)}`,
          background: `linear-gradient(135deg, ${navy[600]} 0%, ${navy[700]} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${navy[500]} 0%, ${navy[600]} 100%)`,
            boxShadow: `0 4px 8px ${alpha(navy[900], 0.2)}`,
          },
        },
        outlined: {
          borderColor: alpha(navy[300], 0.5),
          color: navy[600],
          '&:hover': {
            borderColor: navy[400],
            backgroundColor: alpha(navy[50], 0.5),
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.75rem',
          borderRadius: 6,
        },
        outlined: {
          borderColor: alpha(navy[200], 0.6),
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 700,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            backgroundColor: navy[800],
            color: alpha('#fff', 0.92),
            borderBottom: 'none',
            padding: '12px 16px',
            '&:first-of-type': {
              borderTopLeftRadius: 8,
            },
            '&:last-of-type': {
              borderTopRightRadius: 8,
            },
          },
        },
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          '& .MuiTableRow-root': {
            '&:nth-of-type(even)': {
              backgroundColor: alpha(navy[50], 0.4),
            },
            '&:hover': {
              backgroundColor: alpha(accent.main, 0.04),
            },
            '& .MuiTableCell-body': {
              borderBottom: `1px solid ${alpha(navy[100], 0.6)}`,
              padding: '10px 16px',
              fontSize: '0.8125rem',
            },
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: `1px solid ${alpha(navy[200], 0.4)}`,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': {
              borderColor: alpha(navy[200], 0.6),
            },
            '&:hover fieldset': {
              borderColor: navy[300],
            },
          },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: '12px !important',
          border: `1px solid ${alpha(navy[200], 0.4)}`,
          boxShadow: `0 1px 3px ${alpha(navy[900], 0.04)}`,
          '&:before': { display: 'none' },
          '&.Mui-expanded': {
            boxShadow: `0 4px 12px ${alpha(navy[900], 0.08)}`,
          },
        },
      },
    },
    MuiPagination: {
      styleOverrides: {
        root: {
          '& .MuiPaginationItem-root': {
            borderRadius: 8,
            fontWeight: 600,
            '&.Mui-selected': {
              backgroundColor: navy[700],
              color: '#fff',
              '&:hover': {
                backgroundColor: navy[600],
              },
            },
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 6,
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

// Export design tokens for direct use
export { navy, accent, teal };
export default theme;
