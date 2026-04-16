import { useEffect, useMemo, useState } from 'react';
import {
  Box, Button, Card, CardContent, Chip, Collapse, Dialog, DialogActions,
  DialogContent, DialogTitle, Grid, IconButton, Stack, Table, TableBody,
  TableCell, TableHead, TableRow, TextField, Tooltip, Typography, alpha,
} from '@mui/material';
import {
  Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon,
  Verified as VerifiedIcon, ExpandLess, Warning as WarningIcon,
  CheckCircle as CheckCircleIcon, Error as ErrorIcon,
} from '@mui/icons-material';
import { useTranslation } from '../../i18n';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import { navy, accent } from '../../theme/theme';

interface TechnicianCertificate {
  id: string;
  name: string;
  issuedAt: string;
  expiresAt: string;
  issuer: string;
  fileName: string;
  fileDataUrl: string;
  mimeType: string;
}

interface TechnicianDefinition {
  id: string;
  registryNo: string;
  fullName: string;
  phone: string;
  email: string;
  specialty: string;
  certificates: TechnicianCertificate[];
}

const STORAGE_KEY = 'fmms-definition-technicians-v1';

const defaultTechnicians: TechnicianDefinition[] = [
  {
    id: 'tech-1',
    registryNo: 'TM-1001',
    fullName: 'Ahmet Yilmaz',
    phone: '+90 532 100 00 01',
    email: 'ahmet.yilmaz@abcavm.com',
    specialty: 'HVAC',
    certificates: [
      {
        id: 'cert-1',
        name: 'Sogutma Sistemleri Seviye-3',
        issuedAt: '2024-01-10',
        expiresAt: '2027-01-10',
        issuer: 'Mesleki Yeterlilik Kurumu',
        fileName: 'sogutma-seviye-3.pdf',
        fileDataUrl: '',
        mimeType: 'application/pdf',
      },
    ],
  },
];

/* ── Sertifika geçerlilik durumu ── */
function getCertStatus(expiresAt: string): { label: string; color: string; icon: React.ReactNode } {
  if (!expiresAt) return { label: '', color: '#6B7280', icon: null };
  const daysLeft = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return { label: 'Süresi doldu', color: '#DC2626', icon: <ErrorIcon sx={{ fontSize: 14 }} /> };
  if (daysLeft <= 30) return { label: `${daysLeft} gün kaldı`, color: '#D97706', icon: <WarningIcon sx={{ fontSize: 14 }} /> };
  return { label: 'Geçerli', color: '#059669', icon: <CheckCircleIcon sx={{ fontSize: 14 }} /> };
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function inferMimeType(fileName: string, providedMime?: string): string {
  if (providedMime && providedMime !== 'application/octet-stream') return providedMime;
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  return providedMime || 'application/octet-stream';
}

function extractBase64Payload(dataUrl: string): string {
  const i = dataUrl.indexOf(',');
  return i >= 0 ? dataUrl.slice(i + 1) : '';
}

function loadTechnicians(): TechnicianDefinition[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultTechnicians;
    const parsed = JSON.parse(raw) as TechnicianDefinition[];
    if (!Array.isArray(parsed)) return defaultTechnicians;
    return parsed.map((item) => ({
      ...item,
      certificates: Array.isArray(item.certificates) ? item.certificates.map((c) => ({
        id: c.id ?? crypto.randomUUID(),
        name: c.name ?? '',
        issuedAt: c.issuedAt ?? '',
        expiresAt: c.expiresAt ?? '',
        issuer: c.issuer ?? '',
        fileName: c.fileName ?? '',
        fileDataUrl: c.fileDataUrl ?? '',
        mimeType: inferMimeType(c.fileName ?? '', c.mimeType),
      })) : [],
    }));
  } catch {
    return defaultTechnicians;
  }
}

const emptyForm = { registryNo: '', fullName: '', phone: '', email: '', specialty: '', certificates: [] as TechnicianCertificate[] };
const emptyCertForm = { name: '', issuedAt: '', expiresAt: '', issuer: '', fileName: '', fileDataUrl: '', mimeType: '' };

export default function TechnicianDefinitionsPage() {
  const { t } = useTranslation();
  const [technicians, setTechnicians] = useState<TechnicianDefinition[]>(() => loadTechnicians());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  /* İnline sertifika formu */
  const [showCertForm, setShowCertForm] = useState(false);
  const [certForm, setCertForm] = useState(emptyCertForm);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(technicians));
  }, [technicians]);

  const isFormValid = useMemo(
    () => Boolean(form.registryNo.trim() && form.fullName.trim() && form.phone.trim() && form.email.trim() && form.specialty.trim()),
    [form],
  );

  const isCertValid = useMemo(
    () => Boolean(certForm.name.trim() && certForm.issuedAt && certForm.expiresAt && certForm.issuer.trim()),
    [certForm],
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowCertForm(false);
    setCertForm(emptyCertForm);
    setDialogOpen(true);
  };

  const openEdit = (tech: TechnicianDefinition) => {
    setEditingId(tech.id);
    setForm({ registryNo: tech.registryNo, fullName: tech.fullName, phone: tech.phone, email: tech.email, specialty: tech.specialty, certificates: [...tech.certificates] });
    setShowCertForm(false);
    setCertForm(emptyCertForm);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!isFormValid) return;
    if (editingId) {
      setTechnicians((prev) => prev.map((t) => t.id === editingId ? { ...t, ...form } : t));
    } else {
      setTechnicians((prev) => [{ id: crypto.randomUUID(), ...form }, ...prev]);
    }
    setDialogOpen(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm(t('definitions.deleteConfirm'))) return;
    setTechnicians((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAddCert = () => {
    if (!isCertValid) return;
    const cert: TechnicianCertificate = {
      id: crypto.randomUUID(),
      name: certForm.name.trim(),
      issuedAt: certForm.issuedAt,
      expiresAt: certForm.expiresAt,
      issuer: certForm.issuer.trim(),
      fileName: certForm.fileName.trim(),
      fileDataUrl: certForm.fileDataUrl,
      mimeType: inferMimeType(certForm.fileName, certForm.mimeType),
    };
    setForm((prev) => ({ ...prev, certificates: [...prev.certificates, cert] }));
    setCertForm(emptyCertForm);
    setShowCertForm(false);
  };

  const handleViewFile = (cert: TechnicianCertificate) => {
    if (!cert.fileDataUrl) return;
    const mimeType = inferMimeType(cert.fileName, cert.mimeType);
    const payload = extractBase64Payload(cert.fileDataUrl);
    if (!payload) return;
    const bytes = new Uint8Array(atob(payload).split('').map((c) => c.charCodeAt(0)));
    const blob = new Blob([bytes], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const canPreview = mimeType === 'application/pdf' || mimeType.startsWith('image/') || mimeType.startsWith('text/');
    if (canPreview) {
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } else {
      const a = document.createElement('a');
      a.href = url; a.download = cert.fileName || 'file'; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    }
  };

  return (
    <Stack spacing={2.5}>
      <PageHeader
        title={t('definitions.techniciansTitle')}
        subtitle={t('definitions.techniciansSubtitle')}
        mb={0}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            {t('definitions.newTechnician')}
          </Button>
        }
      />

      <Card>
        <CardContent sx={{ p: 0 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('definitions.registryNo')}</TableCell>
                <TableCell>{t('definitions.fullName')}</TableCell>
                <TableCell>{t('definitions.contact')}</TableCell>
                <TableCell>{t('definitions.specialty')}</TableCell>
                <TableCell>{t('definitions.certifications')}</TableCell>
                <TableCell align="right">{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {technicians.map((tech) => (
                <TableRow key={tech.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace', color: navy[600] }}>
                      {tech.registryNo || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{tech.fullName}</Typography>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.25}>
                      <Typography variant="body2">{tech.phone}</Typography>
                      <Typography variant="caption" color="text.secondary">{tech.email}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={tech.specialty}
                      size="small"
                      sx={{ bgcolor: alpha(accent.main, 0.1), color: accent.dark, fontWeight: 600, fontSize: '0.72rem' }}
                    />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 280 }}>
                    {tech.certificates.length === 0 ? (
                      <Typography variant="caption" color="text.secondary">{t('common.none')}</Typography>
                    ) : (
                      <Stack spacing={0.5}>
                        {tech.certificates.map((cert) => {
                          const status = getCertStatus(cert.expiresAt);
                          return (
                            <Tooltip
                              key={cert.id}
                              title={
                                <Box>
                                  <div>{cert.name}</div>
                                  <div>{cert.issuer}</div>
                                  <div>{formatDate(cert.issuedAt)} → {formatDate(cert.expiresAt)}</div>
                                  {cert.fileName && <div>{cert.fileName}</div>}
                                </Box>
                              }
                              arrow
                            >
                              <Box
                                sx={{
                                  display: 'inline-flex', alignItems: 'center', gap: 0.5,
                                  px: 1, py: 0.4, borderRadius: 1.5,
                                  bgcolor: alpha(status.color, 0.08),
                                  border: `1px solid ${alpha(status.color, 0.25)}`,
                                  cursor: cert.fileDataUrl ? 'pointer' : 'default',
                                  maxWidth: 260,
                                }}
                                onClick={() => cert.fileDataUrl && handleViewFile(cert)}
                              >
                                <Box sx={{ color: status.color, display: 'flex', flexShrink: 0 }}>{status.icon}</Box>
                                <VerifiedIcon sx={{ fontSize: 13, color: navy[400], flexShrink: 0 }} />
                                <Typography
                                  variant="caption"
                                  sx={{ fontWeight: 600, color: navy[700], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                >
                                  {cert.name.length > 28 ? cert.name.slice(0, 27) + '…' : cert.name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: status.color, fontWeight: 600, flexShrink: 0, fontSize: '0.67rem' }}>
                                  {formatDate(cert.expiresAt)}
                                </Typography>
                              </Box>
                            </Tooltip>
                          );
                        })}
                      </Stack>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <IconButton size="small" onClick={() => openEdit(tech)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(tech.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {technicians.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <EmptyState title={t('common.noData')} />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Teknisyen ekle / düzenle dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? t('definitions.editTechnician') : t('definitions.newTechnician')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.25 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth size="small"
                label={t('definitions.fullName')}
                value={form.fullName}
                onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth size="small"
                label={t('definitions.registryNo')}
                value={form.registryNo}
                onChange={(e) => setForm((p) => ({ ...p, registryNo: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth size="small"
                label={t('definitions.specialty')}
                value={form.specialty}
                onChange={(e) => setForm((p) => ({ ...p, specialty: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth size="small"
                label={t('definitions.phone')}
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth size="small"
                label={t('definitions.email')}
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              />
            </Grid>

            {/* Sertifikalar bölümü */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ borderTop: `1px solid`, borderColor: 'divider', pt: 1.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">{t('definitions.certifications')}</Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={showCertForm ? <ExpandLess /> : <AddIcon />}
                    onClick={() => setShowCertForm((p) => !p)}
                  >
                    {showCertForm ? t('common.cancel') : t('definitions.addCertificate')}
                  </Button>
                </Stack>

                {/* Eklenmiş sertifikalar */}
                {form.certificates.length > 0 && (
                  <Stack spacing={0.75} sx={{ mb: 1.5 }}>
                    {form.certificates.map((cert) => {
                      const status = getCertStatus(cert.expiresAt);
                      return (
                        <Box
                          key={cert.id}
                          sx={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            px: 1.5, py: 0.9, borderRadius: 2,
                            border: `1px solid ${alpha(status.color, 0.3)}`,
                            bgcolor: alpha(status.color, 0.04),
                          }}
                        >
                          <Stack spacing={0.1}>
                            <Stack direction="row" spacing={0.75} alignItems="center">
                              <Box sx={{ color: status.color, display: 'flex' }}>{status.icon}</Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{cert.name}</Typography>
                            </Stack>
                            <Typography variant="caption" color="text.secondary">
                              {cert.issuer} · {formatDate(cert.issuedAt)} – {formatDate(cert.expiresAt)}
                              {cert.fileName && ` · ${cert.fileName}`}
                            </Typography>
                          </Stack>
                          <IconButton size="small" color="error" onClick={() => setForm((p) => ({ ...p, certificates: p.certificates.filter((c) => c.id !== cert.id) }))}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      );
                    })}
                  </Stack>
                )}

                {/* İnline sertifika ekleme formu */}
                <Collapse in={showCertForm}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(navy[50], 0.5), border: `1px dashed ${alpha(navy[300], 0.5)}` }}>
                    <Grid container spacing={1.5}>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          fullWidth size="small"
                          label={t('definitions.certificateName')}
                          value={certForm.name}
                          onChange={(e) => setCertForm((p) => ({ ...p, name: e.target.value }))}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth size="small"
                          label={t('definitions.issuedDate')}
                          type="date"
                          slotProps={{ inputLabel: { shrink: true } }}
                          value={certForm.issuedAt}
                          onChange={(e) => setCertForm((p) => ({ ...p, issuedAt: e.target.value }))}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth size="small"
                          label={t('definitions.expiryDate')}
                          type="date"
                          slotProps={{ inputLabel: { shrink: true } }}
                          value={certForm.expiresAt}
                          onChange={(e) => setCertForm((p) => ({ ...p, expiresAt: e.target.value }))}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth size="small"
                          label={t('definitions.issuer')}
                          value={certForm.issuer}
                          onChange={(e) => setCertForm((p) => ({ ...p, issuer: e.target.value }))}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Button variant="outlined" component="label" fullWidth size="small" sx={{ height: 40 }}>
                          {certForm.fileName || t('definitions.uploadCertificateFile')}
                          <input hidden type="file" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = () => setCertForm((p) => ({
                              ...p, fileName: file.name, fileDataUrl: reader.result as string,
                              mimeType: inferMimeType(file.name, file.type),
                            }));
                            reader.readAsDataURL(file);
                          }} />
                        </Button>
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Button variant="contained" size="small" onClick={handleAddCert} disabled={!isCertValid}>
                            {t('definitions.addCertificate')}
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Collapse>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleSave} disabled={!isFormValid}>
            {editingId ? t('common.save') : t('common.create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
