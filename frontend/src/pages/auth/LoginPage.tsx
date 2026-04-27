import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { accent, navy } from '../../theme/theme';

const DEMO_EMAIL = 'demo@company.com';
const DEMO_PASSWORD = 'demo2024';

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      localStorage.setItem('fmms_auth', 'true');
      onLogin();
    } else {
      setError('Hatalı e-posta veya şifre.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EEF4FF',
        backgroundImage:
          'radial-gradient(circle at 20% 0%, rgba(47,111,235,0.08), transparent 38%), radial-gradient(circle at 85% 15%, rgba(15,118,110,0.07), transparent 42%)',
      }}
    >
      <Card
        sx={{
          width: 380,
          p: 1,
          boxShadow: `0 24px 64px ${alpha('#0F172A', 0.14)}`,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography
              variant="h5"
              sx={{ color: navy[900], fontWeight: 700, mb: 0.5 }}
            >
              FMMS Demo
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sisteme giriş yapın
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

            <TextField
              label="E-posta"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
              autoFocus
            />

            <TextField
              label="Şifre"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              sx={{
                mt: 1,
                py: 1.4,
                background: `linear-gradient(135deg, ${accent.main} 0%, ${accent.dark} 100%)`,
              }}
            >
              Giriş Yap
            </Button>

            <Typography
              variant="caption"
              color="text.secondary"
              align="center"
              sx={{ mt: 1 }}
            >
              demo@company.com &nbsp;/&nbsp; demo2024
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
