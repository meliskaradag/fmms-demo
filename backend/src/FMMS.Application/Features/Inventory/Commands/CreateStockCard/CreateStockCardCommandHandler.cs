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
        var requestedNodeType = request.NodeType ?? StockNodeType.StockCard;

        var allCards = await _repository.GetAllAsync(cancellationToken);
        if (allCards.Any(x => x.StockNumber == request.StockNumber && x.TenantId == _tenantContext.TenantId))
            throw new InvalidOperationException($"Stock number '{request.StockNumber}' already exists.");

        if (!string.IsNullOrWhiteSpace(request.Barcode) &&
            allCards.Any(x => x.Barcode == request.Barcode && x.TenantId == _tenantContext.TenantId))
            throw new InvalidOperationException($"Barcode '{request.Barcode}' already exists.");

        if (!string.IsNullOrWhiteSpace(request.Sku) &&
            allCards.Any(x => x.Sku == request.Sku && x.TenantId == _tenantContext.TenantId))
            throw new InvalidOperationException($"Sku '{request.Sku}' already exists.");

        StockCard? parentCard = null;
        if (request.ParentId.HasValue)
        {
            parentCard = await _repository.GetByIdAsync(request.ParentId.Value, cancellationToken);
            if (parentCard is null || parentCard.TenantId != _tenantContext.TenantId)
                throw new InvalidOperationException("Parent stock card not found.");

            ValidateParentNodeType(parentCard.NodeType, requestedNodeType);
        }
        else if (requestedNodeType != StockNodeType.StockGroup && requestedNodeType != StockNodeType.StockCard)
        {
            throw new InvalidOperationException("Only STOCK_GROUP can be created at root level.");
        }

        var stockCard = new StockCard
        {
            StockNumber = request.StockNumber,
            Name = request.Name,
            Description = request.Description,
            Category = request.Category,
            Unit = request.Unit,
            MinStockLevel = request.MinStockLevel,
            Barcode = request.Barcode,
            Sku = request.Sku,
            IsVariantBased = request.IsVariantBased ?? false,
            UsesVariants = request.UsesVariants ?? false,
            SerialTrackingEnabled = request.SerialTrackingEnabled ?? false,
            BarcodeRequired = request.BarcodeRequired ?? false,
            IsActive = request.IsActive,
            NodeType = requestedNodeType,
            ParentId = parentCard?.Id,
            HierarchyLevel = parentCard is null ? 0 : parentCard.HierarchyLevel + 1,
            HierarchyPath = parentCard is null
                ? request.Name
                : $"{parentCard.HierarchyPath} > {request.Name}",
            TenantId = _tenantContext.TenantId
        };

        await _repository.AddAsync(stockCard, cancellationToken);

        if (requestedNodeType == StockNodeType.StockCard)
        {
            var firstLocation = (await _locationRepository.GetAllAsync(cancellationToken)).FirstOrDefault();
            if (firstLocation is null)
                throw new InvalidOperationException("At least one location must exist before creating a stock card.");

            var initialBalance = new StockBalance
            {
                StockCardId = stockCard.Id,
                LocationId = firstLocation.Id,
                CurrentStock = request.CurrentBalance,
                QuantityOnHand = request.CurrentBalance,
                AvailableQuantity = request.CurrentBalance,
                ReservedQuantity = 0,
                TenantId = _tenantContext.TenantId
            };
            await _balanceRepository.AddAsync(initialBalance, cancellationToken);

            if (request.CurrentBalance > 0)
            {
                var initialMovement = new StockMovement
                {
                    StockCardId = stockCard.Id,
                    MovementType = MovementType.In,
                    Quantity = request.CurrentBalance,
                    Unit = stockCard.Unit,
                    ToLocationId = firstLocation.Id,
                    LocationId = firstLocation.Id,
                    Notes = "Initial stock",
                    PerformedBy = _currentUserContext.UserId,
                    PerformedAt = DateTime.UtcNow,
                    TenantId = _tenantContext.TenantId
                };
                await _movementRepository.AddAsync(initialMovement, cancellationToken);
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return stockCard.Id;
    }

    private static void ValidateParentNodeType(StockNodeType parentType, StockNodeType childType)
    {
        var isValid = parentType switch
        {
            StockNodeType.StockGroup => childType == StockNodeType.StockSubgroup,
            StockNodeType.StockSubgroup => childType == StockNodeType.StockCard,
            StockNodeType.StockCard => false,
            _ => false
        };

        if (!isValid)
            throw new InvalidOperationException($"Invalid hierarchy: '{childType}' cannot be child of '{parentType}'.");
    }
}
