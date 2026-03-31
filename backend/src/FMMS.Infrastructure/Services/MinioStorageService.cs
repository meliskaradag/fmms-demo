using FMMS.Application.Interfaces;
using Minio;
using Minio.DataModel.Args;

namespace FMMS.Infrastructure.Services;

public class MinioStorageService : IStorageService
{
    private readonly IMinioClient _minioClient;

    public MinioStorageService(IMinioClient minioClient)
    {
        _minioClient = minioClient;
    }

    public async Task<string> GeneratePresignedUploadUrl(string bucket, string objectKey, string contentType, int expirySeconds = 3600)
    {
        var args = new PresignedPutObjectArgs()
            .WithBucket(bucket)
            .WithObject(objectKey)
            .WithExpiry(expirySeconds);

        return await _minioClient.PresignedPutObjectAsync(args);
    }

    public async Task<string> GeneratePresignedDownloadUrl(string bucket, string objectKey, int expirySeconds = 3600)
    {
        var args = new PresignedGetObjectArgs()
            .WithBucket(bucket)
            .WithObject(objectKey)
            .WithExpiry(expirySeconds);

        return await _minioClient.PresignedGetObjectAsync(args);
    }
}
