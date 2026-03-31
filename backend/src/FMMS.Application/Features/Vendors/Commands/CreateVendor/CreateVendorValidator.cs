using FluentValidation;

namespace FMMS.Application.Features.Vendors.Commands.CreateVendor;

public class CreateVendorValidator : AbstractValidator<CreateVendorCommand>
{
    public CreateVendorValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(200);

        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Code is required.")
            .MaximumLength(100);
    }
}
