import { useState, useEffect, useMemo } from 'react';
import {
  Box, Card, CardContent, Table, TableHead, TableRow, TableCell,
  TableBody, Chip, IconButton, Button, TextField, MenuItem, Pagination,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, Skeleton, InputAdornment, Link,
  alpha, FormControlLabel, Switch, Typography,
} from '@mui/material';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import EmptyState from '../../components/common/EmptyState';
import { Visibility, Add as AddIcon, PlayArrow, CheckCircle, Search as SearchIcon } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { useApi } from '../../hooks/useApi';
import IconClearFiltersButton from '../../components/common/IconClearFiltersButton';
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

const parseTypeCode = (value: unknown): number | null => {
  if (typeof value === 'number') return value;
  const text = String(value ?? '').trim().toLowerCase();
  if (text === 'corrective') return 0;
  if (text === 'preventive') return 1;
  if (text === 'predictive') return 2;
  const numeric = Number(text);
  return Number.isNaN(numeric) ? null : numeric;
};

const parseStatusCode = (value: unknown): number | null => {
  if (typeof value === 'number') return value;
  const text = String(value ?? '').trim().toLowerCase();
  if (text === 'open') return 0;
  if (text === 'assigned') return 1;
  if (text === 'inprogress') return 2;
  if (text === 'onhold') return 3;
  if (text === 'completed') return 4;
  if (text === 'cancelled') return 5;
  const numeric = Number(text);
  return Number.isNaN(numeric) ? null : numeric;
};

const parsePriorityCode = (value: unknown): number | null => {
  if (typeof value === 'number') return value;
  const text = String(value ?? '').trim().toLowerCase();
  if (text === 'low') return 0;
  if (text === 'medium') return 1;
  if (text === 'high') return 2;
  if (text === 'critical') return 3;
  const numeric = Number(text);
  return Number.isNaN(numeric) ? null : numeric;
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

        {/* Section 2 - Konum ve Varlik */}
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

  // Read initial filters from URL query params
  const initialStatus = searchParams.get('status');
  const initialPriority = searchParams.get('priority');
  const initialQuery = searchParams.get('q');
  const initialType = searchParams.get('type');
  const initialLocation = searchParams.get('locationId');
  const initialIncludeDescendants = searchParams.get('includeDescendants');
  const initialAssignee = searchParams.get('assignee');
  const initialAging = searchParams.get('aging');
  const [statusFilter, setStatusFilter] = useState<number | ''>(
    initialStatus !== null ? Number(initialStatus) : ''
  );
  const [priorityFilter, setPriorityFilter] = useState<number | ''>(
    initialPriority !== null ? Number(initialPriority) : ''
  );
  const [searchText, setSearchText] = useState(initialQuery ?? '');
  const [typeFilter, setTypeFilter] = useState<number | ''>(
    initialType !== null ? Number(initialType) : ''
  );
  const [locationFilter, setLocationFilter] = useState(initialLocation ?? '');
  const [includeDescendantsFilter, setIncludeDescendantsFilter] = useState(initialIncludeDescendants === 'true');
  const [assigneeFilter, setAssigneeFilter] = useState(initialAssignee ?? '');
  const [agingFilter, setAgingFilter] = useState(initialAging ?? '');
  const [hideCompleted, setHideCompleted] = useState(false);
  const [page, setPage] = useState(1);

  // Sync filters with URL
  useEffect(() => {
    const urlStatus = searchParams.get('status');
    const urlPriority = searchParams.get('priority');
    const urlQuery = searchParams.get('q');
    const urlType = searchParams.get('type');
    const urlLocation = searchParams.get('locationId');
    const urlIncludeDescendants = searchParams.get('includeDescendants');
    const urlAssignee = searchParams.get('assignee');
    const urlAging = searchParams.get('aging');
    if (urlStatus !== null) {
      setStatusFilter(Number(urlStatus));
    } else {
      setStatusFilter('');
    }
    if (urlPriority !== null) {
      setPriorityFilter(Number(urlPriority));
    } else {
      setPriorityFilter('');
    }
    setSearchText(urlQuery ?? '');
    if (urlType !== null) {
      setTypeFilter(Number(urlType));
    } else {
      setTypeFilter('');
    }
    setLocationFilter(urlLocation ?? '');
    setIncludeDescendantsFilter(urlIncludeDescendants === 'true');
    setAssigneeFilter(urlAssignee ?? '');
    setAgingFilter(urlAging ?? '');
  }, [searchParams]);

  const [createOpen, setCreateOpen] = useState(false);

  const { data, loading, refetch } = useApi<PagedResult<WorkOrder>>(
    () => getWorkOrders({
      status: statusFilter !== '' ? statusFilter : undefined,
      priority: priorityFilter !== '' ? priorityFilter : undefined,
      type: typeFilter !== '' ? typeFilter : undefined,
      locationId: locationFilter || undefined,
      includeDescendants: locationFilter ? includeDescendantsFilter : undefined,
      page,
      pageSize: 50,
    }),
    [statusFilter, priorityFilter, typeFilter, locationFilter, includeDescendantsFilter, page]
  );

  const { data: locTree } = useApi<Location[]>(getLocationTree, []);
  const flatLocations = useMemo(() => flattenLocations(locTree ?? []), [locTree]);

  const matchesAgingBucket = (createdAt: string, bucket: string) => {
    if (!bucket) return true;
    const ageDays = Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000));
    const normalized = bucket.toLowerCase().replace(/\s/g, '');
    const numericBucket = normalized.replace(/[^\d+\-]/g, '');
    const plusMatch = numericBucket.match(/^(\d+)\+$/);
    if (plusMatch) return ageDays >= Number(plusMatch[1]);
    const rangeMatch = numericBucket.match(/^(\d+)-(\d+)$/);
    if (rangeMatch) {
      const min = Number(rangeMatch[1]);
      const max = Number(rangeMatch[2]);
      return ageDays >= min && ageDays <= max;
    }
    return true;
  };

  // Client-side search filtering
  const filteredItems = useMemo(() => {
    if (!data?.items) return [];
    const lower = searchText.trim().toLowerCase();
    return data.items.filter((wo) => {
      const matchesSearch = !lower
        || wo.title.toLowerCase().includes(lower)
        || wo.orderNumber.toLowerCase().includes(lower);
      const matchesAssignee = !assigneeFilter || wo.assignees?.some((a) => a.userId === assigneeFilter);
      const typeCode = parseTypeCode(wo.type);
      const matchesType = typeFilter === '' || typeCode === typeFilter;
      const matchesLocation = !locationFilter || includeDescendantsFilter || wo.locationId === locationFilter;
      const matchesAging = !agingFilter || matchesAgingBucket(wo.createdAt, agingFilter);
      const matchesHideCompleted = !hideCompleted || parseStatusCode(wo.status) !== 4;
      return matchesSearch && matchesAssignee && matchesType && matchesLocation && matchesAging && matchesHideCompleted;
    });
  }, [data?.items, searchText, assigneeFilter, typeFilter, locationFilter, includeDescendantsFilter, agingFilter, hideCompleted]);

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
    const next = new URLSearchParams(searchParams);
    if (value !== '') next.set('status', String(value));
    else next.delete('status');
    setSearchParams(next, { replace: true });
  };

  const clearAllFilters = () => {
    setStatusFilter('');
    setPriorityFilter('');
    setSearchText('');
    setTypeFilter('');
    setLocationFilter('');
    setIncludeDescendantsFilter(false);
    setAssigneeFilter('');
    setAgingFilter('');
    setHideCompleted(false);
    setPage(1);
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  return (
    <Box>
      <PageHeader
        title={t('workOrders.title')}
        subtitle={t('workOrders.subtitle')}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
            {t('workOrders.newWorkOrder')}
          </Button>
        }
      />

      {/* Filters */}
      <Card sx={{ mb: 2, bgcolor: alpha(navy[50], 0.4) }}>
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
                  const nextValue = e.target.value;
                  if (nextValue === '__clear' || nextValue === '') {
                    handleStatusFilterChange('');
                    return;
                  }
                  handleStatusFilterChange(Number(nextValue));
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
                  const nextValue = e.target.value;
                  if (nextValue === '__clear' || nextValue === '') {
                    setPriorityFilter('');
                    setPage(1);
                    return;
                  }
                  setPriorityFilter(Number(nextValue));
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
            <Grid size={{ xs: 12, sm: 12, md: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <FormControlLabel
                  sx={{ m: 0 }}
                  control={<Switch size="small" checked={hideCompleted} onChange={(_, checked) => setHideCompleted(checked)} />}
                  label="Tamamlananlari gizle"
                />
                <IconClearFiltersButton onClick={clearAllFilters} />
              </Box>
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
                  <TableRow>
                    <TableCell>{t('common.number')}</TableCell>
                    <TableCell>{t('common.title')}</TableCell>
                    <TableCell>{t('common.type')}</TableCell>
                    <TableCell>{t('common.priority')}</TableCell>
                    <TableCell>{t('common.status')}</TableCell>
                    <TableCell>{t('common.location')}</TableCell>
                    <TableCell>SLA</TableCell>
                    <TableCell align="right">{t('common.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredItems.map((wo) => {
                    const statusCode = parseStatusCode(wo.status);
                    const priorityCode = parsePriorityCode(wo.priority);
                    const typeCode = parseTypeCode(wo.type);
                    const sColor = statusCode !== null ? (statusColorMap[statusCode] ?? WorkOrderStatusColors[statusCode] ?? '#6B7280') : '#6B7280';
                    const pColor = priorityCode !== null ? (priorityColorMap[priorityCode] ?? PriorityColors[priorityCode] ?? '#6B7280') : '#6B7280';
                    return (
                      <TableRow
                        key={wo.id}
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/work-orders/${wo.id}`)}
                      >
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem', color: navy[600] }}>
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
                            {(typeCode !== null ? WorkOrderTypeLabels[typeCode] : undefined) || String(wo.type)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <StatusChip
                            label={(priorityCode !== null ? PriorityLabels[priorityCode] : undefined) || String(wo.priority)}
                            color={pColor}
                          />
                        </TableCell>
                        <TableCell>
                          <StatusChip
                            label={(statusCode !== null ? WorkOrderStatusLabels[statusCode] : undefined) || String(wo.status)}
                            color={sColor}
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
                          {statusCode === 1 && (
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleStatusChange(wo.id, 2); }} title={t('workOrders.start')} sx={{ color: '#F59E0B' }}>
                              <PlayArrow fontSize="small" />
                            </IconButton>
                          )}
                          {statusCode === 2 && (
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
                      <TableCell colSpan={8}>
                        <EmptyState title={t('workOrders.notFound')} />
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

