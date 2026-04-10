using FMMS.Application.Features.Inventory.Services;
using FMMS.Domain.Entities;
using FMMS.Domain.Enums;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.Inventory.Commands.CreateStockVariant;

public class CreateStockVariantCommandHandler : IRequestHandler<CreateStockVariantCommand, Guid>
{
    private readonly IRepository<StockCard> _stockCardRepository;
    private readonly IRepository<StockVariant> _variantRepository;
    private readonly IRepository<StockAttributeOption> _attributeOptionRepository;
    private readonly IRepository<StockVariantAttributeValue> _variantAttributeValueRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITenantContext _tenantContext;

    public CreateStockVariantCommandHandler(
        IRepository<StockCard> stockCardRepository,
        IRepository<StockVariant> variantRepository,
        IRepository<StockAttributeOption> attributeOptionRepository,
        IRepository<StockVariantAttributeValue> variantAttributeValueRepository,
        IUnitOfWork unitOfWork,
        ITenantContext tenantContext)
    {
        _stockCardRepository = stockCardRepository;
        _variantRepository = variantRepository;
        _attributeOptionRepository = attributeOptionRepository;
        _variantAttributeValueRepository = variantAttributeValueRepository;
        _unitOfWork = unitOfWork;
        _tenantContext = tenantContext;
    }

    public async Task<Guid> Handle(CreateStockVariantCommand request, CancellationToken cancellationToken)
    {
        var stockCard = await _stockCardRepository.GetByIdAsync(request.StockCardId, cancellationToken)
            ?? throw new KeyNotFoundException($"StockCard '{request.StockCardId}' not found.");

        if (stockCard.NodeType != StockNodeType.StockCard)
            throw new InvalidOperationException("Variants can only be created under STOCK_CARD nodes.");

        stockCard.IsVariantBased = true;
        stockCard.UsesVariants = true;

        var allVariants = await _variantRepository.GetAllAsync(cancellationToken);
        if (allVariants.Any(v => v.StockCardId == request.StockCardId && v.Code == request.Code))
            throw new InvalidOperationException($"Variant code '{request.Code}' already exists for this stock card.");
        if (!string.IsNullOrWhiteSpace(request.Barcode) && allVariants.Any(v => v.Barcode == request.Barcode))
            throw new InvalidOperationException($"Barcode '{request.Barcode}' already exists.");
        if (!string.IsNullOrWhiteSpace(request.Sku) && allVariants.Any(v => v.Sku == request.Sku))
            throw new InvalidOperationException($"Sku '{request.Sku}' already exists.");

        var variantKey = StockVariantComposer.BuildVariantKey(request.Attributes.Select(x => (x.StockAttributeId, x.StockAttributeOptionId)));
        if (allVariants.Any(v => v.StockCardId == request.StockCardId && v.VariantKey == variantKey))
            throw new InvalidOperationException("Same attribute combination already exists for this stock card.");

        var options = await _attributeOptionRepository.GetAllAsync(cancellationToken);
        var selectedOptionNames = request.Attributes
            .Select(x => options.FirstOrDefault(o => o.Id == x.StockAttributeOptionId)?.DisplayValue
                      ?? options.FirstOrDefault(o => o.Id == x.StockAttributeOptionId)?.Value)
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Cast<string>()
            .ToList();
        var summary = StockVariantComposer.BuildSummary(selectedOptionNames);
        var displayName = request.Name?.Trim();
        if (string.IsNullOrWhiteSpace(displayName))
            displayName = StockVariantComposer.BuildDisplayName(stockCard, summary);

        var variant = new StockVariant
        {
            StockCardId = request.StockCardId,
            Code = request.Code.Trim(),
            Sku = string.IsNullOrWhiteSpace(request.Sku) ? null : request.Sku.Trim(),
            Barcode = string.IsNullOrWhiteSpace(request.Barcode) ? null : request.Barcode.Trim(),
            Name = displayName!,
            VariantSummary = summary,
            VariantKey = variantKey,
            PriceAdjustment = request.PriceAdjustment,
            PurchasePriceOverride = request.PurchasePriceOverride,
            SalesPriceOverride = request.SalesPriceOverride,
            TenantId = _tenantContext.TenantId
        };

        await _variantRepository.AddAsync(variant, cancellationToken);

        foreach (var attr in request.Attributes)
        {
            await _variantAttributeValueRepository.AddAsync(new StockVariantAttributeValue
            {
                StockVariantId = variant.Id,
                StockAttributeId = attr.StockAttributeId,
                StockAttributeOptionId = attr.StockAttributeOptionId,
                TenantId = _tenantContext.TenantId
            }, cancellationToken);
        }

        _stockCardRepository.Update(stockCard);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return variant.Id;
    }
}
