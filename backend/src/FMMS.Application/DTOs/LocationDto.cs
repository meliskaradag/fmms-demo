using FMMS.Domain.Enums;

namespace FMMS.Application.DTOs;

public class LocationDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = default!;
    public LocationType Type { get; set; }
    public Guid? ParentId { get; set; }
    public List<LocationDto> Children { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}
