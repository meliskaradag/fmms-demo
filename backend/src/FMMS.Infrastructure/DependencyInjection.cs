using FMMS.Domain.Interfaces;
using FMMS.Application.Interfaces;
using FMMS.Infrastructure.Persistence;
using FMMS.Infrastructure.Persistence.Interceptors;
using FMMS.Infrastructure.Persistence.Repositories;
using FMMS.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Minio;

namespace FMMS.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<AuditableEntityInterceptor>();

        services.AddDbContext<FmmsDbContext>((serviceProvider, options) =>
        {
            var interceptor = serviceProvider.GetRequiredService<AuditableEntityInterceptor>();
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection"))
                   .AddInterceptors(interceptor);
        });

        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped(typeof(IRepository<>), typeof(GenericRepository<>));
        services.AddScoped<ITenantContext, TenantContext>();
        services.AddScoped<ICurrentUserContext, CurrentUserContext>();

        var minioSection = configuration.GetSection("MinIO");
        services.AddSingleton<IMinioClient>(_ =>
            new MinioClient()
                .WithEndpoint(minioSection["Endpoint"])
                .WithCredentials(minioSection["AccessKey"], minioSection["SecretKey"])
                .Build());

        services.AddScoped<IStorageService, MinioStorageService>();

        return services;
    }
}
