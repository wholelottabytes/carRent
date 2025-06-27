using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Data.Context;
using WebApplication1.Data.Models;

namespace WebApplication1.Data.Repositories
{

    public class CarImageRepository : ICarImageRepository
    {
        private readonly ApplicationDbContext _ctx;

        public CarImageRepository(ApplicationDbContext ctx) => _ctx = ctx;

        public async Task AddAsync(CarImage image)
        {
            _ctx.CarImages.Add(image);
            await _ctx.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var image = await _ctx.CarImages.FindAsync(id) 
                        ?? throw new KeyNotFoundException($"Image with id {id} not found");
            _ctx.CarImages.Remove(image);
            await _ctx.SaveChangesAsync();
        }

        public async Task<CarImage> GetByIdAsync(Guid id)
        {
            return await _ctx.CarImages.FindAsync(id) 
                   ?? throw new KeyNotFoundException($"Image with id {id} not found");
        }

        public async Task<IEnumerable<CarImage>> GetByCarIdAsync(Guid carId)
        {
            return await _ctx.CarImages
                .Where(i => i.CarId == carId)
                .ToListAsync();
        }
    }
}