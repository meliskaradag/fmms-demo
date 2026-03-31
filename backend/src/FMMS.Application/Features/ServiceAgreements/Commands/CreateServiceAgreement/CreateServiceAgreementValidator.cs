using FluentValidation;

namespace FMMS.Application.Features.ServiceAgreements.Commands.CreateServiceAgreement;

public class CreateServiceAgreementValidator : AbstractValidator<CreateServiceAgreementCommand>
{
    public CreateServiceAgreementValidator()
    {
        RuleFor(x => x.AgreementNumber)
            .NotEmpty().WithMessage("Agreement number is required.")
            .MaximumLength(50);

        RuleFor(x => x.VendorId)
            .NotEmpty().WithMessage("Vendor is required.");

        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MaximumLength(200);

        RuleFor(x => x.StartDate)
            .NotEmpty().WithMessage("Start date is required.");

        RuleFor(x => x.EndDate)
            .NotEmpty().WithMessage("End date is required.")
            .GreaterThan(x => x.StartDate).WithMessage("End date must be after start date.");

        RuleFor(x => x.SlaResponseHours)
            .GreaterThan(0).WithMessage("SLA response hours must be greater than 0.");

        RuleFor(x => x.SlaResolutionHours)
            .GreaterThan(0).WithMessage("SLA resolution hours must be greater than 0.");
    }
}
