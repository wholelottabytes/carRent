using System.ComponentModel.DataAnnotations;

namespace WebApplication1.Data.Models
{
    public class CarImage
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public string Url { get; set; } = null!;

        public Guid  CarId { get; set; }
    }
}