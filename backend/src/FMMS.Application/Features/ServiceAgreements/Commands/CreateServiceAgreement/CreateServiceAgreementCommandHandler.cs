using System.Text.Json;
using FMMS.Domain.Entities;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.ServiceAgreements.Commands.CreateServiceAgreement;

public class CreateServiceAgreementCommandHandler : IRequestHandler<CreateServiceAgreementCommand, Guid>
{
    private readonly IRepository<ServiceAgreement> _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITenantContext _tenantContext;

    public CreateServiceAgreementCommandHandler(
        IRepository<ServiceAgreement> repository,
        IUnitOfWork unitOfWork,
        ITenantContext tenantContext)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _tenantContext = tenantContext;
    }

    public async Task<Guid> Handle(CreateServiceAgreementCommand request, CancellationToken cancellationToken)
    {
        var agreement = new ServiceAgreement
        {
            AgreementNumber = request.AgreementNumber,
            VendorId = request.VendorId,
            Title = request.Title,
            ScopeDescription = request.Description,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            AutoRenew = request.AutoRenew,
            SlaResponseHours = request.SlaResponseHours,
            SlaResolutionHours = request.SlaResolutionHours,
            Cost = request.Cost,
            Currency = request.Currency ?? "TRY",
            Status = request.Status,
            CoveredAssetIds = JsonSerializer.Serialize(request.CoveredAssetIds ?? new List<Guid>()),
            CoveredMaintTypes = request.CoveredMaintTypes ?? "[]",
            TenantId = _tenantContext.TenantId
        };

        await _repository.AddAsync(agreement, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return agreement.Id;
    }
}
