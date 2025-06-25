using System.ComponentModel.DataAnnotations;

namespace WebApplication1.Data.Models
{
    public class AdditionalService
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        
        public bool IsDeleted { get; set; } = false;

        [Required]
        public string Name { get; set; } = null!;

        [Required]
        public decimal Price { get; set; }

        // Foreign key
        public Guid RentalLocationId { get; set; }
        public RentalLocation? RentalLocation { get; set; }

        public ICollection<BookingAdditionalService>? BookingServices { get; set; }
    }
}