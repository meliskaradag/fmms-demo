using FMMS.Domain.Entities;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.Inventory.Commands.UpdateStockCard;

public class UpdateStockCardCommandHandler : IRequestHandler<UpdateStockCardCommand, bool>
{
    private readonly IRepository<StockCard> _repo;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateStockCardCommandHandler(IRepository<StockCard> repo, IUnitOfWork unitOfWork)
    {
        _repo = repo;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(UpdateStockCardCommand request, CancellationToken cancellationToken)
    {
        var stockCard = await _repo.GetByIdAsync(request.StockCardId, cancellationToken)
            ?? throw new KeyNotFoundException($"StockCard {request.StockCardId} not found.");

        var allCards = await _repo.GetAllAsync(cancellationToken);
        if (allCards.Any(x => x.Id != request.StockCardId && x.StockNumber == request.StockNumber && x.TenantId == stockCard.TenantId))
            throw new InvalidOperationException($"Stock number '{request.StockNumber}' already exists.");

        if (!string.IsNullOrWhiteSpace(request.Barcode) &&
            allCards.Any(x => x.Id != request.StockCardId && x.Barcode == request.Barcode && x.TenantId == stockCard.TenantId))
            throw new InvalidOperationException($"Barcode '{request.Barcode}' already exists.");

        if (!string.IsNullOrWhiteSpace(request.Sku) &&
            allCards.Any(x => x.Id != request.StockCardId && x.Sku == request.Sku && x.TenantId == stockCard.TenantId))
            throw new InvalidOperationException($"Sku '{request.Sku}' already exists.");

        if (request.NodeType.HasValue && request.NodeType.Value != stockCard.NodeType)
        {
            var children = allCards.Where(x => x.ParentId == stockCard.Id).ToList();
            if (children.Count > 0)
                throw new InvalidOperationException("Node type of records with children cannot be changed.");
            stockCard.NodeType = request.NodeType.Value;
        }

        stockCard.StockNumber = request.StockNumber.Trim();
        stockCard.Name = request.Name.Trim();
        stockCard.Category = request.Category.Trim();
        stockCard.Unit = request.Unit.Trim();
        stockCard.MinStockLevel = request.MinStockLevel;
        stockCard.MaxStockLevel = request.MaxStockLevel;
        stockCard.CriticalStockLevel = request.CriticalStockLevel;
        stockCard.Barcode = request.Barcode?.Trim();
        stockCard.Sku = request.Sku?.Trim();
        stockCard.Description = request.Description;

        if (request.IsVariantBased.HasValue)
            stockCard.IsVariantBased = request.IsVariantBased.Value;
        if (request.IsActive.HasValue)
            stockCard.IsActive = request.IsActive.Value;

        _repo.Update(stockCard);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}
