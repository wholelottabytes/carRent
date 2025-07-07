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

   public async Task<Booking> CreateBookingAsync(
        Guid carModelId,
        Guid rentalLocationId,
        DateTimeOffset startDate,
        DateTimeOffset endDate,
        DateTimeOffset? pickupTime,
        DateTimeOffset? returnTime,
        string userId,
        IEnumerable<Guid> additionalServiceIds)
    {
        var car = await _carRepository.GetSingleAvailableCarAsync(carModelId, rentalLocationId, startDate, endDate);

        if (car is null)
        {
            throw new ConflictException("Нет доступных автомобилей для этой модели в выбранной локации на указанный период.");
        }

        var carModel = car.CarModel
            ?? throw new DomainValidationException("CarModel not loaded for the available car.");

        var prices = carModel.RentalPrices;
        if (prices is null || !prices.Any())
            throw new DomainValidationException("No prices found for this car model.");

        var durationHours = (endDate - startDate).TotalHours;
        var basePrice = CalculatePrice(prices, durationHours); 

        var rentalLocation = car.RentalLocation
            ?? throw new DomainValidationException("RentalLocation not loaded for the available car.");

        var availableServices = rentalLocation.AdditionalServices;
        if (availableServices is null) 
        {
            availableServices = new List<AdditionalService>(); 
        }

        var services = availableServices
            .Where(s => additionalServiceIds.Contains(s.Id))
            .ToList();

        var booking = new Booking
        {
            CarId = car.Id,
            RentalLocationId = rentalLocation.Id, 
            StartDate = startDate,
            EndDate = endDate,
            PickupTime = pickupTime,
            ReturnTime = returnTime,
            UserId = userId,
            TotalPrice = basePrice + services.Sum(s => s.Price) 
        };

        booking.BookingServices = services.Select(s => new BookingAdditionalService
        {
            AdditionalServiceId = s.Id,
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

    private static decimal CalculatePrice(IEnumerable<RentalPrice> prices, double totalHours)
    {
        var interval = GetIntervalForDuration(totalHours);

        var price = prices.FirstOrDefault(p => p.PriceType == interval.PriceType)
                    ?? throw new DomainValidationException($"{interval.PriceType} price not found");

        return (decimal)totalHours * price.Price;
    }

    private static RentalInterval GetIntervalForDuration(double hours)
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
