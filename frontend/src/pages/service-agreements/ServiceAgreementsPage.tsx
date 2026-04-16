import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, Chip, Skeleton, Button,
  LinearProgress, Collapse, Divider, IconButton, alpha,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, CircularProgress, List, ListItemButton, ListItemText,
} from '@mui/material';
import { navy } from '../../theme/theme';
import {
  Add as AddIcon, Timer, AttachMoney, ExpandMore as ExpandMoreIcon,
  CalendarToday, AccessTime, Warning as WarningIcon,
} from '@mui/icons-material';
import { useApi } from '../../hooks/useApi';
import { getServiceAgreements, createServiceAgreement, getAssets, getStockCards } from '../../api/endpoints';
import { AgreementStatusLabels } from '../../types';
import type { PagedResult, ServiceAgreement, Asset, StockCard } from '../../types';
import { useTranslation } from '../../i18n';

const statusColors: Record<number, string> = {
  0: '#059669',
  1: '#F59E0B',
  2: '#6B7280',
  3: '#DC2626',
};

function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getDurationProgress(startDate: string, endDate: string): number {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();
  if (now <= start) return 0;
  if (now >= end) return 100;
  return Math.round(((now - start) / (end - start)) * 100);
}

function getSlaStatus(sa: ServiceAgreement, t: (key: string) => string): { label: string; color: string } {
  const daysRemaining = getDaysRemaining(sa.endDate);
  if (sa.status !== 0) {
    return { label: AgreementStatusLabels[sa.status], color: statusColors[sa.status] };
  }
  if (daysRemaining < 0) {
    return { label: t('serviceAgreements.expired'), color: '#DC2626' };
  }
  if (daysRemaining <= 30) {
    return { label: t('serviceAgreements.aboutToExpire'), color: '#F59E0B' };
  }
  return { label: t('common.active'), color: '#059669' };
}

function CreateServiceAgreementDialog({
  open,
  onClose,
  onCreated,
  assets,
  stockCards,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  assets: Asset[];
  stockCards: StockCard[];
}) {
  const { t } = useTranslation();
  const [agreementNumber, setAgreementNumber] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [relatedAssetIds, setRelatedAssetIds] = useState<string[]>([]);
  const [relatedStockCardIds, setRelatedStockCardIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [slaResponseHours, setSlaResponseHours] = useState<number | ''>(4);
  const [slaResolutionHours, setSlaResolutionHours] = useState<number | ''>(24);
  const [cost, setCost] = useState<number | ''>(0);
  const [currency, setCurrency] = useState('TRY');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!agreementNumber.trim() || !vendorId.trim() || !startDate || !endDate) return;
    setSubmitting(true);
    try {
      await createServiceAgreement({
        agreementNumber: agreementNumber.trim(),
        vendorId: vendorId.trim(),
        contactInfo: contactInfo.trim() || undefined,
        startDate,
        endDate,
        autoRenew: false,
        slaResponseHours: Number(slaResponseHours) || 4,
        slaResolutionHours: Number(slaResolutionHours) || 24,
        cost: Number(cost) || 0,
        currency,
        status: 0,
        coveredAssetIds: relatedAssetIds,
        coveredStockCardIds: relatedStockCardIds,
      });
      onCreated();
      onClose();
      setAgreementNumber('');
      setVendorId('');
      setContactInfo('');
      setRelatedAssetIds([]);
      setRelatedStockCardIds([]);
      setStartDate('');
      setEndDate('');
      setSlaResponseHours(4);
      setSlaResolutionHours(24);
      setCost(0);
      setCurrency('TRY');
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const isValid = agreementNumber.trim() && vendorId.trim() && startDate && endDate;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: navy[800], fontWeight: 700 }}>{t('serviceAgreements.dialogTitle')}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
        <TextField label={`${t('serviceAgreements.agreementNo')} *`} fullWidth size="small" value={agreementNumber} onChange={(e) => setAgreementNumber(e.target.value)} />
        <TextField label={`${t('serviceAgreements.vendorId')} *`} fullWidth size="small" value={vendorId} onChange={(e) => setVendorId(e.target.value)} />
        <TextField label="Temel İletişim Bilgileri" fullWidth size="small" multiline rows={2} value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} />
        <TextField
          select
          SelectProps={{ multiple: true, value: relatedStockCardIds, renderValue: (selected) => `${(selected as string[]).length} stok kartı` }}
          label="İlişkili Stok Kartları (1..N)"
          fullWidth
          size="small"
          onChange={(e) => setRelatedStockCardIds(e.target.value as unknown as string[])}>
          {stockCards.map((sc) => <MenuItem key={sc.id} value={sc.id}>{sc.stockNumber} - {sc.name}</MenuItem>)}
        </TextField>
        <TextField
          select
          SelectProps={{ multiple: true, value: relatedAssetIds, renderValue: (selected) => `${(selected as string[]).length} envanter` }}
          label="İlişkili Envanterler (1..N)"
          fullWidth
          size="small"
          onChange={(e) => setRelatedAssetIds(e.target.value as unknown as string[])}>
          {assets.map((a) => <MenuItem key={a.id} value={a.id}>{a.assetNumber}{a.serialNumber ? ` / ${a.serialNumber}` : ''} - {a.name}</MenuItem>)}
        </TextField>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField label={`${t('serviceAgreements.startDate')} *`} type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <TextField label={`${t('serviceAgreements.endDate')} *`} type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField label={t('serviceAgreements.slaResponseHours')} type="number" fullWidth size="small" value={slaResponseHours} onChange={(e) => setSlaResponseHours(e.target.value === '' ? '' : Number(e.target.value))} />
          <TextField label={t('serviceAgreements.slaResolutionHours')} type="number" fullWidth size="small" value={slaResolutionHours} onChange={(e) => setSlaResolutionHours(e.target.value === '' ? '' : Number(e.target.value))} />
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField label={t('serviceAgreements.cost')} type="number" fullWidth size="small" value={cost} onChange={(e) => setCost(e.target.value === '' ? '' : Number(e.target.value))} />
          <TextField select label={t('serviceAgreements.currency')} fullWidth size="small" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <MenuItem value="TRY">TRY</MenuItem>
            <MenuItem value="USD">USD</MenuItem>
            <MenuItem value="EUR">EUR</MenuItem>
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" onClick={onClose} sx={{ color: navy[600], borderColor: navy[600] }}>{t('common.cancel')}</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting || !isValid}
          sx={{
            background: `linear-gradient(135deg, ${navy[700]} 0%, ${navy[600]} 100%)`,
            '&:hover': { background: `linear-gradient(135deg, ${navy[800]} 0%, ${navy[700]} 100%)` },
          }}
        >
          {submitting ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : t('common.create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function ServiceAgreementsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const [relatedDevicesDialogSaId, setRelatedDevicesDialogSaId] = useState<string | null>(null);

  const { data, loading, refetch } = useApi<PagedResult<ServiceAgreement>>(
    () => getServiceAgreements({ pageSize: 20 }),
    []
  );
  const { data: assetsData } = useApi<PagedResult<Asset>>(
    () => getAssets({ pageSize: 200 }),
    []
  );
  const { data: stockCardsData } = useApi<PagedResult<StockCard>>(
    () => getStockCards({ pageSize: 200 }),
    []
  );

  // Calculate total active agreement cost
  const totalActiveCost = useMemo(() => {
    if (!data?.items) return 0;
    return data.items
      .filter((sa) => sa.status === 0)
      .reduce((sum, sa) => sum + sa.cost, 0);
  }, [data]);

  const activeCurrency = useMemo(() => {
    const active = (data?.items ?? []).find((sa) => sa.status === 0);
    return active?.currency || 'TRY';
  }, [data]);
  const assetsById = useMemo(() => {
    const map: Record<string, Asset> = {};
    (assetsData?.items ?? []).forEach((asset) => {
      map[asset.id] = asset;
    });
    return map;
  }, [assetsData]);
  const stockCardsById = useMemo(() => {
    const map: Record<string, StockCard> = {};
    (stockCardsData?.items ?? []).forEach((card) => {
      map[card.id] = card;
    });
    return map;
  }, [stockCardsData]);
  const selectedRelatedDevicesSa = useMemo(
    () => (data?.items ?? []).find((sa) => sa.id === relatedDevicesDialogSaId) ?? null,
    [data, relatedDevicesDialogSaId]
  );

  const toggleExpand = (id: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: navy[800], letterSpacing: '-0.02em' }}>
            {t('serviceAgreements.title')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8' }}>
            {t('serviceAgreements.subtitle')}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
          {t('serviceAgreements.newAgreement')}
        </Button>
      </Box>

      {/* Cost Summary Bar */}
      {!loading && data && (
        <Card sx={{ mb: 3, bgcolor: alpha(navy[50], 0.5) }}>
          <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
            <Grid container spacing={3} alignItems="center">
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AttachMoney sx={{ color: '#059669' }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#94A3B8' }}>{t('serviceAgreements.totalActiveCost')}</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#059669' }}>
                      {totalActiveCost.toLocaleString('tr-TR')} {activeCurrency}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 6, sm: 2.5 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>{t('common.active')}</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#059669' }}>
                    {(data?.items ?? []).filter((sa) => sa.status === 0 && getDaysRemaining(sa.endDate) > 30).length}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6, sm: 2.5 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>{t('serviceAgreements.aboutToExpire')}</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#F59E0B' }}>
                    {(data?.items ?? []).filter((sa) => sa.status === 0 && getDaysRemaining(sa.endDate) <= 30 && getDaysRemaining(sa.endDate) >= 0).length}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>{t('serviceAgreements.expiredOrCancelled')}</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#6B7280' }}>
                    {(data?.items ?? []).filter((sa) => sa.status !== 0).length}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {loading ? (
        [...Array(3)].map((_, i) => <Skeleton key={i} variant="rounded" height={140} sx={{ mb: 2 }} />)
      ) : (
        <Grid container spacing={2.5}>
          {(data?.items ?? []).map((sa) => {
            const daysRemaining = getDaysRemaining(sa.endDate);
            const progress = getDurationProgress(sa.startDate, sa.endDate);
            const slaStatus = getSlaStatus(sa, t);
            const isExpanded = expandedCards.has(sa.id);

            return (
              <Grid size={{ xs: 12 }} key={sa.id}>
                <Card sx={{
                  height: '100%',
                  borderLeft: `4px solid ${slaStatus.color}`,
                  transition: 'box-shadow 0.2s',
                  '&:hover': { boxShadow: 4 },
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontFamily: '"JetBrains Mono", monospace', color: navy[600] }}>
                          {sa.agreementNumber}
                        </Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: navy[800] }}>
                          {sa.vendorName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {sa.agreementNumber}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                        <Chip
                          label={AgreementStatusLabels[sa.status]}
                          size="small"
                          sx={{
                            bgcolor: alpha(statusColors[sa.status] || '#6B7280', 0.1),
                            color: statusColors[sa.status] || '#6B7280',
                            fontWeight: 700,
                            fontSize: '0.7rem',
                          }}
                        />
                        {sa.status === 0 && daysRemaining <= 30 && daysRemaining >= 0 && (
                          <Chip
                            icon={<WarningIcon sx={{ fontSize: 16 }} />}
                            label={t('serviceAgreements.aboutToExpire')}
                            size="small"
                            sx={{ bgcolor: alpha('#F59E0B', 0.1), color: '#D97706', fontWeight: 700, fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    </Box>

                    {sa.contactInfo && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.8rem' }}>
                        {sa.contactInfo.substring(0, 150)}{sa.contactInfo.length > 150 ? '...' : ''}
                      </Typography>
                    )}

                    {/* Duration progress bar */}
                    <Box sx={{ mb: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {t('serviceAgreements.contractDuration')}
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          %{progress}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                          height: 6, borderRadius: 3,
                          bgcolor: alpha(navy[200], 0.4),
                          '& .MuiLinearProgress-bar': {
                            bgcolor: progress >= 90 ? '#DC2626' : progress >= 70 ? '#F59E0B' : '#059669',
                            borderRadius: 3,
                          },
                        }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                      <Chip
                        icon={<Timer />}
                        label={`SLA: ${sa.slaResponseHours}s / ${sa.slaResolutionHours}s`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        icon={<AttachMoney />}
                        label={`${(sa.cost ?? 0).toLocaleString('tr-TR')} ${sa.currency || 'TRY'}`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        icon={<CalendarToday sx={{ fontSize: 14 }} />}
                        label={`${new Date(sa.startDate).toLocaleDateString('tr-TR')} - ${new Date(sa.endDate).toLocaleDateString('tr-TR')}`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>

                    {/* Remaining days */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <AccessTime sx={{ fontSize: 18, color: daysRemaining <= 0 ? '#DC2626' : daysRemaining <= 30 ? '#F59E0B' : '#059669' }} />
                      <Typography variant="body2" sx={{
                        fontWeight: 600,
                        color: daysRemaining <= 0 ? '#DC2626' : daysRemaining <= 30 ? '#F59E0B' : '#059669',
                      }}>
                        {daysRemaining <= 0
                          ? `${Math.abs(daysRemaining)} ${t('serviceAgreements.daysAgoExpired')}`
                          : `${daysRemaining} ${t('serviceAgreements.daysRemaining')}`
                        }
                      </Typography>
                    </Box>

                    {/* Expand toggle */}
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <IconButton
                        size="small"
                        onClick={() => toggleExpand(sa.id)}
                        sx={{
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s',
                        }}
                      >
                        <ExpandMoreIcon />
                      </IconButton>
                    </Box>

                    <Collapse in={isExpanded}>
                      <Divider sx={{ my: 1.5 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: navy[800], mb: 1 }}>{t('common.details')}</Typography>

                      {/* Full scope */}
                      {sa.contactInfo && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            {'Temel İletişim Bilgileri'}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {sa.contactInfo}
                          </Typography>
                        </Box>
                      )}
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          {'İlişkili Cihazlar'}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            mt: 0.5,
                            color: navy[700],
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            width: 'fit-content',
                          }}
                          onClick={() => setRelatedDevicesDialogSaId(sa.id)}
                        >
                          {`${sa.coveredStockCardIds.length} stok kartı, ${sa.coveredAssetIds.length} envanter`}
                        </Typography>
                      </Box>

                      {/* SLA details */}
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          {t('serviceAgreements.slaDetails')}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 3, mt: 0.5 }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">{t('serviceAgreements.responseTime')}</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{sa.slaResponseHours} {t('serviceAgreements.hours')}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">{t('serviceAgreements.resolutionTime')}</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{sa.slaResolutionHours} {t('serviceAgreements.hours')}</Typography>
                          </Box>
                        </Box>
                      </Box>

                      {/* Cost breakdown */}
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          {t('serviceAgreements.cost')}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                          {(sa.cost ?? 0).toLocaleString('tr-TR')} {sa.currency || 'TRY'}
                        </Typography>
                      </Box>
                    </Collapse>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <CreateServiceAgreementDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={refetch}
        assets={assetsData?.items ?? []}
        stockCards={(stockCardsData?.items ?? []).filter((x) => x.nodeType === 'STOCKCARD')}
      />
      <Dialog
        open={!!selectedRelatedDevicesSa}
        onClose={() => setRelatedDevicesDialogSaId(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ color: navy[800], fontWeight: 700 }}>
          İlişkili Cihazlar
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: navy[800], mb: 1 }}>
              Stok Kartları ({selectedRelatedDevicesSa?.coveredStockCardIds.length ?? 0})
            </Typography>
            {(selectedRelatedDevicesSa?.coveredStockCardIds.length ?? 0) === 0 ? (
              <Typography variant="body2" color="text.secondary">İlişkili stok kartı bulunamadı.</Typography>
            ) : (
              <List dense disablePadding>
                {(selectedRelatedDevicesSa?.coveredStockCardIds ?? []).map((id) => {
                  const card = stockCardsById[id];
                  return (
                    <ListItemButton
                      key={id}
                      sx={{ borderRadius: 1 }}
                      onClick={() => {
                        setRelatedDevicesDialogSaId(null);
                        navigate(`/stock-cards?selected=${id}`);
                      }}
                    >
                      <ListItemText
                        primary={card ? `${card.stockNumber} - ${card.name}` : id}
                        secondary="Stok kartına git"
                      />
                    </ListItemButton>
                  );
                })}
              </List>
            )}
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: navy[800], mb: 1 }}>
              Envanterler ({selectedRelatedDevicesSa?.coveredAssetIds.length ?? 0})
            </Typography>
            {(selectedRelatedDevicesSa?.coveredAssetIds.length ?? 0) === 0 ? (
              <Typography variant="body2" color="text.secondary">İlişkili envanter bulunamadı.</Typography>
            ) : (
              <List dense disablePadding>
                {(selectedRelatedDevicesSa?.coveredAssetIds ?? []).map((id) => {
                  const asset = assetsById[id];
                  return (
                    <ListItemButton
                      key={id}
                      sx={{ borderRadius: 1 }}
                      onClick={() => {
                        setRelatedDevicesDialogSaId(null);
                        navigate(`/assets?selected=${id}`);
                      }}
                    >
                      <ListItemText
                        primary={asset ? `${asset.assetNumber}${asset.serialNumber ? ` / ${asset.serialNumber}` : ''} - ${asset.name}` : id}
                        secondary="Envantere git"
                      />
                    </ListItemButton>
                  );
                })}
              </List>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRelatedDevicesDialogSaId(null)}>{t('common.close')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
