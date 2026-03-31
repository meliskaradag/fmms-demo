using FMMS.Domain.Enums;
using MediatR;

namespace FMMS.Application.Features.Locations.Commands.CreateLocation;

public record CreateLocationCommand(
    string Name,
    LocationType Type,
    Guid? ParentId
) : IRequest<Guid>;
