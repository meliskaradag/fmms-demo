using FMMS.Application.Interfaces;

namespace FMMS.Infrastructure.Services;

/// <summary>
/// No-op storage service for deployments without MinIO (e.g., Railway demo).
/// Returns placeholder URLs instead of real presigned URLs.
/// </summary>
public class NoOpStorageService : IStorageService
{
    public Task<string> GeneratePresignedUploadUrl(string bucket, string objectKey, string contentType, int expirySeconds = 3600)
        => Task.FromResult($"/storage/not-configured?bucket={bucket}&key={objectKey}");

    public Task<string> GeneratePresignedDownloadUrl(string bucket, string objectKey, int expirySeconds = 3600)
        => Task.FromResult($"/storage/not-configured?bucket={bucket}&key={objectKey}");
}
