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
