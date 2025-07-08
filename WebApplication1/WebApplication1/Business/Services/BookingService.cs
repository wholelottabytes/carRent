using WebApplication1.Business.Services;
using WebApplication1.Common.DTOs;
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
            throw new DomainValidationException("There is not available cars for this period");
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
    public async Task<IEnumerable<BookingViewDto>> GetUserBookingViewsAsync(string userId)
    {
        var bookings = await _bookingRepository.GetUserBookingsAsync(userId);

        return bookings.Select(b => new BookingViewDto
        {
            Id = b.Id,
            CarModel = $"{b.Car!.CarModel!.Make} {b.Car.CarModel.ModelName}",
            RentalLocation = $"{b.RentalLocation!.City}, {b.RentalLocation.Name}",
            StartDate = b.StartDate,
            EndDate = b.EndDate,
            TotalPrice = b.TotalPrice
        });
    }
    public async Task<IEnumerable<Booking>> GetUserBookingsAsync(string userId)
    {
        return await _bookingRepository.GetUserBookingsAsync(userId);
    }

    public async Task DeleteAsync(Guid id)
    {
        var booking = await _bookingRepository.GetByIdAsync(id)
                      ?? throw new EntityNotFoundException(nameof(Booking), id);

        if (booking.StartDate <= DateTimeOffset.UtcNow)
            throw new DomainValidationException("Нельзя отменить бронирование, которое уже началось или прошло.");

        await _bookingRepository.SoftDeleteAsync(booking);
    }

    private static decimal CalculatePrice(IEnumerable<RentalPrice> prices, double totalHours)
    {
        var orderedPriceTypes = GetFallbackPriceTypes(totalHours);

        foreach (var priceType in orderedPriceTypes)
        {
            var price = prices.FirstOrDefault(p => p.PriceType == priceType);
            if (price != null)
            {
                return (decimal)totalHours * price.Price;
            }
        }

        throw new DomainValidationException("Не найдена подходящая ставка аренды для заданной длительности.");
    }

    private static List<PriceType> GetFallbackPriceTypes(double totalHours)
    {
        if (totalHours >= RentalInterval.Weekly.HourEquivalent)
        {
            return new List<PriceType> { PriceType.Weekly, PriceType.TwoDays, PriceType.Daily, PriceType.Hourly };
        }

        if (totalHours >= RentalInterval.TwoDays.HourEquivalent)
        {
            return new List<PriceType> { PriceType.TwoDays, PriceType.Daily, PriceType.Hourly };
        }

        if (totalHours >= RentalInterval.Daily.HourEquivalent)
        {
            return new List<PriceType> { PriceType.Daily, PriceType.Hourly };
        }

        return new List<PriceType> { PriceType.Hourly };
    }

public async Task<List<(DateTimeOffset Start, DateTimeOffset End)>> GetBookedTimeIntervalsAsync(Guid carModelId, Guid locationId)
{
    var cars = await _carRepository.GetCarsByModelAndLocationAsync(carModelId, locationId);
    if (cars is null || cars.Count == 0) return new();

    var allCarsIntervals = new List<List<(DateTimeOffset Start, DateTimeOffset End)>>();

    foreach (var car in cars)
    {
        var intervals = car.Bookings
            .Where(b => !b.IsDeleted)
            .Select(b => (b.StartDate, b.EndDate))
            .OrderBy(( (DateTimeOffset Start, DateTimeOffset End) b ) => b.Start)
            .ToList();

        var merged = MergeIntervals(intervals);
        allCarsIntervals.Add(merged);
    }

    if (allCarsIntervals.Count == 0)
        return new();

    var intersection = allCarsIntervals[0];

    for (int i = 1; i < allCarsIntervals.Count; i++)
    {
        intersection = IntersectIntervals(intersection, allCarsIntervals[i]);
        if (intersection.Count == 0) 
            break;
    }

    return intersection;
}

private List<(DateTimeOffset Start, DateTimeOffset End)> MergeIntervals(List<(DateTimeOffset Start, DateTimeOffset End)> intervals)
{
    if (intervals.Count == 0) return intervals;

    var merged = new List<(DateTimeOffset Start, DateTimeOffset End)>();
    var current = intervals[0];

    for (int i = 1; i < intervals.Count; i++)
    {
        var next = intervals[i];
        if (next.Start <= current.End) 
        {
            current.End = next.End > current.End ? next.End : current.End;
        }
        else
        {
            merged.Add(current);
            current = next;
        }
    }
    merged.Add(current);
    return merged;
}

private List<(DateTimeOffset Start, DateTimeOffset End)> IntersectIntervals(
    List<(DateTimeOffset Start, DateTimeOffset End)> list1,
    List<(DateTimeOffset Start, DateTimeOffset End)> list2)
{
    var result = new List<(DateTimeOffset Start, DateTimeOffset End)>();
    int i = 0, j = 0;

    while (i < list1.Count && j < list2.Count)
    {
        var a = list1[i];
        var b = list2[j];

        var start = a.Start > b.Start ? a.Start : b.Start;
        var end = a.End < b.End ? a.End : b.End;

        if (start < end)
            result.Add((start, end));

        if (a.End < b.End)
            i++;
        else
            j++;
    }

    return result;
}

}
