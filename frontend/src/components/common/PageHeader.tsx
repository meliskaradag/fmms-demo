import { Box, Typography, alpha } from '@mui/material';
import type { ReactNode } from 'react';
import { navy, accent } from '../../theme/theme';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  mb?: number;
}

export default function PageHeader({ title, subtitle, action, mb = 3 }: PageHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb,
        gap: 2,
        flexWrap: 'wrap',
        pb: 2.5,
        borderBottom: `1px solid ${alpha(navy[200], 0.5)}`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 4,
            height: 32,
            borderRadius: 2,
            background: `linear-gradient(180deg, ${accent.main} 0%, ${accent.dark} 100%)`,
            flexShrink: 0,
          }}
        />
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: navy[900],
              letterSpacing: '-0.02em',
              lineHeight: 1.25,
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', mt: 0.25, lineHeight: 1.5 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
      {action && (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
          {action}
        </Box>
      )}
    </Box>
  );
}
