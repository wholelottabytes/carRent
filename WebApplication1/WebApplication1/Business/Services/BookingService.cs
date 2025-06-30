using WebApplication1.Business.Services;
using WebApplication1.Common.Exceptions;
using WebApplication1.Data.Models;
using WebApplication1.Data.Repositories;

public class BookingService : IBookingService
{
    private readonly IBookingRepository _bookingRepository;
    private readonly ICarRepository _carRepository;

    public BookingService(IBookingRepository repo, ICarRepository carRepo)
    {
        _bookingRepository = repo;
        _carRepository = carRepo;
    }

    public async Task<Booking> CreateBookingAsync(Booking booking, IEnumerable<Guid> additionalServiceIds)
    {
        var car = await _carRepository.GetByIdAsync(booking.CarId)
            ?? throw new EntityNotFoundException(nameof(Car), booking.CarId);

        if (car.Bookings != null && car.Bookings.Any(b =>
            !b.IsDeleted &&
            booking.StartDate < b.EndDate &&
            booking.EndDate > b.StartDate))
        {
            throw new ConflictException("Car is already booked for the selected period.");
        }

        var carModel = car.CarModel
            ?? throw new DomainValidationException("CarModel not loaded");

        var prices = carModel.RentalPrices;
        if (prices == null || !prices.Any())
            throw new DomainValidationException("No prices found for this car model");

        var durationHours = (booking.EndDate - booking.StartDate).TotalHours;
        var price = CalculatePrice(prices, durationHours);

        var rentalLocation = car.RentalLocation
            ?? throw new DomainValidationException("RentalLocation not loaded");

        var availableServices = rentalLocation.AdditionalServices
            ?? throw new DomainValidationException("No additional services found");

        var services = availableServices
            .Where(s => additionalServiceIds.Contains(s.Id))
            .ToList();

        booking.TotalPrice = price + services.Sum(s => s.Price);

        booking.BookingServices = services.Select(s => new BookingAdditionalService
        {
            AdditionalServiceId = s.Id
        }).ToList();

        await _bookingRepository.AddAsync(booking);
        return booking;
    }

    public async Task<IEnumerable<Booking>> GetUserBookingsAsync(string userId)
    {
        return await _bookingRepository.GetUserBookingsAsync(userId);
    }

    public async Task DeleteAsync(Guid id)
    {
        var booking = await _bookingRepository.GetByIdAsync(id)
            ?? throw new EntityNotFoundException(nameof(Booking), id);

        await _bookingRepository.SoftDeleteAsync(booking);
    }

    private decimal CalculatePrice(IEnumerable<RentalPrice> prices, double totalHours)
    {
        var interval = GetIntervalForDuration(totalHours);

        var price = prices.FirstOrDefault(p => p.PriceType == interval.PriceType)
                    ?? throw new DomainValidationException($"{interval.PriceType} price not found");

        return (decimal)totalHours * price.Price;
    }

    private RentalInterval GetIntervalForDuration(double hours)
    {
        if (hours < RentalInterval.Daily.HourEquivalent)
            return RentalInterval.Hourly;

        if (hours < RentalInterval.TwoDays.HourEquivalent)
            return RentalInterval.Daily;

        if (hours < RentalInterval.Weekly.HourEquivalent)
            return RentalInterval.TwoDays;

        return RentalInterval.Weekly;
    }
}
