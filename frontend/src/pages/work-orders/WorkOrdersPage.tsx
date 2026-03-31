import { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableHead, TableRow, TableCell,
  TableBody, Chip, IconButton, Button, TextField, MenuItem, Pagination,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, Skeleton, InputAdornment, Link,
  alpha,
} from '@mui/material';
import { Visibility, Add as AddIcon, PlayArrow, CheckCircle, Search as SearchIcon } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { useApi } from '../../hooks/useApi';
import { getWorkOrders, updateWorkOrderStatus, createWorkOrder, getLocationTree, getAssets } from '../../api/endpoints';
import { WorkOrderStatusLabels, WorkOrderStatusColors, PriorityLabels, PriorityColors, WorkOrderTypeLabels } from '../../types';
import type { PagedResult, WorkOrder, Location, Asset } from '../../types';
import { navy, accent } from '../../theme/theme';
import { useTranslation } from '../../i18n';

const statusColorMap: Record<number, string> = {
  0: '#3B82F6',  // Open
  1: '#8B5CF6',  // Assigned
  2: '#F59E0B',  // InProgress
  3: '#6B7280',  // OnHold
  4: '#059669',  // Completed
  5: '#DC2626',  // Cancelled
};

const priorityColorMap: Record<number, string> = {
  0: '#10B981',  // Low
  1: '#3B82F6',  // Medium
  2: '#F59E0B',  // High
  3: '#EF4444',  // Critical
};

function flattenLocations(locations: Location[]): { id: string; name: string }[] {
  const result: { id: string; name: string }[] = [];
  const recurse = (nodes: Location[], prefix: string) => {
    for (const node of nodes) {
      const label = prefix ? `${prefix} > ${node.name}` : node.name;
      result.push({ id: node.id, name: label });
      if (node.children?.length) recurse(node.children, label);
    }
  };
  recurse(locations, '');
  return result;
}

function CreateWorkOrderDialog({
  open,
  onClose,
  onCreated,
  locations,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  locations: { id: string; name: string }[];
}) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<number>(0);
  const [priority, setPriority] = useState<number>(1);
  const [locationId, setLocationId] = useState('');
  const [assetId, setAssetId] = useState('');
  const [scheduledStart, setScheduledStart] = useState('');
  const [slaDeadline, setSlaDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch assets, filtered by selected location
  const { data: assetsData } = useApi<PagedResult<Asset>>(
    () => getAssets({ locationId: locationId || undefined, pageSize: 200 }),
    [locationId]
  );
  const assets = assetsData?.items ?? [];

  // Reset assetId when location changes
  useEffect(() => {
    setAssetId('');
  }, [locationId]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setType(0);
    setPriority(1);
    setLocationId('');
    setAssetId('');
    setScheduledStart('');
    setSlaDeadline('');
  };

  const handleSubmit = async () => {
    if (!title.trim() || !locationId) return;
    setSubmitting(true);
    try {
      await createWorkOrder({
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        priority,
        locationId,
        assetId: assetId || undefined,
        scheduledStart: scheduledStart || undefined,
        slaDeadline: slaDeadline || undefined,
        reportedBy: '00000000-0000-0000-0000-000000000001',
      });
      onCreated();
      onClose();
      resetForm();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ color: navy[800], fontWeight: 700 }}>{t('workOrders.dialogTitle')}</DialogTitle>
      <DialogContent>
        {/* Section 1 - Temel Bilgiler */}
        <Typography variant="subtitle2" sx={{ color: navy[800], fontWeight: 700, mt: 1, mb: 1.5 }}>
          {t('workOrders.basicInfo')}
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <TextField
              label={`${t('common.title')} *`}
              fullWidth
              size="small"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label={t('workOrders.description')}
              fullWidth
              size="small"
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label={`${t('common.type')} *`}
              fullWidth
              size="small"
              value={type}
              onChange={(e) => setType(Number(e.target.value))}
            >
              {Object.entries(WorkOrderTypeLabels).map(([k, v]) => (
                <MenuItem key={k} value={k}>{v}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label={`${t('common.priority')} *`}
              fullWidth
              size="small"
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
            >
              {Object.entries(PriorityLabels).map(([k, v]) => (
                <MenuItem key={k} value={k}>{v}</MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        {/* Section 2 - Konum ve Varlık */}
        <Typography variant="subtitle2" sx={{ color: navy[800], fontWeight: 700, mt: 3, mb: 1.5 }}>
          {t('workOrders.locationAndAsset')}
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label={`${t('common.location')} *`}
              fullWidth
              size="small"
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
            >
              {locations.map((loc) => (
                <MenuItem key={loc.id} value={loc.id}>{loc.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label={t('workOrders.asset')}
              fullWidth
              size="small"
              value={assetId}
              onChange={(e) => setAssetId(e.target.value)}
            >
              <MenuItem value="">{t('workOrders.notSelected')}</MenuItem>
              {assets.map((asset) => (
                <MenuItem key={asset.id} value={asset.id}>{asset.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        {/* Section 3 - Zamanlama */}
        <Typography variant="subtitle2" sx={{ color: navy[800], fontWeight: 700, mt: 3, mb: 1.5 }}>
          {t('workOrders.scheduling')}
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label={t('workOrders.scheduledStart')}
              type="datetime-local"
              fullWidth
              size="small"
              value={scheduledStart}
              onChange={(e) => setScheduledStart(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label={t('workOrders.slaDeadline')}
              type="datetime-local"
              fullWidth
              size="small"
              value={slaDeadline}
              onChange={(e) => setSlaDeadline(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              helperText={t('workOrders.slaHelp')}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
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
          disabled={submitting || !title.trim() || !locationId}
          sx={{
            background: `linear-gradient(135deg, ${navy[700]} 0%, ${navy[600]} 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${navy[800]} 0%, ${navy[700]} 100%)`,
            },
          }}
        >
          {submitting ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : t('common.create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function WorkOrdersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial status from URL query params
  const initialStatus = searchParams.get('status');
  const [statusFilter, setStatusFilter] = useState<number | ''>(
    initialStatus !== null ? Number(initialStatus) : ''
  );
  const [priorityFilter, setPriorityFilter] = useState<number | ''>('');
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(1);

  // Sync status filter with URL
  useEffect(() => {
    const urlStatus = searchParams.get('status');
    if (urlStatus !== null) {
      setStatusFilter(Number(urlStatus));
    }
  }, [searchParams]);

  const [createOpen, setCreateOpen] = useState(false);

  const { data, loading, refetch } = useApi<PagedResult<WorkOrder>>(
    () => getWorkOrders({
      status: statusFilter !== '' ? statusFilter : undefined,
      priority: priorityFilter !== '' ? priorityFilter : undefined,
      page,
      pageSize: 50,
    }),
    [statusFilter, priorityFilter, page]
  );

  const { data: locTree } = useApi<Location[]>(getLocationTree, []);
  const flatLocations = useMemo(() => flattenLocations(locTree ?? []), [locTree]);

  // Client-side search filtering
  const filteredItems = useMemo(() => {
    if (!data?.items) return [];
    if (!searchText.trim()) return data.items;
    const lower = searchText.toLowerCase();
    return data.items.filter(
      (wo) =>
        wo.title.toLowerCase().includes(lower) ||
        wo.orderNumber.toLowerCase().includes(lower)
    );
  }, [data?.items, searchText]);

  // Summary counts from full dataset
  const summaryOpen = data?.items.filter((wo) => wo.status === 0).length ?? 0;
  const summaryInProgress = data?.items.filter((wo) => wo.status === 2).length ?? 0;

  const handleStatusChange = async (woId: string, newStatus: number) => {
    try {
      await updateWorkOrderStatus(woId, newStatus);
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const handleStatusFilterChange = (value: number | '') => {
    setStatusFilter(value);
    setPage(1);
    // Update URL params
    if (value !== '') {
      setSearchParams({ status: String(value) });
    } else {
      setSearchParams({});
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: navy[800], letterSpacing: '-0.02em' }}>
            {t('workOrders.title')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.5 }}>
            {t('workOrders.subtitle')}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
          sx={{
            background: `linear-gradient(135deg, ${navy[700]} 0%, ${navy[600]} 100%)`,
            fontWeight: 600,
            '&:hover': {
              background: `linear-gradient(135deg, ${navy[800]} 0%, ${navy[700]} 100%)`,
            },
          }}
        >
          {t('workOrders.newWorkOrder')}
        </Button>
      </Box>

      {/* Summary Bar */}
      {data && (
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Chip
            label={`${t('common.total')}: ${data.total}`}
            sx={{ fontWeight: 700, fontSize: '0.7rem', height: 24, bgcolor: alpha(navy[600], 0.1), color: navy[600] }}
          />
          <Chip
            label={`${t('dashboard.open')}: ${summaryOpen}`}
            sx={{ fontWeight: 700, fontSize: '0.7rem', height: 24, bgcolor: alpha(accent.main, 0.1), color: accent.main }}
          />
          <Chip
            label={`${t('dashboard.inProgress')}: ${summaryInProgress}`}
            sx={{ fontWeight: 700, fontSize: '0.7rem', height: 24, bgcolor: alpha('#F59E0B', 0.1), color: '#D97706' }}
          />
        </Box>
      )}

      {/* Filters */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 4, md: 3 }}>
              <TextField
                select
                fullWidth
                size="small"
                label={t('workOrders.statusFilter')}
                value={statusFilter}
                onChange={(e) => {
                  handleStatusFilterChange(e.target.value === '' ? '' : Number(e.target.value));
                }}
              >
                <MenuItem value="">{t('common.all')}</MenuItem>
                {Object.entries(WorkOrderStatusLabels).map(([k, v]) => (
                  <MenuItem key={k} value={k}>{v}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4, md: 3 }}>
              <TextField
                select
                fullWidth
                size="small"
                label={t('workOrders.priorityFilter')}
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value === '' ? '' : Number(e.target.value));
                  setPage(1);
                }}
              >
                <MenuItem value="">{t('common.all')}</MenuItem>
                {Object.entries(PriorityLabels).map(([k, v]) => (
                  <MenuItem key={k} value={k}>{v}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                label={t('workOrders.searchPlaceholder')}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Table */}
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
                  <TableRow sx={{ bgcolor: alpha(navy[600], 0.04) }}>
                    <TableCell sx={{ fontWeight: 700, color: navy[700] }}>{t('common.number')}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: navy[700] }}>{t('common.title')}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: navy[700] }}>{t('common.type')}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: navy[700] }}>{t('common.priority')}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: navy[700] }}>{t('common.status')}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: navy[700] }}>{t('common.location')}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: navy[700] }}>SLA</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: navy[700] }} align="right">{t('common.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredItems.map((wo, index) => {
                    const sColor = statusColorMap[wo.status] ?? WorkOrderStatusColors[wo.status] ?? '#6B7280';
                    const pColor = priorityColorMap[wo.priority] ?? PriorityColors[wo.priority] ?? '#6B7280';
                    return (
                      <TableRow
                        key={wo.id}
                        hover
                        sx={{
                          cursor: 'pointer',
                          bgcolor: index % 2 === 1 ? alpha(navy[50], 0.5) : 'transparent',
                        }}
                        onClick={() => navigate(`/work-orders/${wo.id}`)}
                      >
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.8rem', color: navy[600] }}>
                            {wo.orderNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {wo.title}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                            {WorkOrderTypeLabels[wo.type] || wo.type}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={PriorityLabels[wo.priority]}
                            size="small"
                            sx={{
                              bgcolor: alpha(pColor, 0.1),
                              color: pColor,
                              fontWeight: 700,
                              fontSize: '0.7rem',
                              height: 24,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={WorkOrderStatusLabels[wo.status]}
                            size="small"
                            sx={{
                              bgcolor: alpha(sColor, 0.1),
                              color: sColor,
                              fontWeight: 700,
                              fontSize: '0.7rem',
                              height: 24,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {wo.locationName ? (
                            <Link
                              component="button"
                              variant="body2"
                              underline="hover"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/locations?selected=${wo.locationId}`);
                              }}
                              sx={{ fontWeight: 500, color: accent.main }}
                            >
                              {wo.locationName}
                            </Link>
                          ) : (
                            <Typography variant="body2" sx={{ color: '#94A3B8' }}>-</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {wo.isOverdue ? (
                            <Chip label={t('workOrders.overdue')} size="small" sx={{ fontWeight: 700, fontSize: '0.7rem', height: 24, bgcolor: alpha('#DC2626', 0.1), color: '#DC2626' }} />
                          ) : wo.slaDeadline ? (
                            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                              {new Date(wo.slaDeadline).toLocaleDateString('tr-TR')}
                            </Typography>
                          ) : '-'}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/work-orders/${wo.id}`); }} sx={{ color: navy[400] }}>
                            <Visibility fontSize="small" />
                          </IconButton>
                          {wo.status === 1 && (
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleStatusChange(wo.id, 2); }} title={t('workOrders.start')} sx={{ color: '#F59E0B' }}>
                              <PlayArrow fontSize="small" />
                            </IconButton>
                          )}
                          {wo.status === 2 && (
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleStatusChange(wo.id, 4); }} title={t('workOrders.complete')} sx={{ color: '#059669' }}>
                              <CheckCircle fontSize="small" />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredItems.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography sx={{ color: '#94A3B8' }}>{t('workOrders.notFound')}</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {data && data.total > data.pageSize && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <Pagination
                    count={Math.ceil(data.total / data.pageSize)}
                    page={page}
                    onChange={(_, p) => setPage(p)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <CreateWorkOrderDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => refetch()}
        locations={flatLocations}
      />
    </Box>
  );
}
