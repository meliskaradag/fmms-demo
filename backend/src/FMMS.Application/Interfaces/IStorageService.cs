namespace FMMS.Application.Interfaces;

public interface IStorageService
{
    Task<string> GeneratePresignedUploadUrl(string bucket, string objectKey, string contentType, int expirySeconds = 3600);
    Task<string> GeneratePresignedDownloadUrl(string bucket, string objectKey, int expirySeconds = 3600);
}
