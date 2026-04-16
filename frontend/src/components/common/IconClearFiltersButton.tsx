import { IconButton, Tooltip } from '@mui/material';
import { FilterAltOff } from '@mui/icons-material';

type IconClearFiltersButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  size?: 'small' | 'medium' | 'large';
};

export default function IconClearFiltersButton({
  onClick,
  disabled = false,
  title = 'Filtreleri temizle',
  size = 'small',
}: IconClearFiltersButtonProps) {
  return (
    <Tooltip title={title}>
      <span>
        <IconButton size={size} onClick={onClick} disabled={disabled} aria-label={title}>
          <FilterAltOff fontSize={size === 'small' ? 'small' : 'medium'} />
        </IconButton>
      </span>
    </Tooltip>
  );
}

