using FMMS.Application.DTOs;
using FMMS.Domain.Entities;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.Locations.Queries.GetLocationTree;

public class GetLocationTreeQueryHandler : IRequestHandler<GetLocationTreeQuery, List<LocationDto>>
{
    private readonly IRepository<Location> _repository;

    public GetLocationTreeQueryHandler(IRepository<Location> repository)
    {
        _repository = repository;
    }

    public async Task<List<LocationDto>> Handle(GetLocationTreeQuery request, CancellationToken cancellationToken)
    {
        var allLocations = await _repository.GetAllAsync(cancellationToken);

        var lookup = allLocations.ToLookup(l => l.ParentId);

        return BuildTree(lookup, null);
    }

    private static List<LocationDto> BuildTree(ILookup<Guid?, Location> lookup, Guid? parentId)
    {
        return lookup[parentId].Select(location => new LocationDto
        {
            Id = location.Id,
            Name = location.Name,
            Type = location.Type,
            ParentId = location.ParentId,
            CreatedAt = location.CreatedAt,
            Children = BuildTree(lookup, location.Id)
        }).ToList();
    }
}
