using System.Reflection;
using FluentValidation;
using FMMS.Application.Common;
using FMMS.Application.Features.Assets.Services;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace FMMS.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(assembly));
        services.AddValidatorsFromAssembly(assembly);
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
        services.AddAutoMapper(assembly);
        services.AddScoped<AssetLifecycleService>();

        return services;
    }
}
