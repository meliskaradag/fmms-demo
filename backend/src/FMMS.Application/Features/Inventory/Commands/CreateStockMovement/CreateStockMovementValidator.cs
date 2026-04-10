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

        RuleFor(x => x)
            .Must(x => x.MovementType != Domain.Enums.MovementType.Transfer || (x.FromLocationId.HasValue && x.ToLocationId.HasValue))
            .WithMessage("From and To locations are required for transfer.");

        RuleFor(x => x)
            .Must(x => x.MovementType != Domain.Enums.MovementType.Transfer || x.FromLocationId != x.ToLocationId)
            .WithMessage("Transfer source and destination must be different.");

        RuleFor(x => x.UnitCost)
            .GreaterThanOrEqualTo(0)
            .When(x => x.UnitCost.HasValue)
            .WithMessage("Unit cost cannot be negative.");
    }
}
