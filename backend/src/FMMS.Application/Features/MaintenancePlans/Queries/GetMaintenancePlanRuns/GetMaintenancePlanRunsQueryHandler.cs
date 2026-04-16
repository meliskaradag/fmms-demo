using FMMS.Application.Common;
using FMMS.Application.DTOs;
using FMMS.Domain.Entities;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.MaintenancePlans.Queries.GetMaintenancePlanRuns;

public class GetMaintenancePlanRunsQueryHandler : IRequestHandler<GetMaintenancePlanRunsQuery, PagedResult<MaintenancePlanRunDto>>
{
    private readonly IRepository<MaintenancePlanRun> _runRepository;
    private readonly IRepository<MaintenancePlan> _planRepository;
    private readonly IRepository<Asset> _assetRepository;
    private readonly ITenantContext _tenantContext;

    public GetMaintenancePlanRunsQueryHandler(
        IRepository<MaintenancePlanRun> runRepository,
        IRepository<MaintenancePlan> planRepository,
        IRepository<Asset> assetRepository,
        ITenantContext tenantContext)
    {
        _runRepository = runRepository;
        _planRepository = planRepository;
        _assetRepository = assetRepository;
        _tenantContext = tenantContext;
    }

    public async Task<PagedResult<MaintenancePlanRunDto>> Handle(GetMaintenancePlanRunsQuery request, CancellationToken cancellationToken)
    {
        var plans = (await _planRepository.GetAllAsync(cancellationToken))
            .Where(p => p.TenantId == _tenantContext.TenantId)
            .ToList();

        if (request.PlanId.HasValue)
        {
            plans = plans.Where(p => p.Id == request.PlanId.Value).ToList();
        }

        var planIds = plans.Select(p => p.Id).ToHashSet();
        var runs = (await _runRepository.GetAllAsync(cancellationToken))
            .Where(r => planIds.Contains(r.MaintenancePlanId))
            .OrderByDescending(r => r.TriggeredAt)
            .ThenByDescending(r => r.CreatedAt)
            .ToList();

        var total = runs.Count;
        var pageRuns = runs
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        var assetIds = plans.Where(p => p.AssetId.HasValue).Select(p => p.AssetId!.Value).Distinct().ToList();
        var assets = (await _assetRepository.GetAllAsync(cancellationToken))
            .Where(a => assetIds.Contains(a.Id))
            .ToDictionary(a => a.Id, a => a.Name);
        var planMap = plans.ToDictionary(p => p.Id, p => p);

        var items = pageRuns.Select(r =>
        {
            var plan = planMap[r.MaintenancePlanId];
            return new MaintenancePlanRunDto
            {
                Id = r.Id,
                MaintenancePlanId = r.MaintenancePlanId,
                MaintenancePlanName = plan.Name,
                AssetName = plan.AssetId.HasValue && assets.TryGetValue(plan.AssetId.Value, out var assetName) ? assetName : "-",
                WorkOrderId = r.WorkOrderId,
                TriggeredAt = r.TriggeredAt,
                TriggerReason = r.TriggerReason,
                Status = r.Status,
                CreatedAt = r.CreatedAt
            };
        }).ToList();

        return new PagedResult<MaintenancePlanRunDto>
        {
            Items = items,
            Page = request.Page,
            PageSize = request.PageSize,
            Total = total
        };
    }
}

