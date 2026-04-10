using FluentValidation;

namespace FMMS.Application.Features.Assets.Commands.AssignAsset;

public class AssignAssetValidator : AbstractValidator<AssignAssetCommand>
{
    public AssignAssetValidator()
    {
        RuleFor(x => x.AssetId).NotEmpty();
        RuleFor(x => x.ToUserId).NotEmpty();
        RuleFor(x => x.Reason).MaximumLength(500);
        RuleFor(x => x.Notes).MaximumLength(2000);
    }
}
