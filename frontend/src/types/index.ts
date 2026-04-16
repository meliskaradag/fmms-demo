// Common types
export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

// Dashboard
export interface DashboardData {
  totalWorkOrders: number;
  openWorkOrders: number;
  inProgressWorkOrders: number;
  completedWorkOrders: number;
  overdueWorkOrders: number;
  totalAssets: number;
  totalStockCards: number;
  lowStockItems: number;
  activeServiceAgreements: number;
  workOrdersByStatus: { status: string; count: number }[];
  workOrdersByPriority: { priority: string; count: number }[];
  recentWorkOrders: RecentWorkOrder[];
  technicianPerformance: TechnicianPerformance[];
  locationFaultHotspots: LocationFaultHotspot[];
  assetHealthScores: AssetHealthScore[];
  reliabilityMetrics: ReliabilityMetrics;
  maintenanceMix: MaintenanceMix;
  stockConsumption: StockConsumption[];
  blockingMaterials: BlockingMaterial[];
  costSummary: CostSummary;
  workOrderAging: WorkOrderAgingBucket[];
  pendingApprovals: number;
  criticalEvents: CriticalEvent[];
  kpiTargets: KpiTarget[];
}

export interface RecentWorkOrder {
  id: string;
  orderNumber: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
}

// Work Orders
export interface WorkOrder {
  id: string;
  orderNumber: string;
  title: string;
  type: number;
  priority: number;
  status: number;
  locationId: string;
  locationName?: string;
  description?: string;
  assetId?: string;
  assetName?: string;
  reportedBy: string;
  scheduledStart?: string;
  actualStart?: string;
  actualEnd?: string;
  slaDeadline?: string;
  isOverdue: boolean;
  assignees: WorkOrderAssignee[];
  photos: WorkOrderPhoto[];
  createdAt: string;
}

export interface WorkOrderAssignee {
  id: string;
  userId: string;
  role: string;
  assignedAt: string;
}

export interface WorkOrderPhoto {
  id: string;
  photoType: number;
  fileName: string;
  downloadUrl?: string;
  gpsLat: number;
  gpsLng: number;
  capturedBy?: string;
  createdAt: string;
}

// Stock Cards
export interface StockCard {
  id: string;
  parentId?: string;
  nodeType: string;
  stockNumber: string;
  name: string;
  barcode?: string;
  sku?: string;
  category: string;
  unit: string;
  hierarchyLevel: number;
  hierarchyPath: string;
  minStockLevel: number;
  maxStockLevel?: number;
  criticalStockLevel?: number;
  currentBalance: number;
  isVariantBased: boolean;
  serialTrackingEnabled: boolean;
  barcodeRequired: boolean;
  variantCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface TechnicianPerformance {
  technicianId: string;
  technicianName: string;
  openAssignedCount: number;
  backlogCount: number;
  avgCompletionHours: number;
}

export interface LocationFaultHotspot {
  locationId: string;
  locationName: string;
  faultCount: number;
  parentLocationId?: string;
  parentLocationName?: string;
  level?: number;
  locationPath?: string;
}

export interface AssetHealthScore {
  assetId: string;
  assetName: string;
  openIssues: number;
  overdueIssues: number;
  healthScore: number;
}

export interface ReliabilityMetrics {
  mttrHours: number;
  mtbfHours: number;
}

export interface MaintenanceMix {
  correctivePercent: number;
  preventivePercent: number;
  predictivePercent: number;
}

export interface StockConsumption {
  stockCardId: string;
  stockCardName: string;
  consumedQuantity: number;
  avgDailyConsumption: number;
  estimatedDaysRemaining?: number;
}

export interface BlockingMaterial {
  planName: string;
  materialName: string;
  requiredQty: number;
  availableQty: number;
  deficitQty: number;
}

export interface CostSummary {
  monthlyMaintenanceCost: number;
  monthlyContractCost: number;
  avgWorkOrderCost: number;
}

export interface WorkOrderAgingBucket {
  bucket: string;
  count: number;
}

export interface CriticalEvent {
  workOrderId: string;
  title: string;
  priority: string;
  status: string;
  createdAt: string;
}

export interface KpiTarget {
  metric: string;
  target: number;
  actual: number;
  unit: string;
}

export interface StockCardTreeNode {
  id: string;
  parentId?: string;
  nodeType: string;
  stockNumber: string;
  name: string;
  barcode?: string;
  sku?: string;
  isActive: boolean;
  isLowStock: boolean;
  hierarchyLevel: number;
  hierarchyPath: string;
  children: StockCardTreeNode[];
}

export interface StockMovement {
  id: string;
  stockCardId: string;
  stockVariantId?: string;
  stockCardName: string;
  stockVariantName?: string;
  movementType: number;
  quantity: number;
  unit: string;
  unitCost?: number;
  totalCost?: number;
  warehouseId?: string;
  locationId?: string;
  fromLocationId?: string;
  toLocationId?: string;
  notes?: string;
  selectedAssetIds?: string[];
  performedAt: string;
  createdAt: string;
  createdBy?: string;
}

export interface StockVariant {
  id: string;
  stockCardId: string;
  code: string;
  sku?: string;
  barcode?: string;
  name: string;
  variantSummary?: string;
  priceAdjustment: number;
  purchasePriceOverride?: number;
  salesPriceOverride?: number;
  currentBalance: number;
  isActive: boolean;
  createdAt: string;
}

// Maintenance Cards
export interface MaintenanceCard {
  id: string;
  name: string;
  assetCategory?: string;
  description?: string;
  level: number;
  estimatedDuration?: string;
  defaultPeriodDays: number;
  isTemplate: boolean;
  steps: MaintenanceCardStep[];
  materials: MaintenanceCardMaterial[];
  createdAt: string;
}

export interface MaintenanceCardStep {
  id: string;
  stepOrder: number;
  instruction: string;
  stepStatus: number;
  estimatedMinutes: number;
}

export interface MaintenanceCardMaterial {
  id: string;
  stockCardId: string;
  stockCardName: string;
  quantity: number;
  unit: string;
}

export interface MaintenancePlan {
  id: string;
  name: string;
  maintenanceCardId: string;
  maintenanceCardName: string;
  assetId?: string;
  assetName: string;
  triggerType: number;
  frequencyDays?: number;
  meterInterval?: number;
  currentMeterReading: number;
  nextDueAt?: string;
  nextDueMeter?: number;
  lastRunAt?: string;
  priority: number;
  isActive: boolean;
  createdAt: string;
}

export interface MaintenancePlanRun {
  id: string;
  maintenancePlanId: string;
  maintenancePlanName: string;
  assetName: string;
  workOrderId?: string;
  triggeredAt: string;
  triggerReason: string;
  status: number;
  createdAt: string;
}

export interface PeriodicMaintenanceExecutionResult {
  workOrdersCreated: number;
  blockedByStock: number;
  skippedExistingOpenWorkOrder: number;
}

// Service Agreements
export interface ServiceAgreement {
  id: string;
  agreementNumber: string;
  vendorName: string;
  contactInfo: string;
  startDate: string;
  endDate: string;
  slaResponseHours: number;
  slaResolutionHours: number;
  coveredAssetIds: string[];
  coveredStockCardIds: string[];
  cost: number;
  currency: string;
  status: number;
  createdAt: string;
}

// Locations
export interface Location {
  id: string;
  name: string;
  type: number;
  parentId?: string;
  children: Location[];
  createdAt: string;
}

// Assets
export interface Asset {
  id: string;
  assetTag: string;
  itemId?: string;
  assetNumber: string;
  name: string;
  category: string;
  condition: number;
  departmentId?: string;
  assignedToUserId?: string;
  manufacturer: string;
  brand?: string;
  model: string;
  serialNumber?: string;
  stockCardId?: string;
  specifications?: string;
  status: number;
  parentAssetId?: string;
  locationId: string;
  locationName?: string;
  installationDate?: string;
  purchaseDate?: string;
  purchaseCost?: number;
  supplierId?: string;
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  warrantyState: number;
  description?: string;
  notes?: string;
  barcode?: string;
  qrCode?: string;
  updatedAt?: string;
  createdAt: string;
}

export interface AssetHistory {
  id: string;
  assetId: string;
  actionType: number;
  oldValue?: string;
  newValue?: string;
  performedBy?: string;
  performedAt: string;
  referenceType?: string;
  referenceId?: string;
  note?: string;
}

export interface AssetMovement {
  id: string;
  assetId: string;
  movementType: number;
  fromLocationId?: string;
  toLocationId?: string;
  fromUserId?: string;
  toUserId?: string;
  reason?: string;
  movedBy?: string;
  movedAt: string;
  notes?: string;
}

// Fault Reports
export interface FaultReport {
  id: string;
  title: string;
  description?: string;
  locationId: string;
  locationName?: string;
  assetId?: string;
  assetName?: string;
  priority: string;
  status: string;
  reportedBy: string;
  reviewedBy?: string;
  reviewNote?: string;
  linkedWorkOrderId?: string;
  photos: FaultReportPhoto[];
  createdAt: string;
}

export interface FaultReportPhoto {
  id: string;
  fileName: string;
  contentType: string;
  base64Data: string;
  gpsLat: number;
  gpsLng: number;
  createdAt: string;
}

export const FaultReportStatusLabels: Record<string, string> = {
  Open: 'Açık',
  UnderReview: 'İnceleniyor',
  Accepted: 'Kabul Edildi',
  Rejected: 'Reddedildi',
};

export const FaultReportStatusColors: Record<string, string> = {
  Open: '#FF9800',
  UnderReview: '#1976D2',
  Accepted: '#388E3C',
  Rejected: '#D32F2F',
};

// Enums as string maps
export const WorkOrderStatusLabels: Record<number, string> = {
  0: 'Açık',
  1: 'Atandı',
  2: 'Devam Ediyor',
  3: 'Beklemede',
  4: 'Tamamlandı',
  5: 'İptal',
};

export const WorkOrderStatusColors: Record<number, string> = {
  0: '#1976D2',
  1: '#7B1FA2',
  2: '#F57C00',
  3: '#616161',
  4: '#388E3C',
  5: '#D32F2F',
};

export const PriorityLabels: Record<number, string> = {
  0: 'Düşük',
  1: 'Normal',
  2: 'Yüksek',
  3: 'Kritik',
};

export const PriorityColors: Record<number, string> = {
  0: '#4CAF50',
  1: '#2196F3',
  2: '#FF9800',
  3: '#F44336',
};

export const WorkOrderTypeLabels: Record<number, string> = {
  0: 'Arıza',
  1: 'Periyodik',
  2: 'Kestirimci',
};

export const MaintenanceLevelLabels: Record<number, string> = {
  0: 'Temel',
  1: 'Standart',
  2: 'Kapsamlı',
  3: 'Uzman',
};

export const AgreementStatusLabels: Record<number, string> = {
  0: 'Aktif',
  1: 'Askıda',
  2: 'Sona Erdi',
  3: 'İptal',
};

export const PhotoTypeLabels: Record<number, string> = {
  0: 'Önce',
  1: 'Sırasında',
  2: 'Sonra',
};

export const MaintenancePlanTriggerTypeLabels: Record<number, string> = {
  0: 'Zaman Bazlı',
  1: 'Sayaç Bazlı',
  2: 'Hibrit',
};
