using FMMS.Domain.Enums;
using MediatR;

namespace FMMS.Application.Features.Maintenance.Commands.CreateMaintenanceCard;

public record CreateMaintenanceCardCommand(
    string Name,
    string? AssetCategory,
    string? Description,
    MaintenanceLevel Level,
    TimeSpan? EstimatedDuration,
    int DefaultPeriodDays,
    bool IsTemplate,
    List<CreateMaintenanceCardStepItem> Steps,
    List<CreateMaintenanceCardMaterialItem> Materials
) : IRequest<Guid>;

public record CreateMaintenanceCardStepItem(
    int StepOrder,
    string Instruction,
    StepStatus StepStatus,
    int EstimatedMinutes
);

public record CreateMaintenanceCardMaterialItem(
    Guid StockCardId,
    decimal Quantity
);
