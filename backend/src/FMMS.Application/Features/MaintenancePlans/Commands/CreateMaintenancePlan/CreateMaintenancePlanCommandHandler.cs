using FMMS.Domain.Entities;
using FMMS.Domain.Enums;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.MaintenancePlans.Commands.CreateMaintenancePlan;

public class CreateMaintenancePlanCommandHandler : IRequestHandler<CreateMaintenancePlanCommand, Guid>
{
    private readonly IRepository<MaintenancePlan> _planRepository;
    private readonly IRepository<MaintenanceCard> _cardRepository;
    private readonly IRepository<Asset> _assetRepository;
    private readonly IRepository<StockCard> _stockCardRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITenantContext _tenantContext;

    public CreateMaintenancePlanCommandHandler(
        IRepository<MaintenancePlan> planRepository,
        IRepository<MaintenanceCard> cardRepository,
        IRepository<Asset> assetRepository,
        IRepository<StockCard> stockCardRepository,
        IUnitOfWork unitOfWork,
        ITenantContext tenantContext)
    {
        _planRepository = planRepository;
        _cardRepository = cardRepository;
        _assetRepository = assetRepository;
        _stockCardRepository = stockCardRepository;
        _unitOfWork = unitOfWork;
        _tenantContext = tenantContext;
    }

    public async Task<Guid> Handle(CreateMaintenancePlanCommand request, CancellationToken cancellationToken)
    {
        var card = await _cardRepository.GetByIdAsync(request.MaintenanceCardId, cancellationToken)
            ?? throw new KeyNotFoundException($"MaintenanceCard {request.MaintenanceCardId} not found.");

        if (card.TenantId != _tenantContext.TenantId)
        {
            throw new InvalidOperationException("Maintenance card must belong to current tenant.");
        }

        if (request.AssetId.HasValue)
        {
            var asset = await _assetRepository.GetByIdAsync(request.AssetId.Value, cancellationToken)
                ?? throw new KeyNotFoundException($"Asset {request.AssetId} not found.");

            if (asset.TenantId != _tenantContext.TenantId)
            {
                throw new InvalidOperationException("Asset must belong to current tenant.");
            }
        }

        if (request.StockCardId.HasValue)
        {
            var stockCard = await _stockCardRepository.GetByIdAsync(request.StockCardId.Value, cancellationToken)
                ?? throw new KeyNotFoundException($"StockCard {request.StockCardId} not found.");

            if (stockCard.TenantId != _tenantContext.TenantId)
            {
                throw new InvalidOperationException("Stock card must belong to current tenant.");
            }
        }

        var now = DateTime.UtcNow;
        DateTime? nextDueAt = request.TriggerType is MaintenancePlanTriggerType.TimeBased or MaintenancePlanTriggerType.Hybrid
            ? (request.FirstDueAt ?? now.AddDays(request.FrequencyDays!.Value))
            : null;
        decimal? nextDueMeter = request.TriggerType is MaintenancePlanTriggerType.MeterBased or MaintenancePlanTriggerType.Hybrid
            ? request.InitialMeterReading + request.MeterInterval!.Value
            : null;

        var plan = new MaintenancePlan
        {
            Id = Guid.NewGuid(),
            TenantId = _tenantContext.TenantId,
            Name = request.Name,
            MaintenanceCardId = request.MaintenanceCardId,
            AssetId = request.AssetId,
            StockCardId = request.StockCardId,
            TriggerType = request.TriggerType,
            FrequencyDays = request.FrequencyDays,
            MeterInterval = request.MeterInterval,
            CurrentMeterReading = request.InitialMeterReading,
            NextDueAt = nextDueAt,
            NextDueMeter = nextDueMeter,
            Priority = request.Priority,
            IsActive = request.IsActive
        };

        await _planRepository.AddAsync(plan, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return plan.Id;
    }
}
