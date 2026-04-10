using FMMS.Application.DTOs;
using FMMS.Domain.Entities;
using FMMS.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FMMS.Application.Features.Assets.Queries.GetAssetHistory;

public class GetAssetHistoryQueryHandler : IRequestHandler<GetAssetHistoryQuery, List<AssetHistoryDto>>
{
    private readonly IRepository<AssetHistory> _historyRepository;

    public GetAssetHistoryQueryHandler(IRepository<AssetHistory> historyRepository)
    {
        _historyRepository = historyRepository;
    }

    public async Task<List<AssetHistoryDto>> Handle(GetAssetHistoryQuery request, CancellationToken cancellationToken)
    {
        return await _historyRepository.GetQueryable()
            .AsNoTracking()
            .Where(x => x.AssetId == request.AssetId)
            .OrderByDescending(x => x.PerformedAt)
            .Select(x => new AssetHistoryDto
            {
                Id = x.Id,
                AssetId = x.AssetId,
                ActionType = x.ActionType,
                OldValue = x.OldValue,
                NewValue = x.NewValue,
                PerformedBy = x.PerformedBy,
                PerformedAt = x.PerformedAt,
                ReferenceType = x.ReferenceType,
                ReferenceId = x.ReferenceId,
                Note = x.Note
            })
            .ToListAsync(cancellationToken);
    }
}
