import { Chip, alpha } from '@mui/material';

interface StatusChipProps {
  label: string;
  color: string;
  size?: 'small' | 'medium';
}

export default function StatusChip({ label, color, size = 'small' }: StatusChipProps) {
  return (
    <Chip
      label={label}
      size={size}
      sx={{
        bgcolor: alpha(color, 0.12),
        color,
        fontWeight: 600,
        border: `1px solid ${alpha(color, 0.2)}`,
        fontSize: '0.72rem',
      }}
    />
  );
}
