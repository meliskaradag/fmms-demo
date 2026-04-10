import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Drawer,
  Grid,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material';
import {
  Add,
  Close,
  DeleteOutline,
  DragIndicator,
  Engineering as WOIcon,
  WarningAmber as AlertIcon,
  DeviceHub as AssetIcon,
  Inventory2 as StockIcon,
  Refresh,
  Settings,
  QueryStats,
  Place,
  Inventory,
  Handyman,
  Group,
  Timeline,
  OpenInNew,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from '../../i18n';
import { useApi } from '../../hooks/useApi';
import { getDashboard, getLocationTree, getMaintenancePlans } from '../../api/endpoints';
import { navy } from '../../theme/theme';
import type { DashboardData, Location as LocationNode, MaintenancePlan, PagedResult } from '../../types';
import type { RootState } from '../../store/store';

type WidgetType =
  | 'kpis'
  | 'status'
  | 'priority'
  | 'recent'
  | 'summary'
  | 'criticalEvents'
  | 'assetHealth'
  | 'locationHotspots'
  | 'stockConsumption'
  | 'maintenanceMix'
  | 'technicians'
  | 'aging'
  | 'periodicMaintenance';

interface WidgetInstance {
  id: string;
  type: WidgetType;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PaletteItem {
  type: WidgetType;
  title: { tr: string; en: string };
  defaultWidth: number;
  defaultHeight: number;
  route: string;
  icon: React.ReactNode;
}

const GRID = 8;
const MIN_W = 280;
const MIN_H = 220;

const STATUS_COLORS: Record<string, string> = {
  Open: '#1976D2',
  Assigned: '#7E57C2',
  InProgress: '#FB8C00',
  OnHold: '#546E7A',
  Completed: '#43A047',
  Cancelled: '#E53935',
};

const PRIORITY_COLORS: Record<string, string> = {
  Low: '#43A047',
  Medium: '#1E88E5',
  High: '#FB8C00',
  Critical: '#E53935',
};

const CHART_PRIMARY = '#1E88E5';
const CHART_MUTED = '#90A4AE';
const STATUS_TO_CODE: Record<string, number> = {
  Open: 0,
  Assigned: 1,
  InProgress: 2,
  OnHold: 3,
  Completed: 4,
  Cancelled: 5,
};
const PRIORITY_TO_CODE: Record<string, number> = {
  Low: 0,
  Medium: 1,
  High: 2,
  Critical: 3,
};

const PALETTE: PaletteItem[] = [
  {
    type: 'kpis',
    title: { tr: 'Operasyon KPI Özeti', en: 'Operations KPI Summary' },
    defaultWidth: 920,
    defaultHeight: 230,
    route: '/work-orders',
    icon: <QueryStats sx={{ fontSize: 18 }} />,
  },
  {
    type: 'status',
    title: { tr: 'İş Emri Durum Dağılımı', en: 'Work Order Status Distribution' },
    defaultWidth: 460,
    defaultHeight: 330,
    route: '/work-orders',
    icon: <WOIcon sx={{ fontSize: 18 }} />,
  },
  {
    type: 'priority',
    title: { tr: 'Öncelik Yoğunluğu', en: 'Priority Distribution' },
    defaultWidth: 460,
    defaultHeight: 330,
    route: '/work-orders',
    icon: <AlertIcon sx={{ fontSize: 18 }} />,
  },
  {
    type: 'recent',
    title: { tr: 'Son İş Emirleri', en: 'Recent Work Orders' },
    defaultWidth: 920,
    defaultHeight: 330,
    route: '/work-orders',
    icon: <Timeline sx={{ fontSize: 18 }} />,
  },
  {
    type: 'summary',
    title: { tr: 'Güvenilirlik ve Onay Özeti', en: 'Reliability & Approval Summary' },
    defaultWidth: 460,
    defaultHeight: 300,
    route: '/work-orders',
    icon: <QueryStats sx={{ fontSize: 18 }} />,
  },
  {
    type: 'criticalEvents',
    title: { tr: 'Kritik Olaylar', en: 'Critical Events' },
    defaultWidth: 460,
    defaultHeight: 300,
    route: '/work-orders',
    icon: <AlertIcon sx={{ fontSize: 18 }} />,
  },
  {
    type: 'assetHealth',
    title: { tr: 'Varlık Sağlık Skoru', en: 'Asset Health Scores' },
    defaultWidth: 460,
    defaultHeight: 300,
    route: '/assets',
    icon: <AssetIcon sx={{ fontSize: 18 }} />,
  },
  {
    type: 'locationHotspots',
    title: { tr: 'Lokasyon Arıza Sıcak Noktaları', en: 'Location Fault Hotspots' },
    defaultWidth: 460,
    defaultHeight: 300,
    route: '/locations',
    icon: <Place sx={{ fontSize: 18 }} />,
  },
  {
    type: 'stockConsumption',
    title: { tr: 'Stok Tüketim Riski', en: 'Stock Consumption Risk' },
    defaultWidth: 460,
    defaultHeight: 300,
    route: '/stock-cards',
    icon: <Inventory sx={{ fontSize: 18 }} />,
  },
  {
    type: 'maintenanceMix',
    title: { tr: 'Bakım Tip Karışımı', en: 'Maintenance Mix' },
    defaultWidth: 460,
    defaultHeight: 300,
    route: '/maintenance-cards',
    icon: <Handyman sx={{ fontSize: 18 }} />,
  },
  {
    type: 'technicians',
    title: { tr: 'Teknisyen Yük Dağılımı', en: 'Technician Workload' },
    defaultWidth: 460,
    defaultHeight: 300,
    route: '/work-orders',
    icon: <Group sx={{ fontSize: 18 }} />,
  },
  {
    type: 'aging',
    title: { tr: 'İş Emri Yaşlanma', en: 'Work Order Aging' },
    defaultWidth: 460,
    defaultHeight: 300,
    route: '/work-orders',
    icon: <Timeline sx={{ fontSize: 18 }} />,
  },
  {
    type: 'periodicMaintenance',
    title: { tr: 'Periyodik Bakım Takvimi', en: 'Periodic Maintenance Calendar' },
    defaultWidth: 920,
    defaultHeight: 360,
    route: '/maintenance-cards',
    icon: <Handyman sx={{ fontSize: 18 }} />,
  },
];

const buildDefaultLayout = (canvasWidth: number): WidgetInstance[] => {
  const usable = Math.max(920, Math.floor(canvasWidth) - 24);
  const gap = 16;
  const half = Math.max(360, Math.floor((usable - gap) / 2));
  const full = half * 2 + gap;

  return [
    { id: 'w-kpis-1', type: 'kpis', x: 8, y: 8, width: full, height: 230 },
    { id: 'w-status-1', type: 'status', x: 8, y: 250, width: half, height: 330 },
    { id: 'w-priority-1', type: 'priority', x: 8 + half + gap, y: 250, width: half, height: 330 },
    { id: 'w-periodic-1', type: 'periodicMaintenance', x: 8, y: 592, width: full, height: 360 },
    { id: 'w-recent-1', type: 'recent', x: 8, y: 968, width: full, height: 330 },
    { id: 'w-summary-1', type: 'summary', x: 8, y: 1314, width: half, height: 300 },
    { id: 'w-critical-1', type: 'criticalEvents', x: 8 + half + gap, y: 1314, width: half, height: 300 },
  ];
};

const snap = (v: number) => Math.round(v / GRID) * GRID;
const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
const newId = (type: WidgetType) => `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const intersects = (a: WidgetInstance, b: WidgetInstance) =>
  a.x < b.x + b.width &&
  a.x + a.width > b.x &&
  a.y < b.y + b.height &&
  a.y + a.height > b.y;
const hasCollision = (candidate: WidgetInstance, all: WidgetInstance[], ignoreId?: string) =>
  all.some((w) => w.id !== ignoreId && intersects(candidate, w));

const flattenLocationTree = (nodes: LocationNode[]) => {
  const flat: Array<{
    locationId: string;
    locationName: string;
    parentLocationId?: string;
    parentLocationName?: string;
    level: number;
    locationPath: string;
  }> = [];

  const walk = (items: LocationNode[], level: number, parent?: LocationNode, pathPrefix = '') => {
    items.forEach((item) => {
      const path = pathPrefix ? `${pathPrefix} / ${item.name}` : item.name;
      flat.push({
        locationId: item.id,
        locationName: item.name,
        parentLocationId: parent?.id,
        parentLocationName: parent?.name,
        level,
        locationPath: path,
      });
      if (item.children?.length) {
        walk(item.children, level + 1, item, path);
      }
    });
  };

  walk(nodes, 0);
  return flat;
};

export default function DashboardPage() {
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const userEmail = useSelector((s: RootState) => s.ui.currentUser.email);
  const { data, loading, error, refetch } = useApi<DashboardData>(getDashboard);
  const { data: locationTree } = useApi<LocationNode[]>(getLocationTree);
  const { data: maintenancePlans } = useApi<PagedResult<MaintenancePlan>>(
    () => getMaintenancePlans({ page: 1, pageSize: 200, isActive: true }),
    []
  );
  const isTr = language === 'tr';
  const locale = isTr ? 'tr-TR' : 'en-US';
  const storageKey = `fmms.dashboard.canvas.v3.${userEmail || 'default'}`;
  const hasStoredLayoutRef = useRef(false);

  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [customizeCollapsed, setCustomizeCollapsed] = useState(false);
  const [paletteDragging, setPaletteDragging] = useState(false);
  const [widgets, setWidgets] = useState<WidgetInstance[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      hasStoredLayoutRef.current = Boolean(raw);
      const parsed = raw ? (JSON.parse(raw) as WidgetInstance[]) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [activeWidgetId, setActiveWidgetId] = useState<string | null>(null);
  const [canvasHeight, setCanvasHeight] = useState(1260);

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const moveRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const resizeRef = useRef<{ id: string; startX: number; startY: number; startW: number; startH: number } | null>(null);
  const dragFrameRef = useRef<number | null>(null);
  const latestPointerEventRef = useRef<MouseEvent | null>(null);

  const editMode = customizeOpen || paletteDragging;
  const drawerCollapsed = customizeCollapsed || paletteDragging;
  const panelWidth = 430;
  const activeTypes = useMemo(() => new Set(widgets.map((w) => w.type)), [widgets]);
  const availablePalette = useMemo(
    () => PALETTE.filter((item) => !activeTypes.has(item.type)),
    [activeTypes]
  );

  const completionRate = data && data.totalWorkOrders > 0
    ? Math.round((data.completedWorkOrders / data.totalWorkOrders) * 100)
    : 0;

  const periodicBuckets = useMemo(() => {
    const plans = maintenancePlans?.items ?? [];
    const weekly: MaintenancePlan[] = [];
    const monthly: MaintenancePlan[] = [];
    const quarterly: MaintenancePlan[] = [];
    const yearly: MaintenancePlan[] = [];
    const other: MaintenancePlan[] = [];

    plans.forEach((plan) => {
      const days = plan.frequencyDays ?? 0;
      if (days > 0 && days <= 7) weekly.push(plan);
      else if (days <= 31) monthly.push(plan);
      else if (days <= 92) quarterly.push(plan);
      else if (days > 92) yearly.push(plan);
      else other.push(plan);
    });

    const sortByDue = (items: MaintenancePlan[]) =>
      [...items].sort((a, b) => {
        const aTime = a.nextDueAt ? new Date(a.nextDueAt).getTime() : Number.MAX_SAFE_INTEGER;
        const bTime = b.nextDueAt ? new Date(b.nextDueAt).getTime() : Number.MAX_SAFE_INTEGER;
        return aTime - bTime;
      });

    return {
      weekly: sortByDue(weekly),
      monthly: sortByDue(monthly),
      quarterly: sortByDue(quarterly),
      yearly: sortByDue(yearly),
      other: sortByDue(other),
      total: plans.length,
    };
  }, [maintenancePlans]);

  const healthRows = [
    { label: isTr ? 'Tamamlanma Oranı' : 'Completion Rate', value: `${completionRate}%`, progress: completionRate },
    {
      label: 'MTTR',
      value: `${data?.reliabilityMetrics.mttrHours.toFixed(1) ?? '0.0'} h`,
      progress: Math.max(0, Math.min(100, 100 - (data?.reliabilityMetrics.mttrHours ?? 0) * 3)),
    },
    {
      label: 'MTBF',
      value: `${data?.reliabilityMetrics.mtbfHours.toFixed(1) ?? '0.0'} h`,
      progress: Math.max(0, Math.min(100, (data?.reliabilityMetrics.mtbfHours ?? 0) / 2)),
    },
  ];

  const findAvailableSpot = (base: WidgetInstance, occupied: WidgetInstance[]) => {
    if (!canvasRef.current) return base;
    const canvasWidth = canvasRef.current.clientWidth;
    const maxX = Math.max(0, canvasWidth - base.width);
    const initialX = clamp(snap(base.x), 0, maxX);
    const initialY = Math.max(0, snap(base.y));
    const firstTry = { ...base, x: initialX, y: initialY };
    if (!hasCollision(firstTry, occupied, base.id)) return firstTry;

    const lowestOccupiedY = occupied.reduce((max, w) => Math.max(max, w.y + w.height), initialY);
    const maxScanY = Math.max(initialY, snap(lowestOccupiedY + GRID));
    for (let y = initialY; y <= maxScanY; y += GRID) {
      for (let x = 0; x <= maxX; x += GRID) {
        const candidate = { ...base, x, y };
        if (!hasCollision(candidate, occupied, base.id)) return candidate;
      }
    }
    return null;
  };

  const ensureCanvasHeightFor = (items: WidgetInstance[]) => {
    const needed = Math.max(
      980,
      ...items.map((w) => w.y + w.height + 48)
    );
    setCanvasHeight((prev) => (needed > prev ? needed : Math.max(needed, 980)));
  };

  useEffect(() => {
    if (hasStoredLayoutRef.current || widgets.length > 0 || !canvasRef.current) return;
    setWidgets(buildDefaultLayout(canvasRef.current.clientWidth));
  }, [widgets.length]);

  useEffect(() => {
    ensureCanvasHeightFor(widgets);
  }, [widgets]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(widgets));
    } catch {
      // ignore quota errors
    }
  }, [storageKey, widgets]);

  useEffect(() => {
    const processPointerMove = () => {
      dragFrameRef.current = null;
      const event = latestPointerEventRef.current;
      const canvas = canvasRef.current;
      if (!event || !canvas) return;

      const rect = canvas.getBoundingClientRect();
      const maxX = Math.max(0, canvas.clientWidth - MIN_W);

      if (moveRef.current) {
        const state = moveRef.current;
        setWidgets((prev) => {
          const current = prev.find((w) => w.id === state.id);
          if (!current) return prev;

          const x = clamp(snap(event.clientX - rect.left - state.offsetX), 0, maxX);
          const y = Math.max(0, snap(event.clientY - rect.top - state.offsetY));
          if (x === current.x && y === current.y) return prev;

          const candidate = { ...current, x, y };
          if (hasCollision(candidate, prev, current.id)) return prev;
          setCanvasHeight((hPrev) => Math.max(hPrev, candidate.y + candidate.height + 80));
          return prev.map((w) => (w.id === state.id ? candidate : w));
        });
      }

      if (resizeRef.current) {
        const state = resizeRef.current;
        setWidgets((prev) => {
          const current = prev.find((w) => w.id === state.id);
          if (!current) return prev;

          const maxW = Math.max(MIN_W, canvas.clientWidth - current.x);
          const width = clamp(snap(state.startW + event.clientX - state.startX), MIN_W, maxW);
          const height = Math.max(MIN_H, snap(state.startH + event.clientY - state.startY));
          if (width === current.width && height === current.height) return prev;

          const candidate = { ...current, width, height };
          if (hasCollision(candidate, prev, current.id)) return prev;
          setCanvasHeight((hPrev) => Math.max(hPrev, candidate.y + candidate.height + 80));
          return prev.map((w) => (w.id === state.id ? candidate : w));
        });
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      latestPointerEventRef.current = event;
      if (dragFrameRef.current !== null) return;
      dragFrameRef.current = window.requestAnimationFrame(processPointerMove);
    };

    const onMouseUp = () => {
      moveRef.current = null;
      resizeRef.current = null;
      latestPointerEventRef.current = null;
      if (dragFrameRef.current !== null) {
        window.cancelAnimationFrame(dragFrameRef.current);
        dragFrameRef.current = null;
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (dragFrameRef.current !== null) {
        window.cancelAnimationFrame(dragFrameRef.current);
        dragFrameRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!editMode) {
      moveRef.current = null;
      resizeRef.current = null;
      setPaletteDragging(false);
    }
  }, [editMode]);

  useEffect(() => {
    const resetDragState = () => setPaletteDragging(false);
    window.addEventListener('dragend', resetDragState);
    window.addEventListener('drop', resetDragState);
    return () => {
      window.removeEventListener('dragend', resetDragState);
      window.removeEventListener('drop', resetDragState);
    };
  }, []);

  const getWidgetMeta = (type: WidgetType) => PALETTE.find((p) => p.type === type);
  const getWidgetTitle = (type: WidgetType) => {
    const meta = getWidgetMeta(type);
    if (!meta) return t('dashboard.title');
    return isTr ? meta.title.tr : meta.title.en;
  };
  const navigateByWidget = (type: WidgetType) => {
    const target = getWidgetMeta(type)?.route;
    if (target) navigate(target);
  };
  const navigateWorkOrders = (params: Record<string, string | number | boolean | undefined>) => {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') sp.set(k, String(v));
    });
    navigate(`/work-orders${sp.toString() ? `?${sp.toString()}` : ''}`);
  };

  const addWidgetAt = (type: WidgetType, x: number, y: number) => {
    const existing = widgets.find((w) => w.type === type);
    if (existing) {
      setActiveWidgetId(existing.id);
      return;
    }
    const def = PALETTE.find((w) => w.type === type);
    if (!def || !canvasRef.current) return;
    const maxX = Math.max(0, canvasRef.current.clientWidth - def.defaultWidth);
    const item: WidgetInstance = {
      id: newId(type),
      type,
      x: clamp(snap(x), 0, maxX),
      y: Math.max(0, snap(y)),
      width: def.defaultWidth,
      height: def.defaultHeight,
    };
    const placed = findAvailableSpot(item, widgets);
    if (!placed) return;
    setCanvasHeight((prev) => Math.max(prev, placed.y + placed.height + 80));
    setWidgets((prev) => [...prev, placed]);
    setActiveWidgetId(placed.id);
  };

  const removeWidget = (id: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== id));
    if (activeWidgetId === id) setActiveWidgetId(null);
  };

  const onCanvasDrop = (event: React.DragEvent<HTMLDivElement>) => {
    if (!editMode || !canvasRef.current) return;
    event.preventDefault();
    const type = event.dataTransfer.getData('application/x-widget-type') as WidgetType;
    if (!type) return;
    const rect = canvasRef.current.getBoundingClientRect();
    addWidgetAt(type, event.clientX - rect.left, event.clientY - rect.top);
    setPaletteDragging(false);
    setCustomizeOpen(true);
  };

  const renderPalettePreview = (type: WidgetType) => {
    const frameSx = {
      border: '1px solid #D7E3F1',
      borderRadius: 1.2,
      p: 0.9,
      height: 104,
      bgcolor: '#F9FBFE',
    };

    if (type === 'kpis') {
      return (
        <Box sx={frameSx}>
          <Grid container spacing={0.7}>
            {[1, 2, 3, 4].map((i) => (
              <Grid size={{ xs: 6 }} key={i}>
                <Box sx={{ border: '1px solid #DCE6F2', borderRadius: 1, p: 0.6, height: 42, bgcolor: '#FFFFFF' }}>
                  <Box sx={{ width: 28, height: 5, bgcolor: '#D7E3F1', borderRadius: 3, mb: 0.5 }} />
                  <Box sx={{ width: 18, height: 12, bgcolor: '#AEC1D8', borderRadius: 1 }} />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      );
    }
    if (type === 'recent' || type === 'criticalEvents') {
      return (
        <Box sx={frameSx}>
          {[1, 2, 3].map((i) => (
            <Box key={i} sx={{ display: 'flex', gap: 0.6, mb: 0.8 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#D7E3F1' }} />
              <Box sx={{ flex: 1 }}>
                <Box sx={{ width: i === 2 ? '55%' : '72%', height: 6, bgcolor: '#CCD9E8', borderRadius: 3, mb: 0.5 }} />
                <Box sx={{ width: '38%', height: 5, bgcolor: '#E1EAF5', borderRadius: 3 }} />
              </Box>
            </Box>
          ))}
        </Box>
      );
    }
    if (type === 'status' || type === 'maintenanceMix') {
      return (
        <Box sx={{ ...frameSx, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Box sx={{ width: 58, height: 58, borderRadius: '50%', border: '10px solid #DCE6F2', borderTopColor: '#8CA0B5', borderRightColor: '#B7C9DD' }} />
        </Box>
      );
    }
    if (type === 'priority' || type === 'aging' || type === 'locationHotspots') {
      return (
        <Box sx={{ ...frameSx, display: 'flex', alignItems: 'flex-end', gap: 0.6 }}>
          {[36, 56, 28, 68, 42].map((h, i) => (
            <Box key={i} sx={{ flex: 1, height: h, borderRadius: 0.8, bgcolor: i % 2 ? '#B7C9DD' : '#DCE6F2' }} />
          ))}
        </Box>
      );
    }
    return (
      <Box sx={frameSx}>
        <Box sx={{ height: '100%', borderRadius: 1, background: 'linear-gradient(180deg,#EEF4FC,#F8FBFF)' }} />
      </Box>
    );
  };

  const renderWidgetContent = (widget: WidgetInstance) => {
    if (!data) return <Skeleton variant="rounded" height={widget.height - 40} />;

    if (widget.type === 'kpis') {
      return (
        <Grid container spacing={1.2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              title={t('dashboard.totalWorkOrders')}
              value={data.totalWorkOrders}
              icon={<WOIcon fontSize="small" />}
              onClick={() => navigateWorkOrders({})}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              title={t('dashboard.open')}
              value={data.openWorkOrders}
              icon={<AlertIcon fontSize="small" />}
              onClick={() => navigateWorkOrders({ status: 0 })}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              title={t('dashboard.assets')}
              value={data.totalAssets}
              icon={<AssetIcon fontSize="small" />}
              onClick={() => navigate('/assets')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              title={t('dashboard.lowStock')}
              value={data.lowStockItems}
              icon={<StockIcon fontSize="small" />}
              onClick={() => navigate('/stock-cards')}
            />
          </Grid>
        </Grid>
      );
    }

    if (widget.type === 'status') {
      return (
        <ResponsiveContainer width="100%" height={widget.height - 56}>
          <PieChart>
            <Pie
              data={data.workOrdersByStatus ?? []}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="50%"
              outerRadius={88}
              innerRadius={54}
              strokeWidth={0}
              onClick={((...args: any[]) => {
                const payload = args[0]?.payload ?? args[0];
                const status = payload?.status as string | undefined;
                const code = status ? STATUS_TO_CODE[status] : undefined;
                if (code !== undefined) navigateWorkOrders({ status: code });
              }) as any}
            >
              {(data.workOrdersByStatus ?? []).map((entry) => <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || CHART_MUTED} />)}
            </Pie>
            <RechartsTooltip />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    if (widget.type === 'priority') {
      return (
        <ResponsiveContainer width="100%" height={widget.height - 56}>
          <BarChart data={data.workOrdersByPriority ?? []} layout="vertical">
            <XAxis type="number" />
            <YAxis type="category" dataKey="priority" width={90} />
            <RechartsTooltip />
            <Bar
              dataKey="count"
              radius={[0, 6, 6, 0]}
              barSize={18}
              onClick={((...args: any[]) => {
                const payload = args[0]?.payload ?? args[0];
                const priority = payload?.priority as string | undefined;
                const code = priority ? PRIORITY_TO_CODE[priority] : undefined;
                if (code !== undefined) navigateWorkOrders({ priority: code });
              }) as any}
            >
              {(data.workOrdersByPriority ?? []).map((entry) => <Cell key={entry.priority} fill={PRIORITY_COLORS[entry.priority] || CHART_MUTED} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (widget.type === 'recent') {
      return (
        <Box sx={{ maxHeight: widget.height - 56, overflow: 'auto' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>{t('common.number')}</TableCell>
                <TableCell>{t('common.title')}</TableCell>
                <TableCell>{t('common.status')}</TableCell>
                <TableCell>{t('common.priority')}</TableCell>
                <TableCell>{t('common.date')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(data.recentWorkOrders ?? []).slice(0, 10).map((wo) => (
                <TableRow key={wo.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/work-orders/${wo.id}`)}>
                  <TableCell sx={{ fontWeight: 700, color: navy[600] }}>{wo.orderNumber}</TableCell>
                  <TableCell>{wo.title}</TableCell>
                  <TableCell><Chip size="small" variant="outlined" label={wo.status} /></TableCell>
                  <TableCell><Chip size="small" variant="outlined" label={wo.priority} /></TableCell>
                  <TableCell sx={{ color: '#6B7280' }}>{new Date(wo.createdAt).toLocaleDateString(locale)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      );
    }

    if (widget.type === 'summary') {
      return (
        <Box sx={{ maxHeight: widget.height - 56, overflow: 'auto' }}>
          <Box sx={{ mb: 1.5, p: 1.2, border: '1px solid #E5EAF1', borderRadius: 1.5 }}>
            <Typography variant="caption" sx={{ color: '#6B7280' }}>{isTr ? 'Onay Bekleyenler' : 'Pending Approvals'}</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#5F6B7C' }}>{data.pendingApprovals ?? 0}</Typography>
          </Box>
          {healthRows.map((row) => (
            <Box
              key={row.label}
              sx={{ mb: 1.25, cursor: 'pointer' }}
              onClick={() => {
                if (row.label.includes('MTTR')) navigateWorkOrders({ status: 2 });
                else if (row.label.includes('MTBF')) navigateWorkOrders({ status: 4 });
                else navigateWorkOrders({ status: 4 });
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>{row.label}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: navy[700] }}>{row.value}</Typography>
              </Box>
              <LinearProgress variant="determinate" value={row.progress} sx={{ height: 6, borderRadius: 4, bgcolor: '#E8EEF5' }} />
            </Box>
          ))}
        </Box>
      );
    }

    if (widget.type === 'criticalEvents') {
      return (
        <Box sx={{ maxHeight: widget.height - 56, overflow: 'auto' }}>
          {(data.criticalEvents ?? []).length === 0 && (
            <Typography variant="body2" sx={{ color: '#6B7280' }}>
              {isTr ? 'Aktif kritik olay bulunmuyor.' : 'No active critical events.'}
            </Typography>
          )}
          {(data.criticalEvents ?? []).slice(0, 8).map((event) => (
            <Box
              key={event.workOrderId}
              sx={{ mb: 1, p: 1, borderRadius: 1.2, border: '1px solid #E5EAF1', cursor: 'pointer' }}
              onClick={() => navigate(`/work-orders/${event.workOrderId}`)}
            >
              <Typography variant="body2" sx={{ fontWeight: 700, color: navy[700] }}>{event.title}</Typography>
              <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                <Chip size="small" label={event.priority} variant="outlined" />
                <Chip size="small" label={event.status} variant="outlined" />
              </Box>
            </Box>
          ))}
        </Box>
      );
    }

    if (widget.type === 'assetHealth') {
      return (
        <Box sx={{ maxHeight: widget.height - 56, overflow: 'auto' }}>
          {(data.assetHealthScores ?? []).slice(0, 8).map((asset) => (
            <Box
              key={asset.assetId}
              sx={{ mb: 1, cursor: 'pointer' }}
              onClick={() => navigate(`/assets?assetId=${asset.assetId}`)}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>{asset.assetName}</Typography>
                <Typography variant="caption" sx={{ color: navy[700], fontWeight: 700 }}>{asset.healthScore}%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={asset.healthScore} sx={{ height: 6, borderRadius: 4 }} />
            </Box>
          ))}
        </Box>
      );
    }

    if (widget.type === 'locationHotspots') {
      const hotspotMap = new Map((data.locationFaultHotspots ?? []).map((h) => [h.locationId, h]));
      const treeFlat = flattenLocationTree(locationTree ?? []);
      const hotspots = treeFlat.length > 0
        ? treeFlat.map((node) => {
            const existing = hotspotMap.get(node.locationId);
            return {
              locationId: node.locationId,
              locationName: node.locationName,
              faultCount: existing?.faultCount ?? 0,
              parentLocationId: node.parentLocationId,
              parentLocationName: node.parentLocationName,
              level: node.level,
              locationPath: node.locationPath,
            };
          })
        : (data.locationFaultHotspots ?? []);
      const maxFault = hotspots.reduce((max, item) => Math.max(max, item.faultCount), 0);
      const byId = new Map(hotspots.map((h) => [h.locationId, h]));
      const resolveRootId = (spot: (typeof hotspots)[number]) => {
        let cursor = spot;
        const visited = new Set<string>([cursor.locationId]);
        while (cursor.parentLocationId) {
          const parent = byId.get(cursor.parentLocationId);
          if (!parent || visited.has(parent.locationId)) break;
          visited.add(parent.locationId);
          cursor = parent;
        }
        return cursor.locationId;
      };

      const grouped = hotspots.reduce((acc, spot) => {
        const rootId = resolveRootId(spot);
        const root = byId.get(rootId);
        const current = acc.get(rootId);
        if (current) {
          current.items.push(spot);
          return acc;
        }
        acc.set(rootId, { key: rootId, title: root?.locationName ?? spot.locationName, items: [spot] });
        return acc;
      }, new Map<string, { key: string; title: string; items: typeof hotspots }>());
      const groups = Array.from(grouped.values())
        .map((group) => ({
          ...group,
          items: [...group.items].sort((a, b) => {
            const levelA = a.level ?? 0;
            const levelB = b.level ?? 0;
            if (levelA !== levelB) return levelA - levelB;
            const pathA = a.locationPath || a.locationName;
            const pathB = b.locationPath || b.locationName;
            return pathA.localeCompare(pathB, locale);
          }),
        }))
        .sort((a, b) => a.title.localeCompare(b.title, locale));

      const shortCode = (name: string) => {
        const parts = name.trim().split(/\s+/).filter(Boolean);
        if (parts.length >= 2) return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
        return name.slice(0, 2).toUpperCase();
      };
      const heatColor = (count: number) => {
        if (maxFault <= 0) return '#EEF4FB';
        const ratio = Math.max(0, Math.min(1, count / maxFault));
        if (ratio >= 0.9) return '#7A271A';
        if (ratio >= 0.75) return '#B42318';
        if (ratio >= 0.6) return '#D92D20';
        if (ratio >= 0.45) return '#F04438';
        if (ratio >= 0.3) return '#F97066';
        if (ratio >= 0.15) return '#FDA29B';
        return '#FEE4E2';
      };

      return (
        <Box sx={{ maxHeight: widget.height - 56, overflow: 'auto' }}>
          {hotspots.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 700 }}>
                {isTr ? 'Arıza Yoğunluğu' : 'Fault Density'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>0</Typography>
                {['#FEE4E2', '#FDA29B', '#F97066', '#F04438', '#B42318'].map((color) => (
                  <Box key={color} sx={{ width: 14, height: 10, borderRadius: 0.5, bgcolor: color, border: '1px solid #E5EAF1' }} />
                ))}
                <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 700 }}>{maxFault}</Typography>
              </Box>
            </Box>
          )}

            {groups.map((group) => (
              <Box key={group.key} sx={{ mb: 1.2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.6 }}>
                <Typography variant="caption" sx={{ color: navy[700], fontWeight: 700 }}>
                  {group.title}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  {isTr ? `Kırılım: ${group.items.length}` : `Breakdowns: ${group.items.length}`}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(54px, 1fr))',
                  gap: 0,
                }}
              >
                {group.items.map((spot) => (
                  <Tooltip
                    key={spot.locationId}
                    title={
                      spot.faultCount > 0
                        ? `${spot.locationPath || spot.locationName} (${isTr ? 'Arıza' : 'Fault'}: ${spot.faultCount})`
                        : `${spot.locationPath || spot.locationName} (${isTr ? 'Arıza yok' : 'No faults'})`
                    }
                    placement="top"
                    arrow
                  >
                    <Box
                        onClick={() => {
                          if (spot.faultCount <= 0) return;
                          navigateWorkOrders({ type: 0, locationId: spot.locationId, includeDescendants: true });
                        }}
                        sx={{
                          height: 50,
                          borderRadius: 0,
                          bgcolor: heatColor(spot.faultCount),
                          border: '1px solid #F8FAFC',
                          cursor: spot.faultCount > 0 ? 'pointer' : 'not-allowed',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#111827',
                          opacity: spot.faultCount > 0 ? 1 : 0.72,
                          userSelect: 'none',
                          '&:hover': { transform: 'translateY(-1px)', boxShadow: `0 4px 10px ${alpha('#111827', 0.12)}` },
                        }}
                    >
                        <Typography sx={{ lineHeight: 1, fontWeight: 800, fontSize: 12 }}>{spot.faultCount}</Typography>
                        <Typography sx={{ mt: 0.2, lineHeight: 1, fontWeight: 700, fontSize: 10, letterSpacing: 0.2 }}>
                          {shortCode(spot.locationName)}
                        </Typography>
                        <Typography sx={{ mt: 0.2, lineHeight: 1, fontWeight: 600, fontSize: 9, color: '#334155' }}>
                          L{spot.level ?? 0}
                        </Typography>
                      </Box>
                    </Tooltip>
                  ))}
                </Box>
              </Box>
          ))}
          {hotspots.length === 0 && (
            <Typography variant="body2" sx={{ color: '#6B7280' }}>
              {isTr ? 'Isı haritası verisi bulunamadı.' : 'No heatmap data found.'}
            </Typography>
          )}
        </Box>
      );
    }

    if (widget.type === 'stockConsumption') {
      return (
        <Box sx={{ maxHeight: widget.height - 56, overflow: 'auto' }}>
          {(data.stockConsumption ?? []).slice(0, 8).map((stock) => (
            <Box
              key={stock.stockCardId}
              sx={{ mb: 1, p: 1, border: '1px solid #E5EAF1', borderRadius: 1.2, cursor: 'pointer' }}
              onClick={() =>
                navigate(
                  `/stock-cards?selected=${stock.stockCardId}&search=${encodeURIComponent(stock.stockCardName)}`
                )
              }
            >
              <Typography variant="caption" sx={{ color: '#6B7280' }}>{stock.stockCardName}</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.3 }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  {isTr ? 'Günlük Tüketim' : 'Daily Consumption'}: {stock.avgDailyConsumption}
                </Typography>
                <Typography variant="caption" sx={{ color: '#8A2F38', fontWeight: 700 }}>
                  {isTr ? 'Kalan Gün' : 'Days Left'}: {stock.estimatedDaysRemaining ?? '-'}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      );
    }

    if (widget.type === 'maintenanceMix') {
      const mix = [
        { name: isTr ? 'Düzeltici' : 'Corrective', value: data.maintenanceMix.correctivePercent, color: '#E53935' },
        { name: isTr ? 'Önleyici' : 'Preventive', value: data.maintenanceMix.preventivePercent, color: '#43A047' },
        { name: isTr ? 'Kestirimci' : 'Predictive', value: data.maintenanceMix.predictivePercent, color: '#1E88E5' },
      ];
      return (
        <ResponsiveContainer width="100%" height={widget.height - 56}>
          <PieChart>
            <Pie
              data={mix}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={88}
              innerRadius={52}
              strokeWidth={0}
              fill="transparent"
              onClick={((...args: any[]) => {
                const payload = args[0]?.payload ?? args[0];
                const name = (payload?.name as string | undefined)?.toLowerCase();
                if (!name) return;
                if (name.includes('corrective') || name.includes('düzeltici')) {
                  navigateWorkOrders({ type: 0 });
                } else if (name.includes('preventive') || name.includes('önleyici')) {
                  navigateWorkOrders({ type: 1 });
                } else {
                  navigateWorkOrders({ type: 2 });
                }
              }) as any}
            >
              {mix.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
            </Pie>
            <RechartsTooltip />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    if (widget.type === 'technicians') {
      return (
        <Box sx={{ maxHeight: widget.height - 56, overflow: 'auto' }}>
          {(data.technicianPerformance ?? []).slice(0, 8).map((tech) => (
            <Box
              key={tech.technicianId}
              sx={{ mb: 1, p: 1, border: '1px solid #E5EAF1', borderRadius: 1.2, cursor: 'pointer' }}
              onClick={() => navigateWorkOrders({ assignee: tech.technicianId })}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, color: navy[700] }}>{tech.technicianName}</Typography>
              <Typography variant="caption" display="block" sx={{ color: '#6B7280' }}>
                {isTr ? 'Açık Atama' : 'Open Assignments'}: {tech.openAssignedCount} | {isTr ? 'Backlog' : 'Backlog'}: {tech.backlogCount}
              </Typography>
            </Box>
          ))}
        </Box>
      );
    }

    if (widget.type === 'periodicMaintenance') {
      const buckets: { key: string; title: string; items: MaintenancePlan[] }[] = [
        { key: 'weekly', title: isTr ? 'Haftalık' : 'Weekly', items: periodicBuckets.weekly },
        { key: 'monthly', title: isTr ? 'Aylık' : 'Monthly', items: periodicBuckets.monthly },
        { key: 'quarterly', title: isTr ? 'Çeyreklik' : 'Quarterly', items: periodicBuckets.quarterly },
        { key: 'yearly', title: isTr ? 'Yıllık' : 'Yearly', items: periodicBuckets.yearly },
      ];
      const now = Date.now();
      const upcoming = [...(maintenancePlans?.items ?? [])]
        .filter((p) => p.nextDueAt)
        .sort((a, b) => new Date(a.nextDueAt!).getTime() - new Date(b.nextDueAt!).getTime())
        .slice(0, 6);
      return (
        <Box sx={{ height: widget.height - 56, overflow: 'auto', pr: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1, flexWrap: 'wrap' }}>
            <Chip size="small" color="primary" label={`${isTr ? 'Toplam' : 'Total'}: ${periodicBuckets.total}`} />
            {buckets.map((b) => (
              <Chip key={b.key} size="small" variant="outlined" label={`${b.title}: ${b.items.length}`} />
            ))}
          </Box>
          <Grid container spacing={1}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Grid container spacing={1}>
                {buckets.map((b) => (
                  <Grid key={b.key} size={{ xs: 6 }}>
                    <Card variant="outlined" sx={{ borderColor: '#E2E8F0', height: '100%' }}>
                      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: navy[800] }}>{b.title}</Typography>
                          <Chip size="small" label={b.items.length} sx={{ fontWeight: 700, height: 18, '& .MuiChip-label': { px: 0.75, fontSize: '0.65rem' } }} />
                        </Box>
                        {b.items.length === 0 ? (
                          <Typography variant="caption" sx={{ color: '#94A3B8' }}>{isTr ? 'Plan yok' : 'No plans'}</Typography>
                        ) : (
                          b.items.slice(0, 3).map((p) => (
                            <Box
                              key={p.id}
                              onClick={() => navigate('/maintenance-cards')}
                              sx={{ cursor: 'pointer', mb: 0.4, '&:hover': { color: navy[700] } }}
                            >
                              <Typography variant="caption" display="block" sx={{ fontWeight: 700, color: navy[700], lineHeight: 1.2 }}>
                                • {p.name}
                              </Typography>
                              <Typography variant="caption" display="block" sx={{ color: '#64748B', fontSize: '0.65rem', lineHeight: 1.2 }}>
                                {p.assetName}
                              </Typography>
                            </Box>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Card variant="outlined" sx={{ borderColor: '#E2E8F0', height: '100%' }}>
                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: navy[800], display: 'block', mb: 0.6 }}>
                    {isTr ? 'Yaklaşan Bakımlar' : 'Upcoming Maintenance'}
                  </Typography>
                  {upcoming.length === 0 ? (
                    <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                      {isTr ? 'Yaklaşan bakım yok.' : 'No upcoming maintenance.'}
                    </Typography>
                  ) : (
                    upcoming.map((p) => {
                      const due = new Date(p.nextDueAt!).getTime();
                      const days = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
                      const overdue = days < 0;
                      return (
                        <Box
                          key={p.id}
                          onClick={() => navigate('/maintenance-cards')}
                          sx={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            gap: 0.5, mb: 0.4, p: 0.5, borderRadius: 0.75, cursor: 'pointer',
                            '&:hover': { bgcolor: '#F8FAFC' },
                          }}
                        >
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="caption" display="block" sx={{ fontWeight: 700, color: navy[700], lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {p.name}
                            </Typography>
                            <Typography variant="caption" display="block" sx={{ color: '#64748B', fontSize: '0.62rem', lineHeight: 1.2 }}>
                              {new Date(p.nextDueAt!).toLocaleDateString(locale)}
                            </Typography>
                          </Box>
                          <Chip
                            size="small"
                            label={overdue ? (isTr ? `${Math.abs(days)}g geç` : `${Math.abs(days)}d late`) : (isTr ? `${days}g` : `${days}d`)}
                            sx={{
                              height: 18, fontSize: '0.62rem', fontWeight: 700,
                              bgcolor: overdue ? '#FEE2E2' : days <= 7 ? '#FEF3C7' : '#DCFCE7',
                              color: overdue ? '#B91C1C' : days <= 7 ? '#92400E' : '#166534',
                              '& .MuiChip-label': { px: 0.75 },
                            }}
                          />
                        </Box>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={widget.height - 56}>
        <BarChart data={(data.workOrderAging ?? []).slice(0, 8)}>
          <XAxis dataKey="bucket" />
          <YAxis />
          <RechartsTooltip />
          <Bar
            dataKey="count"
            fill={CHART_PRIMARY}
            radius={[6, 6, 0, 0]}
            onClick={((...args: any[]) => {
              const payload = args[0]?.payload ?? args[0];
              const bucket = payload?.bucket as string | undefined;
              if (bucket) navigateWorkOrders({ aging: bucket });
            }) as any}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Box>
      <Box sx={{ mb: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1.2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: navy[800] }}>{t('dashboard.title')}</Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.4 }}>
            {isTr
              ? 'Widget önizlemelerini menüden sürükleyip alana bırak, sonra mouse ile konumlandırıp serbest boyutlandır.'
              : 'Drag widget previews from menu to canvas, then place and resize freely with mouse.'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" startIcon={<Settings />} variant={editMode ? 'contained' : 'outlined'} onClick={() => setCustomizeOpen((v) => !v)}>
            {t('dashboard.customize')}
          </Button>
        </Box>
      </Box>

      {loading && !data ? (
        <Box>
          {error && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ color: '#8A2F38', fontWeight: 700 }}>
                  {isTr ? 'Dashboard verisi alınamadı' : 'Failed to load dashboard data'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5 }}>{error}</Typography>
                <Button size="small" sx={{ mt: 1 }} onClick={() => refetch()}>
                  {isTr ? 'Tekrar Dene' : 'Retry'}
                </Button>
              </CardContent>
            </Card>
          )}
          <Grid container spacing={2}>
            {[...Array(6)].map((_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                <Skeleton variant="rounded" height={160} />
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : (
        <Box
          ref={canvasRef}
          onDragOver={(e) => {
            if (!editMode || !canvasRef.current) return;
            e.preventDefault();
            const rect = canvasRef.current.getBoundingClientRect();
            const y = e.clientY - rect.top;
            if (y > canvasHeight - 160) {
              setCanvasHeight((prev) => prev + 360);
            }
          }}
          onDrop={onCanvasDrop}
          sx={{
            position: 'relative',
            minHeight: canvasHeight,
            mr: 0,
            borderRadius: 2,
            border: editMode ? `1px dashed ${alpha(navy[700], 0.45)}` : '1px solid transparent',
            bgcolor: editMode ? alpha('#F5F8FC', 0.72) : 'transparent',
            backgroundImage: editMode
              ? `linear-gradient(${alpha('#9FB2C8', 0.18)} 1px, transparent 1px), linear-gradient(90deg, ${alpha('#9FB2C8', 0.18)} 1px, transparent 1px)`
              : 'none',
            backgroundSize: editMode ? `${GRID * 2}px ${GRID * 2}px` : 'auto',
            p: editMode ? 1 : 0,
          }}
        >
          {widgets.length === 0 && (
            <Card sx={{ m: 2, maxWidth: 560 }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{t('dashboard.noWidgets')}</Typography>
                <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.6 }}>{t('dashboard.noWidgetsHint')}</Typography>
              </CardContent>
            </Card>
          )}

          {widgets.map((widget) => (
            <Box
              key={widget.id}
              sx={{
                position: 'absolute',
                left: widget.x,
                top: widget.y,
                width: widget.width,
                height: widget.height,
                borderRadius: 2,
                border: activeWidgetId === widget.id && editMode ? `2px solid ${alpha(navy[700], 0.5)}` : '1px solid transparent',
                boxShadow: activeWidgetId === widget.id && editMode ? `0 8px 20px ${alpha(navy[900], 0.12)}` : 'none',
              }}
              onMouseDown={() => setActiveWidgetId(widget.id)}
            >
              <Card sx={{ height: '100%', overflow: 'hidden' }}>
                <Box
                  onMouseDown={(e) => {
                    if (!editMode || !canvasRef.current) return;
                    e.preventDefault();
                    const rect = canvasRef.current.getBoundingClientRect();
                    moveRef.current = {
                      id: widget.id,
                      offsetX: e.clientX - rect.left - widget.x,
                      offsetY: e.clientY - rect.top - widget.y,
                    };
                    setActiveWidgetId(widget.id);
                  }}
                  sx={{
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 1,
                    borderBottom: '1px solid #E8EDF4',
                    bgcolor: alpha('#F3F7FC', 0.95),
                    cursor: editMode ? 'grab' : 'default',
                  }}
                >
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6 }}>
                    {editMode ? <DragIndicator sx={{ fontSize: 16, color: navy[500] }} /> : getWidgetMeta(widget.type)?.icon}
                    <Typography variant="caption" sx={{ fontWeight: 700, color: navy[700] }}>
                      {getWidgetTitle(widget.type)}
                    </Typography>
                  </Box>
                  {editMode ? (
                    <IconButton size="small" onClick={() => removeWidget(widget.id)}>
                      <DeleteOutline sx={{ fontSize: 15 }} />
                    </IconButton>
                  ) : (
                    <Tooltip title={isTr ? 'Detaya git' : 'Open details'}>
                      <IconButton size="small" onClick={() => navigateByWidget(widget.type)}>
                        <OpenInNew sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
                <CardContent
                  sx={{
                    p: 1.2,
                    height: widget.height - 36,
                    '&:last-child': { pb: 1.2 },
                    cursor: 'default',
                  }}
                >
                  {renderWidgetContent(widget)}
                </CardContent>
              </Card>
              {editMode && (
                <Box
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    resizeRef.current = { id: widget.id, startX: e.clientX, startY: e.clientY, startW: widget.width, startH: widget.height };
                    setActiveWidgetId(widget.id);
                  }}
                  sx={{
                    position: 'absolute',
                    right: 6,
                    bottom: 6,
                    width: 16,
                    height: 16,
                    borderRight: '2px solid #99A8BB',
                    borderBottom: '2px solid #99A8BB',
                    borderBottomRightRadius: 1,
                    cursor: 'nwse-resize',
                  }}
                />
              )}
            </Box>
          ))}
        </Box>
      )}

      <Drawer
        variant="persistent"
        anchor="right"
        open={customizeOpen}
        PaperProps={{
          sx: {
            position: 'fixed',
            width: { xs: '100%', sm: drawerCollapsed ? 86 : panelWidth },
            overflow: 'visible',
            borderLeft: '1px solid #DCE6F2',
            boxShadow: `0 10px 30px ${alpha(navy[900], 0.14)}`,
            bgcolor: alpha('#FFFFFF', paletteDragging ? 0.5 : 0.82),
            backdropFilter: 'blur(8px)',
            transform: paletteDragging ? 'translateX(32px)' : 'translateX(0)',
            transition: 'width 0.18s ease, background-color 0.18s ease, opacity 0.18s ease, transform 0.18s ease',
            opacity: paletteDragging ? 0.92 : 1,
          },
        }}
      >
        <>
          <Box
            sx={{
              position: 'absolute',
              left: -14,
              top: 20,
              zIndex: 3,
            }}
          >
            <IconButton
              size="small"
              onClick={() => setCustomizeCollapsed((v) => !v)}
              sx={{
                width: 28,
                height: 28,
                bgcolor: '#FFFFFF',
                border: '1px solid #DCE6F2',
                boxShadow: `0 3px 10px ${alpha(navy[900], 0.1)}`,
                '&:hover': { bgcolor: '#F8FAFC' },
              }}
            >
              {drawerCollapsed ? <ChevronLeft sx={{ fontSize: 16 }} /> : <ChevronRight sx={{ fontSize: 16 }} />}
            </IconButton>
          </Box>
          <Box sx={{ p: 2, opacity: drawerCollapsed ? 0.25 : 1, transition: 'opacity 0.18s ease' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.2 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: navy[800] }}>{t('dashboard.customize')}</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5 }}>
                {isTr ? 'İstediğin widget’ı sürükleyip bırak, sonra boyutunu mouse ile belirle.' : 'Drag any widget into canvas, then size it with your mouse.'}
              </Typography>
              <Box sx={{ mt: 1.2, display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  startIcon={<Refresh />}
                  variant="outlined"
                  onClick={() => setWidgets(buildDefaultLayout(canvasRef.current?.clientWidth ?? 1200))}
                >
                  {t('dashboard.resetLayout')}
                </Button>
                <Button size="small" startIcon={<Close />} variant="outlined" onClick={() => setCustomizeOpen(false)}>
                  {isTr ? 'Kapat' : 'Close'}
                </Button>
              </Box>
          </Box>
          <Divider />
          <List sx={{ p: 0 }}>
            {availablePalette.map((item) => (
              <ListItem
                key={item.type}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/x-widget-type', item.type);
                  e.dataTransfer.setData('text/plain', item.type);
                  e.dataTransfer.effectAllowed = 'copy';
                  requestAnimationFrame(() => setPaletteDragging(true));
                }}
                onDragEnd={() => setPaletteDragging(false)}
                sx={{ display: 'block', p: 2, cursor: 'grab', opacity: paletteDragging ? 0.4 : 1 }}
              >
                <Card variant="outlined" sx={{ borderColor: '#DCE6F2' }}>
                  <CardContent sx={{ p: 1.2, '&:last-child': { pb: 1.2 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6 }}>
                        <DragIndicator sx={{ fontSize: 16, color: navy[500] }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: navy[700] }}>
                          {isTr ? item.title.tr : item.title.en}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => addWidgetAt(item.type, 16, 16)}
                        sx={{ border: '1px solid #DCE6F2', borderRadius: 1 }}
                      >
                        <Add sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                    {renderPalettePreview(item.type)}
                  </CardContent>
                </Card>
              </ListItem>
            ))}
            {availablePalette.length === 0 && (
              <ListItem sx={{ p: 2 }}>
                <Typography variant="body2" sx={{ color: '#6B7280' }}>
                  {isTr ? 'Tüm widgetlar zaten dashboardda.' : 'All widgets are already on the dashboard.'}
                </Typography>
              </ListItem>
            )}
          </List>
        </>
      </Drawer>
    </Box>
  );
}

function MetricCard({
  title,
  value,
  icon,
  onClick,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Card
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.12s ease, box-shadow 0.12s ease',
        '&:hover': onClick ? { transform: 'translateY(-1px)', boxShadow: `0 6px 16px ${alpha(navy[900], 0.12)}` } : undefined,
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 1.4, '&:last-child': { pb: 1.4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 700 }}>{title}</Typography>
            <Typography variant="h6" sx={{ mt: 0.4, fontWeight: 800, color: navy[800] }}>{value}</Typography>
          </Box>
          <Box sx={{ color: '#5F6B7C', bgcolor: '#EEF1F5', borderRadius: 1.5, p: 0.8 }}>{icon}</Box>
        </Box>
      </CardContent>
    </Card>
  );
}
