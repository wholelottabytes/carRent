using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication1.Data.Models
{


    public class Car
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        public bool IsDeleted { get; set; } = false;

        public ICollection<RentalPrice>? RentalPrices { get; set; }

        public bool IsAvailable { get; set; } = true;

        [Required]
        public Guid CarModelId { get; set; }
        public CarModel? CarModel { get; set; }
        
        [Required]
        public Guid RentalLocationId { get; set; }
        public RentalLocation? RentalLocation { get; set; }

        public ICollection<CarImage>? Images { get; set; }
        public ICollection<Booking>? Bookings { get; set; }
    }
}