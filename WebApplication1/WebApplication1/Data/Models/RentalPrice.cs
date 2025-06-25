using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication1.Data.Models
{
    public enum PriceType
    {
        Hourly,
        Daily,
        Weekly
    }

    public class RentalPrice
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid CarId { get; set; }
        public Car? Car { get; set; }

        [Required]
        public PriceType PriceType { get; set; }

        [Required]
        public decimal Price { get; set; }
    }
}