import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, Chip, Button,
  Skeleton, IconButton, Avatar, Link, LinearProgress,
  alpha, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, CircularProgress, Collapse,
  Snackbar, Alert,
} from '@mui/material';
import {
  ArrowBack, PlayArrow, CheckCircle, Pause, CameraAlt,
  PhotoCamera, AccessTime, LocationOn, Build as BuildIcon,
  Timeline as TimelineIcon, PersonAdd, NavigateBefore, NavigateNext, ChevronRight, ExpandMore,
} from '@mui/icons-material';
import { useApi } from '../../hooks/useApi';
import { getWorkOrder, updateWorkOrderStatus, assignWorkOrder, requestPhotoUpload } from '../../api/endpoints';
import {
  WorkOrderStatusLabels, WorkOrderStatusColors, PriorityLabels, PriorityColors,
  WorkOrderTypeLabels, PhotoTypeLabels,
} from '../../types';
import type { WorkOrder } from '../../types';
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

type AssigneeRole = 'technician' | 'stock_manager' | 'manager' | 'supervisor' | 'inspector';

const ASSIGNEE_USERS = [
  { id: '00000000-0000-0000-0000-000000000002', name: 'Ahmet Yilmaz - 1002', role: 'technician' as AssigneeRole },
  { id: '00000000-0000-0000-0000-000000000003', name: 'Zeynep Kaya - 1003', role: 'stock_manager' as AssigneeRole },
  { id: '00000000-0000-0000-0000-000000000004', name: 'Mehmet Demir - 1004', role: 'manager' as AssigneeRole },
];

function getRoleLabel(role: string, t: (key: string) => string) {
  switch (role.toLowerCase()) {
    case 'technician':
      return t('workOrderDetail.roleTechnician');
    case 'supervisor':
      return t('workOrderDetail.roleSupervisor');
    case 'inspector':
      return t('workOrderDetail.roleInspector');
    case 'stock_manager':
      return t('workOrderDetail.roleStockManager');
    case 'manager':
      return t('workOrderDetail.roleManager');
    default:
      return role;
  }
}

function getTimelineSteps(wo: WorkOrder, t: (key: string) => string) {
  const effectiveStatus = wo.status === 0 && wo.assignees.length > 0 ? 1 : wo.status;
  const assignedDone = wo.assignees.length > 0 || effectiveStatus >= 1;
  const startedDone = !!wo.actualStart || effectiveStatus >= 2;
  const completedDone = !!wo.actualEnd || effectiveStatus >= 4;
  const steps: { label: string; date: string | null; done: boolean }[] = [
    { label: t('workOrderDetail.created'), date: wo.createdAt, done: true },
    {
      label: t('workOrderDetail.assigned'),
      date: wo.assignees.length > 0 ? wo.assignees[0].assignedAt : null,
      done: assignedDone,
    },
    { label: t('workOrderDetail.started'), date: wo.actualStart || null, done: startedDone },
    { label: t('workOrderDetail.completed'), date: wo.actualEnd || null, done: completedDone },
  ];
  return steps;
}

function SlaProgressBar({ wo, dateLocale }: { wo: WorkOrder; dateLocale: string }) {
  const { t } = useTranslation();
  if (!wo.slaDeadline) return null;

  const created = new Date(wo.createdAt).getTime();
  const deadline = new Date(wo.slaDeadline).getTime();
  const now = wo.actualEnd ? new Date(wo.actualEnd).getTime() : Date.now();
  const totalDuration = deadline - created;
  const elapsed = now - created;
  const progress = totalDuration > 0 ? Math.min(100, Math.max(0, (elapsed / totalDuration) * 100)) : 100;
  const remaining = deadline - now;
  const isOverdue = remaining < 0;

  const remainingHours = Math.abs(Math.floor(remaining / (1000 * 60 * 60)));
  const remainingMinutes = Math.abs(Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60)));

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <AccessTime fontSize="small" sx={{ color: isOverdue ? '#DC2626' : accent.main }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: navy[800] }}>
            {t('workOrderDetail.slaStatus')}
          </Typography>
          {isOverdue && (
            <Chip label={t('workOrderDetail.slaExceeded')} size="small" sx={{ fontWeight: 700, fontSize: '0.7rem', height: 24, bgcolor: alpha('#DC2626', 0.1), color: '#DC2626' }} />
          )}
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 10,
            borderRadius: 5,
            bgcolor: alpha(navy[100], 0.5),
            '& .MuiLinearProgress-bar': {
              borderRadius: 5,
              bgcolor: isOverdue ? '#DC2626' : progress > 80 ? '#F59E0B' : '#059669',
            },
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="caption" sx={{ color: '#94A3B8' }}>
            {t('workOrderDetail.startDate')}: {new Date(wo.createdAt).toLocaleString(dateLocale)}
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 600, color: isOverdue ? '#DC2626' : '#94A3B8' }}>
            {isOverdue
              ? `${remainingHours} ${t('workOrderDetail.hourShort')} ${remainingMinutes} ${t('workOrderDetail.minuteShort')} ${t('workOrderDetail.delay')}`
              : `${remainingHours} ${t('workOrderDetail.hourShort')} ${remainingMinutes} ${t('workOrderDetail.minuteShort')} ${t('workOrderDetail.remaining')}`
            }
          </Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8' }}>
            {t('workOrders.sla')}: {new Date(wo.slaDeadline).toLocaleString(dateLocale)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

function AssignTechnicianDialog({
  open, onClose, workOrderId, onAssigned, users,
}: {
  open: boolean;
  onClose: () => void;
  workOrderId: string;
  onAssigned: () => void;
  users: { id: string; name: string; role: AssigneeRole }[];
}) {
  const { t } = useTranslation();
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('technician');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!userId) return;
    setSubmitting(true);
    try {
      await assignWorkOrder(workOrderId, { userId, role });
      onAssigned();
      onClose();
      setUserId('');
      setRole('technician');
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ color: navy[800], fontWeight: 700 }}>{t('workOrderDetail.assignTechnicianTitle')}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
        <TextField
          select label={t('workOrderDetail.assignTechnicianLabel')} fullWidth size="small"
          value={userId} onChange={(e) => setUserId(e.target.value)}
        >
          {users.map((u) => (
            <MenuItem key={u.id} value={u.id}>{u.name} ({getRoleLabel(u.role, t)})</MenuItem>
          ))}
        </TextField>
        <TextField
          select label={t('workOrderDetail.assignRoleLabel')} fullWidth size="small"
          value={role} onChange={(e) => setRole(e.target.value)}
        >
          <MenuItem value="technician">{t('workOrderDetail.roleTechnician')}</MenuItem>
          <MenuItem value="supervisor">{t('workOrderDetail.roleSupervisor')}</MenuItem>
          <MenuItem value="inspector">{t('workOrderDetail.roleInspector')}</MenuItem>
        </TextField>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" onClick={onClose} sx={{ color: navy[600], borderColor: navy[600] }}>
          {t('common.cancel')}
        </Button>
        <Button
          variant="contained" onClick={handleSubmit} disabled={submitting || !userId}
          sx={{
            background: `linear-gradient(135deg, ${navy[700]} 0%, ${navy[600]} 100%)`,
            '&:hover': { background: `linear-gradient(135deg, ${navy[800]} 0%, ${navy[700]} 100%)` },
          }}
        >
          {submitting ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : t('workOrderDetail.assignButton')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function WorkOrderDetailPage() {
  const { t, language } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: wo, loading, refetch } = useApi<WorkOrder>(() => getWorkOrder(id!), [id]);
  const [assignOpen, setAssignOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadPhotoType, setUploadPhotoType] = useState<number>(0);
  const [photosExpanded, setPhotosExpanded] = useState(false);
  const [selectedPhotoPreviewUrl, setSelectedPhotoPreviewUrl] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [uploadFeedback, setUploadFeedback] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const dateLocale = language === 'tr' ? 'tr-TR' : 'en-US';

  const handleStatusChange = async (newStatus: number) => {
    try {
      await updateWorkOrderStatus(id!, newStatus);
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    const previewUrl = URL.createObjectURL(file);
    setSelectedPhotoPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return previewUrl;
    });

    setUploading(true);
    try {
      const result = await requestPhotoUpload(id, {
        photoType: uploadPhotoType,
        fileName: file.name,
        contentType: file.type,
      });
      if (!result?.uploadUrl) {
        throw new Error(t('workOrderDetail.uploadUrlUnavailable'));
      }

      const uploadResp = await fetch(result.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!uploadResp.ok) {
        throw new Error(`${t('workOrderDetail.uploadFailedWithStatus')} (HTTP ${uploadResp.status})`);
      }

      refetch();
      setSelectedPhotoPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setUploadFeedback({
        open: true,
        message: t('workOrderDetail.uploadSuccess'),
        severity: 'success',
      });
    } catch (err) {
      console.error(err);
      setUploadFeedback({
        open: true,
        message: t('workOrderDetail.uploadError'),
        severity: 'error',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    return () => {
      if (selectedPhotoPreviewUrl) {
        URL.revokeObjectURL(selectedPhotoPreviewUrl);
      }
    };
  }, [selectedPhotoPreviewUrl]);

  if (loading || !wo) {
    return (
      <Box>
        <Skeleton height={60} />
        <Skeleton variant="rounded" height={300} sx={{ mt: 2 }} />
      </Box>
    );
  }

  const effectiveStatus = wo.status === 0 && wo.assignees.length > 0 ? 1 : wo.status;
  const timelineSteps = getTimelineSteps(wo, t);
  const timelinePhotos = [...wo.photos].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const userById = new Map(ASSIGNEE_USERS.map((u) => [u.id, u]));
  const lightboxItems = [
    ...(selectedPhotoPreviewUrl ? [{ url: selectedPhotoPreviewUrl, alt: t('workOrderDetail.selectedPhoto') }] : []),
    ...timelinePhotos
      .filter((p) => Boolean(p.downloadUrl))
      .map((p) => ({ url: p.downloadUrl as string, alt: p.fileName })),
  ];
  const activeLightboxItem =
    lightboxIndex !== null && lightboxItems[lightboxIndex] ? lightboxItems[lightboxIndex] : null;
  const collapsedPreviewPhotos = lightboxItems.slice(0, 8);

  const openLightbox = (url: string) => {
    const index = lightboxItems.findIndex((item) => item.url === url);
    if (index >= 0) {
      setLightboxIndex(index);
    } else if (lightboxItems.length > 0) {
      setLightboxIndex(0);
    }
  };

  const showPrevImage = () => {
    if (lightboxItems.length === 0 || lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + lightboxItems.length) % lightboxItems.length);
  };

  const showNextImage = () => {
    if (lightboxItems.length === 0 || lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % lightboxItems.length);
  };

  const sColor = statusColorMap[effectiveStatus] ?? WorkOrderStatusColors[effectiveStatus] ?? '#6B7280';
  const pColor = priorityColorMap[wo.priority] ?? PriorityColors[wo.priority] ?? '#6B7280';

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/work-orders')} sx={{ color: navy[400] }}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body2" sx={{ fontFamily: '"JetBrains Mono", monospace', color: navy[600] }}>
            {wo.orderNumber}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, color: navy[800], letterSpacing: '-0.02em' }}>
            {wo.title}
          </Typography>
        </Box>
        <Chip
          label={WorkOrderStatusLabels[effectiveStatus]}
          sx={{
            bgcolor: alpha(sColor, 0.1),
            color: sColor,
            fontWeight: 700,
            fontSize: '0.7rem',
            height: 24,
            px: 1,
          }}
        />
        <Chip
          label={PriorityLabels[wo.priority]}
          sx={{
            bgcolor: alpha(pColor, 0.1),
            color: pColor,
            fontWeight: 700,
            fontSize: '0.7rem',
            height: 24,
          }}
        />
      </Box>
      {/* SLA Progress */}
      <SlaProgressBar wo={wo} dateLocale={dateLocale} />

      <Grid container spacing={2.5}>


        {/* Timeline */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TimelineIcon fontSize="small" sx={{ color: accent.main }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: navy[800] }}>
                    {t('workOrderDetail.timeline')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {(effectiveStatus === 0 || effectiveStatus === 1) && (
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<PlayArrow />}
                      onClick={() => handleStatusChange(2)}
                      sx={{
                        background: `linear-gradient(135deg, ${navy[700]} 0%, ${navy[600]} 100%)`,
                        fontWeight: 600,
                        '&:hover': {
                          background: `linear-gradient(135deg, ${navy[800]} 0%, ${navy[700]} 100%)`,
                        },
                      }}
                    >
                      {t('workOrderDetail.startWork')}
                    </Button>
                  )}
                  {effectiveStatus === 2 && (
                    <>
                      <Button variant="outlined" size="small" startIcon={<Pause />} onClick={() => handleStatusChange(3)} sx={{ color: navy[600], borderColor: navy[300] }}>
                        {t('workOrderDetail.hold')}
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<CheckCircle />}
                        onClick={() => handleStatusChange(4)}
                        sx={{
                          bgcolor: '#059669',
                          fontWeight: 600,
                          '&:hover': { bgcolor: '#047857' },
                        }}
                      >
                        {t('workOrders.complete')}
                      </Button>
                    </>
                  )}
                  {effectiveStatus === 3 && (
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<PlayArrow />}
                      onClick={() => handleStatusChange(2)}
                      sx={{
                        background: `linear-gradient(135deg, ${navy[700]} 0%, ${navy[600]} 100%)`,
                        fontWeight: 600,
                        '&:hover': {
                          background: `linear-gradient(135deg, ${navy[800]} 0%, ${navy[700]} 100%)`,
                        },
                      }}
                    >
                      {t('workOrderDetail.resume')}
                    </Button>
                  )}
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 0, position: 'relative' }}>
                {timelineSteps.map((step, idx) => (
                  <Box key={step.label} sx={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                    {/* Connector line */}
                    {idx > 0 && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 14,
                          left: 0,
                          right: '50%',
                          height: 3,
                          bgcolor: step.done ? '#059669' : alpha(navy[100], 0.5),
                        }}
                      />
                    )}
                    {idx < timelineSteps.length - 1 && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 14,
                          left: '50%',
                          right: 0,
                          height: 3,
                          bgcolor: timelineSteps[idx + 1].done ? '#059669' : alpha(navy[100], 0.5),
                        }}
                      />
                    )}
                    {/* Dot */}
                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        bgcolor: step.done ? '#059669' : alpha(navy[100], 0.5),
                        color: step.done ? '#fff' : navy[300],
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        position: 'relative',
                        zIndex: 1,
                        mb: 1,
                      }}
                    >
                      {step.done ? '\u2713' : idx + 1}
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {step.label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                      {step.date ? new Date(step.date).toLocaleString(dateLocale) : '-'}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Details */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: navy[800], mb: 2 }}>
                {t('workOrderDetail.details')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <DetailRow label={t('common.type')} value={WorkOrderTypeLabels[wo.type]} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#94A3B8' }}>{t('common.location')}</Typography>
                  {wo.locationName ? (
                    <Link
                      component="button"
                      variant="body2"
                      underline="hover"
                      onClick={() => navigate(`/locations?selected=${wo.locationId}`)}
                      sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.5, color: accent.main }}
                    >
                      <LocationOn fontSize="inherit" />
                      {wo.locationName}
                    </Link>
                  ) : (
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>-</Typography>
                  )}
                </Box>
                <DetailRow label={t('workOrderDetail.plannedStart')} value={wo.scheduledStart ? new Date(wo.scheduledStart).toLocaleString(dateLocale) : '-'} />
                <DetailRow label={t('workOrderDetail.actualStart')} value={wo.actualStart ? new Date(wo.actualStart).toLocaleString(dateLocale) : '-'} />
                <DetailRow label={t('workOrderDetail.actualEnd')} value={wo.actualEnd ? new Date(wo.actualEnd).toLocaleString(dateLocale) : '-'} />
                <DetailRow label={t('workOrderDetail.slaDeadline')} value={wo.slaDeadline ? new Date(wo.slaDeadline).toLocaleString(dateLocale) : '-'} />
                {wo.isOverdue && (
                  <Chip label={t('workOrderDetail.slaExceeded')} size="small" sx={{ fontWeight: 700, fontSize: '0.7rem', height: 24, alignSelf: 'flex-start', bgcolor: alpha('#DC2626', 0.1), color: '#DC2626' }} />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Assignees */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: navy[800] }}>
                  {t('workOrderDetail.assignedTechnicians')}
                </Typography>
                <Button
                  variant="outlined" size="small" startIcon={<PersonAdd />}
                  onClick={() => setAssignOpen(true)}
                  sx={{ color: accent.main, borderColor: accent.main }}
                >
                  {t('workOrderDetail.assignTechnicianButton')}
                </Button>
              </Box>
              {wo.assignees.length === 0 ? (
                <Typography sx={{ color: '#94A3B8' }} variant="body2">{t('workOrderDetail.noAssignment')}</Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {wo.assignees.map((a) => (
                    <Box key={a.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1, borderRadius: 2, bgcolor: alpha(navy[50], 0.5) }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: navy[600], fontSize: '0.8rem' }}>
                        {(userById.get(a.userId)?.name ?? 'T').slice(0, 1).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {userById.get(a.userId)?.name ?? `${t('workOrderDetail.userIdPrefix')}: ${a.userId.slice(0, 8)}`} ({getRoleLabel(a.role, t)})
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                          {t('workOrderDetail.assignedAt')}: {new Date(a.assignedAt).toLocaleString(dateLocale)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        {/* Photos Timeline */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: navy[800] }}>
                  {t('workOrderDetail.photos')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <TextField
                    select size="small" value={uploadPhotoType}
                    onChange={(e) => setUploadPhotoType(Number(e.target.value))}
                    sx={{ minWidth: 120 }}
                  >
                    <MenuItem value={0}>{PhotoTypeLabels[0]}</MenuItem>
                    <MenuItem value={1}>{PhotoTypeLabels[1]}</MenuItem>
                    <MenuItem value={2}>{PhotoTypeLabels[2]}</MenuItem>
                  </TextField>
                  <Button
                    variant="outlined" size="small" startIcon={uploading ? <CircularProgress size={16} /> : <CameraAlt />}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    sx={{ color: accent.main, borderColor: accent.main }}
                  >
                    {t('workOrderDetail.uploadPhoto')}
                  </Button>
                  <input
                    ref={fileInputRef} type="file" accept="image/*" hidden
                    onChange={handlePhotoUpload}
                  />
                </Box>
              </Box>

              <Card
                variant="outlined"
                sx={{ p: 1.25, mb: 2, cursor: 'pointer', borderColor: alpha(navy[200], 0.9), bgcolor: alpha(navy[50], 0.35) }}
                onClick={() => setPhotosExpanded((prev) => !prev)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: navy[700] }}>
                    {t('workOrderDetail.photoGallery')} ({lightboxItems.length})
                  </Typography>
                  {photosExpanded ? <ExpandMore sx={{ color: navy[500] }} /> : <ChevronRight sx={{ color: navy[500] }} />}
                </Box>
                {!photosExpanded && (
                  collapsedPreviewPhotos.length > 0 ? (
                    <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 0.5 }}>
                      {collapsedPreviewPhotos.map((item, idx) => (
                        <Box
                          key={`${item.url}-${idx}`}
                          component="img"
                          src={item.url}
                          alt={item.alt}
                          sx={{ width: 88, height: 64, objectFit: 'cover', borderRadius: 1, flex: '0 0 auto', border: `1px solid ${alpha(navy[200], 0.9)}` }}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                      {t('workOrderDetail.noPhotos')}
                    </Typography>
                  )
                )}
              </Card>

              <Collapse in={photosExpanded}>
                {timelinePhotos.length === 0 && !selectedPhotoPreviewUrl ? (
                  <Box sx={{ textAlign: 'center', py: 4, bgcolor: alpha(navy[50], 0.5), borderRadius: 2 }}>
                    <PhotoCamera sx={{ fontSize: 48, color: navy[200], mb: 1 }} />
                    <Typography sx={{ color: '#94A3B8' }}>{t('workOrderDetail.noPhotos')}</Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {selectedPhotoPreviewUrl && (
                      <Card
                        variant="outlined"
                        sx={{
                          p: 1.25,
                          borderStyle: 'dashed',
                          borderColor: alpha(accent.main, 0.6),
                          bgcolor: alpha(accent.main, 0.03),
                        }}
                      >
                        <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 1 }}>
                          {t('workOrderDetail.latestSelectedPhotoPreview')}
                        </Typography>
                        <Box
                          component="img"
                          src={selectedPhotoPreviewUrl}
                          alt={t('workOrderDetail.selectedPhoto')}
                          onClick={() => openLightbox(selectedPhotoPreviewUrl)}
                          sx={{ width: '100%', maxHeight: 260, objectFit: 'cover', borderRadius: 1, cursor: 'zoom-in' }}
                        />
                      </Card>
                    )}

                    <Box sx={{ position: 'relative' }}>
                      {timelinePhotos.map((photo, index) => {
                        const typeColor = photo.photoType === 0 ? accent.main : photo.photoType === 1 ? '#D97706' : '#059669';
                        const typeBg = alpha(typeColor, 0.1);

                        return (
                          <Box
                            key={photo.id}
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: '28px 1fr',
                              columnGap: 1.5,
                              mb: index === timelinePhotos.length - 1 ? 0 : 2.5,
                            }}
                          >
                            <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                              {index !== timelinePhotos.length - 1 && (
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    top: 14,
                                    bottom: -30,
                                    width: 2,
                                    bgcolor: alpha(navy[200], 0.9),
                                  }}
                                />
                              )}
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: '50%',
                                  mt: 0.5,
                                  bgcolor: typeColor,
                                  boxShadow: `0 0 0 4px ${alpha(typeColor, 0.18)}`,
                                }}
                              />
                            </Box>

                            <Card variant="outlined" sx={{ p: 1.25 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Chip
                                  label={PhotoTypeLabels[photo.photoType] ?? t('workOrderDetail.fallbackPhotoLabel')}
                                  size="small"
                                  sx={{
                                    fontWeight: 700,
                                    fontSize: '0.72rem',
                                    height: 24,
                                    bgcolor: typeBg,
                                    color: typeColor,
                                  }}
                                />
                                <Typography variant="caption" sx={{ color: '#64748B' }}>
                                  {new Date(photo.createdAt).toLocaleString(dateLocale)}
                                </Typography>
                              </Box>

                              {photo.downloadUrl ? (
                                <Box
                                  component="img"
                                  src={photo.downloadUrl}
                                  alt={photo.fileName}
                                  onClick={() => openLightbox(photo.downloadUrl!)}
                                  sx={{ width: '100%', maxHeight: 260, objectFit: 'cover', borderRadius: 1, cursor: 'zoom-in' }}
                                />
                              ) : (
                                <Box
                                  sx={{
                                    height: 180,
                                    bgcolor: alpha(navy[50], 0.6),
                                    borderRadius: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <PhotoCamera sx={{ color: navy[300], fontSize: 36 }} />
                                </Box>
                              )}
                            </Card>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                )}
              </Collapse>
            </CardContent>
          </Card>
        </Grid>

        {/* Materials Placeholder */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <BuildIcon fontSize="small" sx={{ color: accent.main }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: navy[800] }}>
                  {t('workOrderDetail.materialUsage')}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', py: 4, bgcolor: alpha(navy[50], 0.5), borderRadius: 2 }}>
                <BuildIcon sx={{ fontSize: 48, color: navy[200], mb: 1 }} />
                <Typography sx={{ color: '#94A3B8' }} variant="body2">
                  {t('workOrderDetail.materialTrackingSoon')}
                </Typography>
                <Typography variant="caption" sx={{ color: navy[200] }}>
                  {t('workOrderDetail.materialDescription')}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={uploadFeedback.open}
        autoHideDuration={3500}
        onClose={() => setUploadFeedback((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setUploadFeedback((prev) => ({ ...prev, open: false }))}
          severity={uploadFeedback.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {uploadFeedback.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ p: 1.5 }}>
          {activeLightboxItem && (
            <Box sx={{ position: 'relative' }}>
              {lightboxItems.length > 1 && (
                <>
                  <IconButton
                    onClick={showPrevImage}
                    sx={{
                      position: 'absolute',
                      left: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: alpha('#000', 0.35),
                      color: '#fff',
                      '&:hover': { bgcolor: alpha('#000', 0.5) },
                    }}
                  >
                    <NavigateBefore />
                  </IconButton>
                  <IconButton
                    onClick={showNextImage}
                    sx={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: alpha('#000', 0.35),
                      color: '#fff',
                      '&:hover': { bgcolor: alpha('#000', 0.5) },
                    }}
                  >
                    <NavigateNext />
                  </IconButton>
                </>
              )}
              <Box
                component="img"
                src={activeLightboxItem.url}
                alt={activeLightboxItem.alt}
                sx={{ width: '100%', maxHeight: '84vh', objectFit: 'contain', borderRadius: 1 }}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>

      <AssignTechnicianDialog
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        workOrderId={id!}
        onAssigned={refetch}
        users={ASSIGNEE_USERS}
      />
    </Box>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Typography variant="body2" sx={{ color: '#94A3B8' }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>{value}</Typography>
    </Box>
  );
}
