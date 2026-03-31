namespace FMMS.Application.DTOs;

public class PresignedUrlDto
{
    public string UploadUrl { get; set; } = default!;
    public string ObjectKey { get; set; } = default!;
    public DateTime ExpiresAt { get; set; }
}
