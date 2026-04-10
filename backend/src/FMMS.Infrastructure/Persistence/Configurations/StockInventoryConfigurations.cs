using FMMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FMMS.Infrastructure.Persistence.Configurations;

public class StockCardConfiguration : IEntityTypeConfiguration<StockCard>
{
    public void Configure(EntityTypeBuilder<StockCard> builder)
    {
        builder.Property(x => x.StockNumber).HasMaxLength(100);
        builder.Property(x => x.Name).HasMaxLength(200);
        builder.Property(x => x.Category).HasMaxLength(100);
        builder.Property(x => x.Unit).HasMaxLength(50);
        builder.Property(x => x.Currency).HasMaxLength(8);
        builder.Property(x => x.ShortName).HasMaxLength(128);
        builder.Property(x => x.Brand).HasMaxLength(128);
        builder.Property(x => x.Manufacturer).HasMaxLength(128);
        builder.Property(x => x.Model).HasMaxLength(128);
        builder.Property(x => x.BarcodeGenerationType).HasMaxLength(64);
        builder.Property(x => x.Sku).HasMaxLength(128);
        builder.Property(x => x.ToleranceType).HasMaxLength(32);

        builder.HasIndex(x => new { x.TenantId, x.StockNumber }).IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.Barcode });
        builder.HasIndex(x => new { x.TenantId, x.Sku });
        builder.HasIndex(x => new { x.TenantId, x.NodeType });
        builder.HasIndex(x => new { x.TenantId, x.ParentId, x.NodeType });
    }
}

public class StockVariantConfiguration : IEntityTypeConfiguration<StockVariant>
{
    public void Configure(EntityTypeBuilder<StockVariant> builder)
    {
        builder.Property(x => x.Code).HasMaxLength(100);
        builder.Property(x => x.Sku).HasMaxLength(128);
        builder.Property(x => x.Barcode).HasMaxLength(128);
        builder.Property(x => x.Name).HasMaxLength(200);
        builder.Property(x => x.VariantSummary).HasMaxLength(512);
        builder.Property(x => x.VariantKey).HasMaxLength(256);

        builder.HasOne(x => x.StockCard)
            .WithMany(x => x.Variants)
            .HasForeignKey(x => x.StockCardId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.TenantId, x.StockCardId, x.Code }).IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.StockCardId, x.VariantKey }).IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.Barcode }).IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.Sku }).IsUnique();
    }
}

public class StockAttributeConfiguration : IEntityTypeConfiguration<StockAttribute>
{
    public void Configure(EntityTypeBuilder<StockAttribute> builder)
    {
        builder.Property(x => x.Code).HasMaxLength(100);
        builder.Property(x => x.Name).HasMaxLength(128);
        builder.HasIndex(x => new { x.TenantId, x.Code }).IsUnique();
    }
}

public class StockAttributeOptionConfiguration : IEntityTypeConfiguration<StockAttributeOption>
{
    public void Configure(EntityTypeBuilder<StockAttributeOption> builder)
    {
        builder.Property(x => x.Code).HasMaxLength(100);
        builder.Property(x => x.Value).HasMaxLength(128);
        builder.Property(x => x.DisplayValue).HasMaxLength(128);

        builder.HasOne(x => x.StockAttribute)
            .WithMany(x => x.Options)
            .HasForeignKey(x => x.StockAttributeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.TenantId, x.StockAttributeId, x.Code }).IsUnique();
    }
}

public class StockCardAttributeConfiguration : IEntityTypeConfiguration<StockCardAttribute>
{
    public void Configure(EntityTypeBuilder<StockCardAttribute> builder)
    {
        builder.HasOne(x => x.StockCard)
            .WithMany(x => x.Attributes)
            .HasForeignKey(x => x.StockCardId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.StockAttribute)
            .WithMany(x => x.StockCardAttributes)
            .HasForeignKey(x => x.StockAttributeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.TenantId, x.StockCardId, x.StockAttributeId }).IsUnique();
    }
}

public class StockVariantAttributeValueConfiguration : IEntityTypeConfiguration<StockVariantAttributeValue>
{
    public void Configure(EntityTypeBuilder<StockVariantAttributeValue> builder)
    {
        builder.HasOne(x => x.StockVariant)
            .WithMany(x => x.AttributeValues)
            .HasForeignKey(x => x.StockVariantId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.StockAttribute)
            .WithMany()
            .HasForeignKey(x => x.StockAttributeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.StockAttributeOption)
            .WithMany(x => x.VariantValues)
            .HasForeignKey(x => x.StockAttributeOptionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.TenantId, x.StockVariantId, x.StockAttributeId }).IsUnique();
    }
}

public class StockMovementConfiguration : IEntityTypeConfiguration<StockMovement>
{
    public void Configure(EntityTypeBuilder<StockMovement> builder)
    {
        builder.Property(x => x.Unit).HasMaxLength(50);
        builder.Property(x => x.ReferenceType).HasMaxLength(64);

        builder.HasOne(x => x.StockVariant)
            .WithMany(x => x.Movements)
            .HasForeignKey(x => x.StockVariantId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Location)
            .WithMany()
            .HasForeignKey(x => x.LocationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.TenantId, x.StockCardId, x.StockVariantId, x.CreatedAt });
        builder.HasIndex(x => new { x.TenantId, x.MovementType, x.CreatedAt });
    }
}

public class StockBalanceConfiguration : IEntityTypeConfiguration<StockBalance>
{
    public void Configure(EntityTypeBuilder<StockBalance> builder)
    {
        builder.HasOne(x => x.StockVariant)
            .WithMany(x => x.Balances)
            .HasForeignKey(x => x.StockVariantId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.TenantId, x.StockCardId, x.StockVariantId, x.LocationId });
    }
}
