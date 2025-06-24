using System.ComponentModel.DataAnnotations;

namespace WebApplication1.Data.Models
{
    public class AdditionalService
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = null!;

        [Required]
        public decimal Price { get; set; }

        // Foreign key
        public int RentalLocationId { get; set; }
        public RentalLocation? RentalLocation { get; set; }

        public ICollection<BookingAdditionalService>? BookingServices { get; set; }
    }
}