using FMMS.Application.Common;
using FMMS.Application.DTOs;
using FMMS.Domain.Enums;
using MediatR;

namespace FMMS.Application.Features.FaultReports.Queries.GetFaultReports;

public record GetFaultReportsQuery(
    FaultReportStatus? Status,
    Guid? ReportedBy,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<FaultReportDto>>;
