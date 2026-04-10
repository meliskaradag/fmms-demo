using FluentValidation;

namespace FMMS.Application.Features.Inventory.Commands.CreateStockVariant;

public class CreateStockVariantValidator : AbstractValidator<CreateStockVariantCommand>
{
    public CreateStockVariantValidator()
    {
        RuleFor(x => x.StockCardId).NotEmpty();
        RuleFor(x => x.Code).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Sku).MaximumLength(128);
        RuleFor(x => x.Barcode).MaximumLength(128);
        RuleFor(x => x.PriceAdjustment).GreaterThanOrEqualTo(0);
        RuleForEach(x => x.Attributes).ChildRules(attr =>
        {
            attr.RuleFor(x => x.StockAttributeId).NotEmpty();
            attr.RuleFor(x => x.StockAttributeOptionId).NotEmpty();
        });
    }
}
