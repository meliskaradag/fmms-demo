using FMMS.Application.DTOs;
using FMMS.Domain.Entities;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.Maintenance.Queries.GetMaintenanceCard;

public class GetMaintenanceCardQueryHandler : IRequestHandler<GetMaintenanceCardQuery, MaintenanceCardDto?>
{
    private readonly IRepository<MaintenanceCard> _cardRepository;
    private readonly IRepository<MaintenanceCardStep> _stepRepository;
    private readonly IRepository<MaintenanceCardMaterial> _materialRepository;
    private readonly IRepository<StockCard> _stockCardRepository;

    public GetMaintenanceCardQueryHandler(
        IRepository<MaintenanceCard> cardRepository,
        IRepository<MaintenanceCardStep> stepRepository,
        IRepository<MaintenanceCardMaterial> materialRepository,
        IRepository<StockCard> stockCardRepository)
    {
        _cardRepository = cardRepository;
        _stepRepository = stepRepository;
        _materialRepository = materialRepository;
        _stockCardRepository = stockCardRepository;
    }

    public async Task<MaintenanceCardDto?> Handle(GetMaintenanceCardQuery request, CancellationToken cancellationToken)
    {
        var card = await _cardRepository.GetByIdAsync(request.Id, cancellationToken);
        if (card is null)
            return null;

        var allSteps = await _stepRepository.GetAllAsync(cancellationToken);
        var steps = allSteps
            .Where(s => s.CardId == card.Id)
            .OrderBy(s => s.StepOrder)
            .Select(s => new MaintenanceCardStepDto
            {
                Id = s.Id,
                StepOrder = s.StepOrder,
                Instruction = s.Instruction,
                StepStatus = s.StepStatus,
                EstimatedMinutes = s.EstimatedMinutes
            }).ToList();

        var allMaterials = await _materialRepository.GetAllAsync(cancellationToken);
        var allStockCards = await _stockCardRepository.GetAllAsync(cancellationToken);
        var stockCardLookup = allStockCards.ToDictionary(sc => sc.Id);

        var materials = allMaterials
            .Where(m => m.CardId == card.Id)
            .Select(m =>
            {
                var stockCard = stockCardLookup.GetValueOrDefault(m.StockCardId);
                return new MaintenanceCardMaterialDto
                {
                    Id = m.Id,
                    StockCardId = m.StockCardId,
                    StockCardName = stockCard?.Name ?? string.Empty,
                    Quantity = m.Quantity,
                    Unit = stockCard?.Unit ?? string.Empty
                };
            }).ToList();

        return new MaintenanceCardDto
        {
            Id = card.Id,
            Name = card.Name,
            AssetCategory = card.AssetCategory,
            Description = card.Description,
            Level = card.Level,
            EstimatedDuration = card.EstimatedDuration,
            DefaultPeriodDays = card.DefaultPeriodDays,
            IsTemplate = card.IsTemplate,
            Steps = steps,
            Materials = materials,
            CreatedAt = card.CreatedAt
        };
    }
}
