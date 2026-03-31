using FMMS.Domain.Entities;
using FMMS.Domain.Enums;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.Inventory.Commands.CreateStockCard;

public class CreateStockCardCommandHandler : IRequestHandler<CreateStockCardCommand, Guid>
{
    private readonly IRepository<StockCard> _repository;
    private readonly IRepository<StockBalance> _balanceRepository;
    private readonly IRepository<StockMovement> _movementRepository;
    private readonly IRepository<Location> _locationRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITenantContext _tenantContext;
    private readonly ICurrentUserContext _currentUserContext;

    public CreateStockCardCommandHandler(
        IRepository<StockCard> repository,
        IRepository<StockBalance> balanceRepository,
        IRepository<StockMovement> movementRepository,
        IRepository<Location> locationRepository,
        IUnitOfWork unitOfWork,
        ITenantContext tenantContext,
        ICurrentUserContext currentUserContext)
    {
        _repository = repository;
        _balanceRepository = balanceRepository;
        _movementRepository = movementRepository;
        _locationRepository = locationRepository;
        _unitOfWork = unitOfWork;
        _tenantContext = tenantContext;
        _currentUserContext = currentUserContext;
    }

    public async Task<Guid> Handle(CreateStockCardCommand request, CancellationToken cancellationToken)
    {
        var stockCard = new StockCard
        {
            StockNumber = request.StockNumber,
            Name = request.Name,
            Category = request.Category,
            Unit = request.Unit,
            MinStockLevel = request.MinStockLevel,
            TenantId = _tenantContext.TenantId
        };

        var firstLocation = (await _locationRepository.GetAllAsync(cancellationToken)).FirstOrDefault();
        if (firstLocation is null)
            throw new InvalidOperationException("At least one location must exist before creating a stock card.");

        var initialBalance = new StockBalance
        {
            StockCardId = stockCard.Id,
            LocationId = firstLocation.Id,
            CurrentStock = request.CurrentBalance,
            TenantId = _tenantContext.TenantId
        };

        await _repository.AddAsync(stockCard, cancellationToken);
        await _balanceRepository.AddAsync(initialBalance, cancellationToken);
        if (request.CurrentBalance > 0)
        {
            var initialMovement = new StockMovement
            {
                StockCardId = stockCard.Id,
                MovementType = MovementType.In,
                Quantity = request.CurrentBalance,
                ToLocationId = firstLocation.Id,
                Notes = "Initial stock",
                PerformedBy = _currentUserContext.UserId,
                TenantId = _tenantContext.TenantId
            };
            await _movementRepository.AddAsync(initialMovement, cancellationToken);
        }
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return stockCard.Id;
    }
}
