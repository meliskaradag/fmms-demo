using FMMS.Application.DTOs;
using MediatR;

namespace FMMS.Application.Features.Maintenance.Queries.GetMaintenanceCard;

public record GetMaintenanceCardQuery(Guid Id) : IRequest<MaintenanceCardDto?>;
