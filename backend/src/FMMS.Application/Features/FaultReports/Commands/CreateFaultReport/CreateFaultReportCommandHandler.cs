using FMMS.Domain.Entities;
using FMMS.Domain.Enums;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.FaultReports.Commands.CreateFaultReport;

public class CreateFaultReportCommandHandler : IRequestHandler<CreateFaultReportCommand, Guid>
{
    private readonly IRepository<FaultReport> _repo;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITenantContext _tenantContext;

    public CreateFaultReportCommandHandler(
        IRepository<FaultReport> repo,
        IUnitOfWork unitOfWork,
        ITenantContext tenantContext)
    {
        _repo = repo;
        _unitOfWork = unitOfWork;
        _tenantContext = tenantContext;
    }

    public async Task<Guid> Handle(CreateFaultReportCommand request, CancellationToken cancellationToken)
    {
        var faultReport = new FaultReport
        {
            Id = Guid.NewGuid(),
            TenantId = _tenantContext.TenantId,
            Title = request.Title,
            Description = request.Description,
            LocationId = request.LocationId,
            AssetId = request.AssetId,
            Priority = request.Priority,
            Status = FaultReportStatus.Open,
            ReportedBy = request.ReportedBy
        };

        await _repo.AddAsync(faultReport, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return faultReport.Id;
    }
}
