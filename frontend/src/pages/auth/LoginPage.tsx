import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  EmailOutlined,
  LockOutlined,
  Visibility,
  VisibilityOff,
  BuildOutlined,
  AssignmentOutlined,
  InventoryOutlined,
  TrendingUpOutlined,
} from '@mui/icons-material';
import { accent, navy, teal } from '../../theme/theme';

const DEMO_EMAIL = 'demo@company.com';
const DEMO_PASSWORD = 'demo2024';

const features = [
  { icon: <AssignmentOutlined sx={{ fontSize: 20 }} />, text: 'İş emirleri & bakım planlaması' },
  { icon: <InventoryOutlined sx={{ fontSize: 20 }} />, text: 'Stok & varlık yönetimi' },
  { icon: <BuildOutlined sx={{ fontSize: 20 }} />, text: 'Arıza takibi & raporlama' },
  { icon: <TrendingUpOutlined sx={{ fontSize: 20 }} />, text: 'Gerçek zamanlı operasyon analitikleri' },
];

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      localStorage.setItem('fmms_auth', 'true');
      onLogin();
    } else {
      setError('Hatalı e-posta veya şifre.');
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* ── Left branding panel ── */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '52%',
          p: 6,
          position: 'relative',
          overflow: 'hidden',
          background: `linear-gradient(145deg, ${navy[900]} 0%, #0f1e35 60%, #0a1628 100%)`,
        }}
      >
        {/* Decorative blobs */}
        <Box sx={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: 340, height: 340, borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(accent.main, 0.25)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />
        <Box sx={{
          position: 'absolute', bottom: '80px', left: '-60px',
          width: 260, height: 260, borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(teal.main, 0.2)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />
        <Box sx={{
          position: 'absolute', bottom: '-40px', right: '10%',
          width: 180, height: 180, borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(accent.light, 0.12)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        {/* Grid lines */}
        <Box sx={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `linear-gradient(${alpha('#fff', 0.03)} 1px, transparent 1px), linear-gradient(90deg, ${alpha('#fff', 0.03)} 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }} />

        {/* Logo */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Box sx={{
              width: 42, height: 42, borderRadius: '12px',
              background: `linear-gradient(135deg, ${accent.main} 0%, ${accent.dark} 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 8px 24px ${alpha(accent.main, 0.45)}`,
            }}>
              <BuildOutlined sx={{ color: '#fff', fontSize: 22 }} />
            </Box>
            <Box>
              <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem', lineHeight: 1.1, letterSpacing: '-0.01em' }}>
                FMMS
              </Typography>
              <Typography sx={{ color: alpha('#fff', 0.45), fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Demo Platform
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Hero text */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            sx={{
              color: '#fff',
              fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              mb: 2,
            }}
          >
            Tesisi yönet,<br />
            <Box component="span" sx={{
              background: `linear-gradient(90deg, ${accent.light}, #7dd3fc)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              operasyonu hızlandır.
            </Box>
          </Typography>
          <Typography sx={{ color: alpha('#fff', 0.55), fontSize: '0.95rem', lineHeight: 1.7, maxWidth: 380, mb: 5 }}>
            Bakım süreçlerinizi uçtan uca yönetin. İş emirlerinden stok takibine, arıza raporlarından analitiğe — tek platformda.
          </Typography>

          {/* Feature list */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {features.map((f, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                  width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
                  bgcolor: alpha('#fff', 0.07),
                  border: `1px solid ${alpha('#fff', 0.1)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: alpha('#fff', 0.75),
                }}>
                  {f.icon}
                </Box>
                <Typography sx={{ color: alpha('#fff', 0.7), fontSize: '0.875rem', fontWeight: 500 }}>
                  {f.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box />
      </Box>

      {/* ── Right form panel ── */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 3, sm: 6, lg: 8 },
          py: 6,
          bgcolor: '#F8FAFF',
          position: 'relative',
        }}
      >
        {/* Mobile logo */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 5 }}>
          <Box sx={{
            width: 38, height: 38, borderRadius: '10px',
            background: `linear-gradient(135deg, ${accent.main}, ${accent.dark})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BuildOutlined sx={{ color: '#fff', fontSize: 20 }} />
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: navy[900] }}>FMMS Demo</Typography>
        </Box>

        <Box sx={{ width: '100%', maxWidth: 400 }}>
          {/* Heading */}
          <Box sx={{ mb: 5 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: navy[900], mb: 0.75, letterSpacing: '-0.02em' }}>
              Hoş geldiniz
            </Typography>
            <Typography variant="body2" sx={{ color: navy[500] }}>
              Demo hesabınızla oturum açın
            </Typography>
          </Box>

          {/* Demo badge */}
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            p: 1.5, mb: 3.5, borderRadius: '12px',
            bgcolor: alpha(accent.main, 0.06),
            border: `1px solid ${alpha(accent.main, 0.15)}`,
          }}>
            <Box sx={{
              width: 8, height: 8, borderRadius: '50%',
              bgcolor: '#22C55E',
              boxShadow: '0 0 0 3px rgba(34,197,94,0.2)',
              flexShrink: 0,
            }} />
            <Box>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: navy[700], lineHeight: 1.2 }}>
                Demo Ortamı
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: navy[500] }}>
                demo@company.com &nbsp;·&nbsp; demo2024
              </Typography>
            </Box>
          </Box>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {error && (
              <Alert severity="error" sx={{ borderRadius: '10px', fontSize: '0.82rem' }}>
                {error}
              </Alert>
            )}

            <TextField
              label="E-posta adresi"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              fullWidth
              required
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlined sx={{ fontSize: 18, color: navy[400] }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Şifre"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              fullWidth
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined sx={{ fontSize: 18, color: navy[400] }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((p) => !p)}
                      edge="end"
                      size="small"
                      sx={{ border: 'none', bgcolor: 'transparent', '&:hover': { bgcolor: alpha(navy[100], 0.5) } }}
                    >
                      {showPassword
                        ? <VisibilityOff sx={{ fontSize: 18, color: navy[400] }} />
                        : <Visibility sx={{ fontSize: 18, color: navy[400] }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              sx={{
                mt: 0.5,
                py: 1.5,
                fontSize: '0.9rem',
                fontWeight: 700,
                letterSpacing: '0.01em',
                background: loading
                  ? undefined
                  : `linear-gradient(135deg, ${accent.main} 0%, ${accent.dark} 100%)`,
                boxShadow: `0 8px 24px ${alpha(accent.main, 0.35)}`,
                '&:hover': {
                  boxShadow: `0 12px 32px ${alpha(accent.main, 0.45)}`,
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              {loading ? 'Giriş yapılıyor…' : 'Giriş Yap'}
            </Button>
          </Box>

          <Typography
            variant="caption"
            sx={{ display: 'block', textAlign: 'center', mt: 4, color: navy[400] }}
          >
            © {new Date().getFullYear()} FMMS · Tüm hakları saklıdır
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
