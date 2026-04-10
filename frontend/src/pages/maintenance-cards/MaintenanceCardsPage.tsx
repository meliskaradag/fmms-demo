import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, Chip, Skeleton,
  Accordion, AccordionSummary, AccordionDetails, Table, TableHead,
  TableRow, TableCell, TableBody, Button, Link, alpha,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Select, MenuItem, FormControl, InputLabel, IconButton, CircularProgress,
  List, ListItem, ListItemText, ListItemSecondaryAction,
} from '@mui/material';
import { navy, accent } from '../../theme/theme';
import {
  ExpandMore, Add as AddIcon, Timer, Build,
  CheckCircle as CheckCircleIcon, Cancel as CancelIcon,
  Circle as CircleIcon,
  Add as AddStepIcon, Delete as DeleteIcon,
  UploadFile as UploadFileIcon,
} from '@mui/icons-material';
import { useApi } from '../../hooks/useApi';
import {
  getMaintenanceCards, getStockCards, createMaintenanceCard,
  getMaintenancePlans, createMaintenancePlan, getAssets, getMaintenancePlanRuns,
} from '../../api/endpoints';
import { MaintenanceLevelLabels, PriorityLabels } from '../../types';
import { useTranslation } from '../../i18n';
import type { PagedResult, MaintenanceCard, StockCard, MaintenancePlan, MaintenancePlanRun, Asset } from '../../types';

const levelColors: Record<number, string> = {
  0: '#10B981',
  1: accent.main,
  2: '#F59E0B',
  3: '#EF4444',
};
interface CardDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string;
  uploadedAt: string;
}

const DOCS_STORAGE_KEY = 'fmms.maintenance.cardDocs.v1';
const PLAN_DOCS_STORAGE_KEY = 'fmms.maintenance.planDocs.v1';

const loadAllCardDocs = (): Record<string, CardDocument[]> => {
  try {
    const raw = localStorage.getItem(DOCS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveAllCardDocs = (docs: Record<string, CardDocument[]>) => {
  try {
    localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(docs));
  } catch {
    // ignore quota errors in demo mode
  }
};

const runStatusLabels: Record<number, string> = {
  0: 'I\u015F Emri Olu\u015Ftu',
  1: 'Stok Nedeniyle Engellendi',
  2: 'A\u00E7\u0131k I\u015F Emri Nedeniyle Atland\u0131',
};

const loadAllPlanDocs = (): Record<string, CardDocument[]> => {
  try {
    const raw = localStorage.getItem(PLAN_DOCS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveAllPlanDocs = (docs: Record<string, CardDocument[]>) => {
  try {
    localStorage.setItem(PLAN_DOCS_STORAGE_KEY, JSON.stringify(docs));
  } catch {
    // ignore quota errors in demo mode
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

const toCardDocument = async (file: File): Promise<CardDocument> => {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: file.name,
    size: file.size,
    type: file.type,
    dataUrl,
    uploadedAt: new Date().toISOString(),
  };
};
export default function MaintenanceCardsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [levelFilter, setLevelFilter] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createPlanOpen, setCreatePlanOpen] = useState(false);
  const [periodicView, setPeriodicView] = useState<'plans' | 'history'>('plans');

  const [cardDocs, setCardDocs] = useState<Record<string, CardDocument[]>>(() => loadAllCardDocs());
  const [planDocs, setPlanDocs] = useState<Record<string, CardDocument[]>>(() => loadAllPlanDocs());

  const updateCardDocs = (cardId: string, next: CardDocument[]) => {
    setCardDocs((prev) => {
      const updated = { ...prev, [cardId]: next };
      saveAllCardDocs(updated);
      return updated;
    });
  };

  const updatePlanDocs = (planId: string, next: CardDocument[]) => {
    setPlanDocs((prev) => {
      const updated = { ...prev, [planId]: next };
      saveAllPlanDocs(updated);
      return updated;
    });
  };

  const { data, loading, refetch } = useApi<PagedResult<MaintenanceCard>>(
    () => getMaintenanceCards({ pageSize: 50 }),
    []
  );

  const { data: plansData, refetch: refetchPlans } = useApi<PagedResult<MaintenancePlan>>(
    () => getMaintenancePlans({ pageSize: 100 }),
    []
  );
  const { data: planRunsData, refetch: refetchPlanRuns } = useApi<PagedResult<MaintenancePlanRun>>(
    () => getMaintenancePlanRuns({ pageSize: 100 }),
    []
  );

  const { data: assetsData } = useApi<PagedResult<Asset>>(
    () => getAssets({ pageSize: 500 }),
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

  const periodicPlanBuckets = useMemo(() => {
    const plans = plansData?.items ?? [];
    return {
      weekly: plans.filter((p) => (p.frequencyDays ?? 0) > 0 && (p.frequencyDays ?? 0) <= 7),
      monthly: plans.filter((p) => (p.frequencyDays ?? 0) > 7 && (p.frequencyDays ?? 0) <= 31),
      other: plans.filter((p) => !(p.frequencyDays ?? 0) || (p.frequencyDays ?? 0) > 31),
    };
  }, [plansData]);

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


      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 1, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: navy[800] }}>Periyodik Planlar</Typography>
              <Typography variant="body2" sx={{ color: '#64748B' }}>
                {'Sadece zaman bazl\u0131 planlar (haftal\u0131k, ayl\u0131k vb.) y\u00F6netilir.'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant={periodicView === 'plans' ? 'contained' : 'outlined'}
                onClick={() => setPeriodicView('plans')}
              >
                {'Planlar'}
              </Button>
              <Button
                size="small"
                variant={periodicView === 'history' ? 'contained' : 'outlined'}
                onClick={() => setPeriodicView('history')}
              >
                {'Bak\u0131m Ge\u00E7mi\u015Fi'}
              </Button>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreatePlanOpen(true)}>
                {'Plan Olu\u015Ftur'}
              </Button>
            </Box>
          </Box>

          {periodicView === 'plans' && (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Plan</TableCell>
                <TableCell>{'Varl\u0131k'}</TableCell>
                <TableCell>Periyot</TableCell>
                <TableCell>Sonraki Zaman</TableCell>
                <TableCell>{'\u00D6ncelik'}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(plansData?.items ?? []).map((plan) => {
                const remainingDays = plan.nextDueAt
                  ? Math.ceil((new Date(plan.nextDueAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  : null;
                const attachedDocs = planDocs[plan.id] ?? [];

                return (
                  <TableRow key={plan.id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{plan.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{plan.maintenanceCardName}</Typography>
                      {attachedDocs.length > 0 && (
                        <Typography variant="caption" sx={{ display: 'block', color: '#64748B' }}>
                          {`Dok\u00FCmanlar: ${attachedDocs.length}`}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{plan.assetName}</TableCell>
                    <TableCell>{plan.frequencyDays ? `${plan.frequencyDays} g\u00FCn` : '-'}</TableCell>
                    <TableCell>
                      {plan.nextDueAt ? new Date(plan.nextDueAt).toLocaleDateString('tr-TR') : '-'}
                      {remainingDays !== null && (
                        <Typography component="span" variant="caption" sx={{ ml: 0.75, color: remainingDays < 0 ? '#DC2626' : '#64748B' }}>
                          ({remainingDays < 0 ? `${Math.abs(remainingDays)} g\u00FCn ge\u00E7ti` : `${remainingDays} g\u00FCn kald\u0131`})
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{PriorityLabels[plan.priority] ?? '-'}</TableCell>
                  </TableRow>
                );
              })}
              {(plansData?.items?.length ?? 0) === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography variant="body2" color="text.secondary">{'Hen\u00FCz plan yok.'}</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          )}

          {periodicView === 'history' && (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{'Plan'}</TableCell>
                  <TableCell>{'Varl\u0131k'}</TableCell>
                  <TableCell>{'Durum'}</TableCell>
                  <TableCell>{'Tetiklenme'}</TableCell>
                  <TableCell>{'Neden'}</TableCell>
                  <TableCell>{'\u0130\u015F Emri'}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(planRunsData?.items ?? []).map((run) => (
                  <TableRow key={run.id}>
                    <TableCell>{run.maintenancePlanName}</TableCell>
                    <TableCell>{run.assetName || '-'}</TableCell>
                    <TableCell>{runStatusLabels[run.status] ?? '-'}</TableCell>
                    <TableCell>{new Date(run.triggeredAt).toLocaleString('tr-TR')}</TableCell>
                    <TableCell>{run.triggerReason || '-'}</TableCell>
                    <TableCell>{run.workOrderId ? run.workOrderId.slice(0, 8) : '-'}</TableCell>
                  </TableRow>
                ))}
                {(planRunsData?.items?.length ?? 0) === 0 && (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Typography variant="body2" color="text.secondary">
                        {'Hen\u00FCz bak\u0131m ge\u00E7mi\u015Fi yok.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          <Box sx={{ mt: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip size="small" label={`Haftal\u0131k: ${periodicPlanBuckets.weekly.length}`} />
            <Chip size="small" label={`Ayl\u0131k: ${periodicPlanBuckets.monthly.length}`} />
            <Chip size="small" label={`Di\u011Fer: ${periodicPlanBuckets.other.length}`} />
          </Box>
        </CardContent>
      </Card>
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

              {(cardDocs[card.id] ?? []).length > 0 && (
                <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px dashed #E2E8F0' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: navy[800], mb: 1 }}>
                    {'Dok\u00FCmanlar'} ({(cardDocs[card.id] ?? []).length})
                  </Typography>
                  <List dense disablePadding sx={{ border: '1px solid #E2E8F0', borderRadius: 1.5 }}>
                    {(cardDocs[card.id] ?? []).map((doc, idx, arr) => (
                      <ListItem key={doc.id} divider={idx < arr.length - 1}>
                        <ListItemText
                          primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{doc.name}</Typography>}
                          secondary={<Typography variant="caption">{formatFileSize(doc.size)}</Typography>}
                        />
                        <ListItemSecondaryAction>
                          <Button size="small" onClick={() => window.open(doc.dataUrl, '_blank')}>{'A\u00E7'}</Button>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        );
      })}
      <CreateMaintenanceCardDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(newCardId, docs) => { if (docs.length > 0) updateCardDocs(newCardId, docs); refetch(); setCreateOpen(false); }}
      />

      <CreateMaintenancePlanDialog
        open={createPlanOpen}
        onClose={() => setCreatePlanOpen(false)}
        onCreated={(newPlanId, docs) => {
          if (docs.length > 0) updatePlanDocs(newPlanId, docs);
          setCreatePlanOpen(false);
          refetchPlans();
          refetchPlanRuns();
        }}
        cards={data?.items ?? []}
        assets={assetsData?.items ?? []}
      />
    </Box>
  );
}

/* --- Create Dialog --- */

function CreateMaintenanceCardDialog({
  open, onClose, onCreated,
}: { open: boolean; onClose: () => void; onCreated: (newCardId: string, docs: CardDocument[]) => void }) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [assetCategory, setAssetCategory] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState<number>(0);
  const [steps, setSteps] = useState([{ instruction: '', estimatedMinutes: '' as number | '' }]);
  const [pendingDocs, setPendingDocs] = useState<CardDocument[]>([]);
  const docInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);

  const categoryOptions = ['HVAC - AHU', 'HVAC - Chiller', 'HVAC - Fan Coil', 'Asansor', 'Elektrik'];

  const addStep = () => setSteps((prev) => [...prev, { instruction: '', estimatedMinutes: '' }]);
  const removeStep = (idx: number) => setSteps((prev) => prev.filter((_, i) => i !== idx));
  const updateStep = (idx: number, field: string, value: string | number) =>
    setSteps((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));

  const handlePickDoc = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      alert('Dosya boyutu 4 MB s\u0131n\u0131r\u0131n\u0131 a\u015F\u0131yor.');
      if (docInputRef.current) docInputRef.current.value = '';
      return;
    }
    const doc = await toCardDocument(file);
    setPendingDocs((prev) => [...prev, doc]);
    if (docInputRef.current) docInputRef.current.value = '';
  };

  const removePendingDoc = (docId: string) => {
    setPendingDocs((prev) => prev.filter((d) => d.id !== docId));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const newCardId = await createMaintenanceCard({
        name,
        assetCategory: assetCategory || undefined,
        description: description || undefined,
        level,
        defaultPeriodDays: 0,
        isTemplate: true,
        steps: steps.map((s, i) => ({
          stepOrder: i + 1,
          instruction: s.instruction,
          stepStatus: 0,
          estimatedMinutes: Number(s.estimatedMinutes) || 0,
        })),
        materials: [],
      });
      onCreated(newCardId, pendingDocs);
      // reset
      setName(''); setAssetCategory(''); setDescription(''); setLevel(0);
      setSteps([{ instruction: '', estimatedMinutes: '' }]);
      setPendingDocs([]);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const valid = name.trim() !== '';

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
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: navy[800] }}>
              {'Dok\u00FCmanlar'} ({pendingDocs.length})
            </Typography>
            <Button size="small" variant="outlined" startIcon={<UploadFileIcon />} onClick={() => docInputRef.current?.click()}>
              {'Dok\u00FCman Y\u00FCkle'}
            </Button>
            <input
              ref={docInputRef}
              type="file"
              hidden
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt"
              onChange={handlePickDoc}
            />
          </Box>
          {pendingDocs.length === 0 ? (
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
              {'\u0130ste\u011Fe ba\u011Fl\u0131: bak\u0131m kart\u0131 ile birlikte dok\u00FCman ekleyebilirsiniz.'}
            </Typography>
          ) : (
            <List dense disablePadding sx={{ border: '1px solid #E2E8F0', borderRadius: 1.5 }}>
              {pendingDocs.map((doc, idx) => (
                <ListItem key={doc.id} divider={idx < pendingDocs.length - 1}>
                  <ListItemText
                    primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{doc.name}</Typography>}
                    secondary={<Typography variant="caption">{formatFileSize(doc.size)}</Typography>}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" size="small" onClick={() => removePendingDoc(doc.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
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














function CreateMaintenancePlanDialog({
  open, onClose, onCreated, cards, assets,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (newPlanId: string, docs: CardDocument[]) => void;
  cards: MaintenanceCard[];
  assets: Asset[];
}) {
  const [name, setName] = useState('');
  const [maintenanceCardId, setMaintenanceCardId] = useState('');
  const [assetId, setAssetId] = useState('');
  const [firstDueAt, setFirstDueAt] = useState('');
  const [frequencyDays, setFrequencyDays] = useState<number | ''>('');
  const [priority, setPriority] = useState<number>(1);
  const [pendingDocs, setPendingDocs] = useState<CardDocument[]>([]);
  const docInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);

  const valid =
    name.trim() !== '' &&
    maintenanceCardId !== '' &&
    assetId !== '' &&
    firstDueAt !== '' &&
    frequencyDays !== '';

  const handleCreate = async () => {
    if (!valid) return;
    setSubmitting(true);
    try {
      const newPlanId = await createMaintenancePlan({
        name,
        maintenanceCardId,
        assetId,
        triggerType: 0,
        firstDueAt: new Date(firstDueAt).toISOString(),
        frequencyDays: Number(frequencyDays),
        meterInterval: undefined,
        initialMeterReading: 0,
        priority,
        isActive: true,
      });
      onCreated(newPlanId, pendingDocs);
      setName('');
      setMaintenanceCardId('');
      setAssetId('');
      setFirstDueAt('');
      setFrequencyDays('');
      setPriority(1);
      setPendingDocs([]);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePickDoc = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      alert('Dosya boyutu 4 MB s\u0131n\u0131r\u0131n\u0131 a\u015F\u0131yor.');
      if (docInputRef.current) docInputRef.current.value = '';
      return;
    }
    const doc = await toCardDocument(file);
    setPendingDocs((prev) => [...prev, doc]);
    if (docInputRef.current) docInputRef.current.value = '';
  };

  const removePendingDoc = (docId: string) => {
    setPendingDocs((prev) => prev.filter((d) => d.id !== docId));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: navy[800], fontWeight: 700 }}>Yeni Periyodik Plan</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
        <TextField label={'Plan Ad\u0131 *'} size="small" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
        <FormControl size="small" fullWidth>
          <InputLabel>{'Bak\u0131m Kart\u0131 *'}</InputLabel>
          <Select value={maintenanceCardId} label={'Bak\u0131m Kart\u0131 *'} onChange={(e) => setMaintenanceCardId(e.target.value)}>
            {cards.map((card) => (
              <MenuItem key={card.id} value={card.id}>{card.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" fullWidth>
          <InputLabel>{'Varl\u0131k *'}</InputLabel>
          <Select value={assetId} label={'Varl\u0131k *'} onChange={(e) => setAssetId(e.target.value)}>
            {assets.map((asset) => (
              <MenuItem key={asset.id} value={asset.id}>{asset.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label={'\u0130lk Bak\u0131m Zaman\u0131 *'}
          size="small"
          fullWidth
          type="datetime-local"
          InputLabelProps={{ shrink: true }}
          value={firstDueAt}
          onChange={(e) => setFirstDueAt(e.target.value)}
        />
        <TextField
          label={'Periyot (G\u00FCn) *'}
          size="small"
          fullWidth
          type="number"
          value={frequencyDays}
          onChange={(e) => setFrequencyDays(e.target.value === '' ? '' : Number(e.target.value))}
        />

        <FormControl size="small" fullWidth>
          <InputLabel>{'\u00D6ncelik *'}</InputLabel>
          <Select value={priority} label={'\u00D6ncelik *'} onChange={(e) => setPriority(Number(e.target.value))}>
            {Object.entries(PriorityLabels).map(([k, v]) => (
              <MenuItem key={k} value={Number(k)}>{v}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: navy[800] }}>
              {'Dok\u00FCmanlar'} ({pendingDocs.length})
            </Typography>
            <Button size="small" variant="outlined" startIcon={<UploadFileIcon />} onClick={() => docInputRef.current?.click()}>
              {'Dok\u00FCman Y\u00FCkle'}
            </Button>
            <input
              ref={docInputRef}
              type="file"
              hidden
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt"
              onChange={handlePickDoc}
            />
          </Box>
          {pendingDocs.length === 0 ? (
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
              {'\u0130ste\u011Fe ba\u011Fl\u0131: periyodik plan ile birlikte dok\u00FCman ekleyebilirsiniz.'}
            </Typography>
          ) : (
            <List dense disablePadding sx={{ border: '1px solid #E2E8F0', borderRadius: 1.5 }}>
              {pendingDocs.map((doc, idx) => (
                <ListItem key={doc.id} divider={idx < pendingDocs.length - 1}>
                  <ListItemText
                    primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{doc.name}</Typography>}
                    secondary={<Typography variant="caption">{formatFileSize(doc.size)}</Typography>}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" size="small" onClick={() => removePendingDoc(doc.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" onClick={onClose}>{'\u0130ptal'}</Button>
        <Button variant="contained" disabled={!valid || submitting} onClick={handleCreate}>
          {submitting ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Olu\u015Ftur'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}






