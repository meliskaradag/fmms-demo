using FMMS.Application.Common;
using FMMS.Application.DTOs;
using FMMS.Domain.Entities;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.WorkOrders.Queries.GetWorkOrders;

public class GetWorkOrdersQueryHandler : IRequestHandler<GetWorkOrdersQuery, PagedResult<WorkOrderDto>>
{
    private readonly IRepository<WorkOrder> _repo;
    private readonly IRepository<Location> _locationRepo;
    private readonly IRepository<Asset> _assetRepo;

    public GetWorkOrdersQueryHandler(IRepository<WorkOrder> repo, IRepository<Location> locationRepo, IRepository<Asset> assetRepo)
    {
        _repo = repo;
        _locationRepo = locationRepo;
        _assetRepo = assetRepo;
    }

    public async Task<PagedResult<WorkOrderDto>> Handle(GetWorkOrdersQuery request, CancellationToken cancellationToken)
    {
        var allOrders = await _repo.GetAllAsync(cancellationToken);
        var locations = await _locationRepo.GetAllAsync(cancellationToken);
        var locationLookup = locations.ToDictionary(l => l.Id, l => l.Name);
        var assets = await _assetRepo.GetAllAsync(cancellationToken);
        var assetLookup = assets.ToDictionary(a => a.Id, a => a.Name);

        var query = allOrders.AsQueryable();

        if (request.Status.HasValue)
            query = query.Where(w => w.Status == request.Status.Value);

        if (request.PriorityFilter.HasValue)
            query = query.Where(w => w.Priority == request.PriorityFilter.Value);

        if (request.TypeFilter.HasValue)
            query = query.Where(w => w.Type == request.TypeFilter.Value);

        if (request.LocationId.HasValue)
        {
            if (!request.IncludeDescendants)
            {
                query = query.Where(w => w.LocationId == request.LocationId.Value);
            }
            else
            {
                var childMap = locations
                    .Where(l => l.ParentId.HasValue)
                    .GroupBy(l => l.ParentId!.Value)
                    .ToDictionary(g => g.Key, g => g.Select(x => x.Id).ToList());

                var selected = request.LocationId.Value;
                var queue = new Queue<Guid>();
                var allowed = new HashSet<Guid> { selected };
                queue.Enqueue(selected);

                while (queue.Count > 0)
                {
                    var parentId = queue.Dequeue();
                    if (!childMap.TryGetValue(parentId, out var children)) continue;
                    foreach (var childId in children)
                    {
                        if (!allowed.Add(childId)) continue;
                        queue.Enqueue(childId);
                    }
                }

                query = query.Where(w => allowed.Contains(w.LocationId));
            }
        }

        var total = query.Count();

        var items = query
            .OrderByDescending(w => w.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(w => new WorkOrderDto
            {
                Id = w.Id,
                OrderNumber = w.OrderNumber,
                Title = w.Title,
                Description = w.Description,
                AssetId = w.AssetId,
                AssetName = w.AssetId.HasValue ? assetLookup.GetValueOrDefault(w.AssetId.Value) : null,
                Type = w.Type,
                Priority = w.Priority,
                Status = w.Status,
                LocationId = w.LocationId,
                LocationName = locationLookup.GetValueOrDefault(w.LocationId),
                ReportedBy = w.ReportedBy,
                ScheduledStart = w.ScheduledStart,
                ActualStart = w.ActualStart,
                ActualEnd = w.ActualEnd,
                SlaDeadline = w.SlaDeadline,
                CreatedAt = w.CreatedAt
            })
            .ToList();

        return new PagedResult<WorkOrderDto>
        {
            Items = items,
            Page = request.Page,
            PageSize = request.PageSize,
            Total = total
        };
    }
}
