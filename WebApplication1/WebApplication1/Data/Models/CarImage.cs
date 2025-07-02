using System.ComponentModel.DataAnnotations;

namespace WebApplication1.Data.Models
{
    public class CarImage
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public string Url { get; set; } = null!;

        [Required]
        public Guid CarModelId { get; set; }
        public CarModel? CarModel { get; set; }
    }
}