using System.Text;
using FMMS.Domain.Entities;

namespace FMMS.Application.Features.Inventory.Services;

public static class StockVariantComposer
{
    public static string BuildVariantKey(IEnumerable<(Guid attributeId, Guid optionId)> values)
    {
        return string.Join("|", values
            .OrderBy(x => x.attributeId)
            .Select(x => $"{x.attributeId:N}:{x.optionId:N}"));
    }

    public static string BuildSummary(IEnumerable<string> parts)
    {
        var normalized = parts.Where(x => !string.IsNullOrWhiteSpace(x)).Select(x => x.Trim()).ToList();
        return string.Join(" / ", normalized);
    }

    public static string BuildDisplayName(StockCard card, string? summary)
    {
        if (string.IsNullOrWhiteSpace(summary))
            return card.Name;
        return $"{card.Name} - {summary}";
    }

    public static string BuildNextBarcode(string stockNumber, string code, int serial)
    {
        var seed = $"{stockNumber}-{code}-{serial:D6}";
        var bytes = Encoding.UTF8.GetBytes(seed);
        var sum = bytes.Aggregate(0, (acc, b) => acc + b) % 10_000_000;
        return $"FM{sum:D7}";
    }
}
