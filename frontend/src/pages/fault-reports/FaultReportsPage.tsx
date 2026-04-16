import { useState } from 'react';
import {
  Box, Card, CardContent, Table, TableHead, TableRow, TableCell,
  TableBody, Chip, Button, Pagination, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, alpha, IconButton, Tooltip, Skeleton, Typography,
} from '@mui/material';
import {
  Visibility, CheckCircle, Cancel, ArrowForward, ReportProblem,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import IconClearFiltersButton from '../../components/common/IconClearFiltersButton';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import EmptyState from '../../components/common/EmptyState';
import { getFaultReports, reviewFaultReport, createWorkOrderFromFaultReport } from '../../api/endpoints';
import { FaultReportStatusLabels, FaultReportStatusColors, PriorityLabels, PriorityColors } from '../../types';
import type { FaultReport, FaultReportPhoto } from '../../types';
import { navy } from '../../theme/theme';
import { useTranslation } from '../../i18n';

const MANAGER_ID = '22222222-2222-2222-2222-222222222222';

const priorityFromString = (p: string): number => {
  const map: Record<string, number> = { Low: 0, Medium: 1, High: 2, Critical: 3 };
  return map[p] ?? 1;
};

export default function FaultReportsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedReport, setSelectedReport] = useState<FaultReport | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewNote, setReviewNote] = useState('');
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<FaultReportPhoto | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { data, loading, refetch } = useApi(
    () => getFaultReports({ status: statusFilter || undefined, page, pageSize: 20 }),
    [page, statusFilter]
  );

  const items = data?.items ?? [];
  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 1;

  const handleReject = async () => {
    if (!selectedReport) return;
    setActionLoading(true);
    try {
      await reviewFaultReport(selectedReport.id, {
        newStatus: 'Rejected',
        reviewedBy: MANAGER_ID,
        reviewNote: reviewNote || undefined,
      });
      setReviewOpen(false);
      setDetailOpen(false);
      setReviewNote('');
      refetch();
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateWorkOrder = async () => {
    if (!selectedReport) return;
    if (!confirm(t('faultReports.createWoConfirm'))) return;
    setActionLoading(true);
    try {
      const workOrderId = await createWorkOrderFromFaultReport(selectedReport.id, {
        reviewedBy: MANAGER_ID,
      });
      setDetailOpen(false);
      refetch();
      if (workOrderId) {
        navigate(`/work-orders/${workOrderId}`);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const statusTabs = [
    { label: t('faultReports.statusAll'), value: '' },
    { label: t('faultReports.statusOpen'), value: 'Open' },
    { label: t('faultReports.statusUnderReview'), value: 'UnderReview' },
    { label: t('faultReports.statusAccepted'), value: 'Accepted' },
    { label: t('faultReports.statusRejected'), value: 'Rejected' },
  ];

  return (
    <Box>
      <PageHeader title={t('faultReports.title')} subtitle={t('faultReports.subtitle')} />

      {/* Status Filter Chips */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
        {statusTabs.map((tab) => (
          <Button
            key={tab.value}
            size="small"
            variant={statusFilter === tab.value ? 'contained' : 'outlined'}
            onClick={() => { setStatusFilter(tab.value); setPage(1); }}
            sx={{ borderRadius: 5, fontWeight: statusFilter === tab.value ? 700 : 500, px: 2 }}
          >
            {tab.label}
          </Button>
        ))}
        <IconClearFiltersButton onClick={() => { setStatusFilter(''); setPage(1); }} disabled={!statusFilter} />
      </Box>

      {/* Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ p: 2 }}>
              {[...Array(6)].map((_, i) => <Skeleton key={i} height={52} />)}
            </Box>
          ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('common.title')}</TableCell>
                <TableCell>{t('common.location')}</TableCell>
                <TableCell>{t('common.priority')}</TableCell>
                <TableCell>{t('common.status')}</TableCell>
                <TableCell>{t('faultReports.photos')}</TableCell>
                <TableCell>{t('common.date')}</TableCell>
                <TableCell>{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <EmptyState
                      icon={<ReportProblem />}
                      title={t('faultReports.noReports')}
                    />
                  </TableCell>
                </TableRow>
              ) : items.map((report) => {
                const pCode = priorityFromString(report.priority);
                return (
                  <TableRow key={report.id} hover sx={{ cursor: 'pointer' }} onClick={() => { setSelectedReport(report); setDetailOpen(true); }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{report.title}</Typography>
                      {report.assetName && (
                        <Typography variant="caption" color="text.secondary">{report.assetName}</Typography>
                      )}
                    </TableCell>
                    <TableCell>{report.locationName ?? '-'}</TableCell>
                    <TableCell>
                      <StatusChip
                        label={PriorityLabels[pCode] ?? report.priority}
                        color={PriorityColors[pCode] ?? '#999'}
                      />
                    </TableCell>
                    <TableCell>
                      <StatusChip
                        label={FaultReportStatusLabels[report.status] ?? report.status}
                        color={FaultReportStatusColors[report.status] ?? '#999'}
                      />
                    </TableCell>
                    <TableCell>
                      {report.photos.length > 0 ? (
                        <Chip label={`${report.photos.length}`} size="small" color="info" variant="outlined" />
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{new Date(report.createdAt).toLocaleDateString('tr-TR')}</Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={t('common.details')}>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); setSelectedReport(report); setDetailOpen(true); }}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
        </Box>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        {selectedReport && (
          <>
            <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {selectedReport.title}
              <StatusChip
                label={FaultReportStatusLabels[selectedReport.status] ?? selectedReport.status}
                color={FaultReportStatusColors[selectedReport.status] ?? '#999'}
              />
            </DialogTitle>
            <DialogContent dividers>
              {/* Info Grid */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">{t('common.location')}</Typography>
                  <Typography variant="body2" fontWeight={600}>{selectedReport.locationName ?? '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">{t('common.priority')}</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <StatusChip
                      label={PriorityLabels[priorityFromString(selectedReport.priority)] ?? selectedReport.priority}
                      color={PriorityColors[priorityFromString(selectedReport.priority)] ?? '#999'}
                    />
                  </Box>
                </Box>
                {selectedReport.assetName && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Varlık</Typography>
                    <Typography variant="body2" fontWeight={600}>{selectedReport.assetName}</Typography>
                  </Box>
                )}
                <Box>
                  <Typography variant="caption" color="text.secondary">{t('common.date')}</Typography>
                  <Typography variant="body2">{new Date(selectedReport.createdAt).toLocaleString('tr-TR')}</Typography>
                </Box>
              </Box>

              {/* Description */}
              {selectedReport.description && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="caption" color="text.secondary">{t('common.description')}</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, p: 1.5, bgcolor: alpha(navy[50], 0.5), borderRadius: 1 }}>
                    {selectedReport.description}
                  </Typography>
                </Box>
              )}

              {/* Review Note */}
              {selectedReport.reviewNote && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="caption" color="text.secondary">{t('faultReports.reviewNote')}</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, p: 1.5, bgcolor: alpha('#FFF3E0', 1), borderRadius: 1 }}>
                    {selectedReport.reviewNote}
                  </Typography>
                </Box>
              )}

              {/* Linked Work Order */}
              {selectedReport.linkedWorkOrderId && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="caption" color="text.secondary">{t('faultReports.linkedWorkOrder')}</Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    endIcon={<ArrowForward />}
                    sx={{ ml: 1 }}
                    onClick={() => navigate(`/work-orders/${selectedReport.linkedWorkOrderId}`)}
                  >
                    {t('sidebar.workOrders')}
                  </Button>
                </Box>
              )}

              {/* Photos */}
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>{t('faultReports.photos')}</Typography>
              {selectedReport.photos.length === 0 ? (
                <Typography variant="body2" color="text.secondary">{t('faultReports.noPhotos')}</Typography>
              ) : (
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  {selectedReport.photos.map((photo) => (
                    <Box
                      key={photo.id}
                      onClick={() => { setSelectedPhoto(photo); setPhotoDialogOpen(true); }}
                      sx={{
                        width: 120, height: 120, borderRadius: 2, overflow: 'hidden', cursor: 'pointer',
                        border: '2px solid', borderColor: 'divider', '&:hover': { borderColor: 'primary.main' },
                      }}
                    >
                      <img
                        src={`data:${photo.contentType};base64,${photo.base64Data}`}
                        alt={photo.fileName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              {selectedReport.status === 'Open' && (
                <>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Cancel />}
                    onClick={() => { setReviewOpen(true); }}
                    disabled={actionLoading}
                  >
                    {t('faultReports.reject')}
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<CheckCircle />}
                    onClick={handleCreateWorkOrder}
                    disabled={actionLoading}
                  >
                    {t('faultReports.createWorkOrder')}
                  </Button>
                </>
              )}
              {selectedReport.status !== 'Open' && (
                <Button onClick={() => setDetailOpen(false)}>{t('common.cancel')}</Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={reviewOpen} onClose={() => setReviewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('faultReports.reviewDialogTitle')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>{t('faultReports.rejectConfirm')}</Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label={t('faultReports.reviewNoteLabel')}
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" color="error" onClick={handleReject} disabled={actionLoading}>
            {t('faultReports.reject')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Photo Fullscreen Dialog */}
      <Dialog open={photoDialogOpen} onClose={() => setPhotoDialogOpen(false)} maxWidth="lg">
        {selectedPhoto && (
          <>
            <DialogTitle>{selectedPhoto.fileName}</DialogTitle>
            <DialogContent>
              <img
                src={`data:${selectedPhoto.contentType};base64,${selectedPhoto.base64Data}`}
                alt={selectedPhoto.fileName}
                style={{ maxWidth: '100%', maxHeight: '70vh', display: 'block', margin: '0 auto' }}
              />
              {(selectedPhoto.gpsLat !== 0 || selectedPhoto.gpsLng !== 0) && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                  GPS: {selectedPhoto.gpsLat.toFixed(4)}, {selectedPhoto.gpsLng.toFixed(4)}
                </Typography>
              )}
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
}
