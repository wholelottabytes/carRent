using WebApplication1.Data.Models;

namespace WebApplication1.Business.Services;

public interface IBookingService
{
    Task<Booking> CreateBookingAsync(Booking booking, IEnumerable<Guid> additionalServiceIds);
    Task<IEnumerable<Booking>> GetUserBookingsAsync(string userId);
    Task DeleteAsync(Guid id);
}