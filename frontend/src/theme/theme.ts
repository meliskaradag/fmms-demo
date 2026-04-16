import { createTheme, alpha } from '@mui/material/styles';

const navy = {
  900: '#1F2937',
  800: '#283548',
  700: '#324155',
  600: '#3E5169',
  500: '#536A85',
  400: '#6F86A0',
  300: '#97ACC1',
  200: '#C0CFDD',
  100: '#DFE7EF',
  50: '#F5F8FB',
};

const accent = {
  main: '#2F6FEB',
  light: '#4F84EE',
  dark: '#245AC1',
};

const teal = {
  main: '#0F766E',
  light: '#149487',
  dark: '#0C5C56',
};

const theme = createTheme({
  palette: {
    primary: {
      main: accent.main,
      light: accent.light,
      dark: accent.dark,
      contrastText: '#fff',
    },
    secondary: {
      main: teal.main,
      light: teal.light,
      dark: teal.dark,
      contrastText: '#fff',
    },
    background: {
      default: '#EEF4FF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1F2937',
      secondary: '#5B6B7F',
    },
    divider: alpha(navy[300], 0.45),
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", -apple-system, "Roboto", sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.01em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600, letterSpacing: '-0.005em' },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    body2: { fontSize: '0.82rem' },
    caption: { fontSize: '0.74rem' },
    overline: { fontSize: '0.64rem', fontWeight: 700, letterSpacing: '0.06em' },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#EEF4FF',
          backgroundImage:
            'radial-gradient(circle at 20% 0%, rgba(47,111,235,0.08), transparent 38%), radial-gradient(circle at 85% 15%, rgba(15,118,110,0.07), transparent 42%)',
          backgroundAttachment: 'fixed',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: `1px solid ${alpha(navy[200], 0.6)}`,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: `0 2px 12px ${alpha('#0F172A', 0.06)}, 0 1px 3px ${alpha('#0F172A', 0.04)}`,
          borderRadius: 14,
          border: `1px solid ${alpha(navy[200], 0.65)}`,
          backdropFilter: 'blur(2px)',
          transition: 'box-shadow 0.2s ease',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 10,
          fontSize: '0.8125rem',
          letterSpacing: '0.01em',
        },
        contained: {
          boxShadow: `0 4px 12px ${alpha(accent.main, 0.3)}`,
          '&:hover': {
            boxShadow: `0 6px 16px ${alpha(accent.main, 0.38)}`,
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
            boxShadow: `0 2px 8px ${alpha(accent.main, 0.25)}`,
          },
        },
        outlined: {
          borderColor: alpha(navy[300], 0.7),
          '&:hover': {
            borderColor: accent.main,
            backgroundColor: alpha(accent.main, 0.04),
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          border: `1px solid ${alpha(navy[200], 0.55)}`,
          backgroundColor: alpha('#fff', 0.8),
          transition: 'all 0.15s ease',
          '&:hover': {
            backgroundColor: alpha(accent.main, 0.06),
            borderColor: alpha(accent.main, 0.35),
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: `0 24px 64px ${alpha('#0F172A', 0.18)}`,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1rem',
          fontWeight: 700,
          padding: '20px 24px 12px',
          color: navy[900],
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '12px 24px',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '12px 24px 20px',
          gap: 8,
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 8,
          fontSize: '0.75rem',
          fontWeight: 500,
          backgroundColor: navy[800],
        },
        arrow: {
          color: navy[800],
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 9,
          fontWeight: 600,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 700,
            fontSize: '0.74rem',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            backgroundColor: alpha(accent.main, 0.06),
            color: navy[700],
            borderBottom: `1px solid ${alpha(navy[200], 0.8)}`,
            padding: '11px 16px',
          },
        },
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          '& .MuiTableRow-root': {
            transition: 'background-color 0.12s ease',
          },
          '& .MuiTableRow-root:hover': {
            backgroundColor: `${alpha(accent.main, 0.04)} !important`,
          },
          '& .MuiTableRow-root .MuiTableCell-body': {
            borderBottom: `1px solid ${alpha(navy[100], 0.9)}`,
            padding: '11px 16px',
            fontSize: '0.8125rem',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: alpha('#fff', 0.92),
          '& fieldset': {
            borderColor: alpha(navy[200], 0.9),
          },
          '&:hover fieldset': {
            borderColor: alpha(accent.main, 0.5),
          },
          '&.Mui-focused fieldset': {
            borderColor: accent.main,
            boxShadow: `0 0 0 3px ${alpha(accent.main, 0.12)}`,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: alpha('#fff', 0.92),
            '& fieldset': {
              borderColor: alpha(navy[200], 0.9),
            },
            '&:hover fieldset': {
              borderColor: alpha(accent.main, 0.5),
            },
            '&.Mui-focused fieldset': {
              borderColor: accent.main,
              boxShadow: `0 0 0 3px ${alpha(accent.main, 0.12)}`,
            },
          },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: `1px solid ${alpha(navy[200], 0.7)}`,
          overflow: 'hidden',
          '&:before': { display: 'none' },
        },
      },
    },
  },
});

export { navy, accent, teal };
export default theme;
