using FMMS.Domain.Common;

namespace FMMS.Domain.Entities;

public class FileObject : AuditableEntity, ITenantScoped
{
    public string ObjectKey { get; set; } = default!;
    public string Bucket { get; set; } = default!;
    public string OriginalName { get; set; } = default!;
    public string ContentType { get; set; } = default!;
    public long SizeBytes { get; set; }
    public string? ChecksumSha256 { get; set; }
    public string? Metadata { get; set; }
}
