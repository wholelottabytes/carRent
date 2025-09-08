using System.ComponentModel.DataAnnotations;

namespace WebApplication1.Common.DTOs
{
    public class CreateAdditionalServiceDto
    {
        [Required] public string Name    { get; set; } = null!;
        [Required] public decimal Price  { get; set; }
        [Required] public Guid RentalLocationId { get; set; }
    }
    public class UpdateAdditionalServiceDto : CreateAdditionalServiceDto { }
    
    public class AdditionalServiceDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public Guid RentalLocationId { get; set; }
    }
}