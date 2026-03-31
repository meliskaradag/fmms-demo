using FMMS.Domain.Interfaces;

namespace FMMS.Infrastructure.Services;

public class CurrentUserContext : ICurrentUserContext
{
    public Guid UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string IpAddress { get; set; } = "127.0.0.1";
}
