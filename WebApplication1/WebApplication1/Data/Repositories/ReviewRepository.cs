using Microsoft.EntityFrameworkCore;
using WebApplication1.Data.Context;
using WebApplication1.Data.Models;

namespace WebApplication1.Data.Repositories;

public class ReviewRepository : IReviewRepository
{
    private readonly ApplicationDbContext _context;

    public ReviewRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Review review)
    {
        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<Review>> GetByRentalLocationIdAsync(Guid rentalLocationId, int page, int pageSize)
    {
        return await _context.Reviews
            .Where(r => r.RentalLocationId == rentalLocationId)
            .OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(r => r.User)
            .ToListAsync();
    }

    public async Task<int> GetCountByRentalLocationIdAsync(Guid rentalLocationId)
    {
        return await _context.Reviews.CountAsync(r => r.RentalLocationId == rentalLocationId);
    }
}