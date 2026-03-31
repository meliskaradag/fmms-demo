using FluentValidation;

namespace FMMS.Application.Features.Locations.Commands.CreateLocation;

public class CreateLocationValidator : AbstractValidator<CreateLocationCommand>
{
    public CreateLocationValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(200);
    }
}
