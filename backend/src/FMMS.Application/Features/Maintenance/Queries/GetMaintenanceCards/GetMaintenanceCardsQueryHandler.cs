using FMMS.Application.Common;
using FMMS.Application.DTOs;
using FMMS.Domain.Entities;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.Maintenance.Queries.GetMaintenanceCards;

public class GetMaintenanceCardsQueryHandler : IRequestHandler<GetMaintenanceCardsQuery, PagedResult<MaintenanceCardDto>>
{
    private readonly IRepository<MaintenanceCard> _repository;

    public GetMaintenanceCardsQueryHandler(IRepository<MaintenanceCard> repository)
    {
        _repository = repository;
    }

    public async Task<PagedResult<MaintenanceCardDto>> Handle(GetMaintenanceCardsQuery request, CancellationToken cancellationToken)
    {
        var allCards = await _repository.GetAllAsync(cancellationToken);

        var ordered = allCards.OrderByDescending(c => c.CreatedAt).ToList();
        var total = ordered.Count;

        var items = ordered
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(c => new MaintenanceCardDto
            {
                Id = c.Id,
                Name = c.Name,
                AssetCategory = c.AssetCategory,
                Description = c.Description,
                Level = c.Level,
                EstimatedDuration = c.EstimatedDuration,
                DefaultPeriodDays = c.DefaultPeriodDays,
                IsTemplate = c.IsTemplate,
                CreatedAt = c.CreatedAt
            }).ToList();

        return new PagedResult<MaintenanceCardDto>
        {
            Items = items,
            Page = request.Page,
            PageSize = request.PageSize,
            Total = total
        };
    }
}
