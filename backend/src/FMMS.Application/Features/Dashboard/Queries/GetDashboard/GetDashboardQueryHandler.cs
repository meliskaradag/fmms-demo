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
    private readonly IRepository<WorkOrderAssignee> _assigneeRepo;
    private readonly IRepository<Location> _locationRepo;
    private readonly IRepository<MaintenancePlan> _planRepo;
    private readonly IRepository<MaintenanceCardMaterial> _cardMaterialRepo;
    private readonly IRepository<StockMovement> _movementRepo;

    public GetDashboardQueryHandler(
        IRepository<WorkOrder> woRepo,
        IRepository<Asset> assetRepo,
        IRepository<StockCard> stockRepo,
        IRepository<StockBalance> balanceRepo,
        IRepository<ServiceAgreement> saRepo,
        IRepository<WorkOrderAssignee> assigneeRepo,
        IRepository<Location> locationRepo,
        IRepository<MaintenancePlan> planRepo,
        IRepository<MaintenanceCardMaterial> cardMaterialRepo,
        IRepository<StockMovement> movementRepo)
    {
        _woRepo = woRepo;
        _assetRepo = assetRepo;
        _stockRepo = stockRepo;
        _balanceRepo = balanceRepo;
        _saRepo = saRepo;
        _assigneeRepo = assigneeRepo;
        _locationRepo = locationRepo;
        _planRepo = planRepo;
        _cardMaterialRepo = cardMaterialRepo;
        _movementRepo = movementRepo;
    }

    public async Task<DashboardDto> Handle(GetDashboardQuery request, CancellationToken cancellationToken)
    {
        var workOrders = await _woRepo.GetAllAsync(cancellationToken);
        var assets = await _assetRepo.GetAllAsync(cancellationToken);
        var stockCards = await _stockRepo.GetAllAsync(cancellationToken);
        var balances = await _balanceRepo.GetAllAsync(cancellationToken);
        var agreements = await _saRepo.GetAllAsync(cancellationToken);
        var assignees = await _assigneeRepo.GetAllAsync(cancellationToken);
        var locations = await _locationRepo.GetAllAsync(cancellationToken);
        var plans = await _planRepo.GetAllAsync(cancellationToken);
        var cardMaterials = await _cardMaterialRepo.GetAllAsync(cancellationToken);
        var movements = await _movementRepo.GetAllAsync(cancellationToken);

        var balanceByCard = balances.GroupBy(b => b.StockCardId)
            .ToDictionary(g => g.Key, g => g.Sum(b => b.CurrentStock));

        var lowStockCount = stockCards.Count(sc =>
        {
            var totalBalance = balanceByCard.GetValueOrDefault(sc.Id, 0);
            return totalBalance <= sc.MinStockLevel;
        });

        var now = DateTime.UtcNow;
        var openStatuses = new[]
        {
            WorkOrderStatus.Open,
            WorkOrderStatus.Assigned,
            WorkOrderStatus.InProgress,
            WorkOrderStatus.OnHold
        };

        var locationMap = locations.ToDictionary(l => l.Id, l => l.Name);
        var stockCardMap = stockCards.ToDictionary(s => s.Id, s => s);

        var completionHours = workOrders
            .Where(w => w.ActualStart.HasValue && w.ActualEnd.HasValue && w.ActualEnd > w.ActualStart)
            .Select(w => (decimal)(w.ActualEnd!.Value - w.ActualStart!.Value).TotalHours)
            .ToList();

        var correctiveOrders = workOrders.Where(w => w.Type == WorkOrderType.Corrective).OrderBy(w => w.CreatedAt).ToList();

        var mtbfIntervals = correctiveOrders
            .Where(w => w.AssetId.HasValue)
            .GroupBy(w => w.AssetId!.Value)
            .SelectMany(g => g.OrderBy(x => x.CreatedAt).Zip(
                g.OrderBy(x => x.CreatedAt).Skip(1),
                (first, second) => (decimal)(second.CreatedAt - first.CreatedAt).TotalHours))
            .Where(hours => hours > 0)
            .ToList();

        var last60Days = now.AddDays(-60);
        var outMovements = movements
            .Where(m => m.MovementType == MovementType.Out && m.CreatedAt >= last60Days)
            .ToList();

        var periodDays = Math.Max((decimal)(now - last60Days).TotalDays, 1m);

        var stockConsumption = outMovements
            .GroupBy(m => m.StockCardId)
            .Select(g =>
            {
                var totalOut = g.Sum(x => x.Quantity);
                var avgDaily = totalOut / periodDays;
                var available = balanceByCard.GetValueOrDefault(g.Key, 0m);
                var estimatedDays = avgDaily > 0 ? (int?)Math.Max((int)Math.Floor(available / avgDaily), 0) : null;

                return new StockConsumptionDto
                {
                    StockCardId = g.Key,
                    StockCardName = stockCardMap.GetValueOrDefault(g.Key)?.Name ?? "Unknown",
                    ConsumedQuantity = Math.Round(totalOut, 2),
                    AvgDailyConsumption = Math.Round(avgDaily, 2),
                    EstimatedDaysRemaining = estimatedDays
                };
            })
            .OrderByDescending(x => x.ConsumedQuantity)
            .Take(5)
            .ToList();

        var activePlans = plans.Where(p => p.IsActive).ToList();

        var blockingMaterials = activePlans
            .Join(cardMaterials, p => p.MaintenanceCardId, m => m.CardId, (p, m) => new { Plan = p, Material = m })
            .Select(x =>
            {
                var available = balanceByCard.GetValueOrDefault(x.Material.StockCardId, 0m);
                return new
                {
                    x.Plan.Name,
                    StockCardId = x.Material.StockCardId,
                    Required = x.Material.Quantity,
                    Available = available
                };
            })
            .Where(x => x.Available < x.Required)
            .Select(x => new BlockingMaterialDto
            {
                PlanName = x.Name,
                MaterialName = stockCardMap.GetValueOrDefault(x.StockCardId)?.Name ?? "Unknown",
                RequiredQty = x.Required,
                AvailableQty = x.Available,
                DeficitQty = Math.Round(x.Required - x.Available, 2)
            })
            .OrderByDescending(x => x.DeficitQty)
            .Take(6)
            .ToList();

        var last30Days = now.AddDays(-30);

        var monthlyMaintenanceCost = outMovements
            .Where(m => m.CreatedAt >= last30Days)
            .Sum(m =>
            {
                var unitPrice = stockCardMap.GetValueOrDefault(m.StockCardId)?.UnitPrice ?? 0m;
                return unitPrice * m.Quantity;
            });

        var monthlyContractCost = agreements
            .Where(a => a.Status == AgreementStatus.Active)
            .Sum(a => a.Cost / 12m);

        var completedLast30Days = workOrders.Count(w => w.Status == WorkOrderStatus.Completed && w.ActualEnd.HasValue && w.ActualEnd.Value >= last30Days);

        var avgWorkOrderCost = completedLast30Days > 0 ? monthlyMaintenanceCost / completedLast30Days : 0m;

        var technicianMap = new Dictionary<Guid, string>
        {
            [Guid.Parse("b0000000-0000-0000-0000-000000000002")] = "Ahmet Yilmaz",
            [Guid.Parse("b0000000-0000-0000-0000-000000000003")] = "Elif Demir",
            [Guid.Parse("b0000000-0000-0000-0000-000000000004")] = "Murat Aydin"
        };

        var woMap = workOrders.ToDictionary(w => w.Id, w => w);

        var technicianPerformance = assignees
            .GroupBy(a => a.UserId)
            .Select(g =>
            {
                var assignedOrders = g
                    .Select(a => woMap.GetValueOrDefault(a.WorkOrderId))
                    .Where(w => w is not null)
                    .Cast<WorkOrder>()
                    .ToList();

                var completed = assignedOrders
                    .Where(w => w.Status == WorkOrderStatus.Completed && w.ActualStart.HasValue && w.ActualEnd.HasValue && w.ActualEnd > w.ActualStart)
                    .Select(w => (decimal)(w.ActualEnd!.Value - w.ActualStart!.Value).TotalHours)
                    .ToList();

                var openAssigned = assignedOrders.Count(w => openStatuses.Contains(w.Status));
                var backlog = assignedOrders.Count(w => openStatuses.Contains(w.Status) && w.SlaDeadline.HasValue && w.SlaDeadline.Value < now);

                return new TechnicianPerformanceDto
                {
                    TechnicianId = g.Key.ToString(),
                    TechnicianName = technicianMap.GetValueOrDefault(g.Key, $"User {g.Key.ToString()[..8]}"),
                    OpenAssignedCount = openAssigned,
                    BacklogCount = backlog,
                    AvgCompletionHours = completed.Count > 0 ? Math.Round(completed.Average(), 2) : 0m
                };
            })
            .OrderByDescending(x => x.OpenAssignedCount)
            .Take(5)
            .ToList();

        var faultCountByLocationId = correctiveOrders
            .GroupBy(w => w.LocationId)
            .ToDictionary(g => g.Key, g => g.Count());

        var locationById = locations.ToDictionary(l => l.Id, l => l);

        static int ResolveLocationLevel(Location location, IReadOnlyDictionary<Guid, Location> allLocations)
        {
            var visited = new HashSet<Guid> { location.Id };
            var level = 0;
            var cursor = location;

            while (cursor.ParentId.HasValue && allLocations.TryGetValue(cursor.ParentId.Value, out var parent))
            {
                if (!visited.Add(parent.Id)) break;
                level++;
                cursor = parent;
            }

            return level;
        }

        static string ResolveLocationPath(Location location, IReadOnlyDictionary<Guid, Location> allLocations)
        {
            var names = new List<string> { location.Name };
            var visited = new HashSet<Guid> { location.Id };
            var cursor = location;

            while (cursor.ParentId.HasValue && allLocations.TryGetValue(cursor.ParentId.Value, out var parent))
            {
                if (!visited.Add(parent.Id)) break;
                names.Add(parent.Name);
                cursor = parent;
            }

            names.Reverse();
            return string.Join(" / ", names);
        }

        var locationFaultHotspots = locations
            .Select(location => new LocationFaultHotspotDto
            {
                LocationId = location.Id,
                LocationName = location.Name,
                FaultCount = faultCountByLocationId.GetValueOrDefault(location.Id, 0),
                ParentLocationId = location.ParentId,
                ParentLocationName = location.ParentId.HasValue
                    ? locationMap.GetValueOrDefault(location.ParentId.Value)
                    : null,
                Level = ResolveLocationLevel(location, locationById),
                LocationPath = ResolveLocationPath(location, locationById)
            })
            .OrderBy(x => x.Level)
            .ThenBy(x => x.ParentLocationName)
            .ThenByDescending(x => x.FaultCount)
            .ThenBy(x => x.LocationName)
            .ToList();

        var assetHealth = assets
            .Select(asset =>
            {
                var related = workOrders.Where(w => w.AssetId == asset.Id).ToList();
                var openIssues = related.Count(w => openStatuses.Contains(w.Status));
                var overdueIssues = related.Count(w =>
                    openStatuses.Contains(w.Status) &&
                    w.SlaDeadline.HasValue &&
                    w.SlaDeadline.Value < now);
                var rawScore = 100 - (openIssues * 12) - (overdueIssues * 18);
                var healthScore = Math.Clamp(rawScore, 0, 100);

                return new AssetHealthDto
                {
                    AssetId = asset.Id,
                    AssetName = asset.Name,
                    OpenIssues = openIssues,
                    OverdueIssues = overdueIssues,
                    HealthScore = healthScore
                };
            })
            .OrderBy(x => x.HealthScore)
            .Take(6)
            .ToList();

        var totalByType = Math.Max(workOrders.Count, 1);

        var maintenanceMix = new MaintenanceMixDto
        {
            CorrectivePercent = Math.Round(workOrders.Count(w => w.Type == WorkOrderType.Corrective) * 100m / totalByType, 1),
            PreventivePercent = Math.Round(workOrders.Count(w => w.Type == WorkOrderType.Preventive) * 100m / totalByType, 1),
            PredictivePercent = Math.Round(workOrders.Count(w => w.Type == WorkOrderType.Predictive) * 100m / totalByType, 1)
        };

        var workOrderAging = new List<WorkOrderAgingBucketDto>
        {
            new()
            {
                Bucket = "0-2 days",
                Count = workOrders.Count(w => openStatuses.Contains(w.Status) && (now - w.CreatedAt).TotalDays <= 2)
            },
            new()
            {
                Bucket = "3-7 days",
                Count = workOrders.Count(w => openStatuses.Contains(w.Status) && (now - w.CreatedAt).TotalDays > 2 && (now - w.CreatedAt).TotalDays <= 7)
            },
            new()
            {
                Bucket = "8-14 days",
                Count = workOrders.Count(w => openStatuses.Contains(w.Status) && (now - w.CreatedAt).TotalDays > 7 && (now - w.CreatedAt).TotalDays <= 14)
            },
            new()
            {
                Bucket = "15+ days",
                Count = workOrders.Count(w => openStatuses.Contains(w.Status) && (now - w.CreatedAt).TotalDays > 14)
            }
        };

        var assignedWoIds = assignees.Select(a => a.WorkOrderId).Distinct().ToHashSet();

        var pendingApprovals = workOrders.Count(w =>
            w.Status == WorkOrderStatus.Open &&
            (w.Priority == Priority.High || w.Priority == Priority.Critical) &&
            !assignedWoIds.Contains(w.Id));

        var criticalEvents = workOrders
            .Where(w =>
                (w.Priority == Priority.High || w.Priority == Priority.Critical) &&
                w.Status != WorkOrderStatus.Completed &&
                w.Status != WorkOrderStatus.Cancelled)
            .OrderByDescending(w => w.CreatedAt)
            .Take(6)
            .Select(w => new CriticalEventDto
            {
                WorkOrderId = w.Id,
                Title = w.Title,
                Priority = w.Priority.ToString(),
                Status = w.Status.ToString(),
                CreatedAt = w.CreatedAt
            })
            .ToList();

        var onTimeCompletionRate = workOrders.Count == 0
            ? 0m
            : Math.Round(workOrders.Count(w => w.Status == WorkOrderStatus.Completed && (!w.SlaDeadline.HasValue || (w.ActualEnd.HasValue && w.ActualEnd.Value <= w.SlaDeadline.Value))) * 100m / workOrders.Count, 1);

        var criticalBacklog = workOrders.Count(w =>
            openStatuses.Contains(w.Status) &&
            (w.Priority == Priority.High || w.Priority == Priority.Critical));

        var kpiTargets = new List<KpiTargetDto>
        {
            new() { Metric = "On-time completion", Target = 90m, Actual = onTimeCompletionRate, Unit = "%" },
            new() { Metric = "Critical backlog", Target = 2m, Actual = criticalBacklog, Unit = "count" },
            new() { Metric = "Low stock items", Target = 5m, Actual = lowStockCount, Unit = "count" }
        };

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
                }).ToList(),
            TechnicianPerformance = technicianPerformance,
            LocationFaultHotspots = locationFaultHotspots,
            AssetHealthScores = assetHealth,
            ReliabilityMetrics = new ReliabilityMetricsDto
            {
                MttrHours = completionHours.Count > 0 ? Math.Round(completionHours.Average(), 2) : 0m,
                MtbfHours = mtbfIntervals.Count > 0 ? Math.Round(mtbfIntervals.Average(), 2) : 0m
            },
            MaintenanceMix = maintenanceMix,
            StockConsumption = stockConsumption,
            BlockingMaterials = blockingMaterials,
            CostSummary = new CostSummaryDto
            {
                MonthlyMaintenanceCost = Math.Round(monthlyMaintenanceCost, 2),
                MonthlyContractCost = Math.Round(monthlyContractCost, 2),
                AvgWorkOrderCost = Math.Round(avgWorkOrderCost, 2)
            },
            WorkOrderAging = workOrderAging,
            PendingApprovals = pendingApprovals,
            CriticalEvents = criticalEvents,
            KpiTargets = kpiTargets
        };
    }
}
