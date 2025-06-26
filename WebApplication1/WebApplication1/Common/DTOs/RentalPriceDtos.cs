using System.ComponentModel.DataAnnotations;
using WebApplication1.Data.Models;

namespace WebApplication1.Common.DTOs
{
    public class RentalPriceDto
    {
        public Guid Id { get; set; }
        public PriceType PriceType { get; set; }
        public decimal Price { get; set; }
        public Guid CarId { get; set; }
    }
    public class CreateRentalPriceDto
    {
        [Required] public Guid CarId    { get; set; }
        [Required] public PriceType PriceType { get; set; }
        [Required] public decimal Price     { get; set; }
    }
    public class UpdateRentalPriceDto : CreateRentalPriceDto { }
}