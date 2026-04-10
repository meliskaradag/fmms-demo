using FluentValidation;

namespace FMMS.Application.Features.Inventory.Commands.CreateStockCard;

public class CreateStockCardValidator : AbstractValidator<CreateStockCardCommand>
{
    public CreateStockCardValidator()
    {
        RuleFor(x => x.StockNumber)
            .NotEmpty().WithMessage("Stock number is required.")
            .MaximumLength(100);

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(200);

        RuleFor(x => x.Category)
            .NotEmpty().WithMessage("Category is required.")
            .MaximumLength(100);

        RuleFor(x => x.Unit)
            .NotEmpty().WithMessage("Unit is required.")
            .MaximumLength(50);

        RuleFor(x => x.MinStockLevel)
            .GreaterThanOrEqualTo(0).WithMessage("Min stock level cannot be negative.");

        RuleFor(x => x.CurrentBalance)
            .GreaterThanOrEqualTo(0).WithMessage("Current balance cannot be negative.");

        RuleFor(x => x.Barcode)
            .MaximumLength(128);

        RuleFor(x => x.Sku)
            .MaximumLength(128);

        RuleFor(x => x.ParentId)
            .NotEqual(Guid.Empty)
            .When(x => x.ParentId.HasValue)
            .WithMessage("ParentId cannot be empty guid.");
    }
}
