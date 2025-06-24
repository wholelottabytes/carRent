using System.ComponentModel.DataAnnotations;

namespace WebApplication1.Data.Models
{
    public class CarImage
    {
        public int Id { get; set; }

        [Required]
        public string Url { get; set; } = null!;

        // Foreign key
        public int CarId { get; set; }
        public Car? Car { get; set; }
    }
}