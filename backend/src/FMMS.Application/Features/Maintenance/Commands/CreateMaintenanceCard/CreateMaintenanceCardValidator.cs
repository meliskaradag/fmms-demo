using FluentValidation;

namespace FMMS.Application.Features.Maintenance.Commands.CreateMaintenanceCard;

public class CreateMaintenanceCardValidator : AbstractValidator<CreateMaintenanceCardCommand>
{
    public CreateMaintenanceCardValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(200);

        RuleForEach(x => x.Steps).ChildRules(step =>
        {
            step.RuleFor(s => s.Instruction)
                .NotEmpty().WithMessage("Step instruction is required.");

            step.RuleFor(s => s.StepOrder)
                .GreaterThan(0).WithMessage("Step order must be greater than zero.");
        });

        RuleForEach(x => x.Materials).ChildRules(material =>
        {
            material.RuleFor(m => m.StockCardId)
                .NotEmpty().WithMessage("Stock card is required.");

            material.RuleFor(m => m.Quantity)
                .GreaterThan(0).WithMessage("Quantity must be greater than zero.");
        });
    }
}
