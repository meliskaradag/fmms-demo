using FluentValidation;

namespace FMMS.Application.Features.Assets.Commands.UnassignAsset;

public class UnassignAssetValidator : AbstractValidator<UnassignAssetCommand>
{
    public UnassignAssetValidator()
    {
        RuleFor(x => x.AssetId).NotEmpty();
        RuleFor(x => x.Reason).MaximumLength(500);
        RuleFor(x => x.Notes).MaximumLength(2000);
    }
}
