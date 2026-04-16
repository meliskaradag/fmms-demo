import { Box, Typography, alpha } from '@mui/material';
import type { ReactNode } from 'react';
import { InboxOutlined } from '@mui/icons-material';
import { navy } from '../../theme/theme';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  py?: number;
}

export default function EmptyState({ icon, title, description, action, py = 7 }: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py,
        gap: 1,
        color: 'text.secondary',
      }}
    >
      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          bgcolor: alpha(navy[200], 0.3),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 0.5,
          '& .MuiSvgIcon-root': { fontSize: '1.6rem', color: navy[400] },
        }}
      >
        {icon ?? <InboxOutlined />}
      </Box>
      <Typography variant="body2" sx={{ fontWeight: 600, color: navy[600] }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 320 }}>
          {description}
        </Typography>
      )}
      {action}
    </Box>
  );
}
