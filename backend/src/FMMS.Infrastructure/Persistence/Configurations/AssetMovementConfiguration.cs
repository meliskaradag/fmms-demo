using FMMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FMMS.Infrastructure.Persistence.Configurations;

public class AssetMovementConfiguration : IEntityTypeConfiguration<AssetMovement>
{
    public void Configure(EntityTypeBuilder<AssetMovement> builder)
    {
        builder.Property(x => x.Reason).HasMaxLength(500);
        builder.Property(x => x.Notes).HasMaxLength(2000);

        builder.HasIndex(x => new { x.AssetId, x.MovedAt });
        builder.HasIndex(x => x.MovementType);
        builder.HasIndex(x => x.ToLocationId);
        builder.HasIndex(x => x.ToUserId);

        builder.HasOne(x => x.Asset)
            .WithMany(x => x.Movements)
            .HasForeignKey(x => x.AssetId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
