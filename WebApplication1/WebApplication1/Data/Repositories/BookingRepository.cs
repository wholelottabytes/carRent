using Microsoft.EntityFrameworkCore;
using WebApplication1.Data.Context;
using WebApplication1.Data.Models;

namespace WebApplication1.Data.Repositories;

public class BookingRepository : IBookingRepository
{
    private readonly ApplicationDbContext _ctx;
    public BookingRepository(ApplicationDbContext ctx) => _ctx = ctx;

    public async Task AddAsync(Booking booking)
    {
        _ctx.Bookings.Add(booking);
        await _ctx.SaveChangesAsync();
    }

    public async Task<Booking?> GetByIdAsync(Guid id)
    {
        return await _ctx.Bookings
            .Include(b => b.BookingServices!)
            .ThenInclude(bs => bs.AdditionalService)
            .Include(b => b.Car)
            .ThenInclude(c => c.RentalPrices)
            .FirstOrDefaultAsync(b => b.Id == id && !b.IsDeleted);
    }

    public async Task<IEnumerable<Booking>> GetUserBookingsAsync(string userId)
    {
        return await _ctx.Bookings
            .Include(b => b.RentalLocation)
            .Include(b => b.Car)
            .Where(b => b.UserId == userId && !b.IsDeleted)
            .ToListAsync();
    }

    public async Task SoftDeleteAsync(Booking booking)
    {
        booking.IsDeleted = true;
        await _ctx.SaveChangesAsync();
    }
}