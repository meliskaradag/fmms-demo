using FluentValidation;

namespace FMMS.Application.Features.Assets.Commands.UpdateAssetStatus;

public class UpdateAssetStatusValidator : AbstractValidator<UpdateAssetStatusCommand>
{
    public UpdateAssetStatusValidator()
    {
        RuleFor(x => x.AssetId).NotEmpty();
        RuleFor(x => x.Status).IsInEnum();
        RuleFor(x => x.Note).MaximumLength(1000);
    }
}
