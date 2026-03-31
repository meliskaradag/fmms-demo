using FluentValidation;

namespace FMMS.Application.Features.Inventory.Commands.CreateStockMovement;

public class CreateStockMovementValidator : AbstractValidator<CreateStockMovementCommand>
{
    public CreateStockMovementValidator()
    {
        RuleFor(x => x.StockCardId)
            .NotEmpty().WithMessage("Stock card id is required.");

        RuleFor(x => x.Quantity)
            .GreaterThan(0).WithMessage("Quantity must be greater than zero.");

        RuleFor(x => x.MovementType)
            .IsInEnum().WithMessage("Invalid movement type.");
    }
}
