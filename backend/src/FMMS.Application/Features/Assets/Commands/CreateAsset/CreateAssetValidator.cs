using FluentValidation;

namespace FMMS.Application.Features.Assets.Commands.CreateAsset;

public class CreateAssetValidator : AbstractValidator<CreateAssetCommand>
{
    public CreateAssetValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(200);

        RuleFor(x => x.AssetNumber)
            .NotEmpty().WithMessage("Asset number is required.")
            .MaximumLength(50);

        RuleFor(x => x.LocationId)
            .NotEmpty().WithMessage("Location is required.");
    }
}
