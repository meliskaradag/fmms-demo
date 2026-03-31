using FluentValidation;

namespace FMMS.Application.Features.WorkOrders.Commands.CreateWorkOrder;

public class CreateWorkOrderValidator : AbstractValidator<CreateWorkOrderCommand>
{
    public CreateWorkOrderValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.LocationId).NotEmpty();
        RuleFor(x => x.ReportedBy).NotEmpty();
    }
}
