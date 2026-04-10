using MediatR;

namespace FMMS.Application.Features.Assets.Commands.UnassignAsset;

public record UnassignAssetCommand(
    Guid AssetId,
    string? Reason,
    string? Notes
) : IRequest;
