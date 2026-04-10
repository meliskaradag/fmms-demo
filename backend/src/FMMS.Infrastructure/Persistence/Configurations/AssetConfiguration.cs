using FMMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FMMS.Infrastructure.Persistence.Configurations;

public class AssetConfiguration : IEntityTypeConfiguration<Asset>
{
    public void Configure(EntityTypeBuilder<Asset> builder)
    {
        builder.Property(x => x.AssetTag).HasMaxLength(64).IsRequired();
        builder.Property(x => x.AssetNumber).HasMaxLength(64).IsRequired();
        builder.Property(x => x.Name).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Category).HasMaxLength(128).IsRequired();
        builder.Property(x => x.Manufacturer).HasMaxLength(128);
        builder.Property(x => x.Brand).HasMaxLength(128);
        builder.Property(x => x.Model).HasMaxLength(128);
        builder.Property(x => x.SerialNumber).HasMaxLength(128);
        builder.Property(x => x.Barcode).HasMaxLength(128);
        builder.Property(x => x.QrCode).HasMaxLength(256);
        builder.Property(x => x.BatchNumber).HasMaxLength(128);
        builder.Property(x => x.PurchaseCost).HasPrecision(18, 2);

        builder.HasIndex(x => x.AssetTag).IsUnique();
        builder.HasIndex(x => x.SerialNumber).IsUnique().HasFilter("\"SerialNumber\" IS NOT NULL");
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.LocationId);
        builder.HasIndex(x => x.AssignedToUserId);
        builder.HasIndex(x => x.WarrantyEndDate);

        builder.HasOne(x => x.ParentAsset)
            .WithMany(x => x.ChildAssets)
            .HasForeignKey(x => x.ParentAssetId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Location)
            .WithMany(x => x.Assets)
            .HasForeignKey(x => x.LocationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasCheckConstraint("CK_Assets_WarrantyDateRange", "\"WarrantyStartDate\" IS NULL OR \"WarrantyEndDate\" IS NULL OR \"WarrantyEndDate\" > \"WarrantyStartDate\"");
        builder.HasCheckConstraint("CK_Assets_ParentNotSelf", "\"ParentAssetId\" IS NULL OR \"ParentAssetId\" <> \"Id\"");
    }
}
