import { Box, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import type { RootState } from '../../store/store';

export default function MainLayout() {
  const sidebarOpen = useSelector((state: RootState) => state.ui.sidebarOpen);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar open={sidebarOpen} />
      <TopBar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          transition: 'all 0.2s ease',
          backgroundColor: 'background.default',
          backgroundImage:
            'radial-gradient(circle at 10% 10%, rgba(47,111,235,0.06), transparent 40%), radial-gradient(circle at 85% 5%, rgba(15,118,110,0.06), transparent 38%)',
        }}
      >
        <Toolbar />
        <Box
          sx={{
            p: 3,
            animation: 'fadeIn 220ms ease-out',
            '@keyframes fadeIn': {
              from: { opacity: 0, transform: 'translateY(4px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
