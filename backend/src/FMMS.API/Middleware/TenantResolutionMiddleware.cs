using System.Text.RegularExpressions;
using FMMS.Domain.Interfaces;
using FMMS.Infrastructure.Services;
using Npgsql;

namespace FMMS.API.Middleware;

public class TenantResolutionMiddleware
{
    private readonly RequestDelegate _next;
    private static readonly Regex TenantPathRegex = new(
        @"^/api/v1/t/(?<slug>[^/]+)",
        RegexOptions.Compiled | RegexOptions.IgnoreCase);

    public TenantResolutionMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ITenantContext tenantContext, ICurrentUserContext currentUserContext, IConfiguration configuration)
    {
        var path = context.Request.Path.Value ?? string.Empty;

        // Skip tenant resolution for non-tenant paths (health, swagger, etc.)
        if (!path.StartsWith("/api/v1/t/", StringComparison.OrdinalIgnoreCase))
        {
            await _next(context);
            return;
        }

        var match = TenantPathRegex.Match(path);
        if (!match.Success)
        {
            await _next(context);
            return;
        }

        var slug = match.Groups["slug"].Value;

        var connectionString = configuration.GetConnectionString("DefaultConnection");

        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            "SELECT \"Id\" FROM public.\"Tenants\" WHERE \"Slug\" = @slug AND \"IsActive\" = true",
            connection);
        cmd.Parameters.AddWithValue("slug", slug);

        var result = await cmd.ExecuteScalarAsync();

        if (result is null)
        {
            context.Response.StatusCode = StatusCodes.Status404NotFound;
            await context.Response.WriteAsJsonAsync(new
            {
                traceId = context.TraceIdentifier,
                code = "TENANT_NOT_FOUND",
                message = $"Tenant '{slug}' not found.",
                details = (object?)null
            });
            return;
        }

        var tenantId = (Guid)result;
        // NOTE:
        // Current EF migrations are generated for the "public" schema.
        // For demo stability, keep runtime queries on "public" as well.
        // If true per-tenant schemas are required, migrations/seeding must be
        // generated/applied per tenant schema (tenant_<slug>).
        var schemaName = "public";

        tenantContext.TenantId = tenantId;
        tenantContext.TenantSlug = slug;
        tenantContext.SchemaName = schemaName;

        // Set IP address for audit trail
        if (currentUserContext is CurrentUserContext ctx)
        {
            ctx.IpAddress = context.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
        }

        await _next(context);
    }
}

public static class TenantResolutionMiddlewareExtensions
{
    public static IApplicationBuilder UseTenantResolution(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<TenantResolutionMiddleware>();
    }
}
