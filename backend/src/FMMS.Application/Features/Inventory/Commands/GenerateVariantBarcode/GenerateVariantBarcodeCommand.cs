using MediatR;

namespace FMMS.Application.Features.Inventory.Commands.GenerateVariantBarcode;

public record GenerateVariantBarcodeCommand(Guid StockVariantId) : IRequest<string>;
