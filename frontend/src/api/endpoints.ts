import apiClient from './client';
import type {
  PagedResult,
  DashboardData,
  WorkOrder,
  StockCard,
  StockCardTreeNode,
  StockVariant,
  StockMovement,
  MaintenanceCard,
  MaintenancePlan,
  MaintenancePlanRun,
  PeriodicMaintenanceExecutionResult,
  ServiceAgreement,
  Location,
  Asset,
  AssetHistory,
  AssetMovement,
  FaultReport,
} from '../types';

// Dashboard
export const getDashboard = () =>
  apiClient.get<DashboardData>('/dashboard').then(r => r.data);

// Work Orders
export const getWorkOrders = (params?: { status?: number; priority?: number; type?: number; locationId?: string; includeDescendants?: boolean; page?: number; pageSize?: number }) =>
  apiClient.get<PagedResult<WorkOrder>>('/work-orders', { params }).then(r => r.data);

export const getWorkOrder = (id: string) =>
  apiClient.get<WorkOrder>(`/work-orders/${id}`).then(r => r.data);

export const createWorkOrder = (data: {
  title: string;
  type: number;
  priority: number;
  locationId: string;
  reportedBy: string;
  description?: string;
  assetId?: string;
  scheduledStart?: string;
  slaDeadline?: string;
}) =>
  apiClient.post<string>('/work-orders', data).then(r => r.data);

export const assignWorkOrder = (id: string, data: { userId: string; role?: string }) =>
  apiClient.post<string>(`/work-orders/${id}/assign`, data).then(r => r.data);

export const updateWorkOrderStatus = (id: string, newStatus: number) =>
  apiClient.put(`/work-orders/${id}/status`, { newStatus });

export const requestPhotoUpload = (id: string, data: { photoType: number; fileName: string; contentType: string; gpsLat?: number; gpsLng?: number }) =>
  apiClient.post(`/work-orders/${id}/photos/upload-url`, data).then(r => r.data);

// Stock Cards
export const getStockCards = (params?: { search?: string; page?: number; pageSize?: number }) =>
  apiClient.get<PagedResult<StockCard>>('/stockcards', { params }).then(r => r.data);

export const getStockCardTree = () =>
  apiClient.get<StockCardTreeNode[]>('/stockcards/tree').then(r => r.data);

export const getLowStock = () =>
  apiClient.get<StockCard[]>('/stockcards/low-stock').then(r => r.data);

export const createStockCard = (data: {
  stockNumber: string;
  name: string;
  category: string;
  unit: string;
  minStockLevel: number;
  currentBalance: number;
  parentId?: string;
  nodeType?: string;
  barcode?: string;
  sku?: string;
  isVariantBased?: boolean;
  usesVariants?: boolean;
  serialTrackingEnabled?: boolean;
  barcodeRequired?: boolean;
  isActive?: boolean;
  description?: string;
}) =>
  apiClient.post<string>('/stockcards', data).then(r => r.data);

export const updateStockCard = (id: string, data: {
  stockNumber: string;
  name: string;
  category: string;
  unit: string;
  minStockLevel: number;
  barcode?: string;
  sku?: string;
  maxStockLevel?: number;
  criticalStockLevel?: number;
  isVariantBased?: boolean;
  serialTrackingEnabled?: boolean;
  barcodeRequired?: boolean;
  isActive?: boolean;
  nodeType?: string;
  description?: string;
}) =>
  apiClient.put(`/stockcards/${id}`, data).then(r => r.data);

export const getStockMovements = (params?: { stockCardId?: string; page?: number; pageSize?: number }) =>
  apiClient.get<PagedResult<StockMovement>>('/stockmovements', { params }).then(r => r.data);

export const createStockMovement = (data: {
  stockCardId: string;
  stockVariantId?: string;
  movementType: number;
  quantity: number;
  unit?: string;
  unitCost?: number;
  warehouseId?: string;
  locationId?: string;
  fromLocationId?: string;
  toLocationId?: string;
  selectedAssetIds?: string[];
  referenceType?: string;
  referenceId?: string;
  notes?: string;
}) =>
  apiClient.post<string>('/stockmovements', data).then(r => r.data);

export const getStockVariants = (stockCardId: string) =>
  apiClient.get<StockVariant[]>(`/stockcards/${stockCardId}/variants`).then(r => r.data);

export const createStockVariant = (stockCardId: string, data: {
  code: string;
  sku?: string;
  barcode?: string;
  name?: string;
  priceAdjustment: number;
  purchasePriceOverride?: number;
  salesPriceOverride?: number;
  attributes: { stockAttributeId: string; stockAttributeOptionId: string }[];
}) =>
  apiClient.post<string>(`/stockcards/${stockCardId}/variants`, data).then(r => r.data);

export const bulkGenerateStockVariants = (stockCardId: string, data: {
  variants: {
    code: string;
    sku?: string;
    barcode?: string;
    name?: string;
    priceAdjustment: number;
    purchasePriceOverride?: number;
    salesPriceOverride?: number;
    attributes: { stockAttributeId: string; stockAttributeOptionId: string }[];
  }[];
}) =>
  apiClient.post<string[]>(`/stockcards/${stockCardId}/variants/bulk`, data).then(r => r.data);

export const attachStockCardAttributes = (stockCardId: string, data: {
  attributes: { stockAttributeId: string; isRequired: boolean; sortOrder: number }[];
}) =>
  apiClient.post(`/stockcards/${stockCardId}/attributes`, data);

export const generateVariantBarcode = (stockVariantId: string) =>
  apiClient.post<string>(`/stockcards/variants/${stockVariantId}/generate-barcode`, {}).then(r => r.data);

// Maintenance Cards
export const getMaintenanceCards = (params?: { page?: number; pageSize?: number }) =>
  apiClient.get<PagedResult<MaintenanceCard>>('/maintenancecards', { params }).then(r => r.data);

export const getMaintenanceCard = (id: string) =>
  apiClient.get<MaintenanceCard>(`/maintenancecards/${id}`).then(r => r.data);

export const createMaintenanceCard = (data: {
  name: string; assetCategory?: string; description?: string; level: number;
  estimatedDuration?: string; defaultPeriodDays: number; isTemplate: boolean;
  steps: { stepOrder: number; instruction: string; stepStatus: number; estimatedMinutes: number }[];
  materials: { stockCardId: string; quantity: number }[];
}) =>
  apiClient.post<string>('/maintenancecards', data).then(r => r.data);

// Maintenance Plans
export const getMaintenancePlans = (params?: { page?: number; pageSize?: number; isActive?: boolean }) =>
  apiClient.get<PagedResult<MaintenancePlan>>('/maintenanceplans', { params }).then(r => r.data);

export const createMaintenancePlan = (data: {
  name: string;
  maintenanceCardId: string;
  assetId?: string;
  triggerType: number;
  firstDueAt?: string;
  frequencyDays?: number;
  meterInterval?: number;
  initialMeterReading: number;
  priority: number;
  isActive: boolean;
}) =>
  apiClient.post<string>('/maintenanceplans', data).then(r => r.data);

export const getMaintenancePlanRuns = (params?: { planId?: string; page?: number; pageSize?: number }) =>
  apiClient.get<PagedResult<MaintenancePlanRun>>('/maintenanceplans/runs', { params }).then(r => r.data);

export const updateMaintenancePlanMeter = (id: string, currentMeterReading: number) =>
  apiClient.put(`/maintenanceplans/${id}/meter`, { currentMeterReading });

export const updateMaintenancePlan = (id: string, data: {
  name: string;
  firstDueAt?: string;
  frequencyDays?: number;
  priority: number;
  isActive: boolean;
}) =>
  apiClient.put(`/maintenanceplans/${id}`, data);

export const runMaintenancePlannerNow = () =>
  apiClient.post<PeriodicMaintenanceExecutionResult>('/maintenanceplans/run-now', {}).then(r => r.data);

// Service Agreements
export const getServiceAgreements = (params?: { page?: number; pageSize?: number }) =>
  apiClient.get<PagedResult<ServiceAgreement>>('/serviceagreements', { params }).then(r => r.data);

export const createServiceAgreement = (data: {
  agreementNumber: string; vendorId: string; contactInfo?: string;
  startDate: string; endDate: string; autoRenew: boolean;
  slaResponseHours: number; slaResolutionHours: number;
  cost: number; currency: string; status: number;
  coveredAssetIds: string[]; coveredStockCardIds?: string[];
}) =>
  apiClient.post<string>('/serviceagreements', data).then(r => r.data);

// Locations
export const getLocationTree = () =>
  apiClient.get<Location[]>('/locations/tree').then(r => r.data);

export const createLocation = (data: { name: string; type: number; parentId?: string }) =>
  apiClient.post<string>('/locations', data).then(r => r.data);

// Assets
export const getAssets = (params?: {
  locationId?: string;
  stockCardId?: string;
  status?: number;
  condition?: number;
  assigned?: boolean;
  warrantyState?: number;
  keyword?: string;
  serialNumber?: string;
  page?: number;
  pageSize?: number;
}) =>
  apiClient.get<PagedResult<Asset>>('/assets', { params }).then(r => r.data);

export const getAsset = (id: string) =>
  apiClient.get<Asset>(`/assets/${id}`).then(r => r.data);

export const createAsset = (data: {
  name: string;
  assetTag?: string;
  assetNumber: string;
  itemId?: string;
  category: string;
  locationId: string;
  departmentId?: string;
  assignedToUserId?: string;
  parentAssetId?: string;
  status: number;
  condition?: number;
  barcode?: string;
  qrCode?: string;
  installationDate?: string;
  batchNumber: string;
  manufacturer: string;
  brand?: string;
  model: string;
  serialNumber?: string;
  specifications?: string;
  stockCardId: string;
  supplierId?: string;
  purchaseDate?: string;
  purchaseCost?: number;
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  description?: string;
  notes?: string;
  metadata?: string;
}) =>
  apiClient.post<string>('/assets', data).then(r => r.data);

export const updateAsset = (id: string, data: {
  name: string;
  assetTag?: string;
  assetNumber: string;
  itemId?: string;
  category: string;
  locationId: string;
  departmentId?: string;
  assignedToUserId?: string;
  parentAssetId?: string;
  status: number;
  condition: number;
  barcode?: string;
  qrCode?: string;
  nfcTagId?: string;
  installationDate?: string;
  batchNumber: string;
  manufacturer: string;
  brand?: string;
  model: string;
  serialNumber?: string;
  specifications?: string;
  stockCardId: string;
  supplierId?: string;
  purchaseDate?: string;
  purchaseCost?: number;
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  description?: string;
  notes?: string;
  metadata?: string;
}) =>
  apiClient.put(`/assets/${id}`, data);

export const updateAssetStatus = (id: string, data: { status: number; note?: string }) =>
  apiClient.patch(`/assets/${id}/status`, data);

export const assignAsset = (id: string, data: { toUserId: string; reason?: string; notes?: string }) =>
  apiClient.post(`/assets/${id}/assign`, data);

export const unassignAsset = (id: string, data?: { reason?: string; notes?: string }) =>
  apiClient.post(`/assets/${id}/unassign`, data ?? {});

export const transferAsset = (id: string, data: { toLocationId: string; reason?: string; notes?: string }) =>
  apiClient.post(`/assets/${id}/transfer`, data);

export const getAssetHistory = (id: string) =>
  apiClient.get<AssetHistory[]>(`/assets/${id}/history`).then(r => r.data);

export const getAssetMovements = (id: string) =>
  apiClient.get<AssetMovement[]>(`/assets/${id}/movements`).then(r => r.data);

// Fault Reports
export const getFaultReports = (params?: { status?: string; reportedBy?: string; page?: number; pageSize?: number }) =>
  apiClient.get<PagedResult<FaultReport>>('/fault-reports', { params }).then(r => r.data);

export const getFaultReport = (id: string) =>
  apiClient.get<FaultReport>(`/fault-reports/${id}`).then(r => r.data);

export const createFaultReport = (data: {
  title: string;
  description?: string;
  locationId: string;
  assetId?: string;
  priority: string;
  reportedBy: string;
}) =>
  apiClient.post<string>('/fault-reports', data).then(r => r.data);

export const reviewFaultReport = (id: string, data: { newStatus: string; reviewedBy: string; reviewNote?: string }) =>
  apiClient.put(`/fault-reports/${id}/review`, data);

export const createWorkOrderFromFaultReport = (id: string, data: { reviewedBy: string }) =>
  apiClient.post<string>(`/fault-reports/${id}/create-work-order`, data).then(r => r.data);
