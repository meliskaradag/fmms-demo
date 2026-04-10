import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  alpha,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Engineering as WorkOrderIcon,
  Inventory2 as StockIcon,
  Build as MaintenanceIcon,
  Description as AgreementIcon,
  LocationOn as LocationIcon,
  DeviceHub as AssetIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import { navy } from '../../theme/theme';

const DRAWER_WIDTH = 264;

interface SidebarProps {
  open: boolean;
}

export default function Sidebar({ open }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const menuItems = [
    { text: t('sidebar.dashboard'), icon: <DashboardIcon />, path: '/' },
    { text: t('sidebar.workOrders'), icon: <WorkOrderIcon />, path: '/work-orders' },
    { text: t('sidebar.stockCards'), icon: <StockIcon />, path: '/stock-cards' },
    { text: t('sidebar.maintenanceCards'), icon: <MaintenanceIcon />, path: '/maintenance-cards' },
    { text: t('sidebar.serviceAgreements'), icon: <AgreementIcon />, path: '/service-agreements' },
    { text: t('sidebar.assets'), icon: <AssetIcon />, path: '/assets' },
    { text: t('sidebar.locations'), icon: <LocationIcon />, path: '/locations' },
  ];

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: open ? DRAWER_WIDTH : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          background: navy[900],
          color: '#fff',
          borderRight: 'none',
          overflow: 'hidden',
        },
      }}
    >
      {/* Logo / Brand */}
      <Box sx={{ px: 2.5, pt: 2.5, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Logo mark */}
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              background: '#2F6FEB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.85rem',
              letterSpacing: '-0.02em',
              boxShadow: `0 2px 8px ${alpha('#3B82F6', 0.4)}`,
            }}
          >
            FM
          </Box>
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 800,
                color: '#fff',
                lineHeight: 1.2,
                fontSize: '1rem',
                letterSpacing: '-0.02em',
              }}
            >
              FMMS
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: alpha('#fff', 0.5),
                fontSize: '0.65rem',
                fontWeight: 500,
                letterSpacing: '0.04em',
              }}
            >
              {t('sidebar.facilityManagement')}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Divider */}
      <Box sx={{ mx: 2.5, mb: 1, borderTop: `1px solid ${alpha('#fff', 0.08)}` }} />

      {/* Nav Label */}
      <Typography
        variant="overline"
        sx={{
          px: 3,
          py: 1,
          color: alpha('#fff', 0.35),
          fontSize: '0.6rem',
          display: 'block',
        }}
      >
        {t('sidebar.mainMenu')}
      </Typography>

      {/* Navigation */}
      <List sx={{ px: 1.5, pt: 0 }}>
        {menuItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.25 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: '8px',
                  py: 0.9,
                  px: 1.5,
                  bgcolor: isActive
                    ? alpha('#3B82F6', 0.15)
                    : 'transparent',
                  borderLeft: isActive
                    ? `3px solid #3B82F6`
                    : '3px solid transparent',
                  '&:hover': {
                    bgcolor: isActive
                      ? alpha('#3B82F6', 0.2)
                      : alpha('#fff', 0.05),
                  },
                  transition: 'all 0.15s ease',
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? '#60A5FA' : alpha('#fff', 0.5),
                    minWidth: 36,
                    '& .MuiSvgIcon-root': {
                      fontSize: '1.2rem',
                    },
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.8125rem',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#fff' : alpha('#fff', 0.7),
                    letterSpacing: '0.01em',
                  }}
                />
                {isActive && (
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: '#3B82F6',
                      boxShadow: `0 0 8px ${alpha('#3B82F6', 0.6)}`,
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      {/* Tenant Info */}
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: '10px',
            bgcolor: alpha('#fff', 0.06),
            border: `1px solid ${alpha('#fff', 0.06)}`,
          }}
        >
          <Typography
            variant="overline"
            sx={{ color: alpha('#fff', 0.4), fontSize: '0.55rem' }}
          >
            {t('sidebar.activeFacility')}
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, color: '#fff', fontSize: '0.8rem' }}
          >
            ABC AVM
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: alpha('#fff', 0.4), fontSize: '0.65rem' }}
          >
            {t('sidebar.istanbul')}
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
}

export { DRAWER_WIDTH };
