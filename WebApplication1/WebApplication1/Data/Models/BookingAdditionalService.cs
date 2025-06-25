namespace WebApplication1.Data.Models
{
    public class BookingAdditionalService
    {
        public Guid BookingId { get; set; }
        public Booking? Booking { get; set; }

        public Guid AdditionalServiceId { get; set; }
        public AdditionalService? AdditionalService { get; set; }
    }
}