using FMMS.Domain.Entities;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.FaultReports.Commands.ReviewFaultReport;

public class ReviewFaultReportCommandHandler : IRequestHandler<ReviewFaultReportCommand>
{
    private readonly IRepository<FaultReport> _repo;
    private readonly IUnitOfWork _unitOfWork;

    public ReviewFaultReportCommandHandler(IRepository<FaultReport> repo, IUnitOfWork unitOfWork)
    {
        _repo = repo;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(ReviewFaultReportCommand request, CancellationToken cancellationToken)
    {
        var faultReport = await _repo.GetByIdAsync(request.FaultReportId, cancellationToken)
            ?? throw new KeyNotFoundException($"FaultReport {request.FaultReportId} not found");

        faultReport.Status = request.NewStatus;
        faultReport.ReviewedBy = request.ReviewedBy;
        faultReport.ReviewNote = request.ReviewNote;
        faultReport.UpdatedAt = DateTime.UtcNow;

        _repo.Update(faultReport);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
