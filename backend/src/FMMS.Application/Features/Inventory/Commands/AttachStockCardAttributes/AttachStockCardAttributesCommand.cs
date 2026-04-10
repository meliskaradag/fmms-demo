using MediatR;

namespace FMMS.Application.Features.Inventory.Commands.AttachStockCardAttributes;

public record AttachStockCardAttributesCommand(
    Guid StockCardId,
    List<AttachAttributeInput> Attributes
) : IRequest<bool>;

public record AttachAttributeInput(Guid StockAttributeId, bool IsRequired, int SortOrder);
