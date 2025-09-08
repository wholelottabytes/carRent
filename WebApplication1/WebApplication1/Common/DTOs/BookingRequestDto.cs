namespace WebApplication1.Common.DTOs;

public class BookingDto
{
    public Guid Id { get; set; }
    public Guid CarId { get; set; }
    public Guid RentalLocationId { get; set; }
    public DateTimeOffset StartDate { get; set; }
    public DateTimeOffset EndDate { get; set; }
    public DateTimeOffset? PickupTime { get; set; }
    public DateTimeOffset? ReturnTime { get; set; }
    public decimal TotalPrice { get; set; }
}
public class BookingRequestDto
{
    public Guid CarModelId { get; set; } 
    public Guid RentalLocationId { get; set; }

    public DateTimeOffset StartDate { get; set; }
    public DateTimeOffset EndDate { get; set; }
    public DateTimeOffset? PickupTime { get; set; } 
    public DateTimeOffset? ReturnTime { get; set; }
    public List<Guid>? AdditionalServiceIds { get; set; }
}
public class BookingViewDto
{
    public Guid Id { get; set; }
    public string CarModel { get; set; } = string.Empty;
    public string RentalLocation { get; set; } = string.Empty;
    public DateTimeOffset StartDate { get; set; }
    public DateTimeOffset EndDate { get; set; }
    public decimal TotalPrice { get; set; }
}