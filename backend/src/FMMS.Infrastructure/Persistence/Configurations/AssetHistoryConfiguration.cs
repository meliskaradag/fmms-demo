using FMMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FMMS.Infrastructure.Persistence.Configurations;

public class AssetHistoryConfiguration : IEntityTypeConfiguration<AssetHistory>
{
    public void Configure(EntityTypeBuilder<AssetHistory> builder)
    {
        builder.Property(x => x.ReferenceType).HasMaxLength(64);
        builder.Property(x => x.Note).HasMaxLength(2000);

        builder.HasIndex(x => new { x.AssetId, x.PerformedAt });
        builder.HasIndex(x => x.ActionType);

        builder.HasOne(x => x.Asset)
            .WithMany(x => x.Histories)
            .HasForeignKey(x => x.AssetId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
