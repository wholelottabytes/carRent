using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace WebApplication1.Data.Models
{
    public class RentalLocation
    {
        public int Id { get; set; }

        [Required]
        public string Country { get; set; } = null!;

        [Required]
        public string City { get; set; } = null!;

        [Required]
        public string Name { get; set; } = null!;

        [Required]
        public string Address { get; set; } = null!;

        public ICollection<Car>? Cars { get; set; }
        public ICollection<AdditionalService>? AdditionalServices { get; set; }
        public ICollection<Review>? Reviews { get; set; }
    }
}