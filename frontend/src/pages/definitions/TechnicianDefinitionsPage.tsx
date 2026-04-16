import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Verified as VerifiedIcon } from '@mui/icons-material';
import { useTranslation } from '../../i18n';

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

function inferMimeType(fileName: string, providedMime?: string): string {
  if (providedMime && providedMime !== 'application/octet-stream') return providedMime;
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.txt')) return 'text/plain';
  return providedMime || 'application/octet-stream';
}

function extractBase64Payload(dataUrl: string): string {
  const commaIndex = dataUrl.indexOf(',');
  return commaIndex >= 0 ? dataUrl.slice(commaIndex + 1) : '';
}

function loadTechnicians(): TechnicianDefinition[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultTechnicians;
    const parsed = JSON.parse(raw) as Array<TechnicianDefinition & { certificates?: unknown }>;
    if (!Array.isArray(parsed)) return defaultTechnicians;

    return parsed.map((item, index) => {
      const certificates = Array.isArray(item.certificates)
        ? item.certificates.map((cert, certIndex) => {
          if (typeof cert === 'string') {
            return {
              id: `${item.id || `tech-${index}`}-cert-${certIndex}`,
              name: cert,
              issuedAt: '',
              expiresAt: '',
              issuer: '',
              fileName: '',
              fileDataUrl: '',
              mimeType: '',
            } satisfies TechnicianCertificate;
          }
          const certObj = cert as Partial<TechnicianCertificate>;
          return {
            id: certObj.id ?? crypto.randomUUID(),
            name: certObj.name ?? '',
            issuedAt: certObj.issuedAt ?? '',
            expiresAt: certObj.expiresAt ?? '',
            issuer: certObj.issuer ?? '',
            fileName: certObj.fileName ?? '',
            fileDataUrl: certObj.fileDataUrl ?? '',
            mimeType: inferMimeType(certObj.fileName ?? '', certObj.mimeType),
          } satisfies TechnicianCertificate;
        })
        : [];

      return {
        id: item.id,
        registryNo: item.registryNo ?? '',
        fullName: item.fullName ?? '',
        phone: item.phone ?? '',
        email: item.email ?? '',
        specialty: item.specialty ?? '',
        certificates,
      } satisfies TechnicianDefinition;
    });
  } catch {
    return defaultTechnicians;
  }
}

export default function TechnicianDefinitionsPage() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [openCertificateDialog, setOpenCertificateDialog] = useState(false);
  const [editingTechnicianId, setEditingTechnicianId] = useState<string | null>(null);
  const [technicians, setTechnicians] = useState<TechnicianDefinition[]>(() => loadTechnicians());
  const [form, setForm] = useState({
    registryNo: '',
    fullName: '',
    phone: '',
    email: '',
    specialty: '',
    certificates: [] as TechnicianCertificate[],
  });
  const [certForm, setCertForm] = useState({
    name: '',
    issuedAt: '',
    expiresAt: '',
    issuer: '',
    fileName: '',
    fileDataUrl: '',
    mimeType: '',
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(technicians));
  }, [technicians]);

  const isFormValid = useMemo(
    () => Boolean(form.registryNo.trim() && form.fullName.trim() && form.phone.trim() && form.email.trim() && form.specialty.trim()),
    [form]
  );

  const isCertificateValid = useMemo(
    () => Boolean(certForm.name.trim() && certForm.issuedAt && certForm.expiresAt && certForm.issuer.trim() && certForm.fileName.trim()),
    [certForm]
  );

  const handleCreate = () => {
    if (!isFormValid) return;
    const next: TechnicianDefinition = {
      id: crypto.randomUUID(),
      registryNo: form.registryNo.trim(),
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      specialty: form.specialty.trim(),
      certificates: form.certificates,
    };

    setTechnicians(prev => [next, ...prev]);
    setForm({ registryNo: '', fullName: '', phone: '', email: '', specialty: '', certificates: [] });
    setEditingTechnicianId(null);
    setOpen(false);
  };

  const handleUpdate = () => {
    if (!isFormValid || !editingTechnicianId) return;
    setTechnicians(prev =>
      prev.map(item => (item.id === editingTechnicianId
        ? {
          ...item,
          registryNo: form.registryNo.trim(),
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          specialty: form.specialty.trim(),
          certificates: form.certificates,
        }
        : item))
    );
    setForm({ registryNo: '', fullName: '', phone: '', email: '', specialty: '', certificates: [] });
    setEditingTechnicianId(null);
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    setTechnicians(prev => prev.filter(item => item.id !== id));
  };

  const handleStartCreate = () => {
    setEditingTechnicianId(null);
    setForm({ registryNo: '', fullName: '', phone: '', email: '', specialty: '', certificates: [] });
    setOpen(true);
  };

  const handleStartEdit = (tech: TechnicianDefinition) => {
    setEditingTechnicianId(tech.id);
    setForm({
      registryNo: tech.registryNo,
      fullName: tech.fullName,
      phone: tech.phone,
      email: tech.email,
      specialty: tech.specialty,
      certificates: [...tech.certificates],
    });
    setOpen(true);
  };

  const handleAddCertificate = () => {
    if (!isCertificateValid) return;

    const nextCertificate: TechnicianCertificate = {
      id: crypto.randomUUID(),
      name: certForm.name.trim(),
      issuedAt: certForm.issuedAt,
      expiresAt: certForm.expiresAt,
      issuer: certForm.issuer.trim(),
      fileName: certForm.fileName.trim(),
      fileDataUrl: certForm.fileDataUrl,
      mimeType: inferMimeType(certForm.fileName, certForm.mimeType),
    };

    setForm(prev => ({ ...prev, certificates: [...prev.certificates, nextCertificate] }));
    setCertForm({ name: '', issuedAt: '', expiresAt: '', issuer: '', fileName: '', fileDataUrl: '', mimeType: '' });
    setOpenCertificateDialog(false);
  };

  const handleRemoveCertificate = (certificateId: string) => {
    setForm(prev => ({
      ...prev,
      certificates: prev.certificates.filter(item => item.id !== certificateId),
    }));
  };

  const handleViewFile = (certificate: TechnicianCertificate) => {
    if (!certificate.fileDataUrl) return;
    const mimeType = inferMimeType(certificate.fileName, certificate.mimeType);
    const payload = extractBase64Payload(certificate.fileDataUrl);
    if (!payload) return;

    const binary = atob(payload);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);

    const blob = new Blob([bytes], { type: mimeType });
    const blobUrl = URL.createObjectURL(blob);
    const canPreview = mimeType === 'application/pdf' || mimeType.startsWith('image/') || mimeType.startsWith('text/');

    if (canPreview) {
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
      return;
    }

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = certificate.fileName || 'certificate-file';
    link.click();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
  };

  return (
    <Stack spacing={2.5}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {t('definitions.techniciansTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('definitions.techniciansSubtitle')}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleStartCreate}>
          {t('definitions.newTechnician')}
        </Button>
      </Box>

      <Card variant="outlined">
        <CardContent sx={{ p: 0 }}>
          <Table size="small">
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
              {technicians.map(tech => (
                <TableRow key={tech.id} hover>
                  <TableCell>{tech.registryNo || '-'}</TableCell>
                  <TableCell>{tech.fullName}</TableCell>
                  <TableCell>
                    <Stack spacing={0.3}>
                      <Typography variant="body2">{tech.phone}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {tech.email}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{tech.specialty}</TableCell>
                  <TableCell>
                    <Stack spacing={0.7}>
                      {tech.certificates.length > 0 ? (
                        tech.certificates.map(cert => (
                          <Stack key={cert.id} direction="row" spacing={0.8} alignItems="center">
                            <Chip
                              size="small"
                              icon={<VerifiedIcon />}
                              label={`${cert.name}${cert.fileName ? ` (${cert.fileName})` : ''}`}
                            />
                            {cert.fileDataUrl && (
                              <Button size="small" variant="text" onClick={() => handleViewFile(cert)}>
                                {t('definitions.viewFile')}
                              </Button>
                            )}
                          </Stack>
                        ))
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          {t('common.none')}
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" size="small" onClick={() => handleStartEdit(tech)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton color="error" size="small" onClick={() => handleDelete(tech.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {technicians.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('common.noData')}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          setEditingTechnicianId(null);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{editingTechnicianId ? t('definitions.editTechnician') : t('definitions.newTechnician')}</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 0.5 }}>
            <TextField
              label={t('definitions.registryNo')}
              value={form.registryNo}
              onChange={e => setForm(prev => ({ ...prev, registryNo: e.target.value }))}
            />
            <TextField
              label={t('definitions.fullName')}
              value={form.fullName}
              onChange={e => setForm(prev => ({ ...prev, fullName: e.target.value }))}
            />
            <TextField
              label={t('definitions.phone')}
              value={form.phone}
              onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
            />
            <TextField
              label={t('definitions.email')}
              value={form.email}
              onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
            />
            <TextField
              label={t('definitions.specialty')}
              value={form.specialty}
              onChange={e => setForm(prev => ({ ...prev, specialty: e.target.value }))}
            />

            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="subtitle2">{t('definitions.certifications')}</Typography>
                <Button variant="outlined" size="small" onClick={() => setOpenCertificateDialog(true)}>
                  {t('definitions.addCertificate')}
                </Button>
              </Stack>

              <Stack spacing={0.8}>
                {form.certificates.length === 0 && (
                  <Typography variant="caption" color="text.secondary">
                    {t('common.none')}
                  </Typography>
                )}
                {form.certificates.map(item => (
                  <Stack
                    key={item.id}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, px: 1, py: 0.7 }}
                  >
                    <Box>
                      <Typography variant="body2">{item.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {`${item.issuer} | ${item.issuedAt} - ${item.expiresAt}${item.fileName ? ` | ${item.fileName}` : ''}`}
                      </Typography>
                      {item.fileDataUrl && (
                        <Box sx={{ mt: 0.4 }}>
                          <Button size="small" variant="text" onClick={() => handleViewFile(item)}>
                            {t('definitions.viewFile')}
                          </Button>
                        </Box>
                      )}
                    </Box>
                    <IconButton color="error" size="small" onClick={() => handleRemoveCertificate(item.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpen(false);
              setEditingTechnicianId(null);
            }}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={editingTechnicianId ? handleUpdate : handleCreate}
            variant="contained"
            disabled={!isFormValid}
          >
            {editingTechnicianId ? t('common.save') : t('common.create')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openCertificateDialog} onClose={() => setOpenCertificateDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t('definitions.addCertificate')}</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 0.5 }}>
            <TextField
              label={t('definitions.certificateName')}
              value={certForm.name}
              onChange={e => setCertForm(prev => ({ ...prev, name: e.target.value }))}
            />
            <TextField
              label={t('definitions.issuedDate')}
              type="date"
              InputLabelProps={{ shrink: true }}
              value={certForm.issuedAt}
              onChange={e => setCertForm(prev => ({ ...prev, issuedAt: e.target.value }))}
            />
            <TextField
              label={t('definitions.expiryDate')}
              type="date"
              InputLabelProps={{ shrink: true }}
              value={certForm.expiresAt}
              onChange={e => setCertForm(prev => ({ ...prev, expiresAt: e.target.value }))}
            />
            <TextField
              label={t('definitions.issuer')}
              value={certForm.issuer}
              onChange={e => setCertForm(prev => ({ ...prev, issuer: e.target.value }))}
            />
            <Button variant="outlined" component="label">
              {t('definitions.uploadCertificateFile')}
              <input
                hidden
                type="file"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) {
                    setCertForm(prev => ({ ...prev, fileName: '', fileDataUrl: '', mimeType: '' }));
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = () => {
                    const dataUrl = typeof reader.result === 'string' ? reader.result : '';
                    setCertForm(prev => ({
                      ...prev,
                      fileName: file.name,
                      fileDataUrl: dataUrl,
                      mimeType: inferMimeType(file.name, file.type),
                    }));
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </Button>
            {certForm.fileName && (
              <Typography variant="caption" color="text.secondary">
                {certForm.fileName}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCertificateDialog(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleAddCertificate} variant="contained" disabled={!isCertificateValid}>
            {t('common.create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
