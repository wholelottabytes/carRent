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
}