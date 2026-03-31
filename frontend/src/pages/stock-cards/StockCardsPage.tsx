import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Table, TableHead, TableRow, TableCell,
  TableBody, Chip, Button, TextField, MenuItem, Pagination, Skeleton, LinearProgress,
  ToggleButtonGroup, ToggleButton, Drawer, Divider, IconButton, alpha,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, CircularProgress,
  Snackbar, Alert,
} from '@mui/material';
import {
  Add as AddIcon, Warning as WarningIcon, Close as CloseIcon,
  Inventory2 as InventoryIcon, TrendingDown, TrendingUp, RemoveCircleOutline, AddCircleOutline,
} from '@mui/icons-material';
import { useApi } from '../../hooks/useApi';
import { getStockCards, createStockCard, createStockMovement, getStockMovements } from '../../api/endpoints';
import { navy, accent } from '../../theme/theme';
import { useTranslation } from '../../i18n';
import type { PagedResult, StockCard, StockMovement } from '../../types';

type StockFilter = 'all' | 'low' | 'sufficient';

const STOCK_CATEGORIES = ['ST', 'Filtre', 'Yağ', 'Elektrik', 'Mekanik'];
const STOCK_UNITS = ['Adet', 'Litre', 'Kg', 'Metre', 'Kutu'];
const MOVEMENT_TYPE_COLORS: Record<number, string> = {
  0: '#059669',
  1: '#DC2626',
  2: '#6366F1',
  3: '#D97706',
};

function CreateStockCardDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const { t } = useTranslation();
  const [stockNumber, setStockNumber] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('');
  const [minStockLevel, setMinStockLevel] = useState<number | ''>('');
  const [currentBalance, setCurrentBalance] = useState<number | ''>('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!stockNumber.trim() || !name.trim() || !category || !unit || minStockLevel === '' || currentBalance === '') return;
    setSubmitting(true);
    try {
      await createStockCard({
        stockNumber: stockNumber.trim(),
        name: name.trim(),
        category,
        unit,
        minStockLevel: Number(minStockLevel),
        currentBalance: Number(currentBalance),
      });
      onCreated();
      onClose();
      setStockNumber('');
      setName('');
      setCategory('');
      setUnit('');
      setMinStockLevel('');
      setCurrentBalance('');
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const isValid = stockNumber.trim() && name.trim() && category && unit && minStockLevel !== '' && currentBalance !== '';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: navy[800], fontWeight: 700 }}>{t('stockCards.dialogTitle')}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label={`${t('stockCards.stockNo')} *`}
              fullWidth
              size="small"
              value={stockNumber}
              onChange={(e) => setStockNumber(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label={`${t('stockCards.stockCardName')} *`}
              fullWidth
              size="small"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label={`${t('common.category')} *`}
              fullWidth
              size="small"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {STOCK_CATEGORIES.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label={`${t('common.unit')} *`}
              fullWidth
              size="small"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            >
              {STOCK_UNITS.map((u) => (
                <MenuItem key={u} value={u}>{u}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label={`${t('stockCards.minStockLevelLabel')} *`}
              fullWidth
              size="small"
              type="number"
              value={minStockLevel}
              onChange={(e) => setMinStockLevel(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label={`${t('stockCards.currentStockLabel')} *`}
              fullWidth
              size="small"
              type="number"
              value={currentBalance}
              onChange={(e) => setCurrentBalance(e.target.value === '' ? '' : Number(e.target.value))}
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
          disabled={submitting || !isValid}
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

export default function StockCardsPage() {
  const { t, language } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter: StockFilter = searchParams.get('lowStock') === 'true' ? 'low' : 'all';

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [stockFilter, setStockFilter] = useState<StockFilter>(initialFilter);
  const [selectedCard, setSelectedCard] = useState<StockCard | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [stockOutQty, setStockOutQty] = useState<number | ''>('');
  const [stockInQty, setStockInQty] = useState<number | ''>('');
  const [movementNote, setMovementNote] = useState('');
  const [movementSubmitting, setMovementSubmitting] = useState(false);
  const [movementRefresh, setMovementRefresh] = useState(0);
  const [feedback, setFeedback] = useState<{
    open: boolean;
    severity: 'success' | 'error';
    message: string;
  }>({ open: false, severity: 'success', message: '' });
  const dateLocale = language === 'tr' ? 'tr-TR' : 'en-US';

  // Fetch a large page to do client-side filtering for stock level & categories
  const { data, loading, refetch } = useApi<PagedResult<StockCard>>(
    () => getStockCards({ search: search || undefined, page: 1, pageSize: 200 }),
    [search]
  );
  const { data: movementData, loading: movementsLoading, refetch: refetchMovements } = useApi<PagedResult<StockMovement>>(
    () => (
      selectedCard
        ? getStockMovements({ stockCardId: selectedCard.id, page: 1, pageSize: 8 })
        : Promise.resolve({ items: [], page: 1, pageSize: 8, total: 0 })
    ),
    [selectedCard?.id, movementRefresh]
  );

  // Extract unique "categories" from stockNumber prefix (first 2 chars) as a proxy
  const categories = useMemo(() => {
    if (!data?.items) return [];
    const cats = Array.from(new Set(data.items.map((sc) => sc.stockNumber.substring(0, 2))));
    return cats.sort();
  }, [data]);

  // Apply filters
  const filteredItems = useMemo(() => {
    if (!data?.items) return [];
    let items = data.items;

    if (stockFilter === 'low') {
      items = items.filter((sc) => sc.currentBalance <= sc.minStockLevel);
    } else if (stockFilter === 'sufficient') {
      items = items.filter((sc) => sc.currentBalance > sc.minStockLevel);
    }

    if (categoryFilter) {
      items = items.filter((sc) => sc.stockNumber.startsWith(categoryFilter));
    }

    return items;
  }, [data, stockFilter, categoryFilter]);

  // Pagination on filtered results
  const pageSize = 15;
  const totalPages = Math.ceil(filteredItems.length / pageSize);
  const pagedItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (!selectedCard || !data?.items) return;
    const latest = data.items.find((item) => item.id === selectedCard.id);
    if (latest) setSelectedCard(latest);
  }, [data, selectedCard?.id]);

  const handleFilterChange = (_: unknown, val: StockFilter | null) => {
    if (!val) return;
    setStockFilter(val);
    setPage(1);
    if (val === 'low') {
      setSearchParams({ lowStock: 'true' });
    } else {
      searchParams.delete('lowStock');
      setSearchParams(searchParams);
    }
  };

  const handleRowClick = (sc: StockCard) => {
    setSelectedCard(sc);
    setDrawerOpen(true);
    setStockOutQty('');
    setStockInQty('');
    setMovementNote('');
  };

  const getMovementTypeLabel = (movementType: number) => {
    switch (movementType) {
      case 0:
        return t('stockCards.movementIn');
      case 1:
        return t('stockCards.movementOut');
      case 2:
        return t('stockCards.movementTransfer');
      case 3:
        return t('stockCards.movementAdjustment');
      default:
        return t('common.status');
    }
  };

  const submitMovement = async (movementType: 0 | 1, quantity: number) => {
    if (!selectedCard || quantity <= 0) return;
    setMovementSubmitting(true);
    try {
      await createStockMovement({
        stockCardId: selectedCard.id,
        movementType,
        quantity,
        notes: movementNote.trim() || undefined,
      });
      setSelectedCard((prev) => {
        if (!prev) return prev;
        const delta = movementType === 0 ? quantity : -quantity;
        return { ...prev, currentBalance: prev.currentBalance + delta };
      });
      refetch();
      refetchMovements();
      setMovementRefresh((v) => v + 1);
      setMovementNote('');
      if (movementType === 0) setStockInQty('');
      if (movementType === 1) setStockOutQty('');
      setFeedback({
        open: true,
        severity: 'success',
        message: t('stockCards.movementSaved'),
      });
    } catch (e: any) {
      setFeedback({
        open: true,
        severity: 'error',
        message: e?.message || t('stockCards.movementSaveError'),
      });
    } finally {
      setMovementSubmitting(false);
    }
  };

  const renderGauge = (sc: StockCard) => {
    const ratio = sc.minStockLevel > 0 ? Math.min((sc.currentBalance / (sc.minStockLevel * 3)) * 100, 100) : 100;
    const isLow = sc.currentBalance <= sc.minStockLevel;
    const color = isLow ? '#DC2626' : ratio < 50 ? '#F59E0B' : '#059669';
    return (
      <Box sx={{ textAlign: 'center' }}>
        <Box sx={{ position: 'relative', display: 'inline-flex', width: 100, height: 100 }}>
          <svg viewBox="0 0 100 100" width={100} height={100}>
            <circle cx="50" cy="50" r="40" fill="none" stroke={navy[100]} strokeWidth="8" />
            <circle
              cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="8"
              strokeDasharray={`${ratio * 2.51} 251`}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
          </svg>
          <Box sx={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color }}>{sc.currentBalance}</Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>/ {sc.minStockLevel * 3}</Typography>
          </Box>
        </Box>
        <Typography variant="body2" sx={{ mt: 1, fontWeight: 600, color }}>
          {isLow ? t('stockCards.lowStock') : t('stockCards.sufficient')}
        </Typography>
      </Box>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: navy[800], letterSpacing: '-0.02em' }}>
            {t('stockCards.title')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.5 }}>
            {t('stockCards.subtitle')}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
          {t('stockCards.newStockCard')}
        </Button>
      </Box>

      {/* Toggle Filter */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
        <ToggleButtonGroup
          value={stockFilter}
          exclusive
          onChange={handleFilterChange}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              textTransform: 'none', fontWeight: 600, px: 2,
              borderColor: navy[100],
              color: navy[600],
              '&.Mui-selected': {
                bgcolor: alpha(accent.main, 0.1),
                color: accent.main,
                borderColor: accent.main,
                '&:hover': {
                  bgcolor: alpha(accent.main, 0.15),
                },
              },
            },
          }}
        >
          <ToggleButton value="all">{`${t('common.all')} (${data?.items.length || 0})`}</ToggleButton>
          <ToggleButton value="low" sx={{ '&:not(.Mui-selected)': { color: '#DC2626' } }}>
            <WarningIcon sx={{ fontSize: 16, mr: 0.5 }} /> {t('stockCards.lowStock')} ({data?.items.filter((s) => s.currentBalance <= s.minStockLevel).length || 0})
          </ToggleButton>
          <ToggleButton value="sufficient" sx={{ '&:not(.Mui-selected)': { color: '#059669' } }}>
            {t('stockCards.sufficientStock')} ({data?.items.filter((s) => s.currentBalance > s.minStockLevel).length || 0})
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Category chips */}
      {categories.length > 0 && (
        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 2 }}>
          <Chip
            label={t('stockCards.allCategories')}
            size="small"
            variant={categoryFilter === null ? 'filled' : 'outlined'}
            onClick={() => { setCategoryFilter(null); setPage(1); }}
            sx={{
              fontWeight: 700,
              ...(categoryFilter === null
                ? { bgcolor: accent.main, color: '#fff', '&:hover': { bgcolor: accent.dark } }
                : { borderColor: navy[200], color: navy[600] }),
            }}
          />
          {categories.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              size="small"
              variant={categoryFilter === cat ? 'filled' : 'outlined'}
              onClick={() => { setCategoryFilter(cat === categoryFilter ? null : cat); setPage(1); }}
              sx={{
                fontWeight: 700,
                ...(categoryFilter === cat
                  ? { bgcolor: accent.main, color: '#fff', '&:hover': { bgcolor: accent.dark } }
                  : { borderColor: navy[200], color: navy[600] }),
              }}
            />
          ))}
        </Box>
      )}

      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <TextField
            fullWidth
            size="small"
            placeholder={t('stockCards.searchPlaceholder')}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </CardContent>
      </Card>

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
                    <TableCell sx={{ fontWeight: 700, color: navy[800] }}>{t('stockCards.stockNo')}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: navy[800] }}>{t('common.name')}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: navy[800] }}>{t('common.unit')}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: navy[800] }}>{t('stockCards.minStock')}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: navy[800] }}>{t('stockCards.currentStockLabel')}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: navy[800] }}>{t('common.status')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagedItems.map((sc) => {
                    const isLow = sc.currentBalance <= sc.minStockLevel;
                    const ratio = sc.minStockLevel > 0 ? Math.min((sc.currentBalance / (sc.minStockLevel * 3)) * 100, 100) : 100;
                    return (
                      <TableRow
                        key={sc.id}
                        hover
                        onClick={() => handleRowClick(sc)}
                        sx={{
                          cursor: 'pointer',
                          bgcolor: isLow ? alpha('#DC2626', 0.04) : 'transparent',
                          '&:hover': {
                            bgcolor: isLow ? `${alpha('#DC2626', 0.08)} !important` : undefined,
                          },
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: '"JetBrains Mono", monospace', color: navy[600] }}>
                            {sc.stockNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{sc.name}</Typography>
                        </TableCell>
                        <TableCell>{sc.unit}</TableCell>
                        <TableCell>{sc.minStockLevel}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 170 }}>
                            <LinearProgress
                              variant="determinate"
                              value={ratio}
                              sx={{
                                flexGrow: 1,
                                height: 8,
                                borderRadius: 4,
                                bgcolor: navy[100],
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: isLow ? '#DC2626' : ratio < 50 ? '#F59E0B' : '#059669',
                                  borderRadius: 4,
                                },
                              }}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 70, textAlign: 'right', color: navy[800] }}>
                              {sc.currentBalance} {sc.unit}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {isLow ? (
                            <Chip
                              icon={<WarningIcon />}
                              label={t('stockCards.lowStock')}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                bgcolor: alpha('#DC2626', 0.1),
                                color: '#DC2626',
                                '& .MuiChip-icon': { color: '#DC2626' },
                              }}
                            />
                          ) : (
                            <Chip
                              label={t('stockCards.sufficient')}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                bgcolor: alpha('#059669', 0.1),
                                color: '#059669',
                              }}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} color="primary" />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 420 } } }}
      >
        {selectedCard && (
          <Box>
            <Box sx={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              bgcolor: navy[800], color: '#fff', px: 3, py: 2,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InventoryIcon sx={{ color: '#fff' }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>{t('stockCards.cardDetail')}</Typography>
              </Box>
              <IconButton onClick={() => setDrawerOpen(false)} size="small" sx={{ color: '#fff' }}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Box sx={{ p: 3 }}>
              {/* Card info */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#94A3B8' }}>{t('stockCards.stockNo')}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: '"JetBrains Mono", monospace', color: navy[600] }}>{selectedCard.stockNumber}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#94A3B8' }}>{t('common.name')}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedCard.name}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#94A3B8' }}>{t('common.unit')}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedCard.unit}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#94A3B8' }}>{t('stockCards.minStockLevel')}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedCard.minStockLevel}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#94A3B8' }}>{t('stockCards.currentStockLabel')}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: navy[800] }}>
                    {selectedCard.currentBalance} {selectedCard.unit}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#94A3B8' }}>{t('stockCards.registrationDate')}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {new Date(selectedCard.createdAt).toLocaleDateString(dateLocale)}
                  </Typography>
                </Box>
              </Box>

              {/* Gauge */}
              <Card variant="outlined" sx={{ mb: 3, p: 2, textAlign: 'center', borderColor: navy[100] }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: navy[800] }}>{t('stockCards.currentStockLevel')}</Typography>
                {renderGauge(selectedCard)}
              </Card>

              {/* Stock usage / refill */}
              <Card variant="outlined" sx={{ mb: 2, p: 2, borderColor: navy[100] }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <TrendingDown sx={{ color: '#F59E0B', fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: navy[800] }}>
                    {t('stockCards.stockActions')}
                  </Typography>
                </Box>
                <Grid container spacing={1.25} sx={{ mb: 1.25 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      size="small"
                      type="number"
                      fullWidth
                      label={t('stockCards.useQty')}
                      value={stockOutQty}
                      onChange={(e) => setStockOutQty(e.target.value === '' ? '' : Number(e.target.value))}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      size="small"
                      type="number"
                      fullWidth
                      label={t('stockCards.addQty')}
                      value={stockInQty}
                      onChange={(e) => setStockInQty(e.target.value === '' ? '' : Number(e.target.value))}
                    />
                  </Grid>
                </Grid>
                <TextField
                  size="small"
                  fullWidth
                  label={t('stockCards.movementNote')}
                  value={movementNote}
                  onChange={(e) => setMovementNote(e.target.value)}
                  sx={{ mb: 1.25 }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<RemoveCircleOutline />}
                    disabled={movementSubmitting || stockOutQty === '' || Number(stockOutQty) <= 0}
                    onClick={() => submitMovement(1, Number(stockOutQty))}
                  >
                    {t('stockCards.useStock')}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<AddCircleOutline />}
                    disabled={movementSubmitting || stockInQty === '' || Number(stockInQty) <= 0}
                    onClick={() => submitMovement(0, Number(stockInQty))}
                    sx={{ borderColor: '#059669', color: '#059669' }}
                  >
                    {t('stockCards.addStock')}
                  </Button>
                </Box>
              </Card>

              {/* Maintenance cards placeholder */}
              <Card variant="outlined" sx={{ mb: 2, p: 2, borderColor: navy[100] }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <TrendingUp sx={{ color: navy[600], fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: navy[800] }}>
                    {t('stockCards.relatedMaintenanceCards')}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#94A3B8' }}>
                  {t('stockCards.maintenanceIntegration')}
                </Typography>
              </Card>

              {/* Recent movements */}
              <Card variant="outlined" sx={{ p: 2, borderColor: navy[100] }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <TrendingDown sx={{ color: '#F59E0B', fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: navy[800] }}>
                    {t('stockCards.recentMovements')}
                  </Typography>
                </Box>
                {movementsLoading ? (
                  <Box sx={{ py: 1 }}>
                    <Skeleton height={28} />
                    <Skeleton height={28} />
                    <Skeleton height={28} />
                  </Box>
                ) : movementData?.items?.length ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {movementData.items.map((m) => {
                      const c = MOVEMENT_TYPE_COLORS[m.movementType] ?? navy[500];
                      return (
                        <Box
                          key={m.id}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: 1,
                            borderRadius: 1,
                            bgcolor: alpha(c, 0.08),
                          }}
                        >
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: navy[800] }}>
                              {getMovementTypeLabel(m.movementType)} - {m.quantity}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B' }}>
                              {new Date(m.createdAt).toLocaleString(dateLocale)}
                            </Typography>
                            {m.notes && (
                              <Typography variant="caption" sx={{ display: 'block', color: '#94A3B8' }}>
                                {m.notes}
                              </Typography>
                            )}
                          </Box>
                          <Chip
                            size="small"
                            label={getMovementTypeLabel(m.movementType)}
                            sx={{ bgcolor: alpha(c, 0.18), color: c, fontWeight: 700 }}
                          />
                        </Box>
                      );
                    })}
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#94A3B8' }}>
                    {t('stockCards.movementHistory')}
                  </Typography>
                )}
              </Card>
            </Box>
          </Box>
        )}
      </Drawer>

      <CreateStockCardDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={refetch}
      />
      <Snackbar
        open={feedback.open}
        autoHideDuration={3200}
        onClose={() => setFeedback((f) => ({ ...f, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={feedback.severity}
          variant="filled"
          onClose={() => setFeedback((f) => ({ ...f, open: false }))}
          sx={{ width: '100%' }}
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
