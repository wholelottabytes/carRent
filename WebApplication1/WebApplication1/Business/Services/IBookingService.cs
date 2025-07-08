using WebApplication1.Common.DTOs;
using WebApplication1.Data.Models;

namespace WebApplication1.Business.Services;

public interface IBookingService
{
    Task<Booking> CreateBookingAsync(
        Guid carModelId,
        Guid rentalLocationId,
        DateTimeOffset startDate,
        DateTimeOffset endDate,
        DateTimeOffset? pickupTime,
        DateTimeOffset? returnTime,
        string userId,
        IEnumerable<Guid> additionalServiceIds);
    
    Task<IEnumerable<Booking>> GetUserBookingsAsync(string userId);
    Task DeleteAsync(Guid id);

    Task<List<(DateTimeOffset Start, DateTimeOffset End)>>
        GetBookedTimeIntervalsAsync(Guid carModelId, Guid locationId);

    Task<IEnumerable<BookingViewDto>> GetUserBookingViewsAsync(string userId);

}