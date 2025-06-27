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
        private readonly ApplicationDbContext _ctx;
        public CarRepository(ApplicationDbContext ctx) => _ctx = ctx;

        public async Task AddAsync(Car car)
        {
            _ctx.Cars.Add(car);
            await _ctx.SaveChangesAsync();
        }

        public async Task<Car> GetByIdAsync(Guid id) =>
            await _ctx.Cars
                .Include(c=>c.CarModel)
                .Include(c => c.Images)
                .Include(c => c.RentalPrices)
                .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted)
            ?? throw new KeyNotFoundException();

        public async Task<IEnumerable<Car>> ListAsync() =>
            await _ctx.Cars.Where(c => !c.IsDeleted).ToListAsync();

        public async Task UpdateAsync(Car car)
        {
            _ctx.Cars.Update(car);
            await _ctx.SaveChangesAsync();
        }

        public async Task SoftDeleteAsync(Car car)
        {
            car.IsDeleted = true;
            await UpdateAsync(car);
        }
    }
}