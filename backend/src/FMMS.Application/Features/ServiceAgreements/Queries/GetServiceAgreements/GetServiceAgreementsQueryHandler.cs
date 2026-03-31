using System.Text.Json;
using FMMS.Application.Common;
using FMMS.Application.DTOs;
using FMMS.Domain.Entities;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.ServiceAgreements.Queries.GetServiceAgreements;

public class GetServiceAgreementsQueryHandler : IRequestHandler<GetServiceAgreementsQuery, PagedResult<ServiceAgreementDto>>
{
    private readonly IRepository<ServiceAgreement> _repository;
    private readonly IRepository<Vendor> _vendorRepository;

    public GetServiceAgreementsQueryHandler(
        IRepository<ServiceAgreement> repository,
        IRepository<Vendor> vendorRepository)
    {
        _repository = repository;
        _vendorRepository = vendorRepository;
    }

    public async Task<PagedResult<ServiceAgreementDto>> Handle(GetServiceAgreementsQuery request, CancellationToken cancellationToken)
    {
        var allAgreements = await _repository.GetAllAsync(cancellationToken);
        var allVendors = await _vendorRepository.GetAllAsync(cancellationToken);
        var vendorLookup = allVendors.ToDictionary(v => v.Id, v => v.TradeName);

        IEnumerable<ServiceAgreement> filtered = allAgreements;

        if (request.VendorId.HasValue)
        {
            filtered = filtered.Where(a => a.VendorId == request.VendorId.Value);
        }

        var ordered = filtered.OrderByDescending(a => a.CreatedAt).ToList();
        var total = ordered.Count;

        var items = ordered
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(a => MapToDto(a, vendorLookup))
            .ToList();

        return new PagedResult<ServiceAgreementDto>
        {
            Items = items,
            Page = request.Page,
            PageSize = request.PageSize,
            Total = total
        };
    }

    private static ServiceAgreementDto MapToDto(ServiceAgreement a, Dictionary<Guid, string> vendorLookup)
    {
        var coveredAssetIds = new List<Guid>();
        if (!string.IsNullOrEmpty(a.CoveredAssetIds))
        {
            try
            {
                coveredAssetIds = JsonSerializer.Deserialize<List<Guid>>(a.CoveredAssetIds) ?? new List<Guid>();
            }
            catch
            {
                // If parsing fails, return empty list
            }
        }

        return new ServiceAgreementDto
        {
            Id = a.Id,
            AgreementNumber = a.AgreementNumber,
            VendorId = a.VendorId,
            VendorName = vendorLookup.GetValueOrDefault(a.VendorId, string.Empty),
            Title = a.Title,
            Description = a.ScopeDescription,
            StartDate = a.StartDate,
            EndDate = a.EndDate,
            Status = a.Status,
            SlaResponseHours = a.SlaResponseHours,
            SlaResolutionHours = a.SlaResolutionHours,
            CoveredAssetIds = coveredAssetIds,
            MonthlyFee = a.Cost / 12,
            AnnualFee = a.Cost,
            CreatedAt = a.CreatedAt
        };
    }
}
