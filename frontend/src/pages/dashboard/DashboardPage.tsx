import { Grid, Card, CardContent, Typography, Box, Chip, Skeleton, Table, TableHead, TableRow, TableCell, TableBody, Button, alpha } from '@mui/material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Engineering as WOIcon,
  Warning as OverdueIcon,
  Inventory2 as StockIcon,
  DeviceHub as AssetIcon,
  Description as SAIcon,
  TrendingDown as LowStockIcon,
  ArrowForward,
  CheckCircleOutline,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import { useApi } from '../../hooks/useApi';
import { getDashboard } from '../../api/endpoints';
import { navy, accent } from '../../theme/theme';
import type { DashboardData } from '../../types';

const STATUS_COLORS: Record<string, string> = {
  Open: '#3B82F6',
  Assigned: '#8B5CF6',
  InProgress: '#F59E0B',
  OnHold: '#6B7280',
  Completed: '#059669',
  Cancelled: '#DC2626',
};

const PRIORITY_COLORS: Record<string, string> = {
  Low: '#10B981',
  Medium: '#3B82F6',
  High: '#F59E0B',
  Critical: '#EF4444',
};

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  bgGradient?: string;
  subtitle?: string;
  onClick?: () => void;
}

function KpiCard({ title, value, icon, color, bgGradient, subtitle, onClick }: KpiCardProps) {
  const isDark = !!bgGradient;
  return (
    <Card
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        background: bgGradient || '#fff',
        border: bgGradient ? 'none' : undefined,
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 24px ${alpha(color, 0.2)}`,
        } : {},
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography
              variant="caption"
              sx={{
                mb: 0.5,
                display: 'block',
                fontWeight: 600,
                color: isDark ? alpha('#fff', 0.7) : '#94A3B8',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontSize: '0.65rem',
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: isDark ? '#fff' : color,
                letterSpacing: '-0.02em',
              }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography
                variant="caption"
                sx={{ color: isDark ? alpha('#fff', 0.6) : '#94A3B8' }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              p: 1,
              borderRadius: '10px',
              bgcolor: isDark ? alpha('#fff', 0.12) : alpha(color, 0.08),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isDark ? '#fff' : color,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, loading } = useApi<DashboardData>(getDashboard);

  if (loading || !data) {
    return (
      <Box>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: navy[800] }}>{t('dashboard.title')}</Typography>
        <Grid container spacing={2.5}>
          {[...Array(6)].map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={i}>
              <Skeleton variant="rounded" height={120} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: navy[800], letterSpacing: '-0.02em' }}>
          {t('dashboard.title')}
        </Typography>
        <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.25 }}>
          {t('dashboard.subtitle')}
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <KpiCard
            title={t('dashboard.totalWorkOrders')}
            value={data.totalWorkOrders}
            icon={<WOIcon />}
            color={navy[600]}
            bgGradient={`linear-gradient(135deg, ${navy[700]} 0%, ${navy[800]} 100%)`}
            onClick={() => navigate('/work-orders')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <KpiCard title={t('dashboard.open')} value={data.openWorkOrders} icon={<WOIcon />} color="#3B82F6" onClick={() => navigate('/work-orders?status=0')} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <KpiCard title={t('dashboard.inProgress')} value={data.inProgressWorkOrders} icon={<WOIcon />} color="#F59E0B" onClick={() => navigate('/work-orders?status=2')} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <KpiCard title={t('dashboard.overdue')} value={data.overdueWorkOrders} icon={<OverdueIcon />} color="#DC2626" onClick={() => navigate('/work-orders?status=0')} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <KpiCard title={t('dashboard.assets')} value={data.totalAssets} icon={<AssetIcon />} color="#0D9488" onClick={() => navigate('/assets')} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <KpiCard title={t('dashboard.lowStock')} value={data.lowStockItems} icon={<LowStockIcon />} color={data.lowStockItems > 0 ? '#DC2626' : '#059669'} onClick={() => navigate('/stock-cards?lowStock=true')} />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: 340 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: navy[800], mb: 1 }}>
                {t('dashboard.workOrdersByStatus')}
              </Typography>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={data.workOrdersByStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={50}
                    paddingAngle={3}
                    strokeWidth={0}
                    label={({ status, count }) => `${status}: ${count}`}
                  >
                    {data.workOrdersByStatus.map((entry) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#999'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      fontSize: '0.8rem',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: 340 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: navy[800], mb: 1 }}>
                {t('dashboard.priorityDistribution')}
              </Typography>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.workOrdersByPriority} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="priority" width={70} tick={{ fontSize: 12, fontWeight: 500, fill: navy[700] }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      fontSize: '0.8rem',
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20}>
                    {data.workOrdersByPriority.map((entry) => (
                      <Cell key={entry.priority} fill={PRIORITY_COLORS[entry.priority] || '#999'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: 340 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: navy[800], mb: 2 }}>
                {t('dashboard.generalSummary')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { icon: <StockIcon fontSize="small" />, label: t('dashboard.stockCards'), value: data.totalStockCards, color: accent.main },
                  { icon: <SAIcon fontSize="small" />, label: t('dashboard.activeContracts'), value: data.activeServiceAgreements, color: '#0D9488' },
                  { icon: <CheckCircleOutline fontSize="small" />, label: t('dashboard.completed'), value: data.completedWorkOrders, color: '#059669' },
                  { icon: <AssetIcon fontSize="small" />, label: t('dashboard.totalAssets'), value: data.totalAssets, color: navy[500] },
                ].map((item, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 1.25,
                      borderRadius: '8px',
                      bgcolor: alpha(item.color, 0.04),
                      border: `1px solid ${alpha(item.color, 0.08)}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: item.color }}>
                      {item.icon}
                      <Typography variant="body2" sx={{ fontWeight: 500, color: navy[700] }}>
                        {item.label}
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: item.color }}>
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Work Orders */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2.5, pt: 2.5, pb: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: navy[800] }}>
              {t('dashboard.recentWorkOrders')}
            </Typography>
            <Button
              size="small"
              endIcon={<ArrowForward sx={{ fontSize: '0.9rem !important' }} />}
              onClick={() => navigate('/work-orders')}
              sx={{
                fontWeight: 600,
                color: accent.main,
                fontSize: '0.75rem',
                '&:hover': { bgcolor: alpha(accent.main, 0.06) },
              }}
            >
              {t('dashboard.viewAll')}
            </Button>
          </Box>
          <Table size="small">
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
              {data.recentWorkOrders.map((wo) => (
                <TableRow
                  key={wo.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/work-orders/${wo.id}`)}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.75rem', color: navy[600] }}>
                      {wo.orderNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: navy[800] }}>
                      {wo.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={wo.status}
                      size="small"
                      sx={{
                        bgcolor: alpha(STATUS_COLORS[wo.status] || '#999', 0.1),
                        color: STATUS_COLORS[wo.status] || '#999',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        height: 24,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={wo.priority}
                      size="small"
                      sx={{
                        bgcolor: alpha(PRIORITY_COLORS[wo.priority] || '#999', 0.1),
                        color: PRIORITY_COLORS[wo.priority] || '#999',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        height: 24,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '0.8rem' }}>
                      {new Date(wo.createdAt).toLocaleDateString('tr-TR')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
}
