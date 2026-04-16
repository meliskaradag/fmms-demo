import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Skeleton, Button, Chip,
  Table, TableHead, TableRow, TableCell, TableBody, IconButton,
  Pagination, Divider, alpha,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Select, MenuItem, FormControl, InputLabel, Grid, CircularProgress,
} from '@mui/material';
import PageHeader from '../../components/common/PageHeader';
import { navy, teal } from '../../theme/theme';
import {
  Add as AddIcon, FolderOpen, LocationOn, Room,
  ChevronRight, ExpandMore, Inventory2, ArrowForward,
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { getLocationTree, getAssets, createLocation } from '../../api/endpoints';
import type { Location, PagedResult, Asset } from '../../types';
import { useTranslation } from '../../i18n';

// ---- constants ----

const typeIcons: Record<number, React.ReactNode> = {
  0: <LocationOn fontSize="small" sx={{ color: navy[600] }} />,
  1: <FolderOpen fontSize="small" sx={{ color: '#F59E0B' }} />,
  2: <Room fontSize="small" sx={{ color: teal.main }} />,
};

const assetStatusColors: Record<number, string> = {
  0: '#059669',
  1: '#F59E0B',
  2: '#DC2626',
  3: '#6B7280',
};

// ---- helpers ----

function findLocationById(locations: Location[], id: string): Location | null {
  for (const loc of locations) {
    if (loc.id === id) return loc;
    if (loc.children) {
      const found = findLocationById(loc.children, id);
      if (found) return found;
    }
  }
  return null;
}

function buildBreadcrumb(locations: Location[], targetId: string): Location[] {
  const path: Location[] = [];
  function walk(nodes: Location[]): boolean {
    for (const n of nodes) {
      path.push(n);
      if (n.id === targetId) return true;
      if (n.children && walk(n.children)) return true;
      path.pop();
    }
    return false;
  }
  walk(locations);
  return path;
}

function collectAncestorIds(locations: Location[], targetId: string): Set<string> {
  const ids = new Set<string>();
  const crumbs = buildBreadcrumb(locations, targetId);
  crumbs.forEach((c) => ids.add(c.id));
  return ids;
}

// ---- tree node ----

interface TreeNodeProps {
  location: Location;
  depth: number;
  expanded: Set<string>;
  selected: string | null;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
}

function TreeNode({ location, depth, expanded, selected, onToggle, onSelect }: TreeNodeProps) {
  const hasChildren = location.children && location.children.length > 0;
  const isExpanded = expanded.has(location.id);
  const isSelected = selected === location.id;

  return (
    <Box>
      <Box
        onClick={() => onSelect(location.id)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          pl: depth * 2.5 + 0.5,
          py: 0.6,
          px: 1,
          cursor: 'pointer',
          borderRadius: 1,
          bgcolor: isSelected ? alpha(navy[600], 0.10) : 'transparent',
          borderLeft: isSelected ? `3px solid ${navy[600]}` : '3px solid transparent',
          transition: 'all 0.15s',
          '&:hover': { bgcolor: isSelected ? alpha(navy[600], 0.14) : '#F5F5F5' },
        }}
      >
        {/* expand / collapse toggle */}
        {hasChildren ? (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(location.id);
            }}
            sx={{ p: 0.25 }}
          >
            {isExpanded ? <ExpandMore fontSize="small" /> : <ChevronRight fontSize="small" />}
          </IconButton>
        ) : (
          <Box sx={{ width: 24 }} />
        )}

        {typeIcons[location.type] || <LocationOn fontSize="small" />}

        <Typography
          variant="body2"
          sx={{
            fontWeight: isSelected ? 600 : depth === 0 ? 600 : 400,
            color: isSelected ? navy[600] : 'text.primary',
            flex: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {location.name}
        </Typography>

        {hasChildren && (
          <Chip
            label={location.children.length}
            size="small"
            sx={{
              height: 20,
              minWidth: 20,
              fontSize: '0.7rem',
              fontWeight: 600,
              bgcolor: alpha(navy[600], 0.08),
            }}
          />
        )}
      </Box>

      {/* tree lines & children */}
      {hasChildren && isExpanded && (
        <Box
          sx={{
            ml: depth * 2.5 + 1.75,
            borderLeft: `1px solid ${alpha(navy[200], 0.5)}`,
          }}
        >
          {location.children.map((child) => (
            <TreeNode
              key={child.id}
              location={child}
              depth={depth + 1}
              expanded={expanded}
              selected={selected}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

// ---- detail panel ----

interface DetailPanelProps {
  location: Location;
  breadcrumb: Location[];
  navigate: ReturnType<typeof useNavigate>;
}

function DetailPanel({ location, breadcrumb, navigate }: DetailPanelProps) {
  const { t } = useTranslation();
  const [assetPage, setAssetPage] = useState(1);
  const { data: assetsData, loading: assetsLoading } = useApi<PagedResult<Asset>>(
    () => getAssets({ locationId: location.id, page: assetPage, pageSize: 10 }),
    [location.id, assetPage],
  );

  const assetStatusLabels: Record<number, string> = {
    0: t('assets.statusActive'),
    1: t('assets.statusMaintenance'),
    2: t('assets.statusFault'),
    3: t('assets.statusDecommissioned'),
  };

  const typeLabels: Record<number, string> = {
    0: t('locations.building'),
    1: t('locations.floor'),
    2: t('locations.room'),
  };

  // reset page when location changes
  useEffect(() => {
    setAssetPage(1);
  }, [location.id]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* header */}
      <Box sx={{ px: 3, pt: 2.5, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1, flexWrap: 'wrap' }}>
          {breadcrumb.map((b, i) => (
            <Box key={b.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {i > 0 && (
                <Typography variant="caption" color="text.disabled">/</Typography>
              )}
              <Typography
                variant="caption"
                sx={{
                  color: i === breadcrumb.length - 1 ? navy[600] : 'text.secondary',
                  fontWeight: i === breadcrumb.length - 1 ? 600 : 400,
                }}
              >
                {b.name}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          {typeIcons[location.type]}
          <Typography variant="h6" sx={{ fontWeight: 700, color: navy[800] }}>
            {location.name}
          </Typography>
          <Chip
            label={typeLabels[location.type] || 'Diger'}
            size="small"
            sx={{
              bgcolor: alpha(navy[600], 0.1),
              color: navy[600],
              fontWeight: 700,
              fontSize: '0.7rem',
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            <strong>{assetsData?.total ?? '...'}</strong> {t('locations.registeredAssets')}
          </Typography>
          {location.children?.length > 0 && (
            <Typography variant="body2" color="text.secondary">
              <strong>{location.children.length}</strong> {t('locations.subLocations')}
            </Typography>
          )}
        </Box>
      </Box>

      <Divider />

      {/* asset table */}
      <Box sx={{ flex: 1, overflow: 'auto', px: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: navy[800] }}>
            <Inventory2 fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5, color: navy[600] }} />
            {t('assets.title')}
          </Typography>
          {assetsData && assetsData.total > 0 && (
            <Button
              size="small"
              endIcon={<ArrowForward fontSize="small" />}
              onClick={() => navigate(`/assets?locationId=${location.id}`)}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              {t('locations.viewAllAssets')}
            </Button>
          )}
        </Box>

        {assetsLoading ? (
          <Box sx={{ px: 2 }}>
            {[...Array(4)].map((_, i) => <Skeleton key={i} height={40} />)}
          </Box>
        ) : assetsData && (assetsData.items ?? []).length > 0 ? (
          <>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>{t('assets.assetNo')}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('common.name')}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('common.category')}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('common.status')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(assetsData.items ?? []).map((asset) => (
                  <TableRow key={asset.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/assets?locationId=${location.id}`)}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 600, fontSize: '0.8rem', color: navy[600] }}>
                        {asset.assetNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{asset.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={asset.category} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
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
              </TableBody>
            </Table>

            {assetsData.total > assetsData.pageSize && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 1.5 }}>
                <Pagination
                  count={Math.ceil(assetsData.total / assetsData.pageSize)}
                  page={assetPage}
                  onChange={(_, p) => setAssetPage(p)}
                  color="primary"
                  size="small"
                />
              </Box>
            )}
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Inventory2 sx={{ fontSize: 48, color: alpha(navy[200], 0.6), mb: 1 }} />
            <Typography color="text.secondary" variant="body2">
              {t('locations.noAssets')}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

// ---- helpers (flatten) ----

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

// ---- create location dialog ----

interface CreateLocationDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  locTree: Location[] | null;
}

function CreateLocationDialog({ open, onClose, onCreated, locTree }: CreateLocationDialogProps) {
  const { t } = useTranslation();

  const locationTypeOptions: Record<number, string> = {
    0: t('locations.building'),
    1: t('locations.floor'),
    2: t('locations.section'),
    3: t('locations.room'),
  };

  const [form, setForm] = useState({ name: '', type: 0, parentId: '' });
  const [submitting, setSubmitting] = useState(false);

  const flatLocs = useMemo(() => (locTree ? flattenLocations(locTree) : []), [locTree]);

  const handleChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await createLocation({
        name: form.name,
        type: form.type,
        parentId: form.parentId || undefined,
      });
      onCreated();
      onClose();
      setForm({ name: '', type: 0, parentId: '' });
    } catch (err) {
      console.error('Failed to create location:', err);
      alert('Lokasyon olusturulurken hata olustu.');
    } finally {
      setSubmitting(false);
    }
  };

  const isValid = form.name.trim().length > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: navy[800], fontWeight: 700 }}>{t('locations.dialogTitle')}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12 }}>
            <TextField
              label={`${t('locations.locationName')} *`}
              fullWidth
              size="small"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel>{`${t('locations.locationType')} *`}</InputLabel>
              <Select
                value={form.type}
                label={`${t('locations.locationType')} *`}
                onChange={(e) => handleChange('type', Number(e.target.value))}
              >
                {Object.entries(locationTypeOptions).map(([key, label]) => (
                  <MenuItem key={key} value={Number(key)}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('locations.parentLocation')}</InputLabel>
              <Select
                value={form.parentId}
                label={t('locations.parentLocation')}
                onChange={(e) => handleChange('parentId', e.target.value)}
              >
                <MenuItem value="">
                  <em>{t('locations.noParent')}</em>
                </MenuItem>
                {flatLocs.map(({ location: loc, depth }) => (
                  <MenuItem key={loc.id} value={loc.id} sx={{ pl: depth * 2 + 2 }}>
                    {loc.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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

export default function LocationsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, loading, refetch } = useApi<Location[]>(getLocationTree, []);
  const [createOpen, setCreateOpen] = useState(false);

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get('selected'));

  // When data loads and we have a preselected id, expand its ancestors
  useEffect(() => {
    if (data && Array.isArray(data) && selectedId) {
      const ancestors = collectAncestorIds(data, selectedId);
      setExpanded((prev) => {
        const next = new Set(prev);
        ancestors.forEach((a) => next.add(a));
        return next;
      });
    }
  }, [data, selectedId]);

  const handleToggle = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    setSearchParams({ selected: id }, { replace: true });
    // Auto-expand when selecting
    setExpanded((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, [setSearchParams]);

  const safeData = Array.isArray(data) ? data : [];

  const selectedLocation = useMemo(() => {
    if (!safeData.length || !selectedId) return null;
    return findLocationById(safeData, selectedId);
  }, [safeData, selectedId]);

  const breadcrumb = useMemo(() => {
    if (!safeData.length || !selectedId) return [];
    return buildBreadcrumb(safeData, selectedId);
  }, [safeData, selectedId]);

  return (
    <Box>
      <PageHeader
        title={t('locations.title')}
        subtitle={t('locations.subtitle')}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
            {t('locations.newLocation')}
          </Button>
        }
      />

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          height: 'calc(100vh - 200px)',
          minHeight: 500,
        }}
      >
        {/* LEFT PANEL - Tree */}
        <Card sx={{ width: '35%', minWidth: 280, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ px: 2, pt: 2, pb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: navy[800], textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}>
              {t('locations.locationTree')}
            </Typography>
          </Box>
          <Divider />
          <CardContent sx={{ flex: 1, overflow: 'auto', py: 1, px: 0.5 }}>
            {loading ? (
              [...Array(8)].map((_, i) => <Skeleton key={i} height={32} sx={{ mx: 2, ml: (i % 3) * 3 + 2 }} />)
            ) : safeData.length > 0 ? (
              safeData.map((loc) => (
                <TreeNode
                  key={loc.id}
                  location={loc}
                  depth={0}
                  expanded={expanded}
                  selected={selectedId}
                  onToggle={handleToggle}
                  onSelect={handleSelect}
                />
              ))
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                {t('locations.notFound')}
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* RIGHT PANEL - Detail */}
        <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {selectedLocation ? (
            <DetailPanel location={selectedLocation} breadcrumb={breadcrumb} navigate={navigate} />
          ) : (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <LocationOn sx={{ fontSize: 64, color: alpha(navy[200], 0.6), mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                {t('locations.selectLocation')}
              </Typography>
              <Typography variant="body2" color="text.disabled">
                {t('locations.selectHint')}
              </Typography>
            </Box>
          )}
        </Card>
      </Box>

      <CreateLocationDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={refetch}
        locTree={safeData}
      />
    </Box>
  );
}
