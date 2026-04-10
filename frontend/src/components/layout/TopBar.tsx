import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Badge,
  alpha,
} from '@mui/material';
import {
  Menu as MenuIcon,
  NotificationsNoneOutlined as NotifIcon,
  Search as SearchIcon,
  Language as LanguageIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { toggleSidebar } from '../../store/uiSlice';
import type { RootState } from '../../store/store';
import { DRAWER_WIDTH } from './Sidebar';
import { navy } from '../../theme/theme';
import { useTranslation } from '../../i18n';

export default function TopBar() {
  const dispatch = useDispatch();
  const { sidebarOpen, currentUser } = useSelector((state: RootState) => state.ui);
  const { language, setLanguage } = useTranslation();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <AppBar
      position="fixed"
      sx={{
        width: sidebarOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
        ml: sidebarOpen ? `${DRAWER_WIDTH}px` : 0,
        bgcolor: '#fff',
        color: 'text.primary',
        transition: 'width 0.2s, margin 0.2s',
        borderBottom: `1px solid ${alpha(navy[200], 0.4)}`,
      }}
      elevation={0}
    >
      <Toolbar sx={{ gap: 1 }}>
        <IconButton
          edge="start"
          onClick={() => dispatch(toggleSidebar())}
          sx={{
            color: navy[600],
            '&:hover': { bgcolor: alpha(navy[100], 0.4) },
          }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Typography
            variant="caption"
            sx={{ color: navy[500], fontSize: '0.72rem', fontWeight: 600 }}
          >
            ABC AVM - Operations Center
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: navy[400], fontSize: '0.72rem' }}
          >
            {now.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}{' '}
            {now.toLocaleTimeString(language === 'tr' ? 'tr-TR' : 'en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Typography>
        </Box>

        {/* Search */}
        <IconButton
          sx={{
            color: navy[400],
            '&:hover': { bgcolor: alpha(navy[100], 0.4) },
          }}
        >
          <SearchIcon fontSize="small" />
        </IconButton>

        {/* Notifications */}
        <IconButton
          sx={{
            color: navy[400],
            '&:hover': { bgcolor: alpha(navy[100], 0.4) },
          }}
        >
          <Badge
            badgeContent={3}
            sx={{
              '& .MuiBadge-badge': {
                bgcolor: '#DC2626',
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: 700,
                minWidth: 18,
                height: 18,
              },
            }}
          >
            <NotifIcon fontSize="small" />
          </Badge>
        </IconButton>

        {/* Language Toggle */}
        <Box
          onClick={() => setLanguage(language === 'tr' ? 'en' : 'tr')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1,
            py: 0.5,
            borderRadius: '16px',
            cursor: 'pointer',
            bgcolor: alpha(navy[100], 0.5),
            border: `1px solid ${alpha(navy[200], 0.6)}`,
            '&:hover': { bgcolor: alpha(navy[200], 0.5) },
            transition: 'background-color 0.15s',
          }}
        >
          <LanguageIcon sx={{ fontSize: 16, color: navy[500] }} />
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              fontSize: '0.7rem',
              color: navy[700],
              lineHeight: 1,
              userSelect: 'none',
            }}
          >
            {language === 'tr' ? 'TR' : 'EN'}
          </Typography>
        </Box>

        {/* Divider */}
        <Box
          sx={{
            width: 1,
            height: 28,
            bgcolor: alpha(navy[200], 0.4),
            mx: 0.5,
          }}
        />

        {/* User */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1,
            py: 0.5,
            borderRadius: '8px',
            cursor: 'pointer',
            '&:hover': { bgcolor: alpha(navy[100], 0.3) },
            transition: 'background-color 0.15s',
          }}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: navy[600],
            }}
          >
            {currentUser.name[0]}
          </Avatar>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                lineHeight: 1.2,
                color: navy[800],
                fontSize: '0.8rem',
              }}
            >
              {currentUser.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#94A3B8',
                lineHeight: 1,
                fontSize: '0.65rem',
              }}
            >
              {currentUser.role}
            </Typography>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
