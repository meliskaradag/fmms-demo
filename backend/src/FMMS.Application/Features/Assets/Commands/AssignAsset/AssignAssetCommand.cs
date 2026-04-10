using MediatR;

namespace FMMS.Application.Features.Assets.Commands.AssignAsset;

public record AssignAssetCommand(
    Guid AssetId,
    Guid ToUserId,
    string? Reason,
    string? Notes
) : IRequest;
