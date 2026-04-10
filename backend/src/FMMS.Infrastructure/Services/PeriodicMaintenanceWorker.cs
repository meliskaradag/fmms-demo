using FMMS.Application.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace FMMS.Infrastructure.Services;

public class PeriodicMaintenanceWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<PeriodicMaintenanceWorker> _logger;

    public PeriodicMaintenanceWorker(IServiceProvider serviceProvider, ILogger<PeriodicMaintenanceWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var planner = scope.ServiceProvider.GetRequiredService<IPeriodicMaintenancePlanner>();
                var result = await planner.ExecuteForAllTenantsAsync(stoppingToken);

                if (result.WorkOrdersCreated > 0 || result.BlockedByStock > 0 || result.SkippedExistingOpenWorkOrder > 0)
                {
                    _logger.LogInformation(
                        "Periodic maintenance processed. Created: {Created}, BlockedByStock: {Blocked}, SkippedOpenWO: {Skipped}",
                        result.WorkOrdersCreated,
                        result.BlockedByStock,
                        result.SkippedExistingOpenWorkOrder);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Periodic maintenance worker failed.");
            }

            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }
}
