import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Chip, Skeleton,
  Accordion, AccordionSummary, AccordionDetails, Table, TableHead,
  TableRow, TableCell, TableBody, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Select, MenuItem, FormControl, InputLabel, IconButton, CircularProgress,
  List, ListItem, ListItemText, ListItemSecondaryAction, Checkbox,
  InputAdornment, Tooltip,
} from '@mui/material';
import { navy } from '../../theme/theme';
import {
  ExpandMore, Add as AddIcon, Build,
  Delete as DeleteIcon,
  UploadFile as UploadFileIcon,
  CheckBoxOutlined, Straighten, Notes, FormatListBulleted,
  EventBusy, Today, CalendarMonth,
  Search as SearchIcon,
  EditOutlined, DoneOutlined, AddCircleOutline,
} from '@mui/icons-material';
import { useApi } from '../../hooks/useApi';
import IconClearFiltersButton from '../../components/common/IconClearFiltersButton';
import {
  getMaintenanceCards, getStockCards, createMaintenanceCard,
  getMaintenancePlans, createMaintenancePlan, getAssets, getMaintenancePlanRuns, updateMaintenancePlan, runMaintenancePlannerNow,
} from '../../api/endpoints';
import { MaintenanceLevelLabels, PriorityLabels } from '../../types';
import { useTranslation } from '../../i18n';
import type { PagedResult, MaintenanceCard, StockCard, MaintenancePlan, MaintenancePlanRun, Asset, PeriodicMaintenanceExecutionResult } from '../../types';

interface CardDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string;
  uploadedAt: string;
}
type ChecklistFieldType = 'measurement' | 'checkbox' | 'freetext' | 'combobox';
interface PlanChecklistItem {
  id: string;
  label: string;
  type: ChecklistFieldType;
  min?: number;
  max?: number;
  options?: string[];
}
interface PlanMaintenanceHistoryEntry {
  id: string;
  planId: string;
  performedAt: string;
  notes?: string;
  checklistAnswers: Record<string, string | number | boolean>;
  recordedAt: string;
}

const buildDefaultChecklistFromCard = (card: MaintenanceCard): PlanChecklistItem[] => {
  const steps = [...(card.steps ?? [])].sort((a, b) => a.stepOrder - b.stepOrder);
  return steps.map((step) => ({
    id: `default-${card.id}-${step.id}`,
    label: step.instruction,
    type: 'checkbox',
  }));
};

const DOCS_STORAGE_KEY = 'fmms.maintenance.cardDocs.v1';
const PLAN_DOCS_STORAGE_KEY = 'fmms.maintenance.planDocs.v1';
const PLAN_CHECKLISTS_STORAGE_KEY = 'fmms.maintenance.planChecklists.v1';
const PLAN_MAINTENANCE_HISTORY_STORAGE_KEY = 'fmms.maintenance.planHistory.v1';

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

const checklistTypeLabels: Record<ChecklistFieldType, string> = {
  checkbox: 'Onay Kutusu',
  measurement: 'Ölçüm Aralığı',
  freetext: 'Serbest Metin',
  combobox: 'Seçim Listesi',
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

const loadAllPlanChecklists = (): Record<string, PlanChecklistItem[]> => {
  try {
    const raw = localStorage.getItem(PLAN_CHECKLISTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveAllPlanChecklists = (checklists: Record<string, PlanChecklistItem[]>) => {
  try {
    localStorage.setItem(PLAN_CHECKLISTS_STORAGE_KEY, JSON.stringify(checklists));
  } catch {
    // ignore quota errors in demo mode
  }
};

const loadAllPlanMaintenanceHistory = (): Record<string, PlanMaintenanceHistoryEntry[]> => {
  try {
    const raw = localStorage.getItem(PLAN_MAINTENANCE_HISTORY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveAllPlanMaintenanceHistory = (history: Record<string, PlanMaintenanceHistoryEntry[]>) => {
  try {
    localStorage.setItem(PLAN_MAINTENANCE_HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch {
    // ignore quota errors in demo mode
  }
};

const formatChecklistAnswer = (item: PlanChecklistItem, value: string | number | boolean | undefined) => {
  if (value === undefined || value === null || value === '') return '-';
  if (item.type === 'checkbox') return value === true ? 'Evet' : 'Hayır';
  return String(value);
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

const previewableDocumentExtensions = new Set(['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'txt']);

const isPreviewableDocument = (doc: CardDocument) => {
  if (doc.type.startsWith('image/')) return true;
  if (doc.type === 'application/pdf' || doc.type === 'text/plain') return true;
  const ext = doc.name.split('.').pop()?.toLowerCase() ?? '';
  return previewableDocumentExtensions.has(ext);
};

const downloadCardDocument = (doc: CardDocument) => {
  const link = document.createElement('a');
  link.href = doc.dataUrl;
  link.download = doc.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
};

const openCardDocument = (doc: CardDocument) => {
  if (!isPreviewableDocument(doc)) {
    downloadCardDocument(doc);
    return;
  }

  const win = window.open(doc.dataUrl, '_blank', 'noopener,noreferrer');
  if (!win) {
    downloadCardDocument(doc);
  }
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
  const [selectedPlanCardId, setSelectedPlanCardId] = useState<string | null>(null);
  const [justCreatedPlanIds, setJustCreatedPlanIds] = useState<string[]>([]);
  const [kpiFilter, setKpiFilter] = useState<'all' | 'due_today' | 'overdue'>('all');
  const [periodicBucketFilter, setPeriodicBucketFilter] = useState<'all' | 'weekly' | 'monthly'>('all');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingChecklistPlanId, setEditingChecklistPlanId] = useState<string | null>(null);
  const [editChecklistLabel, setEditChecklistLabel] = useState('');
  const [editChecklistType, setEditChecklistType] = useState<ChecklistFieldType>('checkbox');
  const [editChecklistMin, setEditChecklistMin] = useState<number | ''>('');
  const [editChecklistMax, setEditChecklistMax] = useState<number | ''>('');
  const [editChecklistOptions, setEditChecklistOptions] = useState('');
  const [editPlanOpen, setEditPlanOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MaintenancePlan | null>(null);
  const [historyDialogPlan, setHistoryDialogPlan] = useState<{ plan: MaintenancePlan; card: MaintenanceCard } | null>(null);
  const [isPlannerRunning, setIsPlannerRunning] = useState(false);
  const [plannerRunMessage, setPlannerRunMessage] = useState<string | null>(null);

  const [cardDocs, setCardDocs] = useState<Record<string, CardDocument[]>>(() => loadAllCardDocs());
  const [, setPlanDocs] = useState<Record<string, CardDocument[]>>(() => loadAllPlanDocs());
  const [planChecklists, setPlanChecklists] = useState<Record<string, PlanChecklistItem[]>>(() => loadAllPlanChecklists());
  const [planMaintenanceHistory, setPlanMaintenanceHistory] = useState<Record<string, PlanMaintenanceHistoryEntry[]>>(() => loadAllPlanMaintenanceHistory());

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

  const updatePlanChecklists = (planIds: string[], next: PlanChecklistItem[]) => {
    if (planIds.length === 0) return;
    setPlanChecklists((prev) => {
      const updated = { ...prev };
      planIds.forEach((planId) => {
        updated[planId] = next;
      });
      saveAllPlanChecklists(updated);
      return updated;
    });
  };

  const getPlanChecklistItems = (planId: string, card: MaintenanceCard): PlanChecklistItem[] =>
    (planChecklists[planId] && planChecklists[planId].length > 0)
      ? planChecklists[planId]
      : buildDefaultChecklistFromCard(card);

  const saveChecklistForPlan = (planId: string, nextItems: PlanChecklistItem[]) => {
    setPlanChecklists((prev) => {
      const updated = { ...prev, [planId]: nextItems };
      saveAllPlanChecklists(updated);
      return updated;
    });
  };

  const startEditingPlanChecklist = (planId: string, card: MaintenanceCard) => {
    setEditingChecklistPlanId(planId);
    setEditChecklistLabel('');
    setEditChecklistType('checkbox');
    setEditChecklistMin('');
    setEditChecklistMax('');
    setEditChecklistOptions('');
    if (!planChecklists[planId] || planChecklists[planId].length === 0) {
      saveChecklistForPlan(planId, buildDefaultChecklistFromCard(card));
    }
  };

  const stopEditingPlanChecklist = () => {
    setEditingChecklistPlanId(null);
    setEditChecklistLabel('');
    setEditChecklistType('checkbox');
    setEditChecklistMin('');
    setEditChecklistMax('');
    setEditChecklistOptions('');
  };

  const savePlanMaintenanceHistoryEntry = (
    planId: string,
    payload: Omit<PlanMaintenanceHistoryEntry, 'id' | 'recordedAt'>,
  ) => {
    setPlanMaintenanceHistory((prev) => {
      const nextEntry: PlanMaintenanceHistoryEntry = {
        ...payload,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        recordedAt: new Date().toISOString(),
      };
      const updated = {
        ...prev,
        [planId]: [nextEntry, ...(prev[planId] ?? [])],
      };
      saveAllPlanMaintenanceHistory(updated);
      return updated;
    });
  };

  const getPlanMaintenanceHistory = (planId: string) =>
    [...(planMaintenanceHistory[planId] ?? [])].sort((a, b) =>
      new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime(),
    );

  const addChecklistItemToPlan = (planId: string, card: MaintenanceCard) => {
    if (!editChecklistLabel.trim()) return;
    const current = getPlanChecklistItems(planId, card);
    const options = editChecklistType === 'combobox'
      ? editChecklistOptions.split(',').map((x) => x.trim()).filter(Boolean)
      : [];
    const nextItem: PlanChecklistItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      label: editChecklistLabel.trim(),
      type: editChecklistType,
      min: editChecklistType === 'measurement' && editChecklistMin !== '' ? Number(editChecklistMin) : undefined,
      max: editChecklistType === 'measurement' && editChecklistMax !== '' ? Number(editChecklistMax) : undefined,
      options: editChecklistType === 'combobox' ? options : undefined,
    };
    saveChecklistForPlan(planId, [...current, nextItem]);
    setEditChecklistLabel('');
    setEditChecklistType('checkbox');
    setEditChecklistMin('');
    setEditChecklistMax('');
    setEditChecklistOptions('');
  };

  const removeChecklistItemFromPlan = (planId: string, card: MaintenanceCard, itemId: string) => {
    const current = getPlanChecklistItems(planId, card);
    saveChecklistForPlan(planId, current.filter((x) => x.id !== itemId));
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

  // Extract unique asset categories
  const assetCategories = useMemo(() => {
    if (!data?.items) return [];
    const cats = Array.from(new Set((data?.items ?? []).map((c) => c.assetCategory).filter(Boolean) as string[]));
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
    const q = searchTerm.trim().toLocaleLowerCase('tr-TR');
    if (q) {
      items = items.filter((c) => {
        const cardText = `${c.name} ${c.assetCategory ?? ''} ${c.description ?? ''}`.toLocaleLowerCase('tr-TR');
        if (cardText.includes(q)) return true;
        const plans = plansData?.items?.filter((p) => p.maintenanceCardId === c.id) ?? [];
        return plans.some((p) => (`${p.name} ${p.assetName}`.toLocaleLowerCase('tr-TR').includes(q)));
      });
    }
    return items;
  }, [data, levelFilter, categoryFilter, searchTerm, plansData?.items]);

  const filteredPeriodicPlans = useMemo(() => {
    let items = plansData?.items ?? [];
    if (periodicBucketFilter === 'weekly') items = items.filter((p) => (p.frequencyDays ?? 0) > 0 && (p.frequencyDays ?? 0) <= 7);
    if (periodicBucketFilter === 'monthly') items = items.filter((p) => (p.frequencyDays ?? 0) > 7 && (p.frequencyDays ?? 0) <= 31);
    if (kpiFilter === 'due_today') {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);
      items = items.filter((p) => p.nextDueAt && new Date(p.nextDueAt) >= startOfToday && new Date(p.nextDueAt) <= endOfToday);
    }
    if (kpiFilter === 'overdue') {
      const now = new Date();
      items = items.filter((p) => p.nextDueAt && new Date(p.nextDueAt) < now);
    }
    if (dateFromFilter) items = items.filter((p) => p.nextDueAt && new Date(p.nextDueAt) >= new Date(`${dateFromFilter}T00:00:00`));
    if (dateToFilter) items = items.filter((p) => p.nextDueAt && new Date(p.nextDueAt) <= new Date(`${dateToFilter}T23:59:59`));
    return items;
  }, [plansData, periodicBucketFilter, kpiFilter, dateFromFilter, dateToFilter]);

  const filteredPlanRuns = useMemo(() => {
    let items = planRunsData?.items ?? [];
    if (dateFromFilter) items = items.filter((r) => new Date(r.triggeredAt) >= new Date(`${dateFromFilter}T00:00:00`));
    if (dateToFilter) items = items.filter((r) => new Date(r.triggeredAt) <= new Date(`${dateToFilter}T23:59:59`));
    return items;
  }, [planRunsData, dateFromFilter, dateToFilter]);

  const plansByCardId = useMemo(() => {
    const map = new Map<string, MaintenancePlan[]>();
    filteredPeriodicPlans.forEach((plan) => {
      if (!map.has(plan.maintenanceCardId)) map.set(plan.maintenanceCardId, []);
      map.get(plan.maintenanceCardId)!.push(plan);
    });
    return map;
  }, [filteredPeriodicPlans]);

  const visibleItems = useMemo(() => {
    if (kpiFilter === 'all') return filteredItems;
    return filteredItems.filter((card) => (plansByCardId.get(card.id)?.length ?? 0) > 0);
  }, [filteredItems, plansByCardId, kpiFilter]);

  const runsByPlanId = useMemo(() => {
    const map = new Map<string, MaintenancePlanRun[]>();
    filteredPlanRuns.forEach((run) => {
      if (!map.has(run.maintenancePlanId)) map.set(run.maintenancePlanId, []);
      map.get(run.maintenancePlanId)!.push(run);
    });
    return map;
  }, [filteredPlanRuns]);

  const dashboardStats = useMemo(() => {
    const allPlans = plansData?.items ?? [];
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const overdueCount = allPlans.filter((plan) => plan.nextDueAt && new Date(plan.nextDueAt) < now).length;
    const dueTodayCount = allPlans.filter((plan) => plan.nextDueAt && new Date(plan.nextDueAt) >= startOfToday && new Date(plan.nextDueAt) <= endOfToday).length;
    const weeklyCount = allPlans.filter((p) => (p.frequencyDays ?? 0) > 0 && (p.frequencyDays ?? 0) <= 7).length;
    const monthlyCount = allPlans.filter((p) => (p.frequencyDays ?? 0) > 7 && (p.frequencyDays ?? 0) <= 31).length;
    return {
      documentCount: data?.items?.length ?? 0,
      planCount: allPlans.length,
      overdueCount,
      dueTodayCount,
      weeklyCount,
      monthlyCount,
    };
  }, [data?.items, plansData?.items, planRunsData?.items]);

  const setQuickRange = (preset: 'thisWeek' | 'thisMonth' | 'overdue' | 'clear') => {
    const now = new Date();
    if (preset === 'clear') {
      setDateFromFilter('');
      setDateToFilter('');
      setPeriodicBucketFilter('all');
      return;
    }
    if (preset === 'overdue') {
      const today = now.toISOString().slice(0, 10);
      setDateToFilter(today);
      setDateFromFilter('');
      return;
    }
    if (preset === 'thisWeek') {
      const start = new Date(now);
      const day = start.getDay();
      const diffToMonday = (day + 6) % 7;
      start.setDate(start.getDate() - diffToMonday);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      setDateFromFilter(start.toISOString().slice(0, 10));
      setDateToFilter(end.toISOString().slice(0, 10));
      return;
    }
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setDateFromFilter(start.toISOString().slice(0, 10));
    setDateToFilter(end.toISOString().slice(0, 10));
  };

  const getPlanVisualState = (plan: MaintenancePlan): { label: string; color: string; bg: string; border: string } => {
    if (!plan.nextDueAt) return { label: 'Planlandı', color: '#475569', bg: '#F1F5F9', border: '#CBD5E1' };
    const dueDate = new Date(plan.nextDueAt);
    const now = new Date();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / oneDayMs);
    if (diffDays < 0) return { label: 'Gecikmiş', color: '#B91C1C', bg: '#FEF2F2', border: '#FCA5A5' };
    if (diffDays <= 2) return { label: 'Yaklaşan', color: '#92400E', bg: '#FFFBEB', border: '#FCD34D' };
    return { label: 'Zamanında', color: '#065F46', bg: '#ECFDF5', border: '#6EE7B7' };
  };

  useEffect(() => {
    if (justCreatedPlanIds.length === 0) return;
    const timer = window.setTimeout(() => setJustCreatedPlanIds([]), 2800);
    return () => window.clearTimeout(timer);
  }, [justCreatedPlanIds]);

  const handleRunPlannerNow = async () => {
    setIsPlannerRunning(true);
    setPlannerRunMessage(null);
    try {
      const result: PeriodicMaintenanceExecutionResult = await runMaintenancePlannerNow();
      setPlannerRunMessage(
        `Planlayıcı tamamlandı: ${result.workOrdersCreated} iş emri oluşturuldu, ${result.blockedByStock} stok engelli, ${result.skippedExistingOpenWorkOrder} açık iş emri nedeniyle atlandı.`
      );
      refetchPlans();
      refetchPlanRuns();
    } catch (error) {
      console.error(error);
      setPlannerRunMessage('Planlayıcı çalıştırılırken hata oluştu.');
    } finally {
      setIsPlannerRunning(false);
    }
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: navy[800], letterSpacing: '-0.02em' }}>
            {t('maintenanceCards.title')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8' }}>
            {t('maintenanceCards.subtitle')}
          </Typography>
          {plannerRunMessage && (
            <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#334155' }}>
              {plannerRunMessage}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button
            variant="outlined"
            onClick={handleRunPlannerNow}
            disabled={isPlannerRunning}
            startIcon={isPlannerRunning ? <CircularProgress size={16} /> : <DoneOutlined />}>
            Planlayıcıyı Çalıştır
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
            {t('maintenanceCards.newCard')}
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          mb: 2,
          p: 2,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 58%, #0EA5E9 100%)',
          color: '#fff',
          overflow: 'hidden',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            right: -70,
            top: -70,
            width: 240,
            height: 240,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.28), rgba(255,255,255,0))',
          },
        }}>
        <Typography variant="subtitle2" sx={{ opacity: 0.88, mb: 1.3, fontWeight: 700 }}>
          Periyodik Bakım Kontrol Merkezi
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 1.2 }}>
          {[
            { label: 'Toplam Plan', value: dashboardStats.planCount, icon: <CalendarMonth fontSize="small" />, hint: `${dashboardStats.weeklyCount} haftalık / ${dashboardStats.monthlyCount} aylık` },
            { label: 'Bugün Vadesi Gelen', value: dashboardStats.dueTodayCount, icon: <Today fontSize="small" />, hint: 'Bugün tetiklenecek planlar' },
            { label: 'Gecikmiş', value: dashboardStats.overdueCount, icon: <EventBusy fontSize="small" />, hint: 'Acil müdahale gerektirir' },
          ].map((kpi, index) => {
            const targetFilter: 'all' | 'due_today' | 'overdue' =
              kpi.label === 'Toplam Plan' ? 'all' : kpi.label === 'Bugün Vadesi Gelen' ? 'due_today' : 'overdue';
            const active = kpiFilter === targetFilter;
            return (
            <Box
              key={kpi.label}
              onClick={() => setKpiFilter(targetFilter)}
              sx={{
                p: 1.3,
                border: '1px solid rgba(255,255,255,0.28)',
                borderRadius: 2,
                bgcolor: active ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.14)',
                backdropFilter: 'blur(2px)',
                animation: `fadeInUp 360ms ease ${index * 70}ms both`,
                cursor: 'pointer',
                boxShadow: active ? '0 0 0 2px rgba(255,255,255,0.34)' : 'none',
                transform: active ? 'translateY(-1px)' : 'none',
                transition: 'all 180ms ease',
                '@keyframes fadeInUp': {
                  from: { opacity: 0, transform: 'translateY(8px)' },
                  to: { opacity: 1, transform: 'translateY(0)' },
                },
              }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.4 }}>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>{kpi.label}</Typography>
                {kpi.icon}
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1 }}>{kpi.value}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.82 }}>{kpi.hint}</Typography>
            </Box>
          );})}
        </Box>
      </Box>

      <Box
        sx={{
          position: 'sticky',
          top: 8,
          zIndex: 5,
          display: 'flex',
          gap: 1,
          flexWrap: 'wrap',
          mb: 1.6,
          p: 1.15,
          border: '1px solid #DBEAFE',
          borderRadius: 2,
          bgcolor: '#EFF6FF',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)',
          alignItems: 'center',
        }}>
        <Typography variant="caption" sx={{ color: '#1E3A8A', fontWeight: 800, mr: 0.2 }}>Filtreler</Typography>
        <Button size="small" variant={periodicBucketFilter === 'all' ? 'contained' : 'outlined'} onClick={() => setPeriodicBucketFilter('all')} sx={{ minWidth: 78 }}>Tümü</Button>
        <Button size="small" variant={periodicBucketFilter === 'weekly' ? 'contained' : 'outlined'} onClick={() => setPeriodicBucketFilter('weekly')} sx={{ minWidth: 78 }}>Haftalık</Button>
        <Button size="small" variant={periodicBucketFilter === 'monthly' ? 'contained' : 'outlined'} onClick={() => setPeriodicBucketFilter('monthly')} sx={{ minWidth: 78 }}>Aylık</Button>
        <TextField
          size="small"
          placeholder="Ara: doküman / plan / envanter"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: { xs: '100%', sm: 240 }, bgcolor: '#fff', borderRadius: 1.5 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <TextField size="small" type="date" label="Başlangıç" InputLabelProps={{ shrink: true }} value={dateFromFilter} onChange={(e) => setDateFromFilter(e.target.value)} sx={{ bgcolor: '#fff', borderRadius: 1.5 }} />
        <TextField size="small" type="date" label="Bitiş" InputLabelProps={{ shrink: true }} value={dateToFilter} onChange={(e) => setDateToFilter(e.target.value)} sx={{ bgcolor: '#fff', borderRadius: 1.5 }} />
        <IconClearFiltersButton
          onClick={() => { setQuickRange('clear'); setKpiFilter('all'); setLevelFilter(null); setCategoryFilter(null); setSearchTerm(''); }}
          disabled={
            periodicBucketFilter === 'all' &&
            !dateFromFilter &&
            !dateToFilter &&
            !searchTerm &&
            kpiFilter === 'all' &&
            levelFilter === null &&
            categoryFilter === null
          }
        />
      </Box>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', mb: 1.4 }}>
        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
          Doküman: {dashboardStats.documentCount}
        </Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Seviye</InputLabel>
          <Select
            value={levelFilter === null ? '' : String(levelFilter)}
            label="Seviye"
            onChange={(e) => setLevelFilter(e.target.value === '' ? null : Number(e.target.value))}>
            <MenuItem value="">Tüm Seviyeler</MenuItem>
            {Object.entries(MaintenanceLevelLabels).map(([k, v]) => (
              <MenuItem key={k} value={k}>{v}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Kategori</InputLabel>
          <Select
            value={categoryFilter ?? ''}
            label="Kategori"
            onChange={(e) => setCategoryFilter(e.target.value === '' ? null : e.target.value)}>
            <MenuItem value="">Tüm Kategoriler</MenuItem>
            {assetCategories.map((cat) => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {visibleItems.length === 0 && (
        <Box
          sx={{
            p: 2.2,
            border: '1px dashed #CBD5E1',
            borderRadius: 2.5,
            bgcolor: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
            mb: 1.2,
          }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: navy[800] }}>Bu filtrelerde bakım dokümanı bulunamadı</Typography>
            <Typography variant="body2" color="text.secondary">Filtreleri temizleyebilir veya yeni bakım dokümanı ekleyebilirsiniz.</Typography>
          </Box>
          <Button size="small" variant="contained" onClick={() => setCreateOpen(true)}>Yeni Doküman</Button>
        </Box>
      )}
      {visibleItems.map((card) => {
        const documentPlans = plansByCardId.get(card.id) ?? [];

        return (
          <Accordion
            key={card.id}
            sx={{
              mb: 1.6,
              borderRadius: '14px !important',
              border: '1px solid #E2E8F0',
              borderLeft: '4px solid #2563EB',
              overflow: 'hidden',
              transition: 'all 220ms ease',
              '&:before': { display: 'none' },
              '&:hover': { boxShadow: '0 10px 24px rgba(15,23,42,0.08)', transform: 'translateY(-1px)' },
            }}>
            <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', pr: 2 }}>
                <Build sx={{ color: navy[600] }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: navy[800] }}>
                    {card.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.assetCategory} | Bakım Dokümanı
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlanCardId(card.id);
                    setCreatePlanOpen(true);
                  }}>
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 2.5, pb: 2.5 }}>
              {card.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {card.description}
                </Typography>
              )}

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: navy[800], mb: 1 }}>
                  {'Bu Dokümana Bağlı Bakım Planları'} ({documentPlans.length})
                </Typography>
                {documentPlans.length === 0 ? (
                  <Box
                    sx={{
                      p: 1.4,
                      borderRadius: 2,
                      border: '1px dashed #CBD5E1',
                      bgcolor: '#F8FAFC',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1,
                    }}>
                    <Typography variant="body2" color="text.secondary">
                      {'Bu bakım dokümanı için henüz plan yok. İlk planı şimdi ekleyin.'}
                    </Typography>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => {
                        setSelectedPlanCardId(card.id);
                        setCreatePlanOpen(true);
                      }}>
                      İlk Planı Ekle
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    {documentPlans.map((plan, index) => {
                      const visual = getPlanVisualState(plan);
                      const planRuns = runsByPlanId.get(plan.id) ?? [];
                      const planHistory = getPlanMaintenanceHistory(plan.id);
                      const planChecklistItems = getPlanChecklistItems(plan.id, card);
                      return (
                        <Accordion
                          key={plan.id}
                          sx={{
                            mb: 1.1,
                            border: `1px solid ${visual.border}`,
                            borderLeft: `4px solid ${visual.color}`,
                            borderRadius: '12px !important',
                            background: visual.bg,
                            boxShadow: justCreatedPlanIds.includes(plan.id) ? '0 0 0 3px rgba(14, 165, 233, 0.25)' : 'none',
                            transition: 'all 240ms ease',
                            animation: `planReveal 380ms ease ${index * 50}ms both`,
                            '@keyframes planReveal': {
                              from: { opacity: 0, transform: 'translateY(6px)' },
                              to: { opacity: 1, transform: 'translateY(0)' },
                            },
                            '&:before': { display: 'none' },
                          }}>
                          <AccordionSummary expandIcon={<ExpandMore />} sx={{ py: 0.2 }}>
                            <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', pr: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>{plan.name}</Typography>
                              <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center' }}>
                                <Chip size="small" label={visual.label} sx={{ bgcolor: visual.bg, color: visual.color, border: `1px solid ${visual.border}` }} />
                                <Tooltip title="Planı Düzenle">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingPlan(plan);
                                      setEditPlanOpen(true);
                                    }}>
                                    <EditOutlined fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Bakım Kaydı Ekle">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setHistoryDialogPlan({ plan, card });
                                    }}>
                                    <Build fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Typography variant="caption" color="text.secondary">
                                  {plan.assetName} | {plan.frequencyDays ? `${plan.frequencyDays} gün` : '-'}
                                </Typography>
                              </Box>
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails>
                            {(() => {
                              const isEditingChecklist = editingChecklistPlanId === plan.id;
                              return (
                                <>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                      {'Checklist Maddeleri'} ({planChecklistItems.length})
                                    </Typography>
                                    <Tooltip title={isEditingChecklist ? 'Düzenleme Bitti' : 'Checklist Düzenle'}>
                                      <IconButton
                                        size="small"
                                        color={isEditingChecklist ? 'primary' : 'default'}
                                        onClick={() => (isEditingChecklist ? stopEditingPlanChecklist() : startEditingPlanChecklist(plan.id, card))}>
                                        {isEditingChecklist ? <DoneOutlined fontSize="small" /> : <EditOutlined fontSize="small" />}
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                  {isEditingChecklist && (
                                    <Box sx={{ mb: 1.3, p: 1.2, border: '1px dashed #CBD5E1', borderRadius: 1.5, bgcolor: '#FFFFFF' }}>
                                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.2fr 0.8fr auto' }, gap: 1, alignItems: 'center' }}>
                                        <TextField
                                          size="small"
                                          label="Yeni madde"
                                          value={editChecklistLabel}
                                          onChange={(e) => setEditChecklistLabel(e.target.value)}
                                        />
                                        <FormControl size="small">
                                          <InputLabel>Tip</InputLabel>
                                          <Select value={editChecklistType} label="Tip" onChange={(e) => setEditChecklistType(e.target.value as ChecklistFieldType)}>
                                            <MenuItem value="checkbox">Onay Kutusu</MenuItem>
                                            <MenuItem value="measurement">Ölçüm Aralığı</MenuItem>
                                            <MenuItem value="freetext">Serbest Metin</MenuItem>
                                            <MenuItem value="combobox">Seçim Listesi</MenuItem>
                                          </Select>
                                        </FormControl>
                                        <Tooltip title="Madde Ekle">
                                          <span>
                                            <IconButton color="primary" onClick={() => addChecklistItemToPlan(plan.id, card)} disabled={!editChecklistLabel.trim()}>
                                              <AddCircleOutline />
                                            </IconButton>
                                          </span>
                                        </Tooltip>
                                      </Box>
                                      {editChecklistType === 'measurement' && (
                                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 1 }}>
                                          <TextField size="small" type="number" label="Min" value={editChecklistMin} onChange={(e) => setEditChecklistMin(e.target.value === '' ? '' : Number(e.target.value))} />
                                          <TextField size="small" type="number" label="Max" value={editChecklistMax} onChange={(e) => setEditChecklistMax(e.target.value === '' ? '' : Number(e.target.value))} />
                                        </Box>
                                      )}
                                      {editChecklistType === 'combobox' && (
                                        <TextField
                                          sx={{ mt: 1 }}
                                          fullWidth
                                          size="small"
                                          label="Seçenekler (virgülle)"
                                          value={editChecklistOptions}
                                          onChange={(e) => setEditChecklistOptions(e.target.value)}
                                        />
                                      )}
                                    </Box>
                                  )}
                                  {planChecklistItems.length > 0 ? (
                                    <Box sx={{ display: 'grid', gap: 1.25, mb: 1.5 }}>
                                      {planChecklistItems.map((item, index) => (
                                        <Box
                                          key={item.id}
                                          sx={{
                                            border: '1px solid #E2E8F0',
                                            borderRadius: 1.75,
                                            p: 1.25,
                                            bgcolor: '#F8FAFC',
                                          }}>
                                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 700, color: navy[800] }}>
                                              {`${index + 1}. ${item.label}`}
                                            </Typography>
                                            <Chip
                                              size="small"
                                              variant="outlined"
                                              label={checklistTypeLabels[item.type]}
                                              icon={
                                                item.type === 'checkbox' ? <CheckBoxOutlined /> :
                                                  item.type === 'measurement' ? <Straighten /> :
                                                    item.type === 'freetext' ? <Notes /> : <FormatListBulleted />
                                              }
                                            />
                                          </Box>
                                          <Box sx={{ mt: 1 }}>
                                            {item.type === 'checkbox' && (
                                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Checkbox disabled size="small" />
                                                <Typography variant="caption" color="text.secondary">Onay kutusu ile işaretlenecek</Typography>
                                              </Box>
                                            )}
                                            {item.type === 'freetext' && (
                                              <TextField size="small" fullWidth disabled placeholder="Teknisyen notu..." />
                                            )}
                                            {item.type === 'measurement' && (
                                              <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Chip size="small" label={`Min: ${item.min ?? '-'}`} />
                                                <Chip size="small" label={`Max: ${item.max ?? '-'}`} />
                                              </Box>
                                            )}
                                            {item.type === 'combobox' && (
                                              <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                                                {(item.options && item.options.length > 0 ? item.options : ['Seçenek yok']).map((option) => (
                                                  <Chip key={option} size="small" label={option} variant="outlined" />
                                                ))}
                                              </Box>
                                            )}
                                            {isEditingChecklist && (
                                              <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                                                <Tooltip title="Maddeyi Kaldır">
                                                  <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => removeChecklistItemFromPlan(plan.id, card, item.id)}>
                                                    <DeleteIcon fontSize="small" />
                                                  </IconButton>
                                                </Tooltip>
                                              </Box>
                                            )}
                                          </Box>
                                        </Box>
                                      ))}
                                    </Box>
                                  ) : (
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                                      {'Bu plana tanımlı checklist maddesi yok.'}
                                    </Typography>
                                  )}
                                </>
                              );
                            })()}

                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                              {'Bakım Geçmişi'} ({planHistory.length})
                            </Typography>
                            {planHistory.length === 0 ? (
                              <Typography variant="body2" color="text.secondary">
                                {'Bu plana ait bakım kaydı yok.'}
                              </Typography>
                            ) : (
                              <Box sx={{ display: 'grid', gap: 1 }}>
                                {planHistory.map((entry) => (
                                  <Box key={entry.id} sx={{ border: '1px solid #E2E8F0', borderRadius: 1.5, p: 1.25, bgcolor: '#fff' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8, gap: 1 }}>
                                      <Typography variant="body2" sx={{ fontWeight: 700, color: navy[800] }}>
                                        {new Date(entry.performedAt).toLocaleString('tr-TR')}
                                      </Typography>
                                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                                        Kayıt: {new Date(entry.recordedAt).toLocaleString('tr-TR')}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: 'grid', gap: 0.5 }}>
                                      {planChecklistItems.map((item) => (
                                        <Box key={`${entry.id}-${item.id}`} sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                                          <Typography variant="caption" sx={{ color: '#475569' }}>{item.label}</Typography>
                                          <Typography variant="caption" sx={{ fontWeight: 700, color: navy[800] }}>
                                            {formatChecklistAnswer(item, entry.checklistAnswers[item.id])}
                                          </Typography>
                                        </Box>
                                      ))}
                                    </Box>
                                    {entry.notes && (
                                      <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#334155' }}>
                                        Not: {entry.notes}
                                      </Typography>
                                    )}
                                  </Box>
                                ))}
                              </Box>
                            )}
                            <Typography variant="caption" sx={{ display: 'block', mt: 1.1, mb: 0.4, color: '#64748B', fontWeight: 700 }}>
                              Plan Tetikleme Kayıtları ({planRuns.length})
                            </Typography>
                            {planRuns.length > 0 && (
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Durum</TableCell>
                                    <TableCell>Tarih</TableCell>
                                    <TableCell>Neden</TableCell>
                                    <TableCell>İş Emri</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {planRuns.slice(0, 5).map((run) => (
                                    <TableRow key={run.id}>
                                      <TableCell>{runStatusLabels[run.status] ?? '-'}</TableCell>
                                      <TableCell>{new Date(run.triggeredAt).toLocaleString('tr-TR')}</TableCell>
                                      <TableCell>{run.triggerReason || '-'}</TableCell>
                                      <TableCell>
                                        {run.workOrderId ? (
                                          <Button
                                            size="small"
                                            variant="text"
                                            onClick={() => navigate(`/work-orders/${run.workOrderId}`)}>
                                            {run.workOrderId.slice(0, 8)}
                                          </Button>
                                        ) : '-'}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            )}
                          </AccordionDetails>
                        </Accordion>
                      );
                    })}
                  </Box>
                )}
              </Box>

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
                          <Button size="small" onClick={() => openCardDocument(doc)}>{'A\u00E7'}</Button>
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
        onClose={() => { setCreatePlanOpen(false); setSelectedPlanCardId(null); }}
        onCreated={(newPlanIds, docs, checklistItems) => {
          if (docs.length > 0) newPlanIds.forEach((planId) => updatePlanDocs(planId, docs));
          if (checklistItems.length > 0) updatePlanChecklists(newPlanIds, checklistItems);
          setJustCreatedPlanIds(newPlanIds);
          setCreatePlanOpen(false);
          setSelectedPlanCardId(null);
          refetchPlans();
          refetchPlanRuns();
        }}
        cards={data?.items ?? []}
        assets={assetsData?.items ?? []}
        stockCards={(stockData?.items ?? []).filter((x) => x.nodeType === 'STOCKCARD')}
        preselectedCardId={selectedPlanCardId}
      />
      <AddMaintenanceHistoryDialog
        open={!!historyDialogPlan}
        plan={historyDialogPlan?.plan ?? null}
        checklistItems={historyDialogPlan ? getPlanChecklistItems(historyDialogPlan.plan.id, historyDialogPlan.card) : []}
        onClose={() => setHistoryDialogPlan(null)}
        onSaved={(payload) => {
          savePlanMaintenanceHistoryEntry(payload.planId, payload);
          setHistoryDialogPlan(null);
        }}
      />
      <UpdateMaintenancePlanDialog
        open={editPlanOpen}
        plan={editingPlan}
        onClose={() => { setEditPlanOpen(false); setEditingPlan(null); }}
        onUpdated={() => {
          setEditPlanOpen(false);
          setEditingPlan(null);
          refetchPlans();
        }}
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
  const [pendingDocs, setPendingDocs] = useState<CardDocument[]>([]);
  const docInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);

  const categoryOptions = ['HVAC - AHU', 'HVAC - Chiller', 'HVAC - Fan Coil', 'Asansor', 'Elektrik'];

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
        steps: [],
        materials: [],
      });
      onCreated(newCardId, pendingDocs);
      // reset
      setName(''); setAssetCategory(''); setDescription(''); setLevel(0);
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
      <DialogTitle sx={{ color: navy[800], fontWeight: 700 }}>{'Yeni Bakım Dokümanı'}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
        <TextField label={'Bakım Dokümanı Adı *'} size="small" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
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
        <Typography variant="caption" sx={{ color: '#64748B' }}>
          {'Checklist maddeleri bakım planı içinde yönetilir.'}
        </Typography>
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
  open, onClose, onCreated, cards, assets, stockCards, preselectedCardId,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (newPlanIds: string[], docs: CardDocument[], checklistItems: PlanChecklistItem[]) => void;
  cards: MaintenanceCard[];
  assets: Asset[];
  stockCards: StockCard[];
  preselectedCardId?: string | null;
}) {
  const [name, setName] = useState('');
  const [maintenanceCardId, setMaintenanceCardId] = useState('');
  const [stockCardIds, setStockCardIds] = useState<string[]>([]);
  const [assetIds, setAssetIds] = useState<string[]>([]);
  const [stockCardModes, setStockCardModes] = useState<Record<string, 'all' | 'specific'>>({});
  const [expandedStockCardId, setExpandedStockCardId] = useState<string | null>(null);
  const [stockAssetSearch, setStockAssetSearch] = useState('');
  const [firstDueAt, setFirstDueAt] = useState('');
  const [frequencyDays, setFrequencyDays] = useState<number | ''>('');
  const [priority, setPriority] = useState<number>(1);
  const [pendingDocs, setPendingDocs] = useState<CardDocument[]>([]);
  const [checklistItems, setChecklistItems] = useState<PlanChecklistItem[]>([]);
  const [checklistLabel, setChecklistLabel] = useState('');
  const [checklistType, setChecklistType] = useState<ChecklistFieldType>('checkbox');
  const [checklistMin, setChecklistMin] = useState<number | ''>('');
  const [checklistMax, setChecklistMax] = useState<number | ''>('');
  const [checklistOptions, setChecklistOptions] = useState('');
  const [validationError, setValidationError] = useState('');
  const docInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    if (open && preselectedCardId) {
      setMaintenanceCardId(preselectedCardId);
    }
  }, [open, preselectedCardId]);
  useEffect(() => {
    if (open) return;
    setName('');
    setMaintenanceCardId('');
    setAssetIds([]);
    setStockCardIds([]);
    setStockCardModes({});
    setExpandedStockCardId(null);
    setStockAssetSearch('');
    setFirstDueAt('');
    setFrequencyDays('');
    setPriority(1);
    setPendingDocs([]);
    setChecklistItems([]);
    setChecklistLabel('');
    setChecklistType('checkbox');
    setChecklistMin('');
    setChecklistMax('');
    setChecklistOptions('');
    setValidationError('');
  }, [open]);

  const assetsByStockCardId = useMemo(() => {
    const map = new Map<string, Asset[]>();
    assets.forEach((asset) => {
      const linkedStockCardId = asset.stockCardId ?? asset.itemId;
      if (!linkedStockCardId) return;
      if (!map.has(linkedStockCardId)) map.set(linkedStockCardId, []);
      map.get(linkedStockCardId)!.push(asset);
    });
    return map;
  }, [assets]);

  const normalizedStockAssetSearch = stockAssetSearch.trim().toLocaleLowerCase('tr-TR');
  const filteredStockCardsForPicker = useMemo(() => {
    if (!normalizedStockAssetSearch) return stockCards;
    return stockCards.filter((stockCard) => {
      const cardText = `${stockCard.stockNumber} ${stockCard.name}`.toLocaleLowerCase('tr-TR');
      if (cardText.includes(normalizedStockAssetSearch)) return true;
      const relatedAssets = assetsByStockCardId.get(stockCard.id) ?? [];
      return relatedAssets.some((asset) =>
        `${asset.assetNumber} ${asset.serialNumber ?? ''} ${asset.name}`.toLocaleLowerCase('tr-TR').includes(normalizedStockAssetSearch)
      );
    });
  }, [stockCards, normalizedStockAssetSearch, assetsByStockCardId]);

  const handleCreate = async () => {
    setValidationError('');
    if (!name.trim()) {
      setValidationError('Plan adı zorunludur.');
      return;
    }
    if (!maintenanceCardId) {
      setValidationError('Bakım dokümanı seçimi zorunludur.');
      return;
    }
    if (!firstDueAt) {
      setValidationError('İlk bakım tarihi zorunludur.');
      return;
    }
    if (frequencyDays === '' || Number(frequencyDays) <= 0) {
      setValidationError('Periyot (gün) 0’dan büyük olmalıdır.');
      return;
    }
    if (stockCardIds.length === 0) {
      setValidationError('En az 1 stok kartı seçmelisiniz.');
      return;
    }
    setSubmitting(true);
    try {
      const targetAssetIds = Array.from(new Set(stockCardIds.flatMap((stockCardId) => {
        const mode = stockCardModes[stockCardId] ?? 'all';
        const stockAssets = assetsByStockCardId.get(stockCardId) ?? [];
        if (mode === 'all') return stockAssets.map((asset) => asset.id);
        const stockAssetIdSet = new Set(stockAssets.map((asset) => asset.id));
        return assetIds.filter((assetId) => stockAssetIdSet.has(assetId));
      })));
      if (targetAssetIds.length === 0) throw new Error('No related inventory selected');

      const createdPlanIds: string[] = [];
      for (const targetAssetId of targetAssetIds) {
        const createdId = await createMaintenancePlan({
          name,
          maintenanceCardId,
          assetId: targetAssetId,
          triggerType: 0,
          firstDueAt: new Date(`${firstDueAt}T00:00:00`).toISOString(),
          frequencyDays: Number(frequencyDays),
          meterInterval: undefined,
          initialMeterReading: 0,
          priority,
          isActive: true,
        });
        createdPlanIds.push(createdId);
      }
      onCreated(createdPlanIds, pendingDocs, checklistItems);
      setName('');
      setMaintenanceCardId('');
      setAssetIds([]);
      setStockCardIds([]);
      setStockCardModes({});
      setExpandedStockCardId(null);
      setStockAssetSearch('');
      setFirstDueAt('');
      setFrequencyDays('');
      setPriority(1);
      setPendingDocs([]);
      setChecklistItems([]);
      setChecklistLabel('');
      setChecklistType('checkbox');
      setChecklistMin('');
      setChecklistMax('');
      setChecklistOptions('');
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

  const addChecklistItem = () => {
    if (!checklistLabel.trim()) return;
    const options = checklistType === 'combobox'
      ? checklistOptions.split(',').map((x) => x.trim()).filter(Boolean)
      : [];
    const next: PlanChecklistItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      label: checklistLabel.trim(),
      type: checklistType,
      min: checklistType === 'measurement' && checklistMin !== '' ? Number(checklistMin) : undefined,
      max: checklistType === 'measurement' && checklistMax !== '' ? Number(checklistMax) : undefined,
      options: checklistType === 'combobox' ? options : undefined,
    };
    setChecklistItems((prev) => [...prev, next]);
    setChecklistLabel('');
    setChecklistType('checkbox');
    setChecklistMin('');
    setChecklistMax('');
    setChecklistOptions('');
  };

  const removeChecklistItem = (itemId: string) => {
    setChecklistItems((prev) => prev.filter((x) => x.id !== itemId));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: navy[800], fontWeight: 700 }}>Yeni Periyodik Plan</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
        <TextField label={'Plan Ad\u0131 *'} size="small" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
        <FormControl size="small" fullWidth>
          <InputLabel>{'Bak\u0131m Dok\u00FCman\u0131 *'}</InputLabel>
          <Select
            value={maintenanceCardId}
            label={'Bak\u0131m Dok\u00FCman\u0131 *'}
            onChange={(e) => setMaintenanceCardId(e.target.value)}
            disabled={!!preselectedCardId}>
            {cards.map((card) => (
              <MenuItem key={card.id} value={card.id}>{card.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ border: '1px solid #E2E8F0', borderRadius: 1.5, p: 1.25 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: navy[800], mb: 1 }}>
            İlişkili Stok Kartı ve Envanter Seçimi (1..N) *
          </Typography>
          <TextField
            size="small"
            fullWidth
            placeholder="Stok kartı / envanter ara..."
            value={stockAssetSearch}
            onChange={(e) => setStockAssetSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 1 }}
          />
          <Box sx={{ maxHeight: 260, overflow: 'auto', border: '1px solid #E2E8F0', borderRadius: 1.2, bgcolor: '#fff' }}>
            {filteredStockCardsForPicker.map((stockCard) => {
              const isSelected = stockCardIds.includes(stockCard.id);
              const mode = stockCardModes[stockCard.id] ?? 'all';
              const cardAssets = assetsByStockCardId.get(stockCard.id) ?? [];
              const selectedCountInCard = cardAssets.filter((asset) => assetIds.includes(asset.id)).length;
              return (
                <Box key={stockCard.id} sx={{ borderBottom: '1px solid #F1F5F9', '&:last-of-type': { borderBottom: 'none' } }}>
                  <Box
                    sx={{ px: 1.2, py: 0.9, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, cursor: 'pointer' }}
                    onClick={() => setExpandedStockCardId((prev) => (prev === stockCard.id ? null : stockCard.id))}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Checkbox
                        size="small"
                        checked={isSelected}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          const nextSelected = e.target.checked;
                          setStockCardIds((prev) => nextSelected ? [...prev, stockCard.id] : prev.filter((id) => id !== stockCard.id));
                          if (nextSelected) {
                            setStockCardModes((prev) => ({ ...prev, [stockCard.id]: prev[stockCard.id] ?? 'all' }));
                          } else {
                            setStockCardModes((prev) => {
                              const next = { ...prev };
                              delete next[stockCard.id];
                              return next;
                            });
                            setAssetIds((prev) => prev.filter((assetId) => {
                              const linkedAsset = assets.find((x) => x.id === assetId);
                              return (linkedAsset?.stockCardId ?? linkedAsset?.itemId) !== stockCard.id;
                            }));
                          }
                        }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {stockCard.stockNumber} - {stockCard.name}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      {cardAssets.length} envanter
                    </Typography>
                  </Box>
                  {isSelected && expandedStockCardId === stockCard.id && (
                    <Box sx={{ px: 1.2, pb: 1.1, pt: 0.2, bgcolor: '#F8FAFC' }}>
                      <Box sx={{ display: 'flex', gap: 0.8, mb: 0.8 }}>
                        <Button
                          size="small"
                          variant={mode === 'all' ? 'contained' : 'outlined'}
                          onClick={() => setStockCardModes((prev) => ({ ...prev, [stockCard.id]: 'all' }))}>
                          Tümü
                        </Button>
                        <Button
                          size="small"
                          variant={mode === 'specific' ? 'contained' : 'outlined'}
                          onClick={() => setStockCardModes((prev) => ({ ...prev, [stockCard.id]: 'specific' }))}>
                          Tek Tek
                        </Button>
                        <Typography variant="caption" sx={{ alignSelf: 'center', color: '#64748B' }}>
                          {mode === 'all' ? 'Tüm envanterler dahil' : `${selectedCountInCard} seçili`}
                        </Typography>
                      </Box>
                      {mode === 'specific' && (
                        <Box sx={{ display: 'grid', gap: 0.4, maxHeight: 130, overflow: 'auto', pr: 0.4 }}>
                          {cardAssets.map((asset) => (
                            <Box key={asset.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                              <Checkbox
                                size="small"
                                checked={assetIds.includes(asset.id)}
                                onChange={(e) => {
                                  setAssetIds((prev) => e.target.checked ? [...prev, asset.id] : prev.filter((id) => id !== asset.id));
                                }}
                              />
                              <Typography variant="caption" sx={{ color: '#334155' }}>
                                {asset.assetNumber}{asset.serialNumber ? ` / ${asset.serialNumber}` : ''} - {asset.name}
                              </Typography>
                            </Box>
                          ))}
                          {cardAssets.length === 0 && (
                            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                              Bu stok kartı altında envanter yok.
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              );
            })}
            {filteredStockCardsForPicker.length === 0 && (
              <Typography variant="caption" sx={{ display: 'block', p: 1.2, color: '#94A3B8' }}>
                Aramaya uygun stok kartı / envanter bulunamadı.
              </Typography>
            )}
          </Box>
        </Box>
        <TextField
          label={'\u0130lk Bak\u0131m Tarihi *'}
          size="small"
          fullWidth
          type="date"
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
        <Box sx={{ border: '1px solid #E2E8F0', borderRadius: 1.5, p: 1.25 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: navy[800], mb: 1 }}>
            Checklist Maddeleri ({checklistItems.length})
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.2fr 0.8fr' }, gap: 1 }}>
            <TextField
              label="Checklist Maddesi"
              size="small"
              value={checklistLabel}
              onChange={(e) => setChecklistLabel(e.target.value)}
            />
            <FormControl size="small" fullWidth>
              <InputLabel>Tip</InputLabel>
              <Select value={checklistType} label="Tip" onChange={(e) => setChecklistType(e.target.value as ChecklistFieldType)}>
                <MenuItem value="checkbox">Onay Kutusu</MenuItem>
                <MenuItem value="measurement">Ölçüm Aralığı (min/max)</MenuItem>
                <MenuItem value="freetext">Serbest Metin</MenuItem>
                <MenuItem value="combobox">Seçim Listesi</MenuItem>
              </Select>
            </FormControl>
          </Box>
          {checklistType === 'measurement' && (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 1 }}>
              <TextField label="Min" size="small" type="number" value={checklistMin} onChange={(e) => setChecklistMin(e.target.value === '' ? '' : Number(e.target.value))} />
              <TextField label="Max" size="small" type="number" value={checklistMax} onChange={(e) => setChecklistMax(e.target.value === '' ? '' : Number(e.target.value))} />
            </Box>
          )}
          {checklistType === 'combobox' && (
            <TextField
              sx={{ mt: 1 }}
              label="Seçenekler (virgülle)"
              size="small"
              fullWidth
              value={checklistOptions}
              onChange={(e) => setChecklistOptions(e.target.value)}
            />
          )}
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <Button size="small" variant="outlined" onClick={addChecklistItem}>Madde Ekle</Button>
          </Box>
          {checklistItems.length > 0 && (
            <List dense disablePadding sx={{ border: '1px solid #E2E8F0', borderRadius: 1.5, mt: 1 }}>
              {checklistItems.map((item, idx) => (
                <ListItem key={item.id} divider={idx < checklistItems.length - 1}>
                  <ListItemText
                    primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{item.label}</Typography>}
                    secondary={
                      <Typography variant="caption">
                        {checklistTypeLabels[item.type]}
                        {item.type === 'measurement' ? ` | min:${item.min ?? '-'} max:${item.max ?? '-'}` : ''}
                        {item.type === 'combobox' ? ` | ${(item.options ?? []).join(', ')}` : ''}
                      </Typography>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" size="small" onClick={() => removeChecklistItem(item.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
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
        {validationError && (
          <Typography variant="caption" sx={{ color: '#DC2626', fontWeight: 600 }}>
            {validationError}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" onClick={onClose}>{'\u0130ptal'}</Button>
        <Button variant="contained" disabled={submitting} onClick={handleCreate}>
          {submitting ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Olu\u015Ftur'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function UpdateMaintenancePlanDialog({
  open, plan, onClose, onUpdated,
}: {
  open: boolean;
  plan: MaintenancePlan | null;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [name, setName] = useState('');
  const [firstDueAt, setFirstDueAt] = useState('');
  const [frequencyDays, setFrequencyDays] = useState<number | ''>('');
  const [priority, setPriority] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !plan) return;
    setName(plan.name);
    setFirstDueAt(plan.nextDueAt ? new Date(plan.nextDueAt).toISOString().slice(0, 10) : '');
    setFrequencyDays(plan.frequencyDays ?? '');
    setPriority(plan.priority);
    setIsActive(plan.isActive);
    setError('');
  }, [open, plan]);

  const handleSave = async () => {
    if (!plan) return;
    setError('');
    if (!name.trim()) { setError('Plan adı zorunludur.'); return; }
    if (!firstDueAt) { setError('İlk bakım tarihi zorunludur.'); return; }
    if (frequencyDays === '' || Number(frequencyDays) <= 0) { setError('Periyot (gün) 0’dan büyük olmalıdır.'); return; }

    setSubmitting(true);
    try {
      await updateMaintenancePlan(plan.id, {
        name: name.trim(),
        firstDueAt: new Date(`${firstDueAt}T00:00:00`).toISOString(),
        frequencyDays: Number(frequencyDays),
        priority,
        isActive,
      });
      onUpdated();
    } catch (e) {
      console.error(e);
      setError('Plan güncellenirken hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ color: navy[800], fontWeight: 700 }}>Planı Düzenle</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: '8px !important' }}>
        <TextField label="Plan Adı *" size="small" value={name} onChange={(e) => setName(e.target.value)} />
        <TextField label="İlk Bakım Tarihi *" size="small" type="date" InputLabelProps={{ shrink: true }} value={firstDueAt} onChange={(e) => setFirstDueAt(e.target.value)} />
        <TextField label="Periyot (Gün) *" size="small" type="number" value={frequencyDays} onChange={(e) => setFrequencyDays(e.target.value === '' ? '' : Number(e.target.value))} />
        <FormControl size="small" fullWidth>
          <InputLabel>Öncelik</InputLabel>
          <Select value={priority} label="Öncelik" onChange={(e) => setPriority(Number(e.target.value))}>
            {Object.entries(PriorityLabels).map(([k, v]) => (
              <MenuItem key={k} value={Number(k)}>{v}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" fullWidth>
          <InputLabel>Durum</InputLabel>
          <Select value={isActive ? 'active' : 'passive'} label="Durum" onChange={(e) => setIsActive(e.target.value === 'active')}>
            <MenuItem value="active">Aktif</MenuItem>
            <MenuItem value="passive">Pasif</MenuItem>
          </Select>
        </FormControl>
        {error && <Typography variant="caption" sx={{ color: '#DC2626', fontWeight: 600 }}>{error}</Typography>}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" onClick={onClose}>İptal</Button>
        <Button variant="contained" onClick={handleSave} disabled={submitting}>
          {submitting ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Kaydet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function AddMaintenanceHistoryDialog({
  open, plan, checklistItems, onClose, onSaved,
}: {
  open: boolean;
  plan: MaintenancePlan | null;
  checklistItems: PlanChecklistItem[];
  onClose: () => void;
  onSaved: (entry: Omit<PlanMaintenanceHistoryEntry, 'id' | 'recordedAt'>) => void;
}) {
  const [performedAt, setPerformedAt] = useState('');
  const [notes, setNotes] = useState('');
  const [answers, setAnswers] = useState<Record<string, string | number | boolean>>({});

  useEffect(() => {
    if (!open) return;
    const now = new Date();
    now.setSeconds(0, 0);
    setPerformedAt(now.toISOString().slice(0, 16));
    setNotes('');
    setAnswers({});
  }, [open, plan?.id]);

  if (!plan) return null;

  const setAnswer = (itemId: string, value: string | number | boolean) => {
    setAnswers((prev) => ({ ...prev, [itemId]: value }));
  };

  const handleSave = () => {
    if (!performedAt) return;
    onSaved({
      planId: plan.id,
      performedAt: new Date(performedAt).toISOString(),
      notes: notes.trim() || undefined,
      checklistAnswers: answers,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: navy[800], fontWeight: 700 }}>Bakım Geçmişi Kaydı Ekle</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, pt: '8px !important' }}>
        <Typography variant="body2" sx={{ color: '#334155', fontWeight: 600 }}>
          {plan.name}
        </Typography>
        <TextField
          label="Bakım Tarihi/Saati *"
          size="small"
          type="datetime-local"
          InputLabelProps={{ shrink: true }}
          value={performedAt}
          onChange={(e) => setPerformedAt(e.target.value)}
        />
        {checklistItems.length > 0 ? (
          <Box sx={{ border: '1px solid #E2E8F0', borderRadius: 1.5, p: 1.1, bgcolor: '#F8FAFC', display: 'grid', gap: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: navy[800] }}>
              Checklist Cevapları
            </Typography>
            {checklistItems.map((item) => (
              <Box key={item.id} sx={{ border: '1px solid #E2E8F0', borderRadius: 1.2, p: 1, bgcolor: '#fff' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.8 }}>{item.label}</Typography>
                {item.type === 'checkbox' && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Checkbox
                      checked={Boolean(answers[item.id])}
                      onChange={(e) => setAnswer(item.id, e.target.checked)}
                      size="small"
                    />
                    <Typography variant="caption" sx={{ color: '#64748B' }}>Tamamlandı</Typography>
                  </Box>
                )}
                {item.type === 'measurement' && (
                  <TextField
                    size="small"
                    type="number"
                    fullWidth
                    placeholder={`${item.min ?? '-'} - ${item.max ?? '-'} aralığı`}
                    value={answers[item.id] ?? ''}
                    onChange={(e) => setAnswer(item.id, e.target.value === '' ? '' : Number(e.target.value))}
                  />
                )}
                {item.type === 'freetext' && (
                  <TextField
                    size="small"
                    multiline
                    minRows={2}
                    fullWidth
                    placeholder="Açıklama girin..."
                    value={String(answers[item.id] ?? '')}
                    onChange={(e) => setAnswer(item.id, e.target.value)}
                  />
                )}
                {item.type === 'combobox' && (
                  <FormControl size="small" fullWidth>
                    <InputLabel>Seçim</InputLabel>
                    <Select
                      value={String(answers[item.id] ?? '')}
                      label="Seçim"
                      onChange={(e) => setAnswer(item.id, e.target.value)}>
                      <MenuItem value="">Seçiniz</MenuItem>
                      {(item.options ?? []).map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="caption" sx={{ color: '#64748B' }}>
            Bu planda checklist maddesi yok; yine de bakım notu kaydedebilirsiniz.
          </Typography>
        )}
        <TextField
          label="Özel Not"
          size="small"
          fullWidth
          multiline
          minRows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" onClick={onClose}>İptal</Button>
        <Button variant="contained" onClick={handleSave} disabled={!performedAt}>Kaydet</Button>
      </DialogActions>
    </Dialog>
  );
}








