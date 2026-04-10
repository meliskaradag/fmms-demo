import { useState, useMemo } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Chip, Skeleton, Button,
  LinearProgress, Collapse, Divider, IconButton, alpha,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Select, MenuItem, FormControl, InputLabel, CircularProgress,
} from '@mui/material';
import { navy } from '../../theme/theme';
import {
  Add as AddIcon, Timer, AttachMoney, ExpandMore as ExpandMoreIcon,
  CalendarToday, AccessTime, Warning as WarningIcon,
} from '@mui/icons-material';
import { useApi } from '../../hooks/useApi';
import { getServiceAgreements, createServiceAgreement } from '../../api/endpoints';
import { AgreementStatusLabels } from '../../types';
import type { PagedResult, ServiceAgreement } from '../../types';
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
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const { t } = useTranslation();
  const [agreementNumber, setAgreementNumber] = useState('');
  const [title, setTitle] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [slaResponseHours, setSlaResponseHours] = useState<number | ''>(4);
  const [slaResolutionHours, setSlaResolutionHours] = useState<number | ''>(24);
  const [cost, setCost] = useState<number | ''>(0);
  const [currency, setCurrency] = useState('TRY');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!agreementNumber.trim() || !title.trim() || !vendorId.trim() || !startDate || !endDate) return;
    setSubmitting(true);
    try {
      await createServiceAgreement({
        agreementNumber: agreementNumber.trim(),
        vendorId: vendorId.trim(),
        title: title.trim(),
        description: description.trim() || undefined,
        startDate,
        endDate,
        autoRenew: false,
        slaResponseHours: Number(slaResponseHours) || 4,
        slaResolutionHours: Number(slaResolutionHours) || 24,
        cost: Number(cost) || 0,
        currency,
        status: 0,
        coveredAssetIds: [],
      });
      onCreated();
      onClose();
      setAgreementNumber('');
      setTitle('');
      setVendorId('');
      setDescription('');
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

  const isValid = agreementNumber.trim() && title.trim() && vendorId.trim() && startDate && endDate;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: navy[800], fontWeight: 700 }}>{t('serviceAgreements.dialogTitle')}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
        <TextField label={`${t('serviceAgreements.agreementNo')} *`} fullWidth size="small" value={agreementNumber} onChange={(e) => setAgreementNumber(e.target.value)} />
        <TextField label={`${t('common.title')} *`} fullWidth size="small" value={title} onChange={(e) => setTitle(e.target.value)} />
        <TextField label={`${t('serviceAgreements.vendorId')} *`} fullWidth size="small" value={vendorId} onChange={(e) => setVendorId(e.target.value)} />
        <TextField label={t('common.description')} fullWidth size="small" multiline rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
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
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [createOpen, setCreateOpen] = useState(false);

  const { data, loading, refetch } = useApi<PagedResult<ServiceAgreement>>(
    () => getServiceAgreements({ pageSize: 20 }),
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
    const active = data?.items.find((sa) => sa.status === 0);
    return active?.currency || 'TRY';
  }, [data]);

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
                    {data.items.filter((sa) => sa.status === 0 && getDaysRemaining(sa.endDate) > 30).length}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6, sm: 2.5 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>{t('serviceAgreements.aboutToExpire')}</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#F59E0B' }}>
                    {data.items.filter((sa) => sa.status === 0 && getDaysRemaining(sa.endDate) <= 30 && getDaysRemaining(sa.endDate) >= 0).length}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>{t('serviceAgreements.expiredOrCancelled')}</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#6B7280' }}>
                    {data.items.filter((sa) => sa.status !== 0).length}
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
          {data?.items.map((sa) => {
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
                          {sa.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {sa.vendorName}
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

                    {sa.scopeDescription && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.8rem' }}>
                        {sa.scopeDescription.substring(0, 150)}{sa.scopeDescription.length > 150 ? '...' : ''}
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
                      {sa.scopeDescription && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            {t('serviceAgreements.scopeDescription')}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {sa.scopeDescription}
                          </Typography>
                        </Box>
                      )}

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
      />
    </Box>
  );
}
