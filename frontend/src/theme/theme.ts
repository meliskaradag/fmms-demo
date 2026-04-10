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
      default: '#F3F6FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1F2937',
      secondary: '#5B6B7F',
    },
    divider: alpha(navy[300], 0.45),
  },
  typography: {
    fontFamily: '"Segoe UI", "Inter", -apple-system, "Roboto", sans-serif',
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
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#F3F6FA',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: `0 1px 2px ${alpha('#0F172A', 0.06)}`,
          borderRadius: 10,
          border: `1px solid ${alpha(navy[200], 0.65)}`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 7,
          fontSize: '0.8125rem',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
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
            backgroundColor: navy[50],
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
          '& .MuiTableRow-root .MuiTableCell-body': {
            borderBottom: `1px solid ${alpha(navy[100], 0.9)}`,
            padding: '10px 16px',
            fontSize: '0.8125rem',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 7,
            '& fieldset': {
              borderColor: alpha(navy[200], 0.9),
            },
          },
        },
      },
    },
  },
});

export { navy, accent, teal };
export default theme;
