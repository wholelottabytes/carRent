using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Data.Context;
using WebApplication1.Data.Models;

namespace WebApplication1.Data.Repositories
{
    public class CarRepository : ICarRepository
    {
        private readonly ApplicationDbContext _context;
        public CarRepository(ApplicationDbContext ctx) => _context = ctx;

        public async Task AddAsync(Car car)
        {
            _context.Cars.Add(car);
            await _context.SaveChangesAsync();
        }

        public async Task<Car> GetByIdAsync(Guid id) =>
            await _context.Cars
                .Include(c=>c.CarModel)
                .ThenInclude(c => c.Images)
                .Include(c=>c.CarModel)
                .ThenInclude(c => c.RentalPrices)
                .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted)
            ?? throw new KeyNotFoundException();

        public async Task<IEnumerable<Car>> ListAsync() =>
            await _context.Cars.Where(c => !c.IsDeleted).ToListAsync();

        public async Task UpdateAsync(Car car)
        {
            _context.Cars.Update(car);
            await _context.SaveChangesAsync();
        }

        public async Task SoftDeleteAsync(Car car)
        {
            car.IsDeleted = true;
            await UpdateAsync(car);
        }
    }
}