using FMMS.Domain.Entities;
using FMMS.Domain.Enums;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.Inventory.Commands.CreateStockMovement;

public class CreateStockMovementCommandHandler : IRequestHandler<CreateStockMovementCommand, Guid>
{
    private readonly IRepository<StockMovement> _movementRepository;
    private readonly IRepository<StockBalance> _balanceRepository;
    private readonly IRepository<StockCard> _stockCardRepository;
    private readonly IRepository<Location> _locationRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITenantContext _tenantContext;
    private readonly ICurrentUserContext _currentUserContext;

    public CreateStockMovementCommandHandler(
        IRepository<StockMovement> movementRepository,
        IRepository<StockBalance> balanceRepository,
        IRepository<StockCard> stockCardRepository,
        IRepository<Location> locationRepository,
        IUnitOfWork unitOfWork,
        ITenantContext tenantContext,
        ICurrentUserContext currentUserContext)
    {
        _movementRepository = movementRepository;
        _balanceRepository = balanceRepository;
        _stockCardRepository = stockCardRepository;
        _locationRepository = locationRepository;
        _unitOfWork = unitOfWork;
        _tenantContext = tenantContext;
        _currentUserContext = currentUserContext;
    }

    public async Task<Guid> Handle(CreateStockMovementCommand request, CancellationToken cancellationToken)
    {
        var stockCard = await _stockCardRepository.GetByIdAsync(request.StockCardId, cancellationToken)
            ?? throw new InvalidOperationException($"Stock card with id '{request.StockCardId}' not found.");

        await _unitOfWork.BeginTransactionAsync(cancellationToken);

        try
        {
            var resolvedFromLocationId = request.FromLocationId;
            var resolvedToLocationId = request.ToLocationId;
            switch (request.MovementType)
            {
                case MovementType.In:
                    resolvedToLocationId ??= await ResolveDefaultLocationId(cancellationToken);
                    await IncreaseBalance(request.StockCardId, resolvedToLocationId.Value, request.Quantity, cancellationToken);
                    break;

                case MovementType.Out:
                    resolvedFromLocationId ??= await ResolveDefaultOutLocationId(request.StockCardId, request.Quantity, cancellationToken);
                    await DecreaseBalance(request.StockCardId, resolvedFromLocationId.Value, request.Quantity, cancellationToken);
                    break;

                case MovementType.Transfer:
                    if (!resolvedFromLocationId.HasValue || !resolvedToLocationId.HasValue)
                        throw new InvalidOperationException("Both FromLocationId and ToLocationId are required for Transfer movements.");
                    await DecreaseBalance(request.StockCardId, resolvedFromLocationId.Value, request.Quantity, cancellationToken);
                    await IncreaseBalance(request.StockCardId, resolvedToLocationId.Value, request.Quantity, cancellationToken);
                    break;

                case MovementType.Adjustment:
                    resolvedToLocationId ??= await ResolveDefaultLocationId(cancellationToken);
                    await SetBalance(request.StockCardId, resolvedToLocationId.Value, request.Quantity, cancellationToken);
                    break;

                default:
                    throw new InvalidOperationException($"Unknown movement type: {request.MovementType}");
            }

            var movement = new StockMovement
            {
                StockCardId = request.StockCardId,
                MovementType = request.MovementType,
                Quantity = request.Quantity,
                FromLocationId = resolvedFromLocationId,
                ToLocationId = resolvedToLocationId,
                Notes = request.Notes,
                PerformedBy = _currentUserContext.UserId,
                TenantId = _tenantContext.TenantId
            };

            await _movementRepository.AddAsync(movement, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitAsync(cancellationToken);

            return movement.Id;
        }
        catch
        {
            await _unitOfWork.RollbackAsync(cancellationToken);
            throw;
        }
    }

    private async Task IncreaseBalance(Guid stockCardId, Guid locationId, decimal quantity, CancellationToken cancellationToken)
    {
        var balance = await FindBalance(stockCardId, locationId, cancellationToken);

        if (balance is null)
        {
            balance = new StockBalance
            {
                StockCardId = stockCardId,
                LocationId = locationId,
                CurrentStock = quantity,
                TenantId = _tenantContext.TenantId
            };
            await _balanceRepository.AddAsync(balance, cancellationToken);
        }
        else
        {
            balance.CurrentStock += quantity;
            _balanceRepository.Update(balance);
        }
    }

    private async Task DecreaseBalance(Guid stockCardId, Guid locationId, decimal quantity, CancellationToken cancellationToken)
    {
        var balance = await FindBalance(stockCardId, locationId, cancellationToken)
            ?? throw new InvalidOperationException($"No stock balance found for stock card '{stockCardId}' at location '{locationId}'.");

        if (balance.CurrentStock < quantity)
            throw new InvalidOperationException($"Insufficient stock. Available: {balance.CurrentStock}, Requested: {quantity}");

        balance.CurrentStock -= quantity;
        _balanceRepository.Update(balance);
    }

    private async Task SetBalance(Guid stockCardId, Guid locationId, decimal quantity, CancellationToken cancellationToken)
    {
        var balance = await FindBalance(stockCardId, locationId, cancellationToken);

        if (balance is null)
        {
            balance = new StockBalance
            {
                StockCardId = stockCardId,
                LocationId = locationId,
                CurrentStock = quantity,
                TenantId = _tenantContext.TenantId
            };
            await _balanceRepository.AddAsync(balance, cancellationToken);
        }
        else
        {
            balance.CurrentStock = quantity;
            _balanceRepository.Update(balance);
        }
    }

    private async Task<StockBalance?> FindBalance(Guid stockCardId, Guid locationId, CancellationToken cancellationToken)
    {
        var allBalances = await _balanceRepository.GetAllAsync(cancellationToken);
        return allBalances.FirstOrDefault(b => b.StockCardId == stockCardId && b.LocationId == locationId);
    }

    private async Task<Guid> ResolveDefaultLocationId(CancellationToken cancellationToken)
    {
        var firstLocation = (await _locationRepository.GetAllAsync(cancellationToken)).FirstOrDefault();
        if (firstLocation is null)
            throw new InvalidOperationException("No location found for stock movement.");
        return firstLocation.Id;
    }

    private async Task<Guid> ResolveDefaultOutLocationId(Guid stockCardId, decimal quantity, CancellationToken cancellationToken)
    {
        var allBalances = await _balanceRepository.GetAllAsync(cancellationToken);
        var candidate = allBalances
            .Where(b => b.StockCardId == stockCardId && b.CurrentStock >= quantity)
            .OrderByDescending(b => b.CurrentStock)
            .FirstOrDefault();

        if (candidate is null)
            throw new InvalidOperationException("Insufficient stock for this movement.");

        return candidate.LocationId;
    }
}
