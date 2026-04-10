using FMMS.Application.Common;
using FMMS.Application.DTOs;
using FMMS.Domain.Entities;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.MaintenancePlans.Queries.GetMaintenancePlans;

public class GetMaintenancePlansQueryHandler : IRequestHandler<GetMaintenancePlansQuery, PagedResult<MaintenancePlanDto>>
{
    private readonly IRepository<MaintenancePlan> _planRepository;
    private readonly IRepository<Asset> _assetRepository;
    private readonly IRepository<MaintenanceCard> _cardRepository;
    private readonly ITenantContext _tenantContext;

    public GetMaintenancePlansQueryHandler(
        IRepository<MaintenancePlan> planRepository,
        IRepository<Asset> assetRepository,
        IRepository<MaintenanceCard> cardRepository,
        ITenantContext tenantContext)
    {
        _planRepository = planRepository;
        _assetRepository = assetRepository;
        _cardRepository = cardRepository;
        _tenantContext = tenantContext;
    }

    public async Task<PagedResult<MaintenancePlanDto>> Handle(GetMaintenancePlansQuery request, CancellationToken cancellationToken)
    {
        var plans = (await _planRepository.GetAllAsync(cancellationToken))
            .Where(p => p.TenantId == _tenantContext.TenantId);

        if (request.IsActive.HasValue)
        {
            plans = plans.Where(p => p.IsActive == request.IsActive.Value);
        }

        var filteredPlans = plans.ToList();
        var total = filteredPlans.Count;

        var pagePlans = filteredPlans
            .OrderBy(p => p.NextDueAt ?? DateTime.MaxValue)
            .ThenBy(p => p.NextDueMeter ?? 999999999999m)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        var assetIds = pagePlans.Select(p => p.AssetId).Distinct().ToList();
        var cardIds = pagePlans.Select(p => p.MaintenanceCardId).Distinct().ToList();

        var assets = (await _assetRepository.GetAllAsync(cancellationToken))
            .Where(a => assetIds.Contains(a.Id))
            .ToDictionary(a => a.Id, a => a.Name);

        var cards = (await _cardRepository.GetAllAsync(cancellationToken))
            .Where(c => cardIds.Contains(c.Id))
            .ToDictionary(c => c.Id, c => c.Name);

        var items = pagePlans
            .Select(p => new MaintenancePlanDto
            {
                Id = p.Id,
                Name = p.Name,
                MaintenanceCardId = p.MaintenanceCardId,
                MaintenanceCardName = cards.TryGetValue(p.MaintenanceCardId, out var cardName) ? cardName : "-",
                AssetId = p.AssetId,
                AssetName = assets.TryGetValue(p.AssetId, out var assetName) ? assetName : "-",
                TriggerType = p.TriggerType,
                FrequencyDays = p.FrequencyDays,
                MeterInterval = p.MeterInterval,
                CurrentMeterReading = p.CurrentMeterReading,
                NextDueAt = p.NextDueAt,
                NextDueMeter = p.NextDueMeter,
                LastRunAt = p.LastRunAt,
                Priority = p.Priority,
                IsActive = p.IsActive,
                CreatedAt = p.CreatedAt
            })
            .ToList();

        return new PagedResult<MaintenancePlanDto>
        {
            Items = items,
            Page = request.Page,
            PageSize = request.PageSize,
            Total = total
        };
    }
}
