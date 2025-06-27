using WebApplication1.Data.Models;
using WebApplication1.Data.Repositories;

namespace WebApplication1.Business.Services;

public class BookingService : IBookingService
{
    private readonly IBookingRepository _repo;
    private readonly ICarRepository _carRepo;

    public BookingService(IBookingRepository repo, ICarRepository carRepo)
    {
        _repo = repo;
        _carRepo = carRepo;
    }

    public async Task<Booking> CreateBookingAsync(Booking booking, IEnumerable<Guid> additionalServiceIds)
    {
        var car = await _carRepo.GetByIdAsync(booking.CarId);

        if (car.Bookings != null && car.Bookings.Any(b =>
                !b.IsDeleted &&
                booking.StartDate < b.EndDate &&
                booking.EndDate > b.StartDate))
        {
            throw new InvalidOperationException("Автомобиль уже забронирован на выбранный период.");
        }

        var duration = (booking.EndDate - booking.StartDate).TotalHours;
        var price = CalculatePrice(car, duration);

        var services = car.RentalLocation!.AdditionalServices!
            .Where(s => additionalServiceIds.Contains(s.Id))
            .ToList();

        booking.TotalPrice = price + services.Sum(s => s.Price);

        booking.BookingServices = services.Select(s => new BookingAdditionalService
        {
            AdditionalServiceId = s.Id
        }).ToList();

        await _repo.AddAsync(booking);
        return booking;
    }

    public async Task<IEnumerable<Booking>> GetUserBookingsAsync(string userId)
        => await _repo.GetUserBookingsAsync(userId);

    public async Task DeleteAsync(Guid id)
    {
        var booking = await _repo.GetByIdAsync(id) ?? throw new KeyNotFoundException();
        await _repo.SoftDeleteAsync(booking);
    }

    private decimal CalculatePrice(Car car, double totalHours)
    {
        var prices = car.RentalPrices ?? throw new Exception("No prices found");

        if (totalHours <= 24)
        {
            var hourly = prices.FirstOrDefault(p => p.PriceType == PriceType.Hourly)
                ?? throw new Exception("Hourly price not found");
            return (decimal)totalHours * hourly.Price;
        }
        else if (totalHours <= 48)
        {
            var daily = prices.FirstOrDefault(p => p.PriceType == PriceType.Daily)
                ?? throw new Exception("Daily price not found");
            return (decimal)(totalHours / 24.0) * daily.Price;
        }
        else if (totalHours <= 168)
        {
            var twoDays = prices.FirstOrDefault(p => p.PriceType == PriceType.TwoDays)
                ?? throw new Exception("2-Day price not found");
            return (decimal)(totalHours / 48.0) * twoDays.Price;
        }
        else
        {
            var weekly = prices.FirstOrDefault(p => p.PriceType == PriceType.Weekly)
                ?? throw new Exception("Weekly price not found");
            return (decimal)(totalHours / 168.0) * weekly.Price;
        }
    }
}