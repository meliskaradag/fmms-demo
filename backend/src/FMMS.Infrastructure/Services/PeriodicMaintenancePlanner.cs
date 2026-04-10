using System.Text.Json;
using FMMS.Application.Interfaces;
using FMMS.Domain.Entities;
using FMMS.Domain.Enums;
using FMMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FMMS.Infrastructure.Services;

public class PeriodicMaintenancePlanner : IPeriodicMaintenancePlanner
{
    private readonly FmmsDbContext _dbContext;

    public PeriodicMaintenancePlanner(FmmsDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<PeriodicMaintenanceExecutionResult> ExecuteForAllTenantsAsync(CancellationToken cancellationToken = default)
    {
        var tenantIds = await _dbContext.Tenants
            .Where(t => t.IsActive)
            .Select(t => t.Id)
            .ToListAsync(cancellationToken);

        var totals = new PeriodicMaintenanceExecutionResult(0, 0, 0);

        foreach (var tenantId in tenantIds)
        {
            var result = await ExecuteForTenantAsync(tenantId, cancellationToken);
            totals = SumResults(totals, result);
        }

        return totals;
    }

    public async Task<PeriodicMaintenanceExecutionResult> ExecuteForTenantAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var created = 0;
        var blocked = 0;
        var skipped = 0;

        var plans = await _dbContext.MaintenancePlans
            .AsTracking()
            .Where(p => p.TenantId == tenantId && p.IsActive)
            .Include(p => p.MaintenanceCard)
            .Include(p => p.Asset)
            .ToListAsync(cancellationToken);

        if (plans.Count == 0)
        {
            return new PeriodicMaintenanceExecutionResult(0, 0, 0);
        }

        var planIds = plans.Select(p => p.Id).ToList();
        var cardIds = plans.Select(p => p.MaintenanceCardId).Distinct().ToList();

        var cardMaterials = await _dbContext.MaintenanceCardMaterials
            .Where(m => m.TenantId == tenantId && cardIds.Contains(m.CardId))
            .Include(m => m.StockCard)
            .ToListAsync(cancellationToken);

        var materialsByCard = cardMaterials
            .GroupBy(m => m.CardId)
            .ToDictionary(g => g.Key, g => g.ToList());

        var openPlanIds = await _dbContext.WorkOrders
            .Where(wo =>
                wo.TenantId == tenantId &&
                wo.MaintenancePlanId.HasValue &&
                planIds.Contains(wo.MaintenancePlanId.Value) &&
                wo.Status != WorkOrderStatus.Completed &&
                wo.Status != WorkOrderStatus.Cancelled)
            .Select(wo => wo.MaintenancePlanId!.Value)
            .Distinct()
            .ToListAsync(cancellationToken);

        var openPlanSet = openPlanIds.ToHashSet();

        var stockByCardId = await _dbContext.StockBalances
            .Where(sb => sb.TenantId == tenantId)
            .GroupBy(sb => sb.StockCardId)
            .Select(g => new
            {
                StockCardId = g.Key,
                Quantity = g.Sum(x => x.CurrentStock)
            })
            .ToDictionaryAsync(x => x.StockCardId, x => x.Quantity, cancellationToken);

        foreach (var plan in plans)
        {
            if (!IsDue(plan, now, out var reason))
            {
                continue;
            }

            if (openPlanSet.Contains(plan.Id))
            {
                await AddRunAsync(plan, null, reason, MaintenancePlanRunStatus.SkippedExistingOpenWorkOrder, null, cancellationToken);
                AdvanceSchedule(plan, now);
                plan.LastRunAt = now;
                skipped++;
                continue;
            }

            var missingMaterials = GetMissingMaterials(plan, materialsByCard, stockByCardId);
            if (missingMaterials.Count > 0)
            {
                await AddRunAsync(
                    plan,
                    null,
                    reason,
                    MaintenancePlanRunStatus.BlockedByStock,
                    JsonSerializer.Serialize(missingMaterials),
                    cancellationToken);
                AdvanceSchedule(plan, now);
                plan.LastRunAt = now;
                blocked++;
                continue;
            }

            var workOrder = new WorkOrder
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                OrderNumber = $"WO-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}",
                Type = WorkOrderType.Preventive,
                Priority = plan.Priority,
                Status = WorkOrderStatus.Open,
                Title = $"Periyodik Bakım: {plan.MaintenanceCard.Name}",
                ReportedBy = Guid.Empty,
                LocationId = plan.Asset.LocationId,
                AssetId = plan.AssetId,
                MaintenancePlanId = plan.Id,
                ScheduledStart = now
            };

            await _dbContext.WorkOrders.AddAsync(workOrder, cancellationToken);
            await AddRunAsync(plan, workOrder.Id, reason, MaintenancePlanRunStatus.WorkOrderCreated, null, cancellationToken);

            AdvanceSchedule(plan, now);
            plan.LastRunAt = now;
            created++;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        return new PeriodicMaintenanceExecutionResult(created, blocked, skipped);
    }

    private static bool IsDue(MaintenancePlan plan, DateTime now, out string reason)
    {
        var dueByTime = plan.NextDueAt.HasValue && plan.NextDueAt.Value <= now;
        var dueByMeter = plan.NextDueMeter.HasValue && plan.CurrentMeterReading >= plan.NextDueMeter.Value;

        reason = plan.TriggerType switch
        {
            MaintenancePlanTriggerType.TimeBased when dueByTime => "time",
            MaintenancePlanTriggerType.MeterBased when dueByMeter => "meter",
            MaintenancePlanTriggerType.Hybrid when dueByTime && dueByMeter => "time+meter",
            MaintenancePlanTriggerType.Hybrid when dueByTime => "time",
            MaintenancePlanTriggerType.Hybrid when dueByMeter => "meter",
            _ => string.Empty
        };

        return !string.IsNullOrWhiteSpace(reason);
    }

    private static List<object> GetMissingMaterials(
        MaintenancePlan plan,
        IReadOnlyDictionary<Guid, List<MaintenanceCardMaterial>> materialsByCard,
        IReadOnlyDictionary<Guid, decimal> stockByCardId)
    {
        var missing = new List<object>();
        if (!materialsByCard.TryGetValue(plan.MaintenanceCardId, out var materials))
        {
            return missing;
        }

        foreach (var material in materials)
        {
            stockByCardId.TryGetValue(material.StockCardId, out var available);
            if (available < material.Quantity)
            {
                missing.Add(new
                {
                    material.StockCardId,
                    StockName = material.StockCard.Name,
                    Required = material.Quantity,
                    Available = available
                });
            }
        }

        return missing;
    }

    private static void AdvanceSchedule(MaintenancePlan plan, DateTime now)
    {
        if ((plan.TriggerType == MaintenancePlanTriggerType.TimeBased || plan.TriggerType == MaintenancePlanTriggerType.Hybrid)
            && plan.FrequencyDays.HasValue
            && plan.FrequencyDays.Value > 0)
        {
            var next = plan.NextDueAt ?? now;
            while (next <= now)
            {
                next = next.AddDays(plan.FrequencyDays.Value);
            }
            plan.NextDueAt = next;
        }

        if ((plan.TriggerType == MaintenancePlanTriggerType.MeterBased || plan.TriggerType == MaintenancePlanTriggerType.Hybrid)
            && plan.MeterInterval.HasValue
            && plan.MeterInterval.Value > 0)
        {
            var nextMeter = plan.NextDueMeter ?? plan.CurrentMeterReading;
            while (nextMeter <= plan.CurrentMeterReading)
            {
                nextMeter += plan.MeterInterval.Value;
            }
            plan.NextDueMeter = nextMeter;
        }
    }

    private async Task AddRunAsync(
        MaintenancePlan plan,
        Guid? workOrderId,
        string reason,
        MaintenancePlanRunStatus status,
        string? missingMaterialsJson,
        CancellationToken cancellationToken)
    {
        await _dbContext.MaintenancePlanRuns.AddAsync(new MaintenancePlanRun
        {
            Id = Guid.NewGuid(),
            TenantId = plan.TenantId,
            MaintenancePlanId = plan.Id,
            WorkOrderId = workOrderId,
            TriggeredAt = DateTime.UtcNow,
            TriggerReason = reason,
            Status = status,
            MissingMaterialsJson = missingMaterialsJson
        }, cancellationToken);
    }

    private static PeriodicMaintenanceExecutionResult SumResults(
        PeriodicMaintenanceExecutionResult left,
        PeriodicMaintenanceExecutionResult right)
    {
        return new PeriodicMaintenanceExecutionResult(
            left.WorkOrdersCreated + right.WorkOrdersCreated,
            left.BlockedByStock + right.BlockedByStock,
            left.SkippedExistingOpenWorkOrder + right.SkippedExistingOpenWorkOrder);
    }
}
