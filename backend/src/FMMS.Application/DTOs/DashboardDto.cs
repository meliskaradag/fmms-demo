namespace FMMS.Application.DTOs;

public class DashboardDto
{
    public int TotalWorkOrders { get; set; }
    public int OpenWorkOrders { get; set; }
    public int InProgressWorkOrders { get; set; }
    public int CompletedWorkOrders { get; set; }
    public int OverdueWorkOrders { get; set; }
    public int TotalAssets { get; set; }
    public int TotalStockCards { get; set; }
    public int LowStockItems { get; set; }
    public int ActiveServiceAgreements { get; set; }
    public List<WorkOrdersByStatusDto> WorkOrdersByStatus { get; set; } = new();
    public List<WorkOrdersByPriorityDto> WorkOrdersByPriority { get; set; } = new();
    public List<RecentWorkOrderDto> RecentWorkOrders { get; set; } = new();
    public List<TechnicianPerformanceDto> TechnicianPerformance { get; set; } = new();
    public List<LocationFaultHotspotDto> LocationFaultHotspots { get; set; } = new();
    public List<AssetHealthDto> AssetHealthScores { get; set; } = new();
    public ReliabilityMetricsDto ReliabilityMetrics { get; set; } = new();
    public MaintenanceMixDto MaintenanceMix { get; set; } = new();
    public List<StockConsumptionDto> StockConsumption { get; set; } = new();
    public List<BlockingMaterialDto> BlockingMaterials { get; set; } = new();
    public CostSummaryDto CostSummary { get; set; } = new();
    public List<WorkOrderAgingBucketDto> WorkOrderAging { get; set; } = new();
    public int PendingApprovals { get; set; }
    public List<CriticalEventDto> CriticalEvents { get; set; } = new();
    public List<KpiTargetDto> KpiTargets { get; set; } = new();
}

public class WorkOrdersByStatusDto
{
    public string Status { get; set; } = default!;
    public int Count { get; set; }
}

public class WorkOrdersByPriorityDto
{
    public string Priority { get; set; } = default!;
    public int Count { get; set; }
}

public class RecentWorkOrderDto
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = default!;
    public string Title { get; set; } = default!;
    public string Status { get; set; } = default!;
    public string Priority { get; set; } = default!;
    public DateTime CreatedAt { get; set; }
}

public class TechnicianPerformanceDto
{
    public string TechnicianId { get; set; } = default!;
    public string TechnicianName { get; set; } = default!;
    public int OpenAssignedCount { get; set; }
    public int BacklogCount { get; set; }
    public decimal AvgCompletionHours { get; set; }
}

public class LocationFaultHotspotDto
{
    public Guid LocationId { get; set; }
    public string LocationName { get; set; } = default!;
    public int FaultCount { get; set; }
    public Guid? ParentLocationId { get; set; }
    public string? ParentLocationName { get; set; }
    public int Level { get; set; }
    public string LocationPath { get; set; } = default!;
}

public class AssetHealthDto
{
    public Guid AssetId { get; set; }
    public string AssetName { get; set; } = default!;
    public int OpenIssues { get; set; }
    public int OverdueIssues { get; set; }
    public int HealthScore { get; set; }
}

public class ReliabilityMetricsDto
{
    public decimal MttrHours { get; set; }
    public decimal MtbfHours { get; set; }
}

public class MaintenanceMixDto
{
    public decimal CorrectivePercent { get; set; }
    public decimal PreventivePercent { get; set; }
    public decimal PredictivePercent { get; set; }
}

public class StockConsumptionDto
{
    public Guid StockCardId { get; set; }
    public string StockCardName { get; set; } = default!;
    public decimal ConsumedQuantity { get; set; }
    public decimal AvgDailyConsumption { get; set; }
    public int? EstimatedDaysRemaining { get; set; }
}

public class BlockingMaterialDto
{
    public string PlanName { get; set; } = default!;
    public string MaterialName { get; set; } = default!;
    public decimal RequiredQty { get; set; }
    public decimal AvailableQty { get; set; }
    public decimal DeficitQty { get; set; }
}

public class CostSummaryDto
{
    public decimal MonthlyMaintenanceCost { get; set; }
    public decimal MonthlyContractCost { get; set; }
    public decimal AvgWorkOrderCost { get; set; }
}

public class WorkOrderAgingBucketDto
{
    public string Bucket { get; set; } = default!;
    public int Count { get; set; }
}

public class CriticalEventDto
{
    public Guid WorkOrderId { get; set; }
    public string Title { get; set; } = default!;
    public string Priority { get; set; } = default!;
    public string Status { get; set; } = default!;
    public DateTime CreatedAt { get; set; }
}

public class KpiTargetDto
{
    public string Metric { get; set; } = default!;
    public decimal Target { get; set; }
    public decimal Actual { get; set; }
    public string Unit { get; set; } = default!;
}
