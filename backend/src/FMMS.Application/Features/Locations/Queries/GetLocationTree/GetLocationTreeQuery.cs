using FMMS.Application.DTOs;
using MediatR;

namespace FMMS.Application.Features.Locations.Queries.GetLocationTree;

public record GetLocationTreeQuery : IRequest<List<LocationDto>>;
