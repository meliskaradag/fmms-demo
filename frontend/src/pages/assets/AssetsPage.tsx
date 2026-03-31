import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableHead, TableRow, TableCell,
  TableBody, Chip, Button, Pagination, Skeleton, Drawer, IconButton, Divider,
  Select, MenuItem, FormControl, InputLabel, alpha,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid,
  CircularProgress,
} from '@mui/material';
import { navy, accent } from '../../theme/theme';
import {
  Add as AddIcon, DeviceHub, Close as CloseIcon, LocationOn,
  CalendarMonth, Category, Factory, QrCode2, ArrowForward,
  Build as BuildIcon,
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { getAssets, getLocationTree, createAsset } from '../../api/endpoints';
import type { PagedResult, Asset, Location } from '../../types';
import { useTranslation } from '../../i18n';

// ---- constants ----

const assetStatusColors: Record<number, string> = {
  0: '#059669',
  1: '#F59E0B',
  2: '#DC2626',
  3: '#6B7280',
};

// ---- helpers ----

function flattenLocations(locations: Location[], depth = 0): { location: Location; depth: number }[] {
  const result: { location: Location; depth: number }[] = [];
  for (const loc of locations) {
    result.push({ location: loc, depth });
    if (loc.children) {
      result.push(...flattenLocations(loc.children, depth + 1));
    }
  }
  return result;
}

function extractCategories(items: Asset[]): string[] {
  const cats = new Set<string>();
  items.forEach((a) => {
    if (a.category) cats.add(a.category);
  });
  return Array.from(cats).sort();
}

// ---- detail drawer ----

interface AssetDrawerProps {
  asset: Asset | null;
  open: boolean;
  onClose: () => void;
  navigate: ReturnType<typeof useNavigate>;
}

function AssetDrawer({ asset, open, onClose, navigate }: AssetDrawerProps) {
  const { t } = useTranslation();

  if (!asset) return null;

  const assetStatusLabels: Record<number, string> = {
    0: t('assets.statusActive'),
    1: t('assets.statusMaintenance'),
    2: t('assets.statusFault'),
    3: t('assets.statusDecommissioned'),
  };

  const detailRows: { icon: React.ReactNode; label: string; value: React.ReactNode }[] = [
    { icon: <QrCode2 fontSize="small" />, label: t('assets.assetNo'), value: <Typography variant="body2" sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 600, color: navy[600] }}>{asset.assetNumber}</Typography> },
    { icon: <Category fontSize="small" />, label: t('common.category'), value: <Chip label={asset.category} size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} /> },
    { icon: <Factory fontSize="small" />, label: t('assets.manufacturer'), value: asset.manufacturer || '-' },
    { icon: <DeviceHub fontSize="small" />, label: t('assets.model'), value: asset.model || '-' },
    { icon: <QrCode2 fontSize="small" />, label: t('assets.serialNo'), value: asset.serialNumber || '-' },
    {
      icon: <LocationOn fontSize="small" />,
      label: t('common.location'),
      value: asset.locationName ? (
        <Button
          size="small"
          startIcon={<LocationOn fontSize="small" />}
          onClick={() => {
            onClose();
            navigate(`/locations?selected=${asset.locationId}`);
          }}
          sx={{ textTransform: 'none', fontWeight: 500, fontSize: '0.8rem' }}
        >
          {asset.locationName}
        </Button>
      ) : '-',
    },
    {
      icon: <CalendarMonth fontSize="small" />,
      label: t('assets.installationDate'),
      value: asset.installationDate ? new Date(asset.installationDate).toLocaleDateString('tr-TR') : '-',
    },
  ];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 420, maxWidth: '90vw' } }}
    >
      {/* header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2, bgcolor: navy[800] }}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5, color: alpha('#fff', 0.7) }}>
            {t('assets.assetDetail')}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>
            {asset.name}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider />

      {/* status */}
      <Box sx={{ px: 3, py: 2 }}>
        <Chip
          label={assetStatusLabels[asset.status]}
          sx={{
            bgcolor: alpha(assetStatusColors[asset.status] || '#6B7280', 0.1),
            color: assetStatusColors[asset.status] || '#6B7280',
            fontWeight: 700,
            fontSize: '0.7rem',
            px: 1,
          }}
        />
      </Box>

      {/* details */}
      <Box sx={{ px: 3, pb: 2 }}>
        {detailRows.map((row, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', py: 1.25, borderBottom: '1px solid #F0F0F0' }}>
            <Box sx={{ color: 'text.secondary', mr: 1.5, display: 'flex' }}>{row.icon}</Box>
            <Typography variant="body2" color="text.secondary" sx={{ width: 110, flexShrink: 0, fontWeight: 500 }}>
              {row.label}
            </Typography>
            <Box sx={{ flex: 1 }}>
              {typeof row.value === 'string' ? (
                <Typography variant="body2">{row.value}</Typography>
              ) : (
                row.value
              )}
            </Box>
          </Box>
        ))}
      </Box>

      <Divider />

      {/* Lokasyonu Gor button */}
      {asset.locationId && (
        <Box sx={{ px: 3, py: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<LocationOn />}
            endIcon={<ArrowForward fontSize="small" />}
            onClick={() => {
              onClose();
              navigate(`/locations?selected=${asset.locationId}`);
            }}
            sx={{ textTransform: 'none', fontWeight: 600, justifyContent: 'flex-start' }}
          >
            {t('assets.viewLocation')}
          </Button>
        </Box>
      )}

      <Divider />

      {/* Work orders placeholder */}
      <Box sx={{ px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <BuildIcon fontSize="small" sx={{ color: 'text.secondary' }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: navy[800] }}>
            {t('assets.relatedWorkOrders')}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
          {t('assets.comingSoon')}
        </Typography>
      </Box>
    </Drawer>
  );
}

// ---- create asset dialog ----

const categoryOptions = [
  'HVAC - AHU',
  'HVAC - Chiller',
  'HVAC - Fan Coil',
  'Asansor',
  'Elektrik',
  'Yangin Guvenlik',
];

interface CreateAssetDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  flatLocs: { location: Location; depth: number }[];
}

function CreateAssetDialog({ open, onClose, onCreated, flatLocs }: CreateAssetDialogProps) {
  const { t } = useTranslation();

  const assetStatusLabels: Record<number, string> = {
    0: t('assets.statusActive'),
    1: t('assets.statusMaintenance'),
    2: t('assets.statusFault'),
    3: t('assets.statusDecommissioned'),
  };

  const [form, setForm] = useState({
    name: '',
    assetNumber: '',
    category: '',
    locationId: '',
    manufacturer: '',
    model: '',
    serialNumber: '',
    status: 0,
    installationDate: '',
    batchNumber: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await createAsset({
        name: form.name,
        assetNumber: form.assetNumber,
        category: form.category,
        locationId: form.locationId,
        manufacturer: form.manufacturer,
        model: form.model,
        batchNumber: form.batchNumber,
        status: form.status,
        serialNumber: form.serialNumber || undefined,
        installationDate: form.installationDate || undefined,
      });
      onCreated();
      onClose();
      setForm({ name: '', assetNumber: '', category: '', locationId: '', manufacturer: '', model: '', serialNumber: '', status: 0, installationDate: '', batchNumber: '' });
    } catch (err) {
      console.error('Failed to create asset:', err);
      alert('Varlik olusturulurken hata olustu.');
    } finally {
      setSubmitting(false);
    }
  };

  const isValid = form.name && form.assetNumber && form.category && form.locationId && form.manufacturer && form.model && form.batchNumber;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ color: navy[800], fontWeight: 700 }}>{t('assets.dialogTitle')}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              label={`${t('assets.assetName')} *`}
              fullWidth
              size="small"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label={`${t('assets.assetNo')} *`}
              fullWidth
              size="small"
              value={form.assetNumber}
              onChange={(e) => handleChange('assetNumber', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>{`${t('common.category')} *`}</InputLabel>
              <Select
                value={form.category}
                label={`${t('common.category')} *`}
                onChange={(e) => handleChange('category', e.target.value)}
              >
                {categoryOptions.map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>{`${t('common.location')} *`}</InputLabel>
              <Select
                value={form.locationId}
                label={`${t('common.location')} *`}
                onChange={(e) => handleChange('locationId', e.target.value)}
              >
                {flatLocs.map(({ location: loc, depth }) => (
                  <MenuItem key={loc.id} value={loc.id} sx={{ pl: depth * 2 + 2 }}>
                    {loc.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label={`${t('assets.manufacturer')} *`}
              fullWidth
              size="small"
              value={form.manufacturer}
              onChange={(e) => handleChange('manufacturer', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label={`${t('assets.model')} *`}
              fullWidth
              size="small"
              value={form.model}
              onChange={(e) => handleChange('model', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label={t('assets.serialNo')}
              fullWidth
              size="small"
              value={form.serialNumber}
              onChange={(e) => handleChange('serialNumber', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>{`${t('common.status')} *`}</InputLabel>
              <Select
                value={form.status}
                label={`${t('common.status')} *`}
                onChange={(e) => handleChange('status', Number(e.target.value))}
              >
                {Object.entries(assetStatusLabels).map(([key, label]) => (
                  <MenuItem key={key} value={Number(key)}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label={t('assets.installationDate')}
              fullWidth
              size="small"
              type="date"
              value={form.installationDate}
              onChange={(e) => handleChange('installationDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label={`${t('assets.batchNo')} *`}
              fullWidth
              size="small"
              value={form.batchNumber}
              onChange={(e) => handleChange('batchNumber', e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{ color: navy[600], borderColor: navy[600] }}
        >
          {t('common.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!isValid || submitting}
          sx={{
            background: `linear-gradient(135deg, ${navy[700]} 0%, ${navy[600]} 100%)`,
            '&:hover': { background: `linear-gradient(135deg, ${navy[800]} 0%, ${navy[700]} 100%)` },
          }}
        >
          {submitting ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : t('common.create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ---- main page ----

export default function AssetsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const assetStatusLabels: Record<number, string> = {
    0: t('assets.statusActive'),
    1: t('assets.statusMaintenance'),
    2: t('assets.statusFault'),
    3: t('assets.statusDecommissioned'),
  };

  const locationIdParam = searchParams.get('locationId') || '';
  const [locationFilter, setLocationFilter] = useState(locationIdParam);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [drawerAsset, setDrawerAsset] = useState<Asset | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  // Sync locationFilter from URL
  useEffect(() => {
    const urlLocId = searchParams.get('locationId') || '';
    setLocationFilter(urlLocId);
    setPage(1);
  }, [searchParams]);

  // Fetch locations for filter dropdown
  const { data: locTree } = useApi<Location[]>(getLocationTree, []);
  const flatLocs = useMemo(() => (locTree ? flattenLocations(locTree) : []), [locTree]);

  // Fetch assets
  const assetParams = useMemo(() => {
    const p: { locationId?: string; page: number; pageSize: number } = { page, pageSize: 15 };
    if (locationFilter) p.locationId = locationFilter;
    return p;
  }, [page, locationFilter]);

  const { data, loading, refetch } = useApi<PagedResult<Asset>>(
    () => getAssets(assetParams),
    [assetParams.page, assetParams.locationId],
  );

  // Extract unique categories from current page for filter chips
  const categories = useMemo(() => (data ? extractCategories(data.items) : []), [data]);

  // Filtered items (client-side category filter on current page)
  const filteredItems = useMemo(() => {
    if (!data) return [];
    if (!categoryFilter) return data.items;
    return data.items.filter((a) => a.category === categoryFilter);
  }, [data, categoryFilter]);

  const handleLocationChange = useCallback((locId: string) => {
    setLocationFilter(locId);
    setPage(1);
    if (locId) {
      setSearchParams({ locationId: locId }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [setSearchParams]);

  const selectedLocationName = useMemo(() => {
    if (!locationFilter || !flatLocs.length) return '';
    const found = flatLocs.find((f) => f.location.id === locationFilter);
    return found ? found.location.name : '';
  }, [locationFilter, flatLocs]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: navy[800], letterSpacing: '-0.02em' }}>
            {t('assets.title')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8' }}>
            {t('assets.subtitle')}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
          {t('assets.newAsset')}
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Location filter */}
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>{t('assets.locationFilter')}</InputLabel>
          <Select
            value={locationFilter}
            label={t('assets.locationFilter')}
            onChange={(e) => handleLocationChange(e.target.value)}
          >
            <MenuItem value="">
              <em>{t('common.all')}</em>
            </MenuItem>
            {flatLocs.map(({ location: loc, depth }) => (
              <MenuItem key={loc.id} value={loc.id} sx={{ pl: depth * 2 + 2 }}>
                {loc.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Category filter chips */}
        {categories.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5, fontWeight: 500 }}>
              {`${t('common.category')}:`}
            </Typography>
            <Chip
              label={t('common.all')}
              size="small"
              variant={!categoryFilter ? 'filled' : 'outlined'}
              color={!categoryFilter ? 'primary' : 'default'}
              onClick={() => setCategoryFilter('')}
              sx={{ fontWeight: 500, fontSize: '0.75rem' }}
            />
            {categories.map((cat) => (
              <Chip
                key={cat}
                label={cat}
                size="small"
                variant={categoryFilter === cat ? 'filled' : 'outlined'}
                color={categoryFilter === cat ? 'primary' : 'default'}
                onClick={() => setCategoryFilter(categoryFilter === cat ? '' : cat)}
                sx={{ fontWeight: 500, fontSize: '0.75rem' }}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Active filter banner */}
      {selectedLocationName && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            icon={<LocationOn fontSize="small" />}
            label={`${t('common.location')}: ${selectedLocationName}`}
            onDelete={() => handleLocationChange('')}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 500 }}
          />
        </Box>
      )}

      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ p: 2 }}>
              {[...Array(5)].map((_, i) => <Skeleton key={i} height={48} />)}
            </Box>
          ) : (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>{t('assets.assetNo')}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t('common.name')}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t('common.category')}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{`${t('assets.manufacturer')} / ${t('assets.model')}`}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t('common.location')}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t('common.status')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredItems.map((asset) => (
                    <TableRow
                      key={asset.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => setDrawerAsset(asset)}
                    >
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: '"JetBrains Mono", monospace', color: navy[600] }}>
                          {asset.assetNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DeviceHub fontSize="small" sx={{ color: navy[600] }} />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{asset.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={asset.category} size="small" variant="outlined" sx={{ fontSize: '0.7rem', fontWeight: 700 }} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{asset.manufacturer} {asset.model}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          component="span"
                          onClick={(e) => {
                            if (asset.locationId) {
                              e.stopPropagation();
                              navigate(`/locations?selected=${asset.locationId}`);
                            }
                          }}
                          sx={{
                            color: asset.locationId ? accent.main : 'text.secondary',
                            cursor: asset.locationId ? 'pointer' : 'default',
                            fontWeight: asset.locationId ? 500 : 400,
                            '&:hover': asset.locationId ? { textDecoration: 'underline' } : {},
                          }}
                        >
                          {asset.locationName || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={assetStatusLabels[asset.status]}
                          size="small"
                          sx={{
                            bgcolor: alpha(assetStatusColors[asset.status] || '#6B7280', 0.1),
                            color: assetStatusColors[asset.status] || '#6B7280',
                            fontWeight: 700,
                            fontSize: '0.7rem',
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredItems.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography color="text.secondary">{t('assets.notFound')}</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {data && data.total > data.pageSize && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <Pagination count={Math.ceil(data.total / data.pageSize)} page={page} onChange={(_, p) => setPage(p)} color="primary" />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Asset detail drawer */}
      <AssetDrawer
        asset={drawerAsset}
        open={!!drawerAsset}
        onClose={() => setDrawerAsset(null)}
        navigate={navigate}
      />

      {/* Create asset dialog */}
      <CreateAssetDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={refetch}
        flatLocs={flatLocs}
      />
    </Box>
  );
}
