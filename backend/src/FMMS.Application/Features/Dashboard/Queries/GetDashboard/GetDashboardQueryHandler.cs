using FMMS.Application.DTOs;
using FMMS.Domain.Entities;
using FMMS.Domain.Enums;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.Dashboard.Queries.GetDashboard;

public class GetDashboardQueryHandler : IRequestHandler<GetDashboardQuery, DashboardDto>
{
    private readonly IRepository<WorkOrder> _woRepo;
    private readonly IRepository<Asset> _assetRepo;
    private readonly IRepository<StockCard> _stockRepo;
    private readonly IRepository<StockBalance> _balanceRepo;
    private readonly IRepository<ServiceAgreement> _saRepo;

    public GetDashboardQueryHandler(
        IRepository<WorkOrder> woRepo,
        IRepository<Asset> assetRepo,
        IRepository<StockCard> stockRepo,
        IRepository<StockBalance> balanceRepo,
        IRepository<ServiceAgreement> saRepo)
    {
        _woRepo = woRepo;
        _assetRepo = assetRepo;
        _stockRepo = stockRepo;
        _balanceRepo = balanceRepo;
        _saRepo = saRepo;
    }

    public async Task<DashboardDto> Handle(GetDashboardQuery request, CancellationToken cancellationToken)
    {
        var workOrders = await _woRepo.GetAllAsync(cancellationToken);
        var assets = await _assetRepo.GetAllAsync(cancellationToken);
        var stockCards = await _stockRepo.GetAllAsync(cancellationToken);
        var balances = await _balanceRepo.GetAllAsync(cancellationToken);
        var agreements = await _saRepo.GetAllAsync(cancellationToken);

        // Compute low stock: cards where total balance <= min stock level
        var balanceByCard = balances.GroupBy(b => b.StockCardId)
            .ToDictionary(g => g.Key, g => g.Sum(b => b.CurrentStock));

        var lowStockCount = stockCards.Count(sc =>
        {
            var totalBalance = balanceByCard.GetValueOrDefault(sc.Id, 0);
            return totalBalance <= sc.MinStockLevel;
        });

        var now = DateTime.UtcNow;

        return new DashboardDto
        {
            TotalWorkOrders = workOrders.Count,
            OpenWorkOrders = workOrders.Count(w => w.Status == WorkOrderStatus.Open),
            InProgressWorkOrders = workOrders.Count(w => w.Status == WorkOrderStatus.InProgress),
            CompletedWorkOrders = workOrders.Count(w => w.Status == WorkOrderStatus.Completed),
            OverdueWorkOrders = workOrders.Count(w =>
                w.SlaDeadline.HasValue && w.SlaDeadline < now &&
                w.Status != WorkOrderStatus.Completed && w.Status != WorkOrderStatus.Cancelled),
            TotalAssets = assets.Count,
            TotalStockCards = stockCards.Count,
            LowStockItems = lowStockCount,
            ActiveServiceAgreements = agreements.Count(a => a.Status == AgreementStatus.Active),
            WorkOrdersByStatus = Enum.GetValues<WorkOrderStatus>()
                .Select(s => new WorkOrdersByStatusDto
                {
                    Status = s.ToString(),
                    Count = workOrders.Count(w => w.Status == s)
                }).Where(x => x.Count > 0).ToList(),
            WorkOrdersByPriority = Enum.GetValues<Priority>()
                .Select(p => new WorkOrdersByPriorityDto
                {
                    Priority = p.ToString(),
                    Count = workOrders.Count(w => w.Priority == p)
                }).Where(x => x.Count > 0).ToList(),
            RecentWorkOrders = workOrders.OrderByDescending(w => w.CreatedAt).Take(5)
                .Select(w => new RecentWorkOrderDto
                {
                    Id = w.Id,
                    OrderNumber = w.OrderNumber,
                    Title = w.Title,
                    Status = w.Status.ToString(),
                    Priority = w.Priority.ToString(),
                    CreatedAt = w.CreatedAt
                }).ToList()
        };
    }
}
