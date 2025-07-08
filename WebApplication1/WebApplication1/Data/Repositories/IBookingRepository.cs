using WebApplication1.Data.Models;

namespace WebApplication1.Data.Repositories;

public interface IBookingRepository
{
    Task AddAsync(Booking booking);
    Task<Booking?> GetByIdAsync(Guid id);
    Task<IEnumerable<Booking>> GetUserBookingsAsync(string userId);
    Task SoftDeleteAsync(Booking booking);


}