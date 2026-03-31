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
  stockNumber: string;
  name: string;
  unit: string;
  minStockLevel: number;
  currentBalance: number;
  createdAt: string;
}

export interface StockMovement {
  id: string;
  stockCardId: string;
  stockCardName: string;
  movementType: number;
  quantity: number;
  fromLocationId?: string;
  toLocationId?: string;
  notes?: string;
  createdAt: string;
  createdBy?: string;
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

// Service Agreements
export interface ServiceAgreement {
  id: string;
  agreementNumber: string;
  title: string;
  vendorName: string;
  scopeDescription?: string;
  startDate: string;
  endDate: string;
  slaResponseHours: number;
  slaResolutionHours: number;
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
  assetNumber: string;
  name: string;
  category: string;
  manufacturer: string;
  model: string;
  serialNumber?: string;
  status: number;
  locationId: string;
  locationName?: string;
  installationDate?: string;
  createdAt: string;
}

// Enums as string maps
export const WorkOrderStatusLabels: Record<number, string> = {
  0: 'Açık',
  1: 'Atandı',
  2: 'Devam Ediyor',
  3: 'Beklemede',
  4: 'Tamamlandı',
  5: 'Iptal',
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
