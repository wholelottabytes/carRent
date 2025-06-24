namespace WebApplication1.Data.Models
{
    public class BookingAdditionalService
    {
        public int BookingId { get; set; }
        public Booking? Booking { get; set; }

        public int AdditionalServiceId { get; set; }
        public AdditionalService? AdditionalService { get; set; }
    }
}