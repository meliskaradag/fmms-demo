using FMMS.Application.Features.Inventory.Services;
using FMMS.Domain.Entities;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.Inventory.Commands.GenerateVariantBarcode;

public class GenerateVariantBarcodeCommandHandler : IRequestHandler<GenerateVariantBarcodeCommand, string>
{
    private readonly IRepository<StockVariant> _variantRepository;
    private readonly IRepository<StockCard> _stockCardRepository;
    private readonly IUnitOfWork _unitOfWork;

    public GenerateVariantBarcodeCommandHandler(
        IRepository<StockVariant> variantRepository,
        IRepository<StockCard> stockCardRepository,
        IUnitOfWork unitOfWork)
    {
        _variantRepository = variantRepository;
        _stockCardRepository = stockCardRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<string> Handle(GenerateVariantBarcodeCommand request, CancellationToken cancellationToken)
    {
        var variant = await _variantRepository.GetByIdAsync(request.StockVariantId, cancellationToken)
            ?? throw new KeyNotFoundException($"StockVariant '{request.StockVariantId}' not found.");
        var stockCard = await _stockCardRepository.GetByIdAsync(variant.StockCardId, cancellationToken)
            ?? throw new KeyNotFoundException($"StockCard '{variant.StockCardId}' not found.");

        var allVariants = await _variantRepository.GetAllAsync(cancellationToken);
        var nextSerial = allVariants.Count(x => x.StockCardId == variant.StockCardId) + 1;
        var barcode = StockVariantComposer.BuildNextBarcode(stockCard.StockNumber, variant.Code, nextSerial);

        while (allVariants.Any(x => x.Barcode == barcode))
        {
            nextSerial++;
            barcode = StockVariantComposer.BuildNextBarcode(stockCard.StockNumber, variant.Code, nextSerial);
        }

        variant.Barcode = barcode;
        _variantRepository.Update(variant);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return barcode;
    }
}
