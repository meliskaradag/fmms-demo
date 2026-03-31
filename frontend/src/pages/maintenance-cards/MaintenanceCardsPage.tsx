import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, Chip, Skeleton,
  Accordion, AccordionSummary, AccordionDetails, Table, TableHead,
  TableRow, TableCell, TableBody, Button, Link, alpha,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Select, MenuItem, FormControl, InputLabel, IconButton, CircularProgress,
} from '@mui/material';
import { navy, accent } from '../../theme/theme';
import {
  ExpandMore, Add as AddIcon, Timer, Build,
  CheckCircle as CheckCircleIcon, Cancel as CancelIcon,
  Circle as CircleIcon,
  Add as AddStepIcon, Delete as DeleteIcon,
} from '@mui/icons-material';
import { useApi } from '../../hooks/useApi';
import { getMaintenanceCards, getStockCards, createMaintenanceCard } from '../../api/endpoints';
import { MaintenanceLevelLabels } from '../../types';
import { useTranslation } from '../../i18n';
import type { PagedResult, MaintenanceCard, StockCard } from '../../types';

const levelColors: Record<number, string> = {
  0: '#10B981',
  1: accent.main,
  2: '#F59E0B',
  3: '#EF4444',
};

export default function MaintenanceCardsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [levelFilter, setLevelFilter] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);

  const { data, loading, refetch } = useApi<PagedResult<MaintenanceCard>>(
    () => getMaintenanceCards({ pageSize: 50 }),
    []
  );

  // Fetch stock cards for cross-reference
  const { data: stockData } = useApi<PagedResult<StockCard>>(
    () => getStockCards({ pageSize: 200 }),
    []
  );

  // Build a lookup map: stockCardId -> StockCard
  const stockMap = useMemo(() => {
    const map = new Map<string, StockCard>();
    stockData?.items.forEach((sc) => map.set(sc.id, sc));
    return map;
  }, [stockData]);

  // Extract unique asset categories
  const assetCategories = useMemo(() => {
    if (!data?.items) return [];
    const cats = Array.from(new Set(data.items.map((c) => c.assetCategory).filter(Boolean) as string[]));
    return cats.sort();
  }, [data]);

  // Filter items
  const filteredItems = useMemo(() => {
    if (!data?.items) return [];
    let items = data.items;
    if (levelFilter !== null) {
      items = items.filter((c) => c.level === levelFilter);
    }
    if (categoryFilter) {
      items = items.filter((c) => c.assetCategory === categoryFilter);
    }
    return items;
  }, [data, levelFilter, categoryFilter]);

  const handleStockClick = (stockCardName: string) => {
    navigate(`/stock-cards?search=${encodeURIComponent(stockCardName)}`);
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800, color: navy[800], letterSpacing: '-0.02em', mb: 3 }}>{t('maintenanceCards.title')}</Typography>
        {[...Array(3)].map((_, i) => <Skeleton key={i} variant="rounded" height={80} sx={{ mb: 2 }} />)}
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: navy[800], letterSpacing: '-0.02em' }}>
            {t('maintenanceCards.title')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8' }}>
            {t('maintenanceCards.subtitle')}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
          {t('maintenanceCards.newCard')}
        </Button>
      </Box>

      {/* Level filter chips */}
      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1.5 }}>
        <Chip
          label={t('common.all')}
          size="small"
          variant={levelFilter === null ? 'filled' : 'outlined'}
          color={levelFilter === null ? 'primary' : 'default'}
          onClick={() => setLevelFilter(null)}
          sx={{ fontWeight: 600 }}
        />
        {Object.entries(MaintenanceLevelLabels).map(([key, label]) => {
          const lvl = Number(key);
          return (
            <Chip
              key={lvl}
              label={label}
              size="small"
              variant={levelFilter === lvl ? 'filled' : 'outlined'}
              onClick={() => setLevelFilter(levelFilter === lvl ? null : lvl)}
              sx={{
                fontWeight: 600,
                bgcolor: levelFilter === lvl ? `${levelColors[lvl]}` : 'transparent',
                color: levelFilter === lvl ? '#fff' : levelColors[lvl],
                borderColor: levelColors[lvl],
                '&:hover': { bgcolor: alpha(levelColors[lvl] || '#6B7280', 0.18) },
              }}
            />
          );
        })}
      </Box>

      {/* Asset category filter chips */}
      {assetCategories.length > 0 && (
        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 2 }}>
          <Chip
            label={t('maintenanceCards.allCategories')}
            size="small"
            variant={categoryFilter === null ? 'filled' : 'outlined'}
            color={categoryFilter === null ? 'primary' : 'default'}
            onClick={() => setCategoryFilter(null)}
            sx={{ fontWeight: 600 }}
          />
          {assetCategories.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              size="small"
              variant={categoryFilter === cat ? 'filled' : 'outlined'}
              color={categoryFilter === cat ? 'primary' : 'default'}
              onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
              sx={{ fontWeight: 600 }}
            />
          ))}
        </Box>
      )}

      {filteredItems.map((card) => {
        const totalMinutes = card.steps?.reduce((sum, s) => sum + s.estimatedMinutes, 0) || 0;

        return (
          <Accordion key={card.id} sx={{ mb: 1.5, borderRadius: '12px !important', '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', pr: 2 }}>
                <Build sx={{ color: navy[600] }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: navy[800] }}>
                    {card.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.assetCategory} | {t('maintenanceCards.period')}: {card.defaultPeriodDays} {t('maintenanceCards.days')}
                  </Typography>
                </Box>
                <Chip
                  label={MaintenanceLevelLabels[card.level]}
                  size="small"
                  sx={{
                    bgcolor: alpha(levelColors[card.level] || '#6B7280', 0.1),
                    color: levelColors[card.level] || '#6B7280',
                    fontWeight: 700,
                    fontSize: '0.7rem',
                  }}
                />
                {card.estimatedDuration && (
                  <Chip
                    icon={<Timer />}
                    label={card.estimatedDuration}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 2.5, pb: 2.5 }}>
              {card.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {card.description}
                </Typography>
              )}

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 7 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: navy[800] }}>
                      {t('maintenanceCards.steps')} ({card.steps?.length || 0})
                    </Typography>
                    {totalMinutes > 0 && (
                      <Chip
                        icon={<Timer sx={{ fontSize: 16 }} />}
                        label={`${t('common.total')}: ${totalMinutes} ${t('maintenanceCards.minutes')}`}
                        size="small"
                        color="info"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                  </Box>

                  {card.steps && card.steps.length > 0 ? (
                    <>
                      {/* Visual step progress indicator */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, px: 1, overflowX: 'auto' }}>
                        {card.steps.sort((a, b) => a.stepOrder - b.stepOrder).map((step, idx) => (
                          <Box key={step.id} sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{
                              display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 56,
                            }}>
                              <Box sx={{
                                width: 32, height: 32, borderRadius: '50%',
                                bgcolor: step.stepStatus === 0 ? navy[600] : '#9E9E9E',
                                color: '#fff', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem',
                              }}>
                                {step.stepOrder}
                              </Box>
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, textAlign: 'center', fontSize: '0.65rem', maxWidth: 60, lineHeight: 1.2 }}>
                                {step.estimatedMinutes} {t('maintenanceCards.minutes')}
                              </Typography>
                            </Box>
                            {idx < card.steps.length - 1 && (
                              <Box sx={{ width: 24, height: 2, bgcolor: alpha(navy[200], 0.6), mx: 0.25 }} />
                            )}
                          </Box>
                        ))}
                      </Box>

                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell width={50}>#</TableCell>
                            <TableCell>{t('maintenanceCards.instruction')}</TableCell>
                            <TableCell width={80}>{t('maintenanceCards.duration')}</TableCell>
                            <TableCell width={80}>{t('maintenanceCards.mandatory')}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {card.steps.sort((a, b) => a.stepOrder - b.stepOrder).map((step) => (
                            <TableRow key={step.id}>
                              <TableCell>{step.stepOrder}</TableCell>
                              <TableCell>{step.instruction}</TableCell>
                              <TableCell>{step.estimatedMinutes} {t('maintenanceCards.minutes')}</TableCell>
                              <TableCell>
                                <Chip
                                  label={step.stepStatus === 0 ? t('maintenanceCards.mandatory') : t('maintenanceCards.optional')}
                                  size="small"
                                  color={step.stepStatus === 0 ? 'primary' : 'default'}
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">{t('maintenanceCards.noSteps')}</Typography>
                  )}
                </Grid>
                <Grid size={{ xs: 12, md: 5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: navy[800], mb: 1 }}>
                    {t('maintenanceCards.requiredMaterials')} ({card.materials?.length || 0})
                  </Typography>
                  {card.materials && card.materials.length > 0 ? (
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>{t('maintenanceCards.material')}</TableCell>
                          <TableCell width={80}>{t('maintenanceCards.quantity')}</TableCell>
                          <TableCell width={60}>{t('maintenanceCards.stock')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {card.materials.map((mat) => {
                          const stockCard = stockMap.get(mat.stockCardId);
                          const isSufficient = stockCard ? stockCard.currentBalance >= mat.quantity : false;
                          const hasStockInfo = !!stockCard;

                          return (
                            <TableRow key={mat.id}>
                              <TableCell>
                                <Link
                                  component="button"
                                  variant="body2"
                                  onClick={() => handleStockClick(mat.stockCardName)}
                                  sx={{ textDecoration: 'none', fontWeight: 500, cursor: 'pointer' }}
                                >
                                  {mat.stockCardName}
                                </Link>
                              </TableCell>
                              <TableCell>{mat.quantity} {mat.unit}</TableCell>
                              <TableCell>
                                {hasStockInfo ? (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    {isSufficient ? (
                                      <CheckCircleIcon sx={{ fontSize: 18, color: '#059669' }} />
                                    ) : (
                                      <CancelIcon sx={{ fontSize: 18, color: '#DC2626' }} />
                                    )}
                                    <Typography variant="caption" sx={{ fontWeight: 600, color: isSufficient ? '#059669' : '#DC2626' }}>
                                      {stockCard!.currentBalance}
                                    </Typography>
                                  </Box>
                                ) : (
                                  <CircleIcon sx={{ fontSize: 12, color: '#9E9E9E' }} />
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <Typography variant="body2" color="text.secondary">{t('maintenanceCards.noMaterials')}</Typography>
                  )}
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        );
      })}

      <CreateMaintenanceCardDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => { refetch(); setCreateOpen(false); }}
      />
    </Box>
  );
}

/* ─── Create Dialog ─── */

function CreateMaintenanceCardDialog({
  open, onClose, onCreated,
}: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [assetCategory, setAssetCategory] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState<number>(0);
  const [defaultPeriodDays, setDefaultPeriodDays] = useState<number | ''>('');
  const [steps, setSteps] = useState([{ instruction: '', estimatedMinutes: '' as number | '' }]);
  const [submitting, setSubmitting] = useState(false);

  const categoryOptions = ['HVAC - AHU', 'HVAC - Chiller', 'HVAC - Fan Coil', 'Asansor', 'Elektrik'];

  const addStep = () => setSteps((prev) => [...prev, { instruction: '', estimatedMinutes: '' }]);
  const removeStep = (idx: number) => setSteps((prev) => prev.filter((_, i) => i !== idx));
  const updateStep = (idx: number, field: string, value: string | number) =>
    setSteps((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await createMaintenanceCard({
        name,
        assetCategory: assetCategory || undefined,
        description: description || undefined,
        level,
        defaultPeriodDays: Number(defaultPeriodDays),
        isTemplate: true,
        steps: steps.map((s, i) => ({
          stepOrder: i + 1,
          instruction: s.instruction,
          stepStatus: 0,
          estimatedMinutes: Number(s.estimatedMinutes) || 0,
        })),
        materials: [],
      });
      onCreated();
      // reset
      setName(''); setAssetCategory(''); setDescription(''); setLevel(0);
      setDefaultPeriodDays(''); setSteps([{ instruction: '', estimatedMinutes: '' }]);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const valid = name.trim() !== '' && defaultPeriodDays !== '';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: navy[800], fontWeight: 700 }}>{t('maintenanceCards.dialogTitle')}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
        <TextField label={`${t('maintenanceCards.cardName')} *`} size="small" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
        <FormControl size="small" fullWidth>
          <InputLabel>{t('maintenanceCards.assetCategory')}</InputLabel>
          <Select value={assetCategory} label={t('maintenanceCards.assetCategory')} onChange={(e) => setAssetCategory(e.target.value)}>
            <MenuItem value="">{t('maintenanceCards.notSelected')}</MenuItem>
            {categoryOptions.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField label={t('common.description')} size="small" fullWidth multiline minRows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        <FormControl size="small" fullWidth>
          <InputLabel>{`${t('maintenanceCards.maintenanceLevel')} *`}</InputLabel>
          <Select value={level} label={`${t('maintenanceCards.maintenanceLevel')} *`} onChange={(e) => setLevel(Number(e.target.value))}>
            {Object.entries(MaintenanceLevelLabels).map(([k, v]) => (
              <MenuItem key={k} value={Number(k)}>{v}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField label={`${t('maintenanceCards.periodDays')} *`} size="small" fullWidth type="number" value={defaultPeriodDays} onChange={(e) => setDefaultPeriodDays(e.target.value === '' ? '' : Number(e.target.value))} />

        {/* Steps */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: navy[800] }}>{t('maintenanceCards.steps')}</Typography>
            <Button size="small" startIcon={<AddStepIcon />} onClick={addStep}>{t('maintenanceCards.addStep')}</Button>
          </Box>
          {steps.map((step, idx) => (
            <Box key={idx} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
              <Typography variant="body2" sx={{ minWidth: 24, fontWeight: 600, color: navy[600] }}>{idx + 1}.</Typography>
              <TextField label={t('maintenanceCards.instruction')} size="small" fullWidth value={step.instruction} onChange={(e) => updateStep(idx, 'instruction', e.target.value)} />
              <TextField label={t('maintenanceCards.minutes')} size="small" type="number" sx={{ width: 80 }} value={step.estimatedMinutes} onChange={(e) => updateStep(idx, 'estimatedMinutes', e.target.value === '' ? '' : Number(e.target.value))} />
              {steps.length > 1 && (
                <IconButton size="small" onClick={() => removeStep(idx)}><DeleteIcon fontSize="small" /></IconButton>
              )}
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" onClick={onClose} sx={{ color: navy[600], borderColor: navy[600] }}>{t('common.cancel')}</Button>
        <Button
          variant="contained"
          disabled={!valid || submitting}
          onClick={handleSubmit}
          sx={{ background: `linear-gradient(135deg, ${navy[700]} 0%, ${navy[600]} 100%)` }}
        >
          {submitting ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : t('common.create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
