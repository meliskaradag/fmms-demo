using System.Text.Json;
using FMMS.Application.DTOs;
using FMMS.Domain.Entities;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.ServiceAgreements.Queries.GetServiceAgreement;

public class GetServiceAgreementQueryHandler : IRequestHandler<GetServiceAgreementQuery, ServiceAgreementDto?>
{
    private readonly IRepository<ServiceAgreement> _repository;
    private readonly IRepository<Vendor> _vendorRepository;

    public GetServiceAgreementQueryHandler(
        IRepository<ServiceAgreement> repository,
        IRepository<Vendor> vendorRepository)
    {
        _repository = repository;
        _vendorRepository = vendorRepository;
    }

    public async Task<ServiceAgreementDto?> Handle(GetServiceAgreementQuery request, CancellationToken cancellationToken)
    {
        var agreement = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (agreement == null)
            return null;

        var vendor = await _vendorRepository.GetByIdAsync(agreement.VendorId, cancellationToken);
        var vendorName = vendor?.TradeName ?? string.Empty;

        var coveredAssetIds = new List<Guid>();
        var coveredStockCardIds = new List<Guid>();
        if (!string.IsNullOrEmpty(agreement.CoveredAssetIds))
        {
            try
            {
                coveredAssetIds = JsonSerializer.Deserialize<List<Guid>>(agreement.CoveredAssetIds) ?? new List<Guid>();
            }
            catch
            {
                // If parsing fails, return empty list
            }
        }

        if (!string.IsNullOrEmpty(agreement.CoveredMaintTypes))
        {
            try
            {
                coveredStockCardIds = JsonSerializer.Deserialize<List<Guid>>(agreement.CoveredMaintTypes) ?? new List<Guid>();
            }
            catch
            {
                // If parsing fails, return empty list
            }
        }

        return new ServiceAgreementDto
        {
            Id = agreement.Id,
            AgreementNumber = agreement.AgreementNumber,
            VendorId = agreement.VendorId,
            VendorName = vendorName,
            ContactInfo = agreement.ScopeDescription ?? string.Empty,
            StartDate = agreement.StartDate,
            EndDate = agreement.EndDate,
            Status = agreement.Status,
            SlaResponseHours = agreement.SlaResponseHours,
            SlaResolutionHours = agreement.SlaResolutionHours,
            CoveredAssetIds = coveredAssetIds,
            CoveredStockCardIds = coveredStockCardIds,
            MonthlyFee = agreement.Cost / 12,
            AnnualFee = agreement.Cost,
            CreatedAt = agreement.CreatedAt
        };
    }
}
