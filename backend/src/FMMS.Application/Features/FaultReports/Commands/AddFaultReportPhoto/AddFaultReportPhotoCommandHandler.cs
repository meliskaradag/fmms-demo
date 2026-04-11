using FMMS.Domain.Entities;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.FaultReports.Commands.AddFaultReportPhoto;

public class AddFaultReportPhotoCommandHandler : IRequestHandler<AddFaultReportPhotoCommand, Guid>
{
    private readonly IRepository<FaultReportPhoto> _repo;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITenantContext _tenantContext;

    public AddFaultReportPhotoCommandHandler(
        IRepository<FaultReportPhoto> repo,
        IUnitOfWork unitOfWork,
        ITenantContext tenantContext)
    {
        _repo = repo;
        _unitOfWork = unitOfWork;
        _tenantContext = tenantContext;
    }

    public async Task<Guid> Handle(AddFaultReportPhotoCommand request, CancellationToken cancellationToken)
    {
        var photo = new FaultReportPhoto
        {
            Id = Guid.NewGuid(),
            TenantId = _tenantContext.TenantId,
            FaultReportId = request.FaultReportId,
            FileName = request.FileName,
            ContentType = request.ContentType,
            Base64Data = request.Base64Data,
            GpsLat = request.GpsLat,
            GpsLng = request.GpsLng
        };

        await _repo.AddAsync(photo, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return photo.Id;
    }
}
