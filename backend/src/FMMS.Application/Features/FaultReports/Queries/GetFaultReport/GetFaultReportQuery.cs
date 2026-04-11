using FMMS.Application.DTOs;
using MediatR;

namespace FMMS.Application.Features.FaultReports.Queries.GetFaultReport;

public record GetFaultReportQuery(Guid Id) : IRequest<FaultReportDto?>;
