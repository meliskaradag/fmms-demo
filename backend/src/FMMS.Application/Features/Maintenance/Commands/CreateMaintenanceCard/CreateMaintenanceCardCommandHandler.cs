using FMMS.Domain.Entities;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.Maintenance.Commands.CreateMaintenanceCard;

public class CreateMaintenanceCardCommandHandler : IRequestHandler<CreateMaintenanceCardCommand, Guid>
{
    private readonly IRepository<MaintenanceCard> _cardRepository;
    private readonly IRepository<MaintenanceCardStep> _stepRepository;
    private readonly IRepository<MaintenanceCardMaterial> _materialRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITenantContext _tenantContext;

    public CreateMaintenanceCardCommandHandler(
        IRepository<MaintenanceCard> cardRepository,
        IRepository<MaintenanceCardStep> stepRepository,
        IRepository<MaintenanceCardMaterial> materialRepository,
        IUnitOfWork unitOfWork,
        ITenantContext tenantContext)
    {
        _cardRepository = cardRepository;
        _stepRepository = stepRepository;
        _materialRepository = materialRepository;
        _unitOfWork = unitOfWork;
        _tenantContext = tenantContext;
    }

    public async Task<Guid> Handle(CreateMaintenanceCardCommand request, CancellationToken cancellationToken)
    {
        await _unitOfWork.BeginTransactionAsync(cancellationToken);

        try
        {
            var card = new MaintenanceCard
            {
                Name = request.Name,
                AssetCategory = request.AssetCategory,
                Description = request.Description,
                Level = request.Level,
                EstimatedDuration = request.EstimatedDuration,
                DefaultPeriodDays = request.DefaultPeriodDays,
                IsTemplate = request.IsTemplate,
                TenantId = _tenantContext.TenantId
            };

            await _cardRepository.AddAsync(card, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            foreach (var stepItem in request.Steps)
            {
                var step = new MaintenanceCardStep
                {
                    CardId = card.Id,
                    StepOrder = stepItem.StepOrder,
                    Instruction = stepItem.Instruction,
                    StepStatus = stepItem.StepStatus,
                    EstimatedMinutes = stepItem.EstimatedMinutes,
                    TenantId = _tenantContext.TenantId
                };
                await _stepRepository.AddAsync(step, cancellationToken);
            }

            foreach (var materialItem in request.Materials)
            {
                var material = new MaintenanceCardMaterial
                {
                    CardId = card.Id,
                    StockCardId = materialItem.StockCardId,
                    Quantity = materialItem.Quantity,
                    TenantId = _tenantContext.TenantId
                };
                await _materialRepository.AddAsync(material, cancellationToken);
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitAsync(cancellationToken);

            return card.Id;
        }
        catch
        {
            await _unitOfWork.RollbackAsync(cancellationToken);
            throw;
        }
    }
}
