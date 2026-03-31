import apiClient from './client';
import type {
  PagedResult,
  DashboardData,
  WorkOrder,
  StockCard,
  StockMovement,
  MaintenanceCard,
  ServiceAgreement,
  Location,
  Asset,
} from '../types';

// Dashboard
export const getDashboard = () =>
  apiClient.get<DashboardData>('/dashboard').then(r => r.data);

// Work Orders
export const getWorkOrders = (params?: { status?: number; priority?: number; page?: number; pageSize?: number }) =>
  apiClient.get<PagedResult<WorkOrder>>('/workorders', { params }).then(r => r.data);

export const getWorkOrder = (id: string) =>
  apiClient.get<WorkOrder>(`/workorders/${id}`).then(r => r.data);

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
  apiClient.post<string>('/workorders', data).then(r => r.data);

export const assignWorkOrder = (id: string, data: { userId: string; role?: string }) =>
  apiClient.post<string>(`/workorders/${id}/assign`, data).then(r => r.data);

export const updateWorkOrderStatus = (id: string, newStatus: number) =>
  apiClient.put(`/workorders/${id}/status`, { newStatus });

export const requestPhotoUpload = (id: string, data: { photoType: number; fileName: string; contentType: string; gpsLat?: number; gpsLng?: number }) =>
  apiClient.post(`/workorders/${id}/photos/upload-url`, data).then(r => r.data);

// Stock Cards
export const getStockCards = (params?: { search?: string; page?: number; pageSize?: number }) =>
  apiClient.get<PagedResult<StockCard>>('/stockcards', { params }).then(r => r.data);

export const getLowStock = () =>
  apiClient.get<StockCard[]>('/stockcards/low-stock').then(r => r.data);

export const createStockCard = (data: {
  stockNumber: string; name: string; category: string; unit: string; minStockLevel: number; currentBalance: number;
}) =>
  apiClient.post<string>('/stockcards', data).then(r => r.data);

export const getStockMovements = (params?: { stockCardId?: string; page?: number; pageSize?: number }) =>
  apiClient.get<PagedResult<StockMovement>>('/stockmovements', { params }).then(r => r.data);

export const createStockMovement = (data: {
  stockCardId: string;
  movementType: number;
  quantity: number;
  fromLocationId?: string;
  toLocationId?: string;
  notes?: string;
}) =>
  apiClient.post<string>('/stockmovements', data).then(r => r.data);

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

// Service Agreements
export const getServiceAgreements = (params?: { page?: number; pageSize?: number }) =>
  apiClient.get<PagedResult<ServiceAgreement>>('/serviceagreements', { params }).then(r => r.data);

export const createServiceAgreement = (data: {
  agreementNumber: string; vendorId: string; title: string; description?: string;
  startDate: string; endDate: string; autoRenew: boolean;
  slaResponseHours: number; slaResolutionHours: number;
  cost: number; currency: string; status: number;
  coveredAssetIds: string[]; coveredMaintTypes?: string;
}) =>
  apiClient.post<string>('/serviceagreements', data).then(r => r.data);

// Locations
export const getLocationTree = () =>
  apiClient.get<Location[]>('/locations/tree').then(r => r.data);

export const createLocation = (data: { name: string; type: number; parentId?: string }) =>
  apiClient.post<string>('/locations', data).then(r => r.data);

// Assets
export const getAssets = (params?: { locationId?: string; page?: number; pageSize?: number }) =>
  apiClient.get<PagedResult<Asset>>('/assets', { params }).then(r => r.data);

export const createAsset = (data: {
  name: string; assetNumber: string; category: string; locationId: string;
  status: number; manufacturer: string; model: string; batchNumber: string;
  serialNumber?: string; installationDate?: string;
}) =>
  apiClient.post<string>('/assets', data).then(r => r.data);
