using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication1.Data.Models
{
    public enum PriceType
    {
        Hourly,
        Daily,
        TwoDays,
        Weekly
    }
    public class RentalInterval
    {
        public PriceType PriceType { get; }
        public int HourEquivalent { get; }

        private RentalInterval(PriceType priceType, int hourEquivalent)
        {
            PriceType = priceType;
            HourEquivalent = hourEquivalent;
        }

        public static RentalInterval Hourly = new(PriceType.Hourly, 1);
        public static RentalInterval Daily = new(PriceType.Daily, 24);
        public static RentalInterval TwoDays = new(PriceType.TwoDays, 48);
        public static RentalInterval Weekly = new(PriceType.Weekly, 168);

        public static RentalInterval FromPriceType(PriceType priceType) => priceType switch
        {
            PriceType.Hourly => Hourly,
            PriceType.Daily => Daily,
            PriceType.TwoDays => TwoDays,
            PriceType.Weekly => Weekly,
            _ => throw new ArgumentException("Unknown PriceType", nameof(priceType))
        };
    }

    public class RentalPrice
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid CarModelId { get; set; }
        public CarModel? CarModel { get; set; }

        [Required]
        public PriceType PriceType { get; set; }

        [NotMapped]
        public RentalInterval Interval => RentalInterval.FromPriceType(PriceType);

        [Required]
        public decimal Price { get; set; }
    }

}