import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableHead, TableRow, TableCell,
  TableBody, Chip, Button, Pagination, Skeleton, Drawer, IconButton, Divider,
  Select, MenuItem, FormControl, InputLabel, alpha, Tabs, Tab, Stack, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, Autocomplete, Paper, Grid,
} from '@mui/material';
import { navy, accent } from '../../theme/theme';
import {
  Add as AddIcon, Close as CloseIcon, DeviceHub,
  LocationOn, Build, Warning, Inventory2,
  ChevronRight,
} from '@mui/icons-material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import {
  getAssets, getAsset, getAssetHistory, getAssetMovements,
  getLocationTree, createAsset, assignAsset, unassignAsset,
  transferAsset, updateAsset, updateAssetStatus,
  getStockCards,
} from '../../api/endpoints';
import type { Asset, AssetHistory, AssetMovement, Location, PagedResult, StockCard } from '../../types';
import { useTranslation } from '../../i18n';

/* ───── helpers ───── */
const statusColors: Record<number, string> = { 0: '#2563EB', 1: '#DC2626', 2: '#F59E0B', 3: '#6B7280', 4: '#374151', 5: '#0EA5E9', 6: '#7C3AED' };
const conditionColors: Record<number, string> = { 0: '#10B981', 1: '#2563EB', 2: '#F59E0B', 3: '#D97706', 4: '#DC2626' };
const warrantyColors: Record<number, string> = { 0: '#10B981', 1: '#D97706', 2: '#DC2626' };

type UserOption = { id: string; label: string };
const demoUserOptions: UserOption[] = [
  { id: 'b0000000-0000-0000-0000-000000000002', label: 'Ahmet Yılmaz (Teknisyen)' },
  { id: 'b0000000-0000-0000-0000-000000000003', label: 'Zeynep Kaya (Teknisyen)' },
  { id: 'b0000000-0000-0000-0000-000000000004', label: 'Mehmet Demir (Teknisyen)' },
];
const userLabelById = demoUserOptions.reduce<Record<string, string>>((acc, u) => { acc[u.id] = u.label; return acc; }, {});

function parseEnumNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) return Number(value);
  return null;
}

function enumLabel(
  t: (key: string) => string,
  prefix: 'status' | 'condition' | 'warranty' | 'historyAction' | 'movementType',
  value: unknown,
): string {
  const numeric = parseEnumNumber(value);
  if (numeric !== null) {
    const key = `assets.${prefix}_${numeric}`;
    const translated = t(key);
    return translated !== key ? translated : String(numeric);
  }
  const raw = String(value ?? '').trim();
  if (!raw) return t('common.none');
  const candidates = [
    `assets.${prefix}_${raw}`,
    `assets.${prefix}_${raw.toUpperCase()}`,
    `assets.${prefix}_${raw.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase()}`,
  ];
  for (const key of candidates) {
    const translated = t(key);
    if (translated !== key) return translated;
  }
  return raw.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/_/g, ' ').trim();
}

function renderSpecifications(specifications?: string): ReactNode {
  if (!specifications) return null;
  try {
    const parsed = JSON.parse(specifications) as Record<string, unknown>;
    const entries = Object.entries(parsed);
    if (entries.length === 0) return null;
    return (
      <Stack spacing={0.25}>
        {entries.map(([key, value]) => (
          <Typography key={key} variant="body2">
            {key.replace(/([a-z0-9])([A-Z])/g, '$1 $2')}: {String(value)}
          </Typography>
        ))}
      </Stack>
    );
  } catch {
    return <Typography variant="body2">{specifications}</Typography>;
  }
}

function flattenLocations(locations: Location[], depth = 0): { location: Location; depth: number }[] {
  const result: { location: Location; depth: number }[] = [];
  locations.forEach((loc) => {
    result.push({ location: loc, depth });
    if (loc.children?.length) result.push(...flattenLocations(loc.children, depth + 1));
  });
  return result;
}

/* ───── Summary Card ───── */
function SummaryCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: ReactNode }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5, flex: 1, minWidth: 120, borderLeft: `4px solid ${color}` }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Box sx={{ color, display: 'flex' }}>{icon}</Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color, lineHeight: 1 }}>{value}</Typography>
          <Typography variant="caption" color="text.secondary">{label}</Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

/* ───── Asset Drawer ───── */
function AssetDrawer({ id, open, onClose, onChanged }: { id: string | null; open: boolean; onClose: () => void; onChanged: () => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [busy, setBusy] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [actionDialog, setActionDialog] = useState<null | 'assign' | 'unassign' | 'transfer' | 'status'>(null);

  const { data: asset, loading, refetch } = useApi<Asset | null>(async () => (id ? getAsset(id) : null), [id]);
  const { data: history, refetch: refetchHistory } = useApi<AssetHistory[]>(async () => (id ? getAssetHistory(id) : []), [id]);
  const { data: movements, refetch: refetchMovements } = useApi<AssetMovement[]>(async () => (id ? getAssetMovements(id) : []), [id]);

  // Load related stock cards (search by asset category)
  const [relatedStockCards, setRelatedStockCards] = useState<StockCard[]>([]);
  useEffect(() => {
    if (!asset) { setRelatedStockCards([]); return; }
    getStockCards({ search: asset.category, page: 1, pageSize: 5 })
      .then((r) => setRelatedStockCards(r.items.filter((c) => c.nodeType === 'STOCK_CARD')))
      .catch(() => setRelatedStockCards([]));
  }, [asset]);
  const { data: locTree } = useApi<Location[]>(getLocationTree, []);
  const flatLocs = useMemo(() => (locTree ? flattenLocations(locTree) : []), [locTree]);

  const [form, setForm] = useState({
    name: '', assetTag: '', assetNumber: '', category: '',
    status: 5, condition: 1, manufacturer: '', brand: '', model: '',
    serialNumber: '', specifications: '', locationId: '', departmentId: '',
    assignedToUserId: '', purchaseDate: '', purchaseCost: '',
    warrantyStartDate: '', warrantyEndDate: '', description: '', notes: '',
  });
  const [assignInput, setAssignInput] = useState({ toUserId: '', reason: '', notes: '' });
  const [assignUserText, setAssignUserText] = useState('');
  const [unassignInput, setUnassignInput] = useState({ reason: '', notes: '' });
  const [transferInput, setTransferInput] = useState({ toLocationId: '', reason: '', notes: '' });
  const [statusInput, setStatusInput] = useState({ status: 5, note: '' });

  useEffect(() => {
    if (!asset) return;
    setForm({
      name: asset.name ?? '', assetTag: asset.assetTag ?? '', assetNumber: asset.assetNumber ?? '',
      category: asset.category ?? '', status: parseEnumNumber(asset.status) ?? 5,
      condition: parseEnumNumber(asset.condition) ?? 1, manufacturer: asset.manufacturer ?? '',
      brand: asset.brand ?? '', model: asset.model ?? '', serialNumber: asset.serialNumber ?? '',
      specifications: asset.specifications ?? '', locationId: asset.locationId ?? '',
      departmentId: asset.departmentId ?? '', assignedToUserId: asset.assignedToUserId ?? '',
      purchaseDate: asset.purchaseDate ? asset.purchaseDate.slice(0, 10) : '',
      purchaseCost: asset.purchaseCost != null ? String(asset.purchaseCost) : '',
      warrantyStartDate: asset.warrantyStartDate ? asset.warrantyStartDate.slice(0, 10) : '',
      warrantyEndDate: asset.warrantyEndDate ? asset.warrantyEndDate.slice(0, 10) : '',
      description: asset.description ?? '', notes: asset.notes ?? '',
    });
    setEditMode(false);
    setStatusInput({ status: parseEnumNumber(asset.status) ?? 5, note: '' });
    setTab(0);
  }, [asset]);

  const refreshAll = async () => {
    await Promise.all([refetch(), refetchHistory(), refetchMovements()]);
    onChanged();
  };

  const setField = (key: keyof typeof form, value: string | number) => setForm((prev) => ({ ...prev, [key]: value }));
  const toOptional = (value: string) => { const t = value.trim(); return t === '' ? undefined : t; };

  const handleSave = async () => {
    if (!asset) return;
    if (!form.name.trim() || !form.assetNumber.trim() || !form.category.trim() || !form.locationId.trim()) return;
    setBusy(true);
    try {
      await updateAsset(asset.id, {
        name: form.name.trim(), assetTag: toOptional(form.assetTag),
        assetNumber: form.assetNumber.trim(),
        itemId: (asset.itemId as string | undefined),
        category: form.category.trim(), locationId: form.locationId.trim(),
        departmentId: toOptional(form.departmentId),
        assignedToUserId: toOptional(form.assignedToUserId),
        parentAssetId: (asset.parentAssetId as string | undefined),
        status: Number(form.status), condition: Number(form.condition),
        barcode: (asset.barcode as string | undefined),
        qrCode: (asset.qrCode as string | undefined),
        nfcTagId: (asset as any).nfcTagId ?? undefined,
        installationDate: (asset.installationDate as string | undefined),
        batchNumber: ((asset as any).batchNumber as string | undefined) ?? 'AUTO',
        manufacturer: form.manufacturer.trim() || '-',
        brand: toOptional(form.brand), model: form.model.trim() || '-',
        serialNumber: toOptional(form.serialNumber),
        specifications: toOptional(form.specifications),
        stockCardId: (asset as any).stockCardId ?? undefined,
        supplierId: (asset.supplierId as string | undefined),
        purchaseDate: toOptional(form.purchaseDate),
        purchaseCost: form.purchaseCost.trim() === '' ? undefined : Number(form.purchaseCost),
        warrantyStartDate: toOptional(form.warrantyStartDate),
        warrantyEndDate: toOptional(form.warrantyEndDate),
        description: toOptional(form.description),
        notes: toOptional(form.notes),
        metadata: (asset as any).metadata ?? undefined,
      });
      setEditMode(false); await refreshAll();
    } finally { setBusy(false); }
  };

  const handleAssign = async () => {
    if (!asset || !assignInput.toUserId.trim()) return;
    setBusy(true);
    try {
      await assignAsset(asset.id, {
        toUserId: assignInput.toUserId.trim(),
        reason: assignInput.reason.trim() || undefined,
        notes: assignInput.notes.trim() || undefined,
      });
      setActionDialog(null); setAssignInput({ toUserId: '', reason: '', notes: '' });
      setAssignUserText(''); await refreshAll();
    } finally { setBusy(false); }
  };

  const handleUnassign = async () => {
    if (!asset) return;
    setBusy(true);
    try {
      await unassignAsset(asset.id, {
        reason: unassignInput.reason.trim() || undefined,
        notes: unassignInput.notes.trim() || undefined,
      });
      setActionDialog(null); setUnassignInput({ reason: '', notes: '' }); await refreshAll();
    } finally { setBusy(false); }
  };

  const handleTransfer = async () => {
    if (!asset || !transferInput.toLocationId.trim()) return;
    setBusy(true);
    try {
      await transferAsset(asset.id, {
        toLocationId: transferInput.toLocationId.trim(),
        reason: transferInput.reason.trim() || undefined,
        notes: transferInput.notes.trim() || undefined,
      });
      setActionDialog(null); setTransferInput({ toLocationId: '', reason: '', notes: '' }); await refreshAll();
    } finally { setBusy(false); }
  };

  const handleStatus = async () => {
    if (!asset) return;
    setBusy(true);
    try {
      await updateAssetStatus(asset.id, { status: Number(statusInput.status), note: statusInput.note.trim() || undefined });
      setActionDialog(null); setStatusInput((p) => ({ ...p, note: '' })); await refreshAll();
    } finally { setBusy(false); }
  };

  const statusNum = parseEnumNumber(asset?.status);
  const condNum = parseEnumNumber(asset?.condition);
  const warNum = parseEnumNumber(asset?.warrantyState);

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 580, maxWidth: '95vw' } }}>
      {/* Header */}
      <Box sx={{ px: 3, py: 2, bgcolor: navy[800] }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.6), fontSize: 11 }}>{t('assets.assetDetail')}</Typography>
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>{asset?.name ?? '-'}</Typography>
            {asset && (
              <Stack direction="row" spacing={0.75} sx={{ mt: 0.75 }}>
                <Chip size="small" label={enumLabel(t, 'status', asset.status)}
                  sx={{ bgcolor: alpha(statusColors[statusNum ?? -1] || '#6B7280', 0.2), color: '#fff', fontWeight: 700, fontSize: '0.68rem' }} />
                <Chip size="small" label={enumLabel(t, 'condition', asset.condition)}
                  sx={{ bgcolor: alpha(conditionColors[condNum ?? -1] || '#6B7280', 0.2), color: '#fff', fontWeight: 700, fontSize: '0.68rem' }} />
                {asset.locationName && (
                  <Chip size="small" icon={<LocationOn sx={{ fontSize: 12, color: '#fff !important' }} />}
                    label={asset.locationName}
                    sx={{ bgcolor: alpha('#fff', 0.1), color: '#fff', fontSize: '0.68rem' }} />
                )}
              </Stack>
            )}
          </Box>
          <IconButton onClick={onClose} sx={{ color: '#fff' }}><CloseIcon /></IconButton>
        </Box>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ p: 1.5, display: 'flex', gap: 0.75, flexWrap: 'wrap', borderBottom: '1px solid #E2E8F0' }}>
        <Button size="small" variant={editMode ? 'contained' : 'outlined'}
          onClick={() => setEditMode((v) => !v)} disabled={busy}>
          {editMode ? t('common.cancel') : t('common.edit')}
        </Button>
        {editMode && <Button size="small" variant="contained" onClick={handleSave} disabled={busy}>{t('common.save')}</Button>}
        <Box sx={{ flex: 1 }} />
        <Button size="small" variant="outlined" onClick={() => { setAssignInput({ toUserId: '', reason: '', notes: '' }); setAssignUserText(''); setActionDialog('assign'); }}
          disabled={busy || !!asset?.assignedToUserId}>{t('assets.assign')}</Button>
        <Button size="small" variant="outlined" onClick={() => { setUnassignInput({ reason: '', notes: '' }); setActionDialog('unassign'); }}
          disabled={busy || !asset?.assignedToUserId}>{t('assets.unassign')}</Button>
        <Button size="small" variant="outlined" onClick={() => { setTransferInput({ toLocationId: '', reason: '', notes: '' }); setActionDialog('transfer'); }}
          disabled={busy}>{t('assets.transfer')}</Button>
        <Button size="small" variant="outlined" onClick={() => { setStatusInput({ status: parseEnumNumber(asset?.status) ?? 5, note: '' }); setActionDialog('status'); }}
          disabled={busy}>{t('assets.changeStatus')}</Button>
      </Box>

      {/* Tabs: 4 instead of 8 */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth"
        sx={{ borderBottom: '1px solid #E2E8F0', '& .MuiTab-root': { fontSize: '0.78rem', textTransform: 'none', fontWeight: 600, minHeight: 42 } }}>
        <Tab label={t('assets.tabGeneral')} />
        <Tab label={t('assets.tabTechnical')} />
        <Tab label={t('assets.tabLocationAssignment')} />
        <Tab label={t('assets.tabHistory')} />
      </Tabs>

      <Box sx={{ p: 2.5, overflow: 'auto', flex: 1 }}>
        {loading || !asset ? (
          <Stack spacing={1}>{[...Array(6)].map((_, i) => <Skeleton key={i} height={28} />)}</Stack>
        ) : (
          <>
            {/* Tab 0: General (merged with Financial + Notes) */}
            {tab === 0 && (
              <Stack spacing={2}>
                {editMode ? (
                  <Stack spacing={1.5}>
                    <TextField size="small" label={t('common.name')} value={form.name} onChange={(e) => setField('name', e.target.value)} />
                    <Grid container spacing={1.5}>
                      <Grid size={{ xs: 6 }}>
                        <TextField size="small" fullWidth label={t('assets.assetTag')} value={form.assetTag} onChange={(e) => setField('assetTag', e.target.value)} />
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <TextField size="small" fullWidth label={t('assets.assetNo')} value={form.assetNumber} onChange={(e) => setField('assetNumber', e.target.value)} />
                      </Grid>
                    </Grid>
                    <TextField size="small" label={t('common.category')} value={form.category} onChange={(e) => setField('category', e.target.value)} />
                    <Grid container spacing={1.5}>
                      <Grid size={{ xs: 6 }}>
                        <FormControl size="small" fullWidth>
                          <InputLabel>{t('common.status')}</InputLabel>
                          <Select value={String(form.status)} label={t('common.status')} onChange={(e) => setField('status', Number(e.target.value))}>
                            {[5, 0, 6, 2, 1, 3, 4].map((s) => <MenuItem key={s} value={String(s)}>{enumLabel(t, 'status', s)}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <FormControl size="small" fullWidth>
                          <InputLabel>{t('assets.condition')}</InputLabel>
                          <Select value={String(form.condition)} label={t('assets.condition')} onChange={(e) => setField('condition', Number(e.target.value))}>
                            {[0, 1, 2, 3, 4].map((c) => <MenuItem key={c} value={String(c)}>{enumLabel(t, 'condition', c)}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                    <Divider sx={{ my: 0.5 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{t('assets.tabFinancial')}</Typography>
                    <Grid container spacing={1.5}>
                      <Grid size={{ xs: 6 }}>
                        <TextField size="small" fullWidth type="date" label={t('assets.purchaseDate')} value={form.purchaseDate}
                          onChange={(e) => setField('purchaseDate', e.target.value)} InputLabelProps={{ shrink: true }} />
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <TextField size="small" fullWidth type="number" label={t('assets.purchaseCost')} value={form.purchaseCost}
                          onChange={(e) => setField('purchaseCost', e.target.value)} />
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <TextField size="small" fullWidth type="date" label={t('assets.warrantyStartDate')} value={form.warrantyStartDate}
                          onChange={(e) => setField('warrantyStartDate', e.target.value)} InputLabelProps={{ shrink: true }} />
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <TextField size="small" fullWidth type="date" label={t('assets.warrantyEndDate')} value={form.warrantyEndDate}
                          onChange={(e) => setField('warrantyEndDate', e.target.value)} InputLabelProps={{ shrink: true }} />
                      </Grid>
                    </Grid>
                    <Divider sx={{ my: 0.5 }} />
                    <TextField size="small" multiline minRows={2} label={t('common.description')} value={form.description} onChange={(e) => setField('description', e.target.value)} />
                    <TextField size="small" multiline minRows={2} label={t('assets.tabNotes')} value={form.notes} onChange={(e) => setField('notes', e.target.value)} />
                  </Stack>
                ) : (
                  <Stack spacing={1.5}>
                    <Paper variant="outlined" sx={{ p: 1.5 }}>
                      <Grid container spacing={1}>
                        <Grid size={{ xs: 6 }}><Typography variant="caption" color="text.secondary">{t('assets.assetTag')}</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{asset.assetTag || '-'}</Typography></Grid>
                        <Grid size={{ xs: 6 }}><Typography variant="caption" color="text.secondary">{t('assets.assetNo')}</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{asset.assetNumber}</Typography></Grid>
                        <Grid size={{ xs: 6 }}><Typography variant="caption" color="text.secondary">{t('common.category')}</Typography><Typography variant="body2">{asset.category}</Typography></Grid>
                        <Grid size={{ xs: 6 }}><Typography variant="caption" color="text.secondary">{t('assets.serialNo')}</Typography><Typography variant="body2">{asset.serialNumber || '-'}</Typography></Grid>
                      </Grid>
                    </Paper>

                    <Paper variant="outlined" sx={{ p: 1.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>{t('assets.tabFinancial')}</Typography>
                      <Grid container spacing={1}>
                        <Grid size={{ xs: 6 }}><Typography variant="caption" color="text.secondary">{t('assets.purchaseDate')}</Typography><Typography variant="body2">{asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString('tr-TR') : '-'}</Typography></Grid>
                        <Grid size={{ xs: 6 }}><Typography variant="caption" color="text.secondary">{t('assets.purchaseCost')}</Typography><Typography variant="body2">{asset.purchaseCost != null ? `${asset.purchaseCost.toLocaleString('tr-TR')} TRY` : '-'}</Typography></Grid>
                        <Grid size={{ xs: 6 }}><Typography variant="caption" color="text.secondary">{t('assets.warrantyEndDate')}</Typography><Typography variant="body2">{asset.warrantyEndDate ? new Date(asset.warrantyEndDate).toLocaleDateString('tr-TR') : '-'}</Typography></Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="text.secondary">{t('assets.warrantyState')}</Typography>
                          <Box><Chip size="small" label={enumLabel(t, 'warranty', asset.warrantyState)}
                            sx={{ bgcolor: alpha(warrantyColors[warNum ?? -1] || '#6B7280', 0.1), color: warrantyColors[warNum ?? -1] || '#6B7280', fontWeight: 700, fontSize: '0.7rem' }} /></Box>
                        </Grid>
                      </Grid>
                    </Paper>

                    {(asset.description || asset.notes) && (
                      <Paper variant="outlined" sx={{ p: 1.5 }}>
                        {asset.description && <><Typography variant="caption" color="text.secondary">{t('common.description')}</Typography><Typography variant="body2" sx={{ mb: 1 }}>{asset.description}</Typography></>}
                        {asset.notes && <><Typography variant="caption" color="text.secondary">{t('assets.tabNotes')}</Typography><Typography variant="body2">{asset.notes}</Typography></>}
                      </Paper>
                    )}

                    {/* Related Stock Cards */}
                    {relatedStockCards.length > 0 && (
                      <Paper variant="outlined" sx={{ p: 1.5 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>İlişkili Malzemeler</Typography>
                          <Button size="small" onClick={() => { onClose(); navigate('/stock-cards'); }}>Tümü</Button>
                        </Stack>
                        {relatedStockCards.map((sc) => (
                          <Paper key={sc.id} variant="outlined" sx={{ p: 1, mb: 0.75, cursor: 'pointer', '&:hover': { bgcolor: '#F8FAFC' } }}
                            onClick={() => { onClose(); navigate(`/stock-cards?selected=${sc.id}`); }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Inventory2 sx={{ fontSize: 16, color: '#059669' }} />
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>{sc.name}</Typography>
                                <Typography variant="caption" color="text.secondary">{sc.stockNumber} | {sc.currentBalance} {sc.unit}</Typography>
                              </Box>
                              <Chip size="small" label={sc.currentBalance <= sc.minStockLevel ? 'Düşük' : 'Yeterli'}
                                color={sc.currentBalance <= sc.minStockLevel ? 'warning' : 'success'}
                                sx={{ height: 20, fontSize: '0.65rem' }} />
                              <ChevronRight sx={{ fontSize: 16, color: '#94A3B8' }} />
                            </Stack>
                          </Paper>
                        ))}
                      </Paper>
                    )}
                  </Stack>
                )}
              </Stack>
            )}

            {/* Tab 1: Technical (merged with specifications) */}
            {tab === 1 && (
              <Stack spacing={1.5}>
                {editMode ? (
                  <>
                    <Grid container spacing={1.5}>
                      <Grid size={{ xs: 6 }}>
                        <TextField size="small" fullWidth label={t('assets.manufacturer')} value={form.manufacturer} onChange={(e) => setField('manufacturer', e.target.value)} />
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <TextField size="small" fullWidth label={t('assets.brand')} value={form.brand} onChange={(e) => setField('brand', e.target.value)} />
                      </Grid>
                    </Grid>
                    <TextField size="small" label={t('assets.model')} value={form.model} onChange={(e) => setField('model', e.target.value)} />
                    <TextField size="small" label={t('assets.serialNo')} value={form.serialNumber} onChange={(e) => setField('serialNumber', e.target.value)} />
                    <TextField size="small" multiline minRows={3} label={t('assets.specifications')} value={form.specifications} onChange={(e) => setField('specifications', e.target.value)} />
                  </>
                ) : (
                  <Paper variant="outlined" sx={{ p: 1.5 }}>
                    <Grid container spacing={1}>
                      <Grid size={{ xs: 6 }}><Typography variant="caption" color="text.secondary">{t('assets.manufacturer')}</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{asset.manufacturer || '-'}</Typography></Grid>
                      <Grid size={{ xs: 6 }}><Typography variant="caption" color="text.secondary">{t('assets.brand')}</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{asset.brand || '-'}</Typography></Grid>
                      <Grid size={{ xs: 6 }}><Typography variant="caption" color="text.secondary">{t('assets.model')}</Typography><Typography variant="body2">{asset.model || '-'}</Typography></Grid>
                      <Grid size={{ xs: 6 }}><Typography variant="caption" color="text.secondary">{t('assets.serialNo')}</Typography><Typography variant="body2">{asset.serialNumber || '-'}</Typography></Grid>
                      {asset.specifications && (
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="caption" color="text.secondary">{t('assets.specifications')}</Typography>
                          {renderSpecifications(asset.specifications)}
                        </Grid>
                      )}
                    </Grid>
                  </Paper>
                )}
              </Stack>
            )}

            {/* Tab 2: Location & Assignment */}
            {tab === 2 && (
              <Stack spacing={1.5}>
                {editMode ? (
                  <>
                    <FormControl size="small">
                      <InputLabel>{t('common.location')}</InputLabel>
                      <Select value={form.locationId} label={t('common.location')} onChange={(e) => setField('locationId', e.target.value)}>
                        {flatLocs.map(({ location: loc, depth }) => (
                          <MenuItem key={loc.id} value={loc.id} sx={{ pl: depth * 2 + 2 }}>{loc.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField size="small" label={t('assets.assignedUser')} value={form.assignedToUserId} onChange={(e) => setField('assignedToUserId', e.target.value)} />
                    <TextField size="small" label={t('assets.department')} value={form.departmentId} onChange={(e) => setField('departmentId', e.target.value)} />
                  </>
                ) : (
                  <>
                    <Paper variant="outlined" sx={{ p: 1.5 }}>
                      <Grid container spacing={1}>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="caption" color="text.secondary">{t('common.location')}</Typography>
                          <Stack direction="row" spacing={0.75} alignItems="center">
                            <LocationOn sx={{ fontSize: 16, color: accent.main }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{asset.locationName || '-'}</Typography>
                          </Stack>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="text.secondary">{t('assets.assignedUser')}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {asset.assignedToUserId ? (userLabelById[asset.assignedToUserId] ?? asset.assignedToUserId) : t('assets.unassigned')}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="text.secondary">{t('assets.department')}</Typography>
                          <Typography variant="body2">{asset.departmentId || '-'}</Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </>
                )}
              </Stack>
            )}

            {/* Tab 3: Activity (merged History + Movements) */}
            {tab === 3 && (
              <Stack spacing={1.5}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{t('assets.tabHistory')}</Typography>
                {(history ?? []).length === 0 && (movements ?? []).length === 0 && (
                  <Typography color="text.secondary">{t('common.noData')}</Typography>
                )}
                {(history ?? []).map((h) => (
                  <Paper key={h.id} variant="outlined" sx={{ p: 1.25 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip size="small" label={enumLabel(t, 'historyAction', h.actionType)}
                        sx={{ fontWeight: 700, fontSize: '0.68rem' }} />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(h.performedAt).toLocaleString('tr-TR')}
                      </Typography>
                    </Stack>
                    {h.note && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{h.note}</Typography>}
                  </Paper>
                ))}
                {(movements ?? []).length > 0 && (
                  <>
                    <Divider />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{t('assets.tabMovements')}</Typography>
                    {(movements ?? []).map((m) => (
                      <Paper key={m.id} variant="outlined" sx={{ p: 1.25 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip size="small" label={enumLabel(t, 'movementType', m.movementType)}
                            sx={{ fontWeight: 700, fontSize: '0.68rem' }} />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(m.movedAt).toLocaleString('tr-TR')}
                          </Typography>
                        </Stack>
                        {(m.notes || m.reason) && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{m.notes || m.reason}</Typography>
                        )}
                      </Paper>
                    ))}
                  </>
                )}
              </Stack>
            )}
          </>
        )}
      </Box>

      {/* Action Dialogs */}
      <Dialog open={actionDialog === 'assign'} onClose={() => setActionDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('assets.assign')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Autocomplete<UserOption, false, false, true> freeSolo options={demoUserOptions}
              getOptionLabel={(o) => (typeof o === 'string' ? o : o.label)} value={null}
              inputValue={assignUserText}
              onInputChange={(_, v) => { setAssignUserText(v); setAssignInput((p) => ({ ...p, toUserId: v })); }}
              onChange={(_, o) => { if (!o) return; if (typeof o === 'string') { setAssignUserText(o); setAssignInput((p) => ({ ...p, toUserId: o })); } else { setAssignUserText(o.label); setAssignInput((p) => ({ ...p, toUserId: o.id })); } }}
              renderInput={(params) => <TextField {...params} size="small" label={t('assets.assignedUser')} />} />
            <TextField size="small" label={t('common.description')} value={assignInput.reason} onChange={(e) => setAssignInput((p) => ({ ...p, reason: e.target.value }))} />
            <TextField size="small" multiline minRows={2} label={t('assets.tabNotes')} value={assignInput.notes} onChange={(e) => setAssignInput((p) => ({ ...p, notes: e.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog(null)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleAssign} disabled={busy || !assignInput.toUserId.trim()}>{t('common.save')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={actionDialog === 'unassign'} onClose={() => setActionDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('assets.unassign')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField size="small" label={t('common.description')} value={unassignInput.reason} onChange={(e) => setUnassignInput((p) => ({ ...p, reason: e.target.value }))} />
            <TextField size="small" multiline minRows={2} label={t('assets.tabNotes')} value={unassignInput.notes} onChange={(e) => setUnassignInput((p) => ({ ...p, notes: e.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog(null)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleUnassign} disabled={busy}>{t('common.save')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={actionDialog === 'transfer'} onClose={() => setActionDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('assets.transfer')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl size="small">
              <InputLabel>{t('common.location')}</InputLabel>
              <Select value={transferInput.toLocationId} label={t('common.location')}
                onChange={(e) => setTransferInput((p) => ({ ...p, toLocationId: e.target.value }))}>
                {flatLocs.map(({ location: loc, depth }) => (
                  <MenuItem key={loc.id} value={loc.id} sx={{ pl: depth * 2 + 2 }}>{loc.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField size="small" label={t('common.description')} value={transferInput.reason} onChange={(e) => setTransferInput((p) => ({ ...p, reason: e.target.value }))} />
            <TextField size="small" multiline minRows={2} label={t('assets.tabNotes')} value={transferInput.notes} onChange={(e) => setTransferInput((p) => ({ ...p, notes: e.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog(null)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleTransfer} disabled={busy || !transferInput.toLocationId}>{t('common.save')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={actionDialog === 'status'} onClose={() => setActionDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('assets.changeStatus')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl size="small">
              <InputLabel>{t('common.status')}</InputLabel>
              <Select value={String(statusInput.status)} label={t('common.status')}
                onChange={(e) => setStatusInput((p) => ({ ...p, status: Number(e.target.value) }))}>
                {[5, 0, 6, 2, 1, 3, 4].map((s) => <MenuItem key={s} value={String(s)}>{enumLabel(t, 'status', s)}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField size="small" multiline minRows={2} label={t('assets.tabNotes')} value={statusInput.note}
              onChange={(e) => setStatusInput((p) => ({ ...p, note: e.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog(null)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleStatus} disabled={busy}>{t('common.save')}</Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  );
}

/* ───── Main Page ───── */
export default function AssetsPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [locationFilter, setLocationFilter] = useState(searchParams.get('locationId') || '');
  const [statusFilter, setStatusFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [assignedFilter] = useState('');
  const [warrantyFilter, setWarrantyFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [drawerAssetId, setDrawerAssetId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createBusy, setCreateBusy] = useState(false);

  const [newForm, setNewForm] = useState({
    name: '', assetTag: '', category: '', locationId: '',
    manufacturer: '', model: '', serialNumber: '',
  });

  useEffect(() => {
    const timer = setTimeout(() => { setKeyword(searchInput.trim()); setPage(1); }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: locTree } = useApi<Location[]>(getLocationTree, []);
  const flatLocs = useMemo(() => (locTree ? flattenLocations(locTree) : []), [locTree]);

  const assetParams = useMemo(() => {
    const p: any = { page, pageSize: 15 };
    if (locationFilter) p.locationId = locationFilter;
    if (statusFilter !== '') p.status = Number(statusFilter);
    if (conditionFilter !== '') p.condition = Number(conditionFilter);
    if (assignedFilter === '1') p.assigned = true;
    if (assignedFilter === '0') p.assigned = false;
    if (warrantyFilter !== '') p.warrantyState = Number(warrantyFilter);
    if (keyword) p.keyword = keyword;
    return p;
  }, [page, locationFilter, statusFilter, conditionFilter, assignedFilter, warrantyFilter, keyword]);

  const { data, loading, refetch } = useApi<PagedResult<Asset>>(
    () => getAssets(assetParams),
    [assetParams.page, assetParams.locationId, assetParams.status, assetParams.condition, assetParams.assigned, assetParams.warrantyState, assetParams.keyword],
  );

  const items = data?.items ?? [];
  const stats = useMemo(() => {
    const total = data?.total ?? 0;
    let active = 0, maintenance = 0, lowCondition = 0;
    items.forEach((a) => {
      const s = parseEnumNumber(a.status);
      const c = parseEnumNumber(a.condition);
      if (s === 0) active++;
      if (s === 2) maintenance++;
      if (c !== null && c >= 3) lowCondition++;
    });
    return { total, active, maintenance, lowCondition };
  }, [data, items]);

  const handleLocation = (value: string) => {
    setLocationFilter(value); setPage(1);
    const next = new URLSearchParams(searchParams);
    if (value) next.set('locationId', value); else next.delete('locationId');
    setSearchParams(next, { replace: true });
  };

  const handleCreate = async () => {
    if (!newForm.name || !newForm.assetTag || !newForm.category || !newForm.locationId) return;
    setCreateBusy(true);
    try {
      await createAsset({
        name: newForm.name.trim(), assetTag: newForm.assetTag.trim(),
        assetNumber: newForm.assetTag.trim(), category: newForm.category.trim(),
        locationId: newForm.locationId, status: 5, condition: 1,
        manufacturer: newForm.manufacturer.trim() || '-',
        model: newForm.model.trim() || '-',
        serialNumber: newForm.serialNumber.trim() || undefined,
        batchNumber: 'AUTO',
      });
      setCreateOpen(false);
      setNewForm({ name: '', assetTag: '', category: '', locationId: '', manufacturer: '', model: '', serialNumber: '' });
      refetch();
    } finally { setCreateBusy(false); }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: navy[800], letterSpacing: '-0.02em' }}>{t('assets.title')}</Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8' }}>{t('assets.subtitle')}</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setNewForm((f) => ({ ...f, locationId: locationFilter })); setCreateOpen(true); }}>
          {t('assets.newAsset')}
        </Button>
      </Box>

      {/* Summary Cards */}
      <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
        <SummaryCard label={t('common.total')} value={stats.total} color="#1E3A8A" icon={<DeviceHub />} />
        <SummaryCard label={t('common.active')} value={stats.active} color="#059669" icon={<Build />} />
        <SummaryCard label={t('assets.status_2')} value={stats.maintenance} color="#F59E0B" icon={<Build />} />
        <SummaryCard label={t('assets.condition_3') + ' / ' + t('assets.condition_4')} value={stats.lowCondition} color="#DC2626" icon={<Warning />} />
      </Stack>

      {/* Filters - 2 rows */}
      <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
        <Grid container spacing={1.25}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField fullWidth size="small" label={t('common.search')} value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          </Grid>
          <Grid size={{ xs: 6, sm: 2 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>{t('common.location')}</InputLabel>
              <Select value={locationFilter} label={t('common.location')} onChange={(e) => handleLocation(e.target.value)}>
                <MenuItem value=""><em>{t('common.all')}</em></MenuItem>
                {flatLocs.map(({ location: loc, depth }) => <MenuItem key={loc.id} value={loc.id} sx={{ pl: depth * 2 + 2 }}>{loc.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, sm: 2 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>{t('common.status')}</InputLabel>
              <Select value={statusFilter} label={t('common.status')} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                <MenuItem value=""><em>{t('common.all')}</em></MenuItem>
                {[5, 0, 6, 2, 1, 3, 4].map((s) => <MenuItem key={s} value={String(s)}>{t(`assets.status_${s}`)}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, sm: 2 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>{t('assets.condition')}</InputLabel>
              <Select value={conditionFilter} label={t('assets.condition')} onChange={(e) => { setConditionFilter(e.target.value); setPage(1); }}>
                <MenuItem value=""><em>{t('common.all')}</em></MenuItem>
                {[0, 1, 2, 3, 4].map((c) => <MenuItem key={c} value={String(c)}>{t(`assets.condition_${c}`)}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, sm: 2 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>{t('assets.warrantyState')}</InputLabel>
              <Select value={warrantyFilter} label={t('assets.warrantyState')} onChange={(e) => { setWarrantyFilter(e.target.value); setPage(1); }}>
                <MenuItem value=""><em>{t('common.all')}</em></MenuItem>
                {[0, 1, 2].map((w) => <MenuItem key={w} value={String(w)}>{t(`assets.warranty_${w}`)}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ p: 2 }}>{[...Array(5)].map((_, i) => <Skeleton key={i} height={48} />)}</Box>
          ) : (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>{t('assets.assetTag')}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t('common.name')}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t('common.status')}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t('assets.condition')}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t('common.location')}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t('assets.assignedUser')}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t('assets.warranty')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((asset) => {
                    const sn = parseEnumNumber(asset.status);
                    const cn = parseEnumNumber(asset.condition);
                    const wn = parseEnumNumber(asset.warrantyState);
                    return (
                      <TableRow key={asset.id} hover sx={{ cursor: 'pointer' }} onClick={() => setDrawerAssetId(asset.id)}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: '"JetBrains Mono", monospace', color: navy[600] }}>
                            {asset.assetTag || asset.assetNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <DeviceHub fontSize="small" sx={{ color: navy[400] }} />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>{asset.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={enumLabel(t, 'status', asset.status)} size="small"
                            sx={{ bgcolor: alpha(statusColors[sn ?? -1] || '#6B7280', 0.1), color: statusColors[sn ?? -1] || '#6B7280', fontWeight: 700, fontSize: '0.7rem' }} />
                        </TableCell>
                        <TableCell>
                          <Chip label={enumLabel(t, 'condition', asset.condition)} size="small"
                            sx={{ bgcolor: alpha(conditionColors[cn ?? -1] || '#6B7280', 0.1), color: conditionColors[cn ?? -1] || '#6B7280', fontWeight: 700, fontSize: '0.7rem' }} />
                        </TableCell>
                        <TableCell><Typography variant="body2" sx={{ color: accent.main }}>{asset.locationName || '-'}</Typography></TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {asset.assignedToUserId ? (userLabelById[asset.assignedToUserId] ?? asset.assignedToUserId) : <span style={{ color: '#94A3B8' }}>{t('assets.unassigned')}</span>}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={enumLabel(t, 'warranty', asset.warrantyState)} size="small"
                            sx={{ bgcolor: alpha(warrantyColors[wn ?? -1] || '#6B7280', 0.1), color: warrantyColors[wn ?? -1] || '#6B7280', fontWeight: 700, fontSize: '0.7rem' }} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {items.length === 0 && (
                    <TableRow><TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="text.secondary">{t('assets.notFound')}</Typography>
                    </TableCell></TableRow>
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

      <AssetDrawer id={drawerAssetId} open={!!drawerAssetId} onClose={() => setDrawerAssetId(null)} onChanged={refetch} />

      {/* Create Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: navy[800] }}>{t('assets.dialogTitle')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField size="small" label={t('assets.assetName')} value={newForm.name}
              onChange={(e) => setNewForm((f) => ({ ...f, name: e.target.value }))} required />
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 6 }}>
                <TextField size="small" fullWidth label={t('assets.assetTag')} value={newForm.assetTag}
                  onChange={(e) => setNewForm((f) => ({ ...f, assetTag: e.target.value }))} required />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField size="small" fullWidth label={t('common.category')} value={newForm.category}
                  onChange={(e) => setNewForm((f) => ({ ...f, category: e.target.value }))} required />
              </Grid>
            </Grid>
            <FormControl size="small" required>
              <InputLabel>{t('common.location')}</InputLabel>
              <Select value={newForm.locationId} label={t('common.location')}
                onChange={(e) => setNewForm((f) => ({ ...f, locationId: e.target.value }))}>
                <MenuItem value=""><em>{t('common.select')}</em></MenuItem>
                {flatLocs.map(({ location: loc, depth }) => (
                  <MenuItem key={loc.id} value={loc.id} sx={{ pl: depth * 2 + 2 }}>{loc.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Divider />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{t('assets.tabTechnical')}</Typography>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 6 }}>
                <TextField size="small" fullWidth label={t('assets.manufacturer')} value={newForm.manufacturer}
                  onChange={(e) => setNewForm((f) => ({ ...f, manufacturer: e.target.value }))} />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField size="small" fullWidth label={t('assets.model')} value={newForm.model}
                  onChange={(e) => setNewForm((f) => ({ ...f, model: e.target.value }))} />
              </Grid>
            </Grid>
            <TextField size="small" label={t('assets.serialNo')} value={newForm.serialNumber}
              onChange={(e) => setNewForm((f) => ({ ...f, serialNumber: e.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleCreate}
            disabled={!newForm.name || !newForm.assetTag || !newForm.category || !newForm.locationId || createBusy}>
            {t('common.create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
