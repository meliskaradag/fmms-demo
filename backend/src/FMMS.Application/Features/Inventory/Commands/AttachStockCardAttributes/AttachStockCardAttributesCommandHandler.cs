using FMMS.Domain.Entities;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.Inventory.Commands.AttachStockCardAttributes;

public class AttachStockCardAttributesCommandHandler : IRequestHandler<AttachStockCardAttributesCommand, bool>
{
    private readonly IRepository<StockCard> _stockCardRepository;
    private readonly IRepository<StockCardAttribute> _stockCardAttributeRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITenantContext _tenantContext;

    public AttachStockCardAttributesCommandHandler(
        IRepository<StockCard> stockCardRepository,
        IRepository<StockCardAttribute> stockCardAttributeRepository,
        IUnitOfWork unitOfWork,
        ITenantContext tenantContext)
    {
        _stockCardRepository = stockCardRepository;
        _stockCardAttributeRepository = stockCardAttributeRepository;
        _unitOfWork = unitOfWork;
        _tenantContext = tenantContext;
    }

    public async Task<bool> Handle(AttachStockCardAttributesCommand request, CancellationToken cancellationToken)
    {
        var stockCard = await _stockCardRepository.GetByIdAsync(request.StockCardId, cancellationToken)
            ?? throw new KeyNotFoundException($"StockCard '{request.StockCardId}' not found.");

        var existing = (await _stockCardAttributeRepository.GetAllAsync(cancellationToken))
            .Where(x => x.StockCardId == request.StockCardId)
            .ToList();
        foreach (var row in existing)
            _stockCardAttributeRepository.Delete(row);

        foreach (var attr in request.Attributes.DistinctBy(x => x.StockAttributeId))
        {
            await _stockCardAttributeRepository.AddAsync(new StockCardAttribute
            {
                StockCardId = request.StockCardId,
                StockAttributeId = attr.StockAttributeId,
                IsRequired = attr.IsRequired,
                SortOrder = attr.SortOrder,
                TenantId = _tenantContext.TenantId
            }, cancellationToken);
        }

        stockCard.UsesVariants = request.Attributes.Count > 0;
        stockCard.IsVariantBased = request.Attributes.Count > 0;
        _stockCardRepository.Update(stockCard);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}
