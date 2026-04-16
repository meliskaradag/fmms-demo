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
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, MarkEmailRead as InviteIcon } from '@mui/icons-material';
import { useTranslation } from '../../i18n';

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

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function UserDefinitionsPage() {
  const { t } = useTranslation();
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [users, setUsers] = useState<ManagedUser[]>(() => loadFromStorage(USERS_STORAGE_KEY, defaultUsers));
  const [invites, setInvites] = useState<PendingInvite[]>(() => loadFromStorage(INVITES_STORAGE_KEY, [] as PendingInvite[]));
  const [newUser, setNewUser] = useState({
    fullName: '',
    role: 'technician' as UserRole,
    email: '',
    phone: '',
  });
  const [invite, setInvite] = useState({
    role: 'technician' as UserRole,
    channel: 'email' as InviteChannel,
    target: '',
  });

  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(INVITES_STORAGE_KEY, JSON.stringify(invites));
  }, [invites]);

  const roleOptions: { value: UserRole; label: string }[] = useMemo(
    () => ([
      { value: 'admin', label: t('definitions.roleAdmin') },
      { value: 'supervisor', label: t('definitions.roleSupervisor') },
      { value: 'technician', label: t('definitions.roleTechnician') },
      { value: 'stock_manager', label: t('definitions.roleStockManager') },
      { value: 'viewer', label: t('definitions.roleViewer') },
    ]),
    [t]
  );

  const isUserFormValid = newUser.fullName.trim().length > 0;
  const isInviteFormValid = invite.target.trim().length > 0;

  const addUser = () => {
    if (!isUserFormValid) return;
    const payload: ManagedUser = {
      id: crypto.randomUUID(),
      fullName: newUser.fullName.trim(),
      role: newUser.role,
      email: newUser.email.trim() || undefined,
      phone: newUser.phone.trim() || undefined,
    };
    setUsers(prev => [payload, ...prev]);
    setNewUser({ fullName: '', role: 'technician', email: '', phone: '' });
    setOpenUserDialog(false);
  };

  const removeUser = (id: string) => setUsers(prev => prev.filter(item => item.id !== id));

  const createInvite = () => {
    if (!isInviteFormValid) return;
    const item: PendingInvite = {
      id: crypto.randomUUID(),
      role: invite.role,
      channel: invite.channel,
      target: invite.target.trim(),
      status: 'sent',
    };
    setInvites(prev => [item, ...prev]);
    setInvite({ role: 'technician', channel: 'email', target: '' });
  };

  const roleLabel = (value: UserRole) => roleOptions.find(item => item.value === value)?.label ?? value;

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {t('definitions.usersTitle')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('definitions.usersSubtitle')}
        </Typography>
      </Box>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Card variant="outlined" sx={{ flex: 2 }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, pb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {t('definitions.userList')}
              </Typography>
              <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setOpenUserDialog(true)}>
                {t('definitions.newUser')}
              </Button>
            </Box>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('definitions.fullName')}</TableCell>
                  <TableCell>{t('definitions.contact')}</TableCell>
                  <TableCell>{t('definitions.authorization')}</TableCell>
                  <TableCell align="right">{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>
                      <Stack spacing={0.3}>
                        {user.email && <Typography variant="body2">{user.email}</Typography>}
                        {user.phone && (
                          <Typography variant="caption" color="text.secondary">
                            {user.phone}
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip label={roleLabel(user.role)} size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="error" onClick={() => removeUser(user.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
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

        <Card variant="outlined" sx={{ flex: 1, minWidth: 300 }}>
          <CardContent>
            <Stack spacing={1.5}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {t('definitions.inviteTitle')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('definitions.inviteSubtitle')}
              </Typography>

              <FormControl size="small" fullWidth>
                <InputLabel>{t('definitions.authorization')}</InputLabel>
                <Select
                  value={invite.role}
                  label={t('definitions.authorization')}
                  onChange={e => setInvite(prev => ({ ...prev, role: e.target.value as UserRole }))}
                >
                  {roleOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" fullWidth>
                <InputLabel>{t('definitions.inviteChannel')}</InputLabel>
                <Select
                  value={invite.channel}
                  label={t('definitions.inviteChannel')}
                  onChange={e => setInvite(prev => ({ ...prev, channel: e.target.value as InviteChannel, target: '' }))}
                >
                  <MenuItem value="email">{t('definitions.byEmail')}</MenuItem>
                  <MenuItem value="phone">{t('definitions.byPhone')}</MenuItem>
                </Select>
              </FormControl>

              <TextField
                size="small"
                label={invite.channel === 'email' ? t('definitions.email') : t('definitions.phone')}
                value={invite.target}
                onChange={e => setInvite(prev => ({ ...prev, target: e.target.value }))}
              />

              <Button variant="contained" startIcon={<InviteIcon />} onClick={createInvite} disabled={!isInviteFormValid}>
                {t('definitions.sendInvitation')}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      <Card variant="outlined">
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 2, pb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {t('definitions.pendingInvites')}
            </Typography>
          </Box>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('definitions.inviteChannel')}</TableCell>
                <TableCell>{t('definitions.target')}</TableCell>
                <TableCell>{t('definitions.authorization')}</TableCell>
                <TableCell>{t('common.status')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invites.map(item => (
                <TableRow key={item.id}>
                  <TableCell>{item.channel === 'email' ? t('definitions.byEmail') : t('definitions.byPhone')}</TableCell>
                  <TableCell>{item.target}</TableCell>
                  <TableCell>{roleLabel(item.role)}</TableCell>
                  <TableCell>
                    <Chip size="small" color="success" label={item.status === 'sent' ? t('definitions.sent') : t('definitions.pending')} />
                  </TableCell>
                </TableRow>
              ))}
              {invites.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
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

      <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t('definitions.newUser')}</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 0.5 }}>
            <TextField
              label={t('definitions.fullName')}
              value={newUser.fullName}
              onChange={e => setNewUser(prev => ({ ...prev, fullName: e.target.value }))}
            />
            <FormControl>
              <InputLabel>{t('definitions.authorization')}</InputLabel>
              <Select
                value={newUser.role}
                label={t('definitions.authorization')}
                onChange={e => setNewUser(prev => ({ ...prev, role: e.target.value as UserRole }))}
              >
                {roleOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label={t('definitions.email')}
              value={newUser.email}
              onChange={e => setNewUser(prev => ({ ...prev, email: e.target.value }))}
            />
            <TextField
              label={t('definitions.phone')}
              value={newUser.phone}
              onChange={e => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUserDialog(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={addUser} disabled={!isUserFormValid}>
            {t('common.create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
