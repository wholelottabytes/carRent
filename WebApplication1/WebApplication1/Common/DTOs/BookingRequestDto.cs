namespace WebApplication1.Common.DTOs;

public class BookingRequestDto
{
    public Guid CarId { get; set; }
    public Guid RentalLocationId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    public DateTime? PickupTime { get; set; }
    public DateTime? ReturnTime { get; set; }

    public List<Guid>? AdditionalServiceIds { get; set; }
}