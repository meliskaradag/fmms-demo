import { useEffect, useMemo, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, TextField, MenuItem, Grid, Chip,
  Divider, CircularProgress, List, ListItemButton, ListItemIcon, ListItemText,
  Paper, Switch, FormControlLabel, Table, TableHead, TableRow, TableCell,
  TableBody, Stack, Dialog, DialogTitle, DialogContent, DialogActions,
  LinearProgress, alpha, FormControl, InputLabel, Select, Snackbar, Alert,
  IconButton, Drawer, Tabs, Tab,
} from '@mui/material';
import {
  Add as AddIcon, Folder as FolderIcon, Inventory2 as InventoryIcon,
  ExpandLess, ExpandMore, Category as GroupIcon,
  AddCircleOutline, RemoveCircleOutline, SwapHoriz, Warning as WarningIcon,
  Close as CloseIcon, FolderOpen, AllInbox, DeviceHub, ChevronRight,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  createStockCard, getStockCardTree, getStockCards, getStockVariants,
  updateStockCard, createStockMovement, getStockMovements, getLocationTree,
  getAssets,
} from '../../api/endpoints';
import { useApi } from '../../hooks/useApi';
import { navy } from '../../theme/theme';
import { useTranslation } from '../../i18n';
import type { PagedResult, StockCard, StockCardTreeNode, StockVariant, StockMovement, Location, Asset } from '../../types';

/* ───── constants ───── */
const STOCK_CATEGORIES = ['Filtre', 'Kimyasal', 'Mekanik', 'Elektrik', 'Genel'];
const STOCK_UNITS = ['Adet', 'Litre', 'Kg', 'Metre', 'Kutu', 'Paket', 'Set'];

const MOVEMENT_LABELS: Record<number, string> = {
  0: 'Giriş', 1: 'Çıkış', 2: 'Transfer', 3: 'Düzeltme', 4: 'Sayım', 5: 'İade',
};
const MOVEMENT_COLORS: Record<number, string> = {
  0: '#059669', 1: '#DC2626', 2: '#2563EB', 3: '#D97706', 4: '#6B7280', 5: '#7C3AED',
};

function flattenLocations(locations: Location[], depth = 0): { location: Location; depth: number }[] {
  const result: { location: Location; depth: number }[] = [];
  locations.forEach((loc) => {
    result.push({ location: loc, depth });
    if (loc.children?.length) result.push(...flattenLocations(loc.children, depth + 1));
  });
  return result;
}

/* ───── collect groups / subgroups from tree ───── */
type GroupNode = { id: string; name: string; stockNumber: string; nodeType: string; childCount: number; cardCount: number; isLowStock: boolean; children: GroupNode[] };

function normalizeNodeType(nodeType?: string): string {
  if (!nodeType) return '';
  return nodeType.replace(/_/g, '').toUpperCase();
}

function collectGroups(nodes: StockCardTreeNode[]): GroupNode[] {
  return nodes
    .filter((n) => {
      const t = normalizeNodeType(n.nodeType);
      return t === 'STOCKGROUP' || t === 'STOCKSUBGROUP';
    })
    .map((n) => {
      const childGroups = collectGroups(n.children ?? []);
      const deepCards = countCards(n);
      return {
        id: n.id, name: n.name, stockNumber: n.stockNumber, nodeType: n.nodeType,
        childCount: childGroups.length, cardCount: deepCards, isLowStock: n.isLowStock,
        children: childGroups,
      };
    });
}

function countCards(node: StockCardTreeNode): number {
  if (normalizeNodeType(node.nodeType) === 'STOCKCARD') return 1;
  return (node.children ?? []).reduce((sum, c) => sum + countCards(c), 0);
}

function collectCardIds(node: StockCardTreeNode): string[] {
  if (normalizeNodeType(node.nodeType) === 'STOCKCARD') return [node.id];
  return (node.children ?? []).flatMap(collectCardIds);
}

function findTreeNode(nodes: StockCardTreeNode[], id: string): StockCardTreeNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    const found = findTreeNode(n.children ?? [], id);
    if (found) return found;
  }
  return null;
}

/* ───── Stock Level Bar ───── */
function StockLevelBar({ current, min, max, compact }: { current: number; min: number; max?: number; compact?: boolean }) {
  const upper = max && max > 0 ? max : Math.max(min * 3, current * 1.5, 10);
  const pct = Math.min((current / upper) * 100, 100);
  const isLow = min > 0 && current <= min;
  const isCritical = min > 0 && current <= min * 0.5;
  const color = isCritical ? '#DC2626' : isLow ? '#F59E0B' : '#059669';
  const h = compact ? 6 : 10;

  return (
    <Box sx={{ minWidth: compact ? 60 : 100 }}>
      {!compact && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color, fontSize: '0.8rem' }}>
            {current} {isLow && '(Düşük)'}
          </Typography>
          <Typography variant="caption" color="text.secondary">Min: {min}</Typography>
        </Box>
      )}
      <LinearProgress variant="determinate" value={pct} sx={{
        height: h, borderRadius: h / 2, bgcolor: alpha(color, 0.12),
        '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: h / 2 },
      }} />
    </Box>
  );
}

/* ───── Stock Movement Dialog ───── */
function StockMovementDialog({ open, onClose, stockCard, onSaved, locations }: {
  open: boolean; onClose: () => void; stockCard: StockCard | null;
  onSaved: () => void; locations: { location: Location; depth: number }[];
}) {
  const [movementType, setMovementType] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [locationId, setLocationId] = useState('');
  const [fromLocationId, setFromLocationId] = useState('');
  const [toLocationId, setToLocationId] = useState('');
  const [notes, setNotes] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMovementType(0); setQuantity(1); setLocationId('');
    setFromLocationId(''); setToLocationId(''); setNotes(''); setUnitCost('');
  }, [open]);

  const handleSubmit = async () => {
    if (!stockCard || quantity <= 0) return;
    setSubmitting(true);
    try {
      await createStockMovement({
        stockCardId: stockCard.id, movementType, quantity, unit: stockCard.unit,
        unitCost: unitCost ? Number(unitCost) : undefined,
        locationId: movementType !== 2 ? (locationId || undefined) : undefined,
        fromLocationId: movementType === 2 ? (fromLocationId || undefined) : undefined,
        toLocationId: movementType === 2 ? (toLocationId || undefined) : undefined,
        notes: notes.trim() || undefined,
      });
      onSaved(); onClose();
    } finally { setSubmitting(false); }
  };

  const isTransfer = movementType === 2;
  const typeColor = MOVEMENT_COLORS[movementType] ?? '#6B7280';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, color: navy[800] }}>
        Stok Hareketi
        {stockCard && <Chip size="small" label={stockCard.name} sx={{ ml: 1 }} />}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {/* Movement type chips */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Hareket Tipi</Typography>
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              {[0, 1, 2, 3, 5].map((mt) => (
                <Chip key={mt} label={MOVEMENT_LABELS[mt]} onClick={() => setMovementType(mt)}
                  variant={movementType === mt ? 'filled' : 'outlined'}
                  sx={{ fontWeight: 600, ...(movementType === mt ? { bgcolor: alpha(MOVEMENT_COLORS[mt], 0.15), color: MOVEMENT_COLORS[mt], borderColor: MOVEMENT_COLORS[mt] } : {}) }} />
              ))}
            </Stack>
          </Box>

          {/* Current stock info */}
          <Paper variant="outlined" sx={{ p: 1.5, borderLeft: `4px solid ${typeColor}`, bgcolor: alpha(typeColor, 0.03) }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{stockCard?.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              Mevcut: <strong>{stockCard?.currentBalance} {stockCard?.unit}</strong> | Min: {stockCard?.minStockLevel}
            </Typography>
          </Paper>

          <TextField fullWidth size="small" type="number" label={`Miktar (${stockCard?.unit ?? ''})`}
            value={quantity} onChange={(e) => setQuantity(Math.max(0, Number(e.target.value)))} inputProps={{ min: 1 }} />

          {!isTransfer && (
            <FormControl size="small" fullWidth>
              <InputLabel>Lokasyon</InputLabel>
              <Select value={locationId} label="Lokasyon" onChange={(e) => setLocationId(e.target.value)}>
                <MenuItem value=""><em>Otomatik</em></MenuItem>
                {locations.map(({ location: loc, depth }) => (
                  <MenuItem key={loc.id} value={loc.id} sx={{ pl: depth * 2 + 2 }}>{loc.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {isTransfer && (
            <>
              <FormControl size="small" fullWidth>
                <InputLabel>Kaynak Lokasyon</InputLabel>
                <Select value={fromLocationId} label="Kaynak Lokasyon" onChange={(e) => setFromLocationId(e.target.value)}>
                  {locations.map(({ location: loc, depth }) => (
                    <MenuItem key={loc.id} value={loc.id} sx={{ pl: depth * 2 + 2 }}>{loc.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel>Hedef Lokasyon</InputLabel>
                <Select value={toLocationId} label="Hedef Lokasyon" onChange={(e) => setToLocationId(e.target.value)}>
                  {locations.map(({ location: loc, depth }) => (
                    <MenuItem key={loc.id} value={loc.id} sx={{ pl: depth * 2 + 2 }}>{loc.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}

          {(movementType === 0 || movementType === 5) && (
            <TextField fullWidth size="small" type="number" label="Birim Maliyet (TRY)"
              value={unitCost} onChange={(e) => setUnitCost(e.target.value)} />
          )}

          <TextField fullWidth size="small" multiline minRows={2} label="Not"
            value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>İptal</Button>
        <Button variant="contained" onClick={handleSubmit}
          disabled={submitting || quantity <= 0 || (isTransfer && (!fromLocationId || !toLocationId))}
          sx={{ bgcolor: typeColor, '&:hover': { bgcolor: alpha(typeColor, 0.85) } }}>
          {submitting ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : MOVEMENT_LABELS[movementType]}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ───── Create Stock Card Dialog (comprehensive) ───── */
function CreateStockCardDialog({ open, onClose, onCreated, groups, locations }: {
  open: boolean; onClose: () => void; onCreated: () => void;
  groups: GroupNode[];
  locations: { location: Location; depth: number }[];
}) {
  const [step, setStep] = useState<'group' | 'card'>('card');
  const [parentId, setParentId] = useState('');
  const [stockNumber, setStockNumber] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(STOCK_CATEGORIES[0]);
  const [unit, setUnit] = useState(STOCK_UNITS[0]);
  const [minStockLevel, setMinStockLevel] = useState<number>(5);
  const [maxStockLevel, setMaxStockLevel] = useState<number>(0);
  const [criticalStockLevel, setCriticalStockLevel] = useState<number>(0);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [locationId, setLocationId] = useState('');
  const [barcode, setBarcode] = useState('');
  const [sku, setSku] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Group creation fields
  const [groupName, setGroupName] = useState('');
  const [groupCode, setGroupCode] = useState('');
  const [groupParentId, setGroupParentId] = useState('');
  const [groupType, setGroupType] = useState<'StockGroup' | 'StockSubgroup'>('StockGroup');

  useEffect(() => {
    if (!open) return;
    setStep('card'); setParentId(''); setStockNumber(''); setName('');
    setDescription(''); setCategory(STOCK_CATEGORIES[0]); setUnit(STOCK_UNITS[0]);
    setMinStockLevel(5); setMaxStockLevel(0); setCriticalStockLevel(0);
    setCurrentBalance(0); setLocationId(''); setBarcode(''); setSku('');
    setGroupName(''); setGroupCode(''); setGroupParentId(''); setGroupType('StockGroup');
  }, [open]);

  // Flatten groups for parent selection
  const flatGroups = useMemo(() => {
    const result: { node: GroupNode; depth: number }[] = [];
    const walk = (nodes: GroupNode[], depth: number) => {
      nodes.forEach((n) => { result.push({ node: n, depth }); walk(n.children, depth + 1); });
    };
    walk(groups, 0);
    return result;
  }, [groups]);

  // Only subgroups can be parents of cards
  const cardParents = flatGroups.filter((g) => normalizeNodeType(g.node.nodeType) === 'STOCKSUBGROUP');
  // Only groups can be parents of subgroups
  const groupParents = flatGroups.filter((g) => normalizeNodeType(g.node.nodeType) === 'STOCKGROUP');

  const handleCreateCard = async () => {
    if (!stockNumber.trim() || !name.trim() || !parentId) return;
    setSubmitting(true);
    try {
      await createStockCard({
        stockNumber: stockNumber.trim(), name: name.trim(),
        category, unit, minStockLevel, currentBalance,
        parentId, nodeType: 'StockCard',
        barcode: barcode.trim() || undefined, sku: sku.trim() || undefined,
        description: description.trim() || undefined,
        isActive: true,
      });
      onCreated(); onClose();
    } finally { setSubmitting(false); }
  };

  const handleCreateGroup = async () => {
    if (!groupCode.trim() || !groupName.trim()) return;
    setSubmitting(true);
    try {
      await createStockCard({
        stockNumber: groupCode.trim(), name: groupName.trim(),
        category: 'Katalog', unit: 'adet', minStockLevel: 0, currentBalance: 0,
        parentId: groupParentId || undefined,
        nodeType: groupType,
      });
      onCreated(); onClose();
    } finally { setSubmitting(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, color: navy[800], pb: 0 }}>
        Yeni Kayıt Oluştur
      </DialogTitle>
      <DialogContent>
        <Tabs value={step} onChange={(_, v) => setStep(v)} sx={{ mb: 2, borderBottom: '1px solid #E2E8F0' }}>
          <Tab value="card" label="Stok Kartı" sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab value="group" label="Grup / Alt Grup" sx={{ textTransform: 'none', fontWeight: 600 }} />
        </Tabs>

        {step === 'card' && (
          <Grid container spacing={2}>
            {/* Left: Main info */}
            <Grid size={{ xs: 12 }}>
              <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#F8FAFC', borderLeft: '4px solid #059669', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#065F46' }}>STOK KARTI</Typography>
                <Typography variant="body2" color="text.secondary">
                  Bakım malzemesi veya yedek parça kartı oluşturun. Kart bir alt gruba bağlı olmalıdır.
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControl size="small" fullWidth required>
                <InputLabel>Hangi Alt Gruba Eklenecek?</InputLabel>
                <Select value={parentId} label="Hangi Alt Gruba Eklenecek?" onChange={(e) => setParentId(e.target.value)}>
                  {cardParents.length === 0 && <MenuItem value="" disabled>Önce bir grup ve alt grup oluşturun</MenuItem>}
                  {cardParents.map(({ node, depth }) => (
                    <MenuItem key={node.id} value={node.id} sx={{ pl: depth * 2 + 2 }}>
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <FolderIcon sx={{ fontSize: 16, color: '#0284C7' }} />
                        <span>{node.name}</span>
                        <Chip size="small" label={`${node.cardCount} kart`} sx={{ height: 18, fontSize: '0.65rem' }} />
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth size="small" label="Stok Kodu *" value={stockNumber}
                onChange={(e) => setStockNumber(e.target.value)} placeholder="FLT-001" />
            </Grid>
            <Grid size={{ xs: 12, sm: 8 }}>
              <TextField fullWidth size="small" label="Malzeme Adı *" value={name}
                onChange={(e) => setName(e.target.value)} placeholder="AHU Panel Filtre 592x592x48mm" />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField fullWidth size="small" multiline minRows={2} label="Açıklama"
                value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Malzeme hakkında detaylı bilgi, kullanım alanı, teknik özellikler..." />
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField select fullWidth size="small" label="Kategori" value={category}
                onChange={(e) => setCategory(e.target.value)}>
                {STOCK_CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField select fullWidth size="small" label="Birim" value={unit}
                onChange={(e) => setUnit(e.target.value)}>
                {STOCK_UNITS.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField fullWidth size="small" label="Barkod" value={barcode}
                onChange={(e) => setBarcode(e.target.value)} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField fullWidth size="small" label="SKU" value={sku}
                onChange={(e) => setSku(e.target.value)} />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Divider><Chip size="small" label="Stok Seviyeleri" /></Divider>
            </Grid>

            <Grid size={{ xs: 4 }}>
              <TextField fullWidth size="small" type="number" label="Minimum Stok *"
                value={minStockLevel} onChange={(e) => setMinStockLevel(Number(e.target.value))}
                helperText="Bu seviyenin altında uyarı verilir" />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <TextField fullWidth size="small" type="number" label="Kritik Stok"
                value={criticalStockLevel} onChange={(e) => setCriticalStockLevel(Number(e.target.value))}
                helperText="Acil tedarik gerektirir" />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <TextField fullWidth size="small" type="number" label="Maksimum Stok"
                value={maxStockLevel} onChange={(e) => setMaxStockLevel(Number(e.target.value))}
                helperText="Depo kapasitesi limiti" />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Divider><Chip size="small" label="Başlangıç Stok" /></Divider>
            </Grid>

            <Grid size={{ xs: 6 }}>
              <TextField fullWidth size="small" type="number" label="Başlangıç Miktarı"
                value={currentBalance} onChange={(e) => setCurrentBalance(Number(e.target.value))} />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Depo / Lokasyon</InputLabel>
                <Select value={locationId} label="Depo / Lokasyon" onChange={(e) => setLocationId(e.target.value)}>
                  <MenuItem value="">Varsayılan</MenuItem>
                  {locations.map(({ location: loc, depth }) => (
                    <MenuItem key={loc.id} value={loc.id} sx={{ pl: depth * 2 + 2 }}>{loc.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        )}

        {step === 'group' && (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#F8FAFC', borderLeft: '4px solid #1D4ED8', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#1E3A8A' }}>GRUP / ALT GRUP</Typography>
                <Typography variant="body2" color="text.secondary">
                  Stok kartlarını organize etmek için klasör yapısı oluşturun.
                  <br /><strong>Grup</strong> = Ana kategori (ör. "HVAC Malzemeleri"), <strong>Alt Grup</strong> = Alt kategori (ör. "Filtreler")
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField select fullWidth size="small" label="Tip" value={groupType}
                onChange={(e) => setGroupType(e.target.value as any)}>
                <MenuItem value="StockGroup">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <GroupIcon sx={{ fontSize: 18, color: '#1D4ED8' }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Grup (Ana Kategori)</Typography>
                      <Typography variant="caption" color="text.secondary">En üst seviye, alt grupları barındırır</Typography>
                    </Box>
                  </Stack>
                </MenuItem>
                <MenuItem value="StockSubgroup">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <FolderIcon sx={{ fontSize: 18, color: '#0284C7' }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Alt Grup (Alt Kategori)</Typography>
                      <Typography variant="caption" color="text.secondary">Bir grubun altında, stok kartlarını barındırır</Typography>
                    </Box>
                  </Stack>
                </MenuItem>
              </TextField>
            </Grid>

            {groupType === 'StockSubgroup' && (
              <Grid size={{ xs: 12 }}>
                <FormControl size="small" fullWidth required>
                  <InputLabel>Üst Grup</InputLabel>
                  <Select value={groupParentId} label="Üst Grup" onChange={(e) => setGroupParentId(e.target.value)}>
                    {groupParents.length === 0 && <MenuItem value="" disabled>Önce bir grup oluşturun</MenuItem>}
                    {groupParents.map(({ node }) => (
                      <MenuItem key={node.id} value={node.id}>
                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <GroupIcon sx={{ fontSize: 16, color: '#1D4ED8' }} />
                          <span>{node.name}</span>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth size="small" label="Kod *" value={groupCode}
                onChange={(e) => setGroupCode(e.target.value)} placeholder="HVAC" />
            </Grid>
            <Grid size={{ xs: 12, sm: 8 }}>
              <TextField fullWidth size="small" label="Ad *" value={groupName}
                onChange={(e) => setGroupName(e.target.value)} placeholder="HVAC Sarf Malzemeleri" />
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>İptal</Button>
        {step === 'card' ? (
          <Button variant="contained" onClick={handleCreateCard}
            disabled={submitting || !stockNumber.trim() || !name.trim() || !parentId}
            sx={{ bgcolor: '#059669', '&:hover': { bgcolor: '#047857' } }}>
            {submitting ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Stok Kartı Oluştur'}
          </Button>
        ) : (
          <Button variant="contained" onClick={handleCreateGroup}
            disabled={submitting || !groupCode.trim() || !groupName.trim() || (groupType === 'StockSubgroup' && !groupParentId)}>
            {submitting ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : `${groupType === 'StockGroup' ? 'Grup' : 'Alt Grup'} Oluştur`}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

/* ───── Stock Card Detail Drawer ───── */
function StockCardDrawer({ card, open, onClose, onChanged, locations }: {
  card: StockCard | null; open: boolean; onClose: () => void;
  onChanged: () => void; locations: { location: Location; depth: number }[];
}) {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [movementOpen, setMovementOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({ open: false, msg: '', severity: 'success' });

  // Edit form
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('');
  const [minStockLevel, setMinStockLevel] = useState(0);
  const [barcode, setBarcode] = useState('');
  const [sku, setSku] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Data
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [movementsLoading, setMovementsLoading] = useState(false);
  const [variants, setVariants] = useState<StockVariant[]>([]);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [linkedAssets, setLinkedAssets] = useState<Asset[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(false);

  useEffect(() => {
    if (!card) return;
    setTab(0); setEditMode(false);
    setName(card.name); setCategory(card.category); setUnit(card.unit);
    setMinStockLevel(card.minStockLevel); setBarcode(card.barcode ?? '');
    setSku(card.sku ?? ''); setIsActive(card.isActive);

    // Load movements
    setMovementsLoading(true);
    getStockMovements({ stockCardId: card.id, page: 1, pageSize: 15 })
      .then((r) => setMovements(r.items)).finally(() => setMovementsLoading(false));

    // Load variants
    setVariantsLoading(true);
    getStockVariants(card.id).then(setVariants).finally(() => setVariantsLoading(false));

    // Load linked assets (assets that reference this stock card)
    // Note: The API doesn't have a direct filter, but we search by keyword
    setAssetsLoading(true);
    getAssets({ keyword: card.name, page: 1, pageSize: 5 })
      .then((r) => setLinkedAssets(r.items)).finally(() => setAssetsLoading(false));
  }, [card]);

  const handleSave = async () => {
    if (!card) return;
    setSaving(true);
    try {
      await updateStockCard(card.id, {
        stockNumber: card.stockNumber, name, category, unit, minStockLevel,
        barcode: barcode || undefined, sku: sku || undefined, isActive,
      });
      setEditMode(false); onChanged();
    } finally { setSaving(false); }
  };

  const handleMovementSaved = () => {
    setSnack({ open: true, msg: 'Stok hareketi kaydedildi.', severity: 'success' });
    onChanged();
    if (card) {
      getStockMovements({ stockCardId: card.id, page: 1, pageSize: 15 })
        .then((r) => setMovements(r.items));
    }
  };

  if (!card) return null;

  const isLow = card.minStockLevel > 0 && card.currentBalance <= card.minStockLevel;

  return (
    <>
      <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 600, maxWidth: '95vw' } }}>
        {/* Header */}
        <Box sx={{ px: 3, py: 2, bgcolor: isLow ? '#FEF3C7' : '#ECFDF5', borderBottom: '1px solid #E2E8F0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.5 }}>
                <InventoryIcon sx={{ fontSize: 20, color: isLow ? '#D97706' : '#059669' }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: navy[800] }}>{card.name}</Typography>
              </Stack>
              <Stack direction="row" spacing={0.75}>
                <Chip size="small" label={card.stockNumber} variant="outlined" sx={{ fontFamily: 'monospace', fontWeight: 600 }} />
                <Chip size="small" label={card.category} />
                {isLow && <Chip size="small" icon={<WarningIcon sx={{ fontSize: 14 }} />} label="Düşük Stok" color="warning" />}
              </Stack>
            </Box>
            <IconButton onClick={onClose}><CloseIcon /></IconButton>
          </Box>
        </Box>

        {/* Stock Level + Quick Actions */}
        <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #E2E8F0' }}>
          <StockLevelBar current={card.currentBalance} min={card.minStockLevel} max={card.maxStockLevel} />
          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
            <Button variant="contained" size="small" startIcon={<AddCircleOutline />}
              sx={{ bgcolor: '#059669', '&:hover': { bgcolor: '#047857' } }}
              onClick={() => setMovementOpen(true)}>Stok Girişi</Button>
            <Button variant="contained" size="small" startIcon={<RemoveCircleOutline />}
              sx={{ bgcolor: '#DC2626', '&:hover': { bgcolor: '#B91C1C' } }}
              onClick={() => setMovementOpen(true)}>Stok Çıkışı</Button>
            <Button variant="outlined" size="small" startIcon={<SwapHoriz />}
              onClick={() => setMovementOpen(true)}>Transfer</Button>
          </Stack>
        </Box>

        {/* Tabs */}
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth"
          sx={{ borderBottom: '1px solid #E2E8F0', '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.78rem', minHeight: 40 } }}>
          <Tab label="Kart Bilgileri" />
          <Tab label={`Hareketler (${movements.length})`} />
          <Tab label="İlişkili Varlıklar" />
        </Tabs>

        <Box sx={{ p: 2.5, overflow: 'auto', flex: 1 }}>
          {/* Tab 0: Card Info */}
          {tab === 0 && (
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button size="small" variant={editMode ? 'contained' : 'outlined'}
                  onClick={() => setEditMode((x) => !x)}>
                  {editMode ? 'İptal' : 'Düzenle'}
                </Button>
              </Box>

              {editMode ? (
                <Stack spacing={1.5}>
                  <TextField size="small" label="Stok Kodu" value={card.stockNumber} disabled />
                  <TextField size="small" label="Ad" value={name} onChange={(e) => setName(e.target.value)} />
                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 6 }}>
                      <TextField select fullWidth size="small" label="Kategori" value={category}
                        onChange={(e) => setCategory(e.target.value)}>
                        {STOCK_CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField select fullWidth size="small" label="Birim" value={unit}
                        onChange={(e) => setUnit(e.target.value)}>
                        {STOCK_UNITS.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                      </TextField>
                    </Grid>
                  </Grid>
                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 4 }}>
                      <TextField fullWidth size="small" type="number" label="Min Stok"
                        value={minStockLevel} onChange={(e) => setMinStockLevel(Number(e.target.value))} />
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <TextField fullWidth size="small" label="Barkod" value={barcode}
                        onChange={(e) => setBarcode(e.target.value)} />
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <TextField fullWidth size="small" label="SKU" value={sku}
                        onChange={(e) => setSku(e.target.value)} />
                    </Grid>
                  </Grid>
                  <FormControlLabel control={<Switch size="small" checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)} />} label="Aktif" />
                  <Button variant="contained" onClick={handleSave} disabled={saving} size="small" sx={{ alignSelf: 'flex-start' }}>
                    {saving ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : 'Kaydet'}
                  </Button>
                </Stack>
              ) : (
                <Paper variant="outlined" sx={{ p: 1.5 }}>
                  <Grid container spacing={1.25}>
                    <Grid size={{ xs: 6 }}><Typography variant="caption" color="text.secondary">Stok Kodu</Typography><Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>{card.stockNumber}</Typography></Grid>
                    <Grid size={{ xs: 6 }}><Typography variant="caption" color="text.secondary">Kategori</Typography><Typography variant="body2">{card.category}</Typography></Grid>
                    <Grid size={{ xs: 6 }}><Typography variant="caption" color="text.secondary">Birim</Typography><Typography variant="body2">{card.unit}</Typography></Grid>
                    <Grid size={{ xs: 6 }}><Typography variant="caption" color="text.secondary">Min Stok</Typography><Typography variant="body2">{card.minStockLevel}</Typography></Grid>
                    <Grid size={{ xs: 6 }}><Typography variant="caption" color="text.secondary">Barkod</Typography><Typography variant="body2">{card.barcode || '-'}</Typography></Grid>
                    <Grid size={{ xs: 6 }}><Typography variant="caption" color="text.secondary">SKU</Typography><Typography variant="body2">{card.sku || '-'}</Typography></Grid>
                    <Grid size={{ xs: 6 }}><Typography variant="caption" color="text.secondary">Hiyerarşi</Typography><Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{card.hierarchyPath}</Typography></Grid>
                    <Grid size={{ xs: 6 }}><Typography variant="caption" color="text.secondary">Durum</Typography><Chip size="small" label={card.isActive ? 'Aktif' : 'Pasif'} color={card.isActive ? 'success' : 'default'} /></Grid>
                  </Grid>
                </Paper>
              )}

              {/* Variants */}
              {(card.isVariantBased || variants.length > 0) && (
                <Paper variant="outlined" sx={{ p: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Varyantlar <Chip size="small" label={variants.length} sx={{ ml: 0.5 }} />
                  </Typography>
                  {variantsLoading ? <CircularProgress size={20} /> : variants.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">Varyant yok.</Typography>
                  ) : (
                    <Table size="small">
                      <TableHead><TableRow>
                        <TableCell>Kod</TableCell><TableCell>Ad</TableCell><TableCell align="right">Stok</TableCell>
                      </TableRow></TableHead>
                      <TableBody>
                        {variants.map((v) => (
                          <TableRow key={v.id}><TableCell>{v.code}</TableCell><TableCell>{v.name}</TableCell>
                            <TableCell align="right">{v.currentBalance}</TableCell></TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </Paper>
              )}
            </Stack>
          )}

          {/* Tab 1: Movements */}
          {tab === 1 && (
            <Stack spacing={1}>
              {movementsLoading ? <CircularProgress size={24} /> : movements.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">Henüz stok hareketi yok.</Typography>
                  <Typography variant="caption" color="text.secondary">Stok girişi/çıkışı yaparak ilk hareketi oluşturun.</Typography>
                </Box>
              ) : (
                <Table size="small">
                  <TableHead><TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Tarih</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Tip</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Miktar</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Not</TableCell>
                  </TableRow></TableHead>
                  <TableBody>
                    {movements.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell><Typography variant="caption">{new Date(m.performedAt || m.createdAt).toLocaleString('tr-TR')}</Typography></TableCell>
                        <TableCell>
                          <Chip size="small" label={MOVEMENT_LABELS[m.movementType] ?? m.movementType}
                            sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700,
                              bgcolor: alpha(MOVEMENT_COLORS[m.movementType] ?? '#6B7280', 0.1),
                              color: MOVEMENT_COLORS[m.movementType] ?? '#6B7280' }} />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 700,
                            color: (m.movementType === 0 || m.movementType === 5) ? '#059669' : m.movementType === 1 ? '#DC2626' : '#374151' }}>
                            {(m.movementType === 0 || m.movementType === 5) ? '+' : m.movementType === 1 ? '-' : ''}{m.quantity} {m.unit}
                          </Typography>
                        </TableCell>
                        <TableCell><Typography variant="caption" color="text.secondary">{m.notes || '-'}</Typography></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Stack>
          )}

          {/* Tab 2: Linked Assets */}
          {tab === 2 && (
            <Stack spacing={1.5}>
              <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#F8FAFC' }}>
                <Typography variant="body2" color="text.secondary">
                  Bu malzemeyi kullanan veya bu malzemeye bağlı varlıklar.
                </Typography>
              </Paper>
              {assetsLoading ? <CircularProgress size={24} /> : linkedAssets.length === 0 ? (
                <Box sx={{ py: 3, textAlign: 'center' }}>
                  <DeviceHub sx={{ fontSize: 36, color: '#CBD5E1', mb: 1 }} />
                  <Typography color="text.secondary" variant="body2">İlişkili varlık bulunamadı.</Typography>
                </Box>
              ) : (
                linkedAssets.map((a) => (
                  <Paper key={a.id} variant="outlined" sx={{ p: 1.25, cursor: 'pointer', '&:hover': { bgcolor: '#F8FAFC' } }}
                    onClick={() => navigate(`/assets?selected=${a.id}`)}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <DeviceHub sx={{ fontSize: 18, color: navy[400] }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{a.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{a.assetTag} | {a.locationName}</Typography>
                      </Box>
                      <Chip size="small" label={a.category} variant="outlined" />
                      <ChevronRight sx={{ fontSize: 18, color: '#94A3B8' }} />
                    </Stack>
                  </Paper>
                ))
              )}
            </Stack>
          )}
        </Box>
      </Drawer>

      <StockMovementDialog open={movementOpen} onClose={() => setMovementOpen(false)}
        stockCard={card} onSaved={handleMovementSaved} locations={locations} />

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))} sx={{ width: '100%' }}>{snack.msg}</Alert>
      </Snackbar>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════ */
export default function StockCardsPage() {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const [drawerCard, setDrawerCard] = useState<StockCard | null>(null);

  const { data: stockData, refetch: refetchCards } = useApi<PagedResult<StockCard>>(
    () => getStockCards({ page: 1, pageSize: 1000 }), [],
  );
  const { data: treeData, refetch: refetchTree } = useApi<StockCardTreeNode[]>(
    () => getStockCardTree(), [],
  );
  const { data: locTree } = useApi<Location[]>(getLocationTree, []);
  const flatLocs = useMemo(() => (locTree ? flattenLocations(locTree) : []), [locTree]);

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const allNodes = treeData ?? [];
  const groups = useMemo(() => collectGroups(allNodes), [allNodes]);
  const allCards = useMemo(
    () => (stockData?.items ?? []).filter((c) => normalizeNodeType(c.nodeType) === 'STOCKCARD'),
    [stockData]
  );

  // Filter cards by selected group
  const filteredCards = useMemo(() => {
    let cards = allCards;

    // Filter by selected group
    if (selectedGroupId) {
      const groupNode = findTreeNode(allNodes, selectedGroupId);
      if (groupNode) {
        const cardIds = new Set(collectCardIds(groupNode));
        cards = cards.filter((c) => cardIds.has(c.id));
      }
    }

    // Filter by search
    const q = search.trim().toLowerCase();
    if (q) {
      cards = cards.filter((c) =>
        [c.name, c.stockNumber, c.barcode, c.sku, c.category, c.hierarchyPath]
          .filter(Boolean).join(' ').toLowerCase().includes(q)
      );
    }

    return cards;
  }, [allCards, selectedGroupId, search, allNodes]);

  const lowCount = allCards.filter((c) => c.minStockLevel > 0 && c.currentBalance <= c.minStockLevel).length;

  const refreshAll = async () => {
    await Promise.all([refetchCards(), refetchTree()]);
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };

  const selectedGroupName = useMemo(() => {
    if (!selectedGroupId) return null;
    const find = (nodes: GroupNode[]): string | null => {
      for (const n of nodes) {
        if (n.id === selectedGroupId) return n.name;
        const found = find(n.children);
        if (found) return found;
      }
      return null;
    };
    return find(groups);
  }, [selectedGroupId, groups]);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ color: navy[800], fontWeight: 700 }}>{t('stockCards.title')}</Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8' }}>{t('stockCards.subtitle')}</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
          Yeni Kayıt
        </Button>
      </Box>

      {/* Summary */}
      <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
        <Paper variant="outlined" sx={{ p: 1.25, flex: 1, borderLeft: '4px solid #1E3A8A' }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <AllInbox sx={{ color: '#1E3A8A' }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E3A8A', lineHeight: 1 }}>{allCards.length}</Typography>
              <Typography variant="caption" color="text.secondary">Toplam Kart</Typography>
            </Box>
          </Stack>
        </Paper>
        <Paper variant="outlined" sx={{ p: 1.25, flex: 1, borderLeft: `4px solid ${lowCount > 0 ? '#F59E0B' : '#059669'}` }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <WarningIcon sx={{ color: lowCount > 0 ? '#F59E0B' : '#059669' }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: lowCount > 0 ? '#F59E0B' : '#059669', lineHeight: 1 }}>{lowCount}</Typography>
              <Typography variant="caption" color="text.secondary">Düşük Stok</Typography>
            </Box>
          </Stack>
        </Paper>
        <Paper variant="outlined" sx={{ p: 1.25, flex: 1, borderLeft: '4px solid #0284C7' }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <InventoryIcon sx={{ color: '#0284C7' }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0284C7', lineHeight: 1 }}>{groups.length}</Typography>
              <Typography variant="caption" color="text.secondary">Kategori</Typography>
            </Box>
          </Stack>
        </Paper>
      </Stack>

      <Grid container spacing={2}>
        {/* ── Left: Category Tree ── */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <CardContent sx={{ p: 1.25 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: navy[700], mb: 1 }}>Kategoriler</Typography>

              {/* All cards option */}
              <ListItemButton
                selected={selectedGroupId === null}
                onClick={() => setSelectedGroupId(null)}
                sx={{ borderRadius: 1, mb: 0.5, py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <AllInbox sx={{ fontSize: 18, color: '#1E3A8A' }} />
                </ListItemIcon>
                <ListItemText primary={<Typography variant="body2" sx={{ fontWeight: selectedGroupId === null ? 700 : 500 }}>Tüm Kartlar</Typography>} />
                <Chip size="small" label={allCards.length} sx={{ height: 20, fontSize: '0.65rem' }} />
              </ListItemButton>

              <Divider sx={{ my: 0.75 }} />

              {/* Group tree */}
              <List dense disablePadding>
                {groups.length === 0 && (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Henüz kategori yok.</Typography>
                    <Button size="small" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)} sx={{ mt: 0.5, display: 'block' }}>
                      İlk grubu oluştur
                    </Button>
                  </Box>
                )}
                {groups.map((group) => (
                  <Box key={group.id}>
                    {(() => {
                      const groupOpen =
                        expanded.has(group.id) ||
                        selectedGroupId === group.id ||
                        group.children.some((sub) => sub.id === selectedGroupId);
                      return (
                        <>
                    <ListItemButton
                      selected={selectedGroupId === group.id}
                      onClick={() => {
                        const isSame = group.id === selectedGroupId;
                        const nextSelected = isSame ? null : group.id;
                        setSelectedGroupId(nextSelected);
                        setExpanded((prev) => {
                          const next = new Set(prev);
                          if (isSame) next.delete(group.id);
                          else next.add(group.id);
                          return next;
                        });
                      }}
                      sx={{ borderRadius: 1, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        <GroupIcon sx={{ fontSize: 18, color: '#1D4ED8' }} />
                      </ListItemIcon>
                      <ListItemText primary={
                        <Typography variant="body2" sx={{ fontWeight: selectedGroupId === group.id ? 700 : 500, fontSize: '0.82rem' }}>
                          {group.name}
                        </Typography>
                      } />
                      <Chip size="small" label={group.cardCount} sx={{ height: 18, fontSize: '0.62rem', mr: 0.5 }} />
                      {group.children.length > 0 && (
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); toggleExpand(group.id); }} sx={{ p: 0.25 }}>
                          {expanded.has(group.id) ? <ExpandLess sx={{ fontSize: 16 }} /> : <ExpandMore sx={{ fontSize: 16 }} />}
                        </IconButton>
                      )}
                    </ListItemButton>

                    {/* Subgroups */}
                    {groupOpen && group.children.map((sub) => (
                      <ListItemButton
                        key={sub.id}
                        selected={selectedGroupId === sub.id}
                        onClick={() => {
                          const nextSelected = sub.id === selectedGroupId ? null : sub.id;
                          setSelectedGroupId(nextSelected);
                          if (nextSelected) {
                            setExpanded((prev) => {
                              const next = new Set(prev);
                              next.add(group.id);
                              return next;
                            });
                          }
                        }}
                        sx={{ borderRadius: 1, py: 0.25, pl: 4 }}>
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          {selectedGroupId === sub.id ? <FolderOpen sx={{ fontSize: 16, color: '#0284C7' }} /> : <FolderIcon sx={{ fontSize: 16, color: '#0284C7' }} />}
                        </ListItemIcon>
                        <ListItemText primary={
                          <Typography variant="body2" sx={{ fontWeight: selectedGroupId === sub.id ? 700 : 400, fontSize: '0.78rem' }}>
                            {sub.name}
                          </Typography>
                        } />
                        <Chip size="small" label={sub.cardCount} sx={{ height: 16, fontSize: '0.6rem' }} />
                      </ListItemButton>
                    ))}
                        </>
                      );
                    })()}
                  </Box>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* ── Right: Cards Table ── */}
        <Grid size={{ xs: 12, md: 9 }}>
          <Card sx={{ border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <CardContent sx={{ p: 0 }}>
              {/* Search + context */}
              <Box sx={{ p: 1.5, borderBottom: '1px solid #E2E8F0' }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <TextField size="small" placeholder="Malzeme ara (ad, kod, barkod)..." value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)} sx={{ flex: 1 }} />
                  {selectedGroupName && (
                    <Chip label={selectedGroupName} onDelete={() => setSelectedGroupId(null)}
                      color="primary" variant="outlined" size="small" />
                  )}
                  <Typography variant="body2" color="text.secondary">
                    {filteredCards.length} kart
                  </Typography>
                </Stack>
              </Box>

              {/* Table */}
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Kod</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Malzeme Adı</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Kategori</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Birim</TableCell>
                    <TableCell sx={{ fontWeight: 600, minWidth: 150 }}>Stok Seviyesi</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Mevcut</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Min</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCards.map((card) => {
                    const isLow = card.minStockLevel > 0 && card.currentBalance <= card.minStockLevel;
                    return (
                      <TableRow key={card.id} hover sx={{ cursor: 'pointer' }} onClick={() => setDrawerCard(card)}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace', color: navy[600], fontSize: '0.78rem' }}>
                            {card.stockNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>{card.name}</Typography>
                            <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.68rem' }}>{card.hierarchyPath}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell><Chip size="small" label={card.category} variant="outlined" sx={{ fontSize: '0.7rem' }} /></TableCell>
                        <TableCell><Typography variant="body2">{card.unit}</Typography></TableCell>
                        <TableCell>
                          <StockLevelBar current={card.currentBalance} min={card.minStockLevel} max={card.maxStockLevel} compact />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 700, color: isLow ? '#DC2626' : '#059669' }}>
                            {card.currentBalance}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="text.secondary">{card.minStockLevel}</Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredCards.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6 }}>
                        <InventoryIcon sx={{ fontSize: 40, color: '#CBD5E1', mb: 1 }} />
                        <Typography color="text.secondary">
                          {allCards.length === 0
                            ? 'Henüz stok kartı oluşturulmamış. "Yeni Kayıt" butonuyla başlayın.'
                            : 'Filtre kriterlerine uygun kart bulunamadı.'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Create Dialog */}
      <CreateStockCardDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={refreshAll}
        groups={groups}
        locations={flatLocs}
      />

      {/* Detail Drawer */}
      <StockCardDrawer
        card={drawerCard}
        open={!!drawerCard}
        onClose={() => setDrawerCard(null)}
        onChanged={() => { refreshAll(); if (drawerCard) { getStockCards({ page: 1, pageSize: 1000 }).then((r) => { const updated = r.items.find((c) => c.id === drawerCard.id); if (updated) setDrawerCard(updated); }); } }}
        locations={flatLocs}
      />
    </Box>
  );
}
