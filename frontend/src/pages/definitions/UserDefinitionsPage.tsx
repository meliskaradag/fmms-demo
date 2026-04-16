import { useEffect, useMemo, useState } from 'react';
import {
  Avatar, Box, Button, Card, CardContent, Chip, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, FormControl, IconButton, InputLabel,
  MenuItem, Select, Stack, Tab, Table, TableBody, TableCell,
  TableHead, TableRow, Tabs, TextField, Typography, alpha,
} from '@mui/material';
import {
  Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon,
  MarkEmailRead as InviteIcon, People as PeopleIcon, Send as SendIcon,
} from '@mui/icons-material';
import { useTranslation } from '../../i18n';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import { accent } from '../../theme/theme';

type UserRole = 'admin' | 'supervisor' | 'technician' | 'stock_manager' | 'viewer';
type InviteChannel = 'email' | 'phone';

interface ManagedUser {
  id: string;
  fullName: string;
  role: UserRole;
  email?: string;
  phone?: string;
}

interface PendingInvite {
  id: string;
  role: UserRole;
  channel: InviteChannel;
  target: string;
  status: 'pending' | 'sent';
}

const USERS_STORAGE_KEY = 'fmms-definition-users-v1';
const INVITES_STORAGE_KEY = 'fmms-definition-user-invites-v1';

const defaultUsers: ManagedUser[] = [
  { id: 'u1', fullName: 'FM Yönetici', role: 'admin', email: 'admin@abcavm.com' },
  { id: 'u2', fullName: 'Zeynep Demir', role: 'stock_manager', email: 'zeynep.demir@abcavm.com', phone: '+90 533 111 22 33' },
];

const ROLE_COLORS: Record<UserRole, { bg: string; text: string }> = {
  admin:         { bg: alpha('#DC2626', 0.1), text: '#DC2626' },
  supervisor:    { bg: alpha('#7C3AED', 0.1), text: '#7C3AED' },
  technician:    { bg: alpha('#2563EB', 0.1), text: '#2563EB' },
  stock_manager: { bg: alpha('#D97706', 0.1), text: '#D97706' },
  viewer:        { bg: alpha('#6B7280', 0.1), text: '#6B7280' },
};

const AVATAR_COLORS: Record<UserRole, string> = {
  admin: '#DC2626', supervisor: '#7C3AED', technician: '#2563EB',
  stock_manager: '#D97706', viewer: '#6B7280',
};

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

const emptyNewUser = { fullName: '', role: 'technician' as UserRole, email: '', phone: '' };

export default function UserDefinitionsPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState<ManagedUser[]>(() => loadFromStorage(USERS_STORAGE_KEY, defaultUsers));
  const [invites, setInvites] = useState<PendingInvite[]>(() => loadFromStorage(INVITES_STORAGE_KEY, [] as PendingInvite[]));

  /* Kullanıcı ekleme dialog */
  const [userDialog, setUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [newUser, setNewUser] = useState(emptyNewUser);

  /* Davet formu */
  const [invite, setInvite] = useState({ role: 'technician' as UserRole, channel: 'email' as InviteChannel, target: '' });

  useEffect(() => { localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem(INVITES_STORAGE_KEY, JSON.stringify(invites)); }, [invites]);

  const roleOptions: { value: UserRole; label: string }[] = useMemo(() => ([
    { value: 'admin',         label: t('definitions.roleAdmin') },
    { value: 'supervisor',    label: t('definitions.roleSupervisor') },
    { value: 'technician',    label: t('definitions.roleTechnician') },
    { value: 'stock_manager', label: t('definitions.roleStockManager') },
    { value: 'viewer',        label: t('definitions.roleViewer') },
  ]), [t]);

  const roleLabel = (v: UserRole) => roleOptions.find((o) => o.value === v)?.label ?? v;

  const isUserFormValid = newUser.fullName.trim().length > 0;
  const isInviteFormValid = invite.target.trim().length > 0;

  const openCreate = () => {
    setEditingUser(null);
    setNewUser(emptyNewUser);
    setUserDialog(true);
  };

  const openEdit = (user: ManagedUser) => {
    setEditingUser(user);
    setNewUser({ fullName: user.fullName, role: user.role, email: user.email ?? '', phone: user.phone ?? '' });
    setUserDialog(true);
  };

  const handleSaveUser = () => {
    if (!isUserFormValid) return;
    if (editingUser) {
      setUsers((prev) => prev.map((u) => u.id === editingUser.id
        ? { ...u, fullName: newUser.fullName.trim(), role: newUser.role, email: newUser.email.trim() || undefined, phone: newUser.phone.trim() || undefined }
        : u));
    } else {
      setUsers((prev) => [{
        id: crypto.randomUUID(), fullName: newUser.fullName.trim(), role: newUser.role,
        email: newUser.email.trim() || undefined, phone: newUser.phone.trim() || undefined,
      }, ...prev]);
    }
    setUserDialog(false);
    setEditingUser(null);
  };

  const removeUser = (id: string) => {
    if (!confirm(t('definitions.deleteConfirm'))) return;
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const createInvite = () => {
    if (!isInviteFormValid) return;
    setInvites((prev) => [{ id: crypto.randomUUID(), ...invite, status: 'sent' }, ...prev]);
    setInvite((p) => ({ ...p, target: '' }));
  };

  return (
    <Stack spacing={2.5}>
      <PageHeader
        title={t('definitions.usersTitle')}
        subtitle={t('definitions.usersSubtitle')}
        mb={0}
      />

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab
            label={
              <Stack direction="row" spacing={0.75} alignItems="center">
                <PeopleIcon sx={{ fontSize: 17 }} />
                <span>{t('definitions.userList')}</span>
                <Chip label={users.length} size="small" sx={{ height: 18, fontSize: '0.68rem', bgcolor: alpha(accent.main, 0.12), color: accent.dark }} />
              </Stack>
            }
          />
          <Tab
            label={
              <Stack direction="row" spacing={0.75} alignItems="center">
                <SendIcon sx={{ fontSize: 17 }} />
                <span>{t('definitions.inviteTitle')}</span>
                {invites.length > 0 && (
                  <Chip label={invites.length} size="small" sx={{ height: 18, fontSize: '0.68rem', bgcolor: alpha('#D97706', 0.12), color: '#D97706' }} />
                )}
              </Stack>
            }
          />
        </Tabs>
      </Box>

      {/* Tab 0 - Kullanıcı Listesi */}
      {tab === 0 && (
        <Card>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2, py: 1.5, borderBottom: `1px solid`, borderColor: 'divider' }}>
              <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={openCreate}>
                {t('definitions.newUser')}
              </Button>
            </Box>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('definitions.fullName')}</TableCell>
                  <TableCell>{t('definitions.contact')}</TableCell>
                  <TableCell>{t('definitions.authorization')}</TableCell>
                  <TableCell align="right">{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => {
                  const rc = ROLE_COLORS[user.role];
                  return (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1.25} alignItems="center">
                          <Avatar
                            sx={{ width: 34, height: 34, fontSize: '0.78rem', fontWeight: 700, bgcolor: AVATAR_COLORS[user.role] }}
                          >
                            {getInitials(user.fullName)}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{user.fullName}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.25}>
                          {user.email && <Typography variant="body2">{user.email}</Typography>}
                          {user.phone && <Typography variant="caption" color="text.secondary">{user.phone}</Typography>}
                          {!user.email && !user.phone && <Typography variant="caption" color="text.secondary">—</Typography>}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={roleLabel(user.role)}
                          size="small"
                          sx={{ bgcolor: rc.bg, color: rc.text, fontWeight: 700, fontSize: '0.72rem', border: `1px solid ${alpha(rc.text, 0.2)}` }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <IconButton size="small" onClick={() => openEdit(user)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => removeUser(user.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <EmptyState icon={<PeopleIcon />} title={t('common.noData')} />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Tab 1 - Davet Et */}
      {tab === 1 && (
        <Stack spacing={2}>
          {/* Davet gönder formu */}
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>{t('definitions.inviteTitle')}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{t('definitions.inviteSubtitle')}</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="flex-end">
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>{t('definitions.authorization')}</InputLabel>
                  <Select value={invite.role} label={t('definitions.authorization')} onChange={(e) => setInvite((p) => ({ ...p, role: e.target.value as UserRole }))}>
                    {roleOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>{t('definitions.inviteChannel')}</InputLabel>
                  <Select value={invite.channel} label={t('definitions.inviteChannel')} onChange={(e) => setInvite((p) => ({ ...p, channel: e.target.value as InviteChannel, target: '' }))}>
                    <MenuItem value="email">{t('definitions.byEmail')}</MenuItem>
                    <MenuItem value="phone">{t('definitions.byPhone')}</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  size="small"
                  label={invite.channel === 'email' ? t('definitions.email') : t('definitions.phone')}
                  value={invite.target}
                  onChange={(e) => setInvite((p) => ({ ...p, target: e.target.value }))}
                  sx={{ flex: 1, minWidth: 200 }}
                />
                <Button variant="contained" startIcon={<InviteIcon />} onClick={createInvite} disabled={!isInviteFormValid} sx={{ whiteSpace: 'nowrap' }}>
                  {t('definitions.sendInvitation')}
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* Bekleyen davetler */}
          <Card>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid`, borderColor: 'divider' }}>
                <Typography variant="subtitle2">{t('definitions.pendingInvites')}</Typography>
              </Box>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('definitions.target')}</TableCell>
                    <TableCell>{t('definitions.authorization')}</TableCell>
                    <TableCell>{t('definitions.inviteChannel')}</TableCell>
                    <TableCell>{t('common.status')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invites.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.target}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={roleLabel(item.role)}
                          size="small"
                          sx={{ bgcolor: ROLE_COLORS[item.role].bg, color: ROLE_COLORS[item.role].text, fontWeight: 600, fontSize: '0.72rem' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {item.channel === 'email' ? t('definitions.byEmail') : t('definitions.byPhone')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.status === 'sent' ? t('definitions.sent') : t('definitions.pending')}
                          size="small"
                          color={item.status === 'sent' ? 'success' : 'warning'}
                          variant="outlined"
                          sx={{ fontWeight: 600, fontSize: '0.72rem' }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {invites.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <EmptyState icon={<SendIcon />} title={t('definitions.pendingInvites')} description={t('definitions.inviteSubtitle')} />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Stack>
      )}

      {/* Kullanıcı ekleme / düzenleme dialog */}
      <Dialog open={userDialog} onClose={() => setUserDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editingUser ? t('definitions.editUser') : t('definitions.newUser')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <TextField
              fullWidth size="small"
              label={t('definitions.fullName')}
              value={newUser.fullName}
              onChange={(e) => setNewUser((p) => ({ ...p, fullName: e.target.value }))}
            />
            <FormControl size="small" fullWidth>
              <InputLabel>{t('definitions.authorization')}</InputLabel>
              <Select value={newUser.role} label={t('definitions.authorization')} onChange={(e) => setNewUser((p) => ({ ...p, role: e.target.value as UserRole }))}>
                {roleOptions.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: ROLE_COLORS[o.value].text, flexShrink: 0 }} />
                      <span>{o.label}</span>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Divider />
            <TextField
              fullWidth size="small"
              label={t('definitions.email')}
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))}
            />
            <TextField
              fullWidth size="small"
              label={t('definitions.phone')}
              value={newUser.phone}
              onChange={(e) => setNewUser((p) => ({ ...p, phone: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialog(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleSaveUser} disabled={!isUserFormValid}>
            {editingUser ? t('common.save') : t('common.create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
