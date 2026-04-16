using FMMS.Domain.Entities;
using FMMS.Domain.Enums;
using FMMS.Domain.Interfaces;
using FMMS.Application.Features.Assets.Services;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FMMS.Application.Features.Inventory.Commands.CreateStockMovement;

public class CreateStockMovementCommandHandler : IRequestHandler<CreateStockMovementCommand, Guid>
{
    private readonly IRepository<StockMovement> _movementRepository;
    private readonly IRepository<StockBalance> _balanceRepository;
    private readonly IRepository<StockCard> _stockCardRepository;
    private readonly IRepository<StockVariant> _variantRepository;
    private readonly IRepository<Location> _locationRepository;
    private readonly IRepository<Asset> _assetRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITenantContext _tenantContext;
    private readonly ICurrentUserContext _currentUserContext;
    private readonly AssetLifecycleService _assetLifecycleService;

    public CreateStockMovementCommandHandler(
        IRepository<StockMovement> movementRepository,
        IRepository<StockBalance> balanceRepository,
        IRepository<StockCard> stockCardRepository,
        IRepository<StockVariant> variantRepository,
        IRepository<Location> locationRepository,
        IRepository<Asset> assetRepository,
        IUnitOfWork unitOfWork,
        ITenantContext tenantContext,
        ICurrentUserContext currentUserContext,
        AssetLifecycleService assetLifecycleService)
    {
        _movementRepository = movementRepository;
        _balanceRepository = balanceRepository;
        _stockCardRepository = stockCardRepository;
        _variantRepository = variantRepository;
        _locationRepository = locationRepository;
        _assetRepository = assetRepository;
        _unitOfWork = unitOfWork;
        _tenantContext = tenantContext;
        _currentUserContext = currentUserContext;
        _assetLifecycleService = assetLifecycleService;
    }

    public async Task<Guid> Handle(CreateStockMovementCommand request, CancellationToken cancellationToken)
    {
        var stockCard = await _stockCardRepository.GetByIdAsync(request.StockCardId, cancellationToken)
            ?? throw new InvalidOperationException($"Stock card with id '{request.StockCardId}' not found.");
        if (stockCard.NodeType != StockNodeType.StockCard)
            throw new InvalidOperationException("Stock movement can only be created for STOCK_CARD records.");

        StockVariant? stockVariant = null;
        if (stockCard.IsVariantBased)
        {
            if (!request.StockVariantId.HasValue)
                throw new InvalidOperationException("StockVariantId is required for variant-based stock cards.");

            stockVariant = await _variantRepository.GetByIdAsync(request.StockVariantId.Value, cancellationToken)
                ?? throw new InvalidOperationException($"Stock variant '{request.StockVariantId.Value}' not found.");

            if (stockVariant.StockCardId != stockCard.Id)
                throw new InvalidOperationException("Variant does not belong to stock card.");
        }
        else if (request.StockVariantId.HasValue)
        {
            throw new InvalidOperationException("StockVariantId must be null for non-variant stock cards.");
        }

        var selectedAssetIds = (request.SelectedAssetIds ?? new List<Guid>())
            .Where(x => x != Guid.Empty)
            .Distinct()
            .ToList();

        var requiresTrackedSelection = stockCard.SerialTrackingEnabled || stockCard.BarcodeRequired;
        if (request.MovementType == MovementType.Out && requiresTrackedSelection && selectedAssetIds.Count == 0)
        {
            throw new InvalidOperationException("This stock card requires selecting specific inventory assets for stock out.");
        }

        if (selectedAssetIds.Count > 0 && request.Quantity % 1 != 0)
        {
            throw new InvalidOperationException("Tracked inventory movements only support whole-number quantities.");
        }

        if (selectedAssetIds.Count > 0 && selectedAssetIds.Count != (int)request.Quantity)
        {
            throw new InvalidOperationException("Selected asset count must match movement quantity.");
        }

        List<Asset> selectedAssets = new();
        if (selectedAssetIds.Count > 0)
        {
            selectedAssets = await _assetRepository.GetQueryable()
                .Where(x => selectedAssetIds.Contains(x.Id))
                .ToListAsync(cancellationToken);

            if (selectedAssets.Count != selectedAssetIds.Count)
                throw new InvalidOperationException("Some selected inventory assets were not found.");

            if (selectedAssets.Any(x => x.StockCardId != request.StockCardId))
                throw new InvalidOperationException("Selected inventory assets must belong to the same stock card.");
        }

        await _unitOfWork.BeginTransactionAsync(cancellationToken);

        try
        {
            var resolvedFromLocationId = request.FromLocationId;
            var resolvedToLocationId = request.ToLocationId;
            switch (request.MovementType)
            {
                case MovementType.In:
                    resolvedToLocationId ??= await ResolveDefaultLocationId(cancellationToken);
                    await IncreaseBalance(request.StockCardId, request.StockVariantId, resolvedToLocationId.Value, request.Quantity, cancellationToken);
                    break;

                case MovementType.Out:
                    resolvedFromLocationId ??= await ResolveDefaultOutLocationId(request.StockCardId, request.StockVariantId, request.Quantity, cancellationToken);
                    await DecreaseBalance(request.StockCardId, request.StockVariantId, resolvedFromLocationId.Value, request.Quantity, cancellationToken);
                    break;

                case MovementType.Transfer:
                    if (!resolvedFromLocationId.HasValue || !resolvedToLocationId.HasValue)
                        throw new InvalidOperationException("Both FromLocationId and ToLocationId are required for Transfer movements.");
                    if (resolvedFromLocationId.Value == resolvedToLocationId.Value)
                        throw new InvalidOperationException("Transfer source and destination cannot be the same.");
                    await DecreaseBalance(request.StockCardId, request.StockVariantId, resolvedFromLocationId.Value, request.Quantity, cancellationToken);
                    await IncreaseBalance(request.StockCardId, request.StockVariantId, resolvedToLocationId.Value, request.Quantity, cancellationToken);
                    break;

                case MovementType.Adjustment:
                case MovementType.Count:
                    resolvedToLocationId ??= await ResolveDefaultLocationId(cancellationToken);
                    await SetBalance(request.StockCardId, request.StockVariantId, resolvedToLocationId.Value, request.Quantity, cancellationToken);
                    break;

                case MovementType.Return:
                    resolvedToLocationId ??= await ResolveDefaultLocationId(cancellationToken);
                    await IncreaseBalance(request.StockCardId, request.StockVariantId, resolvedToLocationId.Value, request.Quantity, cancellationToken);
                    break;

                default:
                    throw new InvalidOperationException($"Unknown movement type: {request.MovementType}");
            }

            var movement = new StockMovement
            {
                StockCardId = request.StockCardId,
                StockVariantId = request.StockVariantId,
                WarehouseId = request.WarehouseId,
                LocationId = request.LocationId ?? resolvedToLocationId ?? resolvedFromLocationId,
                MovementType = request.MovementType,
                Quantity = request.Quantity,
                Unit = request.Unit?.Trim() ?? stockCard.Unit,
                UnitCost = request.UnitCost,
                TotalCost = request.UnitCost.HasValue ? request.UnitCost.Value * request.Quantity : null,
                FromLocationId = resolvedFromLocationId,
                ToLocationId = resolvedToLocationId,
                ReferenceType = request.ReferenceType,
                ReferenceId = request.ReferenceId,
                Notes = BuildMovementNote(request.Notes, selectedAssets),
                PerformedBy = _currentUserContext.UserId,
                PerformedAt = DateTime.UtcNow,
                TenantId = _tenantContext.TenantId
            };

            await _movementRepository.AddAsync(movement, cancellationToken);

            if (selectedAssets.Count > 0)
            {
                await ApplyAssetMovementSideEffectsAsync(request, selectedAssets, cancellationToken);
            }

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

    private async Task IncreaseBalance(Guid stockCardId, Guid? stockVariantId, Guid locationId, decimal quantity, CancellationToken cancellationToken)
    {
        var balance = await FindBalance(stockCardId, stockVariantId, locationId, cancellationToken);

        if (balance is null)
        {
            balance = new StockBalance
            {
                StockCardId = stockCardId,
                StockVariantId = stockVariantId,
                LocationId = locationId,
                CurrentStock = quantity,
                QuantityOnHand = quantity,
                AvailableQuantity = quantity,
                ReservedQuantity = 0,
                TenantId = _tenantContext.TenantId
            };
            await _balanceRepository.AddAsync(balance, cancellationToken);
        }
        else
        {
            balance.CurrentStock += quantity;
            balance.QuantityOnHand += quantity;
            balance.AvailableQuantity = balance.QuantityOnHand - balance.ReservedQuantity;
            _balanceRepository.Update(balance);
        }
    }

    private async Task DecreaseBalance(Guid stockCardId, Guid? stockVariantId, Guid locationId, decimal quantity, CancellationToken cancellationToken)
    {
        var balance = await FindBalance(stockCardId, stockVariantId, locationId, cancellationToken)
            ?? throw new InvalidOperationException($"No stock balance found for stock card '{stockCardId}' at location '{locationId}'.");

        if (balance.QuantityOnHand < quantity)
            throw new InvalidOperationException($"Insufficient stock. Available: {balance.QuantityOnHand}, Requested: {quantity}");

        balance.CurrentStock -= quantity;
        balance.QuantityOnHand -= quantity;
        balance.AvailableQuantity = balance.QuantityOnHand - balance.ReservedQuantity;
        _balanceRepository.Update(balance);
    }

    private async Task SetBalance(Guid stockCardId, Guid? stockVariantId, Guid locationId, decimal quantity, CancellationToken cancellationToken)
    {
        var balance = await FindBalance(stockCardId, stockVariantId, locationId, cancellationToken);

        if (balance is null)
        {
            balance = new StockBalance
            {
                StockCardId = stockCardId,
                StockVariantId = stockVariantId,
                LocationId = locationId,
                CurrentStock = quantity,
                QuantityOnHand = quantity,
                AvailableQuantity = quantity,
                ReservedQuantity = 0,
                TenantId = _tenantContext.TenantId
            };
            await _balanceRepository.AddAsync(balance, cancellationToken);
        }
        else
        {
            balance.CurrentStock = quantity;
            balance.QuantityOnHand = quantity;
            balance.AvailableQuantity = balance.QuantityOnHand - balance.ReservedQuantity;
            _balanceRepository.Update(balance);
        }
    }

    private async Task<StockBalance?> FindBalance(Guid stockCardId, Guid? stockVariantId, Guid locationId, CancellationToken cancellationToken)
    {
        var allBalances = await _balanceRepository.GetAllAsync(cancellationToken);
        return allBalances.FirstOrDefault(b =>
            b.StockCardId == stockCardId &&
            b.StockVariantId == stockVariantId &&
            b.LocationId == locationId);
    }

    private async Task<Guid> ResolveDefaultLocationId(CancellationToken cancellationToken)
    {
        var firstLocation = (await _locationRepository.GetAllAsync(cancellationToken)).FirstOrDefault();
        if (firstLocation is null)
            throw new InvalidOperationException("No location found for stock movement.");
        return firstLocation.Id;
    }

    private async Task<Guid> ResolveDefaultOutLocationId(Guid stockCardId, Guid? stockVariantId, decimal quantity, CancellationToken cancellationToken)
    {
        var allBalances = await _balanceRepository.GetAllAsync(cancellationToken);
        var candidate = allBalances
            .Where(b => b.StockCardId == stockCardId && b.StockVariantId == stockVariantId && b.QuantityOnHand >= quantity)
            .OrderByDescending(b => b.QuantityOnHand)
            .FirstOrDefault();

        if (candidate is null)
            throw new InvalidOperationException("Insufficient stock for this movement.");

        return candidate.LocationId;
    }

    private static string? BuildMovementNote(string? note, IReadOnlyCollection<Asset> selectedAssets)
    {
        if (selectedAssets.Count == 0)
            return note;

        var selectedIdentifiers = string.Join(
            ", ",
            selectedAssets.Select(x => $"{x.AssetNumber}{(string.IsNullOrWhiteSpace(x.SerialNumber) ? string.Empty : $" ({x.SerialNumber})")}"));

        var baseNote = string.IsNullOrWhiteSpace(note) ? string.Empty : $"{note.Trim()}\n";
        return $"{baseNote}Selected assets: {selectedIdentifiers}";
    }

    private async Task ApplyAssetMovementSideEffectsAsync(
        CreateStockMovementCommand request,
        IReadOnlyCollection<Asset> selectedAssets,
        CancellationToken cancellationToken)
    {
        foreach (var asset in selectedAssets)
        {
            switch (request.MovementType)
            {
                case MovementType.Out:
                    if (asset.AssignedToUserId.HasValue)
                        throw new InvalidOperationException($"Asset {asset.AssetNumber} is assigned and cannot be checked out from depot stock.");

                    asset.Status = AssetStatus.Active;
                    _assetRepository.Update(asset);
                    await _assetLifecycleService.AddMovementAsync(
                        asset,
                        AssetMovementType.Checkout,
                        fromLocationId: asset.LocationId,
                        toLocationId: asset.LocationId,
                        fromUserId: null,
                        toUserId: null,
                        reason: "stock_out",
                        notes: "Checked out via stock movement",
                        cancellationToken: cancellationToken);
                    break;

                case MovementType.In:
                case MovementType.Return:
                    asset.Status = AssetStatus.InStock;
                    asset.AssignedToUserId = null;
                    _assetRepository.Update(asset);
                    await _assetLifecycleService.AddMovementAsync(
                        asset,
                        AssetMovementType.Checkin,
                        fromLocationId: asset.LocationId,
                        toLocationId: asset.LocationId,
                        fromUserId: null,
                        toUserId: null,
                        reason: "stock_in",
                        notes: "Checked in via stock movement",
                        cancellationToken: cancellationToken);
                    break;
            }
        }
    }
}
