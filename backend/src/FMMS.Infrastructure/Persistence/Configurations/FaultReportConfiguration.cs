using FMMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FMMS.Infrastructure.Persistence.Configurations;

public class FaultReportConfiguration : IEntityTypeConfiguration<FaultReport>
{
    public void Configure(EntityTypeBuilder<FaultReport> builder)
    {
        builder.Property(x => x.Title).HasMaxLength(300).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(2000);
        builder.Property(x => x.ReviewNote).HasMaxLength(1000);

        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.ReportedBy);

        builder.HasOne(x => x.Location)
            .WithMany()
            .HasForeignKey(x => x.LocationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Asset)
            .WithMany()
            .HasForeignKey(x => x.AssetId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(x => x.LinkedWorkOrder)
            .WithMany()
            .HasForeignKey(x => x.LinkedWorkOrderId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

public class FaultReportPhotoConfiguration : IEntityTypeConfiguration<FaultReportPhoto>
{
    public void Configure(EntityTypeBuilder<FaultReportPhoto> builder)
    {
        builder.Property(x => x.FileName).HasMaxLength(256).IsRequired();
        builder.Property(x => x.ContentType).HasMaxLength(64).IsRequired();
        builder.Property(x => x.Base64Data).IsRequired();
        builder.Property(x => x.GpsLat).HasPrecision(10, 6);
        builder.Property(x => x.GpsLng).HasPrecision(10, 6);

        builder.HasOne(x => x.FaultReport)
            .WithMany(x => x.Photos)
            .HasForeignKey(x => x.FaultReportId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
