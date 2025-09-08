using Microsoft.EntityFrameworkCore;
using WebApplication1.Data.Context;
using WebApplication1.Data.Models;
using WebApplication1.Data.Repositories;

public class BookingRepository : IBookingRepository
{
    private readonly ApplicationDbContext _context;
    public BookingRepository(ApplicationDbContext ctx) => _context = ctx;

    public async Task AddAsync(Booking booking)
    {
        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();
    }

    public async Task<Booking?> GetByIdAsync(Guid id)
    {
        return await _context.Bookings
            .Include(b => b.BookingServices!)
            .ThenInclude(bs => bs.AdditionalService)
            .Include(b => b.Car)
            .ThenInclude(c => c.CarModel)
            .ThenInclude(c => c.RentalPrices)
            .FirstOrDefaultAsync(b => b.Id == id && !b.IsDeleted);
    }

    public async Task<IEnumerable<Booking>> GetUserBookingsAsync(string userId)
    {
        return await _context.Bookings
            .Include(b => b.RentalLocation)
            .Include(b => b.Car)
            .ThenInclude(c => c.CarModel)
            .Where(b => b.UserId == userId && !b.IsDeleted)
            .ToListAsync();
    }

    public async Task SoftDeleteAsync(Booking booking)
    {
        booking.IsDeleted = true;
        await _context.SaveChangesAsync();
    }
  

}